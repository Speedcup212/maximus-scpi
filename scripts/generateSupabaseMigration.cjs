const fs = require('fs');

// Charger les données JSON
const data = JSON.parse(fs.readFileSync('src/data/SCPI_complet_avec_SFDR_Profil.json', 'utf8'));

// Fonction pour parser une répartition au format texte : "Item1 (XX%), Item2 (YY%)"
function parseTextDistribution(text) {
  if (!text || text === 'null' || text.trim() === '') return null;

  const result = {};
  // Regex pour capturer "Item (XX,YY%)" ou "Item (XX%)"
  const regex = /([^(]+)\s*\(([0-9,\.]+)%\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    let key = match[1].trim();
    // Enlever les virgules/points en début de clé qui proviennent du split
    key = key.replace(/^[,\s]+/, '').replace(/[,\s]+$/, '');
    const value = parseFloat(match[2].replace(',', '.'));
    if (!isNaN(value) && key) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// Fonction pour parser une répartition JSON (ou retourner null si invalide)
function parseJsonDistribution(jsonStr) {
  if (!jsonStr || jsonStr === 'null' || jsonStr.trim() === '') return null;

  try {
    const obj = JSON.parse(jsonStr);
    // Vérifier si toutes les valeurs sont null
    const hasValidValues = Object.values(obj).some(v => v !== null);
    return hasValidValues ? obj : null;
  } catch (e) {
    return null;
  }
}

// Fonction pour échapper les apostrophes pour SQL
function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// Fonction pour convertir un objet JS en JSONB SQL
function toJsonbSql(obj) {
  if (!obj) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

// Génération de la migration SQL
let sql = `/*
  # Migration complète SCPI avec 100% des répartitions

  1. Tables
    - Recréation table scpi avec toutes les colonnes

  2. Données
    - 51 SCPI avec répartitions sectorielles (100%)
    - 43 SCPI avec répartitions géographiques (84%)

  3. Notes
    - Répartitions sectorielles: parsées depuis format texte
    - Répartitions géographiques: parsées depuis JSON ou NULL si invalide
    - 8 SCPI sans géo: données source mal formatées
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

INSERT INTO scpi (
    nom, societe_gestion, annee_creation, label_isr, sfdr, profil_cible,
    capitalisation, prix_souscription, valeur_retrait, valeur_reconstitution,
    valeur_realisation, surcote_decote, minimum_souscription,
    rendement, distribution, nb_immeubles, endettement, tof,
    delai_jouissance, duree_detention_recommandee, versement_loyers,
    frais_souscription, frais_gestion, repartition_sectorielle, repartition_geographique
) VALUES\n`;

const values = [];

data.Sheet1.forEach(scpi => {
  // Parser les répartitions
  const sectorText = scpi['Répartition Sectorielle'];
  const geoText = scpi['Répartition Géographique'];

  const sectorObj = parseTextDistribution(sectorText);
  const geoObj = parseJsonDistribution(geoText) || parseTextDistribution(geoText);

  const row = `(${escapeSql(scpi['Nom SCPI'])},${escapeSql(scpi['Société de gestion'])},` +
    `${scpi['Année de création'] || 'NULL'},${escapeSql(scpi['Label ISR'])},` +
    `${escapeSql(scpi['SFDR'])},${escapeSql(scpi['Profil cible'])},` +
    `${scpi['Capitalisation (M€)'] || 'NULL'},${scpi['Prix de souscription (€)'] || 'NULL'},` +
    `${scpi['Valeur de retrait (€)'] || 'NULL'},${scpi['Valeur de reconstitution (€)'] || 'NULL'},` +
    `${scpi['Valeur de réalisation (€)'] || 'NULL'},${scpi['Surcote/décote (%)'] || 'NULL'},` +
    `${scpi['Minimum de souscription €'] || 'NULL'},${scpi['Taux de distribution (%)'] || 'NULL'},` +
    `${typeof scpi['Distribution (€/part)'] === 'string' ? parseFloat(scpi['Distribution (€/part)']) || 'NULL' : scpi['Distribution (€/part)'] || 'NULL'},` +
    `${scpi['Nombre d\'immeubles'] || 'NULL'},${scpi['Endettement (%)'] || 'NULL'},` +
    `${scpi['TOF (%)'] || 'NULL'},${scpi['Délai de jouissance (mois)'] || 'NULL'},` +
    `${scpi['Durée de détention recommandée (ans)'] || 'NULL'},` +
    `${escapeSql(scpi['Versement des loyers'])},` +
    `${scpi['Frais de souscription (HT/%)'] || 'NULL'},${scpi['Frais de gestion (HT/%)'] || 'NULL'},` +
    `${toJsonbSql(sectorObj)},${toJsonbSql(geoObj)})`;

  values.push(row);
});

sql += values.join(',\n') + ';\n\nSELECT COUNT(*) FROM scpi;';

// Écrire le fichier
const filename = 'supabase/migrations/scpi_complete_100_percent.sql';
fs.writeFileSync(filename, sql);

console.log('✅ Migration SQL générée avec succès !');
console.log(`📁 Fichier: ${filename}`);
console.log(`📊 ${data.Sheet1.length} SCPI exportées`);
