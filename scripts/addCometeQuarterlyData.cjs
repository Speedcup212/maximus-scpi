const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète (chercher par index ou nom)
const cometeIndex = data.findIndex(s => {
  const nom = s['Nom SCPI'];
  return nom && (nom === 'Comète' || nom.toLowerCase().includes('comete'));
});

if (cometeIndex >= 0) {
  console.log(`✅ Trouvé Comète à l'index ${cometeIndex}:`, data[cometeIndex]['Nom SCPI']);
  
  // Ajouter les données extraites du bulletin trimestriel T3 2025
  data[cometeIndex]['Nombre de locataires'] = 67;
  data[cometeIndex]['WALT'] = 10.4;
  data[cometeIndex]['WALB'] = 8.4;
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✅ Données ajoutées à Comète:');
  console.log('   - Nombre de locataires: 67');
  console.log('   - WALT: 10.4 ans');
  console.log('   - WALB: 8.4 ans');
} else {
  console.log('❌ Comète non trouvée dans le fichier');
  process.exit(1);
}
