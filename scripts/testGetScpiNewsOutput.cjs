const fs = require('fs');
const path = require('path');

// Simuler getScpiNews avec les données réelles
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
const cometeRaw = merged.find(s => s['Nom SCPI'] === 'Comète');

if (!cometeRaw) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

const scpi = {
  name: cometeRaw['Nom SCPI'],
  actualitesTrimestrielles: cometeRaw['Actualités trimestrielles'] || undefined
};

console.log('✅ Test de la sortie de getScpiNews\n');
console.log('='.repeat(80));

if (!scpi.actualitesTrimestrielles) {
  console.log('❌ Pas d\'actualités - getScpiNews retournera ""');
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

if (filteredActualites.length === 0) {
  console.log('❌ Toutes les actualités filtrées - getScpiNews retournera ""');
  process.exit(1);
}

const fullText = filteredActualites.join(' | ');
const structuredFacts = [];
let maxPoints = 50;
const acquisitionsSeen = new Set();

// Extraire les acquisitions (simplifié)
const acqDetailMatch = fullText.match(/(\d+)\s+acquisition.*?finalisée.*?(\d+[.,]\d+)\s*M€.*?:\s*([^|]+)/i);
if (acqDetailMatch) {
  // Format avec détails
  const detailsStr = acqDetailMatch[3];
  const acquisitions = detailsStr.split(/\s+et\s+|\s*,\s*/).filter(acq => acq.trim().length > 0);
  acquisitions.forEach(acq => {
    const villeMatch = acq.match(/([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)/);
    if (villeMatch) {
      const key = `${villeMatch[1].toLowerCase()}_${villeMatch[2].toLowerCase()}`;
      if (!acquisitionsSeen.has(key)) {
        acquisitionsSeen.add(key);
        structuredFacts.push(`Acquisition à ${villeMatch[1]} (${villeMatch[2]})`);
      }
    }
  });
}

// Chercher les acquisitions avec le format "Acquisition à Ville (Pays, ...)"
const acqMatches = Array.from(fullText.matchAll(/acquisition\s+à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)[^)]*\)/gi));
acqMatches.forEach(match => {
  const key = `${match[1].toLowerCase()}_${match[2].toLowerCase()}`;
  if (!acquisitionsSeen.has(key)) {
    acquisitionsSeen.add(key);
    // Extraire la description complète
    const fullMatch = fullText.match(new RegExp(`Acquisition à ${match[1]}\\s*\\([^)]+\\)[^|]*`, 'i'));
    if (fullMatch) {
      structuredFacts.push(fullMatch[0].trim());
    }
  }
});

// Chercher les cessions
if (fullText.match(/aucune\s+cession|n'a pas cédé/i)) {
  structuredFacts.push('Aucune cession d\'actif n\'a été réalisée au cours du trimestre');
}

// Collecte
const collecteMatch = fullText.match(/collecte\s+nette.*?(\d+[.,]\d+)\s*M€/i);
if (collecteMatch) {
  structuredFacts.push(`Collecte nette de ${collecteMatch[1].replace(',', '.')}M€`);
}

// Déduplication finale
const uniqueFacts = [];
const seenFacts = new Set();
for (const fact of structuredFacts) {
  const normalized = fact.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!seenFacts.has(normalized)) {
    seenFacts.add(normalized);
    uniqueFacts.push(fact);
  }
}

const result = uniqueFacts.length > 0 
  ? uniqueFacts.map(fact => `• ${fact}`).join('<br>')
  : '';

console.log(`Résultat de getScpiNews: ${result.length > 0 ? '✅ CONTENU' : '❌ VIDE'}\n`);

if (result.length > 0) {
  console.log('Contenu généré:');
  console.log('='.repeat(80));
  console.log(result.replace(/<br>/g, '\n'));
  console.log('='.repeat(80));
  console.log(`\n✅ ${uniqueFacts.length} points extraits`);
} else {
  console.log('❌ getScpiNews retourne une chaîne vide');
  console.log('Raisons possibles:');
  console.log('  - Aucune acquisition/cession trouvée');
  console.log('  - Patterns regex ne matchent pas');
}
