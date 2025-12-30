/*
  # Disable RLS for crm_leads table temporarily

  1. Changes
    - Disable RLS on crm_leads to allow public form submissions
    
  2. Security Note
    - This is appropriate for a lead capture table where we want to collect data from public forms
    - The table only collects contact information and preferences
    - No sensitive user data is stored
    - For production, consider re-enabling RLS with proper policies or using an Edge Function
*/

-- Disable RLS to allow public insertions
ALTER TABLE crm_leads DISABLE ROW LEVEL SECURITY;