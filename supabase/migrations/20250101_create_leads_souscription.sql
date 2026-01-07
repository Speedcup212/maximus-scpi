-- Migration: Création de la table leads_souscription pour le tunnel de souscription
-- Date: 2025-01-XX
-- Description: Table pour stocker les pré-dossiers du tunnel de souscription conforme CIF/AMF
-- Statut: pending_cif → cif_validated → psi_completed → subscription_completed

CREATE TABLE IF NOT EXISTS leads_souscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  
  -- Étape 1: Contexte (déjà validé)
  context_accepted BOOLEAN NOT NULL DEFAULT false,
  
  -- Étape 2: Projet d'investissement
  primary_objective TEXT,
  secondary_objectives JSONB DEFAULT '[]'::jsonb,
  horizon INTEGER CHECK (horizon IN (5, 10, 15, 20)),
  amount DECIMAL(10, 2),
  funding_mode TEXT CHECK (funding_mode IN ('fonds_propres', 'credit', 'mixte')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('faible', 'moderee', 'elevee')),
  risk_reaction TEXT CHECK (risk_reaction IN ('securiser', 'conserver', 'renforcer')),
  scpi_knowledge BOOLEAN,
  
  -- Étape 3: Identité & Contact
  civility TEXT NOT NULL CHECK (civility IN ('Monsieur', 'Madame', 'Autre')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_last_name TEXT,
  birth_date DATE,
  birth_country TEXT,
  birth_city TEXT,
  nationality TEXT,
  legal_personality TEXT CHECK (legal_personality IN ('personne_physique', 'personne_morale')),
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Étape 4: Situation familiale & professionnelle
  marital_status TEXT CHECK (marital_status IN ('celibataire', 'marie', 'pacs', 'divorce', 'veuf', 'concubinage')),
  marital_regime TEXT CHECK (marital_regime IN ('communaute_universelle', 'communaute_legale', 'separation_biens', 'participation_aux_acquets', 'autre')),
  dependent_children INTEGER DEFAULT 0,
  profession TEXT,
  activity_sector TEXT,
  employer TEXT,
  activity_outside_eu BOOLEAN DEFAULT false,
  
  -- Étape 5: Situation fiscale & résidentielle
  housing_situation TEXT CHECK (housing_situation IN ('proprietaire', 'locataire', 'heberge', 'autre')),
  tax_residence TEXT,
  tax_residence_country TEXT,
  nif TEXT,
  average_tax_rate DECIMAL(5, 2),
  us_person BOOLEAN DEFAULT false,
  pep BOOLEAN DEFAULT false,
  
  -- Étape 6: Situation patrimoniale (déclarative)
  primary_residence DECIMAL(12, 2) DEFAULT 0,
  rental_real_estate DECIMAL(12, 2) DEFAULT 0,
  securities DECIMAL(12, 2) DEFAULT 0,
  liquidities DECIMAL(12, 2) DEFAULT 0,
  other_assets DECIMAL(12, 2) DEFAULT 0,
  debts DECIMAL(12, 2) DEFAULT 0,
  salary_pensions DECIMAL(12, 2) DEFAULT 0,
  rental_income DECIMAL(12, 2) DEFAULT 0,
  other_income DECIMAL(12, 2) DEFAULT 0,
  credits DECIMAL(12, 2) DEFAULT 0,
  rent DECIMAL(12, 2) DEFAULT 0,
  taxes DECIMAL(12, 2) DEFAULT 0,
  
  -- Étape 7: Origine des fonds (LCB-FT)
  primary_fund_origin TEXT CHECK (primary_fund_origin IN ('salaires', 'heritage', 'donation', 'vente_immobilier', 'assurance_vie', 'epargne', 'autre')),
  fund_amount DECIMAL(12, 2),
  multiple_origins BOOLEAN DEFAULT false,
  secondary_origins JSONB DEFAULT '[]'::jsonb,
  fund_origin_country TEXT,
  
  -- Étape 8: Communication & Consentements
  electronic_documents BOOLEAN DEFAULT false,
  email_consent BOOLEAN DEFAULT false,
  sms_consent BOOLEAN DEFAULT false,
  
  -- Étape 9: Validation client
  information_accuracy BOOLEAN DEFAULT false,
  risk_understanding BOOLEAN DEFAULT false,
  cif_analysis_agreement BOOLEAN DEFAULT false,
  subscription_understanding BOOLEAN DEFAULT false,
  
  -- SCPI sélectionnées
  scpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  allocation JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Statut et dates
  status TEXT NOT NULL DEFAULT 'pending_cif' CHECK (status IN ('pending_cif', 'cif_validated', 'psi_completed', 'subscription_completed', 'cancelled')),
  cif_validated_at TIMESTAMPTZ,
  psi_completed_at TIMESTAMPTZ,
  subscription_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_leads_souscription_token ON leads_souscription(token);
CREATE INDEX IF NOT EXISTS idx_leads_souscription_email ON leads_souscription(email);
CREATE INDEX IF NOT EXISTS idx_leads_souscription_status ON leads_souscription(status);
CREATE INDEX IF NOT EXISTS idx_leads_souscription_created_at ON leads_souscription(created_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_leads_souscription_updated_at
  BEFORE UPDATE ON leads_souscription
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE leads_souscription ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs anonymes peuvent insérer
CREATE POLICY "Anonymous can insert" ON leads_souscription
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent lire leurs propres leads
CREATE POLICY "Authenticated can read" ON leads_souscription
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Les utilisateurs authentifiés peuvent mettre à jour leurs propres leads
CREATE POLICY "Authenticated can update own" ON leads_souscription
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE leads_souscription IS 'Table pour stocker les pré-dossiers du tunnel de souscription MaximusSCPI conforme CIF/AMF';
COMMENT ON COLUMN leads_souscription.token IS 'Token unique pour le suivi du pré-dossier';
COMMENT ON COLUMN leads_souscription.scpis IS 'JSON array des SCPI sélectionnées avec détails';
COMMENT ON COLUMN leads_souscription.allocation IS 'JSON object avec la répartition par SCPI (scpiId: percentage)';
COMMENT ON COLUMN leads_souscription.status IS 'Statut: pending_cif, cif_validated, psi_completed, subscription_completed, cancelled';
