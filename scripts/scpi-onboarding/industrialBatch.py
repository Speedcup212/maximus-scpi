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
from bulletin_source_resolver import parse_html, document_link, norm, issue_hints
from bulletin_source_transport import ssl_context
import bulletin_fields
from corum_document_pipeline import mupdf, poppler
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


def block_verified_share_counts(raw):
    """Independent page-block cross-check for similarly captioned share numbers.

    Never transfer 'parts en attente' into 'parts retirees'. The leading number
    must belong to the *same native PDF text block* as the explicit caption.
    Multiple conflicting blocks are not accepted as definitive.
    """
    patterns={
        'retraits_executes_trimestre':r'^([0-9][0-9 \u00a0\u202f]*)\s+parts retirees\b',
        'parts_attente_retrait':r'^([0-9][0-9 \u00a0\u202f]*)\s+parts en attente\b',
    }
    candidates={k:[] for k in patterns}
    with fitz.open(stream=raw,filetype='pdf') as pdf:
        for page_index,page in enumerate(pdf):
            for block in page.get_text('blocks'):
                content=bulletin_fields.norm(block[4])
                for metric,regex in patterns.items():
                    match=re.search(regex,content)
                    if not match:continue
                    value=int(re.sub(r'\s','',match.group(1)))
                    candidates[metric].append({'value':value,'page':page_index+1,
                        'caption':match.group(0)})
    return {metric:rows for metric,rows in candidates.items() if rows}


def guard_share_caption_meaning(raw,metrics,proofs,coverage,alternatives):
    """Reject dual-reader agreement that contradicts an explicit PDF text block.

    This is a defensive semantic check, not certification or a new authoritative
    parser. Keep rejected observations in alternatives for independent review.
    """
    blocks=block_verified_share_counts(raw)
    for metric,observations in blocks.items():
        values={v['value'] for v in observations}
        if len(values)!=1:
            if metric in metrics:
                alternatives[metric]={'source_block_conflicts':observations,
                    'rejected_dual_reader_value':metrics.pop(metric)}
                proofs.pop(metric,None)
                coverage[metric]='needs_review'
            continue
        if metric in metrics and metrics[metric]!=next(iter(values)):
            alternatives[metric]={'explicit_source_block':observations,
                'rejected_dual_reader_value':metrics.pop(metric),
                'reason':'COUNT_FROM_ADJACENT_DIFFERENT_CAPTION'}
            proofs.pop(metric,None)
            coverage[metric]='needs_review'
    return metrics,proofs,coverage,alternatives


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
    if re.search(r'bulletin.*semestr|\bbs[_ -]|[12]s[_ -]?20\d{2}',text):return 'semiannual'
    for kind,pattern in [('dic',r'(?:^|[_\W])dic(?=$|[_\W])|informations?.?cles|key.information'),('statutes',r'statuts|statutes|st[-_]dy'),('note',r'note.*information|ni[-_]dyn'),('annual',r'rapport.*annuel|annual.*report|rapport.*202[0-9]'),('quarterly',r'bulletin|trimestr|\bbti?\b|[tq][1-4].*202[0-9]')]:
        if re.search(pattern,text):
            if kind=='annual' and re.search(r'(?:^|[^a-z])(?:isr|esg)(?:[^a-z]|$)',text):return None
            return kind
    return None


def select_documents(links):
    # Preserve the legal/annual source budget, but prefer issuer financial
    # periods explicitly pinned by a previously verified original PDF.
    # An old live-page link without a period must not outrank T3 and T2.
    # This is document SELECTION only; full PDF/period/SHA checks still follow.
    groups={kind:[] for kind in ['quarterly','semiannual','dic','note','statutes','annual']}
    for link in links:
        if link['kind'] in groups:groups[link['kind']].append(link)
    def period_rank(doc,kind):
        period=doc.get('reference_period','')
        if not isinstance(period,str):return (-1,-1)
        match=re.fullmatch(r'(20[0-9]{2})-'+('T([1-4])' if kind=='quarterly' else 'S([12])'),period)
        return (int(match.group(1)),int(match.group(2))) if match else (-1,-1)
    for kind in ('quarterly','semiannual'):
        groups[kind].sort(key=lambda d:period_rank(d,kind),reverse=True)
    first=[items[0] for items in groups.values() if items]
    # After one of each document class, make room for updated statutes AND
    # one earlier financial period. An obsolete first statute must not starve
    # the current second one when six classes fill the ten-document budget.
    second_priority=['statutes','quarterly','semiannual','dic','note','annual']
    second=[groups[kind][1] for kind in second_priority if len(groups[kind])>1]
    return (first+second)[:MAX_DOCUMENTS]


def detected_period(raw,kind,fallback):
    if kind not in ('quarterly','semiannual'):return fallback
    with fitz.open(stream=raw,filetype='pdf') as pdf:
        opening=pdf[0].get_text(sort=True)
    if kind=='semiannual':
        text=normalize(opening)
        for sem,interval in [('1',r'(?:1er|1)\s+janvier\s+au\s+30\s+juin'),('2',r'(?:1er|1)\s+juillet\s+au\s+31\s+decembre')]:
            m=re.search(r'analyse\s*:\s*'+interval+r'\s+(20\d{2})',text)
            if m:return m.group(1)+'-S'+sem
        raise ValueError('SEMIANNUAL_ANALYSIS_DATE_NOT_FOUND')
    hints=issue_hints(opening)
    if len(hints)==1:return next(iter(hints))
    # A filename/upload month is never an effective financial reference date.
    if not hints:raise ValueError('QUARTER_TITLE_PERIOD_NOT_DETECTED')
    raise ValueError('AMBIGUOUS_QUARTER_TITLE_PERIOD')


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
                    for match in re.finditer(r'(?<!\d)'+re.escape(token)+r'(?!\d)',text):
                        start=max(0,match.start()-220);end=min(len(text),match.end()+350)
                        excerpt=text[start:end]
                        date_contexts=[]
                        dates=r'\b(?:\d{1,2}[/.-]\d{1,2}[/.-]20\d{2}|\d{1,2}\s+(?:juin|decembre|décembre|septembre|mars)\s+20\d{2})\b'
                        for date in re.finditer(dates,text,re.I):
                            date_contexts.append(text[max(0,date.start()-100):min(len(text),date.end()+180)])
                        hits.append({'claim':claim['id'],'token':token,'page':p+1,'source_url':source,
                            'pdf_sha256':hashlib.sha256(raw).hexdigest(),'excerpt':excerpt,
                            'same_page_date_contexts':date_contexts,
                            'page_text_sha256':hashlib.sha256(text.encode()).hexdigest(),
                            'financially_certified':False})
    return hits


def validate_registry(registry,cohort):
    if registry.get('schema_version')!=1 or not isinstance(registry.get('candidates'),list) or not registry['candidates']:raise ValueError('INVALID_REGISTRY')
    candidates=registry['candidates'];slugs=[c['slug'] for c in candidates]
    if len(slugs)!=len(set(slugs)):raise ValueError('DUPLICATE_CANDIDATE')
    pilots=[c for c in candidates if c.get('role')=='additional_pilot']
    if registry.get('pilot_contract') is True and (len(pilots)!=3 or len({c['management_company'] for c in pilots})!=3):raise ValueError('THREE_DISTINCT_ISSUERS_REQUIRED')
    if any(c['slug'] in cohort['slugs'] for c in pilots):raise ValueError('PILOT_ALREADY_PUBLIC')
    for c in candidates:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',c['slug']):raise ValueError('INVALID_SLUG')
        if not c.get('name') or not c.get('issuer_hosts') or not allowed(c['product_page'],c['issuer_hosts']):raise ValueError('UNTRUSTED_PRODUCT_PAGE')
        if c.get('certification') or c.get('publication_authorized'):raise ValueError('PREMATURE_REGISTRY_CERTIFICATION')
    return True


def retain_official_links(registry,reports):
    """Keep verified discovery provenance, not an assertion of currentness.
    Every retained URL is downloaded and audited again on the next execution.
    """
    updated=json.loads(json.dumps(registry))
    by_slug={r['slug']:r for r in reports}
    for c in updated['candidates']:
        retained={d['url']:d for d in c.get('documents',[])}
        primary_host=urllib.parse.urlsplit(c['product_page']).hostname
        for d in by_slug.get(c['slug'],{}).get('documents',[]):
            if d.get('kind')=='annual' and re.search(r'(?:^|[^a-z])(?:isr|esg)(?:[^a-z]|$)',norm(d.get('url',''))):continue
            if (d.get('status')!='BINARY_IDENTITY_PERIOD_VERIFIED_ONLY' or
                not allowed(d.get('url'),c['issuer_hosts']) or
                urllib.parse.urlsplit(d.get('publisher_page','')).hostname!=primary_host or
                not re.fullmatch('[a-f0-9]{64}',d.get('publisher_page_sha256','')) or
                not re.fullmatch('[a-f0-9]{64}',d.get('sha256',''))):continue
            retained.setdefault(d['url'],{'kind':d['kind'],'reference_period':d['reference_period'],'url':d['url'],
                'discovery_basis':'PREVIOUS_VERIFIED_OFFICIAL_LINK_NOT_CURRENTNESS',
                'previous_publisher_page':d['publisher_page'],
                'previous_publisher_page_sha256':d['publisher_page_sha256'],
                'previous_pdf_sha256':d['sha256']})
        c['documents']=list(retained.values())
    return updated


def anomaly_ledger(report):
    """Deterministic diagnosis, never source QA or a release permission."""
    rows=[]
    for code in report.get('blockers',[]):
        documentary=code.startswith('MISSING_VERIFIED_')
        category='DOCUMENTARY' if documentary else 'TECHNICAL' if 'PREFLIGHT' in code else 'FINANCIAL'
        # Missing collection is not an official declaration of unavailability.
        contained=code in ('MISSING_VERIFIED_STATUTES','MISSING_VERIFIED_ANNUAL')
        prior=[item for item in report.get('previously_verified_source_binaries',[])
               if item['kind']==code.removeprefix('MISSING_VERIFIED_').lower()] if documentary else []
        rows.append({'id':report['slug']+':'+code,'code':code,'category':category,
            'prior_binary_evidence':prior,'prior_is_current_certification':False,
            'cause':'OFFICIAL_BINARY_NOT_VERIFIED' if documentary else 'REQUIRED_CONTROL_NOT_DEMONSTRATED',
            'availability':'NOT_OBTAINED_NOT_OFFICIALLY_UNAVAILABLE' if documentary else None,
            'full_certification_blocked':True,
            'factual_publication_effect':'ASSESS_EXISTING_PROGRESSIVE_POLICY_WITH_DISCLOSURE' if contained else 'BLOCK_UNTIL_VERIFIED',
            'automatic_correction_applied':False,'publication_authorized':False})
    for doc in report.get('documents',[]):
        if doc.get('error'):
            rows.append({'id':report['slug']+':'+hashlib.sha256(doc['url'].encode()).hexdigest()[:16],
                'code':'SOURCE_AUDIT_REJECTED','category':'DOCUMENTARY','cause':doc['error'],
                'source_url':doc['url'],'automatic_correction_applied':False,'publication_authorized':False})
        for metric,status in doc.get('financial_extraction',{}).get('technical_field_coverage',{}).items():
            if status!='needs_review':continue
            rows.append({'id':report['slug']+':'+doc.get('sha256','')+':'+metric,
                'code':'AMBIGUOUS_OR_UNREVIEWED_METRIC','category':'FINANCIAL',
                'cause':'DUAL_READER_AGREEMENT_OR_UNIQUE_VALUE_NOT_ESTABLISHED','metric':metric,
                'source_url':doc['url'],'pdf_sha256':doc.get('sha256'),
                'automatic_correction_applied':False,'publication_authorized':False})
    # Only a failed request followed by a successful real request counts as
    # an automatic recovery. Merely having retry logic earns no repaired count.
    failures={};recoveries=[]
    for attempt in report.get('attempts',[]):
        url=attempt['url'];status=attempt.get('status')
        if status==200 and url in failures:
            recoveries.append({'url':url,'cause':failures.pop(url),'correction':'BOUNDED_REDOWNLOAD',
                'category':'TECHNICAL','financial_values_changed':False})
        elif status in (429,500,502,503,504) or attempt.get('error'):
            failures[url]=status or attempt['error']
    return {'schema_version':1,'slug':report['slug'],'anomalies':rows,
        'unresolved_count':len(rows),'automatic_recoveries':recoveries,
        'automatic_recovery_count':len(recoveries),'publication_authorized':False}



def latest_verified_reporting_period(documents):
    """Use only issuer-binary-verified financial periods; never infer one from filenames."""
    pairs=[]
    for d in documents:
        if d.get('status')!='BINARY_IDENTITY_PERIOD_VERIFIED_ONLY' or d.get('kind') not in ('quarterly','semiannual'):
            continue
        period=d.get('reference_period')
        end=bulletin_fields.end_date(period)
        if end:pairs.append((end,period))
    if not pairs:return None
    recent=max(date for date,_ in pairs)
    kinds={period for date,period in pairs if date==recent}
    # Conflicting cadence labels on the same end date require an explicit review.
    return next(iter(kinds)) if len(kinds)==1 else None


def prior_binary_evidence(candidate, observations):
    """A read-only prior observation is a recovery lead, NEVER current source QA."""
    kinds={'quarterly_bulletin':'quarterly','annual_report':'annual','semiannual_bulletin':'semiannual',
           'quarterly':'quarterly','semiannual':'semiannual','annual':'annual',
           'dic':'dic','note':'note','statutes':'statutes'}
    matches=[]
    for entry in observations or []:
        if not isinstance(entry,dict) or entry.get('scpi_slug')!=candidate['slug']:continue
        if entry.get('origin_table') not in ('pdf_validation','regulatory_documents'):continue
        if entry.get('identity_verified') is not True or entry.get('kind_verified') is not True:continue
        kind=kinds.get(entry.get('document_kind'))
        url=entry.get('source_url');digest=entry.get('pdf_sha256')
        if not kind or not isinstance(url,str) or not allowed(url,candidate['issuer_hosts']):continue
        if not isinstance(digest,str) or not re.fullmatch(r'[a-f0-9]{64}',digest):continue
        period=entry.get('reference_period')
        if kind in ('quarterly','semiannual','annual'):
            if not isinstance(period,str) or not bulletin_fields.end_date(period) and kind!='annual':continue
            if kind=='annual' and not re.fullmatch(r'20\d{2}-RA',period):continue
        matches.append({'kind':kind,'reference_period':period,'source_url':url,'pdf_sha256':digest,
            'origin_table':entry['origin_table'],'verified_at':entry.get('verified_at'),
            'status':'PRIOR_READONLY_DB_BINARY_IDENTITY_ONLY_NOT_CURRENT_REVALIDATION',
            'financially_certified':False,'publication_authorized':False})
    return matches


def select_candidates(candidates,offset=0,limit=20):
    if type(offset) is not int or offset<0 or offset>=len(candidates):raise ValueError('INVALID_BATCH_OFFSET')
    if type(limit) is not int or not 1<=limit<=20:raise ValueError('BATCH_LIMIT_1_TO_20_REQUIRED')
    return candidates[offset:offset+limit]


def resume_offset(registry_bytes,checkpoint,total):
    if checkpoint.get('registry_sha256')!=hashlib.sha256(registry_bytes).hexdigest():
        raise ValueError('REGISTRY_CHANGED_RESTART_REQUIRED')
    offset=checkpoint.get('next_offset')
    if type(offset) is not int or not 0<=offset<=total:raise ValueError('INVALID_RESUME_CURSOR')
    return offset


def run_candidate(c,out,fetcher=None,observed_sources=None):
    out.mkdir(parents=True,exist_ok=True)
    transport=Transport(c['issuer_hosts']) if fetcher is None else fetcher
    result={'execution_contract':'SOURCE_PROPOSALS_ONLY_NOT_RELEASE_ADMISSION',
        'slug':c['slug'],'management_company':c['management_company'],'source_period_requested':c.get('source_period'),
        'stages':{stage:{'status':'NOT_RUN'} for stage in STAGES},'pages':[],'documents':[],
        'source_claim_occurrences':[],'blockers':[],
        'previously_verified_source_binaries':prior_binary_evidence(c,observed_sources),
        'publication_authorized':False,'complete_certification':False}
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
                if kind and (document_link(target,link['text']) or re.search(r'/documents?/|/download',urllib.parse.urlsplit(target).path)):
                    links[target]={'url':target,'kind':kind,'label':link['text'],'publisher_page':url,'publisher_page_sha256':page['sha256']}
                elif not document_link(target,link['text']) and len(queue)<MAX_PAGES and re.search('document|telecharg|download',norm(link['text'])) and urllib.parse.urlsplit(target).hostname==urllib.parse.urlsplit(url).hostname:
                    queue.append(target)
        except Exception as error:
            result['pages'].append({'url':url,'status':'UNVERIFIED','error':str(error)[:200]})
    # Explicit known sources still retain their original official index, not a silent mirror.
    for doc in c.get('documents',[]):
        if not allowed(doc['url'],c['issuer_hosts']):raise ValueError('UNREGISTERED_DECLARED_DOCUMENT')
        prior=links.get(doc['url'])
        if prior is None:
            links[doc['url']]={**doc,'publisher_page':c['product_page'],
                'discovery_basis':'DECLARED_OFFICIAL_SOURCE_REQUIRES_BINARY_CHECK'}
        else:
            if prior['kind']!=doc['kind']:raise ValueError('DECLARED_DOCUMENT_KIND_CONFLICT')
            # Keep the actual issuer HTML publisher reference, but associate
            # the previously SHA-verified financial period with the link.
            # audit_document still checks the binary and PDF identity itself.
            if doc.get('reference_period'):
                prior['reference_period']=doc['reference_period']
            if doc.get('previous_pdf_sha256'):
                prior['previous_pdf_sha256']=doc['previous_pdf_sha256']
    result['stages']['discovery']={'status':'SOURCE_LINKS_FOUND' if links else 'BLOCKED','links_found':len(links)}
    for link in select_documents(list(links.values())):
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
            period=link.get('reference_period') or detected_period(raw,link['kind'],
                c.get('source_period') if link['kind'] in ('quarterly','semiannual') else c.get('annual_period') if link['kind']=='annual' else c.get('regulatory_period'))
            if not period:raise ValueError('DOCUMENT_PERIOD_NOT_ESTABLISHED')
            verified=audit_document({'kind':link['kind'],'reference_period':period,'url':link['url']},
                {'name':c['name'],'issuer_hosts':c['issuer_hosts']},lambda _: (raw,final))
            record.update(verified);record['status']='BINARY_IDENTITY_PERIOD_VERIFIED_ONLY'
            if link['kind'] in ('quarterly','semiannual'):
                try:
                    metrics,proofs,coverage,alternatives=bulletin_fields.reconcile(
                        bulletin_fields.extract(*mupdf(raw),period),
                        bulletin_fields.extract(*poppler(out/(digest+'.pdf')),period))
                    metrics,proofs,coverage,alternatives=guard_share_caption_meaning(
                        raw,metrics,proofs,coverage,alternatives)
                    record['financial_extraction']={'independent_readers_pass':True,
                        'metrics':metrics,'evidence':proofs,'technical_field_coverage':coverage,
                        'candidates_requiring_review':alternatives,
                        'parser_sha256':hashlib.sha256(Path(bulletin_fields.__file__).read_bytes()).hexdigest(),
                        'financially_certified':False}
                except Exception as error:
                    record['financial_extraction']={'independent_readers_pass':False,'error':str(error)[:200],'financially_certified':False}
            # Combined legal PDFs must satisfy the existing verifier separately
            # for each document type; a link label alone cannot grant either.
            record['additional_regulatory_kinds']=[]
            label=norm(link.get('label','')+' '+link['url'])
            other='note' if link['kind']=='statutes' and re.search('note.*info',label) else 'statutes' if link['kind']=='note' and 'statut' in label else None
            if other:
                try:
                    audit_document({'kind':other,'reference_period':period,'url':link['url']},
                        {'name':c['name'],'issuer_hosts':c['issuer_hosts']},lambda _:(raw,final))
                    record['additional_regulatory_kinds'].append(other)
                except ValueError as error:record['additional_kind_error']=str(error)
            result['source_claim_occurrences']+=inspect_numeric_contexts(raw,final,c.get('claims',[]))
        except Exception as error:record['error']=str(error)[:240]
        result['documents'].append(record)
    good=[d for d in result['documents'] if d['status']=='BINARY_IDENTITY_PERIOD_VERIFIED_ONLY']
    newest=latest_verified_reporting_period(good)
    result['latest_verified_reporting_period']=newest
    if newest and c.get('source_period')!=newest:
        result['blockers'].append('SOURCE_PERIOD_MISMATCH_WITH_LATEST_VERIFIED_BULLETIN')
    result['stages']['download']={'status':'TECHNICAL_PASS_ONLY' if good else 'BLOCKED','documents_verified':len(good),
                                  'latest_verified_reporting_period':newest}
    parsed=[d for d in good if d.get('financial_extraction',{}).get('independent_readers_pass') is True]
    matched=sum(len(d['financial_extraction']['metrics']) for d in parsed)
    result['stages']['extraction']={'status':'DUAL_READER_PROPOSALS_ONLY' if parsed else 'NATIVE_TEXT_ONLY_FIELD_QA_REQUIRED','financial_documents_parsed':len(parsed)}
    result['stages']['normalization']={'status':'NORMALIZED_PROPOSALS_ONLY' if matched else 'BLOCKED_NO_NORMALIZED_FIELDS','matched_field_proposals':matched,'financially_certified':False}
    kinds={kind for d in good for kind in [d['kind']]+d.get('additional_regulatory_kinds',[])}
    for kind in ['quarterly','dic','note','statutes','annual']:
        if kind=='quarterly' and 'semiannual' in kinds:continue
        if kind not in kinds:result['blockers'].append('MISSING_VERIFIED_'+kind.upper())
    result['blockers']+=['FIELD_LEVEL_FINANCIAL_QA_REQUIRED','ALLOCATION_QA_REQUIRED','ACCOUNTABLE_RELEASE_REVIEW_REQUIRED','AUTHENTICATED_SIX_SURFACE_PREFLIGHT_REQUIRED']
    result['stages']['certification']={'status':'BLOCKED','reason':'SOURCE_VERIFICATION_IS_NOT_FINANCIAL_OR_REGULATORY_SIGNOFF'}
    result['stages']['tests']={'status':'TECHNICAL_SOURCE_CHECKS_ONLY','publication_claim_rejected':True}
    result['stages']['prepublication']={'status':'BLOCKED','reason':'NO_CERTIFIED_PRIVATE_SNAPSHOT'}
    result['stages']['publication_control']={'status':'DENIED','reason':'UNMET_GATES_NO_RELEASE_CALL'}
    result['status']='BLOCKED';result['attempts']=getattr(transport,'attempts',[])
    result['anomaly_ledger']=anomaly_ledger(result)
    (out/'report.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    return result


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--registry',required=True);ap.add_argument('--out',required=True)
    ap.add_argument('--offset',type=int,default=0);ap.add_argument('--limit',type=int,default=20)
    ap.add_argument('--observed-sources',help='Optional READ-ONLY Supabase binary observation export; not current QA')
    ap.add_argument('--resume',action='store_true');args=ap.parse_args()
    observed=json.loads(Path(args.observed_sources).read_text()) if args.observed_sources else {'schema_version':1,'documents':[]}
    if observed.get('schema_version')!=1 or not isinstance(observed.get('documents'),list):raise ValueError('INVALID_OBSERVED_BINARY_EVIDENCE')
    registry=json.loads(Path(args.registry).read_text());cohort=json.loads((HERE.parent.parent/'src/data/certified_scpi_cohort.json').read_text())
    validate_registry(registry,cohort)
    if args.resume:
        if args.offset:raise ValueError('CHOOSE_RESUME_OR_OFFSET')
        checkpoint=json.loads(Path(args.out,'batch.json').read_text())
        args.offset=resume_offset(Path(args.registry).read_bytes(),checkpoint,len(registry['candidates']))
        if args.offset==len(registry['candidates']):
            print('INDUSTRIAL_BATCH_ALREADY_PROCESSED_NO_NEW_SOURCE_OR_QA_VERIFICATION');return
    selected=select_candidates(registry['candidates'],args.offset,args.limit)
    results=[]
    for c in selected:
        results.append(run_candidate(c,Path(args.out)/c['slug'],observed_sources=observed['documents']))
        report={'schema_version':1,'captured_at':datetime.now(timezone.utc).isoformat(),
            'registry_sha256':hashlib.sha256(Path(args.registry).read_bytes()).hexdigest(),
            'offset':args.offset,'next_offset':args.offset+len(results),'total_registered':len(registry['candidates']),
            'selected_batch_complete':len(results)==len(selected),
            'mode':'READ_ONLY_INDUSTRIAL_TRIAL','candidates':results,'publication_authorized':False,'go_for_industrial_publication':False}
        checkpoint=Path(args.out,'batch.json.tmp');checkpoint.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
        checkpoint.replace(Path(args.out,'batch.json'))
    Path(args.out,f'batch-{args.offset:06d}.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    retained=retain_official_links(registry,results)
    Path(args.out,'retained-official-links.json').write_text(json.dumps(retained,indent=2,ensure_ascii=False)+'\n')
    for r in results:print('INDUSTRIAL_CANDIDATE '+json.dumps(r,ensure_ascii=False))
    print('INDUSTRIAL_BATCH '+json.dumps({'processed':len(results),'published':0,'certified':0,'decision':'NO_GO_PENDING_EVIDENCE'}))
    # Execution succeeds if it truthfully reports blocked candidates; not a certification gate.

if __name__=='__main__':main()
