import { supabase } from '../supabaseClient';
import { Scpi } from '../types/scpi';
import { transformScpiArrayToScoringInput } from './scpiDataTransformer';
import { scoreScpiBatch, ScpiScores, defaultParams, ScpiInput } from './scpiScoring';

/**
 * Service pour calculer et sauvegarder les scores SCPI.
 *
 * DB-first: scpi_bulletins.maximus_score is always preferred when present.
 * Fallback (scoreScpiBatch) is used only when DB has no score.
 *
 * Source-of-truth hierarchy:
 *   1. scpi_bulletins.maximus_score  — ingestion pipeline (annotated: source="DB")
 *   2. scores_scpi                   — legacy table (annotated: source="DB")
 *   3. scoreScpiBatch()              — local compute only when DB empty (source="FALLBACK", version="local")
 *
 * Use getOrComputeScoresForScpis() or getScoreBySlug() for DB-first retrieval.
 */

/**
 * Calcule les scores pour un tableau de SCPI (sans sauvegarder)
 */
export async function calculateScpiScores(scpiList: Scpi[]): Promise<ScpiScores[]> {
  const scoringInput = transformScpiArrayToScoringInput(scpiList);
  return scoreScpiBatch(scoringInput, defaultParams);
}

/**
 * Calcule et sauvegarde les scores dans Supabase
 */
export async function calculateAndSaveScpiScores(scpiList: Scpi[]): Promise<{
  success: boolean;
  scores: ScpiScores[];
  error?: string;
}> {
  try {
    if (!supabase) {
      return { success: false, scores: [], error: 'Supabase not configured' };
    }
    const scores = await calculateScpiScores(scpiList);

    const dbRecords = scores.map(s => ({
      scpi_id: Number(s.id),
      nom: s.nom,
      societe_gestion: s.societe_gestion,
      score_rendement: s.score_rendement,
      score_secteur: s.score_secteur,
      score_geo: s.score_geo,
      score_qualite: s.score_qualite,
      score_taille: s.score_taille,
      score_total: s.score_total,
      audit_trail: s.audit_trail,
      params_version: 'v1.0'
    }));

    const { error } = await supabase.from('scores_scpi').insert(dbRecords);

    if (error) {
      return { success: false, scores, error: error.message };
    }

    return { success: true, scores };
  } catch (error) {
    return {
      success: false,
      scores: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Récupère les scores depuis Supabase pour une liste de SCPI
 */
export async function getScpiScoresFromDb(scpiIds?: number[]): Promise<{
  success: boolean;
  scores: any[];
  error?: string;
}> {
  try {
    if (!supabase) {
      return { success: false, scores: [], error: 'Supabase not configured' };
    }
    let query = supabase
      .from('scores_scpi')
      .select('*')
      .order('created_at', { ascending: false });

    if (scpiIds && scpiIds.length > 0) {
      query = query.in('scpi_id', scpiIds);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, scores: [], error: error.message };
    }

    return { success: true, scores: data || [] };
  } catch (error) {
    return {
      success: false,
      scores: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Récupère le dernier score pour chaque SCPI
 */
export async function getLatestScpiScores(): Promise<{
  success: boolean;
  scores: Record<number, any>;
  error?: string;
}> {
  try {
    if (!supabase) {
      return { success: false, scores: {}, error: 'Supabase not configured' };
    }
    const { data, error } = await supabase
      .from('scores_scpi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, scores: {}, error: error.message };
    }

    const latestScores: Record<number, any> = {};
    data?.forEach(score => {
      if (!latestScores[score.scpi_id]) {
        latestScores[score.scpi_id] = score;
      }
    });

    return { success: true, scores: latestScores };
  } catch (error) {
    return {
      success: false,
      scores: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ─── DB-first helpers (ingestion pipeline scores) ────────────────────────────

/** Bulletin row from scpi_bulletins (typed for getScoreBySlug). */
interface BulletinScoreRow {
  maximus_score_value: number | null;
  maximus_score: Record<string, unknown> | null;
  period: string;
}

/**
 * Reads the latest ingestion-pipeline score for a SCPI identified by its slug.
 *
 * Queries public.scpi_bulletins for maximus_score_value (numeric).
 * Defensive fallback: if maximus_score_value is null but maximus_score JSON exists,
 * derives score from maximus_score->>'score_total' (or 'score') once and logs a warning.
 *
 * Returns null when no row or no score available.
 */
export async function getScoreBySlug(scpiSlug: string): Promise<{
  success: boolean;
  score: ScpiScores | null;
  error?: string;
}> {
  try {
    if (!supabase) return { success: false, score: null, error: 'Supabase not configured' };

    const { data, error } = await supabase
      .from('scpi_bulletins')
      .select('maximus_score_value, period, maximus_score')
      .eq('scpi_slug', scpiSlug)
      .order('found_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, score: null, error: error.message };
    if (!data) return { success: true, score: null };

    const row = data as BulletinScoreRow;
    let value: number | null = null;

    if (row.maximus_score_value != null && typeof row.maximus_score_value === 'number') {
      value = row.maximus_score_value;
    } else if (row.maximus_score != null && typeof row.maximus_score === 'object') {
      const ms = row.maximus_score as Record<string, unknown>;
      const fromTotal = ms['score_total'] != null ? Number(ms['score_total']) : NaN;
      const fromScore = ms['score'] != null ? Number(ms['score']) : NaN;
      value = !Number.isNaN(fromTotal) ? fromTotal : !Number.isNaN(fromScore) ? fromScore : null;
      if (value != null) {
        console.warn('[getScoreBySlug] maximus_score_value null but maximus_score present; derived score from JSON (use DB migration to populate maximus_score_value)', { scpiSlug, period: row.period });
      }
    }

    if (value == null) return { success: true, score: null };

    if (import.meta.env?.DEV) {
      console.debug('[getScoreBySlug]', { scpiSlug, maximus_score_value: value, period: row.period });
    }

    const score: ScpiScores & { source: string; version: string } = {
      nom:             scpiSlug,
      score_total:     value,
      score_rendement: 0,
      score_secteur:   0,
      score_geo:       0,
      score_qualite:   0,
      score_taille:    0,
      audit_trail:     [],
      source:          'DB',
      version:         'v1',
    };

    return { success: true, score };
  } catch (err) {
    return {
      success: false,
      score:   null,
      error:   err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Retrieves scores for a list of SCPIs using the canonical source-of-truth:
 *
 *   1. Try scpi_bulletins.maximus_score (ingestion pipeline, preferred).
 *   2. Try scores_scpi table (legacy frontend-computed scores).
 *   3. Compute locally via scoreScpiBatch (fallback, never saved to DB here).
 *
 * Returns a map keyed by numeric SCPI id for compatibility with existing
 * components that index scores by id.
 */
export async function getOrComputeScoresForScpis(
  scpiList: Scpi[]
): Promise<Record<number, ScpiScores>> {
  const result: Record<number, ScpiScores> = {};

  // Step 1 — try ingestion pipeline scores by slug
  const slugToId = new Map<string, number>(
    scpiList.map(s => [s.slug ?? s.name.toLowerCase().replace(/\s+/g, '-'), s.id])
  );

  await Promise.allSettled(
    [...slugToId.entries()].map(async ([slug, id]) => {
      const r = await getScoreBySlug(slug);
      if (r.success && r.score) result[id] = r.score;
    })
  );

  // Step 2 — fill missing with scores_scpi (legacy)
  const missingIds = scpiList
    .map(s => s.id)
    .filter(id => result[id] === undefined);

  if (missingIds.length > 0) {
    const legacyResult = await getScpiScoresFromDb(missingIds);
    if (legacyResult.success) {
      legacyResult.scores.forEach(s => {
        if (result[s.scpi_id] === undefined) {
          result[s.scpi_id] = {
            nom:             s.nom,
            score_total:     s.score_total,
            score_rendement: s.score_rendement,
            score_secteur:   s.score_secteur,
            score_geo:       s.score_geo,
            score_qualite:   s.score_qualite,
            score_taille:    s.score_taille,
            audit_trail:     s.audit_trail ?? [],
            source:         'DB',
            version:        s.params_version ?? 'v1',
          } as ScpiScores & { source: string; version: string };
        }
      });
    }
  }

  // Step 3 — compute locally only for SCPIs still missing (DB-first: never use if DB has score)
  const stillMissing = scpiList.filter(s => result[s.id] === undefined);
  if (stillMissing.length > 0) {
    const inputs  = transformScpiArrayToScoringInput(stillMissing);
    const computed = scoreScpiBatch(inputs, defaultParams, true);
    computed.forEach((score, idx) => {
      const scpi = stillMissing[idx];
      if (scpi !== undefined) {
        result[scpi.id] = {
          ...score,
          source: 'FALLBACK',
          version: 'local',
        } as ScpiScores & { source: string; version: string };
      }
    });
  }

  return result;
}

/**
 * Utilise l'Edge Function pour calculer les scores (alternative)
 */
export async function calculateScpiScoresViaEdgeFunction(
  scpiList: Scpi[],
  saveToDb: boolean = false
): Promise<{
  success: boolean;
  scores: ScpiScores[];
  error?: string;
}> {
  try {
    const scoringInput = transformScpiArrayToScoringInput(scpiList);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, scores: [], error: 'Supabase not configured' };
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/scpi-scoring`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          scpi_data: scoringInput,
          save_to_db: saveToDb
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, scores: [], error: error.error || 'API Error' };
    }

    const result = await response.json();
    return { success: true, scores: result.scores };
  } catch (error) {
    return {
      success: false,
      scores: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
