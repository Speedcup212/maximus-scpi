/*
  # Renommer la table Google Ads leads

  1. Changements
    - Renomme `google_ads_comete_leads` en `google_ads_leads`
    - Rend la table générique pour toutes les campagnes Google Ads
    - Conserve toutes les données et contraintes existantes
    
  2. Sécurité
    - Maintient les politiques RLS existantes
*/

-- Renommer la table
ALTER TABLE IF EXISTS google_ads_comete_leads 
RENAME TO google_ads_leads;

-- Mettre à jour le commentaire de la table
COMMENT ON TABLE google_ads_leads IS 'Leads provenant des campagnes Google Ads (toutes SCPI)';

-- Mettre à jour la valeur par défaut du champ source pour être plus générique
ALTER TABLE google_ads_leads 
ALTER COLUMN source SET DEFAULT 'Google Ads';