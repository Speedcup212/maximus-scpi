const fs = require('fs');
const path = require('path');

// Simuler getScpiNews pour Perial
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
const perial = merged.find(s => 
  s['Nom SCPI'] === 'Perial Opportunités Europe'
);

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
  console.log('❌ Pas d\'actualités');
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

const fullText = filteredActualites.join(' | ');

console.log('📄 Ordre dans le JSON (premières 3 actualités):');
filteredActualites.slice(0, 3).forEach((actu, i) => {
  console.log(`   ${i + 1}. ${actu.substring(0, 80)}...`);
});

// Tester la détection des événements à venir
const evenementAVenirMatch = filteredActualites.find(actu => 
  (actu.includes('à compter du') || actu.includes('à partir du') || 
   actu.includes('dès le') || actu.includes('à venir')) &&
  actu.length < 150
);

if (evenementAVenirMatch) {
  console.log(`\n✅ Événement à venir détecté:`);
  console.log(`   ${evenementAVenirMatch}`);
  
  // Tester getIconAndKeyword
  const factLower = evenementAVenirMatch.toLowerCase();
  let icon = '⏳';
  let keyword = 'Actualité';
  
  if (factLower.includes('à compter du') || factLower.includes('à partir du') || 
      factLower.includes('dès le') || factLower.includes('à venir')) {
    icon = '⏳';
    keyword = 'Événement à venir';
  }
  
  console.log(`\n📊 Format attendu:`);
  console.log(`   ${icon} ${keyword} – ${evenementAVenirMatch}`);
} else {
  console.log(`\n❌ Événement à venir non détecté !`);
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 Si les changements n\'apparaissent pas:');
console.log('   1. Redémarrez le serveur de développement (Ctrl+C puis npm run dev)');
console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
console.log('   3. Attendez quelques secondes pour que le hot-reload se fasse');
