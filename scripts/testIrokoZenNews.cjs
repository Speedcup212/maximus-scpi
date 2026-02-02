const fs = require('fs');
const path = require('path');

// Simuler le chargement comme dans scpiData.ts
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Trouver toutes les entrées Iroko Zen
const irokoEntries = scpiCompletJson.filter(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('Nombre d\'entrées Iroko Zen:', irokoEntries.length);

irokoEntries.forEach((scpi, idx) => {
  const periode = scpi['Période bulletin trimestriel'] || 'principale';
  console.log(`\n=== Entrée ${idx + 1} (${periode}) ===`);
  console.log('Actualités trimestrielles:', scpi['Actualités trimestrielles'] ? '✅ Présent' : '❌ Absent');
  
  if (scpi['Actualités trimestrielles']) {
    const actu = scpi['Actualités trimestrielles'];
    console.log('Début:', actu.substring(0, 80) + '...');
    console.log('Contient "Mise à jour BULLETIN":', actu.includes('Mise à jour BULLETIN TRIMESTRIEL'));
  }
  
  // Simuler la transformation comme dans scpiData.ts
  const actualitesTrimestrielles = scpi['Actualités trimestrielles'] || undefined;
  console.log('actualitesTrimestrielles (après transformation):', actualitesTrimestrielles ? '✅ Présent' : '❌ Absent');
});

// Vérifier comment scpiData.ts trouverait Iroko Zen
console.log('\n=== Test de recherche par nom ===');
const found = scpiCompletJson.find(s => s['Nom SCPI'] === 'Iroko Zen');
if (found) {
  console.log('Première entrée trouvée:', found['Période bulletin trimestriel'] || 'principale');
  console.log('Actualités:', found['Actualités trimestrielles'] ? '✅ Présent' : '❌ Absent');
}
