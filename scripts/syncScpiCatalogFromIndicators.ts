import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { buildScpiEditorialNews } from '../src/utils/scpiNewsRecord.mjs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[SCPI catalog] Supabase non configuré : catalogue local conservé.');
  process.exit(0);
}

const catalogPath = path.resolve(process.cwd(), 'src/data/scpi_complet.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as Record<string, any>[];

const slugify = (value: string) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const client = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});


const historyKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const historyClient = historyKey
  ? createClient(supabaseUrl, historyKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const [{ data, error }, { data: analysisData, error: analysisError }, { data: bulletinData, error: bulletinError }, { data: retraitProofs, error: retraitError }] = await Promise.all([
  client.from('scpi_indicators').select('*').limit(5000),
  client
    .from('scpi_bulletin_analysis')
    .select('scpi_slug,certification_status,current_source_certified,structural_event_detected,current_period,current_snapshot,certified_source_url')
    .limit(5000),
  client.from('scpi_bulletins').select('id,scpi_slug,period,source_url,extraction_json').limit(5000),
  historyClient
    ? historyClient.from('scpi_metric_certifications')
        .select('scpi_slug,source_period,metric,value_numeric,source_url,source_page,verification_status')
        .eq('metric','prix_retrait').eq('source_period','2026-T2')
        .eq('verification_status','manual_verified_official').limit(5000)
    : Promise.resolve({ data: [], error: null }),
]);

if (error) {
  console.error('[SCPI catalog] Lecture Supabase impossible :', error.message);
  process.exit(1);
}
if (analysisError) {
  console.error('[SCPI catalog] Lecture certification impossible :', analysisError.message);
  process.exit(1);
}
if (bulletinError) {
  console.error('[SCPI catalog] Lecture des preuves éditoriales impossible :', bulletinError.message);
  process.exit(1);
}
if (retraitError) {
  console.error('[SCPI catalog] Lecture des certifications de retrait impossible :', retraitError.message);
  process.exit(1);
}

const bySlug = new Map((data || []).map((row: any) => [row.scpi_slug, row]));
const certificationBySlug = new Map((analysisData || []).map((row: any) => [row.scpi_slug, row]));
const bulletinById = new Map((bulletinData || []).map((row: any) => [row.id, row]));
const retraitBySlug = new Map((retraitProofs || []).map((row: any) => [row.scpi_slug,row]));
// Le registre historique est privé : le consulter uniquement avec la clé serveur.
// Ne JAMAIS assimiler une QA courante à une certification depuis la création.

const historyRead = historyClient
  ? await historyClient.from('scpi_history_readiness_v1')
    .select('scpi_slug,start_year_status,years_expected,years_fully_verified,years_documented,metrics_missing,historical_status,core_historical_ready')
    .limit(5000)
  : null;
if (historyRead?.error && process.env.REQUIRE_HISTORY_READINESS === 'true') {
  console.error('[SCPI history] Registre de complétude inaccessible :', historyRead.error.message);
  process.exit(1);
}
if (!historyClient && process.env.REQUIRE_HISTORY_READINESS === 'true') {
  console.error('[SCPI history] Clé serveur absente : aucun statut historique ne peut être certifié.');
  process.exit(1);
}
const historyBySlug = new Map((historyRead?.data || []).map((row: any) => [row.scpi_slug, row]));
let editorialSummaries = 0;

const assign = (target: Record<string, any>, key: string, value: unknown) => {
  if (value !== null && value !== undefined && value !== '') target[key] = value;
};

const isManualVerified = (status: unknown) => /^manual_verified/i.test(String(status || ''));

for (const scpi of catalog) {
  const slug = slugify(scpi['Nom SCPI']);
  const row: any = bySlug.get(slug);
  const certification: any = certificationBySlug.get(slug);
  const bulletin = bulletinById.get(certification?.current_snapshot?.bulletin_id);
  // Replace the whole editorial record together; never combine legacy text with
  // the current metrics' period, source or technical update timestamp.
  scpi.maximus_editorial_news = buildScpiEditorialNews(certification, bulletin);
  if (scpi.maximus_editorial_news) editorialSummaries++;
  // Publier un statut séparé, jamais PASS_100 par propagation des données courantes.
  const h: any = historyBySlug.get(slug);
  scpi.maximus_history_status = h?.historical_status || 'NOT_ASSESSED';
  scpi.maximus_history_start_year_status = h?.start_year_status || 'missing';
  scpi.maximus_history_years_expected = h?.years_expected ?? null;
  scpi.maximus_history_years_verified = h?.years_fully_verified ?? null;
  scpi.maximus_history_years_documented = h?.years_documented ?? null;
  scpi.maximus_history_metrics_missing = h?.metrics_missing ?? null;
  scpi.maximus_history_core_ready = h?.core_historical_ready === true;
  if (!row) continue;

  assign(scpi, 'Taux de distribution (%)', row.td);
  assign(scpi, 'TOF (%)', row.tof);
  assign(scpi, 'TOP (%)', row.top);
  assign(scpi, 'Capitalisation (M€)', row.capitalisation);
  assign(scpi, 'Prix de souscription (€)', row.prix_souscription);
  assign(scpi, 'Valeur de reconstitution par part (€)', row.prix_reconstitution);
  assign(scpi, 'Valeur de retrait (€)', row.prix_retrait);
  // Documentation du prix de retrait, à la source et période qui lui sont propres.
  // La présence de frais de souscription ne suffit pas à certifier une valeur de retrait.
  const retraitProof: any = retraitBySlug.get(slug);
  if (row.prix_retrait !== null && row.prix_retrait !== undefined &&
      retraitProof && Number(retraitProof.value_numeric) === Number(row.prix_retrait) &&
      Number(retraitProof.source_page) > 0 && /^https:\/\//.test(String(retraitProof.source_url))) {
    scpi.maximus_prix_retrait_source_url = retraitProof.source_url;
    scpi.maximus_prix_retrait_source_page = retraitProof.source_page;
    scpi.maximus_prix_retrait_reference_period = retraitProof.source_period;
    scpi.maximus_prix_retrait_definition =
      'Prix de retrait par compensation, sans garantie de délai ni de remboursement ; valeur susceptible de varier selon les conditions contractuelles.';
  } else {
    delete scpi.maximus_prix_retrait_source_url;
    delete scpi.maximus_prix_retrait_source_page;
    delete scpi.maximus_prix_retrait_reference_period;
    delete scpi.maximus_prix_retrait_definition;
  }
  assign(scpi, 'Valeur de réalisation (€)', row.valeur_realisation);
  assign(scpi, 'Frais de souscription (TTC/%)', row.frais_souscription);
  assign(scpi, 'Frais de gestion (HT/%)', row.frais_gestion);
  assign(scpi, 'Endettement (%)', row.endettement);
  assign(scpi, 'Délai de jouissance (mois)', row.delai_jouissance);
  assign(scpi, 'WALT', row.walt);
  assign(scpi, 'WALB', row.walb);
  assign(scpi, 'Nombre de locataires', row.nombre_locataires);
  assign(scpi, "Nombre d'immeubles", row.nombre_immeubles);
  assign(scpi, 'Nombre de parts', row.nombre_parts);
  assign(scpi, 'Collecte nette trimestre', row.collecte_nette);
  assign(scpi, 'Nombre de cessions trimestre', row.nb_cessions_trimestre);
  assign(scpi, 'Distribution (€/part)', row.distribution_par_part);
  assign(scpi, 'Parts en attente de retrait', row.parts_attente_retrait);
  assign(scpi, 'Période bulletin trimestriel', row.source_period);
  assign(scpi, 'maximus_source_periode', row.source_period);
  assign(scpi, 'maximus_source_document', row.source_document);
  assign(scpi, 'maximus_data_status', row.qa_status);
  assign(scpi, 'maximus_certification_status', certification?.certification_status);
  assign(scpi, 'Date de mise à jour', row.updated_at);

  if (row.repartition_sectorielle && typeof row.repartition_sectorielle === 'object') {
    scpi['Répartition Sectorielle JSON'] = row.repartition_sectorielle;
  }
  if (row.repartition_geographique && typeof row.repartition_geographique === 'object') {
    scpi['Répartition Géographique JSON'] = row.repartition_geographique;
  }

  const price = Number(row.prix_souscription);
  const reconstitution = Number(row.prix_reconstitution);
  const valuesPresent = Number.isFinite(price) && Number.isFinite(reconstitution) && reconstitution > 0;
  const priceSemanticsCertified =
    valuesPresent &&
    isManualVerified(row.qa_status) &&
    certification?.current_source_certified === true &&
    certification?.structural_event_detected !== true &&
    String(row.capital_type || '').toLowerCase() === 'variable';

  if (valuesPresent) {
    scpi['Surcote/décote (%)'] = ((price - reconstitution) / reconstitution) * 100;
  }
  scpi['Décote/Surcote QA'] = priceSemanticsCertified ? 'publishable' : 'manual_review';
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
console.log(`[SCPI catalog] ${bySlug.size} lignes live superposées avant build ; ${editorialSummaries} résumés factuels avec preuve PDF, période et date concordantes ; décote/surcote publiée uniquement après certification sémantique manuelle.`);
