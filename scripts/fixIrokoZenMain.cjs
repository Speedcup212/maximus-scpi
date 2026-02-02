const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée Iroko Zen avec T3 2025
const irokoT3Index = data.findIndex(s => s['Nom SCPI'] === 'Iroko Zen' && s['Période bulletin trimestriel'] === 'T3 2025');
const irokoMainIndex = data.findIndex(s => s['Nom SCPI'] === 'Iroko Zen' && !s['Période bulletin trimestriel']);

console.log('Index entrée principale:', irokoMainIndex);
console.log('Index entrée T3 2025:', irokoT3Index);

if (irokoT3Index === -1) {
  console.error('❌ Entrée T3 2025 non trouvée');
  process.exit(1);
}

if (irokoMainIndex === -1) {
  console.log('✅ Création de l\'entrée principale...');
  
  // Créer l'entrée principale à partir de l'entrée T3 2025
  const irokoT3 = data[irokoT3Index];
  const irokoMain = {
    ...irokoT3,
    "Surcote/décote (%)": 0,
    "Taux de distribution (%)": 6.01,
    "Distribution (€/part)": 14.58,
    "Nombre d'immeubles": 164
  };
  
  // Supprimer les champs spécifiques au bulletin trimestriel
  delete irokoMain['Période bulletin trimestriel'];
  delete irokoMain['Collecte nette trimestre'];
  delete irokoMain['Nombre de cessions trimestre'];
  delete irokoMain['Nombre de locataires'];
  delete irokoMain['WALT'];
  delete irokoMain['WALB'];
  delete irokoMain['Actualités trimestrielles'];
  
  // Insérer l'entrée principale juste avant l'entrée T3 2025
  data.splice(irokoT3Index, 0, irokoMain);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Entrée principale créée');
} else {
  console.log('✅ Entrée principale existe déjà');
  // Mettre à jour le nombre d'immeubles dans l'entrée principale
  if (data[irokoMainIndex]['Nombre d\'immeubles'] !== 164) {
    data[irokoMainIndex]['Nombre d\'immeubles'] = 164;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Nombre d\'immeubles mis à jour dans l\'entrée principale');
  }
}

// Vérification finale
const finalMain = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && !s['Période bulletin trimestriel']);
const finalT3 = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && s['Période bulletin trimestriel'] === 'T3 2025');

console.log('\n✅ Vérification finale:');
console.log('  Entrée principale:', finalMain ? 'Trouvée' : 'Manquante');
console.log('  Entrée T3 2025:', finalT3 ? 'Trouvée' : 'Manquante');
if (finalMain) {
  console.log('  Capitalisation principale:', finalMain['Capitalisation (M€)'], 'M€');
  console.log('  Nombre d\'immeubles principale:', finalMain['Nombre d\'immeubles']);
}
if (finalT3) {
  console.log('  Capitalisation T3:', finalT3['Capitalisation (M€)'], 'M€');
  console.log('  Nombre d\'immeubles T3:', finalT3['Nombre d\'immeubles']);
}
