const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur de Région' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!coeur) {
  console.error('Coeur de Région T3 2025 non trouvée');
  process.exit(1);
}

console.log('Avant:', coeur['Nombre d\'immeubles']);
coeur['Nombre d\'immeubles'] = 82;
console.log('Après:', coeur['Nombre d\'immeubles']);

// Mettre à jour les répartitions en texte
coeur['Répartition Géographique'] = 'Régions (86,0%), Île-de-France (14,0%)';
coeur['Répartition Sectorielle'] = 'Bureaux (51,08%), Commerces (29,62%), Logistique et locaux d\'activités (17,47%), Santé et éducation (1,77%), Alternatifs (0,06%)';

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
