const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoT3 = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!irokoT3) {
  console.error('❌ Entrée T3 2025 non trouvée');
  process.exit(1);
}

const actu = irokoT3['Actualités trimestrielles'] || '';
console.log('✅ Vérification des actualités:');
console.log('  Début:', actu.substring(0, 80) + '...');
console.log('  Contient "Mise à jour BULLETIN":', actu.includes('Mise à jour BULLETIN') ? '❌ OUI (à retirer)' : '✅ NON (déjà retiré)');
