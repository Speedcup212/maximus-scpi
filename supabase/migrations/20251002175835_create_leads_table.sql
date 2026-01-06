/*
  # Création de la table des leads

  1. Nouvelle table
    - `leads`
      - `id` (uuid, clé primaire) - Identifiant unique du lead
      - `email` (text, unique, requis) - Email du contact
      - `nom` (text) - Nom du contact
      - `prenom` (text) - Prénom du contact
      - `telephone` (text) - Numéro de téléphone
      - `montant_investissement` (integer) - Montant d'investissement souhaité en euros
      - `objectif_investissement` (text) - Objectif principal (revenus, fiscalité, diversification, etc.)
      - `horizon_placement` (text) - Horizon de placement (court, moyen, long terme)
      - `tmi` (text) - Tranche Marginale d'Imposition
      - `situation_professionnelle` (text) - Situation professionnelle du lead
      - `message` (text) - Message ou commentaire du lead
      - `source` (text) - Source du lead (formulaire RDV, simulation, contact, etc.)
      - `statut` (text, défaut: 'nouveau') - Statut du lead (nouveau, contacté, qualifié, converti, perdu)
      - `scpi_interessees` (jsonb) - Liste des SCPI qui intéressent le lead
      - `simulation_data` (jsonb) - Données de simulation si disponibles
      - `created_at` (timestamptz, défaut: now()) - Date de création
      - `updated_at` (timestamptz, défaut: now()) - Dernière mise à jour
      - `contacted_at` (timestamptz) - Date du premier contact
      - `notes` (text) - Notes internes sur le lead

  2. Sécurité
    - Activer RLS sur la table `leads`
    - Les leads ne sont accessibles qu'aux utilisateurs authentifiés (administrateurs)
    - Politique SELECT pour les administrateurs authentifiés
    - Politique INSERT pour permettre la création de leads depuis les formulaires publics
    - Politique UPDATE pour les administrateurs authentifiés
    - Politique DELETE pour les administrateurs authentifiés

  3. Index
    - Index sur email pour recherche rapide
    - Index sur statut pour filtrage
    - Index sur created_at pour tri chronologique
    - Index sur source pour analyse des canaux d'acquisition
*/

-- Création de la table leads
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nom text,
  prenom text,
  telephone text,
  montant_investissement integer,
  objectif_investissement text,
  horizon_placement text,
  tmi text,
  situation_professionnelle text,
  message text,
  source text DEFAULT 'formulaire_contact',
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'contacté', 'qualifié', 'converti', 'perdu')),
  scpi_interessees jsonb DEFAULT '[]'::jsonb,
  simulation_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  notes text
);

-- Activer RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Politique INSERT : Permet la création de leads depuis les formulaires publics (anonymes)
CREATE POLICY "Permettre insertion publique de leads"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique SELECT : Seuls les utilisateurs authentifiés peuvent voir les leads
CREATE POLICY "Administrateurs peuvent voir tous les leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique UPDATE : Seuls les utilisateurs authentifiés peuvent modifier les leads
CREATE POLICY "Administrateurs peuvent modifier les leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique DELETE : Seuls les utilisateurs authentifiés peuvent supprimer les leads
CREATE POLICY "Administrateurs peuvent supprimer les leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_statut ON leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON leads;
CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();
