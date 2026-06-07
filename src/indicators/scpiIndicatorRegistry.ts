import { Scpi } from '../types/scpi';
import { formatCurrency, formatPercentage } from '../utils/formatters';

/**
 * REGISTRE CENTRAL DES INDICATEURS SCPI
 * ------------------------------------------------------------------
 * Source unique de vérité pour la définition, la validation, la fraîcheur
 * et l'affichage de TOUS les indicateurs SCPI.
 *
 * Aucun composant ne doit lire les champs bruts d'un indicateur critique
 * directement : il doit passer par `resolveScpiIndicator(scpi, indicatorId)`
 * (voir src/indicators/resolveScpiIndicator.ts), qui s'appuie sur ce registre.
 *
 * Objectif : rendre l'affichage des indicateurs scalable et cohérent entre
 * carte comparateur, tableau, modale, fiche, sidebar et textes d'analyse.
 */

export type IndicatorType =
  | 'percent'
  | 'currency'
  | 'number'
  | 'text'
  | 'duration'
  | 'ratio';

export type IndicatorCriticality = 'critical' | 'important' | 'secondary';

export type IndicatorId =
  | 'prix_part'
  | 'investissement_minimum'
  | 'valeur_retrait'
  | 'valeur_reconstitution'
  | 'valeur_realisation'
  | 'decote_surcote'
  | 'taux_distribution'
  | 'tof'
  | 'top'
  | 'ran'
  | 'capitalisation'
  | 'collecte_nette'
  | 'endettement'
  | 'nombre_immeubles'
  | 'nombre_locataires'
  | 'surface'
  | 'walt'
  | 'walb'
  | 'delai_jouissance'
  | 'frais_souscription'
  | 'frais_gestion'
  | 'frequence_distribution'
  | 'secteur_principal'
  | 'geographie_principale'
  | 'sfdr'
  | 'sri'
  | 'report_a_nouveau'
  | 'parts_en_attente'
  | 'liquidite';

/**
 * Forme structurelle minimale acceptée par le registre/résolveur.
 * Couvre `Scpi` et `SCPIExtended` (champs nommés différemment) sans coupler
 * le registre aux fichiers data.
 */
export type ScpiLike = Partial<Scpi> & {
  reconstitutionValue?: number | null;
  capitalization?: number | string | null;
  [key: string]: unknown;
};

export interface IndicatorValidation {
  valid: boolean;
  /** Message court expliquant pourquoi la valeur est suspecte/invalide. */
  reason?: string;
}

export interface IndicatorDefinition {
  id: IndicatorId;
  label: string;
  unit: string;
  type: IndicatorType;
  criticality: IndicatorCriticality;
  /** Sources prioritaires (champs/origines) dans l'ordre de préférence. */
  sources: string[];
  /**
   * Règle de fraîcheur : âge maximal acceptable (en trimestres) avant de
   * signaler la donnée comme potentiellement périmée. `null` = non daté.
   */
  freshness: { maxAgeQuarters: number | null; periodField?: keyof Scpi };
  /** Lecture de la valeur brute depuis un objet SCPI (tous formats). */
  read: (scpi: ScpiLike) => number | string | null;
  /** Règle de validation métier de la valeur lue. */
  validate: (value: number | string | null, scpi: ScpiLike) => IndicatorValidation;
  /** Règle d'affichage : produit la chaîne lisible. */
  format: (value: number | string | null) => string;
  /** Valeur d'affichage de repli quand la donnée est absente/non fiable. */
  fallback: string;
  /** Surfaces front où l'indicateur est censé être utilisé (documentation/audit). */
  components: string[];
}

// --- Helpers de lecture (tolérants aux deux conventions de nommage) ---

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null;

/** Capitalisation : `Scpi.capitalization` est en € ; `SCPIExtended` peut être "121.9M€". */
const readCapitalisation = (scpi: ScpiLike): number | null => {
  const raw = scpi.capitalization;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const m = raw.replace(',', '.').match(/([\d.]+)\s*(Md|M)?/i);
    if (m) {
      const base = parseFloat(m[1]);
      if (Number.isFinite(base)) {
        const mult = /md/i.test(m[2] ?? '') ? 1e9 : /m/i.test(m[2] ?? '') ? 1e6 : 1;
        return base * mult;
      }
    }
  }
  return null;
};

/** Répartition dominante (secteur/géo) à partir d'un tableau {name,value}. */
const readDominant = (rep?: { name: string; value: number }[] | null): string | null => {
  if (!rep || rep.length === 0) return null;
  const top = [...rep].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  return top && top.name ? `${top.name} (${top.value}%)` : null;
};

// --- Formatteurs ---

const fmtCurrency = (v: number | string | null): string =>
  typeof v === 'number' ? formatCurrency(v) : 'N/A';
const fmtPercent = (v: number | string | null): string =>
  typeof v === 'number' ? formatPercentage(v) : 'N/A';
const fmtNumber = (v: number | string | null): string =>
  typeof v === 'number' ? v.toLocaleString('fr-FR') : 'N/A';
const fmtYears = (v: number | string | null): string =>
  typeof v === 'number' ? `${v.toLocaleString('fr-FR')} an${v >= 2 ? 's' : ''}` : 'N/A';
const fmtMonths = (v: number | string | null): string =>
  typeof v === 'number' ? `${v} mois` : 'N/A';
const fmtText = (v: number | string | null): string =>
  typeof v === 'string' && v.trim() !== '' ? v : 'N/A';

// --- Validateurs génériques ---

const inRange = (min: number, max: number) => (
  value: number | string | null
): IndicatorValidation => {
  if (typeof value !== 'number') return { valid: false, reason: 'valeur non numérique' };
  if (value < min || value > max)
    return { valid: false, reason: `hors plage attendue [${min} ; ${max}]` };
  return { valid: true };
};

const positive = (value: number | string | null): IndicatorValidation => {
  if (typeof value !== 'number') return { valid: false, reason: 'valeur non numérique' };
  if (!(value > 0)) return { valid: false, reason: 'valeur non strictement positive' };
  return { valid: true };
};

const nonEmptyText = (value: number | string | null): IndicatorValidation => {
  if (typeof value !== 'string' || value.trim() === '')
    return { valid: false, reason: 'texte absent' };
  return { valid: true };
};

/**
 * Définition de tous les indicateurs. L'ordre suit la liste métier de référence.
 */
export const SCPI_INDICATORS: Record<IndicatorId, IndicatorDefinition> = {
  prix_part: {
    id: 'prix_part',
    label: 'Prix de la part',
    unit: '€',
    type: 'currency',
    criticality: 'critical',
    sources: ['Prix de souscription (€)', 'scpi.price'],
    freshness: { maxAgeQuarters: 2, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.price),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiTable', 'ComparisonTable', 'AnalysisDetailModal', 'AnalysisModal', 'ScpiDetailPage', 'OptimizedScpiLandingPage', 'SelectionSidebar'],
  },
  investissement_minimum: {
    id: 'investissement_minimum',
    label: 'Investissement minimum',
    unit: '€',
    type: 'currency',
    criticality: 'important',
    sources: ['Minimum de souscription €', 'scpi.minInvest'],
    freshness: { maxAgeQuarters: null },
    read: (s) => num(s.minInvest),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal', 'OptimizedScpiLandingPage'],
  },
  valeur_retrait: {
    id: 'valeur_retrait',
    label: 'Valeur de retrait',
    unit: '€',
    type: 'currency',
    criticality: 'important',
    sources: ['Valeur de retrait (€)', 'scpi.valeurRetrait'],
    freshness: { maxAgeQuarters: 4, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.valeurRetrait),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal'],
  },
  valeur_reconstitution: {
    id: 'valeur_reconstitution',
    label: 'Valeur de reconstitution (par part)',
    unit: '€',
    type: 'currency',
    criticality: 'critical',
    sources: ['Valeur de reconstitution par part (€)', 'scpi.valeurReconstitution', 'scpi.reconstitutionValue'],
    freshness: { maxAgeQuarters: 4, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.valeurReconstitution ?? s.reconstitutionValue),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['AnalysisDetailModal', 'AnalysisModal', 'ScpiDetailPage', 'SelectionSidebar'],
  },
  valeur_realisation: {
    id: 'valeur_realisation',
    label: 'Valeur de réalisation',
    unit: '€',
    type: 'currency',
    criticality: 'secondary',
    sources: ['Valeur de réalisation (€)', 'scpi.valeurRealisation'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num(s.valeurRealisation),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  decote_surcote: {
    id: 'decote_surcote',
    label: 'Décote / Surcote',
    unit: '%',
    type: 'percent',
    criticality: 'critical',
    // Calculée, jamais lue brute : (prix affiché - VR affichée) / VR affichée × 100.
    sources: ['calc(prix, valeur_reconstitution)', 'qa: Décote/Surcote QA'],
    freshness: { maxAgeQuarters: 2, periodField: 'periodeBulletinTrimestriel' },
    // read renvoie null : la valeur est résolue spécifiquement dans resolveScpiIndicator.
    read: () => null,
    validate: inRange(-50, 50),
    format: fmtPercent,
    fallback: 'À vérifier',
    components: ['ScpiTable', 'ComparisonTable', 'AnalysisDetailModal', 'AnalysisModal', 'ScpiDetailPage', 'OptimizedScpiLandingPage', 'SelectionSidebar', 'scpiAnalysis'],
  },
  taux_distribution: {
    id: 'taux_distribution',
    label: 'Taux de distribution',
    unit: '%',
    type: 'percent',
    criticality: 'critical',
    sources: ['Taux de distribution (%)', 'scpi.yield'],
    freshness: { maxAgeQuarters: 4, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.yield),
    validate: inRange(0, 20),
    format: fmtPercent,
    fallback: 'N/A',
    components: ['ScpiTable', 'ComparisonTable', 'AnalysisDetailModal', 'AnalysisModal', 'ScpiDetailPage', 'OptimizedScpiLandingPage', 'scpiAnalysis'],
  },
  tof: {
    id: 'tof',
    label: "Taux d'occupation financier",
    unit: '%',
    type: 'percent',
    criticality: 'important',
    sources: ['TOF (%)', 'scpi.tof'],
    freshness: { maxAgeQuarters: 4, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.tof),
    validate: inRange(0, 100),
    format: fmtPercent,
    fallback: 'N/A',
    components: ['ScpiTable', 'ComparisonTable', 'AnalysisDetailModal', 'ScpiDetailPage', 'scpiAnalysis'],
  },
  top: {
    id: 'top',
    label: "Taux d'occupation physique",
    unit: '%',
    type: 'percent',
    criticality: 'secondary',
    sources: ['TOP (%)'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num((s as Record<string, unknown>).top),
    validate: inRange(0, 100),
    format: fmtPercent,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  ran: {
    id: 'ran',
    label: 'Report à nouveau',
    unit: '€/part',
    type: 'currency',
    criticality: 'secondary',
    sources: ['Report à nouveau (€/part)'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num((s as Record<string, unknown>).ran ?? (s as Record<string, unknown>).reportANouveau),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  capitalisation: {
    id: 'capitalisation',
    label: 'Capitalisation',
    unit: '€',
    type: 'currency',
    criticality: 'important',
    sources: ['Capitalisation (M€)', 'scpi.capitalization'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => readCapitalisation(s),
    validate: positive,
    format: (v) =>
      typeof v === 'number'
        ? v >= 1e9
          ? `${(v / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Md€`
          : `${(v / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M€`
        : 'N/A',
    fallback: 'N/A',
    components: ['ScpiTable', 'ComparisonTable', 'AnalysisDetailModal', 'ScpiDetailPage', 'scpiAnalysis'],
  },
  collecte_nette: {
    id: 'collecte_nette',
    label: 'Collecte nette (trimestre)',
    unit: '€',
    type: 'currency',
    criticality: 'secondary',
    sources: ['Collecte nette trimestre', 'scpi.collecteNetteTrimestre'],
    freshness: { maxAgeQuarters: 2, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.collecteNetteTrimestre),
    validate: () => ({ valid: true }),
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  endettement: {
    id: 'endettement',
    label: 'Endettement (LTV)',
    unit: '%',
    type: 'percent',
    criticality: 'important',
    sources: ['Endettement (%)', 'scpi.debt'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num(s.debt),
    validate: inRange(0, 60),
    format: fmtPercent,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal', 'scpiAnalysis'],
  },
  nombre_immeubles: {
    id: 'nombre_immeubles',
    label: "Nombre d'immeubles",
    unit: '',
    type: 'number',
    criticality: 'secondary',
    sources: ["Nombre d'immeubles", 'scpi.nbImmeubles'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num(s.nbImmeubles),
    validate: positive,
    format: fmtNumber,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal'],
  },
  nombre_locataires: {
    id: 'nombre_locataires',
    label: 'Nombre de locataires',
    unit: '',
    type: 'number',
    criticality: 'secondary',
    sources: ['Nombre de locataires', 'scpi.nombreLocataires'],
    freshness: { maxAgeQuarters: 2, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.nombreLocataires),
    validate: positive,
    format: fmtNumber,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  surface: {
    id: 'surface',
    label: 'Surface du patrimoine',
    unit: 'm²',
    type: 'number',
    criticality: 'secondary',
    sources: ['Surface (m²)'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num((s as Record<string, unknown>).surface),
    validate: positive,
    format: (v) => (typeof v === 'number' ? `${v.toLocaleString('fr-FR')} m²` : 'N/A'),
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  walt: {
    id: 'walt',
    label: 'WALT',
    unit: 'ans',
    type: 'duration',
    criticality: 'secondary',
    sources: ['WALT', 'scpi.walt'],
    freshness: { maxAgeQuarters: 4, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.walt),
    validate: inRange(0, 30),
    format: fmtYears,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  walb: {
    id: 'walb',
    label: 'WALB',
    unit: 'ans',
    type: 'duration',
    criticality: 'secondary',
    sources: ['WALB', 'scpi.walb'],
    freshness: { maxAgeQuarters: 4, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num(s.walb),
    validate: inRange(0, 30),
    format: fmtYears,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  delai_jouissance: {
    id: 'delai_jouissance',
    label: 'Délai de jouissance',
    unit: 'mois',
    type: 'duration',
    criticality: 'important',
    sources: ['Délai de jouissance (mois)', 'scpi.delaiJouissance'],
    freshness: { maxAgeQuarters: null },
    read: (s) => num(s.delaiJouissance),
    validate: inRange(0, 12),
    format: fmtMonths,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal'],
  },
  frais_souscription: {
    id: 'frais_souscription',
    label: 'Frais de souscription',
    unit: '%',
    type: 'percent',
    criticality: 'important',
    sources: ['Frais de souscription (TTC/%)', 'scpi.fees'],
    freshness: { maxAgeQuarters: null },
    read: (s) => num(s.fees),
    validate: inRange(0, 15),
    format: fmtPercent,
    fallback: 'N/A',
    components: ['ScpiTable', 'ComparisonTable', 'ScpiDetailPage', 'AnalysisDetailModal', 'scpiAnalysis'],
  },
  frais_gestion: {
    id: 'frais_gestion',
    label: 'Frais de gestion',
    unit: '%',
    type: 'percent',
    criticality: 'secondary',
    sources: ['Frais de gestion (HT/%)', 'scpi.fraisGestion'],
    freshness: { maxAgeQuarters: null },
    read: (s) => num(s.fraisGestion),
    validate: inRange(0, 20),
    format: fmtPercent,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  frequence_distribution: {
    id: 'frequence_distribution',
    label: 'Fréquence de distribution',
    unit: '',
    type: 'text',
    criticality: 'secondary',
    sources: ['Versement des loyers', 'scpi.versementLoyers'],
    freshness: { maxAgeQuarters: null },
    read: (s) => str(s.versementLoyers),
    validate: nonEmptyText,
    format: fmtText,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal'],
  },
  secteur_principal: {
    id: 'secteur_principal',
    label: 'Secteur principal',
    unit: '',
    type: 'text',
    criticality: 'secondary',
    sources: ['Répartition Sectorielle JSON', 'scpi.repartitionSector', 'scpi.sector'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => readDominant(s.repartitionSector) ?? str(s.sector),
    validate: nonEmptyText,
    format: fmtText,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal', 'scpiAnalysis'],
  },
  geographie_principale: {
    id: 'geographie_principale',
    label: 'Géographie principale',
    unit: '',
    type: 'text',
    criticality: 'secondary',
    sources: ['Répartition Géographique JSON', 'scpi.repartitionGeo', 'scpi.geography'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => readDominant(s.repartitionGeo) ?? str(s.geography),
    validate: nonEmptyText,
    format: fmtText,
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal', 'scpiAnalysis'],
  },
  sfdr: {
    id: 'sfdr',
    label: 'Classification SFDR',
    unit: '',
    type: 'text',
    criticality: 'secondary',
    sources: ['SFDR', 'scpi.sfdr'],
    freshness: { maxAgeQuarters: null },
    read: (s) => str(s.sfdr),
    validate: nonEmptyText,
    format: fmtText,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  sri: {
    id: 'sri',
    label: 'Indicateur de risque (SRI)',
    unit: '/7',
    type: 'ratio',
    criticality: 'important',
    sources: ['niveau_risque_dic', 'Profil_de_risque.SRRI', 'scpi.profilRisque'],
    freshness: { maxAgeQuarters: null },
    read: (s) => num(s.profilRisque),
    validate: inRange(1, 7),
    format: (v) => (typeof v === 'number' ? `${v}/7` : 'N/A'),
    fallback: 'N/A',
    components: ['ScpiDetailPage', 'AnalysisDetailModal'],
  },
  report_a_nouveau: {
    id: 'report_a_nouveau',
    label: 'Report à nouveau (cumulé)',
    unit: '€/part',
    type: 'currency',
    criticality: 'secondary',
    sources: ['Report à nouveau cumulé (€/part)'],
    freshness: { maxAgeQuarters: 4 },
    read: (s) => num((s as Record<string, unknown>).reportANouveauCumule),
    validate: positive,
    format: fmtCurrency,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  parts_en_attente: {
    id: 'parts_en_attente',
    label: 'Parts en attente de retrait',
    unit: '',
    type: 'number',
    criticality: 'important',
    sources: ['Parts en attente de retrait', 'liquidite'],
    freshness: { maxAgeQuarters: 2, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => num((s as Record<string, unknown>).partsEnAttente),
    validate: () => ({ valid: true }),
    format: fmtNumber,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
  liquidite: {
    id: 'liquidite',
    label: 'Liquidité',
    unit: '',
    type: 'text',
    criticality: 'important',
    sources: ['liquidite'],
    freshness: { maxAgeQuarters: 2, periodField: 'periodeBulletinTrimestriel' },
    read: (s) => str((s as Record<string, unknown>).liquidite),
    validate: nonEmptyText,
    format: fmtText,
    fallback: 'N/A',
    components: ['ScpiDetailPage'],
  },
};

export const ALL_INDICATOR_IDS = Object.keys(SCPI_INDICATORS) as IndicatorId[];

export const CRITICAL_INDICATOR_IDS = ALL_INDICATOR_IDS.filter(
  (id) => SCPI_INDICATORS[id].criticality === 'critical'
);

export function getIndicatorDefinition(id: IndicatorId): IndicatorDefinition {
  return SCPI_INDICATORS[id];
}
