const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const comete = data.find(s => s['Nom SCPI'] === 'Comète');

if (!comete) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

console.log('✅ Vérification des données Comète pour l\'affichage\n');
console.log('='.repeat(80));

// Vérifier les champs nécessaires
const checks = {
  'Nom SCPI': comete['Nom SCPI'],
  'Actualités trimestrielles': comete['Actualités trimestrielles'] ? '✅ Présent' : '❌ Manquant',
  'Période bulletin trimestriel': comete['Période bulletin trimestriel'] || '❌ Manquant',
  'Nombre d\'actualités': comete['Actualités trimestrielles'] ? comete['Actualités trimestrielles'].split(' | ').length : 0
};

Object.entries(checks).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n' + '='.repeat(80));

if (comete['Actualités trimestrielles']) {
  const actualites = comete['Actualités trimestrielles'].split(' | ');
  const acquisitions = actualites.filter(a => a.toLowerCase().includes('acquisition'));
  
  console.log(`\n✅ ${acquisitions.length} acquisitions trouvées dans les actualités:`);
  acquisitions.forEach((acq, i) => {
    console.log(`   ${i + 1}. ${acq.substring(0, 70)}...`);
  });
  
  console.log('\n✅ Les données sont correctes. Si vous ne voyez pas les changements:');
  console.log('   1. Redémarrez le serveur de développement (Ctrl+C puis npm start)');
  console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
  console.log('   3. Vérifiez que vous regardez la bonne SCPI (Comète)');
} else {
  console.log('\n❌ Aucune actualité trimestrielle trouvée !');
}
