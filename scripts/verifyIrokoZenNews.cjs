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
const irokoZen = merged.find(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('✅ Vérification des actualités trimestrielles Iroko Zen\n');
console.log('='.repeat(80));

if (!irokoZen) {
  console.log('❌ Iroko Zen non trouvée après fusion');
  process.exit(1);
}

console.log(`Nom SCPI: ${irokoZen['Nom SCPI']}`);
console.log(`Période bulletin: ${irokoZen['Période bulletin trimestriel'] || 'Non définie'}`);
console.log(`Actualités présentes: ${irokoZen['Actualités trimestrielles'] ? '✅ OUI' : '❌ NON'}\n`);

if (irokoZen['Actualités trimestrielles']) {
  const actu = irokoZen['Actualités trimestrielles'];
  const items = actu.split(' | ');
  
  console.log(`Nombre total d'actualités: ${items.length}\n`);
  
  // Simuler getScpiNews - filtrer les mentions de bulletin
  const filteredActualites = items.filter(actu => {
    const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                             actu.includes('bulletin trimestriel') ||
                             actu.includes('Mise à jour BULLETIN') ||
                             actu.includes('MISE À JOUR BULLETIN');
    return !isBulletinUpdate;
  });
  
  console.log(`Après filtrage: ${filteredActualites.length} actualités\n`);
  
  // Catégoriser
  const acquisitions = filteredActualites.filter(a => a.toLowerCase().includes('acquisition') || a.toLowerCase().includes('actifs acquis'));
  const collecte = filteredActualites.filter(a => a.toLowerCase().includes('collecte'));
  const distribution = filteredActualites.filter(a => a.toLowerCase().includes('distribution'));
  const occupation = filteredActualites.filter(a => a.toLowerCase().includes('occupation'));
  const cessions = filteredActualites.filter(a => a.toLowerCase().includes('cession'));
  const autres = filteredActualites.filter(a => 
    !a.toLowerCase().includes('acquisition') && 
    !a.toLowerCase().includes('collecte') && 
    !a.toLowerCase().includes('distribution') &&
    !a.toLowerCase().includes('occupation') &&
    !a.toLowerCase().includes('cession')
  );
  
  console.log(`📊 ${acquisitions.length} acquisition(s):`);
  acquisitions.forEach((acq, i) => {
    console.log(`   ${i + 1}. ${acq.substring(0, 100)}${acq.length > 100 ? '...' : ''}`);
  });
  
  console.log(`\n📊 ${collecte.length} collecte:`);
  collecte.forEach((col, i) => {
    console.log(`   ${i + 1}. ${col.substring(0, 100)}${col.length > 100 ? '...' : ''}`);
  });
  
  console.log(`\n📊 ${distribution.length} distribution:`);
  distribution.forEach((dist, i) => {
    console.log(`   ${i + 1}. ${dist.substring(0, 100)}${dist.length > 100 ? '...' : ''}`);
  });
  
  console.log(`\n📊 ${occupation.length} occupation:`);
  occupation.forEach((occ, i) => {
    console.log(`   ${i + 1}. ${occ.substring(0, 100)}${occ.length > 100 ? '...' : ''}`);
  });
  
  console.log(`\n📊 ${cessions.length} cession(s):`);
  cessions.forEach((ces, i) => {
    console.log(`   ${i + 1}. ${ces}`);
  });
  
  console.log(`\n📊 ${autres.length} autres actualités (premières 5):`);
  autres.slice(0, 5).forEach((autre, i) => {
    console.log(`   ${i + 1}. ${autre.substring(0, 90)}${autre.length > 90 ? '...' : ''}`);
  });
  
  console.log('\n✅ Les actualités sont bien chargées et devraient être affichées');
  console.log('💡 Si vous ne voyez pas les changements:');
  console.log('   1. Redémarrez le serveur de développement');
  console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R)');
} else {
  console.log('❌ Aucune actualité trimestrielle trouvée !');
}
