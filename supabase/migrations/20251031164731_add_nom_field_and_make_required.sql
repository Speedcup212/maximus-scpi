/*
  # Ajouter colonne nom et rendre prénom/nom obligatoires

  1. Modifications
    - Ajout de la colonne `nom` (text, NOT NULL)
    - Colonne `prenom` devient NOT NULL
    - Meilleure qualité des données pour Sender.net

  2. Notes
    - Les données existantes avec prenom NULL seront mises à jour
    - Les deux champs sont maintenant obligatoires pour une meilleure personnalisation
*/

-- Ajouter la colonne nom si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads_pdf_comparatif' AND column_name = 'nom'
  ) THEN
    ALTER TABLE leads_pdf_comparatif 
    ADD COLUMN nom text;
  END IF;
END $$;

-- Mettre à jour les valeurs NULL existantes avec une valeur par défaut
UPDATE leads_pdf_comparatif 
SET prenom = 'Non renseigné' 
WHERE prenom IS NULL OR prenom = '';

UPDATE leads_pdf_comparatif 
SET nom = 'Non renseigné' 
WHERE nom IS NULL OR nom = '';

-- Rendre les colonnes NOT NULL
ALTER TABLE leads_pdf_comparatif 
ALTER COLUMN prenom SET NOT NULL;

ALTER TABLE leads_pdf_comparatif 
ALTER COLUMN nom SET NOT NULL;

-- Ajouter des commentaires explicatifs
COMMENT ON COLUMN leads_pdf_comparatif.prenom IS 'Prénom du contact pour personnalisation des emails (obligatoire)';
COMMENT ON COLUMN leads_pdf_comparatif.nom IS 'Nom du contact pour personnalisation des emails (obligatoire)';
