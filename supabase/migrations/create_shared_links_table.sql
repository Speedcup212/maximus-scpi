-- Création de la table shared_links pour les liens de partage anonymes Pro
-- Permet aux CGP de générer des liens de visionnage neutres pour leurs clients
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cgp_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scpi_id TEXT NOT NULL REFERENCES scpi_catalog(id) ON DELETE CASCADE,
  script_type TEXT NOT NULL CHECK (script_type IN ('technique', 'vulgarisation', 'macro')),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les lookups par UUID (le cas d'usage principal)
CREATE INDEX IF NOT EXISTS idx_shared_links_id ON shared_links (id);

-- Index pour qu'un CGP puisse retrouver ses liens
CREATE INDEX IF NOT EXISTS idx_shared_links_cgp_id ON shared_links (cgp_id);

-- RLS
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cgp_can_insert_own_links" ON shared_links
  FOR INSERT WITH CHECK (auth.uid() = cgp_id);

CREATE POLICY "cgp_can_read_own_links" ON shared_links
  FOR SELECT USING (auth.uid() = cgp_id);

-- Interdire les UPDATE directs (seul le CGP pourrait, et uniquement via la fonction)
-- Pas de policy UPDATE → personne ne peut modifier les lignes directement

-- La vue anonyme (infofonds.fr) doit pouvoir lire n'importe quel lien par UUID
CREATE POLICY "public_can_read_by_id" ON shared_links
  FOR SELECT USING (true);

-- Fonction sécurisée pour incrémenter view_count (appelable sans auth)
CREATE OR REPLACE FUNCTION increment_view_count(link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_links
  SET view_count = view_count + 1
  WHERE id = link_id;
END;
$$;
