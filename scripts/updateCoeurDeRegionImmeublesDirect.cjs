const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
let content = fs.readFileSync(filePath, 'utf8');

// Trouver l'index de "Coeur de Région"
const coeurIndex = content.indexOf('"Nom SCPI": "Coeur de Région"');
if (coeurIndex === -1) {
  console.error('Coeur de Région non trouvée');
  process.exit(1);
}

// Trouver "Nombre d'immeubles": 80 dans cette section
const sectionStart = coeurIndex;
const sectionEnd = content.indexOf('},', sectionStart + 400); // Chercher dans les 400 caractères suivants

const section = content.substring(sectionStart, sectionEnd);
const oldPattern = /"Nombre d'immeubles":\s*80,/g;
const newPattern = '"Nombre d\'immeubles": 82,';

if (oldPattern.test(section)) {
  content = content.replace(oldPattern, newPattern);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Nombre d\'immeubles mis à jour de 80 à 82');
} else {
  console.log('⚠️  Pattern "Nombre d\'immeubles": 80 non trouvé');
  // Vérifier s'il est déjà à 82
  if (section.includes('"Nombre d\'immeubles": 82')) {
    console.log('✅ Déjà à 82');
  } else {
    console.log('Section trouvée:', section.substring(0, 200));
  }
}
