/*
  # Suppression de la dernière fonction liée aux emails

  1. Suppressions
    - Fonction update_email_sequences_updated_at()

  2. Note
    - Nettoyage final complet du système d'emails
*/

-- Drop dernière fonction
DROP FUNCTION IF EXISTS update_email_sequences_updated_at();