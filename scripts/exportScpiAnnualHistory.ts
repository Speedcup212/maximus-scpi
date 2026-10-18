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
const [annuals, auditedYears, readiness] = await Promise.all([
  db.from('scpi_annual_fundamentals_certified')
    .select('scpi_slug,fiscal_year,distribution_totale_par_part,valeur_realisation_par_part,valeur_reconstitution_par_part,qa_status,source_confidence,source_url,evidence')
    .limit(5000),
  db.from('scpi_history_year_audit_v1').select('scpi_slug,fiscal_year,all_three_verified').eq('all_three_verified', true).limit(5000),
  db.from('scpi_history_readiness_v1')
    .select('scpi_slug,years_expected,years_fully_verified,metrics_missing,historical_status,core_historical_ready')
    .limit(5000),
]);
if (annuals.error || auditedYears.error || readiness.error) {
  fail([annuals.error?.message,auditedYears.error?.message,readiness.error?.message].filter(Boolean).join(' | '));
}
const verified = new Set((auditedYears.data || []).map((r: any) => r.scpi_slug + ':' + r.fiscal_year));
const readNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const rows = (annuals.data || []).filter((r: any) => allowed.has(r.scpi_slug) &&
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
const coverage = (readiness.data || []).filter((r: any) => allowed.has(r.scpi_slug))
  .map((r: any) => ({
    scpi_slug: r.scpi_slug,
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
