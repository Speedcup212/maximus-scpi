import type { Scpi } from '../types/scpi';
import { createSlugFromName } from './scpiSlugMapper';
import { selectSupabaseRest } from './supabaseRest';
import { isSubscriptionReconstitutionComparable, normalizeLiquidityBasis } from './certifiedLiquidity';

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

type LiquidityRow = {
  scpi_slug: string;
  liquidity_basis?: string | null;
  regime_changed?: boolean | null;
  parts_attente_retrait?: number | string | null;
  nombre_parts?: number | string | null;
};

type GateRow = {
  scpi_slug: string;
  reconstitution_gate?: string | null;
  market_signal_gate?: string | null;
};

const INDICATOR_SELECT = [
  'scpi_slug','nom','societe_gestion','annee_creation','td','tof','capitalisation',
  'prix_souscription','prix_reconstitution','prix_retrait','valeur_realisation',
  'frais_souscription','frais_gestion','srri','duree_detention_recommandee','endettement',
  'delai_jouissance','walt','walb','nombre_locataires','nombre_immeubles','nombre_parts',
  'repartition_sectorielle','repartition_geographique','collecte_nette','nb_cessions_trimestre',
  'distribution_par_part','versement_loyers','source_period','source_confidence','source_document',
  'source_url','qa_status','parts_attente_retrait','capital_type','updated_at',
].join(',');

const LIQUIDITY_SELECT = 'scpi_slug,liquidity_basis,regime_changed,parts_attente_retrait,nombre_parts';
const GATE_SELECT = 'scpi_slug,reconstitution_gate,market_signal_gate';

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

export function mergeScpiWithLiveIndicators(
  scpi: Scpi,
  row: IndicatorRow,
  liquidity?: LiquidityRow | null,
  gate?: GateRow | null,
): Scpi {
  const price = toNumber(row.prix_souscription) ?? scpi.price;
  const reconstitution = toNumber(row.prix_reconstitution) ?? scpi.valeurReconstitution;
  const liquidityBasis = normalizeLiquidityBasis(liquidity?.liquidity_basis, row.capital_type);
  const comparableDiscount = isSubscriptionReconstitutionComparable({
    capitalType: row.capital_type,
    liquidityBasis,
    liquidityRegimeChanged: liquidity?.regime_changed,
    reconstitutionGate: gate?.reconstitution_gate,
  });
  const liveDiscount = comparableDiscount ? calculateDiscount(price, reconstitution) : undefined;
  const certifiedWaiting = liquidityBasis === 'withdrawal_queue'
    ? toNumber(liquidity?.parts_attente_retrait ?? row.parts_attente_retrait)
    : undefined;
  const certifiedTotalParts = liquidityBasis === 'withdrawal_queue'
    ? toNumber(liquidity?.nombre_parts ?? row.nombre_parts)
    : toNumber(row.nombre_parts);
  const sectors = toRepartition(row.repartition_sectorielle);
  const geography = toRepartition(row.repartition_geographique);

  return {
    ...scpi,
    name: row.nom || scpi.name,
    company: row.societe_gestion || scpi.company,
    creation: toNumber(row.annee_creation) ?? scpi.creation,
    yield: toNumber(row.td) ?? scpi.yield,
    tof: toNumber(row.tof) ?? scpi.tof,
    capitalization: toNumber(row.capitalisation) !== undefined
      ? (toNumber(row.capitalisation) as number) * 1_000_000
      : scpi.capitalization,
    price,
    valeurReconstitution: reconstitution,
    valeurRetrait: toNumber(row.prix_retrait) ?? scpi.valeurRetrait,
    valeurRealisation: toNumber(row.valeur_realisation) ?? scpi.valeurRealisation,
    discount: liveDiscount ?? scpi.discount,
    discountQaStatus: comparableDiscount && liveDiscount !== undefined ? 'publishable' : 'manual_review',
    capitalType: row.capital_type || scpi.capitalType,
    liquidityBasis: liquidityBasis || scpi.liquidityBasis,
    liquidityRegimeChanged: Boolean(liquidity?.regime_changed),
    reconstitutionGate: gate?.reconstitution_gate || scpi.reconstitutionGate,
    fees: toNumber(row.frais_souscription) ?? scpi.fees,
    fraisGestion: toNumber(row.frais_gestion) ?? scpi.fraisGestion,
    profilRisque: toNumber(row.srri) ?? scpi.profilRisque,
    dureeDetentionRecommandee: toNumber(row.duree_detention_recommandee) ?? scpi.dureeDetentionRecommandee,
    debt: toNumber(row.endettement) ?? scpi.debt,
    delaiJouissance: toNumber(row.delai_jouissance) ?? scpi.delaiJouissance,
    walt: toNumber(row.walt) ?? scpi.walt,
    walb: toNumber(row.walb) ?? scpi.walb,
    nombreLocataires: toNumber(row.nombre_locataires) ?? scpi.nombreLocataires,
    nbImmeubles: toNumber(row.nombre_immeubles) ?? scpi.nbImmeubles,
    nbPartsTotal: certifiedTotalParts ?? scpi.nbPartsTotal,
    collecteNetteTrimestre: toNumber(row.collecte_nette) ?? scpi.collecteNetteTrimestre,
    nbCessionsTrimestre: toNumber(row.nb_cessions_trimestre) ?? scpi.nbCessionsTrimestre,
    distribution: toNumber(row.distribution_par_part) ?? scpi.distribution,
    versementLoyers: row.versement_loyers || scpi.versementLoyers,
    repartitionSector: sectors ?? scpi.repartitionSector,
    repartitionGeo: geography ?? scpi.repartitionGeo,
    partsAttenteRetrait: certifiedWaiting,
    hasWaitingShares: liquidityBasis === 'withdrawal_queue' && certifiedWaiting !== undefined
      ? certifiedWaiting > 0
      : undefined,
    periodeBulletinTrimestriel: row.source_period || scpi.periodeBulletinTrimestriel,
    maximusSourcePeriode: row.source_period || scpi.maximusSourcePeriode,
    maximusSourceDocument: row.source_document || scpi.maximusSourceDocument,
    maximusUpdateDate: row.updated_at || scpi.maximusUpdateDate,
    maximusDataStatus: row.qa_status || scpi.maximusDataStatus,
  };
}

const singleParams = (slug: string, select: string) => new URLSearchParams({
  select,
  scpi_slug: `eq.${slug}`,
  limit: '1',
});

export async function getLiveScpiData(scpi: Scpi): Promise<Scpi> {
  const slug = createSlugFromName(scpi.name);

  try {
    const [rows, liquidityRows, gateRows] = await Promise.all([
      selectSupabaseRest<IndicatorRow>('scpi_indicators', singleParams(slug, INDICATOR_SELECT), { cacheTtlMs: 5 * 60 * 1000 }),
      selectSupabaseRest<LiquidityRow>('scpi_trajectory_pilot_liquidity', singleParams(slug, LIQUIDITY_SELECT), { cacheTtlMs: 5 * 60 * 1000 }),
      selectSupabaseRest<GateRow>('scpi_trajectory_signal_gate', singleParams(slug, GATE_SELECT), { cacheTtlMs: 5 * 60 * 1000 }),
    ]);
    return rows[0] ? mergeScpiWithLiveIndicators(scpi, rows[0], liquidityRows[0], gateRows[0]) : scpi;
  } catch {
    return scpi;
  }
}

export async function getLiveScpiDataBatch(scpiList: Scpi[]): Promise<Scpi[]> {
  if (scpiList.length === 0) return scpiList;

  const slugs = scpiList.map((scpi) => createSlugFromName(scpi.name));
  const indicatorParams = new URLSearchParams({ select: INDICATOR_SELECT, scpi_slug: `in.(${slugs.join(',')})` });
  const liquidityParams = new URLSearchParams({ select: LIQUIDITY_SELECT, scpi_slug: `in.(${slugs.join(',')})` });
  const gateParams = new URLSearchParams({ select: GATE_SELECT, scpi_slug: `in.(${slugs.join(',')})` });

  try {
    const [data, liquidityData, gateData] = await Promise.all([
      selectSupabaseRest<IndicatorRow>('scpi_indicators', indicatorParams, { cacheTtlMs: 5 * 60 * 1000, deferMs: 350 }),
      selectSupabaseRest<LiquidityRow>('scpi_trajectory_pilot_liquidity', liquidityParams, { cacheTtlMs: 5 * 60 * 1000, deferMs: 350 }),
      selectSupabaseRest<GateRow>('scpi_trajectory_signal_gate', gateParams, { cacheTtlMs: 5 * 60 * 1000, deferMs: 350 }),
    ]);

    if (data.length === 0) return scpiList;

    const bySlug = new Map(data.map((row) => [row.scpi_slug, row]));
    const liquidityBySlug = new Map(liquidityData.map((row) => [row.scpi_slug, row]));
    const gateBySlug = new Map(gateData.map((row) => [row.scpi_slug, row]));

    return scpiList.map((scpi) => {
      const slug = createSlugFromName(scpi.name);
      const row = bySlug.get(slug);
      return row ? mergeScpiWithLiveIndicators(scpi, row, liquidityBySlug.get(slug), gateBySlug.get(slug)) : scpi;
    });
  } catch {
    return scpiList;
  }
}
