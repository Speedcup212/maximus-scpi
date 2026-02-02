const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoEntries = data.filter(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('Nombre d\'entrées Iroko Zen:', irokoEntries.length);

irokoEntries.forEach((iroko, idx) => {
  const periode = iroko['Période bulletin trimestriel'] || 'principale';
  console.log(`\n=== Entrée ${idx + 1} (${periode}) ===`);
  
  // Vérifier les données actuelles
  console.log('Données actuelles:');
  console.log('  Nombre de locataires:', iroko['Nombre de locataires']);
  console.log('  Nombre d\'immeubles:', iroko['Nombre d\'immeubles'] || iroko['Nombre d\'immeubles']);
  console.log('  WALT:', iroko['WALT']);
  console.log('  WALB:', iroko['WALB']);
  console.log('  TOF:', iroko['TOF (%)']);
  console.log('  Endettement:', iroko['Endettement (%)']);
  
  // Mettre à jour pour l'entrée T3 2025
  if (iroko['Période bulletin trimestriel'] === 'T3 2025') {
    // Vérifier que toutes les données sont correctes
    if (iroko['Nombre de locataires'] !== 378) {
      iroko['Nombre de locataires'] = 378;
      console.log('  ✅ Nombre de locataires mis à jour à 378');
    }
    if (iroko['WALT'] !== 9.1) {
      iroko['WALT'] = 9.1;
      console.log('  ✅ WALT mis à jour à 9.1');
    }
    if (iroko['WALB'] !== 7.6) {
      iroko['WALB'] = 7.6;
      console.log('  ✅ WALB mis à jour à 7.6');
    }
    if (iroko['TOF (%)'] !== 98.1) {
      iroko['TOF (%)'] = 98.1;
      console.log('  ✅ TOF mis à jour à 98.1');
    }
    if (iroko['Endettement (%)'] !== 30.1) {
      iroko['Endettement (%)'] = 30.1;
      console.log('  ✅ Endettement mis à jour à 30.1');
    }
    
    // Ajouter TOP si le champ existe ou créer un nouveau champ
    if (!iroko['TOP (%)']) {
      iroko['TOP (%)'] = 97.6;
      console.log('  ✅ TOP ajouté à 97.6%');
    } else if (iroko['TOP (%)'] !== 97.6) {
      iroko['TOP (%)'] = 97.6;
      console.log('  ✅ TOP mis à jour à 97.6%');
    }
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
