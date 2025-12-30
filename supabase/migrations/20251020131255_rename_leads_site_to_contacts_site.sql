/*
  # Renommer leads_site en contacts_site
  
  1. Modifications
    - Renommer la table `leads_site` en `contacts_site`
    - Clarification sémantique : "leads" → "contacts" pour éviter la redondance avec "leads_ads"
  
  2. Notes
    - Tous les déclencheurs et contraintes seront automatiquement mis à jour
    - Les données existantes sont préservées
*/

-- Renommer la table
ALTER TABLE IF EXISTS leads_site RENAME TO contacts_site;

-- Ajouter un commentaire explicatif
COMMENT ON TABLE contacts_site IS 'Contacts générés depuis le site web (formulaires et prises de RDV Calendly)';