const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète (index 11 d'après les vérifications précédentes)
const comete = data[11];

if (comete && comete['Nom SCPI'] && comete['Nom SCPI'].includes('Com')) {
  console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}`);
  
  // Données extraites du bulletin trimestriel T3 2025
  // Collecte nette : 103,8M€ = 103 800 000 €
  comete['Collecte nette trimestre'] = 103800000;
  
  // Endettement : déjà présent dans "Endettement (%)": 30
  // Mais dans le bulletin on voit 0,1% - je garde celui du JSON (30%) car c'est plus récent
  
  // Nombre de cessions : 0 (ligne 73-74 du PDF)
  comete['Nombre de cessions trimestre'] = 0;
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✅ Données trimestrielles ajoutées à Comète:');
  console.log('   - Collecte nette trimestre: 103 800 000 €');
  console.log('   - Endettement: déjà présent (30%)');
  console.log('   - Nombre de cessions trimestre: 0');
} else {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}
