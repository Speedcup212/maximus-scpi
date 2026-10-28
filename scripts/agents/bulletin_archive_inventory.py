#!/usr/bin/env python3
"""Read-only inventory of actual issuer archives, independent of guessed periods."""
from __future__ import annotations
import argparse,concurrent.futures,hashlib,json,pathlib,re,threading,time,urllib.parse
import fitz
import bulletin_complete_pipeline as replay
import bulletin_document_periods as periods
import bulletin_source_resolver as resolver
from corum_document_pipeline import poppler

def archive_link(link):
    label=resolver.norm(urllib.parse.unquote(link['url'])+' '+link.get('text',''))
    if re.search(r'extra.financier|rapport.isr|sfdr|durabilite|transparence|note.information|statuts|souscription|performance.passee',label):
        return False
    return bool(re.search(r'bulletin|trimestr|semestr|(?:^|[^a-z])bti?(?:[^a-z]|$)|fil.d.actualit|rapport.annuel|annual.report',label))

def wrapper_link(link,base):
    if urllib.parse.urlsplit(link['url']).hostname!=urllib.parse.urlsplit(base).hostname:return False
    label=resolver.norm(link.get('text','')+' '+link['url'])
    return bool(re.search(r'documentation|archives?|bulletin|rapport.annuel|[?&](?:page|paged)=\d+',label))

def verified_metadata(item,data,path):
    with fitz.open(stream=data,filetype='pdf') as doc:
        native=[page.get_text('text') for page in doc]
        ocr_cover=None
    independent=poppler(path)[0]
    left,right=periods.issue_periods(native),periods.issue_periods(independent)
    identity_item={**item,'period':next(iter(left)) if len(left)==1 else '2026-T1'}
    aliases=list(item.get('aliases',[]))
    if item['scpi_slug']=='corum-origin':
        aliases.extend({'scpi_slug':item['scpi_slug'],'alias':name,'active':True}
                       for name in ['CORUM Convictions','CorumAM Convictions'])
    identity=[replay.identity_matches(identity_item,engine,aliases) for engine in (native,independent)]
    method='two_native_cover_texts'
    # A logo can be an image while the rest of the fund name is native on page 3.
    # Require BOTH native readers to corroborate the cover OCR; a mention of
    # another fund elsewhere in the document cannot replace its cover identity.
    if not all(identity):
        corroboration=[replay.identity_matches(identity_item,[' '.join(engine)],aliases) for engine in (native,independent)]
        if all(corroboration):
            with fitz.open(stream=data,filetype='pdf') as doc:
                ocr_cover=replay.ocr_full_page(doc[0])
            if replay.identity_matches(identity_item,[ocr_cover],aliases):
                identity=[True,True];method='ocr_cover_with_two_native_text_corroborations'
    result={'sha256':hashlib.sha256(data).hexdigest(),'pages':len(native),
        'independent_engines':['MuPDF','Poppler'],'native_issue_candidates':sorted(left),
        'poppler_issue_candidates':sorted(right),'identity_checks':identity,
        'identity_method':method,'cover_ocr':ocr_cover,
        'cover_native':native[:3],'cover_poppler':independent[:3],
        'processing_complete':False,'financial_complete':False}
    if left==right and len(left)==1 and all(identity):
        result.update(status='verified_document_metadata',period=next(iter(left)),
                      identity_verified=True,period_verified=True)
    else:result.update(status='document_metadata_review',identity_verified=all(identity),period_verified=False)
    return result

class Inventory:
    def __init__(self,output):
        self.output=pathlib.Path(output);self.cache=self.output/'source-cache'
        self.pdfs=self.output/'pdf';self.pdfs.mkdir(parents=True,exist_ok=True)
        self.locks={};self.guard=threading.Lock()

    def fetch(self,url):
        replay.public_source(url)
        with self.guard:lock=self.locks.setdefault(url,threading.Lock())
        with lock:
            path,data=replay.fetch_source({'source_url':url},self.cache)
            meta=json.loads(path.with_suffix('.metadata.json').read_text())
            return data,meta['final_url']

    def run_fund(self,item):
        report={'scpi_slug':item['scpi_slug'],'scpi_name':item['scpi_name'],
                'official_page':item['official_scpi_page_url'],'status':'scanning',
                'pages':[],'documents':[],'errors':[],'financial_writes':0}
        queue=[(item['official_scpi_page_url'],None)]
        queue.extend((x['url'],x) for x in item.get('known_documents',[]))
        visited=set()
        output=self.output/(item['scpi_slug']+'.json')
        for requested,provenance in queue:
            if requested in visited:continue
            visited.add(requested)
            try:
                data,final=self.fetch(requested)
                if data.startswith(b'%PDF'):
                    sha=hashlib.sha256(data).hexdigest();path=self.pdfs/(sha+'.pdf')
                    if not path.exists():path.write_bytes(data)
                    result=verified_metadata(item,data,path)
                    result.update(source_url=requested,final_url=final,pdf_file='pdf/'+path.name,
                                  publisher=provenance)
                    report['documents'].append(result)
                else:
                    page=resolver.parse_html(data,final)
                    report['pages'].append({k:v for k,v in page.items() if k not in ('links','text')})
                    if page['access_blocked']:
                        report['errors'].append({'url':requested,'error':'publisher_access_challenge'})
                        continue
                    for link in page['links']:
                        if archive_link(link) or wrapper_link(link,final):
                            queue.append((link['url'],{'publisher_page':requested,
                                'publisher_page_sha256':page['sha256'],'link_text':link.get('text','')}))
            except Exception as error:
                report['errors'].append({'url':requested,'error':type(error).__name__+': '+str(error)[:500]})
            report['visited_count']=len(visited);report['pending_count']=sum(u not in visited for u,_ in queue)
            replay.save_json(output,report)
        report['status']='enumerated_with_exceptions' if report['errors'] else 'enumerated'
        report['visited_count']=len(visited);report['pending_count']=0
        replay.save_json(output,report)
        print(item['scpi_slug'],len(report['documents']),'PDFs;',len(report['errors']),'source exceptions',flush=True)
        return report

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--manifest',required=True);ap.add_argument('--out',required=True)
    args=ap.parse_args();manifest=json.loads(pathlib.Path(args.manifest).read_text())
    inventory=Inventory(args.out)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        reports=list(pool.map(inventory.run_fund,manifest['funds']))
    summary={'read_only':True,'financial_writes':0,'fund_count':len(reports),
        'funds':[{'scpi_slug':r['scpi_slug'],'status':r['status'],'pages':len(r['pages']),
                  'documents':len(r['documents']),'errors':len(r['errors'])} for r in reports]}
    replay.save_json(pathlib.Path(args.out)/'inventory-summary.json',summary)

if __name__=='__main__':main()
