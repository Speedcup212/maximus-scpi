const fs = require('fs');
const path = require('path');

// Simuler getScpiNews pour LOG-IN avec les corrections
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
      }
    }
  });
  return Object.values(merged);
}

const merged = mergeScpiEntries(scpiCompletJson);
const logInRaw = merged.find(s => 
  s['Nom SCPI'] === 'Log In' || 
  s['Nom SCPI'] === 'LOG IN' ||
  s['Nom SCPI']?.toLowerCase() === 'log in'
);

const actualites = logInRaw['Actualités trimestrielles'].split(' | ');
const filteredActualites = actualites.filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

const fullText = filteredActualites.join(' | ');

console.log('✅ Test final de getScpiNews pour LOG-IN\n');
console.log('='.repeat(80));

// Test pattern acquisitions avec caractères accentués
const acqFormatMatches = Array.from(fullText.matchAll(/acquisition.*?à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi));
console.log(`📊 Acquisitions trouvées: ${acqFormatMatches.length}`);
acqFormatMatches.forEach((match, i) => {
  const ville = match[1].trim();
  const pays = match[2].split(',')[0].trim();
  console.log(`   ${i + 1}. ${ville} (${pays})`);
});

// Test cessions
const aucuneCessionMatch = fullText.match(/Aucune cession[^|]*/i);
console.log(`\n📊 Cession: ${aucuneCessionMatch ? aucuneCessionMatch[0].substring(0, 60) : 'Non trouvée'}`);

// Test collecte
const collecteFullMatch = fullText.match(/Collecte\s+(?:brute|nette)\s+de\s+(\d+[.,]\d+)\s*(M|Md)€[^|]*/i);
console.log(`\n📊 Collecte: ${collecteFullMatch ? collecteFullMatch[0].substring(0, 80) : 'Non trouvée'}`);

// Test occupation
const occFullMatch = fullText.match(/Taux\s+d'?occupation\s+financier[^|]*/i);
console.log(`\n📊 Occupation: ${occFullMatch ? occFullMatch[0].substring(0, 80) : 'Non trouvée'}`);

console.log('\n' + '='.repeat(80));
if (acqFormatMatches.length === 2) {
  console.log('✅ Les deux acquisitions (Fossò et Tychy) devraient être affichées');
} else {
  console.log(`⚠️  ${acqFormatMatches.length} acquisition(s) trouvée(s) au lieu de 2`);
}
