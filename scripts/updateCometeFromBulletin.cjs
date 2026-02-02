const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète (index 11)
const comete = data[11];

if (comete && comete['Nom SCPI'] && comete['Nom SCPI'].includes('Com')) {
  console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}`);
  
  // Données extraites du bulletin trimestriel T3 2025
  // Endettement : 0,1% (ligne 25-26 du PDF)
  const ancienEndettement = comete['Endettement (%)'];
  comete['Endettement (%)'] = 0.1;
  
  // Collecte nette : 103,8M€ = 103 800 000 €
  comete['Collecte nette trimestre'] = 103800000;
  
  // Nombre de cessions : 0
  comete['Nombre de cessions trimestre'] = 0;
  
  // Nombre de locataires : 67
  comete['Nombre de locataires'] = 67;
  
  // WALT : 10,4 ans
  comete['WALT'] = 10.4;
  
  // WALB : 8,4 ans
  comete['WALB'] = 8.4;
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✅ Données mises à jour depuis le bulletin T3 2025:');
  console.log(`   - Endettement: ${ancienEndettement}% → 0.1%`);
  console.log('   - Collecte nette trimestre: 103 800 000 €');
  console.log('   - Nombre de cessions trimestre: 0');
  console.log('   - Nombre de locataires: 67');
  console.log('   - WALT: 10.4 ans');
  console.log('   - WALB: 8.4 ans');
} else {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}
