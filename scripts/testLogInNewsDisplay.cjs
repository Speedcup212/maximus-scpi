const fs = require('fs');
const path = require('path');

// Simuler le chargement comme dans scpiData.ts
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Fonction de fusion (copie de scpiData.ts)
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
const logIn = merged.find(s => 
  s['Nom SCPI'] === 'Log In' || 
  s['Nom SCPI'] === 'LOG IN' ||
  s['Nom SCPI']?.toLowerCase() === 'log in'
);

console.log('✅ Test de chargement des actualités LOG-IN\n');
console.log('='.repeat(80));

if (!logIn) {
  console.log('❌ LOG-IN non trouvée après fusion');
  process.exit(1);
}

console.log(`Nom SCPI: ${logIn['Nom SCPI']}`);
console.log(`Période bulletin: ${logIn['Période bulletin trimestriel'] || 'Non définie'}`);
console.log(`Actualités présentes: ${logIn['Actualités trimestrielles'] ? '✅ OUI' : '❌ NON'}\n`);

if (logIn['Actualités trimestrielles']) {
  const actu = logIn['Actualités trimestrielles'];
  const items = actu.split(' | ');
  
  console.log(`Nombre d'actualités: ${items.length}\n`);
  
  // Simuler getScpiNews - filtrer les mentions de bulletin
  const filteredActualites = items.filter(actu => {
    const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                             actu.includes('bulletin trimestriel') ||
                             actu.includes('Mise à jour BULLETIN') ||
                             actu.includes('MISE À JOUR BULLETIN');
    return !isBulletinUpdate;
  });
  
  console.log(`Après filtrage: ${filteredActualites.length} actualités\n`);
  
  // Chercher les acquisitions
  const acquisitions = filteredActualites.filter(a => 
    a.toLowerCase().includes('acquisition')
  );
  
  console.log(`Acquisitions trouvées: ${acquisitions.length}`);
  acquisitions.forEach((acq, i) => {
    console.log(`  ${i + 1}. ${acq.substring(0, 80)}...`);
  });
  
  console.log('\n✅ Les actualités sont bien chargées et devraient être affichées');
  console.log('💡 Si vous ne voyez pas les changements:');
  console.log('   1. Redémarrez le serveur de développement');
  console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R)');
} else {
  console.log('❌ Aucune actualité trimestrielle trouvée !');
}
