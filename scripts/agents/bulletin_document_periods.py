"""Publication issue labels, independent of upload dates and validity dates."""
import re, unicodedata

def norm(value):
    return re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFKD', value)
        if not unicodedata.combining(c))).lower().replace('’', "'")

def issue_periods(pages):
    # Read the publication cover, never dates from historical performance tables.
    lines='\n'.join(pages[:3]).splitlines()
    lines=[re.split(r'\bvalable\b|\bvalide\b|\bvalidit[eé]\b',line,1,flags=re.I)[0] for line in lines]
    cover=norm(' '.join(lines))
    cover=re.sub(r'\b(20\d)\s+(\d)\b',r'\1\2',cover)
    regulatory=re.search(r"note\s+d[' ]information|document\s+d[' ]informations?\s+cles|statuts",cover[:160])
    if regulatory and not re.search(r'bulletin|rapport\s+annuel',cover[:160]):
        return set()
    annual_patterns=[
        r'rapport\s+(?:annuel|de\s+gestion)\s*(?:exercice\s*)?[-: ]*(20\d{2})',
        r'\b(20\d{2})\s+rapport\s+annuel\b',
        r'rapport\s+annuel.{0,100}?\bexercice\s+(?:clos\s+(?:le\s+)?\d{1,2}\s+\w+\s+)?(20\d{2})',
    ]
    for pattern in annual_patterns:
        match=re.search(pattern,cover)
        if match:return {match.group(1)+'-RA'}
    ordinal=r'(?:er|ere|e|eme|ee|nd|nde|[°º])?'
    for kind,label,limit in [('S','semestre',2),('T','trimestre',4)]:
        pats=[
            rf'\b([1-{limit}])\s*{ordinal}\s*{label}\s*[-:/ ]*(20\d{{2}})\b',
            rf'\b{kind.lower()}\s*([1-{limit}])\s*[-:/ ]*(20\d{{2}})\b',
            rf'\b([1-{limit}])\s*{kind.lower()}\s*[-:/ ]*(20\d{{2}})\b',
        ]
        matches=[(m.start(),m.group(2)+'-'+kind+m.group(1)) for p in pats for m in re.finditer(p,cover)]
        backwards=rf'\b(20\d{{2}})\s*[-:/ ]*{kind.lower()}\s*([1-{limit}])\b'
        matches.extend((m.start(),m.group(1)+'-'+kind+m.group(2)) for m in re.finditer(backwards,cover))
        words=['premier','deuxieme','troisieme','quatrieme'][:limit]
        for index,word in enumerate(words,1):
            for m in re.finditer(rf'\b{word}\s+{label}\s*(20\d{{2}})\b',cover):
                matches.append((m.start(),m.group(1)+'-'+kind+str(index)))
        if matches:return {min(matches)[1]}
    # Some official covers give the analysed interval instead of a quarter
    # number. Require both exact endpoints and the explicit analysis label.
    months=[('janvier','mars','1'),('avril','juin','2'),('juillet','septembre','3'),('octobre','decembre','4')]
    for start,end,quarter in months:
        match=re.search(rf'(?:periode analysee|relatif a la periode).{{0,20}}1(?:er)?\s+{start}\s+(?:au|a)\s+(?:30|31)\s+{end}\s+(20\d{{2}})',cover)
        if match:return {match.group(1)+'-T'+quarter}
    return set()

def matches(period,pages):
    return bool(re.fullmatch(r'20\d{2}-(?:T[1-4]|S[12]|RA)',period)
                and period in issue_periods(pages))
