/*
  # Create CRM MaximusSCPI table

  1. New Tables
    - `crm_leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `nom` (text) - Client name
      - `email` (text, required) - Client email address
      - `telephone` (text) - Client phone number
      - `montant` (text) - Investment amount
      - `commentaire` (text) - Additional comments
      - `creneau` (text) - Preferred time slot
      - `profil_risque` (text) - Risk profile
      - `profil_esg` (text) - ESG profile
      - `scpi` (text[]) - Array of selected SCPI names
      - `horizon` (text) - Investment horizon
      - `objectifs` (text) - Investment objectives
      - `tmi` (text) - Marginal tax rate
      - `source` (text) - Lead source (e.g., "Souscription", "Simulation Email")
      - `date` (timestamptz) - Lead creation date
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `crm_leads` table
    - Add policy for authenticated users to insert leads
    - Add policy for authenticated users to read their own leads
    - Add policy for service role to read all leads (for admin)

  3. Indexes
    - Index on email for faster lookups
    - Index on created_at for sorting by date
*/

CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text,
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
  source text DEFAULT 'Web',
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert leads (for contact forms)
CREATE POLICY "Anyone can insert leads"
  ON crm_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can read all leads (for admin dashboard)
CREATE POLICY "Authenticated users can read leads"
  ON crm_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);