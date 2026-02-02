const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur de Région');

if (!coeur) {
  console.error('Coeur de Région non trouvée');
  process.exit(1);
}

// Lister toutes les clés
console.log('Toutes les clés contenant "immeuble":');
Object.keys(coeur).forEach(key => {
  if (key.toLowerCase().includes('immeuble')) {
    console.log(`  "${key}": ${coeur[key]}`);
  }
});

// Normaliser : garder seulement "Nombre d'immeubles" (avec apostrophe courbe)
const keysToDelete = [];
Object.keys(coeur).forEach(key => {
  if (key.toLowerCase().includes('immeuble') && key !== 'Nombre d\'immeubles') {
    keysToDelete.push(key);
  }
});

// Supprimer les doublons
keysToDelete.forEach(key => {
  console.log(`Suppression du doublon: "${key}"`);
  delete coeur[key];
});

// S'assurer que "Nombre d'immeubles" est à 82
coeur['Nombre d\'immeubles'] = 82;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier nettoyé et mis à jour');
