/*
  # Création de la table pour les articles générés automatiquement
  
  1. Nouvelle Table
    - `articles_generated` : stocke les articles SEO générés
      - `id` (uuid, primary key)
      - `article_id` (int, référence ID 1-30)
      - `slug` (text, unique)
      - `title` (text)
      - `meta_description` (text)
      - `keywords` (text[])
      - `category` (text)
      - `content` (text) - contenu HTML complet de l'article
      - `word_count` (int)
      - `read_time` (int)
      - `main_keyword` (text)
      - `search_intent` (text)
      - `target_audience` (text)
      - `featured` (boolean)
      - `published_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `generated_at` (timestamptz)
      - `status` (text) - draft, published, archived
  
  2. Sécurité
    - RLS activée
    - Lecture publique pour articles publiés
    - Écriture réservée aux admins
*/

CREATE TABLE IF NOT EXISTS articles_generated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id int NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_description text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  category text NOT NULL,
  content text NOT NULL,
  word_count int NOT NULL DEFAULT 0,
  read_time int NOT NULL DEFAULT 0,
  main_keyword text NOT NULL,
  search_intent text NOT NULL,
  target_audience text NOT NULL,
  featured boolean DEFAULT false,
  published_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  generated_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_articles_generated_article_id ON articles_generated(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_generated_slug ON articles_generated(slug);
CREATE INDEX IF NOT EXISTS idx_articles_generated_status ON articles_generated(status);
CREATE INDEX IF NOT EXISTS idx_articles_generated_category ON articles_generated(category);
CREATE INDEX IF NOT EXISTS idx_articles_generated_published_at ON articles_generated(published_at);

-- Enable RLS
ALTER TABLE articles_generated ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique pour les articles publiés
CREATE POLICY "Public can read published articles"
  ON articles_generated
  FOR SELECT
  TO public
  USING (status = 'published');

-- Policy: Lecture de tous les articles pour les utilisateurs authentifiés (admins)
CREATE POLICY "Authenticated users can read all articles"
  ON articles_generated
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Les utilisateurs authentifiés peuvent créer des articles
CREATE POLICY "Authenticated users can insert articles"
  ON articles_generated
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent mettre à jour des articles
CREATE POLICY "Authenticated users can update articles"
  ON articles_generated
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent supprimer des articles
CREATE POLICY "Authenticated users can delete articles"
  ON articles_generated
  FOR DELETE
  TO authenticated
  USING (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_articles_generated_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_articles_generated_updated_at_trigger ON articles_generated;
CREATE TRIGGER update_articles_generated_updated_at_trigger
  BEFORE UPDATE ON articles_generated
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_generated_updated_at();
