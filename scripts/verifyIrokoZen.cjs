const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const iroko = data.find(s => s['Nom SCPI'] === 'Iroko Zen');

if (!iroko) {
  console.error('Iroko Zen non trouvée');
  process.exit(1);
}

console.log('✅ Données Iroko Zen:');
console.log('  Capitalisation:', iroko['Capitalisation (M€)'], 'M€');
console.log('  TOF:', iroko['TOF (%)'], '%');
console.log('  Endettement:', iroko['Endettement (%)'], '%');
console.log('  Prix:', iroko['Prix de souscription (€)'], '€');
console.log('  Nombre d\'immeubles:', iroko['Nombre d\'immeubles']);
console.log('  Période bulletin:', iroko['Période bulletin trimestriel']);

if (iroko['WALT']) console.log('  WALT:', iroko['WALT'], 'ans');
if (iroko['WALB']) console.log('  WALB:', iroko['WALB'], 'ans');
if (iroko['Nombre de locataires']) console.log('  Nombre de locataires:', iroko['Nombre de locataires']);
