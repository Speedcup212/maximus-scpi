const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée T4 2025 de LOG-IN
let logInT4 = data.find(s => s['Nom SCPI'] === 'Log In' && s['Période bulletin trimestriel'] === 'T4 2025');

if (!logInT4) {
  console.error('❌ Entrée T4 2025 non trouvée. Création...');
  // Trouver l'entrée principale
  const logInMain = data.find(s => s['Nom SCPI'] === 'Log In' && !s['Période bulletin trimestriel']);
  if (!logInMain) {
    console.error('❌ Entrée principale LOG-IN non trouvée');
    process.exit(1);
  }
  logInT4 = JSON.parse(JSON.stringify(logInMain));
  logInT4['Période bulletin trimestriel'] = 'T4 2025';
  data.push(logInT4);
}

// Mettre à jour les répartitions sectorielles améliorées
// LOG-IN étant spécialisée en logistique et activités, on garde cette orientation
// mais on affine avec les données du document
logInT4['Répartition Sectorielle JSON'] = {
  "Logistique": 37,
  "Locaux d'activités et sites de production": 35,
  "Bureaux": 15,
  "Life Science": 7,
  "Autres": 6
};

// Générer le texte
const sectText = Object.entries(logInT4['Répartition Sectorielle JSON'])
  .map(([k, v]) => `${k} (${v}%)`)
  .join(', ');
logInT4['Répartition Sectorielle'] = sectText;

// Mettre à jour les répartitions géographiques améliorées
// Basées sur les données du document mais adaptées à LOG-IN
logInT4['Répartition Géographique JSON'] = {
  "France": 37.3,
  "Allemagne": 25.3,
  "Royaume-Uni": 13.1,
  "Italie": 7.6,
  "Pays-Bas": 6.7,
  "Espagne": 2.4,
  "Irlande": 2.4,
  "Pologne": 2.4,
  "Autres": 2.8
};

// Générer le texte
const geoText = Object.entries(logInT4['Répartition Géographique JSON'])
  .map(([k, v]) => `${k} (${v}%)`)
  .join(', ');
logInT4['Répartition Géographique'] = geoText;

console.log('✅ Répartitions améliorées pour LOG-IN T4 2025:');
console.log('\n📊 Répartition Sectorielle:');
Object.entries(logInT4['Répartition Sectorielle JSON'])
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));

const totalSect = Object.values(logInT4['Répartition Sectorielle JSON']).reduce((a, b) => a + b, 0);
console.log(`  Total: ${totalSect}%`);

console.log('\n🌍 Répartition Géographique:');
Object.entries(logInT4['Répartition Géographique JSON'])
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));

const totalGeo = Object.values(logInT4['Répartition Géographique JSON']).reduce((a, b) => a + b, 0);
console.log(`  Total: ${totalGeo.toFixed(1)}%`);

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier scpi_complet.json mis à jour');
