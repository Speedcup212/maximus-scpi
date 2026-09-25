import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

const { data, error } = await client
  .from('scpi_indicators')
  .select('*')
  .limit(5000);

if (error) {
  console.error('[SCPI catalog] Lecture Supabase impossible :', error.message);
  process.exit(1);
}

const bySlug = new Map((data || []).map((row: any) => [row.scpi_slug, row]));

const assign = (target: Record<string, any>, key: string, value: unknown) => {
  if (value !== null && value !== undefined && value !== '') target[key] = value;
};

for (const scpi of catalog) {
  const row: any = bySlug.get(slugify(scpi['Nom SCPI']));
  if (!row) continue;

  assign(scpi, 'Taux de distribution (%)', row.td);
  assign(scpi, 'TOF (%)', row.tof);
  assign(scpi, 'TOP (%)', row.top);
  assign(scpi, 'Capitalisation (M€)', row.capitalisation);
  assign(scpi, 'Prix de souscription (€)', row.prix_souscription);
  assign(scpi, 'Valeur de reconstitution par part (€)', row.prix_reconstitution);
  assign(scpi, 'Valeur de retrait (€)', row.prix_retrait);
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
  assign(scpi, 'Date de mise à jour', row.updated_at);

  if (row.repartition_sectorielle && typeof row.repartition_sectorielle === 'object') {
    scpi['Répartition Sectorielle JSON'] = row.repartition_sectorielle;
  }
  if (row.repartition_geographique && typeof row.repartition_geographique === 'object') {
    scpi['Répartition Géographique JSON'] = row.repartition_geographique;
  }

  const price = Number(row.prix_souscription);
  const reconstitution = Number(row.prix_reconstitution);
  if (Number.isFinite(price) && Number.isFinite(reconstitution) && reconstitution > 0) {
    scpi['Surcote/décote (%)'] = ((price - reconstitution) / reconstitution) * 100;
    scpi['Décote/Surcote QA'] = 'publishable';
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
console.log(`[SCPI catalog] ${bySlug.size} lignes live superposées avant build.`);
