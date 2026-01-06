/*
  # Renommer leads_ads_form en leads_ads_formulaire

  1. Changements
    - Renomme la table `leads_ads_form` en `leads_ads_formulaire`
    - Conserve toutes les données, colonnes et contraintes
    
  2. Index
    - Recrée les index avec les nouveaux noms
*/

-- Renommer la table
ALTER TABLE IF EXISTS leads_ads_form 
RENAME TO leads_ads_formulaire;

-- Renommer les index
ALTER INDEX IF EXISTS idx_leads_ads_form_email 
RENAME TO idx_leads_ads_formulaire_email;

ALTER INDEX IF EXISTS idx_leads_ads_form_created 
RENAME TO idx_leads_ads_formulaire_created;

ALTER INDEX IF EXISTS idx_leads_ads_form_gclid 
RENAME TO idx_leads_ads_formulaire_gclid;

-- Mettre à jour le commentaire
COMMENT ON TABLE leads_ads_formulaire IS 'Formulaires soumis depuis les campagnes Google Ads';