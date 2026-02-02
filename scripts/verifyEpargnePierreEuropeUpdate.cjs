const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const epe = data.find(s => s['Nom SCPI'] === 'Épargne Pierre Europe');

if (!epe) {
  console.error('Épargne Pierre Europe non trouvée');
  process.exit(1);
}

console.log('Clés disponibles contenant "immeuble":');
Object.keys(epe).filter(k => k.toLowerCase().includes('immeuble')).forEach(k => console.log('  -', k, ':', epe[k]));

console.log('\n✅ Date de mise à jour:', epe['Date de mise à jour']);
console.log('✅ Période bulletin:', epe['Période bulletin trimestriel']);
