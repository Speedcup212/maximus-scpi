export type AnalysisRiskLevel = 'low' | 'medium' | 'high';
export type AnalysisFreshness = 'recent' | 'old' | 'unknown';

export type ReliableAnalysisSignal = {
  metric?: string;
  severity?: 'high' | 'medium' | 'info';
  message?: string;
  quality_issue?: boolean;
  [key: string]: unknown;
};

const normalizeMetric = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const extractPercentages = (message?: string): number[] => {
  if (!message) return [];
  return [...message.matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)]
    .map((match) => Number(match[1].replace(',', '.')))
    .filter(Number.isFinite);
};

const hasNumericEvidence = (message?: string) =>
  Boolean(message && /\d+(?:[.,]\d+)?/.test(message));

const hasZeroPercentage = (message?: string) =>
  extractPercentages(message).some((value) => Math.abs(value) < 0.0001);

const isYieldMetric = (metric?: string) => {
  const key = normalizeMetric(metric);
  return (
    key === 'td' ||
    key.includes('taux_distribution') ||
    key.includes('rendement') ||
    key.includes('distribution_yield')
  );
};

const isTriMetric = (metric?: string) => {
  const key = normalizeMetric(metric);
  return key === 'tri' || key.startsWith('tri_') || key.includes('taux_rendement_interne');
};

const severeEvidenceMetrics = new Set([
  'tof',
  'taux_occupation_financier',
  'liquidite_retraits',
  'parts_attente_retrait',
  'parts_en_attente_de_retrait',
  'valeur_reconstitution',
  'prix_reconstitution',
  'valeur_realisation',
  'surcote_reconstitution',
  'decote_reconstitution',
  'endettement',
  'dette',
  'distribution',
  'distribution_par_part',
]);

export const sanitizeAnalysisSignal = <T extends ReliableAnalysisSignal>(signal: T): T => {
  if (signal.quality_issue) return signal;

  if (isYieldMetric(signal.metric) && hasZeroPercentage(signal.message)) {
    return {
      ...signal,
      severity: 'info',
      quality_issue: true,
      message: `${signal.message || 'Rendement à 0 % détecté.'} Valeur neutralisée pour la vigilance tant qu’elle n’est pas confirmée par le bulletin source.`,
    } as T;
  }

  if (isTriMetric(signal.metric)) {
    const percentages = extractPercentages(signal.message);
    const implausible = percentages.some((value) => value > 50 || value < -100);
    if (implausible) {
      return {
        ...signal,
        severity: 'info',
        quality_issue: true,
        message: `${signal.message || 'TRI atypique détecté.'} Valeur neutralisée pour la vigilance et à contrôler dans le document source.`,
      } as T;
    }
  }

  return signal;
};

export const hasDocumentedSevereSignal = (signals: ReliableAnalysisSignal[]) =>
  signals.some((signal) => {
    const sanitized = sanitizeAnalysisSignal(signal);
    const metric = normalizeMetric(sanitized.metric);
    return (
      sanitized.severity === 'high' &&
      !sanitized.quality_issue &&
      typeof sanitized.message === 'string' &&
      sanitized.message.trim().length >= 12 &&
      hasNumericEvidence(sanitized.message) &&
      severeEvidenceMetrics.has(metric)
    );
  });

export const getEffectiveRiskLevel = (
  rawRisk: AnalysisRiskLevel,
  signals: ReliableAnalysisSignal[]
): AnalysisRiskLevel => {
  if (rawRisk === 'high' && !hasDocumentedSevereSignal(signals)) return 'medium';
  return rawRisk;
};

const parseQuarterIndex = (period?: string | null): number | null => {
  if (!period) return null;
  const normalized = period.toUpperCase().trim();
  const yearFirst = normalized.match(/(20\d{2})\s*[-_/ ]?\s*[TQ]\s*([1-4])/);
  const quarterFirst = normalized.match(/[TQ]\s*([1-4])\s*[-_/ ]?\s*(20\d{2})/);

  const year = yearFirst ? Number(yearFirst[1]) : quarterFirst ? Number(quarterFirst[2]) : NaN;
  const quarter = yearFirst ? Number(yearFirst[2]) : quarterFirst ? Number(quarterFirst[1]) : NaN;
  if (!Number.isInteger(year) || !Number.isInteger(quarter)) return null;

  return year * 4 + (quarter - 1);
};

export const getPeriodFreshness = (
  period?: string | null,
  now = new Date()
): AnalysisFreshness => {
  const periodIndex = parseQuarterIndex(period);
  if (periodIndex === null) return 'unknown';

  const currentIndex = now.getFullYear() * 4 + Math.floor(now.getMonth() / 3);
  const quarterGap = currentIndex - periodIndex;

  if (quarterGap < -1) return 'unknown';
  return quarterGap <= 2 ? 'recent' : 'old';
};

export const freshnessLabel: Record<AnalysisFreshness, string> = {
  recent: 'Récent',
  old: 'Ancien',
  unknown: 'Date à vérifier',
};

export const humanizeAnalysisMetric = (metric?: string) => {
  const key = normalizeMetric(metric);
  if (!key) return null;

  const labels: Record<string, string> = {
    td: 'Taux de distribution',
    taux_distribution: 'Taux de distribution',
    rendement: 'Rendement',
    tof: 'TOF',
    taux_occupation_financier: 'TOF',
    top: 'TOP',
    taux_occupation_physique: 'TOP',
    ran: 'Report à nouveau',
    report_a_nouveau: 'Report à nouveau',
    prix_part: 'Prix de part',
    prix_souscription: 'Prix de souscription',
    prix_retrait: 'Prix de retrait',
    prix_reconstitution: 'Valeur de reconstitution',
    valeur_reconstitution: 'Valeur de reconstitution',
    valeur_realisation: 'Valeur de réalisation',
    data_quality_valeur_realisation: 'Qualité de la valeur de réalisation',
    collecte_nette: 'Collecte nette',
    endettement: 'Endettement',
    dette: 'Endettement',
    distribution: 'Distribution',
    distribution_par_part: 'Distribution par part',
    parts_attente_retrait: 'Parts en attente de retrait',
    parts_en_attente_de_retrait: 'Parts en attente de retrait',
    liquidite_retraits: 'Liquidité',
    surcote_reconstitution: 'Surcote du prix de part',
    decote_reconstitution: 'Décote du prix de part',
    mutualisation: 'Diversification du patrimoine',
    concentration: 'Concentration du patrimoine',
    tri: 'TRI',
  };

  if (labels[key]) return labels[key];

  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
