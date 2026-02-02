const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInT3 = data.find(s => s['Nom SCPI'] === 'Log In' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!logInT3) {
  console.error('❌ Entrée T3 2025 non trouvée');
  process.exit(1);
}

const actu = logInT3['Actualités trimestrielles'] || '';

console.log('✅ Vérification de la note complémentaire:');
console.log('  Contient "Note complémentaire T4 2025":', actu.includes('Note complémentaire T4 2025') ? '✅ OUI' : '❌ NON');
console.log('  Contient "Pythagore":', actu.includes('Pythagore') ? '✅ OUI' : '❌ NON');
console.log('  Contient "1,5%":', actu.includes('1,5%') ? '✅ OUI' : '❌ NON');

if (actu.includes('Note complémentaire')) {
  const startIdx = actu.indexOf('Note complémentaire');
  console.log('\n📝 Note complémentaire ajoutée:');
  console.log(actu.substring(startIdx));
}
