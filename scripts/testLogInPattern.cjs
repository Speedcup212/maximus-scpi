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

console.log('🔍 Test de différents patterns pour trouver Fossò\n');
console.log('='.repeat(80));

// Pattern original
const pattern1 = /acquisition.*?à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi;
const matches1 = Array.from(fullText.matchAll(pattern1));
console.log(`Pattern 1 (original): ${matches1.length} match(es)`);
matches1.forEach((m, i) => console.log(`  ${i + 1}. ${m[1]}`));

// Pattern avec caractères accentués étendus
const pattern2 = /acquisition.*?à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi;
const matches2 = Array.from(fullText.matchAll(pattern2));
console.log(`\nPattern 2 (étendu): ${matches2.length} match(es)`);
matches2.forEach((m, i) => console.log(`  ${i + 1}. ${m[1]}`));

// Pattern simplifié
const pattern3 = /Acquisition à ([^\(]+)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi;
const matches3 = Array.from(fullText.matchAll(pattern3));
console.log(`\nPattern 3 (simplifié): ${matches3.length} match(es)`);
matches3.forEach((m, i) => console.log(`  ${i + 1}. ${m[1].trim()}`));

// Chercher directement "Fossò"
console.log(`\n🔍 Recherche directe de "Fossò":`);
if (fullText.includes('Fossò')) {
  console.log('  ✅ "Fossò" trouvé dans le texte');
  const fossMatch = fullText.match(/Acquisition à ([^\(]+)\s*\(([^)]+)\)\s*:\s*([^|]+)/i);
  if (fossMatch) {
    console.log(`  ✅ Match trouvé: ${fossMatch[1].trim()}`);
  } else {
    console.log('  ❌ Pas de match avec le pattern');
  }
} else {
  console.log('  ❌ "Fossò" non trouvé dans le texte');
}
