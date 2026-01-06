import { supabase } from '../supabaseClient';
import { Scpi } from '../types/scpi';
import { transformScpiArrayToScoringInput } from './scpiDataTransformer';
import { scoreScpiBatch, ScpiScores, defaultParams } from './scpiScoring';

/**
 * Service pour calculer et sauvegarder les scores SCPI
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
