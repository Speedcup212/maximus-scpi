/*
  # Activation RLS pour contacts_site

  1. Sécurité
    - Active Row Level Security sur `contacts_site`
    - Politique pour permettre INSERT anonyme (formulaires publics)
    - Politique pour permettre SELECT/UPDATE/DELETE aux utilisateurs authentifiés

  2. Notes
    - Les formulaires publics doivent pouvoir insérer sans authentification
    - Seuls les admins authentifiés peuvent consulter/modifier les contacts
*/

-- Activer RLS
ALTER TABLE contacts_site ENABLE ROW LEVEL SECURITY;

-- Politique INSERT pour utilisateurs anonymes (formulaires publics)
CREATE POLICY "Permettre INSERT anonyme pour formulaires"
  ON contacts_site
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique INSERT pour utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent insérer"
  ON contacts_site
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique SELECT pour utilisateurs authentifiés uniquement
CREATE POLICY "Utilisateurs authentifiés peuvent lire"
  ON contacts_site
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique UPDATE pour utilisateurs authentifiés uniquement
CREATE POLICY "Utilisateurs authentifiés peuvent modifier"
  ON contacts_site
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique DELETE pour utilisateurs authentifiés uniquement
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer"
  ON contacts_site
  FOR DELETE
  TO authenticated
  USING (true);
