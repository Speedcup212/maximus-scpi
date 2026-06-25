-- ============================================================
-- Migration : Espace Pro - Rapports CGP
-- Exécuter dans la console SQL Supabase
-- ============================================================

-- 1. Table pro_reports
CREATE TABLE IF NOT EXISTS pro_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cgp_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cabinet_name TEXT,
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  view_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pro_reports_cgp_id ON pro_reports(cgp_id);
CREATE INDEX IF NOT EXISTS idx_pro_reports_created_at ON pro_reports(created_at DESC);

-- 2. Colonne allowed_scpi dans cgp_profiles
ALTER TABLE cgp_profiles
ADD COLUMN IF NOT EXISTS allowed_scpi JSONB;

-- 3. RLS (Row Level Security) pour pro_reports
ALTER TABLE pro_reports ENABLE ROW LEVEL SECURITY;

-- Le CGP peut voir uniquement ses propres rapports
CREATE POLICY "cgp_view_own_reports" ON pro_reports
  FOR SELECT
  USING (auth.uid() = cgp_id);

-- Le CGP peut insérer ses propres rapports
CREATE POLICY "cgp_insert_own_reports" ON pro_reports
  FOR INSERT
  WITH CHECK (auth.uid() = cgp_id);

-- Le CGP peut supprimer ses propres rapports
CREATE POLICY "cgp_delete_own_reports" ON pro_reports
  FOR DELETE
  USING (auth.uid() = cgp_id);

-- La vue publique pour le lien client (à venir sprint suivant)
-- CREATE POLICY "public_view_shared_report" ON pro_reports
--   FOR SELECT
--   USING (true);
