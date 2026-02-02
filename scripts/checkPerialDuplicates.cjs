const fs = require('fs');
const path = require('path');

const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Trouver toutes les entrées pour Perial Opportunités Europe
const perialEntries = scpiCompletJson.filter(s => s['Nom SCPI'] === 'Perial Opportunités Europe');

console.log(`📊 Nombre d'entrées pour "Perial Opportunités Europe": ${perialEntries.length}\n`);

if (perialEntries.length > 1) {
  console.log('⚠️  PROBLÈME: Il y a plusieurs entrées !\n');
  perialEntries.forEach((entry, i) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Entrée ${i + 1}:`);
    console.log(`   Prix de souscription: ${entry['Prix de souscription (€)']}€`);
    console.log(`   Valeur de retrait: ${entry['Valeur de retrait (€)']}€`);
    console.log(`   Valeur de réalisation: ${entry['Valeur de réalisation (€)']}€`);
    console.log(`   Période bulletin: ${entry['Période bulletin trimestriel'] || 'N/A'}`);
    console.log(`   Versement des loyers: ${entry['Versement des loyers'] || 'N/A'}`);
  });
  console.log(`\n${'='.repeat(80)}`);
  console.log('\n⚠️  La fonction mergeScpiEntries va utiliser la PREMIÈRE entrée trouvée pour le prix.');
  console.log('    Si la première entrée a encore 880€, c\'est pour ça que vous voyez l\'ancien prix !');
} else if (perialEntries.length === 1) {
  console.log('✅ Une seule entrée trouvée\n');
  const entry = perialEntries[0];
  console.log(`Prix de souscription: ${entry['Prix de souscription (€)']}€`);
  console.log(`Valeur de retrait: ${entry['Valeur de retrait (€)']}€`);
  console.log(`Valeur de réalisation: ${entry['Valeur de réalisation (€)']}€`);
  console.log(`Versement des loyers: ${entry['Versement des loyers']}`);
  
  if (entry['Prix de souscription (€)'] === 44) {
    console.log('\n✅ Les données sont correctes dans le JSON');
    console.log('   Le problème vient probablement du cache du navigateur.');
  } else {
    console.log(`\n❌ PROBLÈME: Le prix est encore à ${entry['Prix de souscription (€)']}€ au lieu de 44€`);
  }
} else {
  console.log('❌ Aucune entrée trouvée pour "Perial Opportunités Europe"');
}
