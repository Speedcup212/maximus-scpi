const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInEntries = data.filter(s => s['Nom SCPI'] === 'Log In');

console.log('✅ Vérification du nombre d\'immeubles LOG-IN:\n');

logInEntries.forEach((entry, idx) => {
  const periode = entry['Période bulletin trimestriel'] || 'principale';
  
  // Trouver la clé exacte
  const nbImmeublesKey = Object.keys(entry).find(k => 
    k.includes('immeubles') || k.includes('Immeubles')
  );
  
  if (nbImmeublesKey) {
    const nb = entry[nbImmeublesKey];
    const ok = nb === 16;
    console.log(`  ${ok ? '✅' : '❌'} Entrée ${idx + 1} (${periode}): ${nb} immeubles ${ok ? '(correct)' : '(à corriger)'}`);
  } else {
    console.log(`  ❌ Entrée ${idx + 1} (${periode}): champ non trouvé`);
  }
});
