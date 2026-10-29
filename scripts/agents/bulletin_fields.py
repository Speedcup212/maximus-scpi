"""Issuer-neutral, geometry-aware, dated financial field proposals.

All occurrences are retained, including contradictory/historical values. Only
unambiguous agreement on value, page, date and definition can be promoted.
"""
from __future__ import annotations
import calendar, datetime, re, unicodedata

def norm(s):
    return re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFKD', str(s).replace('œ','oe')) if not unicodedata.combining(c))).lower().replace('’',"'").strip()

NUMBER=r'(?<![\d.,])[-−]?\d+(?:[ \u00a0\u202f]\d{3})*(?:[,.]\d+)?(?![\d.,])'
AMOUNT=re.compile('('+NUMBER+r')\s*(Mds?\s*€|M\s*€|k\s*€|€|euros?|millions?(?:\s+d\W?euros?)?|milliards?(?:\s+d\W?euros?)?)',re.I)
PERCENT=re.compile('('+NUMBER+r')\s*%')
MONTHS=['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
DATE=re.compile(r'\b(\d{1,2})[/.\-](\d{1,2})[/.\-](20\d{2})\b|\b(\d{1,2})\s+('+'|'.join(MONTHS)+r')\s+(20\d{2})\b')
FIELDS={
 'prix_souscription':('EUR_PER_PART',[r'prix (?:de )?souscription(?: de la part)?',r'prix (?:de la )?part']),
 'prix_reconstitution':('EUR_PER_PART',[r'valeur(?:s)? de reconstitution',r'prix de reconstitution']),
 'valeur_realisation':('EUR_PER_PART',[r'valeur(?:s)? de realisation']),
 'prix_retrait':('EUR_PER_PART',[r'prix de retrait',r'valeur de retrait',r'prix de revente']),
 'tof':('%',[r'taux d\W?occupation financier',r'\btof\b']),
 'top':('%',[r'taux d\W?occupation physique',r'\btop\b']),
 'endettement':('%',[r'taux d\W?endettement',r'ratio d\W?endettement',r'\bendettement\b',r'% dette\s*/\s*valeur du patrimoine']),
 'capitalisation':('MEUR',[r'\bcapitalisation\b']),
 'nombre_parts':('parts',[r'nombre de parts(?! (?:souscrites|retirees|nouvelles|remboursees))(?: en circulation)?',r'parts en circulation']),
 'nombre_associes':('count',[r'nombre d\W?associes',r'\bassocies au\b']),
 'nombre_immeubles':('count',[r'nombre d\W?immeubles',r'nombre d\W?actifs immobiliers']),
 'nombre_locataires':('count',[r'nombre de locataires']),
 'parts_attente_retrait':('parts',[r'parts en attente de retraits?',r'parts en attente au']),
 'retraits_executes_trimestre':('parts',[r'parts retirees',r'retraits executes',r'parts remboursees']),
 'collecte_nette':('MEUR',[r'collecte nette']),
 'walt':('years',[r'\bwalt\b',r'duree (?:residuelle )?(?:moyenne )?(?:des baux )?jusqu\W?au terme']),
 'walb':('years',[r'\bwalb\b',r'duree (?:residuelle )?ferme (?:moyenne )?des baux']),
 'distribution_par_part':('EUR_PER_PART',[r'dividende brut trimestriel',r'distribution brute trimestrielle(?: par part)?',r'acompte brut trimestriel']),
 'td':('%',[r'taux de distribution(?: brut)?\s+(20\d{2})',r'taux de distribution(?: brut)?']),
 'frais_souscription':('%',[r'commission de souscription',r'frais (?:de |d\W)entree',r'frais de souscription']),
 'frais_gestion':('%',[r'commission de gestion',r'frais de gestion']),
 'frais_sortie':('%',[r'commission de retrait',r'frais de sortie']),
 'commission_performance':('%',[r'commission de (?:sur)?performance']),
 'srri':('risk_1_7',[r'indicateur synthetique de risque',r'profil de risque',r'\bsri\b',r'\bsrri\b']),
 'delai_jouissance':('months',[r'delai de jouissance']),
 'duree_detention_recommandee':('years',[r'duree (?:de la )?detention recommandee',r'duree (?:de )?placement recommandee']),
 'repartition_sectorielle':('%_mapping',[r'repartition (?:par typologie|sectorielle|par secteur)',r'typologies? d\W?actifs']),
 'repartition_geographique':('%_mapping',[r'repartition geographique',r'repartition par pays']),
 'capital_type':('capital_type',[r'capital (variable|fixe)']),
 'sfdr':('SFDR_article',[r'\bsfdr\b',r'article [689]']),
 'label_isr':('boolean',[r'label isr']),
 'versement_loyers':('frequency',[r'distribution mensuelle',r'distribution trimestrielle',r'versement (?:mensuel|trimestriel)']),
 'report_a_nouveau':('EUR_PER_PART',[r'report a nouveau(?: par part)?']),
}

def number(s):
    s=re.sub(r'\s','',s).replace('−','-')
    if ',' in s and '.' in s:
        s=s.replace('.','').replace(',','.') if s.rfind(',')>s.rfind('.') else s.replace(',','')
    else:s=s.replace(',','.')
    return float(s)

def end_date(period):
    m=re.fullmatch(r'(20\d{2})-T([1-4])',period)
    if not m:return None
    year,month=int(m[1]),int(m[2])*3
    return datetime.date(year,month,calendar.monthrange(year,month)[1]).isoformat()

def dates(text):
    found=[]
    for m in DATE.finditer(norm(text)):
        try:
            d,mo,y=(int(m[1]),int(m[2]),int(m[3])) if m[1] else (int(m[4]),MONTHS.index(m[5])+1,int(m[6]))
            found.append((datetime.date(y,mo,d).isoformat(),m.start(),m.end()))
        except ValueError:pass
    return found

def line_groups(words):
    """Keep separate column fragments instead of flattening page reading order."""
    rows=[]
    for w in sorted(words,key=lambda w:((w[1]+w[3])/2,w[0])):
        cy=(w[1]+w[3])/2
        possible=[r for r in rows[-8:] if abs(r[0]-cy)<max(2.5,min(w[3]-w[1],12)*.28)]
        if possible:
            row=min(possible,key=lambda r:abs(r[0]-cy));row[1].append(w)
        else:rows.append([cy,[w]])
    result=[]
    for cy,row in rows:
        row.sort(key=lambda w:w[0]);group=[]
        for w in row:
            if group and w[0]-group[-1][2]>max(24,(w[3]-w[1])*2.4):
                result.append(group);group=[]
            group.append(w)
        if group:result.append(group)
    return result

def rect(ws):return min(w[0] for w in ws),min(w[1] for w in ws),max(w[2] for w in ws),max(w[3] for w in ws)
def text(ws):return ' '.join(w[4] for w in sorted(ws,key=lambda w:w[0]))

def caption_only(label,patterns,unit):
    """Editorial prose, examples and definitions cannot act as a chart caption."""
    n=norm(label)
    if len(n)>140 or re.search(r'comprendre|exemple|objectif|maxim|autorise|limite|nets? de frais|mais brut|est defini|correspond|promesse|malgre',n):return False
    n=DATE.sub(' ',n)
    n=AMOUNT.sub(' ',n);n=PERCENT.sub(' ',n)
    n=re.sub(r'\b\d+(?:[,.]\d+)?\b',' ',n)
    for pattern in patterns:
        remaining=re.sub(pattern,' ',n)
        if remaining==n:continue
        remaining=re.sub(r'\([^)]*\)',' ',remaining)
        remaining=re.sub(r'\b(?:au|du|de|la|le|des|en|par|part|trimestre|trimestriel|moyen|moyenne|actuel|actuelle|fin|total|totale|hors|taxes|ht|ttc|ans|annees|mois|euros|m|m€|encaissements|loyers|valeur|patrimoine|pour|cent|compte|annuel|annuelle|brut|brute|chiffres|cles|nombre|circulation|prix|souscription|reference|a|%|€)\b',' ',remaining)
        if not re.sub(r'[\W_]+','',remaining):return True
    return False

def numeric_fragment(t,unit):
    n=norm(t)
    n=DATE.sub(' ',n);n=AMOUNT.sub(' ',n);n=PERCENT.sub(' ',n)
    n=re.sub(NUMBER,' ',n)
    n=re.sub(r'\b(?:ans?|annees?|mois|ht|ttc|euros?|m€|k€|millions?|milliards?|par|part|parts|au)\b',' ',n)
    return not re.sub(r'[\W_]+','',n)

def values(snippet,unit):
    if unit in ('EUR_PER_PART','MEUR'):
        out=[]
        for m in AMOUNT.finditer(snippet):
            v=number(m[1]);u=norm(m[2]).replace(' ','')
            mult=1000 if u.startswith(('md','milliard')) else 1 if u.startswith(('m€','million')) else .001 if u.startswith('k') else .000001
            out.append((v*mult if unit=='MEUR' else v,m.group()))
        return out
    if unit=='%':return [(number(m[1]),m.group()) for m in PERCENT.finditer(snippet)]
    if unit in ('years','months'):
        return [(number(m[1]),m.group()) for m in re.finditer('('+NUMBER+r')\s*(?:ans?|annees?|mois)\b',norm(snippet))]
    if unit=='risk_1_7':return [(float(m[1]),m.group()) for m in re.finditer(r'\b([1-7])\s*/\s*7\b',snippet)]
    if unit in ('parts','count'):
        cleaned=DATE.sub(' ',norm(snippet))
        # Currency, percentages, years, footnote markers and ordinals cannot be counts.
        cleaned=AMOUNT.sub(' ',cleaned);cleaned=PERCENT.sub(' ',cleaned)
        cleaned=re.sub(r'\(\d+\)|\b20\d{2}\b|\b\d+(?:er|e|eme)\b',' ',cleaned)
        return [(number(m.group()),m.group()) for m in re.finditer(NUMBER,cleaned) if number(m.group()).is_integer()]
    return []

def metric_date(metric,label,words,groups,period):
    end=end_date(period)
    x0,y0,x1,y1=rect(words)
    # Prefer an explicit date in the label/metric fragment.
    local=dates(label)
    if local:
        eligible={d for d,_,_ in local if d<=end}
        if len(eligible)==1:return eligible.pop()
    if metric=='td':
        years=re.findall(r'\b(20\d{2})\b',label)
        if len(set(years))==1 and years[0]+'-12-31'<=end:return years[0]+'-12-31'
        return None
    if metric in ('prix_reconstitution','valeur_realisation','report_a_nouveau'):
        candidates=[]
        for group in groups:
            gx0,gy0,gx1,gy1=rect(group);gtext=text(group);ds=dates(gtext)
            if not ds:continue
            if gy0>y1+10 or y0-gy1>170:continue
            if gx1<x0-80 or gx0>x1+80:continue
            score=abs(y0-gy1)+abs((x0+x1-gx0-gx1)/2)*.3
            if re.search(r'valeurs?|reference|reconstitution|realisation',norm(gtext)):score-=50
            for date,_,_ in ds:
                if date<=end:candidates.append((score,date))
        if candidates:
            candidates.sort()
            best=candidates[0]
            if not any(abs(s-best[0])<8 and d!=best[1] for s,d in candidates):return best[1]
        return None
    return end

def extract(pages,wordpages,widths,period):
    hits={};seen=set();end=end_date(period)
    if not end:return {},set()
    for index,words in enumerate(wordpages):
        groups=line_groups(words)
        for group in groups:
            label=text(group);n=norm(label);r=rect(group)
            for metric,(unit,patterns) in FIELDS.items():
                if not any(re.search(p,n) for p in patterns):continue
                seen.add(metric)
                if unit in ('%_mapping','SFDR_article','boolean','frequency','capital_type'):continue
                if not caption_only(label,patterns,unit):continue
                date=metric_date(metric,label,group,groups,period)
                if not date:continue
                candidates=[]
                # Same labelled fragment is the strongest association.
                own=values(label,unit)
                if len({v for v,_ in own})==1:candidates=[(own[0][0],label,'same_line')]
                # Standalone figures immediately above/below the caption.
                if not own:
                    nearby=[]
                    x0,y0,x1,y1=r
                    for other in groups:
                        if other is group:continue
                        ox0,oy0,ox1,oy1=rect(other)
                        overlap=min(x1,ox1)-max(x0,ox0)
                        if overlap<=0 or min(abs(oy1-y0),abs(oy0-y1))>38:continue
                        t=text(other);ns=values(t,unit)
                        if not numeric_fragment(t,unit):continue
                        if len(ns)!=1:continue
                        # A nearby number labelled as another metric is never borrowed.
                        if any(any(re.search(p,norm(t)) for p in ps) for k,(_,ps) in FIELDS.items() if k!=metric):continue
                        dist=min(abs(oy1-y0),abs(oy0-y1))
                        nearby.append((dist,ns[0][0],t))
                    nearby.sort()
                    if nearby and (len(nearby)==1 or nearby[1][0]-nearby[0][0]>8):
                        _,v,t=nearby[0];candidates=[(v,label+' | '+t,'adjacent_caption')]
                for value,snippet,association in candidates:
                    # A PDF table can concatenate adjacent figures across columns
                    # (e.g. 2 703 162 + 957 003 + 057 800). It is not a valid
                    # single count, even if both native readers produce it.
                    # Reject before applying any integer database column.
                    if unit in ('parts','count'):
                        if value<0 or not float(value).is_integer():continue
                        if value>(1_000_000_000 if unit=='parts' else 100_000_000):continue
                    if unit=='%' and not 0<=value<=100:continue
                    if unit=='years' and not 0<=value<=100:continue
                    if unit=='months' and not 0<=value<=24:continue
                    if unit=='EUR_PER_PART' and not 0<=value<=100000:continue
                    if unit=='MEUR' and abs(value)<.1 and value!=0:continue
                    if metric in ('prix_souscription','prix_reconstitution','valeur_realisation','prix_retrait') and value<10:continue
                    if metric in ('tof','top') and value<1:continue
                    definition='gross_quarterly_distribution' if metric=='distribution_par_part' else 'reported_metric'
                    if metric=='frais_gestion':
                        definition='management_fee_ht' if re.search(r'\bht\b|hors taxes',norm(snippet)) else 'management_fee_ttc' if 'ttc' in norm(snippet) else 'management_fee_tax_basis_unspecified'
                    hits.setdefault(metric,[]).append({'value':value,'page':index+1,'reference_date':date,'unit':unit,'text':snippet,'definition':definition,'association':association})
    # Duplicate identical occurrences are harmless; different dates remain separate.
    return hits,seen

def reconcile(a,b):
    ah,aseen=a;bh,bseen=b;results={};proofs={};coverage={};candidates={}
    for metric in FIELDS:
        av=ah.get(metric,[]);bv=bh.get(metric,[])
        def signature(v):return v['value'],v['page'],v['reference_date'],v['definition']
        same={signature(v):v for v in av if any(signature(v)==signature(w) for w in bv)}
        if len(same)==1 and len({(v['value'],v['reference_date']) for v in av+bv})==1:
            sig,v=next(iter(same.items()));other=next(w for w in bv if signature(w)==sig)
            results[metric]=v['value'];proofs[metric]={**v,'poppler_text':other['text'],'independent_engines':['MuPDF','Poppler'],'method':'dual_pdf_geometry','value_match':True};coverage[metric]='verified'
        else:
            coverage[metric]='needs_review' if metric in aseen|bseen else 'not_found_after_full_read'
            if av or bv:candidates[metric]={'MuPDF':av,'Poppler':bv}
    return results,proofs,coverage,candidates
