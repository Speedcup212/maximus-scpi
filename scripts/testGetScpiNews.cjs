const fs = require('fs');
const path = require('path');

// Simuler getScpiNews pour tester
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

function mergeScpiEntries(entries) {
  const merged = {};
  entries.forEach((entry) => {
    const nom = entry['Nom SCPI'];
    if (!nom) return;
    if (!merged[nom]) {
      merged[nom] = { ...entry };
    } else {
      const existing = merged[nom];
      if (entry['Période bulletin trimestriel'] && !existing['Période bulletin trimestriel']) {
        if (entry['Actualités trimestrielles']) {
          existing['Actualités trimestrielles'] = entry['Actualités trimestrielles'];
        }
        if (entry['Période bulletin trimestriel']) {
          existing['Période bulletin trimestriel'] = entry['Période bulletin trimestriel'];
        }
      }
    }
  });
  return Object.values(merged);
}

const merged = mergeScpiEntries(scpiCompletJson);

// Tester avec Perial Opportunités Europe
const perial = merged.find(s => s['Nom SCPI'] === 'Perial Opportunités Europe');

if (!perial) {
  console.log('❌ Perial Opportunités Europe non trouvée');
  process.exit(1);
}

const scpi = {
  name: perial['Nom SCPI'],
  actualitesTrimestrielles: perial['Actualités trimestrielles'] || undefined
};

console.log('✅ Test de getScpiNews pour Perial Opportunités Europe\n');
console.log('='.repeat(80));

if (!scpi.actualitesTrimestrielles) {
  console.log('❌ Pas d\'actualités trimestrielles dans les données');
  process.exit(1);
}

// Simuler getScpiNews
const actualites = scpi.actualitesTrimestrielles.split(' | ');
const filteredActualites = actualites.filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

console.log(`Nombre d'actualités après filtrage: ${filteredActualites.length}`);
console.log(`Première actualité: ${filteredActualites[0]?.substring(0, 100)}...`);

if (filteredActualites.length === 0) {
  console.log('\n❌ PROBLÈME: Toutes les actualités ont été filtrées !');
  console.log('   La fonction getScpiNews retournera une chaîne vide.');
} else {
  console.log('\n✅ Les actualités sont présentes et ne seront pas toutes filtrées');
}
