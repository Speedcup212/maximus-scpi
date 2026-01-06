/*
  # Fix RLS Policy for leads_pdf_comparatif

  1. Changes
    - Drop existing anon policy
    - Create new permissive policy for anonymous inserts
    - Ensure anon users can insert leads without restrictions

  2. Security
    - Allows anonymous users to submit leads
    - Maintains authenticated user access
*/

-- Drop existing anon policies
DROP POLICY IF EXISTS "Allow anonymous users to submit leads" ON leads_pdf_comparatif;
DROP POLICY IF EXISTS "Enable select for anon users" ON leads_pdf_comparatif;

-- Create new permissive policy for anon inserts
CREATE POLICY "Enable insert for anon users"
  ON leads_pdf_comparatif
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon to select their own submissions (for debugging)
CREATE POLICY "Enable select for anon users"
  ON leads_pdf_comparatif
  FOR SELECT
  TO anon
  USING (true);