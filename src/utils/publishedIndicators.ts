import { scpiIndicators } from '../data/scpiIndicators.generated';

export type TdSource = 'supabase' | 'snapshot' | 'legacy';

export interface PublishedTd {
  value: number;
  year: number | null;
  source: TdSource;
}

/** Slug normalisation — identique à createSlugFromName */
export function toIndicatorSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Lecture du snapshot publishable (scpiIndicators.generated.ts). Null si SCPI non couverte. */
export function getSnapshotTd(slug: string): PublishedTd | null {
  const ind = scpiIndicators[slug];
  if (ind?.distribution_rate != null) {
    return {
      value: ind.distribution_rate,
      year: ind.distribution_year ?? null,
      source: 'snapshot',
    };
  }
  return null;
}

/**
 * Résolution priorisée du TD :
 *   1. Supabase live (si ligne disponible avec td != null)
 *   2. Snapshot publishable (scpiIndicators.generated.ts)
 *   3. Legacy (JSON source)
 *
 * td Supabase est stocké en décimal (0.0732 = 7.32%) — conversion × 100 appliquée ici.
 */
export function resolvePublishedTd(
  slug: string,
  supabaseRow?: { td: string | number | null; td_annee: number | null } | null,
  legacyYield?: number,
): PublishedTd {
  if (supabaseRow?.td != null) {
    const raw = typeof supabaseRow.td === 'string' ? parseFloat(supabaseRow.td) : Number(supabaseRow.td);
    if (!isNaN(raw)) {
      return { value: raw * 100, year: supabaseRow.td_annee ?? null, source: 'supabase' };
    }
  }
  const snap = getSnapshotTd(slug);
  if (snap) return snap;
  return { value: legacyYield ?? 0, year: null, source: 'legacy' };
}
