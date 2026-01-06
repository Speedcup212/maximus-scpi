/*
  # Security Audit - Enable RLS on Public Tables
  
  1. Tables Updated
    - `scpi` - Enable RLS with public read policy
    - `leads_ads_formulaire` - Enable RLS with restricted access
    - `leads_ads_calendly` - Enable RLS with restricted access
  
  2. Security Policies
    - `scpi` table: Public SELECT access (read-only for all users)
    - `leads_ads_formulaire`: INSERT only for anon users
    - `leads_ads_calendly`: INSERT only for anon users
  
  3. Function Security Fixes
    - Fix search_path for trigger functions to prevent security vulnerabilities
*/

-- Enable RLS on scpi table (public read access for SCPI data)
ALTER TABLE IF EXISTS scpi ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public read access to SCPI data" ON scpi;

-- Allow public read access to SCPI data (needed for the comparator)
CREATE POLICY "Public read access to SCPI data"
  ON scpi FOR SELECT
  TO public
  USING (true);

-- Enable RLS on leads_ads_formulaire
ALTER TABLE IF EXISTS leads_ads_formulaire ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous form submissions" ON leads_ads_formulaire;

-- Allow INSERT for anon users (form submissions from website)
CREATE POLICY "Allow anonymous form submissions"
  ON leads_ads_formulaire FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable RLS on leads_ads_calendly
ALTER TABLE IF EXISTS leads_ads_calendly ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous Calendly bookings" ON leads_ads_calendly;

-- Allow INSERT for anon users (Calendly bookings from website)
CREATE POLICY "Allow anonymous Calendly bookings"
  ON leads_ads_calendly FOR INSERT
  TO anon
  WITH CHECK (true);

-- Fix search_path for trigger functions to prevent security vulnerabilities
-- We need to use CREATE OR REPLACE to avoid dropping triggers

-- Update function: update_leads_updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update function: update_scores_scpi_updated_at
CREATE OR REPLACE FUNCTION update_scores_scpi_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update function: update_google_ads_comete_leads_updated_at
CREATE OR REPLACE FUNCTION update_google_ads_comete_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;