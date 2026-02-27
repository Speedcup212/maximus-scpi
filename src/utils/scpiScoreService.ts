import { supabase } from '../supabaseClient';

/**
 * Fetches the latest maximus_score_value for a SCPI from public.scpi_bulletins.
 * Returns the numeric score or null (no row, no score, or error).
 */
export async function getLatestScore(slug: string): Promise<number | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('scpi_bulletins')
      .select('maximus_score_value')
      .eq('scpi_slug', slug)
      .order('found_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return null;
    if (!data || data.maximus_score_value == null) return null;
    const v = Number(data.maximus_score_value);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * Fetches latest maximus_score_value for multiple slugs in one query.
 * Returns Record<slug, score>. Slugs with no score are omitted.
 */
export async function getLatestScoresBatch(slugs: string[]): Promise<Record<string, number>> {
  if (!supabase || slugs.length === 0) return {};
  const unique = [...new Set(slugs)];
  try {
    const { data, error } = await supabase
      .from('scpi_bulletins')
      .select('scpi_slug, maximus_score_value, found_at')
      .in('scpi_slug', unique)
      .order('found_at', { ascending: false });

    if (error) return {};

    const result: Record<string, number> = {};
    for (const row of data ?? []) {
      const slug = row.scpi_slug as string;
      if (result[slug] != null) continue;
      const v = row.maximus_score_value;
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n)) result[slug] = n;
      }
    }
    return result;
  } catch {
    return {};
  }
}
