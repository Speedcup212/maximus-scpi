/*
  # Ajouter politique INSERT pour articles_seo

  ## Description
  Permet l'insertion d'articles dans la table articles_seo via l'API publique.
  Cette politique est temporaire pour permettre l'import initial des articles.

  ## Modifications
  - Ajout d'une politique INSERT pour permettre les insertions publiques

  ## Sécurité
  - La politique INSERT est permissive pour faciliter l'import
  - Peut être restreinte ultérieurement si besoin
*/

-- Politique INSERT : permet les insertions publiques
CREATE POLICY "Permettre insertions articles"
  ON articles_seo
  FOR INSERT
  WITH CHECK (true);