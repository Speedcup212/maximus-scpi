const fs = require('fs');
const path = require('path');

// Simuler getScpiNews pour Optimale
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
const optimale = merged.find(s => 
  s['Nom SCPI'] === 'Optimale'
);

if (!optimale) {
  console.log('❌ Optimale non trouvée');
  process.exit(1);
}

const scpi = {
  name: optimale['Nom SCPI'],
  actualitesTrimestrielles: optimale['Actualités trimestrielles'] || undefined
};

console.log('✅ Test de getScpiNews pour Optimale\n');
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

// Tester le pattern pour "Acquisition à Ville (Pays, ...)"
const acqFormatMatches = Array.from(fullText.matchAll(/acquisition.*?à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi));
console.log(`\n🔍 Test pattern "Acquisition à Ville (Pays) : description":`);
console.log(`   ${acqFormatMatches.length} match(es) trouvé(s)`);
acqFormatMatches.forEach((match, i) => {
  console.log(`   ${i + 1}. ${match[1]} (${match[2].substring(0, 30)}...)`);
  console.log(`      Position dans le texte: ${fullText.indexOf(match[0])}`);
});

// Vérifier l'ordre
if (acqFormatMatches.length >= 2) {
  const premiere = acqFormatMatches[0];
  const deuxieme = acqFormatMatches[1];
  
  const posPremiere = fullText.indexOf(premiere[0]);
  const posDeuxieme = fullText.indexOf(deuxieme[0]);
  
  console.log(`\n📊 Ordre des acquisitions:`);
  console.log(`   1. ${premiere[1]} - Position: ${posPremiere}`);
  console.log(`   2. ${deuxieme[1]} - Position: ${posDeuxieme}`);
  
  if (premiere[1].includes('Sainte-Hélène') || premiere[1].includes('Sainte-Helene')) {
    console.log(`\n✅ Sainte-Hélène-du-Lac est bien en première position dans les résultats !`);
  } else {
    console.log(`\n⚠️  Sainte-Hélène-du-Lac n'est pas en première position dans les résultats`);
    console.log(`   Première trouvée: ${premiere[1]}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 Si les changements n\'apparaissent pas:');
console.log('   1. Redémarrez le serveur de développement (Ctrl+C puis npm run dev)');
console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
console.log('   3. Attendez quelques secondes pour que le hot-reload se fasse');
