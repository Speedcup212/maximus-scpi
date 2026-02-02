const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur d\'Europe');

if (!coeur) {
  console.error('Coeur d\'Europe non trouvée');
  process.exit(1);
}

console.log('Nombre d\'immeubles avant:', coeur['Nombre d\'immeubles']);
coeur['Nombre d\'immeubles'] = 36;
console.log('Nombre d\'immeubles après:', coeur['Nombre d\'immeubles']);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
