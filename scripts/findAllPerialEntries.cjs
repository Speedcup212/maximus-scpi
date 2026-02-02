const fs = require('fs');
const path = require('path');

const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Trouver TOUTES les entrées pour Perial Opportunités Europe
const perialEntries = scpiCompletJson
  .map((entry, index) => ({ entry, index }))
  .filter(({ entry }) => entry['Nom SCPI'] === 'Perial Opportunités Europe');

console.log(`📊 Nombre total d'entrées pour "Perial Opportunités Europe": ${perialEntries.length}\n`);

if (perialEntries.length === 0) {
  console.log('❌ Aucune entrée trouvée');
  process.exit(1);
}

perialEntries.forEach(({ entry, index }, i) => {
  console.log(`${'='.repeat(80)}`);
  console.log(`ENTRÉE ${i + 1} (Index dans le JSON: ${index}):`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Prix de souscription: ${entry['Prix de souscription (€)']}€`);
  console.log(`Valeur de retrait: ${entry['Valeur de retrait (€)']}€`);
  console.log(`Valeur de réalisation: ${entry['Valeur de réalisation (€)']}€`);
  console.log(`Valeur de reconstitution: ${entry['Valeur de reconstitution (€)'] || 'null'}€`);
  console.log(`Capitalisation: ${entry['Capitalisation (M€)']} M€`);
  console.log(`Minimum de souscription: ${entry['Minimum de souscription €']}€`);
  console.log(`Période bulletin: ${entry['Période bulletin trimestriel'] || 'N/A'}`);
  console.log(`Versement des loyers: ${entry['Versement des loyers'] || 'N/A'}`);
  console.log(`\nPremière ligne de l'entrée: ${JSON.stringify(entry).substring(0, 100)}...`);
  console.log('');
});

if (perialEntries.length > 1) {
  console.log(`\n⚠️  PROBLÈME: Il y a ${perialEntries.length} entrées !`);
  console.log('   La fonction mergeScpiEntries va fusionner ces entrées.');
  console.log('   La PREMIÈRE entrée trouvée sera utilisée pour les prix de base.');
  console.log('   Si la première entrée a encore les anciennes valeurs, c\'est pour ça que vous voyez les anciens prix !\n');
  
  // Vérifier quelle entrée a les bonnes valeurs
  const bonneEntree = perialEntries.find(({ entry }) => 
    entry['Prix de souscription (€)'] === 44 &&
    entry['Valeur de retrait (€)'] === '39.82'
  );
  
  if (bonneEntree) {
    console.log(`✅ L'entrée ${perialEntries.indexOf(bonneEntree) + 1} a les BONNES valeurs (44€, 39.82€)`);
  } else {
    console.log(`❌ Aucune entrée n'a les bonnes valeurs !`);
  }
  
  const mauvaiseEntree = perialEntries.find(({ entry }) => 
    entry['Prix de souscription (€)'] === 880 ||
    entry['Prix de souscription (€)'] !== 44
  );
  
  if (mauvaiseEntree) {
    console.log(`❌ L'entrée ${perialEntries.indexOf(mauvaiseEntree) + 1} a les MAUVAISES valeurs (${mauvaiseEntree.entry['Prix de souscription (€)']}€)`);
    console.log(`   Cette entrée doit être supprimée ou mise à jour !`);
  }
} else {
  console.log('✅ Une seule entrée trouvée');
  const entry = perialEntries[0].entry;
  if (entry['Prix de souscription (€)'] === 44) {
    console.log('✅ Les valeurs sont correctes dans cette entrée unique');
  } else {
    console.log(`❌ PROBLÈME: Le prix est à ${entry['Prix de souscription (€)']}€ au lieu de 44€`);
  }
}
