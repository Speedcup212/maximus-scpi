/*
  # Suppression des tables d'articles

  1. Tables supprimées
    - `articles_generated` - Articles générés automatiquement
    - `articles_optimized_seo` - Articles optimisés pour le SEO

  2. Raison
    - Demande explicite de suppression des tables d'articles
*/

-- Suppression de la table articles_optimized_seo
DROP TABLE IF EXISTS articles_optimized_seo CASCADE;

-- Suppression de la table articles_generated
DROP TABLE IF EXISTS articles_generated CASCADE;