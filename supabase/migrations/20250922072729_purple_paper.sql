/*
  # Système d'authentification utilisateurs

  1. Configuration
    - Activer l'authentification Supabase
    - Configurer les politiques de sécurité
    - Désactiver la confirmation par email pour simplifier

  2. Sécurité
    - Enable RLS sur auth.users (géré automatiquement par Supabase)
    - Politiques d'accès sécurisées
*/

-- Configurer l'authentification
-- Note: La table auth.users est gérée automatiquement par Supabase

-- Créer une table de profils utilisateurs (optionnel pour étendre les données)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent créer leur profil
CREATE POLICY "Users can create own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique pour que les utilisateurs puissent modifier leur profil
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();