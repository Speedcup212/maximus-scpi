/*
  # Créer table de métadonnées sémantiques des pages

  ## Description
  Table pour stocker les métadonnées des pages (SCPI, articles, landing pages)
  permettant un maillage intelligent automatisé basé sur les tags et catégories.

  ## Nouvelles Tables
  - `semantic_pages`
    - `id` (uuid, primary key)
    - `slug` (text, unique) - URL de la page (/scpi-comete, /fonds-euros-ou-scpi, etc.)
    - `title` (text) - Titre de la page pour les liens
    - `page_type` (text) - Type: scpi_page, article, landing_page, hub_page
    - `category` (text) - Catégorie principale (bureaux, commerces, sante, fiscalite, etc.)
    - `subcategory` (text) - Sous-catégorie optionnelle
    - `tags` (text[]) - Array de tags pour matching sémantique
    - `priority` (integer) - Priorité SEO (1-10, 10 = tête de cocon)
    - `parent_slug` (text) - Slug de la page mère (relation hiérarchique)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `active` (boolean) - Statut de publication

  ## Sécurité
  - Enable RLS
  - Politique SELECT publique pour lecture
  - Pas de politique INSERT/UPDATE/DELETE (admin uniquement)

  ## Index
  - Index sur slug pour recherche rapide
  - Index sur page_type + category pour filtrage
  - Index GIN sur tags pour recherche full-text
*/

-- Créer la table semantic_pages
CREATE TABLE IF NOT EXISTS semantic_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  page_type text NOT NULL CHECK (page_type IN ('scpi_page', 'article', 'landing_page', 'hub_page', 'gestionnaire')),
  category text,
  subcategory text,
  tags text[] DEFAULT '{}',
  priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  parent_slug text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Activer RLS
ALTER TABLE semantic_pages ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : tout le monde peut lire les pages actives
CREATE POLICY "Pages actives lisibles par tous"
  ON semantic_pages
  FOR SELECT
  USING (active = true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_semantic_pages_slug ON semantic_pages(slug);
CREATE INDEX IF NOT EXISTS idx_semantic_pages_type_category ON semantic_pages(page_type, category);
CREATE INDEX IF NOT EXISTS idx_semantic_pages_tags ON semantic_pages USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_semantic_pages_priority ON semantic_pages(priority DESC) WHERE active = true;

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_semantic_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER semantic_pages_updated_at
  BEFORE UPDATE ON semantic_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_semantic_pages_updated_at();

-- Insérer quelques exemples de données (têtes de cocon)
INSERT INTO semantic_pages (slug, title, page_type, category, tags, priority, parent_slug) VALUES
  -- Têtes de Cocon (Priority 10)
  ('/', 'Comparateur SCPI 2025', 'hub_page', 'hub', '{scpi, comparateur, rendement, investissement}', 10, NULL),
  ('/meilleures-scpi-rendement', 'Meilleures SCPI de Rendement 2025', 'hub_page', 'rendement', '{scpi, rendement, top, classement, meilleure}', 10, '/'),
  ('/comprendre-scpi', 'Comprendre les SCPI : Guide Complet', 'hub_page', 'education', '{scpi, guide, comprendre, debutant, fonctionnement}', 10, '/'),
  
  -- Pages Sectorielles (Priority 8)
  ('/scpi-bureaux', 'SCPI Bureaux : Investissement Tertiaire', 'landing_page', 'bureaux', '{scpi, bureaux, tertiaire, immobilier}', 8, '/meilleures-scpi-rendement'),
  ('/scpi-commerces', 'SCPI Commerces : Retail & Distribution', 'landing_page', 'commerces', '{scpi, commerces, retail, distribution}', 8, '/meilleures-scpi-rendement'),
  ('/scpi-sante', 'SCPI Santé : EHPAD & Cliniques', 'landing_page', 'sante', '{scpi, sante, ehpad, cliniques, medical}', 8, '/meilleures-scpi-rendement'),
  ('/scpi-logistique', 'SCPI Logistique : Entrepôts E-Commerce', 'landing_page', 'logistique', '{scpi, logistique, entrepots, ecommerce}', 8, '/meilleures-scpi-rendement'),
  
  -- Pages Géographiques (Priority 8)
  ('/scpi-europeennes', 'SCPI Européennes : Diversification Internationale', 'landing_page', 'geographie', '{scpi, europe, europeen, international, diversification}', 8, '/meilleures-scpi-rendement'),
  ('/scpi-france', 'SCPI France : Immobilier National', 'landing_page', 'geographie', '{scpi, france, national, francais}', 8, '/meilleures-scpi-rendement'),
  
  -- Pages Objectifs (Priority 8)
  ('/preparer-retraite-scpi', 'Préparer sa Retraite avec les SCPI', 'landing_page', 'objectif', '{scpi, retraite, revenu, complementaire, pension}', 8, '/'),
  ('/revenu-complementaire-scpi', 'Revenu Complémentaire avec les SCPI', 'landing_page', 'objectif', '{scpi, revenu, complementaire, passif, mensuel}', 8, '/'),
  
  -- Pages Gestionnaires (Priority 7)
  ('/alderan-scpi', 'Alderan : Leader SCPI Européennes', 'gestionnaire', 'gestionnaire', '{alderan, gestionnaire, europeen, diversipierre, comete}', 7, '/scpi-europeennes'),
  ('/perial-asset-management-scpi', 'Perial Asset Management', 'gestionnaire', 'gestionnaire', '{perial, gestionnaire, europeen, pfo2}', 7, '/scpi-europeennes'),
  ('/iroko-scpi', 'Iroko : SCPI Diversifiées', 'gestionnaire', 'gestionnaire', '{iroko, gestionnaire, zen, rendement, diversifie}', 7, '/meilleures-scpi-rendement')
ON CONFLICT (slug) DO NOTHING;
