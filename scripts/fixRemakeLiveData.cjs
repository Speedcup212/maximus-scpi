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

// Mettre à jour les répartitions en format texte
rl['Répartition Géographique'] = 'Royaume Uni (29,00%), France (27,62%), Espagne (11,66%), Irlande (10,11%), Pays-Bas (9,93%), Pologne (8,04%), Allemagne (2,65%), Portugal (0,98%)';
rl['Répartition Sectorielle'] = 'Bureaux (38,02%), Santé & éducation (21,92%), Logistique et locaux d\'activité (14,12%), Commerces (12,06%), Hôtels, tourisme, loisirs (8,84%), Résidentiel (3,48%), Alternatifs (1,56%)';

// Vérifier les totaux
const sect = rl['Répartition Sectorielle JSON'];
const geo = rl['Répartition Géographique JSON'];

const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);

console.log('✅ Corrections appliquées:');
console.log(`  - Nombre d'immeubles: 58`);
console.log(`  - Répartition Sectorielle: ${totalSect.toFixed(2)}% ${totalSect === 100 ? '✓' : '✗'}`);
console.log(`  - Répartition Géographique: ${totalGeo.toFixed(2)}% ${totalGeo === 100 ? '✓' : '✗'}`);

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('\n✅ Fichier sauvegardé');
