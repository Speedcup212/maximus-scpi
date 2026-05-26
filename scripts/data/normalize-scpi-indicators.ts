/**
 * Agent 03 — Data SCPI
 * Normalise les données brutes collectées vers le format ScpiIndicator.
 * Règle source_origin :
 *   - Si distribution_rate provient du bulletin → official_document
 *   - Sinon → legacy_dataset (le TD est l'indicateur clé)
 * Règle data_status :
 *   - verified  uniquement si distribution_rate = official_document
 *   - to_verify sinon
 */

import { RawScpiData } from './collect-scpi-indicators';
import { ScpiIndicator, DataStatus, DocumentType, SourceOrigin } from '../../src/types/scpiIndicator';

const EXTRACTION_DATE = new Date().toISOString().split('T')[0];

const SOURCE_URLS: Record<string, string> = {
  activimmo: 'https://alderan.fr',
  comete: 'https://alderan.fr',
  'iroko-zen': 'https://iroko.eu',
  'remake-live': 'https://remake-am.com',
  'transitions-europe': 'https://arkeaim.com',
};

const CATEGORIES: Record<string, string> = {
  activimmo: 'Logistique et activités',
  comete: 'Diversifié européen',
  'iroko-zen': 'Diversifié européen',
  'remake-live': 'Diversifié européen',
  'transitions-europe': 'Diversifié européen',
};

const STRATEGIES: Record<string, string> = {
  activimmo: 'SCPI spécialisée logistique urbaine et entrepôts. Stratégie pan-européenne axée sur la durabilité, label ISR.',
  comete: 'SCPI diversifiée européenne à haute rentabilité. Stratégie opportuniste multi-pays.',
  'iroko-zen': 'SCPI zéro frais de souscription, diversifiée multi-secteurs et multi-pays. Délai de jouissance 1 mois.',
  'remake-live': 'SCPI zéro frais, diversifiée multi-secteurs en Europe. Positionnement sur actifs à forte valeur ajoutée ESG.',
  'transitions-europe': 'SCPI 100% européenne hors France, axée sur la transition énergétique et durable. Label ISR renouvelé.',
};

function pickValue(
  bulletin: Record<string, unknown> | null,
  mainFile: Record<string, unknown>,
  bulletinKey: string,
  mainKey: string,
): { value: number | null; fromBulletin: boolean } {
  const bulletinVal = bulletin?.[bulletinKey];
  if (bulletinVal !== null && bulletinVal !== undefined) {
    return { value: bulletinVal as number, fromBulletin: true };
  }
  const mainVal = mainFile[mainKey];
  if (mainVal !== null && mainVal !== undefined && mainVal !== '') {
    return { value: mainVal as number, fromBulletin: false };
  }
  return { value: null, fromBulletin: false };
}

function parseRecord(v: unknown): Record<string, number> | null {
  if (typeof v === 'object' && v !== null) return v as Record<string, number>;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return null; }
  }
  return null;
}

export function normalizeIndicator(raw: RawScpiData): ScpiIndicator {
  const m = raw.fromMainFile;
  const b = raw.fromBulletin;

  const td = pickValue(b, m, 'tauxDistribution', 'Taux de distribution (%)');
  const prix = pickValue(b, m, 'prixPart', 'Prix de souscription (€)');
  const capi = pickValue(b, m, 'capitalisation', 'Capitalisation (M€)');
  const tof = pickValue(b, m, 'tof', 'TOF (%)');
  const reconst = pickValue(b, m, 'valeurReconstitution', 'Valeur de reconstitution (€)');
  const decote = pickValue(b, m, 'decoteSurcote', 'Surcote/décote (%)');
  const dette = pickValue(b, m, 'endettement', 'Endettement (%)');
  const frais = pickValue(null, m, '', 'Frais de souscription (TTC/%)');
  const fraisGestion = pickValue(null, m, '', 'Frais de gestion (HT/%)');
  const delai = pickValue(null, m, '', 'Délai de jouissance (mois)');

  const sectorBreakdown =
    parseRecord(b?.['repartitionSectorielle']) ??
    parseRecord(m['Répartition Sectorielle JSON']) ??
    null;
  const geoBreakdown =
    parseRecord(b?.['repartitionGeographique']) ??
    parseRecord(m['Répartition Géographique JSON']) ??
    null;

  // distribution_rate est l'indicateur clé : détermine source_origin + data_status
  const tdIsOfficial = td.fromBulletin;
  const sourceOrigin: SourceOrigin = tdIsOfficial ? 'official_document' : 'legacy_dataset';
  const dataStatus: DataStatus = tdIsOfficial ? 'verified' : 'to_verify';

  const legacyFields: string[] = [];
  if (!td.fromBulletin && td.value !== null) legacyFields.push('distribution_rate');
  if (!prix.fromBulletin) legacyFields.push('share_price');
  if (!frais.fromBulletin) legacyFields.push('subscription_fees');
  if (!delai.fromBulletin) legacyFields.push('enjoyment_delay');

  const hasBulletin = b !== null;
  const docType: DocumentType = hasBulletin ? 'bulletin_trimestriel' : 'donnees_internes';

  const officialFields = raw.fieldProvenance.filter(p => p.origin === 'official_document').length;
  const totalFields = raw.fieldProvenance.length;
  const bulletinCoverage = totalFields > 0 ? officialFields / totalFields : 0;
  const confidenceBase = tdIsOfficial ? 0.90 : (bulletinCoverage > 0.5 ? 0.82 : 0.72);

  const registryUrl = raw.registryEntry?.official_scpi_page_url ?? SOURCE_URLS[raw.slug] ?? null;

  const warnings: string[] = [];
  if (!td.fromBulletin) warnings.push(`Taux de distribution issu de scpi_complet.json (non confirmé dans le bulletin).`);
  if (raw.collectStatus === 'legacy_only') warnings.push('Aucun bulletin officiel disponible — toutes les données sont legacy.');
  if (raw.registryEntry?.official_scpi_page_url == null) warnings.push('URL source officielle non renseignée dans le registre.');

  return {
    slug: raw.slug,
    name: raw.name,
    management_company: String(m['Société de gestion'] ?? ''),
    category: CATEGORIES[raw.slug] ?? 'Diversifié',
    strategy_summary: STRATEGIES[raw.slug] ?? '',

    distribution_rate: td.value,
    distribution_year: tdIsOfficial ? 2025 : 2024,
    share_price: prix.value,
    capitalization: capi.value,
    tof: tof.value,
    occupancy_rate: tof.value,
    subscription_fees: frais.value,
    management_fees: fraisGestion.value,
    enjoyment_delay: delai.value,
    reconstitution_value: reconst.value,
    discount_premium: decote.value,
    debt_ratio: dette.value,
    ran: null,
    tri_5y: null,
    tri_10y: null,

    main_sector: sectorBreakdown
      ? Object.entries(sectorBreakdown).sort((a, bv) => bv[1] - a[1])[0]?.[0] ?? null
      : null,
    sector_breakdown: sectorBreakdown,
    main_geography: geoBreakdown
      ? Object.entries(geoBreakdown).sort((a, bv) => bv[1] - a[1])[0]?.[0] ?? null
      : null,
    geography_breakdown: geoBreakdown,

    source_url: registryUrl,
    source_document_type: docType,
    source_publication_date: null,
    extraction_date: EXTRACTION_DATE,
    confidence_score: Math.round(confidenceBase * 100) / 100,
    data_status: dataStatus,
    source_origin: sourceOrigin,
    legacy_fields: legacyFields.length > 0 ? legacyFields : undefined,

    requires_manual_review: dataStatus === 'to_verify',
    warning: warnings.length > 0 ? warnings.join(' ') : null,
  };
}

export function normalizeAll(raws: RawScpiData[]): ScpiIndicator[] {
  return raws.map(normalizeIndicator);
}
