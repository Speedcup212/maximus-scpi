const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Novaxia NEO
const novaxiaEntries = data.filter(s => s['Nom SCPI'] === 'Novaxia NEO');

console.log('Nombre d\'entrées trouvées:', novaxiaEntries.length);

novaxiaEntries.forEach((novaxia, index) => {
  console.log(`\nEntrée ${index + 1}:`);
  
  // Lister toutes les clés contenant "immeuble"
  const immeubleKeys = Object.keys(novaxia).filter(k => k.toLowerCase().includes('immeuble'));
  console.log('  Clés contenant "immeuble":', immeubleKeys);
  
  // Mettre à jour toutes les occurrences
  immeubleKeys.forEach(key => {
    console.log(`    ${key}: ${novaxia[key]} -> 39`);
    novaxia[key] = 39;
  });
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
