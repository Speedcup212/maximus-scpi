-- =============================================================================
-- 04_scpi_indicators.sql
-- Table de référence des indicateurs SCPI — une ligne par SCPI.
--
-- Source de vérité pour le comparateur et le frontend.
-- Mise à jour par le pipeline à chaque nouveau bulletin trimestriel.
-- Surcharge manuelle possible directement dans Supabase.
--
-- Règle d'affichage frontend :
--   source_confidence >= 0.6  → afficher la donnée + badge période
--   source_confidence <  0.6  → afficher "N/D"
--   champ NULL                → afficher "N/D"
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.scpi_indicators (

  -- ─── Identifiant ─────────────────────────────────────────────────────────
  scpi_slug                text        PRIMARY KEY,

  -- ─── Identité ─────────────────────────────────────────────────────────────
  nom                      text,
  societe_gestion          text,
  annee_creation           int,

  -- ─── Rendement & occupation ───────────────────────────────────────────────
  td                       numeric,    -- Taux de distribution %
  tof                      numeric,    -- Taux d'occupation financier %
  top                      numeric,    -- Taux d'occupation physique %

  -- ─── Valorisation ─────────────────────────────────────────────────────────
  capitalisation           numeric,    -- EUR (valeur absolue)
  prix_souscription        numeric,    -- € / part
  prix_reconstitution      numeric,    -- € / part
  prix_retrait             numeric,    -- € / part
  valeur_realisation       numeric,    -- € / part
  prime_decote             numeric,    -- % calculé : (prix_souscr - prix_reconst) / prix_reconst * 100

  -- ─── Frais ────────────────────────────────────────────────────────────────
  frais_souscription       numeric,    -- %
  frais_gestion            numeric,    -- %
  commission_performance   numeric,    -- %
  frais_sortie             numeric,    -- %

  -- ─── Risque & durée ───────────────────────────────────────────────────────
  srri                     int,        -- 1 à 7
  duree_detention_recommandee numeric, -- années
  endettement              numeric,    -- LTV %
  delai_jouissance         numeric,    -- mois

  -- ─── Indicateurs locatifs ─────────────────────────────────────────────────
  walt                     numeric,    -- années
  walb                     numeric,    -- années
  nombre_locataires        int,
  nombre_immeubles         int,

  -- ─── Répartitions ─────────────────────────────────────────────────────────
  repartition_sectorielle  jsonb,      -- { "Bureaux": 0.45, "Commerces": 0.30, ... }
  repartition_geographique jsonb,      -- { "France": 0.60, "Allemagne": 0.25, ... }

  -- ─── Classification & labels ──────────────────────────────────────────────
  label_isr                boolean,
  sfdr                     text,       -- "Article 6" | "Article 8" | "Article 9"
  secteur_principal        text,       -- bureaux | commerces | residentiel | sante | logistique | hotellerie | diversifie
  geographie_principale    text,       -- france | europe | international

  -- ─── Collecte & activité trimestrielle ───────────────────────────────────
  collecte_nette           numeric,    -- EUR du trimestre
  nb_cessions_trimestre    int,
  report_a_nouveau         numeric,    -- % ou €/part selon source
  distribution_par_part    numeric,    -- €/part
  versement_loyers         text,       -- "Mensuel" | "Trimestriel"

  -- ─── Traçabilité ──────────────────────────────────────────────────────────
  source_period            text,       -- ex: "T3 2025"
  source_confidence        numeric,    -- 0 à 1 — confiance de l'extraction PDF
  source_type              text        DEFAULT 'pipeline',  -- 'pipeline' | 'manuel'
  bulletin_id              uuid        REFERENCES public.scpi_bulletins(id) ON DELETE SET NULL,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ─── Index ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_scpi_indicators_confidence
  ON public.scpi_indicators (source_confidence);

CREATE INDEX IF NOT EXISTS idx_scpi_indicators_updated
  ON public.scpi_indicators (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_scpi_indicators_td
  ON public.scpi_indicators (td DESC NULLS LAST);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.scpi_indicators ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename  = 'scpi_indicators'
       AND policyname = 'allow_select_anon'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY allow_select_anon
        ON public.scpi_indicators
        FOR SELECT
        USING (true)
    $policy$;
  END IF;
END;
$$;

-- =============================================================================
-- Requêtes de vérification (après premier run du pipeline) :
-- =============================================================================
--
-- -- Top SCPI par TD avec traçabilité :
-- SELECT scpi_slug, nom, td, tof, prime_decote, source_period, source_confidence,
--        updated_at
--   FROM public.scpi_indicators
--  WHERE source_confidence >= 0.6
--  ORDER BY td DESC NULLS LAST;
--
-- -- SCPI sans données fiables (à renseigner manuellement) :
-- SELECT scpi_slug, nom, source_period, source_confidence
--   FROM public.scpi_indicators
--  WHERE source_confidence < 0.6 OR source_confidence IS NULL
--  ORDER BY scpi_slug;
