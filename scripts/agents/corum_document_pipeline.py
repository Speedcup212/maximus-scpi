#!/usr/bin/env python3
"""Official CORUM archives. Two independent PDF engines; no readiness overrides.
Financial core is certified only if identity, issue period, TOF, total shares and
withdrawal queue agree between MuPDF and Poppler. Ambiguity stays in review.
Annual PDF verification never manufactures quarterly observations.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, html.parser, json, os, pathlib, re
import subprocess, tempfile, time, unicodedata, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
import urllib.error
import fitz

FUNDS={'corum-origin':('CORUM Origin','corum-origin'), 'corum-xl':('CORUM XL','corum-xl'),
       'corum-eurion':('CORUM Eurion','eurion'), 'corum-usa':('CORUM USA','corum-usa')}
VERSION='corum-dual-pdf-20261027-v1'
UA='Mozilla/5.0 (compatible; MaximusSCPI-OfficialArchive/1.0)'
MAX_BYTES=65*1024*1024

def norm(s):
 s=unicodedata.normalize('NFKD',str(s)).replace('œ','oe')
 return re.sub(r'\s+',' ',''.join(c for c in s if not unicodedata.combining(c))).lower().replace('’',"'").strip()
def compact(s): return re.sub(r'[^a-z0-9]','',norm(s))
def number(s):return float(re.sub(r'[\s\u202f\u00a0€%]','',s).replace(',','.'))
def secure_url(url):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or p.hostname not in ('www.corum.fr','corum.fr') or p.username or p.password or p.port not in (None,443):raise ValueError('unapproved_official_host')
 return url

def fetch(url):
 secure_url(url)
 req=urllib.request.Request(url,headers={'User-Agent':UA})
 for attempt in range(3):
  try:
   with urllib.request.urlopen(req,timeout=40) as r:
    secure_url(r.url);b=r.read(MAX_BYTES+1)
    if len(b)>MAX_BYTES:raise ValueError('document_too_large')
    return b
  except (TimeoutError, OSError):
   if attempt==2:raise
   time.sleep(attempt+1)

class Links(html.parser.HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='a' and '.pdf' in d.get('href','').lower():
   u=urllib.parse.urljoin('https://www.corum.fr',d['href'])
   try:secure_url(u);self.urls.append(u)
   except ValueError:pass

def classify(url):
 name=norm(urllib.parse.unquote(url).rsplit('/',1)[-1])
 for pattern,reverse in [(r'(20\d{2})[- _]*t([1-4])',False),(r'\bt([1-4])[- _]*(20\d{2})',True),(r'\b([1-4])t[- _]*(20\d{2}|1[2-9])',True)]:
  m=re.search(pattern,name)
  if m:
   a,b=m.groups();y,q=(int(b),int(a)) if reverse else (int(a),int(b));y=y+2000 if y<100 else y
   return f'{y}-T{q}','quarterly_bulletin'
 if 'rapport' in name and 'annuel' in name:
  years=re.findall(r'20\d{2}',name)
  if years:return years[-1]+'-RA','annual_report'
 return None,None

def discover(slug):
 name,path=FUNDS[slug];url=f'https://www.corum.fr/nos-scpi/{path}/documents'
 p=Links();p.feed(fetch(url).decode('utf8'))
 return [dict(slug=slug,index_url=url,url=u,period=period,kind=kind) for u in sorted(set(p.urls)) for period,kind in [classify(u)] if period]

def validate_issue(slug,period,pages,kind):
 head=norm(' '.join(pages[:8]))
 aliases=[FUNDS[slug][0]]
 if slug=='corum-origin':
  aliases+=['CORUM Convictions','CorumAM Convictions']
  if int(period[:4])<=2018 and 'corum xl' not in norm(pages[0]):aliases+=['SCPI CORUM','parts de CORUM','CORUM est un investissement']
 if slug=='corum-eurion':aliases+=['SCPI EURION',"d'EURION",'Pour EURION']
 if not any(compact(a) in compact(head) for a in aliases):raise ValueError('document_identity_mismatch')
 if kind=='annual_report':
  if not (re.search(r'rapport\s+annuel',head) or 'comptes annuels' in head or "l'essentiel" in head) or period[:4] not in head:raise ValueError('annual_issue_mismatch')
  return
 year,q=period.split('-T');q=int(q)
 # Cover issue, not future validity dates or a historical performance chart.
 cover=norm(pages[0])[:1500]
 patterns=[rf'\b{q}\s*(?:er|e|eme)?\s*trimestre\s*{year}',rf'\b{q}\s*t\s*{year}',rf'\b{year}\s*[-/]?\s*t\s*{q}\b']
 if not any(re.search(p,cover) for p in patterns):raise ValueError('quarter_issue_mismatch')

# A word is (x0,y0,x1,y1,text). Both engines feed the same geometry checks.
def phrases(words,phrase):
 target=[compact(x) for x in phrase.split()];out=[]
 for i in range(len(words)-len(target)+1):
  seq=words[i:i+len(target)]
  if [compact(w[4]) for w in seq]==target:
   out.append((min(w[0] for w in seq),min(w[1] for w in seq),max(w[2] for w in seq),max(w[3] for w in seq)))
 return out

def text_box(words,rect):
 x0,y0,x1,y1=rect
 found=[w for w in words if x0<=(w[0]+w[2])/2<=x1 and y0<=(w[1]+w[3])/2<=y1]
 found.sort(key=lambda w:(round(w[1]/3),w[0]))
 return ' '.join(w[4] for w in found)

def percent_box(words,rect):
 t=text_box(words,rect)
 vals={number(m.group(1)) for m in re.finditer(r'(?<![\d.,])(\d{1,3}(?:[,.]\d{1,2})?)\s*%',t)}
 return vals,t

def parse_core(pages,wordpages,widths):
 hits={}
 for i,words in enumerate(wordpages):
  for rect in phrases(words,'FINANCIER (TOF)'):
   x0,y0,x1,y1=rect
   vals,txt=percent_box(words,(x0-12,y0-2,x1+12,y1+145))
   # Drop franchise/vacancy subcomponents by range; never choose max among
   # two occupancy measures. The box excludes the neighbouring TOP column.
   vals={v for v in vals if 50<=v<=100}
   if len(vals)==1:hits.setdefault('tof',[]).append((vals.pop(),i+1,txt))
  # Explicit statement in Evolution du capital; no zero inferred from silence.
  page_norm=norm(pages[i])
  if 'nombre de parts' in page_norm and ('volution du capital' in page_norm or 'capitalisation' in page_norm):
   for rect in phrases(words,'attente'):
    x0,y0,x1,y1=rect
    if x0<widths[i]*.74:continue
    txt=text_box(words,(x0-10,y0-45,x1+10,y1+18))
    if 'retrait' not in norm(txt):continue
    vals=re.findall(r'(?<![\d.,])\b\d+\b(?![\d.,%])',txt)
    if len(vals)==1:hits.setdefault('parts_attente_retrait',[]).append((int(vals[0]),i+1,txt))
   for rect in phrases(words,'Nombre de parts'):
    x0,y0,x1,y1=rect
    txt=text_box(words,(x0-35,y0-40,x1+95,y1+8))
    vals=re.findall(r'(?<![\d.,])(\d{1,3}(?:\s\d{3})+)(?![\d.,])',txt)
    if len(vals)==1:hits.setdefault('nombre_parts',[]).append((int(number(vals[0])),i+1,txt))
 result={}
 for metric,values in hits.items():
  if len({v[0] for v in values})==1:
   value,page,txt=values[0];result[metric]={'value':value,'page':page,'text':txt[:700]}
 return result

def mupdf(pdf):
 if not pdf.startswith(b'%PDF'):raise ValueError('not_pdf')
 with fitz.open(stream=pdf,filetype='pdf') as d:
  if not 1<=len(d)<=240:raise ValueError('page_count_limit')
  return ([p.get_text('text',sort=True) for p in d],[[tuple(w[:5]) for w in p.get_text('words')] for p in d],[p.rect.width for p in d])

def poppler(path):
 r=subprocess.run(['pdftotext','-bbox',str(path),'-'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True,timeout=60)
 xml=re.sub(rb'[\x00-\x08\x0b\x0c\x0e-\x1f]',b'',r.stdout)
 root=ET.fromstring(xml);ns={'h':'http://www.w3.org/1999/xhtml'}
 pages=[];wordpages=[];widths=[]
 for p in root.findall('.//h:page',ns):
  words=[(float(w.attrib['xMin']),float(w.attrib['yMin']),float(w.attrib['xMax']),float(w.attrib['yMax']),w.text or '') for w in p.findall('h:word',ns)]
  wordpages.append(words);pages.append(' '.join(w[4] for w in words));widths.append(float(p.attrib['width']))
 return pages,wordpages,widths

def reconcile(a,b):
 core={};evidence={};anomalies=[]
 for key in sorted(set(a)|set(b)):
  if key not in a or key not in b:anomalies.append(key+':single_engine');continue
  x,y=a[key],b[key]
  if x['value']!=y['value'] or x['page']!=y['page']:anomalies.append(key+':contradictory_engines');continue
  core[key]=x['value'];evidence[key]={'page':x['page'],'text':x['text'],'poppler_text':y['text'],'unit':'%' if key=='tof' else 'parts','method':'pdf_page_text_match','value_match':True,'distance':145 if key=='tof' else 45,'independent_engines':['MuPDF','Poppler']}
 if core.get('parts_attente_retrait',0)>core.get('nombre_parts',float('inf')):raise ValueError('withdrawal_queue_exceeds_total_shares')
 return core,evidence,anomalies

def inspect(item,cache):
 result={**item,'parser_version':VERSION,'metrics':{},'evidence':{},'anomalies':[]}
 path=cache/(hashlib.sha256(item['url'].encode()).hexdigest()+'.pdf')
 try:
  if path.exists():pdf=path.read_bytes()
  else:
   pdf=fetch(item['url'])
   if not pdf.startswith(b'%PDF'):raise ValueError('not_pdf')
   path.write_bytes(pdf)
  if not pdf.startswith(b'%PDF'):raise ValueError('not_pdf')
  result['sha256']=hashlib.sha256(pdf).hexdigest();result['bytes']=len(pdf)
  a=mupdf(pdf);b=poppler(path);result['page_count']=len(a[0]);result['native_chars']=sum(map(len,a[0]))
  try:
   validate_issue(item['slug'],item['period'],a[0],item['kind']);validate_issue(item['slug'],item['period'],b[0],item['kind'])
  except ValueError:
   # Recover a logo/image cover or duplicated embedded text without using URL
   # filenames as evidence of identity or reporting period. Numeric core stays
   # independently extracted by the two native engines below.
   import scpi_ocr_worker as ocr
   langs=subprocess.run(['tesseract','--list-langs'],capture_output=True,text=True,check=True).stdout
   ocr.LANGUAGES='fra+eng' if 'fra' in langs.split() else 'eng'
   with fitz.open(stream=pdf,filetype='pdf') as d:cover=ocr.ocr_page(d[0])
   a[0][0]=cover;b[0][0]=cover;result['cover_method']='tesseract_ocr_identity_only'
   validate_issue(item['slug'],item['period'],a[0],item['kind']);validate_issue(item['slug'],item['period'],b[0],item['kind'])
  result['identity_verified']=True;result['period_verified']=True
  result['identity_excerpt']=norm(' '.join(a[0][:8]))[:1600]
  result['issue_excerpt']=norm(a[0][0])[:1500]
  if item['kind']=='annual_report':result['status']='source_verified';return result
  result['metrics'],result['evidence'],result['anomalies']=reconcile(parse_core(*a),parse_core(*b))
  complete=all(k in result['metrics'] for k in ['tof','nombre_parts','parts_attente_retrait'])
  result['anomalies'] += ['missing_core:'+k for k in ['tof','nombre_parts','parts_attente_retrait'] if k not in result['metrics']]
  result['status']='certified_core' if complete else ('ocr_pending' if sum(len(compact(p)) for p in a[0])/len(a[0])<120 else 'partial_review')
  if result['status']=='ocr_pending':
   import scpi_ocr_worker as ocr
   langs=subprocess.run(['tesseract','--list-langs'],capture_output=True,text=True,check=True).stdout
   ocr.LANGUAGES='fra+eng' if 'fra' in langs.split() else 'eng'
   result['ocr_pages']=ocr.extract_pages(pdf)
   result['anomalies'].append('ocr_text_extracted_independent_numeric_qa_pending')
 except Exception as e:result['status']='rejected' if isinstance(e,ValueError) else 'retry';result['anomalies']=[str(e)[:300]]
 return result

PROJECT_URL='https://ygvsddcpohsnaowofuwc.supabase.co'
OIDC_CACHE=(0,'')
def oidc_bridge(payload):
 global OIDC_CACHE
 if time.time()-OIDC_CACHE[0]>120:
  url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL'];url+=('&' if '?' in url else '?')+urllib.parse.urlencode({'audience':'maximus-corum-documents-ygvsddcpohsnaowofuwc'})
  req=urllib.request.Request(url,headers={'Authorization':'Bearer '+os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
  with urllib.request.urlopen(req,timeout=25) as r:token=json.load(r)['value']
  OIDC_CACHE=(time.time(),token)
 req=urllib.request.Request(PROJECT_URL+'/functions/v1/scpi-corum-document-oidc',data=json.dumps(payload,ensure_ascii=False).encode(),headers={'Authorization':'Bearer '+OIDC_CACHE[1],'Content-Type':'application/json'},method='POST')
 try:
  with urllib.request.urlopen(req,timeout=45) as r:return json.load(r)
 except urllib.error.HTTPError as e:
  # Response is a bounded error from the protected bridge; never log tokens.
  raise RuntimeError('CORUM bridge HTTP '+str(e.code)+': '+e.read(1500).decode('utf8','replace')) from None

def enabled_funds():return oidc_bridge({'op':'registry'})['registry']
def rpc(body):return oidc_bridge({'op':'record','doc':body})

def main():
 arg=argparse.ArgumentParser();arg.add_argument('--out',required=True);arg.add_argument('--apply',action='store_true');arg.add_argument('--manifest');args=arg.parse_args()
 out=pathlib.Path(args.out);out.mkdir(parents=True,exist_ok=True);cache=out/'pdf-cache';cache.mkdir(exist_ok=True)
 if args.manifest:items=json.loads(pathlib.Path(args.manifest).read_text())
 else:
  items=[]
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   for part in pool.map(discover,FUNDS):items+=part
 if args.apply:
  registry=enabled_funds();enabled={x['scpi_slug'] for x in registry};items=[x for x in items if x['slug'] in enabled]
  known={(x['slug'],x['url']) for x in items}
  for row in registry:
   for url in [row.get('bulletin_url'),row.get('annual_report_url')]:
    if url and (row['scpi_slug'],url) not in known:
     period,kind=classify(url)
     if period:items.append(dict(slug=row['scpi_slug'],url=url,period=period,kind=kind,index_url=row['official_scpi_page_url']))
 items.sort(key=lambda i:i['period'],reverse=True)
 results=[];seen={}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for r in pool.map(lambda i:inspect(i,cache),items):
   key=(r['slug'],r['period'],r.get('sha256'))
   if r.get('sha256') and key in seen:r['duplicate_of']=seen[key]
   else:seen[key]=r['url']
   if args.apply:
    response=rpc(r);r['database_result']=response
    if not response.get('ok'):raise RuntimeError('document transaction rejected: '+json.dumps(response))
   results.append(r);(out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
   print(r['slug'],r['period'],r['status'],r.get('metrics'),flush=True)
 print('completed',len(results),flush=True)
if __name__=='__main__':main()
