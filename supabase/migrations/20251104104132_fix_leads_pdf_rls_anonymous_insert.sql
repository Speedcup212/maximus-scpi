/*
  # Fix RLS for leads_pdf_comparatif anonymous inserts

  ## Changes
  - Drop existing restrictive policy
  - Create new permissive policy that allows anonymous users to insert leads
  - Ensure the policy properly allows frontend form submissions

  ## Security
  - Anonymous users can only INSERT data (no read/update/delete)
  - Authenticated users retain full access
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Allow anonymous form submissions" ON leads_pdf_comparatif;

-- Create new policy for anonymous inserts
CREATE POLICY "Allow anonymous users to submit leads"
  ON leads_pdf_comparatif
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure authenticated users can do everything
DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads_pdf_comparatif;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads_pdf_comparatif;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads_pdf_comparatif;

CREATE POLICY "Authenticated users full access"
  ON leads_pdf_comparatif
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
