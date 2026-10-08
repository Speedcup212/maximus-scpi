export type ExposureKind = 'sector' | 'geography';
export type ExposureEntry = { label: string; value: number };
export type ExposureSource = 'certified' | 'catalog' | 'missing';
export type ScpiExposure = { items: ExposureEntry[]; source: ExposureSource };

const countryLabels = new Set([
  'france','espagne','italie','portugal','belgique','allemagne','pologne',
  'irlande','royaume-uni','pays-bas','suisse','luxembourg','autriche',
  'suede','norvege','danemark','finlande','canada','etats-unis','grece',
  'europe','international','zone euro','hors zone euro','ile-de-france',
]);

const normalizeLabel = (label: string) => label.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const isValidLabel = (label: string, kind: ExposureKind) =>
  label.trim().length > 1 && (kind !== 'sector' || !countryLabels.has(normalizeLabel(label)));

const readEntries = (input: unknown): ExposureEntry[] => {
  if (Array.isArray(input)) {
    return input.filter((row): row is ExposureEntry =>
      Boolean(row && typeof row.name === 'string' && Number.isFinite(Number(row.value))))
      .map(row => ({ label: row.name, value: Number(row.value) }));
  }
  if (input && typeof input === 'object') {
    return Object.entries(input).map(([label, raw]) => ({ label, value: Number(raw) }));
  }
  return [];
};

export const validatedExposure = (input: unknown, kind: ExposureKind): ExposureEntry[] => {
  const entries = readEntries(input)
    .filter(item => isValidLabel(item.label, kind) && Number.isFinite(item.value) && item.value > 0 && item.value <= 100);
  // Une seule catégorie qualitative ne constitue PAS une répartition à 100 %.
  const total = entries.reduce((sum, row) => sum + row.value, 0);
  if (entries.length < 2 || total < 95 || total > 102) return [];
  const unique = new Set(entries.map(item => normalizeLabel(item.label)));
  if (unique.size !== entries.length) return [];
  return entries.map(({ label, value }) => ({ label, value: value / total * 100 }));
};

export const resolveExposure = (
  published: unknown,
  catalog: unknown,
  kind: ExposureKind,
): ScpiExposure => {
  const certified = validatedExposure(published, kind);
  if (certified.length) return { items: certified, source: 'certified' };
  const fromCatalog = validatedExposure(catalog, kind);
  if (fromCatalog.length) return { items: fromCatalog, source: 'catalog' };
  return { items: [], source: 'missing' };
};

export type HoldingExposureInput = { currentValue: number; exposure: ScpiExposure };
export type PortfolioExposure = { entries: ExposureEntry[]; coveredPercent: number; missingPercent: number };
export const aggregatePortfolioExposure = (holdings: HoldingExposureInput[]): PortfolioExposure => {
  const total = holdings.reduce((sum, item) => sum + Math.max(0, item.currentValue), 0);
  if (!total) return { entries: [], coveredPercent: 0, missingPercent: 100 };
  const combined = new Map<string, { label: string; value: number }>();
  let coveredValue = 0;
  for (const { currentValue, exposure } of holdings) {
    if (currentValue <= 0 || !exposure.items.length) continue;
    coveredValue += currentValue;
    for (const { label, value } of exposure.items) {
      const key = normalizeLabel(label);
      const previous = combined.get(key);
      combined.set(key, { label: previous?.label || label, value: (previous?.value || 0) + currentValue / total * value });
    }
  }
  const coveredPercent = Math.max(0, Math.min(100, coveredValue / total * 100));
  return {
    entries: [...combined.values()].sort((a, b) => b.value - a.value),
    coveredPercent,
    missingPercent: Math.max(0, 100 - coveredPercent),
  };
};
