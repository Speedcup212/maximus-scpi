import { selectSupabaseRest } from './supabaseRest';

type ScoreRow = {
  scpi_slug: string;
  maximus_score_value: number | string | null;
  found_at?: string | null;
};

/**
 * Fetches the latest maximus_score_value for a SCPI from public.scpi_bulletins.
 * Kept for views that do not already receive the client-computed score.
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
      cacheTtlMs: 15 * 60 * 1000,
      deferMs: 150,
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
 * The public comparator already computes one coherent percentile score for the
 * full cohort on the client. Fetching bulletin scores again for every visible
 * page caused a second network round-trip and visible score changes after the
 * first paint. Returning an empty overlay makes the existing client score the
 * single source of truth in the comparator while preserving this API for
 * backwards compatibility.
 */
export async function getLatestScoresBatch(_slugs: string[]): Promise<Record<string, number>> {
  return {};
}
