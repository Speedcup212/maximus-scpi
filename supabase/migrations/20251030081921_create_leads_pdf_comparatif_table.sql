/*
  # Create leads_pdf_comparatif table

  1. New Tables
    - `leads_pdf_comparatif`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `email` (text, not null) - Email address of the lead
      - `source_page` (text, not null) - URL pathname where the lead was captured
      - `created_at` (timestamptz, default now()) - Timestamp of lead capture
      - `user_agent` (text) - Browser user agent for analytics
      - `ip_address` (text) - IP address for fraud detection

  2. Security
    - Enable RLS on `leads_pdf_comparatif` table
    - Add policy for service role to insert leads (called from Edge Function)
    - Add policy for authenticated admins to read leads

  3. Indexes
    - Index on email for faster lookups
    - Index on created_at for analytics queries
    - Index on source_page for conversion tracking
*/

-- Create the table
CREATE TABLE IF NOT EXISTS leads_pdf_comparatif (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source_page text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text
);

-- Enable Row Level Security
ALTER TABLE leads_pdf_comparatif ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_pdf_email ON leads_pdf_comparatif(email);
CREATE INDEX IF NOT EXISTS idx_leads_pdf_created_at ON leads_pdf_comparatif(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_pdf_source_page ON leads_pdf_comparatif(source_page);

-- Policy: Allow service role to insert (Edge Function will use service role key)
CREATE POLICY "Service role can insert leads"
  ON leads_pdf_comparatif
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow authenticated admins to read all leads
CREATE POLICY "Authenticated users can read all leads"
  ON leads_pdf_comparatif
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE leads_pdf_comparatif IS 'Stores email leads captured from PDF download Lead Magnet forms on specific SCPI pages';
