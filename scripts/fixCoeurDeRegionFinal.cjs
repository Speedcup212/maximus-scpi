const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur de Région');

if (!coeur) {
  console.error('Coeur de Région non trouvée');
  process.exit(1);
}

// Mettre à jour le nombre d'immeubles dans l'entrée principale
console.log('Nombre d\'immeubles avant:', coeur['Nombre d\'immeubles']);
coeur['Nombre d\'immeubles'] = 82;
console.log('Nombre d\'immeubles après:', coeur['Nombre d\'immeubles']);

// Supprimer le doublon "Nombre d'immeubles" dans les données trimestrielles si présent
if (coeur['Période bulletin trimestriel'] === 'T3 2025') {
  // Le champ "Nombre d'immeubles" doit être dans l'entrée principale, pas en doublon
  console.log('✅ Données trimestrielles présentes');
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
