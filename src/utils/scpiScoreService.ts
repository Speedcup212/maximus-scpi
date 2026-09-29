import { selectSupabaseRest } from './supabaseRest';

type ScoreRow = {
  scpi_slug: string;
  maximus_score_value: number | string | null;
  found_at?: string | null;
};

/**
 * Fetches the latest maximus_score_value for a SCPI from public.scpi_bulletins.
 * Returns the numeric score or null (no row, no score, or error).
 */
export async function getLatestScore(slug: string): Promise<number | null> {
  if (!slug) return null;

  const params = new URLSearchParams({
    select: 'scpi_slug,maximus_score_value,found_at',
    scpi_slug: `eq.${slug}`,
    order: 'found_at.desc',
    limit: '1',
  });

  try {
    const rows = await selectSupabaseRest<ScoreRow>('scpi_bulletins', params, {
      cacheTtlMs: 5 * 60 * 1000,
      deferMs: 250,
    });
    const value = rows[0]?.maximus_score_value;
    if (value == null) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  } catch {
    return null;
  }
}

/**
 * Fetches latest maximus_score_value for multiple slugs in one query.
 * Returns Record<slug, score>. Slugs with no score are omitted.
 */
export async function getLatestScoresBatch(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return {};

  const params = new URLSearchParams({
    select: 'scpi_slug,maximus_score_value,found_at',
    scpi_slug: `in.(${unique.join(',')})`,
    order: 'found_at.desc',
  });

  try {
    const data = await selectSupabaseRest<ScoreRow>('scpi_bulletins', params, {
      cacheTtlMs: 5 * 60 * 1000,
      deferMs: 500,
    });

    const result: Record<string, number> = {};
    for (const row of data) {
      const slug = row.scpi_slug;
      if (result[slug] != null) continue;
      const value = row.maximus_score_value;
      if (value != null) {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) result[slug] = numeric;
      }
    }
    return result;
  } catch {
    return {};
  }
}
