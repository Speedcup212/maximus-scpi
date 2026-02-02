const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInT3 = data.find(s => s['Nom SCPI'] === 'Log In' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!logInT3) {
  console.error('❌ Entrée T3 2025 non trouvée');
  process.exit(1);
}

// Compter les occurrences de "Nombre d'immeubles"
const keys = Object.keys(logInT3);
const nbImmeublesKeys = keys.filter(k => k.includes('immeubles') || k.includes('Immeubles'));

console.log('Clés contenant "immeubles":', nbImmeublesKeys);

if (nbImmeublesKeys.length > 1) {
  console.log('⚠️  Plusieurs clés trouvées, nettoyage...');
  // Garder seulement la dernière valeur (la plus récente)
  const values = nbImmeublesKeys.map(k => ({ key: k, value: logInT3[k] }));
  console.log('Valeurs:', values);
  
  // Supprimer toutes sauf la dernière
  nbImmeublesKeys.slice(0, -1).forEach(k => {
    delete logInT3[k];
    console.log(`  Supprimé: ${k}`);
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Doublons supprimés');
} else {
  console.log('✅ Aucun doublon détecté');
}
