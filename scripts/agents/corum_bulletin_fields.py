"""Extended official bulletin fields. Geometry, two engines and metric dates.
A core-only document is never described as a complete financial extraction.
"""
import re,calendar,datetime,unicodedata
FIELDS={'prix_souscription':'EUR_PER_PART','prix_reconstitution':'EUR_PER_PART','valeur_realisation':'EUR_PER_PART',
 'prix_retrait':'EUR_PER_PART','distribution_par_part':'EUR_PER_PART','capitalisation':'MEUR',
 'nombre_immeubles':'count','nombre_locataires':'count','nombre_associes':'count','walb':'years',
 'tof':'%','nombre_parts':'parts','parts_attente_retrait':'parts','endettement':'%',
 'walt':'years','collecte_nette':'MEUR','retraits_executes_trimestre':'parts',
 'repartition_sectorielle':'%','repartition_geographique':'%','frais_gestion':'%','frais_souscription':'%','delai_jouissance':'months'}
def norm(s):
 return re.sub(r'\s+',' ',''.join(c for c in unicodedata.normalize('NFKD',str(s)) if not unicodedata.combining(c))).lower().replace('’',"'").strip()
def token(s):return re.sub(r'\d+$','',re.sub(r'[^a-z0-9]','',norm(s)))
def labels(words,label):
 target=[token(s) for s in label.split()];out=[]
 for i in range(len(words)-len(target)+1):
  seq=words[i:i+len(target)]
  if [token(w[4]) for w in seq]==target:
   out.append((min(w[0] for w in seq),min(w[1] for w in seq),max(w[2] for w in seq),max(w[3] for w in seq)))
 return out
def box(words,r):
 found=[w for w in words if r[0]<=(w[0]+w[2])/2<=r[2] and r[1]<=(w[1]+w[3])/2<=r[3]]
 found.sort(key=lambda w:(round(w[1]/3),w[0]));return ' '.join(w[4] for w in found)
def nums(s):return [float(re.sub(r'\s','',v).replace(',','.')) for v in re.findall(r'(?<![\d.,])(\d+(?:[ \u202f\u00a0]\d{3})*(?:[,.]\d+)?)(?![\d.,])',s)]
def quarter_date(period):
 y,q=map(int,period.split('-T'));m=q*3;return f'{y}-{m:02d}-{calendar.monthrange(y,m)[1]}'
def valuation_date(text):
 m=re.search(r'valeurs de reference au (\d{1,2}) (janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre) (20\d{2})',norm(text))
 if not m:return None
 months=['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
 try:return datetime.date(int(m[3]),months.index(m[2])+1,int(m[1])).isoformat()
 except ValueError:return None

def extract(pages,wordpages,widths,period):
 hits={};seen=set();end=quarter_date(period)
 def add(k,v,page,text,date=end,definition=None):
  if date and date<=end and v>=0:
   hits.setdefault(k,[]).append(dict(value=v,page=page,text=text[:900],reference_date=date,unit=FIELDS[k],definition=definition))
 for i,words in enumerate(wordpages):
  page=i+1;pn=norm(pages[i]);width=widths[i]
  for k,label in [('prix_reconstitution','Valeur de reconstitution'),('valeur_realisation','Valeur de réalisation')]:
   for x0,y0,x1,y1 in labels(words,label):
    seen.add(k);txt=box(words,(x1,y0-2,width,y1+3));v=[float(re.sub(r'\s','',v).replace(',','.')) for v in re.findall(r'(\d+(?:[ \u202f\u00a0]\d{3})*(?:[,.]\d+)?)\s*€',txt)]
    date=valuation_date(pages[i])
    if len(v)==1 and '€' in txt and date:add(k,v[0],page,label+' '+txt+'; '+str(date),date)
  if 'prix de souscription depuis le' in pn:
   for x0,y0,x1,y1 in labels(words,'Une part'):
    seen.add('prix_souscription');txt=box(words,(x1,y0-2,min(x0+width*.47,width),y1+3));v=nums(txt)
    if len(v)==1 and '€' in txt:add('prix_souscription',v[0],page,'Une part, frais et commission inclus : '+txt)
  # New CORUM layouts put the price at the right end of the same block.
  for x0,y0,x1,y1 in labels(words,'PRIX DE REVENTE'):
   seen.add('prix_retrait');txt=box(words,(x0,y1,min(x0+width*.49,width),y1+48))
   amounts=re.findall(r'(\d+(?:[,.]\d{2})?)\s*€',txt)
   if len(set(amounts))==1:add('prix_retrait',float(amounts[0].replace(',','.')),page,'Prix de revente par compensation : '+txt)
  for x0,y0,x1,y1 in labels(words,'Dividende brut trimestriel'):
   seen.add('distribution_par_part');txt=box(words,(x0-18,y0-65,x1+18,y0+2))
   amounts=re.findall(r'(\d+(?:[,.]\d{2})?)\s*€',txt)
   if len(set(amounts))==1:add('distribution_par_part',float(amounts[0].replace(',','.')),page,'Dividende BRUT TRIMESTRIEL : '+txt)
  for x0,y0,x1,y1 in labels(words,'Capitalisation'):
   seen.add('capitalisation');txt=box(words,(x0-12,y0-45,min(x0+width*.29,width),y0+2))
   matches=re.findall(r'(\d+(?:[ \u00a0\u202f]\d{3})*(?:[,.]\d+)?)\s*(million|milliard)',norm(txt))
   if len(matches)==1:add('capitalisation',float(re.sub(r'\s','',matches[0][0]).replace(',','.'))*(1000 if matches[0][1]=='milliard' else 1),page,'Capitalisation en prix de souscription : '+txt)
  for k,label in [('nombre_immeubles',"Nombre d’immeubles"),('nombre_locataires','Nombre de locataires')]:
   for x0,y0,x1,y1 in labels(words,label):
    seen.add(k);txt=box(words,(x0-8,y0-50,x1+8,y0+1));v=nums(txt)
    if len(v)==1 and v[0].is_integer():add(k,v[0],page,label+' : '+txt)
  for x0,y0,x1,y1 in labels(words,'associés au'):
   seen.add('nombre_associes');txt=box(words,(x0-8,y0-50,x1+40,y0+1));v=nums(txt)
   if len(v)==1 and v[0].is_integer():add('nombre_associes',v[0],page,'Nombre d’associés à la date du bulletin : '+txt)
  # A lease commitment is a WALB proxy, not a contractual WALT.
  for x0,y0,x1,y1 in labels(words,'Durée moyenne pendant laquelle les locataires'):
   seen.add('walb');txt=box(words,(x0-8,y0-50,x1+8,y0+1))
   v=re.findall(r'(\d+(?:[,.]\d+)?)\s*(?:annees|ans)',norm(txt))
   if len(set(v))==1:add('walb',float(v[0].replace(',','.')),page,'Engagement locatif, pondération non précisée : '+txt,definition='lease_commitment_proxy_not_normalized_walb')
  # Intentionally do not infer debt from a missing debt label, nor fees from a flat blend.
 return {k:vs[0] for k,vs in hits.items() if len({(x['value'],x['reference_date']) for x in vs})==1},seen

def reconcile_extended(a,b,core):
 x,seen_a=a;y,seen_b=b;metrics={};proofs={};coverage={}
 for k in FIELDS:
  if k in core:coverage[k]='verified_core';continue
  if k in x and k in y and all(x[k][f]==y[k][f] for f in ['value','page','reference_date']):
   metrics[k]=x[k]['value'];proofs[k]={**x[k],'poppler_text':y[k]['text'],'independent_engines':['MuPDF','Poppler'],'method':'pdf_page_text_match','value_match':True};coverage[k]='verified'
  else:coverage[k]='needs_review' if k in seen_a|seen_b or k in x or k in y else 'not_extracted'
 return metrics,proofs,coverage
