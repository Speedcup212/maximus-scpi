#!/usr/bin/env python3
"""Full registered-bulletin replay. Every document and page is accounted for.

Extraction results are field-level proposals until independent, dated proofs
agree. A known SHA, a successful fetch or a core-only record is never complete.
Resource bounds are concurrency/checkpoints, never a document-count cutoff.
"""
from __future__ import annotations
import argparse, concurrent.futures, datetime, hashlib, html, json, os, pathlib, re
import subprocess, tempfile, time, unicodedata, urllib.error, urllib.parse, urllib.request, threading
import xml.etree.ElementTree as ET
import ipaddress
import fitz
from corum_document_pipeline import mupdf, poppler
import corum_bulletin_fields
import bulletin_fields
import bulletin_source_resolver as source_resolver
import bulletin_source_transport as source_transport

VERSION = 'all-bulletins-20261027-v3'
ROOT = pathlib.Path(__file__).resolve().parents[2]
PROJECT = 'https://ygvsddcpohsnaowofuwc.supabase.co'
UA = 'Mozilla/5.0 (compatible; MaximusSCPI-DocumentReplay/1.0; +https://maximusscpi.com/)'

def public_source(url):
    p=urllib.parse.urlsplit(url);host=(p.hostname or '').lower()
    if p.scheme!='https' or not host or p.username or p.password:raise ValueError('public_https_source_required')
    if re.search(r'(^|[.\-])(extranet|intranet|private|login|auth|localhost)([.\-]|$)',host) or host.endswith(('.local','.internal')):
        raise ValueError('private_source_requires_separate_authorization')
    try:
        if not ipaddress.ip_address(host).is_global:raise ValueError('private_address_rejected')
    except ValueError as err:
        if str(err)=='private_address_rejected':raise
    return url

class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        public_source(newurl)
        return super().redirect_request(req,fp,code,msg,headers,newurl)

PUBLIC_OPENER=urllib.request.build_opener(PublicRedirect(),
    urllib.request.HTTPSHandler(context=source_transport.ssl_context()))

def norm(s):
    return re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFKD', str(s).replace('œ','oe')) if not unicodedata.combining(c))).lower().replace('’', "'").strip()

def has_verified_financial_core(coverage):
    """An all-absent bulletin is never a financial certification."""
    return any(coverage.get(k)=='verified' for k in ('tof','prix_souscription','capitalisation','td'))

def source_key(item):
    return str(item['scpi_slug']) + ':' + str(item['period']) + ':' + str(item['id'])

def save_json(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile('w',dir=path.parent,delete=False,encoding='utf8') as f:
        json.dump(value,f,ensure_ascii=False,indent=2);temporary=pathlib.Path(f.name)
    temporary.replace(path)

def fetch_source(item, cache):
    """Use archived bytes first, then the registered official source. No auth secrets."""
    public_source(item['source_url'])
    cache.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(item['source_url'].encode()).hexdigest()
    path = cache / (key + '.source')
    if path.exists():
        return path, path.read_bytes()
    urls = []
    if item.get('archived_download_url'):
        urls.append(item['archived_download_url'])
    if item.get('pdf_path'):
        urls.append(PROJECT + '/storage/v1/object/public/scpi-bulletins/' + urllib.parse.quote(item['pdf_path'], safe='/'))
    urls.append(item['source_url'])
    errors = []
    for url in urls:
        try:
            public_source(url)
            tmp = path.with_suffix('.'+str(os.getpid())+'-'+str(threading.get_ident())+'.download')
            metadata=source_transport.fetch_to_path(url,tmp,PUBLIC_OPENER,public_source,UA)
            tmp.replace(path)
            save_json(path.with_suffix('.metadata.json'), {**metadata,
                'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
            return path, path.read_bytes()
        except (OSError, ValueError, urllib.error.HTTPError) as err:
            errors.append(type(err).__name__ + ': ' + str(err)[:200])
    raise RuntimeError('; '.join(errors))

def oidc_bridge(payload):
    audience='maximus-scpi-bulletin-replay-ygvsddcpohsnaowofuwc'
    url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL'];url+=('&' if '?' in url else '?')+urllib.parse.urlencode({'audience':audience})
    req=urllib.request.Request(url,headers={'Authorization':'Bearer '+os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
    # GitHub's OIDC minting endpoint can transiently return 429/5xx even
    # though the workflow identity is valid. Retry only this idempotent GET,
    # never an ambiguous side-effecting Supabase record/archive POST.
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req,timeout=25) as r:
                token=json.load(r)['value']
            if not token:raise ValueError('empty_github_oidc_token')
            break
        except urllib.error.HTTPError as err:
            if err.code not in (429,500,502,503,504) or attempt==4:raise
            time.sleep(min(1.5*(2**attempt),8))
    else:raise RuntimeError('github_oidc_token_unavailable')
    req=urllib.request.Request(PROJECT+'/functions/v1/scpi-bulletin-replay-oidc',data=json.dumps(payload,ensure_ascii=False).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    try:
        with urllib.request.urlopen(req,timeout=90) as r:return json.load(r)
    except urllib.error.HTTPError as err:
        raise RuntimeError('Protected replay bridge HTTP '+str(err.code)+': '+err.read(1000).decode('utf8','replace')) from None

def preflight(out):
    try:
        health=oidc_bridge({'op':'health','parser_version':VERSION})
        if health.get('effective_role')!='service_role' or health.get('permissions_ok') is not True:
            raise RuntimeError('Replay requires verified service_role table and RPC permissions')
        save_json(out/'preflight.json',health)
        print('Replay preflight:',health.get('enabled_scpi'),'SCPI;',health.get('eligible_now'),'eligible documents',flush=True)
        return health
    except Exception as error:
        save_json(out/'run-summary.json',{'status':'failed','stage':'preflight','error':str(error)[:1200],'documents':[]})
        raise

def resolve_source(item, downloaded, out):
    """A page resolves to a separate PDF queue entry, never to invented fields."""
    cache=out/'source-cache'
    def fetch(url):
        path,data=fetch_source({'source_url':url},cache)
        metadata=path.with_suffix('.metadata.json')
        final=json.loads(metadata.read_text()).get('final_url',url) if metadata.exists() else url
        public_source(final)
        return data,final
    def verify(data):
        with fitz.open(stream=data,filetype='pdf') as pdf:
            native=[page.get_text('text') for page in pdf]
        sha=hashlib.sha256(data).hexdigest();path=cache/(sha+'.verify.pdf')
        if not path.exists():path.write_bytes(data)
        try:independent=poppler(path)[0]
        except subprocess.CalledProcessError as error:raise ValueError('Independent PDF reader rejected source') from error
        aliases=item.get('aliases',[])
        return all(identity_matches(item,pages,aliases) and period_matches(item['period'],pages)
                   for pages in (native,independent))
    initial=None
    if downloaded.get('status')=='downloaded':
        initial={'url':item['source_url'],'data':pathlib.Path(downloaded['path']).read_bytes()}
    resolution=source_resolver.resolve(item,initial,fetch,verify)
    resolution['resolver_version']=source_resolver.VERSION
    resolution.update(document_key=item['document_key'],scpi_slug=item['scpi_slug'],period=item['period'])
    report_name=hashlib.sha256(item['document_key'].encode()).hexdigest()+'.json'
    save_json(out/'source-resolution'/report_name,resolution)
    result={k:v for k,v in downloaded.items() if k!='path'}
    result.update(parser_version=VERSION,source_resolution=resolution,metrics={},evidence={},
                  field_coverage={},processing_complete=False,financial_complete=False)
    if resolution['matched']:
        registration=oidc_bridge({'op':'register_link','document_key':item['document_key'],
            'lease_token':item['lease_token'],'link':{**resolution,'period':item['period'],
            'identity_verified':True,'period_verified':True,'independent_engines':['MuPDF','Poppler']}})
        if registration.get('ok') is not True:raise RuntimeError('Resolved issuer PDF was not registered: '+str(registration))
        result['status']='source_reference_resolved';result['resolved_document_key']=registration['document_key']
    elif downloaded.get('status')=='downloaded':result['status']='source_reference_review'
    elif 'private_source_requires_separate_authorization' in downloaded.get('error',''):result['status']='source_access_blocked'
    else:result['status']='fetch_error'
    return result

def archive_pdf(item, downloaded, result):
    if (result.get('identity_verified') is not True or result.get('period_verified') is not True
            or downloaded.get('kind')!='pdf' or not result.get('processing_complete')):return
    archived=oidc_bridge({'op':'archive_prepare','document_key':item['document_key'],
        'lease_token':item['lease_token'],'sha256':downloaded['sha256']})
    if not archived.get('already_archived'):
        request=urllib.request.Request(archived['signed_url'],data=pathlib.Path(downloaded['path']).read_bytes(),
            headers={'Content-Type':'application/pdf'},method='PUT')
        with urllib.request.urlopen(request,timeout=90) as response:
            if response.status not in (200,201):raise RuntimeError('Archive upload was not acknowledged')
    result['archive_path']=archived['path']

def run_queue(out):
    """Drain the durable queue until the runner deadline; resume on the next run."""
    out.mkdir(parents=True,exist_ok=True);deadline=time.monotonic()+44*60
    results=[];summary={'status':'starting','parser_version':VERSION,'resolver_version':source_resolver.VERSION,'documents':results}
    save_json(out/'run-summary.json',summary)
    try:
        summary['before']=preflight(out)
        summary['seed']=oidc_bridge({'op':'seed'})
        while time.monotonic()<deadline:
            response=oidc_bridge({'op':'claim','parser_version':VERSION});item=response.get('task')
            if not item:
                summary['stop_reason']='no_eligible_document';break
            item['id']=item['document_key'];item['period']=item['source_period']
            downloaded=download(item,out/'source-cache')
            if downloaded['status']!='downloaded' or downloaded.get('kind')!='pdf':
                result=resolve_source(item,downloaded,out)
            else:
                result=inspect(item,downloaded,out,item.get('aliases',[]))
                try:archive_pdf(item,downloaded,result)
                except Exception as error:result['archive_error']=str(error)[:300]
            if item.get('discovery'):result['discovery']=item['discovery']
            result['source_review_version']=source_resolver.VERSION
            # Runner filesystem paths and temporary signed URLs are never persisted.
            result.pop('path',None)
            recorded=oidc_bridge({'op':'record','doc':result,'lease_token':item['lease_token']})
            if recorded.get('ok') is not True:raise RuntimeError('Replay record not acknowledged')
            results.append({'id':item['id'],'scpi_slug':item['scpi_slug'],'period':item['period'],'status':result['status'],'page_count':result.get('page_count'),'metrics_count':result.get('metrics_count'),'record':recorded})
            save_json(out/'run-summary.json',summary)
            print(item['scpi_slug'],item['period'],result['status'],recorded.get('applied',0),flush=True)
        else:summary['stop_reason']='runner_checkpoint'
        summary['after']=oidc_bridge({'op':'health','parser_version':VERSION})
        summary['status']='completed'
        print('Durable queue checkpoint:',len(results),'documents;',summary['stop_reason'],flush=True)
    except Exception as error:
        summary.update(status='failed',error=type(error).__name__+': '+str(error)[:1200])
        raise
    finally:save_json(out/'run-summary.json',summary)

def download(item, cache):
    try:
        path, data = fetch_source(item, cache)
        sha = hashlib.sha256(data).hexdigest()
        kind = 'pdf' if data.startswith(b'%PDF') else 'html'
        return {'id':item['id'],'scpi_slug':item['scpi_slug'],'period':item['period'],
                'path':str(path),'sha256':sha,'kind':kind,'bytes':len(data),
                'status':'downloaded','hash_changed':bool(item.get('pdf_sha256') and item['pdf_sha256'] != sha)}
    except Exception as err:
        return {'id':item['id'],'scpi_slug':item['scpi_slug'],'period':item['period'],
                'status':'fetch_error','error':str(err)[:500]}

def identity_matches(item, pages, aliases):
    if item['scpi_slug'].startswith('corum-'):
        from corum_document_pipeline import validate_issue
        try:
            validate_issue(item['scpi_slug'],item['period'],pages,'quarterly_bulletin')
            return True
        except ValueError:pass
    head=norm(' '.join(pages[:2]))
    names=[item['scpi_name']]+[a['alias'] for a in aliases if a.get('scpi_slug',item['scpi_slug'])==item['scpi_slug'] and a.get('active',True)]
    for name in names:
        n=norm(name)
        if re.search(r'(?<![a-z0-9])'+re.escape(n)+r'(?![a-z0-9])',head):return True
    return False

def document_issue_from_filename(source_url):
    """Only a quarterly bulletin's basename is issue evidence, never upload folders."""
    if not source_url:return None
    basename=urllib.parse.unquote(urllib.parse.urlsplit(source_url).path.rsplit('/',1)[-1])
    title=norm(basename)
    if not re.search(r'bulletin|trimestr|(?:^|[-_.])bti?[-_.]|reporting',title):return None
    hints=source_resolver.issue_hints(title)
    if len(hints)==1:return next(iter(hints))
    # Issuer file identifiers such as Optimale-Bulletin-trimestriel-202206.pdf
    # use YYYYMM, where the month encodes the actual closing quarter.
    match=re.search(r'(?<!\d)(20\d{2})[-_.]?((?:0[1-9])|(?:1[0-2]))(?!\d)',title)
    if match:return match[1]+'-T'+str((int(match[2])-1)//3+1)
    return None

def period_matches(period,pages,source_url=None):
    if not re.fullmatch(r'20\d{2}-T[1-4]',period):return False
    # Never certify a historical comparator figure as the PDF's issue.
    filename_issue=document_issue_from_filename(source_url)
    if filename_issue and filename_issue!=period:return False
    first_page=norm(pages[0][:700]) if pages else ''
    # An issue explicitly named on the cover overrides older periods
    # reproduced in performance tables later on the same page.
    cover=re.search(r'\b(?:bulletin\s+(?:d.information\s+)?)?([1-4])\s*(?:er|e|eme)?\s*trimestre\s*(20\d{2})\b', first_page[:180])
    if cover:
        cover_issue=cover[2]+'-T'+cover[1]
        if cover_issue!=period:return False
    else:
        first_page_issues=source_resolver.issue_hints(first_page)
        if len(first_page_issues)==1 and period not in first_page_issues:return False
    year,q=period.split('-T');head=norm(' '.join(pages[:2]))
    patterns=[rf'\b{year}\s*[- /]?\s*[tq]\s*{q}\b',rf'\b[tq]\s*{q}\s*[- /]?\s*{year}\b',rf'\b{q}\s*t\s*{year}\b',rf'\b{q}\s*(?:er|e|eme)?\s*trimestre\s*{year}\b']
    ordinal=['premier','deuxieme','troisieme','quatrieme'][int(q)-1]
    patterns.append(rf'\b{ordinal}\s+trimestre\s+{year}\b')
    return any(re.search(p,head) for p in patterns)

def ocr_full_page(page):
    """OCR evidence is explicit; never labelled as two native PDF extractions."""
    pix=page.get_pixmap(matrix=fitz.Matrix(2.2,2.2),alpha=False)
    env=dict(os.environ);env['OMP_THREAD_LIMIT']='1'
    language='fra+eng' if pathlib.Path('/usr/share/tesseract-ocr/5/tessdata/fra.traineddata').exists() else 'eng'
    p=subprocess.run(['tesseract','stdin','stdout','-l',language,'--psm','3'],input=pix.tobytes('png'),stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True,timeout=120,env=env)
    return p.stdout.decode('utf8','replace')

def inspect(item, downloaded, out, aliases):
    result={**downloaded,'parser_version':VERSION,'metrics':{},'evidence':{},'field_coverage':{},'anomalies':[]}
    try:
        if downloaded['status']!='downloaded':return result
        path=pathlib.Path(downloaded['path']);data=path.read_bytes()
        if downloaded['kind']!='pdf':
            result['status']='html_pending_semantic_extraction'
            result['anomalies']=['HTML source requires DOM extraction; never call a documentation hub a bulletin']
            return result
        # No maximum-page cutoff: process all pages and persist all text.
        with fitz.open(stream=data,filetype='pdf') as doc:
            a=([p.get_text('text') for p in doc],[[tuple(w[:5]) for w in p.get_text('words')] for p in doc],[p.rect.width for p in doc])
            b=poppler(path)
            if len(a[0])!=len(b[0]):raise ValueError('PDF engine page-count mismatch')
            ocr=[];readable=0;cached_ocr={}
            pages_path=out/'pages'/(item['id']+'.json')
            if pages_path.exists():
                cached=json.loads(pages_path.read_text())
                if cached.get('sha256')==downloaded['sha256']:
                    cached_ocr={p['page']:p['ocr'] for p in cached.get('pages',[]) if p.get('ocr') is not None}
            for index,page in enumerate(doc):
                native=a[0][index]
                if len(re.sub(r'\s','',native))<120 and (page.get_images() or page.get_drawings()):
                    recovered=cached_ocr.get(index+1) if index+1 in cached_ocr else ocr_full_page(page)
                    ocr.append({'page':index+1,'text':recovered,'method':'Tesseract-OCR'})
                readable+=bool(native.strip() or (ocr and ocr[-1]['page']==index+1 and ocr[-1]['text'].strip()))
            result.update(page_count=len(doc),pages_read=len(doc),readable_pages=readable,ocr_page_count=len(ocr))
        texts=[p for p in a[0]]
        for p in ocr:
            if len(p['text'])>len(texts[p['page']-1]):texts[p['page']-1]=p['text']
        result['identity_verified']=identity_matches(item,texts,aliases)
        result['period_verified']=period_matches(item['period'],texts,item['source_url'])
        result['period_method']='document_issue_text'
        if not result['period_verified'] and not downloaded['hash_changed'] and item.get('qa_status') and re.search(r'verified|source_verified|certified_official',item['qa_status']) and not item['qa_status'].startswith('invalid'):
            result['period_verified']=True;result['period_method']='existing_same_hash_period_certificate'
        if not result['identity_verified']:result['anomalies'].append('document_identity_requires_review')
        if not result['period_verified']:result['anomalies'].append('document_period_requires_review')
        if downloaded['hash_changed']:result['anomalies'].append('registered_source_hash_changed')
        if (item.get('qa_status') or '').startswith('invalid'):result['anomalies'].append('previously_invalid_document_retained_for_audit')
        # Full text retained separately; result payload remains bounded per financial proof.
        pages=[{'page':i+1,'native_mupdf':a[0][i],'native_poppler':b[0][i],
                'ocr':next((p['text'] for p in ocr if p['page']==i+1),None)} for i in range(len(a[0]))]
        (out/'pages').mkdir(exist_ok=True)
        save_json(out/'pages'/(item['id']+'.json'),{'sha256':downloaded['sha256'],'pages':pages})
        result['metrics'],result['evidence'],result['field_coverage'],result['candidates']=bulletin_fields.reconcile(bulletin_fields.extract(*a,item['period']),bulletin_fields.extract(*b,item['period']))
        if item['scpi_slug'].startswith('corum-') and re.fullmatch(r'20\d{2}-T[1-4]',item['period']):
            from corum_document_pipeline import parse_core,reconcile
            cm,cp,_=reconcile(parse_core(*a,period=item['period']),parse_core(*b,period=item['period']))
            em,ep,ec=corum_bulletin_fields.reconcile_extended(corum_bulletin_fields.extract(*a,item['period']),corum_bulletin_fields.extract(*b,item['period']),cm)
            for k,v in cm.items():
                cmproof={**cp[k],'value':v,'reference_date':bulletin_fields.end_date(item['period']),'definition':'reported_metric'}
                result['metrics'][k]=v;result['evidence'][k]=cmproof;result['field_coverage'][k]='verified'
            for k,v in em.items():
                if k in result['metrics'] and result['metrics'][k]!=v:
                    result['field_coverage'][k]='parser_disagreement';result['metrics'].pop(k,None);result['evidence'].pop(k,None)
                else:result['metrics'][k]=v;result['evidence'][k]=ep[k];result['field_coverage'][k]='verified'
        result['status']='extracted_needs_review' if result['anomalies'] else 'extracted'
        result['metrics_count']=len(result['metrics'])
        structured_units={'%_mapping','SFDR_article','boolean','frequency','capital_type'}
        structured={k for k,(unit,_) in bulletin_fields.FIELDS.items() if unit in structured_units}
        result['unresolved_count']=sum(s not in ('verified','not_found_after_full_read') for s in result['field_coverage'].values())
        result['financial_unresolved_count']=sum(s not in ('verified','not_found_after_full_read') for k,s in result['field_coverage'].items() if k not in structured)
        result['structured_review_fields']=[k for k in structured if result['field_coverage'].get(k)=='needs_review']
        result['officially_absent_metrics']=[k for k,s in result['field_coverage'].items() if s=='not_found_after_full_read']
        # Full-reader absence is nonblocking for financial extraction; structured fields
        # remain explicitly unverified until a separate typed parser certifies them.
        # Never invent or red-date a previously certified official value.
        result['processing_complete']=result['pages_read']==result['page_count']
        result['financial_core_verified']=has_verified_financial_core(result['field_coverage'])
        result['financial_complete']=(result['processing_complete'] and result['financial_core_verified']
                                      and result['financial_unresolved_count']==0 and not result['anomalies'])
        return result
    except Exception as err:
        result['status']='extraction_error';result['error']=type(err).__name__+': '+str(err)[:400]
        return result

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest')
    ap.add_argument('--out', required=True)
    ap.add_argument('--download-only', action='store_true')
    ap.add_argument('--inspect-downloaded', action='store_true')
    ap.add_argument('--run', action='store_true')
    ap.add_argument('--preflight', action='store_true')
    ap.add_argument('--result-dir', default='documents')
    ap.add_argument('--workers', type=int, default=6)
    args = ap.parse_args()
    out = pathlib.Path(args.out); out.mkdir(parents=True, exist_ok=True)
    if args.preflight:return preflight(out)
    if args.run:return run_queue(out)
    if not args.manifest:ap.error('--manifest required for local replay')
    items = json.loads(pathlib.Path(args.manifest).read_text())
    if args.inspect_downloaded:
        aliases=json.loads((ROOT/'data-import/bulletin_identity_aliases_20261027.json').read_text())
        downloads={x['id']:x for x in json.loads((out/'downloads.json').read_text())}
        results_dir=out/args.result_dir;results_dir.mkdir(exist_ok=True)
        def current_result(item):
            path=results_dir/(item['id']+'.json')
            if not path.exists():return False
            r=json.loads(path.read_text())
            return r.get('parser_version')==VERSION and r.get('status') not in ('fetch_error','extraction_error')
        todo=[x for x in items if x['id'] in downloads and not current_result(x)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures={pool.submit(inspect,x,downloads[x['id']],out,aliases):x for x in todo}
            for future in concurrent.futures.as_completed(futures):
                r=future.result();save_json(results_dir/(r['id']+'.json'),r)
                print(r['scpi_slug'],r['period'],r['status'],len(r.get('metrics',{})),r.get('anomalies'),flush=True)
        return
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(download, item, out/'source-cache'):item for item in items}
        for future in concurrent.futures.as_completed(futures):
            result = future.result(); results.append(result)
            save_json(out/'downloads.json',results)
            print(result['scpi_slug'],result['period'],result['status'],result.get('kind',''),flush=True)
    print(json.dumps({'documents':len(results),'downloaded':sum(x['status']=='downloaded' for x in results),'failed':sum(x['status']!='downloaded' for x in results)}),flush=True)

if __name__ == '__main__':main()
