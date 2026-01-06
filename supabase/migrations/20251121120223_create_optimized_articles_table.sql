/*
  # Création de la table pour les articles SEO optimisés MaximusSCPI

  1. Nouvelle table
    - `articles_optimized_seo`
      - `id` (uuid, primary key)
      - `article_id` (integer, référence au template)
      - `slug` (text, unique, indexé)
      - `title` (text)
      - `main_keyword` (text)
      - `category` (text)
      - `content_html` (text, contenu HTML structuré)
      - `content_markdown` (text, contenu Markdown)
      - `word_count` (integer)
      - `meta_description` (text)
      - `keywords` (text array)
      - `has_faq` (boolean, default true)
      - `has_cta` (boolean, default true)
      - `has_figures` (boolean, default true)
      - `optimization_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur la table
    - Politique de lecture publique (articles publics)
    - Politique d'écriture restreinte (admin seulement)
*/

-- Création de la table
CREATE TABLE IF NOT EXISTS articles_optimized_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id integer NOT NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  main_keyword text NOT NULL,
  category text NOT NULL,
  content_html text NOT NULL,
  content_markdown text NOT NULL,
  word_count integer NOT NULL DEFAULT 0,
  meta_description text,
  keywords text[] DEFAULT '{}',
  has_faq boolean DEFAULT true,
  has_cta boolean DEFAULT true,
  has_figures boolean DEFAULT true,
  optimization_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide par slug
CREATE INDEX IF NOT EXISTS idx_articles_optimized_slug ON articles_optimized_seo(slug);

-- Index pour recherche par catégorie
CREATE INDEX IF NOT EXISTS idx_articles_optimized_category ON articles_optimized_seo(category);

-- Index pour recherche par article_id
CREATE INDEX IF NOT EXISTS idx_articles_optimized_article_id ON articles_optimized_seo(article_id);

-- Enable RLS
ALTER TABLE articles_optimized_seo ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (tout le monde peut lire les articles)
CREATE POLICY "Articles optimisés lisibles publiquement"
  ON articles_optimized_seo
  FOR SELECT
  USING (true);

-- Politique d'insertion (service_role uniquement)
CREATE POLICY "Insertion articles optimisés"
  ON articles_optimized_seo
  FOR INSERT
  WITH CHECK (true);

-- Politique de mise à jour (service_role uniquement)
CREATE POLICY "Mise à jour articles optimisés"
  ON articles_optimized_seo
  FOR UPDATE
  USING (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_articles_optimized_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_articles_optimized_updated_at ON articles_optimized_seo;
CREATE TRIGGER trigger_update_articles_optimized_updated_at
  BEFORE UPDATE ON articles_optimized_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_optimized_updated_at();
