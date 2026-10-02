export type ScpiHistoryRow = {
  scpi_slug: string;
  snapshot_at: string | null;
  source_period: string | null;
  source_url: string | null;
  qa_status: string | null;
  source_confidence: number | string | null;
  tof: number | string | null;
  td: number | string | null;
  capitalisation: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  prix_retrait: number | string | null;
  valeur_realisation: number | string | null;
  endettement: number | string | null;
  distribution_par_part: number | string | null;
  parts_attente_retrait: number | string | null;
  nombre_parts: number | string | null;
};

export type NormalizedHistoryRow = Omit<
  ScpiHistoryRow,
  | 'tof'
  | 'td'
  | 'capitalisation'
  | 'prix_souscription'
  | 'prix_reconstitution'
  | 'prix_retrait'
  | 'valeur_realisation'
  | 'endettement'
  | 'distribution_par_part'
  | 'parts_attente_retrait'
  | 'nombre_parts'
  | 'source_confidence'
> & {
  tof: number | null;
  td: number | null;
  capitalisation: number | null;
  prix_souscription: number | null;
  prix_reconstitution: number | null;
  prix_retrait: number | null;
  valeur_realisation: number | null;
  endettement: number | null;
  distribution_par_part: number | null;
  parts_attente_retrait: number | null;
  nombre_parts: number | null;
  source_confidence: number | null;
  retrait_attente_pct: number | null;
};

export const HISTORY_SELECT = [
  'scpi_slug',
  'snapshot_at',
  'source_period',
  'source_url',
  'qa_status',
  'source_confidence',
  'tof',
  'td',
  'capitalisation',
  'prix_souscription',
  'prix_reconstitution',
  'prix_retrait',
  'valeur_realisation',
  'endettement',
  'distribution_par_part',
  'parts_attente_retrait',
  'nombre_parts',
].join(',');

export const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const number = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : null;
};

const normalizeRow = (row: ScpiHistoryRow): NormalizedHistoryRow => {
  const partsAttente = toFiniteNumber(row.parts_attente_retrait);
  const nombreParts = toFiniteNumber(row.nombre_parts);
  const rawRetraitPct =
    partsAttente !== null && nombreParts !== null && nombreParts > 0
      ? (partsAttente / nombreParts) * 100
      : null;

  // A queue of pending withdrawals cannot be negative or exceed 100% of
  // outstanding shares. Values outside that range are extraction artefacts,
  // so keep them out of charts rather than publishing a misleading figure.
  const retraitPct =
    rawRetraitPct !== null && rawRetraitPct >= 0 && rawRetraitPct <= 100
      ? rawRetraitPct
      : null;

  return {
    ...row,
    tof: toFiniteNumber(row.tof),
    td: toFiniteNumber(row.td),
    capitalisation: toFiniteNumber(row.capitalisation),
    prix_souscription: toFiniteNumber(row.prix_souscription),
    prix_reconstitution: toFiniteNumber(row.prix_reconstitution),
    prix_retrait: toFiniteNumber(row.prix_retrait),
    valeur_realisation: toFiniteNumber(row.valeur_realisation),
    endettement: toFiniteNumber(row.endettement),
    distribution_par_part: toFiniteNumber(row.distribution_par_part),
    parts_attente_retrait: partsAttente,
    nombre_parts: nombreParts,
    source_confidence: toFiniteNumber(row.source_confidence),
    retrait_attente_pct: retraitPct,
  };
};

const rowTimestamp = (row: ScpiHistoryRow) => {
  if (!row.snapshot_at) return 0;
  const timestamp = Date.parse(row.snapshot_at);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const parsePeriod = (period: string | null | undefined) => {
  if (!period) return null;
  const trimmed = period.trim();
  const canonical = trimmed.match(/^(\d{4})[- ]?T([1-4])$/i);
  if (canonical) {
    const year = Number(canonical[1]);
    const quarter = Number(canonical[2]);
    return {
      key: `${year}-T${quarter}`,
      ordinal: year * 4 + quarter,
    };
  }

  const alternate = trimmed.match(/^T([1-4])[- ]?(\d{4})$/i);
  if (alternate) {
    const quarter = Number(alternate[1]);
    const year = Number(alternate[2]);
    return {
      key: `${year}-T${quarter}`,
      ordinal: year * 4 + quarter,
    };
  }

  return null;
};

export const normalizeAndDedupeHistory = (
  rows: ScpiHistoryRow[],
): NormalizedHistoryRow[] => {
  const byPeriod = new Map<string, ScpiHistoryRow>();

  // Never publish rows already rejected by the QA pipeline. In particular,
  // non-canonical duplicates and missing-period artefacts must not become the
  // "latest" point of a trajectory or a market signal.
  rows
    .filter((row) => !row.qa_status?.toLowerCase().startsWith('invalid'))
    .forEach((row, index) => {
      const parsed = parsePeriod(row.source_period);
      const key = parsed?.key || row.source_period?.trim() || `snapshot-${row.snapshot_at || index}`;
      const current = byPeriod.get(key);
      if (!current || rowTimestamp(row) >= rowTimestamp(current)) {
        byPeriod.set(key, row);
      }
    });

  return Array.from(byPeriod.values())
    .sort((a, b) => {
      const aPeriod = parsePeriod(a.source_period);
      const bPeriod = parsePeriod(b.source_period);

      if (aPeriod && bPeriod && aPeriod.ordinal !== bPeriod.ordinal) {
        return aPeriod.ordinal - bPeriod.ordinal;
      }
      if (aPeriod && !bPeriod) return -1;
      if (!aPeriod && bPeriod) return 1;
      return rowTimestamp(a) - rowTimestamp(b);
    })
    .map(normalizeRow);
};

export const formatPeriod = (period: string | null | undefined) => {
  if (!period) return 'N.D.';
  const match = period.match(/^(\d{4})[- ]?T([1-4])$/i);
  if (match) return `T${match[2]} ${match[1]}`;
  const alt = period.match(/^T([1-4])[- ]?(\d{4})$/i);
  if (alt) return `T${alt[1]} ${alt[2]}`;
  return period;
};

export const humanizeSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const latestDelta = (
  rows: NormalizedHistoryRow[],
  key: keyof NormalizedHistoryRow,
  lookback = 4,
): number | null => {
  const values = rows
    .map((row) => toFiniteNumber(row[key]))
    .filter((value): value is number => value !== null);
  if (values.length < 2) return null;
  const latest = values[values.length - 1];
  const previousIndex = Math.max(0, values.length - 1 - lookback);
  return latest - values[previousIndex];
};

export const getNumericSeries = (
  rows: NormalizedHistoryRow[],
  key: keyof NormalizedHistoryRow,
) =>
  rows
    .map((row) => toFiniteNumber(row[key]))
    .filter((value): value is number => value !== null);

export const formatSigned = (value: number | null, suffix = '') => {
  if (value === null || !Number.isFinite(value)) return 'N.D.';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })}${suffix}`;
};

export const valuationGapPct = (
  price: number | null,
  reconstitution: number | null,
): number | null => {
  if (price === null || reconstitution === null || reconstitution === 0) return null;
  return ((price - reconstitution) / reconstitution) * 100;
};
