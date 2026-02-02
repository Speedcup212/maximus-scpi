const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète
const comete = data.find(s => s['Nom SCPI'] === 'Comète');

if (!comete) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

console.log('✅ Comète trouvée\n');
console.log('Actualités trimestrielles:');
console.log('='.repeat(80));

const actualites = comete['Actualités trimestrielles'];
if (actualites) {
  const items = actualites.split(' | ');
  console.log(`Nombre d'actualités: ${items.length}\n`);
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.substring(0, 100)}${item.length > 100 ? '...' : ''}`);
  });
} else {
  console.log('❌ Aucune actualité trimestrielle trouvée');
}

console.log('\n' + '='.repeat(80));
console.log(`Période bulletin: ${comete['Période bulletin trimestriel'] || 'Non définie'}`);
