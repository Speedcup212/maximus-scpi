const fs = require('fs');
const path = require('path');

// Simuler exactement getScpiNews pour LOG-IN
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
const logInRaw = merged.find(s => 
  s['Nom SCPI'] === 'Log In' || 
  s['Nom SCPI'] === 'LOG IN' ||
  s['Nom SCPI']?.toLowerCase() === 'log in'
);

if (!logInRaw) {
  console.log('❌ LOG-IN non trouvée');
  process.exit(1);
}

const scpi = {
  name: logInRaw['Nom SCPI'],
  actualitesTrimestrielles: logInRaw['Actualités trimestrielles'] || undefined
};

console.log('✅ Test de getScpiNews pour LOG-IN\n');
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

console.log('📄 Texte complet des actualités filtrées:');
console.log(fullText.substring(0, 500) + '...\n');

// Tester le pattern pour "Deux acquisitions finalisées"
const acqDetailMatch = fullText.match(/(\d+)\s+acquisition.*?finalisée.*?(\d+[.,]\d+)\s*M€.*?:\s*([^|]+)/i);
console.log('🔍 Test pattern "X acquisitions finalisées":');
if (acqDetailMatch) {
  console.log(`   ✅ Match trouvé: ${acqDetailMatch[1]} acquisitions, ${acqDetailMatch[2]}M€`);
  console.log(`   Détails: ${acqDetailMatch[3].substring(0, 100)}...`);
} else {
  console.log('   ❌ Aucun match');
}

// Tester le pattern pour "Acquisition à Ville (Pays, ...)"
const acqFormatMatches = Array.from(fullText.matchAll(/acquisition.*?à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi));
console.log(`\n🔍 Test pattern "Acquisition à Ville (Pays) : description":`);
console.log(`   ${acqFormatMatches.length} match(es) trouvé(s)`);
acqFormatMatches.forEach((match, i) => {
  console.log(`   ${i + 1}. ${match[1]} (${match[2].substring(0, 30)}...)`);
  console.log(`      Description: ${match[3].substring(0, 80)}...`);
});

// Tester la collecte
const collecteMatch = fullText.match(/collecte\s+(?:brute|nette).*?(\d+[.,]\d+)\s*M€/i);
console.log(`\n🔍 Test pattern "Collecte":`);
if (collecteMatch) {
  console.log(`   ✅ Match trouvé: ${collecteMatch[1]}M€`);
} else {
  console.log('   ❌ Aucun match');
}

// Tester l'occupation
const occupationMatch = fullText.match(/taux\s+d'?occupation\s+financier.*?(\d+)\s*%/i);
console.log(`\n🔍 Test pattern "Taux d'occupation":`);
if (occupationMatch) {
  console.log(`   ✅ Match trouvé: ${occupationMatch[1]}%`);
} else {
  console.log('   ❌ Aucun match');
}
