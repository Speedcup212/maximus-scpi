-- Catalogue des SCPI pour l'espace Pro (données vidéo, logo, nom, scripts, KPIs)
CREATE TABLE IF NOT EXISTS scpi_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Diversifiée',
  rendement TEXT NOT NULL DEFAULT 'N/A',
  tof TEXT NOT NULL DEFAULT 'N/A',
  logo_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  script_technique TEXT NOT NULL DEFAULT '',
  script_vulgarisation TEXT NOT NULL DEFAULT '',
  script_macro TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed des 2 SCPI pilotes
INSERT INTO scpi_catalog (id, name, category, rendement, tof, logo_url, video_url, script_technique, script_vulgarisation, script_macro) VALUES
  (
    'iroko-zen',
    'Iroko Zen',
    'Diversifiée',
    '7.12%',
    '94.2%',
    'https://placehold.co/200x50/000000/ffffff?text=IROKO+ZEN',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'Cher client, le rapport du T1 2026 d''Iroko Zen montre une excellente tenue avec un TOF maintenu à 94.2% et un rendement annualisé de 7.12%. La stratégie d''acquisition européenne continue de porter ses fruits, notamment sur la logistique allemande.',
    'Bonjour ! Du nouveau sur votre investissement Iroko Zen : le fonds se porte très bien ce trimestre. Pour faire simple, les loyers rentrent comme prévu, les bâtiments sont pleins à plus de 94%, et votre rendement cible reste parmi les meilleurs du marché.',
    'Cher investisseur, dans un contexte de stabilisation des taux de la BCE en ce début d''année 2026, Iroko Zen tire profit de son agilité. Le fonds profite de la baisse des prix immobiliers pour acheter des actifs décotés à fort rendement.'
  ),
  (
    'remake-live',
    'Remake Live',
    'Sans frais d''entrée',
    '6.85%',
    '95.6%',
    'https://placehold.co/200x50/000000/ffffff?text=REMAKE+LIVE',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'Cher client, le bilan de Remake Live pour le T1 2026 confirme la pertinence de son modèle sans frais. Le TOF grimpe à 95.6%, soutenu par des investissements massifs dans les métropoles régionales espagnoles.',
    'Bonjour ! Votre épargne sur Remake Live continue de bien travailler. Le fonds affiche une santé de fer avec des bâtiments occupés presque au maximum (plus de 95%). C''est un excellent trimestre pour la régularité de vos gains.',
    'Cher partenaire, Remake Live démontre ce trimestre encore sa résilience face aux enjeux de décarbonation. Sa stratégie axée sur les infrastructures néo-urbaines devance les nouvelles exigences réglementaires de 2026.'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  rendement = EXCLUDED.rendement,
  tof = EXCLUDED.tof,
  logo_url = EXCLUDED.logo_url,
  video_url = EXCLUDED.video_url,
  script_technique = EXCLUDED.script_technique,
  script_vulgarisation = EXCLUDED.script_vulgarisation,
  script_macro = EXCLUDED.script_macro;

-- RLS : lecture publique (infofonds.fr et dashboard Pro)
ALTER TABLE scpi_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_read_catalog" ON scpi_catalog
  FOR SELECT USING (true);
