const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoT3 = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!irokoT3) {
  console.error('❌ Entrée T3 2025 non trouvée');
  process.exit(1);
}

const actualites = irokoT3['Actualités trimestrielles'] || '';
console.log('Début des actualités trimestrielles:');
console.log(actualites.substring(0, 120) + '...');
console.log('\n✅ Contient "Mise à jour BULLETIN TRIMESTRIEL":', actualites.includes('Mise à jour BULLETIN TRIMESTRIEL'));
