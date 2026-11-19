/**
 * Performance Globale Annuelle (PGA) — indicateur ASPIM.
 * Une PGA est affichable uniquement si elle est sourcée, contrôlée
 * et de la même année civile que le taux de distribution présenté.
 */
export interface PgaData {
  pga?: number;
  pgaYear?: number;
  pgaSourceUrl?: string;
  pgaQaStatus?: string;
  distributionReferencePeriod?: string;
}

export interface PgaDisplayInfo {
  available: boolean;
  year: number | null;
  value: number | null;
  sourceUrl: string | null;
  label: string;
}

const APPROVED_QA_STATUSES = new Set(['qa_pass', 'qa_pass_delegated_source_review']);

export function getPgaDisplayInfo(scpi: PgaData): PgaDisplayInfo {
  const match = scpi.distributionReferencePeriod?.match(/(?:^|\D)(20\d{2})(?:\D|$)/);
  const tdYear = match ? Number(match[1]) : null;
  const validValue = typeof scpi.pga === 'number' && Number.isFinite(scpi.pga);
  const validYear = Number.isInteger(scpi.pgaYear) && scpi.pgaYear === tdYear;
  const validSource = typeof scpi.pgaSourceUrl === 'string' &&
    /^https:\/\//i.test(scpi.pgaSourceUrl.trim());
  const approved = APPROVED_QA_STATUSES.has(scpi.pgaQaStatus || '');
  if (!validValue || !validYear || !validSource || !approved) {
    return { available: false, year: tdYear, value: null, sourceUrl: null, label: 'PGA non disponible' };
  }
  return {
    available: true,
    year: tdYear,
    value: scpi.pga!,
    sourceUrl: scpi.pgaSourceUrl!.trim(),
    label: 'PGA ' + tdYear
  };
}

export function formatPga(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' %';
}
