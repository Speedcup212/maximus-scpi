const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur de Région');

if (!coeur) {
  console.error('Coeur de Région non trouvée');
  process.exit(1);
}

// Lister toutes les clés contenant "immeuble"
const immeubleKeys = Object.keys(coeur).filter(k => k.toLowerCase().includes('immeuble'));
console.log('Clés contenant "immeuble":', immeubleKeys);

// Mettre à jour toutes les occurrences
immeubleKeys.forEach(key => {
  console.log(`  ${key}: ${coeur[key]} -> 82`);
  coeur[key] = 82;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
