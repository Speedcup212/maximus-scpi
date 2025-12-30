/*
  # Correction des problèmes de sécurité et optimisation

  ## Problèmes corrigés
  
  1. **Function Search Path Mutable (CRITIQUE)**
     - La fonction `update_semantic_pages_updated_at` avait un search_path mutable
     - Recréée avec `SET search_path = public` pour sécurité
  
  2. **Index inutilisés**
     - Suppression des index sur table `articles_analyse_actu` (table obsolète)
     - Suppression des index sur table `redirects` (remplacée par `slug_redirects`)
     - Conservation des index sur tables actives (semantic_pages, slug_redirects, articles_seo)
     - Ces derniers seront utilisés dès le déploiement des nouveaux composants

  ## Actions
  
  - DROP des index obsolètes
  - Recréation de la fonction trigger avec search_path fixe
  - Commentaires ajoutés sur les index conservés pour documentation
*/

-- 1. FIX CRITIQUE : Recréer la fonction avec search_path fixe (sécurité)
DROP FUNCTION IF EXISTS update_semantic_pages_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_semantic_pages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recréer le trigger
DROP TRIGGER IF EXISTS semantic_pages_updated_at ON semantic_pages;

CREATE TRIGGER semantic_pages_updated_at
  BEFORE UPDATE ON semantic_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_semantic_pages_updated_at();

-- 2. Supprimer les index sur table obsolète articles_analyse_actu
DROP INDEX IF EXISTS idx_articles_analyse_actu_slug;
DROP INDEX IF EXISTS idx_articles_analyse_actu_category;
DROP INDEX IF EXISTS idx_articles_analyse_actu_status;
DROP INDEX IF EXISTS idx_articles_analyse_actu_published_at;

-- 3. Supprimer les index sur table redirects (remplacée par slug_redirects)
DROP INDEX IF EXISTS idx_redirects_active;
DROP INDEX IF EXISTS idx_redirects_from_slug;

-- 4. Commenter les index conservés (seront utilisés en production)
COMMENT ON INDEX idx_articles_seo_slug IS 'Utilisé pour recherche rapide par slug dans DynamicArticlePage';
COMMENT ON INDEX idx_articles_seo_category IS 'Utilisé pour filtrage par catégorie dans navigation';
COMMENT ON INDEX idx_articles_seo_featured IS 'Utilisé pour articles mis en avant sur homepage';

COMMENT ON INDEX idx_slug_redirects_from_slug IS 'Utilisé par useSlugRedirect hook pour redirections automatiques';
COMMENT ON INDEX idx_slug_redirects_active IS 'Filtrage des redirections actives dans les requêtes';

COMMENT ON INDEX idx_semantic_pages_slug IS 'Recherche rapide par slug dans RelatedSCPI et SimilarArticles';
COMMENT ON INDEX idx_semantic_pages_type_category IS 'Filtrage par type et catégorie dans composants de maillage';
COMMENT ON INDEX idx_semantic_pages_tags IS 'Recherche full-text par tags dans SimilarArticles';
COMMENT ON INDEX idx_semantic_pages_priority IS 'Tri par priorité dans toutes les requêtes de maillage';

COMMENT ON INDEX idx_leads_site_statut IS 'Filtrage des contacts par statut dans CRM';
COMMENT ON INDEX idx_leads_ads_calendly_email IS 'Recherche rapide par email pour déduplication';
COMMENT ON INDEX idx_leads_ads_calendly_gclid IS 'Tracking Google Ads par GCLID';
COMMENT ON INDEX idx_leads_ads_formulaire_email IS 'Recherche rapide par email pour déduplication';
COMMENT ON INDEX idx_leads_ads_formulaire_gclid IS 'Tracking Google Ads par GCLID';
COMMENT ON INDEX idx_leads_ads_formulaire_created IS 'Tri chronologique des leads formulaire';
COMMENT ON INDEX idx_leads_pdf_source_page IS 'Analytics : tracking source page du téléchargement PDF';
