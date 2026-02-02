const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const rl = data.find(s => s['Nom SCPI'] === 'Remake Live');

if (!rl) {
  console.error('Remake Live non trouvée');
  process.exit(1);
}

// Corriger le nombre d'immeubles
rl['Nombre d\'immeubles'] = 58;

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('✅ Nombre d\'immeubles corrigé: 58');
