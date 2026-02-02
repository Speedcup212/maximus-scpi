const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoT3 = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!irokoT3) {
  console.error('❌ Entrée T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Données Iroko Zen T3 2025:');
console.log('  Nombre de locataires:', irokoT3['Nombre de locataires']);
console.log('  Nombre d\'immeubles:', irokoT3['Nombre d\'immeubles']);
console.log('  WALT:', irokoT3['WALT'], 'ans');
console.log('  WALB:', irokoT3['WALB'], 'ans');
console.log('  TOF:', irokoT3['TOF (%)'], '%');
console.log('  TOP:', irokoT3['TOP (%)'], '%');
console.log('  Endettement (LTV):', irokoT3['Endettement (%)'], '%');
console.log('  Collecte nette trimestre:', irokoT3['Collecte nette trimestre'], '€');

// Vérifier les données dans les actualités
const actualites = irokoT3['Actualités trimestrielles'] || '';
console.log('\n✅ Vérification dans les actualités:');
console.log('  Surface du patrimoine:', actualites.includes('981 138 m²') ? '✅ Présent' : '❌ Absent');
console.log('  Loyers encaissés:', actualites.includes('25 566 838€') ? '✅ Présent' : '❌ Absent');
