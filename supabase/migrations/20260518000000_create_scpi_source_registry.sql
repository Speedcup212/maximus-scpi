-- =============================================================================
-- Create scpi_source_registry
-- Agent 03 — Data SCPI MaximusSCPI — Phase 1
-- =============================================================================
--
-- Registre documentaire officiel des 51 SCPI MaximusSCPI.
--
-- Usage Phase 1 :
--   - Centraliser les URLs de sources officielles par SCPI (bulletins, RA, DIC…)
--   - Suivre la fraîcheur des documents disponibles
--   - Tracer les vérifications humaines
--
-- Usage Phase 2 (futur) :
--   - Alimenter le pipeline d'ingestion automatique des bulletins
--   - Source de vérité pour le processus d'extraction PDF
--
-- Accès :
--   - RLS activé — aucune politique publique en Phase 1
--   - Lecture/écriture réservées au service role ou script admin authentifié
--   - Le frontend ne consomme pas cette table en Phase 1
--
-- =============================================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scpi_source_registry (
  id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiants SCPI (slug = clé métier stable, ex: "iroko-zen")
  scpi_slug               text          NOT NULL UNIQUE,
  scpi_name               text          NOT NULL,
  management_company      text          NOT NULL,

  -- URLs officielles — jamais inventées, null si inconnue
  official_scpi_page_url  text          DEFAULT NULL,
  bulletin_url            text          DEFAULT NULL,
  annual_report_url       text          DEFAULT NULL,
  dic_url                 text          DEFAULT NULL,
  note_information_url    text          DEFAULT NULL,
  statutes_url            text          DEFAULT NULL,

  -- Domaine source principal (ex: "alderan.fr") — déduit des URLs renseignées
  source_domain           text          DEFAULT NULL,

  -- Fraîcheur documentaire
  last_document_period    text          DEFAULT NULL,   -- format YYYY-Tn, ex: "2025-T3"
  last_document_date      date          DEFAULT NULL,   -- date effective du document source

  -- Suivi de vérification humaine
  last_verified_at        timestamptz   DEFAULT NULL,
  verification_status     text          NOT NULL
                            DEFAULT 'pending'
                            CHECK (verification_status IN (
                              'pending',
                              'verified',
                              'incomplete',
                              'broken_url',
                              'conflicting_sources',
                              'manual_review_required'
                            )),
  confidence_level        text          NOT NULL
                            DEFAULT 'unknown'
                            CHECK (confidence_level IN (
                              'high',
                              'medium',
                              'low',
                              'unknown'
                            )),

  -- Notes libres (observations humaines, alertes, contexte)
  notes                   text          DEFAULT NULL,

  -- Timestamps
  created_at              timestamptz   NOT NULL DEFAULT now(),
  updated_at              timestamptz   NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_scpi_source_registry_slug
  ON public.scpi_source_registry (scpi_slug);

CREATE INDEX IF NOT EXISTS idx_scpi_source_registry_company
  ON public.scpi_source_registry (management_company);

CREATE INDEX IF NOT EXISTS idx_scpi_source_registry_status
  ON public.scpi_source_registry (verification_status);

CREATE INDEX IF NOT EXISTS idx_scpi_source_registry_confidence
  ON public.scpi_source_registry (confidence_level);

CREATE INDEX IF NOT EXISTS idx_scpi_source_registry_last_verified
  ON public.scpi_source_registry (last_verified_at DESC NULLS LAST);

-- ─── Trigger updated_at ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_scpi_source_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scpi_source_registry_updated_at
  ON public.scpi_source_registry;

CREATE TRIGGER trigger_scpi_source_registry_updated_at
  BEFORE UPDATE ON public.scpi_source_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scpi_source_registry_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
-- Table interne Phase 1 : aucune policy publique ni authentifiée.
-- Seul le service role (clé service Supabase) peut lire/écrire.
-- Les policies seront ajoutées en Phase 2 lors de l'exposition contrôlée.

ALTER TABLE public.scpi_source_registry ENABLE ROW LEVEL SECURITY;

-- ─── Commentaires ─────────────────────────────────────────────────────────────

COMMENT ON TABLE public.scpi_source_registry IS
  'Registre documentaire officiel des SCPI MaximusSCPI (Phase 1). '
  'Centralise les URLs sources, statuts de vérification et fraîcheur documentaire. '
  'Accès restreint au service role en Phase 1 — aucune exposition frontend.';

COMMENT ON COLUMN public.scpi_source_registry.scpi_slug IS
  'Identifiant slug unique de la SCPI dans MaximusSCPI (ex: iroko-zen, comete). '
  'Doit correspondre au slug utilisé dans scpi_bulletins.scpi_slug.';

COMMENT ON COLUMN public.scpi_source_registry.bulletin_url IS
  'URL de la page officielle des bulletins trimestriels de la société de gestion. '
  'Jamais inventée — null si non vérifiée.';

COMMENT ON COLUMN public.scpi_source_registry.dic_url IS
  'URL du Document d''Information Clé (DIC) officiel le plus récent.';

COMMENT ON COLUMN public.scpi_source_registry.last_document_period IS
  'Période du dernier document connu, format YYYY-Tn (ex: 2025-T3).';

COMMENT ON COLUMN public.scpi_source_registry.verification_status IS
  'Statut de vérification humaine : '
  'pending | verified | incomplete | broken_url | conflicting_sources | manual_review_required';

COMMENT ON COLUMN public.scpi_source_registry.confidence_level IS
  'Niveau de confiance global dans les sources renseignées : high | medium | low | unknown';

COMMENT ON COLUMN public.scpi_source_registry.notes IS
  'Notes libres pour l''équipe : observations, alertes, contexte de vérification.';
