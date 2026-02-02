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
const optimale = merged.find(s => s['Nom SCPI'] === 'Optimale');

if (!optimale) {
  console.log('❌ Optimale non trouvée');
  process.exit(1);
}

const actualites = optimale['Actualités trimestrielles'].split(' | ');
const filteredActualites = actualites.filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

const fullText = filteredActualites.join(' | ');

console.log('📄 Texte complet (premiers 500 caractères):');
console.log(fullText.substring(0, 500));
console.log('\n');

// Tester différents patterns
const patterns = [
  {
    name: 'Pattern actuel (avec lookbehind)',
    regex: /(?:^|\|)\s*Acquisition\s+à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi
  },
  {
    name: 'Pattern simple (sans lookbehind)',
    regex: /Acquisition\s+à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi
  },
  {
    name: 'Pattern avec word boundary',
    regex: /\bAcquisition\s+à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi
  }
];

patterns.forEach(({ name, regex }) => {
  console.log(`\n🔍 Test: ${name}`);
  const matches = Array.from(fullText.matchAll(regex));
  console.log(`   ${matches.length} match(es) trouvé(s)`);
  matches.forEach((match, i) => {
    console.log(`   ${i + 1}. ${match[1]} (${match[2].substring(0, 40)}...)`);
    console.log(`      Position: ${fullText.indexOf(match[0])}`);
  });
});

// Chercher manuellement "Sainte-Hélène-du-Lac"
const sainteHeleneIndex = fullText.indexOf('Sainte-Hélène-du-Lac');
if (sainteHeleneIndex !== -1) {
  console.log(`\n✅ "Sainte-Hélène-du-Lac" trouvé à la position ${sainteHeleneIndex}`);
  console.log(`   Contexte: ${fullText.substring(Math.max(0, sainteHeleneIndex - 50), sainteHeleneIndex + 150)}`);
} else {
  console.log(`\n❌ "Sainte-Hélène-du-Lac" non trouvé dans le texte !`);
}
