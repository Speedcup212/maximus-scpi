/**
 * Agent 03 — Data SCPI MaximusSCPI — Phase 1
 * Types TypeScript pour la table scpi_source_registry (Supabase)
 *
 * Ce fichier n'est pas importé par le frontend en Phase 1.
 * Il sert de référence pour les scripts d'administration et le pipeline Phase 2.
 */

// ─── Enums métier ─────────────────────────────────────────────────────────────

/** Statut de vérification humaine d'une source documentaire */
export type VerificationStatus =
  | 'pending'                   // Non encore vérifiée
  | 'verified'                  // Vérifiée manuellement, URLs actives
  | 'incomplete'                // Partiellement renseignée
  | 'broken_url'                // Une ou plusieurs URLs inactives
  | 'conflicting_sources'       // Incohérence détectée entre documents
  | 'manual_review_required';   // Signalement humain nécessaire

/** Niveau de confiance global dans les sources renseignées */
export type ConfidenceLevel =
  | 'high'      // Toutes URLs vérifiées, documents récents
  | 'medium'    // Sources partiellement vérifiées
  | 'low'       // Doutes sur l'exactitude ou la fraîcheur
  | 'unknown';  // Non évaluée (état initial)

// ─── Interface principale ─────────────────────────────────────────────────────

/** Ligne complète de la table scpi_source_registry */
export interface ScpiSourceRegistry {
  /** UUID Supabase (généré automatiquement) */
  id: string;

  /** Slug unique de la SCPI dans MaximusSCPI — ex: "iroko-zen" */
  scpi_slug: string;

  /** Nom commercial de la SCPI — ex: "Iroko Zen" */
  scpi_name: string;

  /** Nom de la société de gestion — ex: "Iroko" */
  management_company: string;

  /** URL de la page officielle de la SCPI chez la société de gestion */
  official_scpi_page_url: string | null;

  /** URL de la page des bulletins trimestriels */
  bulletin_url: string | null;

  /** URL du rapport annuel le plus récent */
  annual_report_url: string | null;

  /** URL du Document d'Information Clé (DIC) */
  dic_url: string | null;

  /** URL de la note d'information */
  note_information_url: string | null;

  /** URL des statuts */
  statutes_url: string | null;

  /** Domaine source principal — ex: "alderan.fr" */
  source_domain: string | null;

  /** Période du dernier document connu — format YYYY-Tn, ex: "2025-T3" */
  last_document_period: string | null;

  /** Date effective du dernier document source */
  last_document_date: string | null;  // ISO date string YYYY-MM-DD

  /** Horodatage de la dernière vérification humaine */
  last_verified_at: string | null;    // ISO datetime string

  /** Statut de vérification */
  verification_status: VerificationStatus;

  /** Niveau de confiance global */
  confidence_level: ConfidenceLevel;

  /** Notes libres — observations, alertes, contexte */
  notes: string | null;

  /** Horodatage de création (géré par Supabase) */
  created_at: string;

  /** Horodatage de dernière mise à jour (géré par trigger Supabase) */
  updated_at: string;
}

// ─── Types utilitaires ────────────────────────────────────────────────────────

/**
 * Payload pour insertion d'une nouvelle entrée.
 * Exclut les champs générés automatiquement par Supabase.
 */
export type ScpiSourceRegistryInsert = Omit<
  ScpiSourceRegistry,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * Payload pour mise à jour partielle.
 * Tous les champs sont optionnels sauf slug (clé de recherche).
 */
export type ScpiSourceRegistryUpdate = Partial<
  Omit<ScpiSourceRegistry, 'id' | 'scpi_slug' | 'created_at' | 'updated_at'>
>;

/**
 * Vue résumée pour dashboard de suivi des sources.
 * N'expose que les champs nécessaires au monitoring.
 */
export type ScpiSourceRegistrySummary = Pick<
  ScpiSourceRegistry,
  | 'scpi_slug'
  | 'scpi_name'
  | 'management_company'
  | 'verification_status'
  | 'confidence_level'
  | 'last_document_period'
  | 'last_verified_at'
  | 'notes'
>;

/**
 * Seed initial — entrée minimale sans URLs (état pending/unknown).
 * Utilisé pour peupler la table en Phase 1 avec les 51 SCPI MaximusSCPI.
 */
export type ScpiSourceRegistrySeedEntry = Pick<
  ScpiSourceRegistry,
  'scpi_slug' | 'scpi_name' | 'management_company'
> & {
  verification_status: 'pending';
  confidence_level: 'unknown';
};
