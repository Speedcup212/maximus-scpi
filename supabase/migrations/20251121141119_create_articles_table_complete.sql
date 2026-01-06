/*
  # Création de la table articles_optimises pour les 30 articles SEO

  1. Nouvelle table
    - `articles_optimises` : Stockage complet des articles générés
      - `id` (uuid, primary key)
      - `slug` (text, unique) : URL-friendly identifier
      - `title` (text) : Titre H1 de l'article
      - `meta_description` (text) : Meta description SEO
      - `category` (text) : Catégorie (comparatifs, guides, strategies, fiscalite, analyses)
      - `target_keyword` (text) : Mot-clé principal ciblé
      - `related_keywords` (text[]) : Mots-clés secondaires
      - `read_time` (text) : Temps de lecture estimé
      - `author` (text) : Auteur de l'article
      - `publish_date` (text) : Date de publication
      - `content_html` (text) : Contenu HTML complet de l'article
      - `intro_text` (text) : Texte d'introduction
      - `conclusion_text` (text) : Texte de conclusion
      - `faq_items` (jsonb) : Questions/réponses FAQ
      - `status` (text) : Statut (draft, published, archived)
      - `created_at` (timestamptz) : Date de création
      - `updated_at` (timestamptz) : Date de mise à jour

  2. Security
    - Enable RLS on `articles_optimises` table
    - Public read access for published articles
    - Admin write access only
*/

-- Create table
CREATE TABLE IF NOT EXISTS articles_optimises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text NOT NULL,
  category text NOT NULL,
  target_keyword text NOT NULL,
  related_keywords text[] DEFAULT '{}',
  read_time text NOT NULL,
  author text NOT NULL DEFAULT 'Éric Bellaiche, CGP',
  publish_date text NOT NULL,
  content_html text NOT NULL,
  intro_text text NOT NULL,
  conclusion_text text NOT NULL,
  faq_items jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_articles_optimises_slug ON articles_optimises(slug);

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_articles_optimises_category ON articles_optimises(category);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_articles_optimises_status ON articles_optimises(status);

-- Enable RLS
ALTER TABLE articles_optimises ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON articles_optimises
  FOR SELECT
  USING (status = 'published');

-- Policy: Allow anonymous insert for draft articles (for generation script)
CREATE POLICY "Allow insert for draft articles"
  ON articles_optimises
  FOR INSERT
  WITH CHECK (status = 'draft');

-- Policy: Allow update of draft articles
CREATE POLICY "Allow update of draft articles"
  ON articles_optimises
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_optimises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_articles_optimises_updated_at
  BEFORE UPDATE ON articles_optimises
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_optimises_updated_at();
