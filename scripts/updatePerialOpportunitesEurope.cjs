const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const perial = data.find(s => s['Nom SCPI'] === 'Perial Opportunités Europe' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!perial) {
  console.error('Perial Opportunités Europe T3 2025 non trouvée');
  process.exit(1);
}

console.log('Avant:', perial['Nombre d\'immeubles']);
perial['Nombre d\'immeubles'] = 131;
console.log('Après:', perial['Nombre d\'immeubles']);

// Mettre à jour les répartitions en texte
perial['Répartition Géographique'] = 'France (59,5%), Pays-Bas (13,8%), Allemagne (12,6%), Espagne (12,3%), Italie (1,9%)';
perial['Répartition Sectorielle'] = 'Bureaux (48,5%), Hôtels, tourisme, loisirs (26,4%), Commerces (18,5%), Santé et éducation (4,8%), Logistique et locaux d\'activités (1,7%), Alternatifs (0,1%)';

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
