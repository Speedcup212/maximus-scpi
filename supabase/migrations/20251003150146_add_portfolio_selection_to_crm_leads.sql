/*
  # Add portfolio selection column to crm_leads

  1. Changes
    - Add `portfolio_selection` column to store the 51 SCPI portfolio selection
    - Column type: text[] (array of text) to store multiple SCPI names
    - Nullable: true (optional field)

  2. Notes
    - This column will capture the user's selected portfolio of up to 51 SCPI
    - Useful for tracking which portfolio recommendations were made
*/

-- Add portfolio_selection column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crm_leads' AND column_name = 'portfolio_selection'
  ) THEN
    ALTER TABLE crm_leads ADD COLUMN portfolio_selection text[];
  END IF;
END $$;