const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète
const comete = data.find(s => {
  const nom = s['Nom SCPI'];
  return nom && (nom === 'Comète' || nom.toLowerCase().includes('comete') || nom.includes('Com'));
});

if (comete) {
  console.log('✅ Comète trouvée:', comete['Nom SCPI']);
  console.log('   Nombre de locataires:', comete['Nombre de locataires']);
  console.log('   WALT:', comete['WALT']);
  console.log('   WALB:', comete['WALB']);
  
  // Vérifier si les données sont bien présentes
  if (comete['Nombre de locataires'] === 67 && comete['WALT'] === 10.4 && comete['WALB'] === 8.4) {
    console.log('\n✅ Toutes les données sont présentes et correctes!');
  } else {
    console.log('\n⚠️  Les données ne sont pas correctes, correction en cours...');
    comete['Nombre de locataires'] = 67;
    comete['WALT'] = 10.4;
    comete['WALB'] = 8.4;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('✅ Données corrigées!');
  }
} else {
  console.log('❌ Comète non trouvée');
  console.log('Premières SCPI:', data.slice(0, 5).map(s => s['Nom SCPI']));
}
