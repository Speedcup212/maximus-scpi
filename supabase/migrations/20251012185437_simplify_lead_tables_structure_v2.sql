/*
  # Simplification de l'architecture des leads

  1. Nouvelles tables
    - `leads_site` : Leads organiques (formulaire + Calendly du site)
    - `leads_ads_calendly` : RDV Calendly depuis Google Ads
    - `leads_ads_form` : Formulaires depuis Google Ads
  
  2. Migration des données
    - Migrer données de `leads` vers `leads_site`
    - Migrer données de `google_ads_leads` vers `leads_ads_form`
    - Migrer données de `crm_leads` selon `type_lead`
  
  3. Suppression anciennes tables
    - Drop `leads`
    - Drop `google_ads_leads`
    - Drop `crm_leads`
  
  4. Sécurité
    - RLS désactivé sur toutes les tables (accès CRM direct)
*/

-- =====================================================
-- 1. CRÉATION DES NOUVELLES TABLES
-- =====================================================

-- Table pour leads organiques du site (formulaire + Calendly)
CREATE TABLE IF NOT EXISTS leads_site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text,
  email text NOT NULL,
  telephone text,
  montant text,
  commentaire text,
  creneau text,
  profil_risque text,
  profil_esg text,
  scpi text[],
  horizon text,
  objectifs text,
  tmi text,
  situation_professionnelle text,
  portfolio_selection text[],
  type_contact text DEFAULT 'formulaire' CHECK (type_contact IN ('formulaire', 'calendly')),
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'contacte', 'qualifie', 'converti', 'perdu')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  notes text
);

-- Table pour RDV Calendly via Google Ads
CREATE TABLE IF NOT EXISTS leads_ads_calendly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text,
  email text NOT NULL,
  telephone text,
  montant text,
  commentaire text,
  creneau text NOT NULL,
  profil_risque text,
  profil_esg text,
  scpi text[],
  horizon text,
  objectifs text,
  tmi text,
  portfolio_selection text[],
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'contacte', 'qualifie', 'converti', 'perdu')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  notes text
);

COMMENT ON TABLE leads_ads_calendly IS 'RDV Calendly réservés depuis les campagnes Google Ads';

-- Table pour formulaires via Google Ads
CREATE TABLE IF NOT EXISTS leads_ads_form (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  montant text NOT NULL,
  commentaire text,
  profil_risque text,
  profil_esg text,
  scpi text[],
  horizon text,
  objectifs text,
  tmi text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'contacte', 'qualifie', 'converti', 'perdu')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  notes text
);

COMMENT ON TABLE leads_ads_form IS 'Formulaires soumis depuis les campagnes Google Ads';

-- =====================================================
-- 2. MIGRATION DES DONNÉES
-- =====================================================

-- Migrer depuis leads vers leads_site
INSERT INTO leads_site (
  id, nom, prenom, email, telephone, montant, commentaire,
  profil_risque, profil_esg, horizon, objectifs, tmi, 
  situation_professionnelle, statut, created_at, updated_at, 
  contacted_at, notes, type_contact
)
SELECT 
  id, 
  nom, 
  prenom, 
  email, 
  telephone, 
  montant_investissement::text,
  message,
  NULL, -- profil_risque
  NULL, -- profil_esg
  horizon_placement,
  objectif_investissement,
  tmi,
  situation_professionnelle,
  statut,
  created_at,
  updated_at,
  contacted_at,
  notes,
  'formulaire'
FROM leads
WHERE EXISTS (SELECT 1 FROM leads);

-- Migrer depuis google_ads_leads vers leads_ads_form
INSERT INTO leads_ads_form (
  id, nom, prenom, email, telephone, montant, commentaire,
  utm_source, utm_medium, utm_campaign, gclid,
  statut, created_at, updated_at
)
SELECT 
  id,
  nom,
  prenom,
  email,
  telephone,
  montant_investissement,
  commentaire,
  utm_source,
  utm_medium,
  utm_campaign,
  gclid,
  statut,
  created_at,
  updated_at
FROM google_ads_leads
WHERE EXISTS (SELECT 1 FROM google_ads_leads);

-- Migrer depuis crm_leads type='formulaire' ou type='calendly' vers leads_site
INSERT INTO leads_site (
  nom, email, telephone, montant, commentaire, creneau,
  profil_risque, profil_esg, scpi, horizon, objectifs, tmi,
  portfolio_selection, type_contact, created_at, updated_at
)
SELECT 
  nom,
  email,
  telephone,
  montant,
  commentaire,
  creneau,
  profil_risque,
  profil_esg,
  scpi,
  horizon,
  objectifs,
  tmi,
  portfolio_selection,
  CASE 
    WHEN type_lead = 'calendly' THEN 'calendly'
    ELSE 'formulaire'
  END,
  created_at,
  updated_at
FROM crm_leads
WHERE type_lead IN ('formulaire', 'calendly')
AND EXISTS (SELECT 1 FROM crm_leads WHERE type_lead IN ('formulaire', 'calendly'));

-- Migrer depuis crm_leads type='google_ads' vers leads_ads_calendly
INSERT INTO leads_ads_calendly (
  nom, email, telephone, montant, commentaire, creneau,
  profil_risque, profil_esg, scpi, horizon, objectifs, tmi,
  portfolio_selection, created_at, updated_at
)
SELECT 
  nom,
  email,
  telephone,
  montant,
  commentaire,
  creneau,
  profil_risque,
  profil_esg,
  scpi,
  horizon,
  objectifs,
  tmi,
  portfolio_selection,
  created_at,
  updated_at
FROM crm_leads
WHERE type_lead = 'google_ads'
AND EXISTS (SELECT 1 FROM crm_leads WHERE type_lead = 'google_ads');

-- =====================================================
-- 3. SUPPRESSION DES ANCIENNES TABLES (avec CASCADE)
-- =====================================================

-- Supprimer les anciennes tables avec tous leurs triggers et fonctions
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS google_ads_leads CASCADE;
DROP TABLE IF EXISTS crm_leads CASCADE;

-- Supprimer la fonction notify_new_lead si elle existe encore
DROP FUNCTION IF EXISTS notify_new_lead() CASCADE;

-- =====================================================
-- 4. SÉCURITÉ (RLS DÉSACTIVÉ pour accès CRM)
-- =====================================================

ALTER TABLE leads_site DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads_ads_calendly DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads_ads_form DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_site_email ON leads_site(email);
CREATE INDEX IF NOT EXISTS idx_leads_site_created ON leads_site(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_site_statut ON leads_site(statut);

CREATE INDEX IF NOT EXISTS idx_leads_ads_calendly_email ON leads_ads_calendly(email);
CREATE INDEX IF NOT EXISTS idx_leads_ads_calendly_created ON leads_ads_calendly(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ads_calendly_gclid ON leads_ads_calendly(gclid);

CREATE INDEX IF NOT EXISTS idx_leads_ads_form_email ON leads_ads_form(email);
CREATE INDEX IF NOT EXISTS idx_leads_ads_form_created ON leads_ads_form(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ads_form_gclid ON leads_ads_form(gclid);