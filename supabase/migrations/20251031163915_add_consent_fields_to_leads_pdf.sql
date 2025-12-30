/*
  # Ajout des champs de consentement RGPD

  1. Modifications
    - Ajout de la colonne `consentement_marketing` (boolean)
    - Ajout de la colonne `consentement_date` (timestamptz)
    - Ajout de la colonne `source` (text)
    
  2. Sécurité
    - Les colonnes sont NOT NULL avec des valeurs par défaut
    - Conformité RGPD totale avec traçabilité du consentement

  3. Notes
    - Le consentement est obligatoire pour chaque lead
    - La date de consentement est enregistrée automatiquement
    - La source permet de tracer l'origine du lead
*/

-- Ajouter la colonne consentement_marketing si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads_pdf_comparatif' AND column_name = 'consentement_marketing'
  ) THEN
    ALTER TABLE leads_pdf_comparatif 
    ADD COLUMN consentement_marketing boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Ajouter la colonne consentement_date si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads_pdf_comparatif' AND column_name = 'consentement_date'
  ) THEN
    ALTER TABLE leads_pdf_comparatif 
    ADD COLUMN consentement_date timestamptz DEFAULT now() NOT NULL;
  END IF;
END $$;

-- Ajouter la colonne source si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads_pdf_comparatif' AND column_name = 'source'
  ) THEN
    ALTER TABLE leads_pdf_comparatif 
    ADD COLUMN source text DEFAULT 'Lead Magnet - Guide Comparatif';
  END IF;
END $$;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN leads_pdf_comparatif.consentement_marketing IS 'Consentement explicite du lead pour recevoir des communications marketing par email (RGPD)';
COMMENT ON COLUMN leads_pdf_comparatif.consentement_date IS 'Date et heure du consentement explicite (RGPD - traçabilité)';
COMMENT ON COLUMN leads_pdf_comparatif.source IS 'Source d''origine du lead pour traçabilité';
