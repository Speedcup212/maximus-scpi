const fs = require('fs');
const path = require('path');

// Simuler la fonction mergeScpiEntries
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

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const merged = mergeScpiEntries(data);
const logIn = merged.find(s => s['Nom SCPI'] === 'Log In');

if (logIn) {
  const nbImmeublesKey = Object.keys(logIn).find(k => k.includes('immeubles') || k.includes('Immeubles'));
  const nbImmeubles = nbImmeublesKey ? logIn[nbImmeublesKey] : null;
  
  console.log('✅ Test de fusion LOG-IN:');
  console.log('  Nombre d\'immeubles après fusion:', nbImmeubles);
  console.log('  Correct:', nbImmeubles === 16 ? '✅ OUI' : '❌ NON');
} else {
  console.log('❌ LOG-IN non trouvé après fusion');
}
