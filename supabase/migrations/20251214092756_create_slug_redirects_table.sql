/*
  # Créer table de redirections de slugs

  ## Description
  Table pour gérer les redirections d'anciens slugs vers les nouveaux.
  Permet de ne jamais casser une URL déjà publiée et indexée.

  ## Nouvelles Tables
  - `slug_redirects`
    - `id` (uuid, primary key)
    - `from_slug` (text, unique) - Ancien slug
    - `to_slug` (text) - Nouveau slug (destination)
    - `redirect_type` (integer) - Type de redirection (301 permanent, 302 temporaire)
    - `created_at` (timestamptz) - Date de création
    - `active` (boolean) - Statut de la redirection

  ## Sécurité
  - Enable RLS
  - Politique SELECT publique pour permettre la lecture des redirections
  - Pas de politique INSERT/UPDATE/DELETE (admin uniquement)

  ## Index
  - Index unique sur from_slug pour recherche rapide
  - Index sur active pour filtrer les redirections actives
*/

-- Créer la table slug_redirects
CREATE TABLE IF NOT EXISTS slug_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_slug text UNIQUE NOT NULL,
  to_slug text NOT NULL,
  redirect_type integer DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Activer RLS
ALTER TABLE slug_redirects ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : tout le monde peut lire les redirections actives
CREATE POLICY "Redirections actives lisibles par tous"
  ON slug_redirects
  FOR SELECT
  USING (active = true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_slug_redirects_from_slug ON slug_redirects(from_slug);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_active ON slug_redirects(active) WHERE active = true;

-- Ajouter quelques redirections existantes depuis _redirects
INSERT INTO slug_redirects (from_slug, to_slug, redirect_type) VALUES
  ('fonds-euros-ou-scpi-2025', 'fonds-euros-ou-scpi', 301),
  ('scpi-direct-ou-assurance-vie', 'scpi-en-direct-ou-assurance-vie', 301),
  ('scpi-credit-effet-levier-2025', 'scpi-a-credit-effet-levier', 301),
  ('fiscalite-scpi-2025-guide-complet', 'fiscalite-scpi-guide-complet', 301),
  ('garder-fonds-euros-ou-tout-passer-scpi', 'garder-fonds-euros-ou-passer-scpi', 301),
  ('scpi-45-ans-150000-euros-strategie', 'scpi-strategie-45-ans-150000-euros', 301),
  ('scpi-tmi-11-ou-30-pourcent-rentabilite', 'scpi-tmi-11-ou-30-rentabilite', 301),
  ('scpi-credit-ou-cash-taux-3-4-pourcent', 'scpi-credit-ou-cash-taux-3-4', 301),
  ('risque-perte-scpi-scenarios-baisse', 'risques-scpi-scenarios-baisse', 301),
  ('portefeuille-scpi-100-pourcent-ligne-maximus', 'portefeuille-scpi-en-ligne', 301)
ON CONFLICT (from_slug) DO NOTHING;
