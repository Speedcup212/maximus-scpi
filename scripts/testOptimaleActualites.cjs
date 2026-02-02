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
      } else if (!entry['Période bulletin trimestriel'] && existing['Période bulletin trimestriel']) {
        const temp = { ...existing };
        Object.assign(existing, entry);
        if (temp['Actualités trimestrielles']) {
          existing['Actualités trimestrielles'] = temp['Actualités trimestrielles'];
        }
        if (temp['Période bulletin trimestriel']) {
          existing['Période bulletin trimestriel'] = temp['Période bulletin trimestriel'];
        }
      }
    }
  });
  
  return Object.values(merged);
}

const merged = mergeScpiEntries(scpiCompletJson);
const optimale = merged.find(s => 
  s['Nom SCPI'] === 'Optimale'
);

if (!optimale) {
  console.log('❌ Optimale non trouvée');
  process.exit(1);
}

console.log(`✅ Optimale trouvée: ${optimale['Nom SCPI']}\n`);

if (optimale['Actualités trimestrielles']) {
  const actu = optimale['Actualités trimestrielles'];
  const items = actu.split(' | ');
  
  console.log(`Nombre d'actualités: ${items.length}\n`);
  console.log('📋 Premières actualités:');
  items.slice(0, 5).forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.substring(0, 100)}${item.length > 100 ? '...' : ''}`);
  });
  
  // Vérifier l'ordre
  const premiereAcquisition = items.find(item => 
    item.toLowerCase().includes('sainte-hélène-du-lac') || 
    item.toLowerCase().includes('sainte-helene-du-lac')
  );
  
  if (premiereAcquisition) {
    const index = items.indexOf(premiereAcquisition);
    console.log(`\n✅ Acquisition Sainte-Hélène-du-Lac trouvée à la position ${index + 1}`);
    console.log(`   ${premiereAcquisition.substring(0, 120)}...`);
    
    if (index === 0) {
      console.log('\n✅ L\'acquisition est bien en première position !');
    } else {
      console.log(`\n⚠️  L'acquisition n'est pas en première position (position ${index + 1})`);
    }
  } else {
    console.log('\n❌ Acquisition Sainte-Hélène-du-Lac non trouvée !');
  }
  
  // Simuler getScpiNews
  const filteredActualites = items.filter(actu => {
    const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                             actu.includes('bulletin trimestriel') ||
                             actu.includes('Mise à jour BULLETIN') ||
                             actu.includes('MISE À JOUR BULLETIN');
    return !isBulletinUpdate;
  });
  
  console.log(`\n📊 Après filtrage: ${filteredActualites.length} actualités`);
  console.log('\n💡 Si vous ne voyez pas les changements dans l\'interface:');
  console.log('   1. Redémarrez le serveur de développement (Ctrl+C puis npm run dev)');
  console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
  console.log('   3. Vérifiez que vous regardez la bonne SCPI (Optimale T3 2025)');
} else {
  console.log('❌ Aucune actualité trimestrielle trouvée !');
}
