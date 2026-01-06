/*
  # Remove All Unused Indexes - Security Audit Compliance

  ## Problem
  Security scanner flagging 21 unused indexes across multiple tables.
  
  ## Solution
  Drop all currently unused indexes to pass security audit. These indexes were created
  in anticipation of features not yet deployed to production.
  
  ## Indexes Removed
  
  ### Articles Tables
  - articles_analyse_actu: 4 indexes (table is obsolete)
  - articles_seo: 3 indexes (features not yet deployed)
  
  ### Redirect Tables  
  - redirects: 2 indexes (old table, replaced by slug_redirects)
  - slug_redirects: 1 index (not yet queried by frontend)
  
  ### Semantic Pages
  - semantic_pages: 4 indexes (cocon sémantique not yet integrated)
  
  ### Lead Tables
  - contacts_site: 1 index
  - leads_ads_calendly: 2 indexes  
  - leads_ads_formulaire: 3 indexes
  - leads_pdf_comparatif: 1 index
  
  ## Recreate When Needed
  These indexes can be easily recreated when:
  - DynamicArticlePage queries articles_seo by slug
  - SemanticLinks/SimilarArticles components go live
  - CRM dashboard requires lead filtering
  
  ## Security Note
  The function search_path issue was already fixed in previous migration.
*/

-- Drop all unused indexes on articles_analyse_actu (obsolete table)
DROP INDEX IF EXISTS idx_articles_analyse_actu_slug;
DROP INDEX IF EXISTS idx_articles_analyse_actu_category;
DROP INDEX IF EXISTS idx_articles_analyse_actu_status;
DROP INDEX IF EXISTS idx_articles_analyse_actu_published_at;

-- Drop unused indexes on articles_seo (not yet queried in production)
DROP INDEX IF EXISTS idx_articles_seo_slug;
DROP INDEX IF EXISTS idx_articles_seo_category;
DROP INDEX IF EXISTS idx_articles_seo_featured;

-- Drop unused indexes on old redirects table (replaced by slug_redirects)
DROP INDEX IF EXISTS idx_redirects_active;
DROP INDEX IF EXISTS idx_redirects_from_slug;

-- Drop unused indexes on slug_redirects (not yet queried by frontend)
DROP INDEX IF EXISTS idx_slug_redirects_active;

-- Drop unused indexes on semantic_pages (cocon sémantique not yet integrated)
DROP INDEX IF EXISTS idx_semantic_pages_slug;
DROP INDEX IF EXISTS idx_semantic_pages_type_category;
DROP INDEX IF EXISTS idx_semantic_pages_tags;
DROP INDEX IF EXISTS idx_semantic_pages_priority;

-- Drop unused indexes on lead tables (CRM not yet using these filters)
DROP INDEX IF EXISTS idx_leads_site_statut;
DROP INDEX IF EXISTS idx_leads_ads_calendly_email;
DROP INDEX IF EXISTS idx_leads_ads_calendly_gclid;
DROP INDEX IF EXISTS idx_leads_ads_formulaire_email;
DROP INDEX IF EXISTS idx_leads_ads_formulaire_created;
DROP INDEX IF EXISTS idx_leads_ads_formulaire_gclid;
DROP INDEX IF EXISTS idx_leads_pdf_source_page;

-- Add documentation comments to tables for future index recreation
COMMENT ON TABLE articles_seo IS 'Articles SEO optimisés - Recréer idx_articles_seo_slug quand DynamicArticlePage est déployé';
COMMENT ON TABLE semantic_pages IS 'Pages pour cocon sémantique - Recréer indexes quand SemanticLinks/SimilarArticles sont intégrés';
COMMENT ON TABLE slug_redirects IS 'Redirections slug - Recréer idx_slug_redirects_from_slug quand useSlugRedirect() est activé';
COMMENT ON TABLE contacts_site IS 'Contacts site web - Recréer idx_leads_site_statut si CRM dashboard nécessite filtrage';
COMMENT ON TABLE leads_pdf_comparatif IS 'Leads PDF - Recréer idx_leads_pdf_source_page si analytics par source requis';
