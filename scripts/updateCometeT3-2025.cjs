/**
 * Mise à jour des données Comète depuis le bulletin T3 2025
 * Données extraites manuellement du PDF
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète (index 11)
const comete = data[11];

if (comete && comete['Nom SCPI'] && comete['Nom SCPI'].includes('Com')) {
  console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}\n`);
  
  // Données extraites du bulletin trimestriel T3 2025
  const ancienEndettement = comete['Endettement (%)'];
  
  // Mettre à jour toutes les données selon le bulletin
  comete['Endettement (%)'] = 0.1; // Ligne 25-26 du PDF
  comete['Collecte nette trimestre'] = 103800000; // 103,8M€ ligne 20-21
  comete['Nombre de cessions trimestre'] = 0; // Ligne 73-74
  comete['Nombre de locataires'] = 67; // Ligne 242-243
  comete['WALT'] = 10.4; // Ligne 230
  comete['WALB'] = 8.4; // Ligne 230
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log('✅ Données mises à jour depuis le bulletin T3 2025:');
  console.log(`   - Endettement: ${ancienEndettement}% → 0.1%`);
  console.log('   - Collecte nette trimestre: 103 800 000 € (103,8M€)');
  console.log('   - Nombre de cessions trimestre: 0');
  console.log('   - Nombre de locataires: 67');
  console.log('   - WALT: 10.4 ans');
  console.log('   - WALB: 8.4 ans');
  console.log('\n✅ Fichier JSON mis à jour!');
} else {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}
