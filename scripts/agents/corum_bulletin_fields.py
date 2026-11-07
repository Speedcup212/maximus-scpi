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
def dated_publisher_capital_table_shares(page_text,period):
 """Read the CURRENT column of a publisher's dated capital table, not the adjacent prior year.

 Requires both printed share counts, both printed capitalisation amounts in K EUR,
 the printed subscription price and arithmetic agreement for BOTH columns.
 Every other layout remains pending independent QA.
 """
 issue=re.fullmatch(r'(20\d{2})-T([1-4])',period)
 if not issue:return None
 p=norm(page_text)
 count=r'(?:\d{1,3}(?: \d{3})+|\d{4,10})'
 dates=re.search(r'\bdate\s+(\d{1,2}/\d{1,2}/20\d{2})\s+(\d{1,2}/\d{1,2}/20\d{2})\b',p)
 capitals=re.search(r'capitalisation\s*\(en prix de souscription\)\s+('+count+r')\s*k\s*€\s+('+count+r')\s*k\s*€',p)
 shares=re.search(r'\bnombre de parts\s+('+count+r')\s+('+count+r')\b',p)
 price=re.search(r'une part\s*\(tous frais inclus\)\s+(\d+(?:[,.]\d{2})?)\s*€',p)
 if not all((dates,capitals,shares,price)):return None
 try:
  today=datetime.datetime.strptime(dates[1],'%d/%m/%Y').date()
  prior=datetime.datetime.strptime(dates[2],'%d/%m/%Y').date()
  share_now=int(shares[1].replace(' ',''))
  share_prior=int(shares[2].replace(' ',''))
  cap_now_k=int(capitals[1].replace(' ',''))
  cap_prior_k=int(capitals[2].replace(' ',''))
  subscription=float(price[1].replace(',','.'))
 except (ValueError,OverflowError):return None
 if not (today.year==int(issue[1]) and (today.month-1)//3+1==int(issue[2])
   and prior<today and share_now>0 and share_prior>0 and subscription>=10):
  return None
 # Printed K€ figures are rounded to the nearest K€ by the issuer.
 if any(abs(shares*subscription/1000-cap)>1 for shares,cap in
   ((share_now,cap_now_k),(share_prior,cap_prior_k))):
  return None
 if not (share_now>share_prior and cap_now_k>cap_prior_k):
  return None
 return dict(value=float(share_now),date=today.isoformat(),
   proof=('Publisher dated capital table, current '+dates[1]+' shares '+shares[1]+
    ' / printed capitalisation '+capitals[1]+' K€, comparative '+dates[2]+
    ' shares '+shares[2]+' / printed capitalisation '+capitals[2]+
    ' K€, subscription '+price[1]+' €, both columns issuer-reconciled'),
   definition='publisher_current_dated_share_table_dual_arithmetic')

def dated_publisher_four_column_withdrawal_queue(page_text,period):
 """Read the last printed value in the four-column issuer movement table.

 The zero is NOT inferred from absent liquidity figures. Both PDF engines must
 see all four source columns and their distinct captions on the same page.
 """
 issue=re.fullmatch(r'(20\d{2})-T([1-4])',period)
 if not issue:return None
 p=norm(page_text)
 count=r'(?:\d{1,3}(?: \d{3})+|\d{4,10})'
 header=re.search(r'\bdate\s+(\d{1,2}/\d{1,2}/20\d{2})\s+(\d{1,2}/\d{1,2}/20\d{2})\b',p)
 row=re.search(r'(?<!\d)('+count+r')\s+('+count+r')\s+(\d{1,3})\s+(\d{1,3})\s+date d.entree\b',p)
 if not (header and row):return None
 try:
  current=datetime.datetime.strptime(header[1],'%d/%m/%Y').date()
  previous=datetime.datetime.strptime(header[2],'%d/%m/%Y').date()
  movements=[int(re.sub(r'\s','',x)) for x in row.groups()]
 except (ValueError,OverflowError):return None
 if not (current.year==int(issue[1]) and (current.month-1)//3+1==int(issue[2])
  and previous<current and all(v>=0 for v in movements)
  and movements[0]>0 and movements[1]>0 and movements[-1]<=1_000_000_000):
  return None
 label_block=p[row.end():row.end()+720]
 required=('parts augmentant','retraits compenses','achats et cessions','part en attente')
 locations=[label_block.find(label) for label in required]
 if not (all(i>=0 for i in locations) and locations==sorted(locations)):
  return None
 if 'de retraits' not in label_block[locations[-1]:locations[-1]+250]:
  return None
 return dict(value=float(movements[-1]),date=current.isoformat(),
  proof=('Publisher four-column savings movement table, same-page date '+header[1]+
   ', shares augmenting capital '+str(movements[0])+
   ', shares compensating withdrawals '+str(movements[1])+
   ', between-holder transfers '+str(movements[2])+
   ', final column Part en attente de retraits '+str(movements[3])+
   '; no zero imputed'),
  definition='publisher_same_page_four_column_pending_withdrawal')

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
  withdrawal_table=dated_publisher_four_column_withdrawal_queue(pages[i],period)
  if withdrawal_table:
   seen.add('parts_attente_retrait')
   add('parts_attente_retrait',withdrawal_table['value'],page,withdrawal_table['proof'],
       date=withdrawal_table['date'],definition=withdrawal_table['definition'])
  shares_table=dated_publisher_capital_table_shares(pages[i],period)
  if shares_table:
   seen.add('nombre_parts')
   add('nombre_parts',shares_table['value'],page,shares_table['proof'],
       date=shares_table['date'],definition=shares_table['definition'])
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

def printed_capitalisation_candidates(proof):
 """Only values visibly printed before the publisher's million/billion unit.
 A historical comparison column is NOT current-quarter proof by itself.
 """
 m=re.search(r'capitalisation en prix de souscription\s*:\s*(.*?)\s*(millions?|milliards?)\b',norm(proof.get('text','')))
 if not m:return set()
 figures=re.findall(r'(?<![\d.,])(?:\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d+(?:[,.]\d+)?)(?![\d.,])',m[1])
 multiplier=1000 if m[2].startswith('milliard') else 1
 return {round(float(re.sub(r'\s','',value).replace(',','.'))*multiplier,6) for value in figures}

def validated_printed_capitalisation(a,b,core):
 """Never invent cap from shares*price: arithmetic checks which printed
 source-column value, if any, is uniquely supported by the same-period facts.
 Ambiguous columns are review-only even when MuPDF and Poppler agree on
 the WRONG historical neighbouring column.
 """
 ca=printed_capitalisation_candidates(a);cb=printed_capitalisation_candidates(b)
 if not ca or ca!=cb:return None
 price=core.get('prix_souscription')
 shares=core.get('nombre_parts')
 if not price or not shares:
  return next(iter(ca)) if len(ca)==1 and a['value']==b['value'] else None
 implied=float(shares)*float(price)/1_000_000
 if implied<=0:return None
 matching=[v for v in ca if abs(v-implied)/implied<=0.05]
 if len(matching)!=1:return None
 return matching[0]

def reconcile_extended(a,b,core):
 x,seen_a=a;y,seen_b=b;metrics={};proofs={};coverage={}
 for k in FIELDS:
  if k in core:coverage[k]='verified_core';continue
  if k in x and k in y and all(x[k][f]==y[k][f] for f in ['page','reference_date']):
   if k=='capitalisation':
    # parse_core validates share counts but has no subscription price key.
    # The exact-quarter price is independently read by both extended engines.
    # Use it for QA only if the two source facts agree in value/page/date.
    cap_context={**core}
    if ('prix_souscription' in x and 'prix_souscription' in y and
        all(x['prix_souscription'][f]==y['prix_souscription'][f]
            for f in ('value','page','reference_date'))):
     cap_context['prix_souscription']=x['prix_souscription']['value']
    value=validated_printed_capitalisation(x[k],y[k],cap_context)
    if value is None:
     coverage[k]='needs_review';continue
    metrics[k]=value
    proofs[k]={**x[k],'value':value,'poppler_text':y[k]['text'],
      'independent_engines':['MuPDF','Poppler'],
      'method':'pdf_page_text_match_issuer_arithmetic_qa',
      'definition':'publisher_printed_quarter_value_verified_with_share_price_crosscheck',
      'value_match':True}
    coverage[k]='verified'
    continue
   if x[k]['value']==y[k]['value']:
    metrics[k]=x[k]['value'];proofs[k]={**x[k],'poppler_text':y[k]['text'],
      'independent_engines':['MuPDF','Poppler'],'method':'pdf_page_text_match','value_match':True}
    coverage[k]='verified'
    continue
  coverage[k]='needs_review' if k in seen_a|seen_b or k in x or k in y else 'not_extracted'
 return metrics,proofs,coverage
