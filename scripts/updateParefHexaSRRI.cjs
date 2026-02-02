const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Paref Hexa
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Paref Hexa' && entry['Profil_de_risque'] && entry['Profil_de_risque']['SRRI'] === 3) {
    console.log(`📊 Mise à jour du SRRI de l'entrée ${index + 1} pour Paref Hexa : 3 → 2`);
    entry['Profil_de_risque']['SRRI'] = 2;
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Paref Hexa (SRRI: 3 → 2)`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
