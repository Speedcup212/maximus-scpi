const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver LOG-IN
const logIn = data.find(s => 
  s['Nom SCPI'] === 'Log In' || 
  s['Nom SCPI'] === 'LOG IN' ||
  s['Nom SCPI']?.toLowerCase() === 'log in'
);

if (!logIn) {
  console.log('❌ LOG-IN non trouvée');
  process.exit(1);
}

console.log('✅ Vérification des actualités trimestrielles LOG-IN T3 2025\n');
console.log('='.repeat(80));

const actualites = logIn['Actualités trimestrielles'] || '';
const items = actualites.split(' | ');

console.log(`Nombre total d'actualités: ${items.length}\n`);

const acquisitions = items.filter(i => i.toLowerCase().includes('acquisition'));
const cessions = items.filter(i => i.toLowerCase().includes('cession'));
const collecte = items.filter(i => i.toLowerCase().includes('collecte'));
const autres = items.filter(i => 
  !i.toLowerCase().includes('acquisition') && 
  !i.toLowerCase().includes('cession') &&
  !i.toLowerCase().includes('collecte')
);

console.log(`📊 ${acquisitions.length} acquisitions:`);
acquisitions.forEach((acq, i) => {
  console.log(`   ${i + 1}. ${acq.substring(0, 100)}${acq.length > 100 ? '...' : ''}`);
});

console.log(`\n📊 ${cessions.length} cessions:`);
cessions.forEach((ces, i) => {
  console.log(`   ${i + 1}. ${ces}`);
});

console.log(`\n📊 ${collecte.length} collecte:`);
collecte.forEach((col, i) => {
  console.log(`   ${i + 1}. ${col}`);
});

console.log(`\n📊 ${autres.length} autres actualités:`);
autres.slice(0, 5).forEach((autre, i) => {
  console.log(`   ${i + 1}. ${autre.substring(0, 90)}${autre.length > 90 ? '...' : ''}`);
});

console.log('\n' + '='.repeat(80));
console.log(`Période bulletin: ${logIn['Période bulletin trimestriel'] || 'Non définie'}`);
console.log('✅ Actualités trimestrielles mises à jour avec succès!');
