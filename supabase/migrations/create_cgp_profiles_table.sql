-- Profil réglementaire des CGP (Conseillers en Gestion de Patrimoine)
-- Lié 1:1 à auth.users via id = user UUID
CREATE TABLE IF NOT EXISTS cgp_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  orias_number TEXT NOT NULL DEFAULT '',
  association TEXT NOT NULL DEFAULT 'ANACOFI' CHECK (association IN ('ANACOFI', 'CNCGP', 'CNCIF', 'Compagnie_CIF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS : seul le propriétaire peut lire/modifier son profil
ALTER TABLE cgp_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cgp_can_read_own_profile" ON cgp_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "cgp_can_insert_own_profile" ON cgp_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "cgp_can_update_own_profile" ON cgp_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
