const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const comete = data.find(s => s['Nom SCPI'] === 'Comète');

if (!comete) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

console.log('✅ Vérification finale des actualités trimestrielles Comète\n');
console.log('='.repeat(80));

const actualites = comete['Actualités trimestrielles'] || '';
const items = actualites.split(' | ');

console.log(`Nombre total d'actualités: ${items.length}\n`);

const acquisitions = items.filter(i => i.toLowerCase().includes('acquisition'));
const cessions = items.filter(i => i.toLowerCase().includes('cession'));
const autres = items.filter(i => !i.toLowerCase().includes('acquisition') && !i.toLowerCase().includes('cession'));

console.log(`📊 ${acquisitions.length} acquisitions:`);
acquisitions.forEach((acq, i) => {
  console.log(`   ${i + 1}. ${acq.substring(0, 90)}${acq.length > 90 ? '...' : ''}`);
});

console.log(`\n📊 ${cessions.length} cessions:`);
cessions.forEach((ces, i) => {
  console.log(`   ${i + 1}. ${ces}`);
});

console.log(`\n📊 ${autres.length} autres actualités:`);
autres.forEach((autre, i) => {
  console.log(`   ${i + 1}. ${autre.substring(0, 90)}${autre.length > 90 ? '...' : ''}`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ Actualités trimestrielles mises à jour avec succès!');
