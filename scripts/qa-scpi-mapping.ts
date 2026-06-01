/**
 * QA Mapping SCPI — MaximusSCPI
 * Contrôle la qualité des données de toutes les SCPI visibles dans le front.
 *
 * Usage : npx tsx scripts/qa-scpi-mapping.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Types ──────────────────────────────────────────────────────────────────
interface SCPIExtendedEntry {
  id: number;
  name: string;
  yield: number;
  price: number;
  minInvestment: number;
  category: string;
  managementCompany: string;
  tof: number;
  capitalization: string;
  sectors: Array<{ name: string; value: number }>;
  geography: Array<{ name: string; value: number }>;
  strategy: string;
  reconstitutionValue?: number;
  valeurRetrait?: number;
  ltv?: number;
  [key: string]: unknown;
}

interface ScpiRecord {
  'Nom SCPI': string;
  'Taux de distribution (%)'?: number;
  'Prix de souscription (€)'?: number;
  'TOF (%)'?: number;
  'Répartition Sectorielle JSON'?: Record<string, number>;
  'Répartition Géographique JSON'?: Record<string, number>;
  'Capitalisation (M€)'?: number;
  'Valeur de retrait (€)'?: number | string;
  maximus_data_status?: string;
  maximus_warnings?: string[];
  [key: string]: unknown;
}

interface QAFinding {
  id: number;
  nom: string;
  status: 'OK' | 'ATTENTION' | 'CRITIQUE' | 'MANUAL_REVIEW';
  yieldEffectif: number | null;
  yieldSource: 'json' | 'ts';
  price: number;
  tof: number;
  nbSecteurs: number;
  secteursSomme: number;
  nbGeo: number;
  geoSomme: number;
  capitalisation: string;
  source: string;
  issues: string[];
}

// ── Constantes ─────────────────────────────────────────────────────────────
const FORBIDDEN_YEARS = new Set([2023, 2024, 2025, 2026]);
const VALIDATED_HIGH_YIELD = new Set(['Wemo One']);
const SCPI_ZERO_YIELD_KNOWN = new Set([
  'GMA Essentialis', 'Grand Paris Résidentiel', 'Patrimmo Croissance Impact'
]);

// ── Helpers ────────────────────────────────────────────────────────────────
function isYear(val: unknown): boolean {
  const n = Number(val);
  return !isNaN(n) && FORBIDDEN_YEARS.has(Math.round(n));
}

function checkYield(val: number | null, name: string): string[] {
  const issues: string[] = [];
  if (val === null || val === 0) {
    if (!SCPI_ZERO_YIELD_KNOWN.has(name)) issues.push('YIELD_MANQUANT');
    return issues;
  }
  if (isYear(val)) issues.push(`YIELD_EST_ANNEE (${val})`);
  else if (val < 0) issues.push(`YIELD_NEGATIF (${val})`);
  else if (val > 20 && !VALIDATED_HIGH_YIELD.has(name)) issues.push(`YIELD_ABERRANT_>20 (${val})`);
  return issues;
}

function checkPrice(val: number, name: string): string[] {
  const issues: string[] = [];
  if (!val || val === 0) { issues.push('PRIX_MANQUANT'); return issues; }
  if (isYear(val)) issues.push(`PRIX_EST_ANNEE (${val})`);
  else if (val < 0) issues.push('PRIX_NEGATIF');
  else if (val > 10000) issues.push(`PRIX_ABERRANT_>10000 (${val})`);
  return issues;
}

function checkSectors(sectors: Array<{ name: string; value: number }>, name: string): string[] {
  const issues: string[] = [];
  if (!sectors || sectors.length === 0) { issues.push('SECTEURS_MANQUANTS'); return issues; }
  if (sectors.length === 1 && /diversif/i.test(sectors[0].name)) {
    issues.push('SECTEURS_GENERIQUES_100pct');
  }
  const total = sectors.reduce((sum, s) => sum + (s.value || 0), 0);
  if (Math.abs(total - 100) > 2) issues.push(`SECTEURS_SOMME_INCORRECTE (${total.toFixed(1)}%)`);
  return issues;
}

function checkGeo(geo: Array<{ name: string; value: number }>, name: string): string[] {
  const issues: string[] = [];
  if (!geo || geo.length === 0) { issues.push('GEO_MANQUANTE'); return issues; }
  if (geo.length === 2) {
    const sorted = [...geo].sort((a, b) => a.value - b.value);
    if (
      sorted[0].name.toLowerCase() === 'europe' && sorted[1].name.toLowerCase() === 'france' &&
      sorted[0].value === 30 && sorted[1].value === 70
    ) issues.push('GEO_GENERIQUE_France70_Europe30');
  }
  const total = geo.reduce((sum, g) => sum + (g.value || 0), 0);
  if (Math.abs(total - 100) > 3) issues.push(`GEO_SOMME_INCORRECTE (${total.toFixed(1)}%)`);
  return issues;
}

// ── Chargement ─────────────────────────────────────────────────────────────
const TS_FILE   = path.join(__dirname, '../src/data/scpiDataExtended.ts');
const JSON_FILE = path.join(__dirname, '../src/data/scpi_complet.json');

const tsContent = fs.readFileSync(TS_FILE, 'utf-8');
const start = tsContent.indexOf('const baseSCPIData: SCPIExtended[] = [');
const end   = tsContent.indexOf('\nexport const scpiDataExtended', start);
let jsonStr = tsContent.slice(start, end)
  .replace(/^const baseSCPIData: SCPIExtended\[\] = /, '')
  .replace(/;\s*$/, '')
  .replace(/,\s*\/\/[^\n]*/g, ',')
  .replace(/\/\/[^\n]*/g, '')
  .replace(/,(\s*[}\]])/g, '$1');
const tsEntries: SCPIExtendedEntry[] = JSON.parse(jsonStr);

const scpiComplet: ScpiRecord[] = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
const jsonIdx = new Map(scpiComplet.map(s => [s['Nom SCPI'], s]));

// ── Audit ──────────────────────────────────────────────────────────────────
const findings: QAFinding[] = [];

for (const ts of tsEntries) {
  const json = jsonIdx.get(ts.name);

  const yieldJson = json?.['Taux de distribution (%)'] ?? null;
  const yieldEff  = (yieldJson !== null && yieldJson !== 0) ? yieldJson : ts.yield;
  const yieldSrc  = (yieldJson !== null && yieldJson !== 0) ? 'json' : 'ts';

  const sectorJsonRaw = json?.['Répartition Sectorielle JSON'];
  const sectorsEff = (sectorJsonRaw && Object.keys(sectorJsonRaw).length > 0)
    ? Object.entries(sectorJsonRaw).filter(([, v]) => v != null).map(([k, v]) => ({ name: k, value: Number(v) }))
    : ts.sectors;

  const geoJsonRaw = json?.['Répartition Géographique JSON'];
  const geoEff = (geoJsonRaw && Object.keys(geoJsonRaw).length > 0)
    ? Object.entries(geoJsonRaw).filter(([, v]) => v != null).map(([k, v]) => ({ name: k, value: Number(v) }))
    : ts.geography;

  const tofJson = json?.['TOF (%)'] ?? null;
  const tofEff  = (tofJson !== null && tofJson !== 0 && Number(tofJson) <= 100) ? Number(tofJson) : ts.tof;

  const retrait = json?.['Valeur de retrait (€)'] ?? ts.valeurRetrait;

  const issues: string[] = [
    ...checkYield(yieldEff, ts.name),
    ...checkPrice(ts.price, ts.name),
    ...checkSectors(sectorsEff, ts.name),
    ...checkGeo(geoEff, ts.name),
    ...(tofEff === 0 ? ['TOF_MANQUANT'] : tofEff > 100 ? [`TOF_ABERRANT (${tofEff})`] : []),
    ...(!ts.capitalization || ts.capitalization === 'N/A' ? ['CAP_MANQUANTE'] : []),
  ];

  if (retrait && ts.price > 0) {
    const retraitNum = typeof retrait === 'string' ? parseFloat(retrait as string) : retrait as number;
    if (!isNaN(retraitNum)) {
      const ecart = (retraitNum - ts.price) / ts.price;
      if (ecart > 0.05) {
        // Retrait > prix de souscription → anomalie critique
        issues.push(`RETRAIT_SUPERIEUR_AU_PRIX (prix=${ts.price}, retrait=${retraitNum})`);
      } else if (retraitNum < ts.price && Math.abs(ecart) > 0.60) {
        // Décote > 60% avec retrait < prix → signaler (marché secondaire forte décote)
        issues.push(`PRIX_DECOTE_IMPORTANTE (prix=${ts.price}, retrait=${retraitNum}, ecart=${Math.round(Math.abs(ecart)*100)}%)`);
      }
      // Écart retrait < prix dans la fourchette normale des frais → OK (pas signalé)
    }
  }

  const hasCritical = issues.some(i =>
    i.includes('ANNEE') || i.includes('ABERRANT') || (i.includes('INCOHERENT') && !['Edissimo'].includes(ts.name))
  );
  const status: QAFinding['status'] = hasCritical ? 'CRITIQUE'
    : json?.maximus_data_status === 'manual_review' || json?.maximus_data_status === 'partial_review' ? 'MANUAL_REVIEW'
    : issues.length > 0 ? 'ATTENTION'
    : 'OK';

  const sectSomme = sectorsEff.reduce((s, e) => s + (e.value || 0), 0);
  const geoSomme  = geoEff.reduce((s, e) => s + (e.value || 0), 0);

  findings.push({
    id: ts.id,
    nom: ts.name,
    status,
    yieldEffectif: yieldEff,
    yieldSource: yieldSrc as 'json' | 'ts',
    price: ts.price,
    tof: tofEff,
    nbSecteurs: sectorsEff.length,
    secteursSomme: Math.round(sectSomme * 10) / 10,
    nbGeo: geoEff.length,
    geoSomme: Math.round(geoSomme * 10) / 10,
    capitalisation: ts.capitalization,
    source: json?.maximus_data_status ?? 'ancien_stock',
    issues,
  });
}

// ── Résumé ──────────────────────────────────────────────────────────────────
const nOk        = findings.filter(f => f.status === 'OK').length;
const nAttention = findings.filter(f => f.status === 'ATTENTION').length;
const nCritique  = findings.filter(f => f.status === 'CRITIQUE').length;
const nReview    = findings.filter(f => f.status === 'MANUAL_REVIEW').length;

console.log('\n' + '='.repeat(60));
console.log(`QA MAPPING SCPI — ${findings.length} SCPIs contrôlées`);
console.log('='.repeat(60));
console.log(`  OK           : ${nOk}`);
console.log(`  ATTENTION    : ${nAttention}`);
console.log(`  CRITIQUE     : ${nCritique}`);
console.log(`  MANUAL_REVIEW: ${nReview}`);

findings.filter(f => f.status !== 'OK').forEach(f => {
  console.log(`\n  [${f.status}] ${f.nom} (id=${f.id})`);
  console.log(`    yield=${f.yieldEffectif} (src=${f.yieldSource}), price=${f.price}, tof=${f.tof}`);
  console.log(`    secteurs: ${f.nbSecteurs} / somme=${f.secteursSomme}%`);
  console.log(`    geo: ${f.nbGeo} zones / somme=${f.geoSomme}%`);
  if (f.issues.length) console.log(`    issues: ${f.issues.join(' | ')}`);
});

// ── Export ──────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, '../data-import/qa_scpi_mapping_findings.json');
fs.writeFileSync(outPath, JSON.stringify(findings, null, 2), 'utf-8');
console.log(`\nExported to ${outPath}`);
