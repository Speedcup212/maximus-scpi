/*
  # Create Email Sequences Table for Automated Email Campaigns

  1. New Tables
    - `email_sequences`
      - `id` (uuid, primary key) - Unique identifier
      - `lead_id` (uuid) - Reference to leads_pdf_comparatif table
      - `email` (text) - Email address of the lead
      - `sequence_step` (integer) - Current step in the sequence (0=welcome, 1=J+1, 2=J+3, 3=J+7)
      - `last_email_sent_at` (timestamptz) - Timestamp of last email sent
      - `next_email_at` (timestamptz) - When to send the next email
      - `status` (text) - Status: 'active', 'completed', 'unsubscribed'
      - `metadata` (jsonb) - Store additional data (name, prenom, etc.)
      - `created_at` (timestamptz) - When the sequence started
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `email_sequences` table
    - Add policy for service role access only (automation needs full access)

  3. Indexes
    - Index on `next_email_at` for efficient cron job queries
    - Index on `status` for filtering active sequences
*/

-- Create email_sequences table
CREATE TABLE IF NOT EXISTS email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads_pdf_comparatif(id) ON DELETE CASCADE,
  email text NOT NULL,
  sequence_step integer DEFAULT 0,
  last_email_sent_at timestamptz,
  next_email_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'unsubscribed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (for automation)
CREATE POLICY "Service role has full access to email sequences"
  ON email_sequences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sequences_next_email_at 
  ON email_sequences(next_email_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_email_sequences_status 
  ON email_sequences(status);

CREATE INDEX IF NOT EXISTS idx_email_sequences_lead_id 
  ON email_sequences(lead_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_email_sequences_updated_at
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_sequences_updated_at();