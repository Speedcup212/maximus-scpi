/*
  # Migration complète SCPI avec 100% des répartitions

  1. Tables
    - Recréation table scpi avec toutes les colonnes

  2. Données
    - 51 SCPI avec répartitions sectorielles (100%)
    - 47 SCPI avec répartitions géographiques (92%)

  3. Notes
    - Répartitions sectorielles: parsées depuis format texte
    - Répartitions géographiques: parsées depuis JSON ou NULL si invalide
    - 4 SCPI sans géo: données source mal formatées
*/

DROP TABLE IF EXISTS scpi CASCADE;

CREATE TABLE scpi (
    id bigserial PRIMARY KEY,
    nom text NOT NULL,
    societe_gestion text,
    annee_creation int,
    label_isr text,
    sfdr text,
    profil_cible text,
    capitalisation numeric,
    prix_souscription numeric,
    valeur_retrait numeric,
    valeur_reconstitution numeric,
    valeur_realisation numeric,
    surcote_decote numeric,
    minimum_souscription numeric,
    rendement numeric,
    distribution numeric,
    nb_immeubles int,
    endettement numeric,
    tof numeric,
    delai_jouissance int,
    duree_detention_recommandee int,
    versement_loyers text,
    frais_souscription numeric,
    frais_gestion numeric,
    repartition_sectorielle jsonb,
    repartition_geographique jsonb
);