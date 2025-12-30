/*
  # Table pour les leads Google Ads - SCPI Comète
  
  ## Description
  Table dédiée pour stocker les leads provenant de la campagne Google Ads
  pour la page SCPI Comète. Cette table permet de séparer et tracker 
  spécifiquement les conversions Google Ads.
  
  ## 1. Nouvelle Table
    - `google_ads_comete_leads`
      - `id` (uuid, primary key) - Identifiant unique du lead
      - `nom` (text) - Nom du prospect
      - `prenom` (text) - Prénom du prospect
      - `email` (text) - Email du prospect
      - `telephone` (text) - Numéro de téléphone
      - `montant_investissement` (text) - Montant que le prospect souhaite investir
      - `commentaire` (text, nullable) - Commentaire ou message du prospect
      - `source` (text) - Source du lead (ex: "Google Ads - SCPI Comète")
      - `utm_source` (text, nullable) - Paramètre UTM source
      - `utm_medium` (text, nullable) - Paramètre UTM medium
      - `utm_campaign` (text, nullable) - Paramètre UTM campaign
      - `gclid` (text, nullable) - Google Click ID pour tracking conversions
      - `statut` (text) - Statut du lead (nouveau, contacté, qualifié, converti)
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de dernière modification
  
  ## 2. Sécurité
    - Enable RLS sur la table
    - Politique INSERT pour permettre les soumissions anonymes (formulaire public)
    - Politique SELECT pour les utilisateurs authentifiés uniquement
    - Politique UPDATE pour les utilisateurs authentifiés uniquement
  
  ## 3. Index
    - Index sur email pour recherche rapide
    - Index sur created_at pour tri chronologique
    - Index sur statut pour filtrage
    - Index sur gclid pour tracking Google Ads
  
  ## Notes importantes
    - Cette table est dédiée aux campagnes Google Ads Comète
    - Les leads sont créés de manière anonyme (pas d'auth requise pour INSERT)
    - Seuls les admins peuvent consulter/modifier les leads
    - Le gclid permet le tracking des conversions Google Ads
*/

-- Créer la table google_ads_comete_leads
CREATE TABLE IF NOT EXISTS google_ads_comete_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  montant_investissement text NOT NULL,
  commentaire text,
  source text DEFAULT 'Google Ads - SCPI Comète',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'contacte', 'qualifie', 'converti', 'perdu')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE google_ads_comete_leads ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion anonyme (formulaire public)
CREATE POLICY "Permettre insertion anonyme pour formulaire"
  ON google_ads_comete_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique pour permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "Permettre insertion authentifiée"
  ON google_ads_comete_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique pour lecture par utilisateurs authentifiés uniquement
CREATE POLICY "Lecture pour utilisateurs authentifiés"
  ON google_ads_comete_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour mise à jour par utilisateurs authentifiés uniquement
CREATE POLICY "Mise à jour pour utilisateurs authentifiés"
  ON google_ads_comete_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_google_ads_comete_leads_email 
  ON google_ads_comete_leads(email);

CREATE INDEX IF NOT EXISTS idx_google_ads_comete_leads_created_at 
  ON google_ads_comete_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_google_ads_comete_leads_statut 
  ON google_ads_comete_leads(statut);

CREATE INDEX IF NOT EXISTS idx_google_ads_comete_leads_gclid 
  ON google_ads_comete_leads(gclid);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_google_ads_comete_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appeler la fonction avant chaque UPDATE
DROP TRIGGER IF EXISTS set_google_ads_comete_leads_updated_at ON google_ads_comete_leads;
CREATE TRIGGER set_google_ads_comete_leads_updated_at
  BEFORE UPDATE ON google_ads_comete_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_google_ads_comete_leads_updated_at();

-- Ajouter un commentaire sur la table
COMMENT ON TABLE google_ads_comete_leads IS 'Leads provenant de la campagne Google Ads pour la page SCPI Comète';
COMMENT ON COLUMN google_ads_comete_leads.gclid IS 'Google Click ID pour tracking des conversions Google Ads';