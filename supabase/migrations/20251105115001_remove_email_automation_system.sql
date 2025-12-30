/*
  # Retrait du système d'envoi automatique d'emails

  1. Suppressions
    - Table email_sequences et ses contraintes
    - Trigger pour créer automatiquement les séquences
    - Fonction associée au trigger

  2. Note
    - Les leads_pdf_comparatif restent intacts pour la collecte
    - Seule l'automatisation d'envoi est retirée
*/

-- Drop trigger first
DROP TRIGGER IF EXISTS create_email_sequence_on_lead ON leads_pdf_comparatif;

-- Drop function
DROP FUNCTION IF EXISTS create_email_sequence_for_lead();

-- Drop table
DROP TABLE IF EXISTS email_sequences CASCADE;