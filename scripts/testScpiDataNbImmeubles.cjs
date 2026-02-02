// Simuler le chargement de scpiData.ts
// Note: Ce script simule la logique de fusion et de transformation

const fs = require('fs');
const path = require('path');

// Simuler mergeScpiEntries
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
        // Mettre à jour le nombre d'immeubles si présent dans l'entrée trimestrielle
        const nbImmeublesKey = Object.keys(entry).find(k => k.includes('immeubles') || k.includes('Immeubles'));
        if (nbImmeublesKey && entry[nbImmeublesKey] !== undefined) {
          const existingKey = Object.keys(existing).find(k => k.includes('immeubles') || k.includes('Immeubles'));
          if (existingKey) {
            existing[existingKey] = entry[nbImmeublesKey];
          } else {
            existing[nbImmeublesKey] = entry[nbImmeublesKey];
          }
        }
      } else if (!entry['Période bulletin trimestriel'] && existing['Période bulletin trimestriel']) {
        // Conserver le nombre d'immeubles de l'entrée principale
        const entryNbImmeublesKey = Object.keys(entry).find(k => k.includes('immeubles') || k.includes('Immeubles'));
        if (entryNbImmeublesKey && entry[entryNbImmeublesKey] !== undefined) {
          const existingKey = Object.keys(existing).find(k => k.includes('immeubles') || k.includes('Immeubles'));
          if (existingKey) {
            existing[existingKey] = entry[entryNbImmeublesKey];
          } else {
            existing[entryNbImmeublesKey] = entry[entryNbImmeublesKey];
          }
        }
      }
    }
  });
  
  return Object.values(merged);
}

// Simuler cleanNumericValue
function cleanNumericValue(value) {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.toString().replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Simuler la fusion
const merged = mergeScpiEntries(data);

// Simuler la transformation comme dans scpiData.ts
const logIn = merged.find(s => s['Nom SCPI'] === 'Log In');

if (logIn) {
  // Simuler la transformation
  const nbImmeublesKey = Object.keys(logIn).find(k => k.includes('immeubles') || k.includes('Immeubles'));
  const nbImmeubles = cleanNumericValue(logIn[nbImmeublesKey]);
  
  console.log('✅ Test de chargement LOG-IN depuis scpiData.ts:');
  console.log('  Nombre d\'immeubles après fusion et transformation:', nbImmeubles);
  console.log('  Correct (16):', nbImmeubles === 16 ? '✅ OUI' : '❌ NON');
  
  // Simuler la recherche avec priorité aux actualités trimestrielles
  const allMatching = merged.filter(s => s['Nom SCPI'] === 'Log In');
  const withNews = allMatching.find(s => s['Actualités trimestrielles']);
  const selected = withNews || allMatching[0];
  
  const selectedNbImmeublesKey = Object.keys(selected).find(k => k.includes('immeubles') || k.includes('Immeubles'));
  const selectedNbImmeubles = cleanNumericValue(selected[selectedNbImmeublesKey]);
  
  console.log('\n✅ Test de sélection avec priorité aux actualités:');
  console.log('  Entrée sélectionnée:', selected['Période bulletin trimestriel'] || 'principale');
  console.log('  Nombre d\'immeubles:', selectedNbImmeubles);
  console.log('  Correct (16):', selectedNbImmeubles === 16 ? '✅ OUI' : '❌ NON');
} else {
  console.log('❌ LOG-IN non trouvé');
}
