const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const optimale = data.find(s => s['Nom SCPI'] === 'Optimale' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!optimale) {
  console.error('Optimale T3 2025 non trouvée');
  process.exit(1);
}

console.log('Avant:', optimale['Nombre d\'immeubles']);
optimale['Nombre d\'immeubles'] = 36;
console.log('Après:', optimale['Nombre d\'immeubles']);

// Mettre à jour aussi la répartition sectorielle en texte
optimale['Répartition Sectorielle'] = 'Bureaux (43,2%), Commerces (29,1%), Activités & Logistique (23,4%), Santé & Éducation (4,3%)';

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
