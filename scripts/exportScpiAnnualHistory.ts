import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/scpiAnnualHistory.json');
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const required = process.env.REQUIRE_HISTORY_READINESS === 'true';
const fail = (message: string): never => { throw new Error('[annual-history] ' + message); };
if (!url || !key) {
  if (required) fail('La clé serveur est obligatoire pour exporter les exercices certifiés.');
  console.log('[annual-history] Connexion serveur absente : snapshot statique conservé sans certification nouvelle.');
  process.exit(0);
}
const catalog = JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/certified_scpi_cohort.json'), 'utf8'));
const allowed = new Set<string>((catalog.slugs || []).map(String));
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
// Pagination explicite : éviter les 1000 lignes par défaut et les séries tronquées
// lorsque le catalogue passera des 65 SCPI actuelles à 225+.
const fetchPaged = async (table: string, select: string, orderColumns: string[], filter?: (q: any) => any) => {
  const result: any[] = [];
  const size = 800;
  for (let start = 0; start < 50000; start += size) {
    let query: any = db.from(table).select(select);
    if (filter) query = filter(query);
    for (const column of orderColumns) query = query.order(column, { ascending: true });
    const page = await query.range(start, start + size - 1);
    if (page.error) fail(table + ' : ' + page.error.message);
    const items = page.data || [];
    result.push(...items);
    if (items.length < size) return result;
  }
  fail(table + ' : plus de 50 000 lignes, pagination à redimensionner');
};
const [annualRecords, auditedYearRecords, readinessRecords, yearScopes] = await Promise.all([
  fetchPaged('scpi_annual_fundamentals_certified',
    'scpi_slug,fiscal_year,distribution_totale_par_part,valeur_realisation_par_part,valeur_reconstitution_par_part,qa_status,source_confidence,source_url,evidence',
    ['scpi_slug','fiscal_year']),
  fetchPaged('scpi_history_year_audit_v1',
    'scpi_slug,fiscal_year,all_three_verified', ['scpi_slug','fiscal_year'],
    (query: any) => query.eq('all_three_verified', true)),
  fetchPaged('scpi_history_readiness_v1',
    'scpi_slug,years_expected,years_fully_verified,metrics_missing,historical_status,core_historical_ready',
    ['scpi_slug']),
  fetchPaged('scpi_history_scope',
    'scpi_slug,start_year,first_fiscal_year,first_fiscal_year_evidence', ['scpi_slug']),
]);
const yearScopeBySlug = new Map(yearScopes.map((r: any) => [r.scpi_slug, r]));
const verified = new Set(auditedYearRecords.map((r: any) => r.scpi_slug + ':' + r.fiscal_year));
const readNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const rows = annualRecords.filter((r: any) => allowed.has(r.scpi_slug) &&
  verified.has(r.scpi_slug + ':' + r.fiscal_year))
  .map((r: any) => {
    const d = readNum(r.distribution_totale_par_part);
    const real = readNum(r.valeur_realisation_par_part);
    const recon = readNum(r.valeur_reconstitution_par_part);
    const ev = r.evidence || {};
    const keys = ['distribution_totale_par_part','valeur_realisation_par_part','valeur_reconstitution_par_part'];
    const values = [d, real, recon];
    if (r.qa_status !== 'manual_verified_official' || (readNum(r.source_confidence) ?? 0) < 0.95 ||
      !/^https:\/\//.test(String(r.source_url || ''))) {
      fail('QA/source non certifiée ' + r.scpi_slug + '/' + r.fiscal_year);
    }
    if (ev.distribution_totale_par_part?.editorial_discrepancy_eur_per_share != null &&
      (!ev.distribution_totale_par_part.arbitration ||
       (ev.distribution_totale_par_part.crosscheck_urls || []).length < 2)) {
      fail('Arbitrage financier insuffisant : ' + r.scpi_slug + '/' + r.fiscal_year);
    }
    keys.forEach((key, i) => {
      if (values[i] === null || !(Number(ev[key]?.page) > 0) ||
        (ev[key]?.fiscal_year_column != null && Number(ev[key].fiscal_year_column) !== Number(r.fiscal_year)) ||
        (ev[key]?.value != null && Math.abs(Number(ev[key].value) - values[i]!) > 0.001)) {
        fail('Preuve de colonne invalide : ' + r.scpi_slug + '/' + r.fiscal_year + '/' + key);
      }
    });
    return {
      scpi_slug: r.scpi_slug,
      fiscal_year: Number(r.fiscal_year),
      distribution_totale_par_part: d,
      valeur_realisation_par_part: real,
      valeur_reconstitution_par_part: recon,
      distribution_basis: String(ev.distribution_totale_par_part?.basis || 'gross_annual_distribution'),
      distribution_arbitration: ev.distribution_totale_par_part?.arbitration || null,
      source_url: r.source_url,
      evidence_pages: {
        distribution: Number(ev.distribution_totale_par_part.page),
        realisation: Number(ev.valeur_realisation_par_part.page),
        reconstitution: Number(ev.valeur_reconstitution_par_part.page),
      },
    };
  })
  .sort((a: any,b: any) => a.scpi_slug.localeCompare(b.scpi_slug,'fr') || a.fiscal_year-b.fiscal_year);
const uniq = new Set(rows.map((r: any) => r.scpi_slug + ':' + r.fiscal_year));
if (uniq.size !== rows.length) fail('Deux exercices annuels identiques.');
const coverage = readinessRecords.filter((r: any) => allowed.has(r.scpi_slug))
  .map((r: any) => ({
    scpi_slug: r.scpi_slug,
    launch_year: yearScopeBySlug.get(r.scpi_slug)?.start_year ?? null,
    first_fiscal_year: yearScopeBySlug.get(r.scpi_slug)?.first_fiscal_year ?? null,
    first_fiscal_year_note: yearScopeBySlug.get(r.scpi_slug)?.first_fiscal_year_evidence ?? null,
    years_expected: r.years_expected,
    years_fully_verified: r.years_fully_verified,
    metrics_missing: r.metrics_missing,
    historical_status: r.historical_status,
    core_historical_ready: r.core_historical_ready,
  }))
  .sort((a: any,b: any) => a.scpi_slug.localeCompare(b.scpi_slug,'fr'));
if (!coverage.length || !rows.length) fail('Aucune ligne certifiée exploitable : snapshot non remplacé.');
const output = { generated_at: new Date().toISOString(), source: 'Supabase annual fundamentals + evidence audit, service role build only', rows, coverage };
fs.writeFileSync(out, JSON.stringify(output,null,2) + '\n', 'utf8');
console.log('[annual-history] ' + rows.length + ' exercices vérifiés exportés pour ' +
  new Set(rows.map((r: any)=>r.scpi_slug)).size + ' SCPI, couverture détaillée ' + coverage.length + ' fonds.');
