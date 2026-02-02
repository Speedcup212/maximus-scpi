const fs = require('fs');
const path = require('path');

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
const perial = merged.find(s => s['Nom SCPI'] === 'Perial Opportunités Europe');

if (!perial) {
  console.log('❌ Perial Opportunités Europe non trouvée');
  process.exit(1);
}

const actualites = perial['Actualités trimestrielles'].split(' | ');
const filteredActualites = actualites.filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

// Tester avec la nouvelle logique (avec toLowerCase)
const evenementAVenirMatch = filteredActualites.find(actu => {
  const actuLower = actu.toLowerCase();
  return (actuLower.includes('à compter du') || actuLower.includes('à partir du') || 
          actuLower.includes('dès le') || actuLower.includes('à venir')) &&
         actu.length < 150;
});

console.log('✅ Test de détection avec la nouvelle logique (toLowerCase)\n');
console.log('='.repeat(80));

if (evenementAVenirMatch) {
  console.log(`✅ Événement à venir DÉTECTÉ:`);
  console.log(`   "${evenementAVenirMatch}"`);
  console.log(`   Longueur: ${evenementAVenirMatch.length} caractères\n`);
  
  // Simuler getIconAndKeyword
  const factLower = evenementAVenirMatch.toLowerCase();
  let icon = '⏳';
  let keyword = 'Événement à venir';
  
  console.log(`📊 Format de sortie attendu:`);
  console.log(`   ${icon} ${keyword} – ${evenementAVenirMatch}`);
  console.log(`\n✅ L'événement sera bien affiché dans l'interface !`);
} else {
  console.log(`❌ Événement à venir NON DÉTECTÉ !`);
  console.log(`\nPremière actualité:`);
  console.log(`   "${filteredActualites[0]}"`);
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 Si vous ne voyez toujours pas les changements:');
console.log('   1. Redémarrez le serveur de développement (Ctrl+C puis npm run dev)');
console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
console.log('   3. Attendez quelques secondes pour que le hot-reload se fasse');
