const fs = require('fs');
const path = require('path');

// Simuler exactement ce que fait scpiData.ts
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Fonction de fusion
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
const cometeRaw = merged.find(s => s['Nom SCPI'] === 'Comète');

if (!cometeRaw) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

// Simuler la transformation comme dans scpiData.ts
const scpi = {
  name: cometeRaw['Nom SCPI'],
  actualitesTrimestrielles: cometeRaw['Actualités trimestrielles'] || undefined,
  periodeBulletinTrimestriel: cometeRaw['Période bulletin trimestriel'] || undefined
};

console.log('✅ Test de getScpiNews avec données réelles\n');
console.log('='.repeat(80));
console.log(`Nom: ${scpi.name}`);
console.log(`Actualités présentes: ${scpi.actualitesTrimestrielles ? '✅ OUI' : '❌ NON'}`);
console.log(`Période: ${scpi.periodeBulletinTrimestriel || 'Non définie'}\n`);

if (!scpi.actualitesTrimestrielles) {
  console.log('❌ Pas d\'actualités trimestrielles - getScpiNews retournera une chaîne vide');
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

console.log(`Actualités brutes: ${actualites.length}`);
console.log(`Après filtrage: ${filteredActualites.length}\n`);

if (filteredActualites.length === 0) {
  console.log('❌ Toutes les actualités ont été filtrées !');
  console.log('Premières actualités brutes:');
  actualites.slice(0, 3).forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.substring(0, 80)}...`);
  });
} else {
  console.log('✅ Actualités disponibles pour getScpiNews:');
  filteredActualites.slice(0, 5).forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.substring(0, 80)}...`);
  });
  
  // Simuler l'extraction des acquisitions
  const fullText = filteredActualites.join(' | ');
  const acquisitions = filteredActualites.filter(a => a.toLowerCase().includes('acquisition'));
  
  console.log(`\n📊 ${acquisitions.length} acquisitions trouvées dans les actualités filtrées`);
  console.log('\n✅ getScpiNews devrait retourner du contenu');
  console.log('💡 Si vous ne voyez rien dans l\'interface:');
  console.log('   1. Redémarrez le serveur (Ctrl+C puis npm start)');
  console.log('   2. Videz le cache (Ctrl+Shift+R)');
  console.log('   3. Vérifiez la console du navigateur pour les erreurs');
}
