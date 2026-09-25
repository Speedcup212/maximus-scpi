import { supabase } from '../lib/supabase';
import type { Scpi } from '../types/scpi';
import { createSlugFromName } from './scpiSlugMapper';

type IndicatorRow = {
  scpi_slug: string;
  nom?: string | null;
  societe_gestion?: string | null;
  annee_creation?: number | string | null;
  td?: number | string | null;
  tof?: number | string | null;
  capitalisation?: number | string | null;
  prix_souscription?: number | string | null;
  prix_reconstitution?: number | string | null;
  prix_retrait?: number | string | null;
  valeur_realisation?: number | string | null;
  frais_souscription?: number | string | null;
  frais_gestion?: number | string | null;
  srri?: number | string | null;
  duree_detention_recommandee?: number | string | null;
  endettement?: number | string | null;
  delai_jouissance?: number | string | null;
  walt?: number | string | null;
  walb?: number | string | null;
  nombre_locataires?: number | string | null;
  nombre_immeubles?: number | string | null;
  nombre_parts?: number | string | null;
  repartition_sectorielle?: Record<string, number | string> | null;
  repartition_geographique?: Record<string, number | string> | null;
  collecte_nette?: number | string | null;
  nb_cessions_trimestre?: number | string | null;
  distribution_par_part?: number | string | null;
  versement_loyers?: string | null;
  source_period?: string | null;
  source_confidence?: number | string | null;
  source_document?: string | null;
  source_url?: string | null;
  qa_status?: string | null;
  parts_attente_retrait?: number | string | null;
  capital_type?: string | null;
  updated_at?: string | null;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const toRepartition = (
  value: Record<string, number | string> | null | undefined,
): Array<{ name: string; value: number }> | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const items = Object.entries(value)
    .map(([name, raw]) => ({ name, value: toNumber(raw) }))
    .filter((item): item is { name: string; value: number } => item.value !== undefined);
  return items.length > 0 ? items : undefined;
};

const calculateDiscount = (
  price: number | undefined,
  reconstitution: number | undefined,
): number | undefined => {
  if (!price || !reconstitution || reconstitution <= 0) return undefined;
  return ((price - reconstitution) / reconstitution) * 100;
};

export function mergeScpiWithLiveIndicators(scpi: Scpi, row: IndicatorRow): Scpi {
  const price = toNumber(row.prix_souscription) ?? scpi.price;
  const reconstitution = toNumber(row.prix_reconstitution) ?? scpi.valeurReconstitution;
  const liveDiscount = calculateDiscount(price, reconstitution);
  const waiting = toNumber(row.parts_attente_retrait);
  const sectors = toRepartition(row.repartition_sectorielle);
  const geography = toRepartition(row.repartition_geographique);

  return {
    ...scpi,
    name: row.nom || scpi.name,
    company: row.societe_gestion || scpi.company,
    creation: toNumber(row.annee_creation) ?? scpi.creation,
    yield: toNumber(row.td) ?? scpi.yield,
    tof: toNumber(row.tof) ?? scpi.tof,
    capitalization:
      toNumber(row.capitalisation) !== undefined
        ? (toNumber(row.capitalisation) as number) * 1_000_000
        : scpi.capitalization,
    price,
    valeurReconstitution: reconstitution,
    valeurRetrait: toNumber(row.prix_retrait) ?? scpi.valeurRetrait,
    valeurRealisation: toNumber(row.valeur_realisation) ?? scpi.valeurRealisation,
    discount: liveDiscount ?? scpi.discount,
    discountQaStatus: liveDiscount !== undefined ? 'publishable' : scpi.discountQaStatus,
    fees: toNumber(row.frais_souscription) ?? scpi.fees,
    fraisGestion: toNumber(row.frais_gestion) ?? scpi.fraisGestion,
    profilRisque: toNumber(row.srri) ?? scpi.profilRisque,
    dureeDetentionRecommandee:
      toNumber(row.duree_detention_recommandee) ?? scpi.dureeDetentionRecommandee,
    debt: toNumber(row.endettement) ?? scpi.debt,
    delaiJouissance: toNumber(row.delai_jouissance) ?? scpi.delaiJouissance,
    walt: toNumber(row.walt) ?? scpi.walt,
    walb: toNumber(row.walb) ?? scpi.walb,
    nombreLocataires: toNumber(row.nombre_locataires) ?? scpi.nombreLocataires,
    nbImmeubles: toNumber(row.nombre_immeubles) ?? scpi.nbImmeubles,
    nbPartsTotal: toNumber(row.nombre_parts) ?? scpi.nbPartsTotal,
    collecteNetteTrimestre: toNumber(row.collecte_nette) ?? scpi.collecteNetteTrimestre,
    nbCessionsTrimestre:
      toNumber(row.nb_cessions_trimestre) ?? scpi.nbCessionsTrimestre,
    distribution: toNumber(row.distribution_par_part) ?? scpi.distribution,
    versementLoyers: row.versement_loyers || scpi.versementLoyers,
    repartitionSector: sectors ?? scpi.repartitionSector,
    repartitionGeo: geography ?? scpi.repartitionGeo,
    partsAttenteRetrait: waiting ?? scpi.partsAttenteRetrait,
    hasWaitingShares: waiting !== undefined ? waiting > 0 : scpi.hasWaitingShares,
    periodeBulletinTrimestriel: row.source_period || scpi.periodeBulletinTrimestriel,
    maximusSourcePeriode: row.source_period || scpi.maximusSourcePeriode,
    maximusSourceDocument: row.source_document || scpi.maximusSourceDocument,
    maximusUpdateDate: row.updated_at || scpi.maximusUpdateDate,
    maximusDataStatus: row.qa_status || scpi.maximusDataStatus,
  };
}

export async function getLiveScpiData(scpi: Scpi): Promise<Scpi> {
  if (!supabase) return scpi;
  const slug = createSlugFromName(scpi.name);

  const { data, error } = await supabase
    .from('scpi_indicators')
    .select('*')
    .eq('scpi_slug', slug)
    .maybeSingle();

  if (error || !data) return scpi;
  return mergeScpiWithLiveIndicators(scpi, data as IndicatorRow);
}

export async function getLiveScpiDataBatch(scpiList: Scpi[]): Promise<Scpi[]> {
  if (!supabase || scpiList.length === 0) return scpiList;

  const slugs = scpiList.map((scpi) => createSlugFromName(scpi.name));
  const { data, error } = await supabase
    .from('scpi_indicators')
    .select('*')
    .in('scpi_slug', slugs);

  if (error || !data || data.length === 0) return scpiList;

  const bySlug = new Map(
    (data as IndicatorRow[]).map((row) => [row.scpi_slug, row]),
  );

  return scpiList.map((scpi) => {
    const row = bySlug.get(createSlugFromName(scpi.name));
    return row ? mergeScpiWithLiveIndicators(scpi, row) : scpi;
  });
}
