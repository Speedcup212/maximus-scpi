const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInEntries = data.filter(s => s['Nom SCPI'] === 'Log In');

console.log(`✅ Nombre d'entrées LOG-IN: ${logInEntries.length}\n`);

let updated = false;

logInEntries.forEach((entry, idx) => {
  const periode = entry['Période bulletin trimestriel'] || 'principale';
  
  // Trouver la clé exacte pour "Nombre d'immeubles" (peut varier avec l'apostrophe)
  const nbImmeublesKey = Object.keys(entry).find(k => 
    k.includes('immeubles') || k.includes('Immeubles')
  );
  
  if (nbImmeublesKey) {
    const ancienNb = entry[nbImmeublesKey];
    if (ancienNb !== 16) {
      entry[nbImmeublesKey] = 16;
      console.log(`✅ Entrée ${idx + 1} (${periode}): ${ancienNb} → 16 immeubles`);
      updated = true;
    } else {
      console.log(`✓ Entrée ${idx + 1} (${periode}): déjà à 16 immeubles`);
    }
  } else {
    // Ajouter le champ s'il n'existe pas
    entry['Nombre d\'immeubles'] = 16;
    console.log(`✅ Entrée ${idx + 1} (${periode}): champ ajouté avec 16 immeubles`);
    updated = true;
  }
});

if (updated) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('\n✅ Fichier scpi_complet.json mis à jour');
} else {
  console.log('\n✓ Toutes les entrées sont déjà à 16 immeubles');
}
