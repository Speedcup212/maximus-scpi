/*
  # Table Articles SEO - Structure complète

  ## Description
  Crée une table pour stocker tous les articles du site avec leurs métadonnées SEO complètes.
  Cette table permet de gérer dynamiquement les 30+ articles d'éducation.

  ## Nouvelles Tables
  - `articles_seo`
    - `id` (uuid, primary key)
    - `slug` (text, unique) - URL de l'article
    - `title` (text) - Titre de l'article
    - `meta_description` (text) - Description META pour SEO
    - `keywords` (text[]) - Mots-clés SEO
    - `category` (text) - Catégorie de l'article
    - `main_keyword` (text) - Mot-clé principal
    - `search_intent` (text) - Intention de recherche
    - `target_audience` (text) - Public cible
    - `component_name` (text) - Nom du composant React à charger
    - `excerpt` (text) - Extrait court pour les listes
    - `word_count` (integer) - Nombre de mots
    - `read_time` (integer) - Temps de lecture estimé
    - `featured` (boolean) - Article mis en avant
    - `published_at` (timestamptz) - Date de publication
    - `status` (text) - Statut (draft, published, archived)
    - `created_at` (timestamptz) - Date de création
    - `updated_at` (timestamptz) - Date de mise à jour

  ## Sécurité
  - Enable RLS sur `articles_seo`
  - Politique SELECT pour lecture publique (tout le monde peut lire)
  - Pas de politique INSERT/UPDATE/DELETE (admin uniquement via service role)

  ## Index
  - Index unique sur `slug` pour recherche rapide
  - Index sur `status` et `published_at` pour filtrage
  - Index sur `category` pour navigation par catégorie
*/

-- Créer la table articles_seo
CREATE TABLE IF NOT EXISTS articles_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text NOT NULL,
  keywords text[] DEFAULT '{}',
  category text NOT NULL,
  main_keyword text NOT NULL,
  search_intent text NOT NULL,
  target_audience text NOT NULL,
  component_name text NOT NULL,
  excerpt text NOT NULL,
  word_count integer DEFAULT 0,
  read_time integer DEFAULT 0,
  featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE articles_seo ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : tout le monde peut lire les articles publiés
CREATE POLICY "Articles publiés lisibles par tous"
  ON articles_seo
  FOR SELECT
  USING (status = 'published');

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_articles_seo_slug ON articles_seo(slug);
CREATE INDEX IF NOT EXISTS idx_articles_seo_status_published ON articles_seo(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_seo_category ON articles_seo(category);
CREATE INDEX IF NOT EXISTS idx_articles_seo_featured ON articles_seo(featured) WHERE featured = true;