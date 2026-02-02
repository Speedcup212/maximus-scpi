const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur de Région');

if (!coeur) {
  console.error('Coeur de Région non trouvée');
  process.exit(1);
}

// Vérifier si "Nombre d'immeubles" existe dans l'entrée principale (avant les données trimestrielles)
const keysBeforeTrimestriel = [];
let foundTrimestriel = false;
for (const key of Object.keys(coeur)) {
  if (key === 'Période bulletin trimestriel') {
    foundTrimestriel = true;
    break;
  }
  keysBeforeTrimestriel.push(key);
}

console.log('Clés avant données trimestrielles:', keysBeforeTrimestriel.filter(k => k.toLowerCase().includes('immeuble')));

// Ajouter "Nombre d'immeubles" juste avant "Minimum de souscription €" si absent
if (!coeur['Nombre d\'immeubles'] || foundTrimestriel) {
  // Créer un nouvel objet avec l'ordre correct
  const newCoeur = {};
  let inserted = false;
  
  for (const key of Object.keys(coeur)) {
    if (key === 'Minimum de souscription €' && !inserted) {
      newCoeur['Nombre d\'immeubles'] = 82;
      inserted = true;
    }
    if (key !== 'Nombre d\'immeubles' || !inserted) {
      newCoeur[key] = coeur[key];
    }
  }
  
  // Remplacer l'entrée
  const index = data.findIndex(s => s['Nom SCPI'] === 'Coeur de Région');
  data[index] = newCoeur;
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Nombre d\'immeubles ajouté dans l\'entrée principale');
} else {
  console.log('✅ Nombre d\'immeubles déjà présent:', coeur['Nombre d\'immeubles']);
}
