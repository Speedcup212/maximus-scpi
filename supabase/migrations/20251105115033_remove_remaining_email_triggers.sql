/*
  # Suppression des derniers triggers et fonctions d'emails

  1. Suppressions
    - Trigger start_email_sequence
    - Fonction start_email_sequence()
    - Toutes autres fonctions liées aux emails

  2. Note
    - Nettoyage complet du système d'automatisation d'emails
    - Les leads restent collectés normalement
*/

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_start_email_sequence ON leads_pdf_comparatif;

-- Drop function
DROP FUNCTION IF EXISTS start_email_sequence();

-- Drop autres fonctions potentielles liées aux emails
DROP FUNCTION IF EXISTS send_scheduled_emails();
DROP FUNCTION IF EXISTS process_email_queue();