/*
  # Création de la table scores_scpi pour le système de scoring déterministe

  ## Description
  Table pour stocker les scores calculés de chaque SCPI selon la méthodologie MaximusSCPI.
  Cette table permet de :
  - Persister les scores calculés pour éviter de les recalculer à chaque fois
  - Tracer l'historique des scores (via timestamps)
  - Auditer la méthodologie de calcul via audit_trail

  ## Tables
  
  ### scores_scpi
  - `id` (uuid, PK) - Identifiant unique du score
  - `scpi_id` (integer) - Référence à la SCPI (ID local)
  - `nom` (text) - Nom de la SCPI
  - `societe_gestion` (text) - Société de gestion
  - `score_rendement` (numeric) - Score rendement (0-40 points)
  - `score_secteur` (numeric) - Score secteur (0-20 points)
  - `score_geo` (numeric) - Score géographique (0-15 points)
  - `score_qualite` (numeric) - Score qualité (0-15 points)
  - `score_taille` (numeric) - Score taille/liquidité (0-10 points)
  - `score_total` (numeric) - Score total (0-100 points)
  - `audit_trail` (jsonb) - Trace détaillée du calcul
  - `params_version` (text) - Version des paramètres utilisés
  - `created_at` (timestamptz) - Date de calcul
  - `updated_at` (timestamptz) - Dernière mise à jour

  ## Sécurité
  - RLS activé
  - Lecture publique (pour affichage)
  - Écriture réservée (service role ou admin)

  ## Index
  - Index sur scpi_id pour les jointures
  - Index sur score_total pour les classements
  - Index sur created_at pour l'historique
*/

-- Création de la table scores_scpi
CREATE TABLE IF NOT EXISTS scores_scpi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scpi_id integer NOT NULL,
  nom text NOT NULL,
  societe_gestion text,
  score_rendement numeric(5,2) NOT NULL CHECK (score_rendement >= 0 AND score_rendement <= 40),
  score_secteur numeric(5,2) NOT NULL CHECK (score_secteur >= 0 AND score_secteur <= 20),
  score_geo numeric(5,2) NOT NULL CHECK (score_geo >= 0 AND score_geo <= 15),
  score_qualite numeric(5,2) NOT NULL CHECK (score_qualite >= 0 AND score_qualite <= 15),
  score_taille numeric(5,2) NOT NULL CHECK (score_taille >= 0 AND score_taille <= 10),
  score_total numeric(5,2) NOT NULL CHECK (score_total >= 0 AND score_total <= 100),
  audit_trail jsonb NOT NULL DEFAULT '[]'::jsonb,
  params_version text DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_scores_scpi_scpi_id ON scores_scpi(scpi_id);
CREATE INDEX IF NOT EXISTS idx_scores_scpi_score_total ON scores_scpi(score_total DESC);
CREATE INDEX IF NOT EXISTS idx_scores_scpi_created_at ON scores_scpi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_scpi_nom ON scores_scpi(nom);

-- RLS : Activation
ALTER TABLE scores_scpi ENABLE ROW LEVEL SECURITY;

-- RLS : Lecture publique (tout le monde peut consulter les scores)
CREATE POLICY "Lecture publique des scores SCPI"
  ON scores_scpi
  FOR SELECT
  TO public
  USING (true);

-- RLS : Insertion/MAJ réservées au service role (ou authenticated pour tests)
CREATE POLICY "Insertion scores par authenticated"
  ON scores_scpi
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Mise à jour scores par authenticated"
  ON scores_scpi
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fonction de mise à jour automatique du updated_at
CREATE OR REPLACE FUNCTION update_scores_scpi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_scores_scpi_updated_at ON scores_scpi;
CREATE TRIGGER trigger_update_scores_scpi_updated_at
  BEFORE UPDATE ON scores_scpi
  FOR EACH ROW
  EXECUTE FUNCTION update_scores_scpi_updated_at();

-- Commentaires
COMMENT ON TABLE scores_scpi IS 'Scores calculés pour chaque SCPI selon la méthodologie MaximusSCPI déterministe';
COMMENT ON COLUMN scores_scpi.audit_trail IS 'Trace JSON des étapes de calcul pour traçabilité et reproductibilité';
COMMENT ON COLUMN scores_scpi.params_version IS 'Version des paramètres de scoring utilisés (permet évolution méthodologie)';
