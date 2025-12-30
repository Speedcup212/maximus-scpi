/*
  # Ajouter politique UPDATE pour articles_seo

  ## Description
  Permet la mise à jour d'articles dans la table articles_seo via l'API publique.
  Nécessaire pour permettre les opérations UPSERT.

  ## Modifications
  - Ajout d'une politique UPDATE pour permettre les mises à jour publiques

  ## Sécurité
  - La politique UPDATE est permissive pour faciliter les mises à jour
  - Peut être restreinte ultérieurement si besoin
*/

-- Politique UPDATE : permet les mises à jour publiques
CREATE POLICY "Permettre mises à jour articles"
  ON articles_seo
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
