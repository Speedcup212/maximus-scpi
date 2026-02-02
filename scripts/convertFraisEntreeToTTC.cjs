const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Taux de TVA standard en France : 20%
const TVA_RATE = 1.20;

let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Frais de souscription (HT/%)'] !== undefined) {
    const fraisHT = entry['Frais de souscription (HT/%)'];
    
    // Convertir HT en TTC : TTC = HT × 1.20
    // Si frais = 0, on garde 0
    const fraisTTC = fraisHT === 0 ? 0 : parseFloat((fraisHT * TVA_RATE).toFixed(2));
    
    // Supprimer l'ancien champ HT
    delete entry['Frais de souscription (HT/%)'];
    
    // Ajouter le nouveau champ TTC
    entry['Frais de souscription (TTC/%)'] = fraisTTC;
    
    updatedCount++;
    
    if (index < 5) {
      console.log(`  ${entry['Nom SCPI']}: ${fraisHT}% HT → ${fraisTTC}% TTC`);
    }
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour (HT → TTC)`);
console.log(`   Conversion: TTC = HT × ${TVA_RATE} (TVA 20%)`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
