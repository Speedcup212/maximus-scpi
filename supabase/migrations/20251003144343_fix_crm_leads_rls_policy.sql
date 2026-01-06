/*
  # Fix RLS policy for crm_leads table

  1. Changes
    - Drop existing policies
    - Create new policy allowing anonymous users to insert leads (for public forms)
    - Create policy allowing authenticated users to read all leads

  2. Security
    - Public users can insert leads (essential for contact forms)
    - Only authenticated users can read leads (admin access)
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert leads" ON crm_leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON crm_leads;

-- Allow anonymous and authenticated users to insert leads
CREATE POLICY "Public can insert leads"
  ON crm_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all leads
CREATE POLICY "Authenticated can read leads"
  ON crm_leads
  FOR SELECT
  TO authenticated
  USING (true);