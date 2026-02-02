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

console.log('📄 Première actualité (texte exact):');
const premiere = filteredActualites[0];
console.log(`   "${premiere}"`);
console.log(`   Longueur: ${premiere.length} caractères\n`);

// Tester différents patterns
const patterns = [
  { name: 'à compter du', test: premiere.includes('à compter du') },
  { name: 'À compter du', test: premiere.includes('À compter du') },
  { name: 'à compter (lowercase)', test: premiere.toLowerCase().includes('à compter du') },
  { name: '01/01/2026', test: premiere.includes('01/01/2026') },
  { name: 'modification du prix', test: premiere.includes('modification du prix') }
];

console.log('🔍 Tests de détection:');
patterns.forEach(({ name, test }) => {
  console.log(`   ${name}: ${test ? '✅' : '❌'}`);
});

// Tester la condition exacte de getScpiNews
const testCondition = (premiere.includes('à compter du') || premiere.includes('à partir du') || 
                       premiere.includes('dès le') || premiere.includes('à venir')) &&
                      premiere.length < 150;

console.log(`\n✅ Condition getScpiNews: ${testCondition ? 'DÉTECTÉ' : 'NON DÉTECTÉ'}`);

if (testCondition) {
  console.log('\n✅ L\'événement devrait être détecté et affiché !');
} else {
  console.log('\n⚠️  L\'événement ne sera pas détecté par getScpiNews');
  if (premiere.length >= 150) {
    console.log(`   Raison: La phrase est trop longue (${premiere.length} caractères, limite: 150)`);
  }
}
