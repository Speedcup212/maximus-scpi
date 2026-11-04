#!/usr/bin/env python3
"""RECOVERY-092. Bounded read-only orchestration around existing issuer parsers.
URL discovery/extraction is never certification. Every unfinished stage is explicit.
"""
import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'agents'))
from bulletin_source_resolver import parse_html, document_link, norm
from bulletin_source_transport import ssl_context
from publisherPdfAudit import audit_document, normalize, MAX_BYTES
import fitz

MAX_PAGES=3
MAX_DOCUMENTS=10
MAX_ATTEMPTS=2
STAGES=['discovery','download','extraction','normalization','certification','tests','prepublication','publication_control']


def allowed(url, hosts):
    try:
        p=urllib.parse.urlsplit(url)
        return p.scheme=='https' and p.hostname in hosts and not p.username and not p.password and p.port in (None,443)
    except (ValueError,TypeError):return False


def decimal_value(raw):
    """French publisher notation only. Never infer percent/EUR/millions."""
    raw=str(raw).strip().replace('\u202f','').replace('\xa0','').replace(' ','')
    if not re.fullmatch(r'[+-]?\d+(?:,\d+)?',raw):raise ValueError('AMBIGUOUS_FINANCIAL_NUMBER')
    try:return str(Decimal(raw.replace(',','.')))
    except InvalidOperation:raise ValueError('INVALID_FINANCIAL_NUMBER')


class CheckedRedirect(urllib.request.HTTPRedirectHandler):
    def __init__(self,hosts):self.hosts=hosts
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        if not allowed(newurl,self.hosts):raise ValueError('UNREGISTERED_REDIRECT_HOST')
        return super().redirect_request(req,fp,code,msg,headers,newurl)


class Transport:
    def __init__(self,hosts):
        self.hosts=hosts;self.attempts=[]
        self.opener=urllib.request.build_opener(CheckedRedirect(hosts),urllib.request.HTTPSHandler(context=ssl_context()))
    def __call__(self,url):
        if not allowed(url,self.hosts):raise ValueError('UNREGISTERED_SOURCE_HOST')
        for attempt in range(1,MAX_ATTEMPTS+1):
            entry={'url':url,'attempt':attempt}
            self.attempts.append(entry)
            try:
                request=urllib.request.Request(url,headers={'User-Agent':'MaximusSCPI-documentary-audit/1.0'})
                with self.opener.open(request,timeout=18) as r:
                    if not allowed(r.url,self.hosts):raise ValueError('UNREGISTERED_FINAL_HOST')
                    raw=r.read(MAX_BYTES+1)
                    if len(raw)>MAX_BYTES:raise ValueError('SOURCE_TOO_LARGE')
                    entry['status']=r.status
                    return raw,r.url
            except urllib.error.HTTPError as error:
                entry['status']=error.code
                if error.code not in (429,500,502,503,504) or attempt==MAX_ATTEMPTS:raise
            except (TimeoutError,urllib.error.URLError) as error:
                entry['error']=type(error).__name__
                if attempt==MAX_ATTEMPTS:raise
            time.sleep(0.5)
        raise ValueError('RETRY_BUDGET_EXHAUSTED')


def document_kind(url,label):
    text=norm(label+' '+urllib.parse.unquote(url))
    for kind,pattern in [('dic',r'\bdic\b|informations?.?cles|key.information'),('statutes',r'statuts|statutes|st[-_]dy'),('note',r'note.*information|ni[-_]dyn'),('annual',r'rapport.*annuel|annual.*report|rapport.*202[0-9]'),('quarterly',r'bulletin|trimestr|\bbti?\b|[tq][1-4].*202[0-9]')]:
        if re.search(pattern,text):return kind
    return None


def inspect_numeric_contexts(raw,source,claims):
    """Retain all matching occurrences, including footnotes, with their exact page.
    An occurrence is not an assertion about period or a numeric auto-approval.
    """
    hits=[]
    with fitz.open(stream=raw,filetype='pdf') as pdf:
        for p,page in enumerate(pdf):
            text=page.get_text(sort=True)
            for claim in claims:
                for token in claim['tokens']:
                    for match in re.finditer(re.escape(token),text):
                        start=max(0,match.start()-220);end=min(len(text),match.end()+350)
                        excerpt=text[start:end]
                        hits.append({'claim':claim['id'],'token':token,'page':p+1,'source_url':source,
                            'pdf_sha256':hashlib.sha256(raw).hexdigest(),'excerpt':excerpt,
                            'page_text_sha256':hashlib.sha256(text.encode()).hexdigest(),
                            'financially_certified':False})
    return hits


def validate_registry(registry,cohort):
    if registry.get('schema_version')!=1 or not isinstance(registry.get('candidates'),list) or not registry['candidates']:raise ValueError('INVALID_REGISTRY')
    candidates=registry['candidates'];slugs=[c['slug'] for c in candidates]
    if len(slugs)!=len(set(slugs)):raise ValueError('DUPLICATE_CANDIDATE')
    pilots=[c for c in candidates if c.get('role')=='additional_pilot']
    if len(pilots)!=3 or len({c['management_company'] for c in pilots})!=3:raise ValueError('THREE_DISTINCT_ISSUERS_REQUIRED')
    if any(c['slug'] in cohort['slugs'] for c in pilots):raise ValueError('PILOT_ALREADY_PUBLIC')
    for c in candidates:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',c['slug']):raise ValueError('INVALID_SLUG')
        if not c.get('name') or not c.get('issuer_hosts') or not allowed(c['product_page'],c['issuer_hosts']):raise ValueError('UNTRUSTED_PRODUCT_PAGE')
        if c.get('certification') or c.get('publication_authorized'):raise ValueError('PREMATURE_REGISTRY_CERTIFICATION')
    return True


def run_candidate(c,out,fetcher=None):
    out.mkdir(parents=True,exist_ok=True)
    transport=Transport(c['issuer_hosts']) if fetcher is None else fetcher
    result={'slug':c['slug'],'management_company':c['management_company'],'source_period_requested':c.get('source_period'),
        'stages':{stage:{'status':'NOT_RUN'} for stage in STAGES},'pages':[],'documents':[],
        'source_claim_occurrences':[],'blockers':[],'publication_authorized':False,'complete_certification':False}
    queue=[c['product_page']]+c.get('documentation_pages',[])
    visited=set();links={};binaries={}
    for url in queue:
        if url in visited or len(visited)>=MAX_PAGES:continue
        visited.add(url)
        try:
            raw,final=transport(url)
            if len(raw)>3_000_000:raise ValueError('HTML_TOO_LARGE')
            if not allowed(final,c['issuer_hosts']):raise ValueError('UNREGISTERED_PRODUCT_REDIRECT')
            page=parse_html(raw,final)
            if page['access_blocked']:raise ValueError('ACCESS_CHALLENGE_NO_BYPASS')
            # Save the exact primary page proving how each CDN URL was discovered.
            (out/(page['sha256']+'.html')).write_bytes(raw)
            result['pages'].append({k:v for k,v in page.items() if k not in ('links','text')})
            for link in page['links']:
                target=link['url']
                if not allowed(target,c['issuer_hosts']):continue
                kind=document_kind(target,link['text'])
                if document_link(target,link['text']) and kind:
                    links[target]={'url':target,'kind':kind,'label':link['text'],'publisher_page':url,'publisher_page_sha256':page['sha256']}
                elif len(queue)<MAX_PAGES and re.search('document|telecharg|download',norm(link['text'])) and urllib.parse.urlsplit(target).hostname==urllib.parse.urlsplit(url).hostname:
                    queue.append(target)
        except Exception as error:
            result['pages'].append({'url':url,'status':'UNVERIFIED','error':str(error)[:200]})
    # Explicit known sources still retain their original official index, not a silent mirror.
    for doc in c.get('documents',[]):
        if not allowed(doc['url'],c['issuer_hosts']):raise ValueError('UNREGISTERED_DECLARED_DOCUMENT')
        links.setdefault(doc['url'],{**doc,'publisher_page':c['product_page'],'discovery_basis':'DECLARED_OFFICIAL_SOURCE_REQUIRES_BINARY_CHECK'})
    result['stages']['discovery']={'status':'SOURCE_LINKS_FOUND' if links else 'BLOCKED','links_found':len(links)}
    priority={'quarterly':0,'dic':1,'note':2,'statutes':3,'annual':4}
    for link in sorted(links.values(),key=lambda d:priority[d['kind']])[:MAX_DOCUMENTS]:
        record={**link,'status':'UNVERIFIED'}
        try:
            raw,final=transport(link['url'])
            if not allowed(final,c['issuer_hosts']) or not raw.startswith(b'%PDF') or len(raw)>MAX_BYTES:raise ValueError('UNTRUSTED_OR_INVALID_PDF')
            digest=hashlib.sha256(raw).hexdigest();(out/(digest+'.pdf')).write_bytes(raw)
            binaries[digest]=raw
            with fitz.open(stream=raw,filetype='pdf') as pdf:
                if pdf.needs_pass:raise ValueError('ENCRYPTED_PDF')
                pages=[{'page':i+1,'text':p.get_text(sort=True)} for i,p in enumerate(pdf)]
            (out/(digest+'.pages.json')).write_text(json.dumps(pages,ensure_ascii=False))
            period=link.get('reference_period') or (c.get('source_period') if link['kind']=='quarterly' else c.get('annual_period') if link['kind']=='annual' else c.get('regulatory_period'))
            if not period:raise ValueError('DOCUMENT_PERIOD_NOT_ESTABLISHED')
            verified=audit_document({'kind':link['kind'],'reference_period':period,'url':link['url']},
                {'name':c['name'],'issuer_hosts':c['issuer_hosts']},lambda _: (raw,final))
            record.update(verified);record['status']='BINARY_IDENTITY_PERIOD_VERIFIED_ONLY'
            result['source_claim_occurrences']+=inspect_numeric_contexts(raw,final,c.get('claims',[]))
        except Exception as error:record['error']=str(error)[:240]
        result['documents'].append(record)
    good=[d for d in result['documents'] if d['status']=='BINARY_IDENTITY_PERIOD_VERIFIED_ONLY']
    for stage in ['download','extraction']:
        result['stages'][stage]={'status':'TECHNICAL_PASS_ONLY' if good else 'BLOCKED','documents_verified':len(good)}
    result['stages']['normalization']={'status':'CANDIDATE_TEXT_ONLY_NO_FINANCIAL_PROMOTION','numeric_candidates':len(result['source_claim_occurrences'])}
    kinds={d['kind'] for d in good}
    for kind in ['quarterly','dic','note','statutes','annual']:
        if kind not in kinds:result['blockers'].append('MISSING_VERIFIED_'+kind.upper())
    result['blockers']+=['FIELD_LEVEL_FINANCIAL_QA_REQUIRED','ALLOCATION_QA_REQUIRED','ACCOUNTABLE_RELEASE_REVIEW_REQUIRED','AUTHENTICATED_SIX_SURFACE_PREFLIGHT_REQUIRED']
    result['stages']['certification']={'status':'BLOCKED','reason':'SOURCE_VERIFICATION_IS_NOT_FINANCIAL_OR_REGULATORY_SIGNOFF'}
    result['stages']['tests']={'status':'TECHNICAL_SOURCE_CHECKS_ONLY','publication_claim_rejected':True}
    result['stages']['prepublication']={'status':'BLOCKED','reason':'NO_CERTIFIED_PRIVATE_SNAPSHOT'}
    result['stages']['publication_control']={'status':'DENIED','reason':'UNMET_GATES_NO_RELEASE_CALL'}
    result['status']='BLOCKED';result['attempts']=getattr(transport,'attempts',[])
    (out/'report.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    return result


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--registry',required=True);ap.add_argument('--out',required=True);args=ap.parse_args()
    registry=json.loads(Path(args.registry).read_text());cohort=json.loads((HERE.parent.parent/'src/data/certified_scpi_cohort.json').read_text())
    validate_registry(registry,cohort)
    results=[run_candidate(c,Path(args.out)/c['slug']) for c in registry['candidates']]
    report={'schema_version':1,'captured_at':datetime.now(timezone.utc).isoformat(),'mode':'READ_ONLY_INDUSTRIAL_TRIAL','candidates':results,'publication_authorized':False,'go_for_industrial_publication':False}
    Path(args.out,'batch.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    for r in results:print('INDUSTRIAL_CANDIDATE '+json.dumps(r,ensure_ascii=False))
    print('INDUSTRIAL_BATCH '+json.dumps({'processed':len(results),'published':0,'certified':0,'decision':'NO_GO_PENDING_EVIDENCE'}))
    # Execution succeeds if it truthfully reports blocked candidates; not a certification gate.

if __name__=='__main__':main()
