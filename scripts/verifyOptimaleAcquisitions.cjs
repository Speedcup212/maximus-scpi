const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const optimale = data.find(s => 
  s['Nom SCPI'] === 'Optimale' && 
  s['Période bulletin trimestriel'] === 'T3 2025'
);

if (!optimale) {
  console.log('❌ Optimale T3 2025 non trouvée');
  process.exit(1);
}

const actualites = optimale['Actualités trimestrielles'] || '';
const items = actualites.split(' | ');

console.log('✅ Vérification des acquisitions Optimale\n');
console.log('='.repeat(80));

const acquisitions = items.filter(i => i.toLowerCase().includes('acquisition à'));

console.log(`Nombre d'acquisitions trouvées: ${acquisitions.length}\n`);

acquisitions.forEach((acq, i) => {
  console.log(`${i + 1}. ${acq}`);
  console.log(`   Longueur: ${acq.split(/\s+/).length} mots\n`);
});

// Vérifier Sainte-Hélène-du-Lac spécifiquement
const sainteHelene = acquisitions.find(a => a.includes('Sainte-Hélène-du-Lac'));
if (sainteHelene) {
  console.log('✅ Acquisition à Sainte-Hélène-du-Lac trouvée:');
  console.log(`   ${sainteHelene}\n`);
  
  // Vérifier les éléments requis
  const hasSurface = sainteHelene.includes('660 m²');
  const hasMontant = sainteHelene.includes('1,09M€') || sainteHelene.includes('1.09M€');
  const hasLocataires = sainteHelene.includes('Axians') && sainteHelene.includes('Pyrite');
  const hasType = sainteHelene.includes('(activités)');
  
  console.log(`   Surface: ${hasSurface ? '✅' : '❌'}`);
  console.log(`   Montant: ${hasMontant ? '✅' : '❌'}`);
  console.log(`   Locataires: ${hasLocataires ? '✅' : '❌'}`);
  console.log(`   Type: ${hasType ? '✅' : '❌'}`);
} else {
  console.log('❌ Acquisition à Sainte-Hélène-du-Lac non trouvée');
}

console.log('\n' + '='.repeat(80));
