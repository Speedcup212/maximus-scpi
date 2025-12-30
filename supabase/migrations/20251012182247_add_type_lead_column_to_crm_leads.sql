/*
  # Add type_lead column to crm_leads table

  1. Changes
    - Add `type_lead` column to `crm_leads` table with enum constraint
    - Values allowed: 'formulaire', 'calendly', 'google_ads'
    - Default value: 'formulaire'
    - Create index on type_lead for better filtering performance

  2. Purpose
    - Improve lead tracking clarity by distinguishing between different lead sources
    - Enable better analytics and reporting by lead type
    - Facilitate targeted follow-up based on lead origin

  3. Migration Safety
    - Uses ALTER TABLE ADD COLUMN IF NOT EXISTS
    - Sets default value for existing records
    - Non-destructive operation
*/

-- Add type_lead column with constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crm_leads' AND column_name = 'type_lead'
  ) THEN
    ALTER TABLE crm_leads ADD COLUMN type_lead text DEFAULT 'formulaire';
    
    -- Add constraint to ensure only valid values
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_type_lead_check 
      CHECK (type_lead IN ('formulaire', 'calendly', 'google_ads'));
  END IF;
END $$;

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_crm_leads_type_lead ON crm_leads(type_lead);

-- Update existing records based on source field
UPDATE crm_leads 
SET type_lead = CASE 
  WHEN source ILIKE '%google%' OR source ILIKE '%ads%' THEN 'google_ads'
  WHEN source ILIKE '%calendly%' THEN 'calendly'
  ELSE 'formulaire'
END
WHERE type_lead = 'formulaire';
