const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoEntries = data.filter(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('Nombre d\'entrées Iroko Zen:', irokoEntries.length);

irokoEntries.forEach((iroko, idx) => {
  const periode = iroko['Période bulletin trimestriel'] || 'principale';
  console.log(`\n=== Entrée ${idx + 1} (${periode}) ===`);
  
  // Trouver la clé exacte pour "Nombre d'immeubles"
  const nombreImmeublesKey = Object.keys(iroko).find(k => k.includes('immeubles') || k.includes('Immeubles'));
  const nombreImmeubles = nombreImmeublesKey ? iroko[nombreImmeublesKey] : null;
  
  console.log('Avant:');
  console.log('  Minimum de souscription:', iroko['Minimum de souscription €']);
  console.log('  Prix de souscription:', iroko['Prix de souscription (€)']);
  console.log('  Nombre d\'immeubles:', nombreImmeubles);
  
  // Mettre à jour
  iroko['Minimum de souscription €'] = 204;
  if (nombreImmeublesKey) {
    iroko[nombreImmeublesKey] = 164;
  }
  
  console.log('Après:');
  console.log('  Minimum de souscription:', iroko['Minimum de souscription €']);
  console.log('  Prix de souscription:', iroko['Prix de souscription (€)']);
  const nombreImmeublesApres = nombreImmeublesKey ? iroko[nombreImmeublesKey] : null;
  console.log('  Nombre d\'immeubles:', nombreImmeublesApres);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
