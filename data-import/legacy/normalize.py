import pandas as pd, json, re, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

XLSX = r'C:\Users\ericb\Desktop\SCPI_complet_avec_SFDR_Profil (1).xlsx'
df = pd.read_excel(XLSX, engine='openpyxl')

def parse_sectorial(text):
    if pd.isna(text): return None, 'missing'
    text = str(text).strip()
    result = {}
    # Pattern 1: "Label (XX%)" or "Label (XX,XX%)"
    p1 = re.findall(r'([^,(]+)\s*\(([\d,\.]+)\s*%\)', text)
    for label, pct in p1:
        label = label.strip().rstrip(',').strip()
        result[label] = float(pct.replace(',', '.'))
    if result: return result, 'parsed'
    # Pattern 2: "Label : XX %" or "Label : XX,X %"
    p2 = re.findall(r'([^,;]+?)\s*:\s*([\d,\.]+)\s*%', text)
    for label, pct in p2:
        label = label.strip()
        result[label] = float(pct.replace(',', '.'))
    if result: return result, 'parsed'
    # Labels only
    if text and '%' not in text:
        return {'_labels_only': text}, 'labels_only'
    return None, 'error'

def repair_geo(raw_json):
    if pd.isna(raw_json): return None, 'missing'
    raw = str(raw_json).strip()
    try:
        parsed = json.loads(raw)
    except:
        return None, 'invalid_json'
    if not isinstance(parsed, dict) or not parsed:
        return parsed, 'ok'
    if not all(v is None for v in parsed.values()):
        return parsed, 'ok'
    # All values None -> try to repair
    keys = list(parsed.keys())
    has_digits_and_paren = any(re.search(r'\d', k) and ('(' in k or ':' in k) for k in keys)
    if not has_digits_and_paren:
        return {'_labels_only': ', '.join(keys)}, 'labels_only'
    repaired = {}
    i = 0
    while i < len(keys):
        k1 = keys[i]
        if i + 1 < len(keys):
            k2 = keys[i + 1]
            # 'Country (NN' + 'MM%)'
            m1 = re.match(r'^(.+?)\s*\((\d+)$', k1.strip())
            m2 = re.match(r'^(\d+)%?\)?$', k2.strip())
            if m1 and m2:
                repaired[m1.group(1).strip()] = float(m1.group(2) + '.' + m2.group(1))
                i += 2
                continue
            # 'Key : NN' + 'MM %'
            m3 = re.match(r'^(.+?)\s*:\s*(\d+)$', k1.strip())
            m4 = re.match(r'^(\d+)\s*%?$', k2.strip())
            if m3 and m4:
                repaired[m3.group(1).strip()] = float(m3.group(2) + '.' + m4.group(1))
                i += 2
                continue
        repaired[k1] = None
        i += 1
    all_none = all(v is None for v in repaired.values())
    if all_none:
        return {'_labels_only': ', '.join(repaired.keys())}, 'labels_only'
    return repaired, 'repaired'

def safe_int(v):
    if pd.isna(v): return None
    try: return int(float(str(v)))
    except: return None

def safe_float(v):
    if pd.isna(v): return None
    try: return float(str(v))
    except: return None

records = []
errors = []

for idx, row in df.iterrows():
    scpi_name = row.iloc[0]
    geo_parsed, geo_status = repair_geo(row.iloc[25])
    sect_parsed, sect_status = parse_sectorial(row.iloc[24])

    td_val = safe_float(row.iloc[11])
    td_status = 'zero' if td_val == 0 else ('ok' if td_val and td_val > 0 else 'null')

    delai_raw = row.iloc[17]
    if str(delai_raw) == 'NC':
        delai_val, delai_status = None, 'nc'
    else:
        delai_val, delai_status = safe_int(delai_raw), 'ok'

    sev_geo = 'info' if geo_status in ('repaired', 'labels_only') else 'error'
    sev_sect = 'info' if sect_status == 'labels_only' else 'warning'

    if geo_status not in ('ok',):
        errors.append({'scpi': scpi_name, 'field': 'geo', 'issue': geo_status, 'severity': sev_geo})
    if sect_status not in ('parsed',):
        errors.append({'scpi': scpi_name, 'field': 'sectorial', 'issue': sect_status, 'severity': sev_sect})
    if td_status == 'zero':
        errors.append({'scpi': scpi_name, 'field': 'td', 'issue': 'zero_distribution', 'severity': 'warning'})
    if delai_status == 'nc':
        errors.append({'scpi': scpi_name, 'field': 'delai_jouissance', 'issue': 'nc_value', 'severity': 'info'})

    rec = {
        'nom_scpi': scpi_name,
        'societe_gestion': row.iloc[1],
        'annee_creation': safe_int(row.iloc[2]),
        'profil_risque': safe_int(row.iloc[3]),
        'label_isr': str(row.iloc[4]),
        'capitalisation_m': safe_float(row.iloc[5]),
        'prix_souscription': safe_float(row.iloc[6]),
        'valeur_retrait': safe_float(row.iloc[7]),
        'surcote_decote_pct': safe_float(row.iloc[8]),
        'valeur_reconstitution': safe_float(row.iloc[9]),
        'valeur_realisation': safe_float(row.iloc[10]),
        'taux_distribution_pct': td_val,
        'distribution_par_part': safe_float(row.iloc[12]),
        'endettement_pct': safe_float(row.iloc[13]),
        'tof_pct': safe_float(row.iloc[14]),
        'nombre_immeubles': safe_int(row.iloc[15]),
        'minimum_souscription': safe_float(row.iloc[16]),
        'delai_jouissance_mois': delai_val,
        'versement_loyers': str(row.iloc[18]),
        'duree_detention_recommandee_ans': safe_int(row.iloc[19]),
        'frais_souscription_pct': safe_float(row.iloc[20]),
        'sfdr': str(row.iloc[21]),
        'profil_cible': str(row.iloc[22]),
        'frais_gestion_pct': safe_float(row.iloc[23]),
        'repartition_sectorielle_json': json.dumps(sect_parsed, ensure_ascii=False) if sect_parsed else None,
        'repartition_geo_json': json.dumps(geo_parsed, ensure_ascii=False) if geo_parsed else None,
        '_sect_status': sect_status,
        '_geo_status': geo_status,
        '_td_status': td_status,
        '_delai_status': delai_status,
        '_data_status': 'legacy_fallback',
        '_source_origin': 'legacy_dataset',
    }
    records.append(rec)

out_df = pd.DataFrame(records)

print(f'Rows: {len(out_df)}  Cols: {len(out_df.columns)}')
print()
print('Sectorial status:')
for k, v in out_df['_sect_status'].value_counts().items():
    print(f'  {k}: {v}')
print()
print('Geo status:')
for k, v in out_df['_geo_status'].value_counts().items():
    print(f'  {k}: {v}')
print()
print('TD status:')
for k, v in out_df['_td_status'].value_counts().items():
    print(f'  {k}: {v}')
print()
print('Error log:')
for e in errors:
    print(f'  [{e["severity"]}] {e["scpi"]} / {e["field"]}: {e["issue"]}')

os.makedirs(r'C:\Users\ericb\Desktop\maximus-scpi\data-import\legacy', exist_ok=True)
csv_path = r'C:\Users\ericb\Desktop\maximus-scpi\data-import\legacy\scpi_master_legacy_normalized.csv'
err_path = r'C:\Users\ericb\Desktop\maximus-scpi\data-import\legacy\import_errors.csv'
out_df.to_csv(csv_path, index=False, encoding='utf-8-sig')
pd.DataFrame(errors).to_csv(err_path, index=False, encoding='utf-8-sig')
print()
print(f'CSV written: {csv_path}')
print(f'Errors written: {err_path}')

# Pilot comparison
print()
print('=== Pilot TD: legacy vs published ===')
pilots = {
    'Activimmo': 5.50,
    'Comete': 10.62,
    'Iroko Zen': 7.32,
    'Remake Live': 7.50,
    'Transitions Europe': 8.25,
}
pilot_names_xlsx = {
    'Activimmo': 'Activimmo',
    'Comete': 'Comète',
    'Iroko Zen': 'Iroko Zen',
    'Remake Live': 'Remake Live',
    'Transitions Europe': 'Transitions Europe',
}
for key, pub in pilots.items():
    name = pilot_names_xlsx[key]
    r = out_df[out_df['nom_scpi'] == name]
    if not r.empty:
        leg = r.iloc[0]['taux_distribution_pct']
        d = round(abs(float(leg) - pub), 2)
        flag = ' DISCREPANCY (legacy antérieur)' if d > 0.1 else ' OK'
        print(f'  {name}: legacy={leg} published={pub} delta={d}{flag}')
