/*
  # Ajout du champ prénom

  1. Modifications
    - Ajout de la colonne `prenom` (text, optionnel)
    - Permet une meilleure personnalisation dans Sender.net
    
  2. Notes
    - Le champ prénom est séparé du nom pour une meilleure segmentation
    - Compatible avec la personnalisation Sender.net {{firstname}}
*/

-- Ajouter la colonne prenom si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads_pdf_comparatif' AND column_name = 'prenom'
  ) THEN
    ALTER TABLE leads_pdf_comparatif 
    ADD COLUMN prenom text;
  END IF;
END $$;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN leads_pdf_comparatif.prenom IS 'Prénom du contact pour personnalisation des emails (optionnel)';
