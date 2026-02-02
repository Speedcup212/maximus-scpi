const fs = require('fs');
const path = require('path');

const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

function mergeScpiEntries(entries) {
  const merged = {};
  entries.forEach((entry) => {
    const nom = entry['Nom SCPI'];
    if (!nom) return;
    if (!merged[nom]) {
      merged[nom] = { ...entry };
    } else {
      const existing = merged[nom];
      if (entry['Période bulletin trimestriel'] && !existing['Période bulletin trimestriel']) {
        if (entry['Actualités trimestrielles']) {
          existing['Actualités trimestrielles'] = entry['Actualités trimestrielles'];
        }
        if (entry['Période bulletin trimestriel']) {
          existing['Période bulletin trimestriel'] = entry['Période bulletin trimestriel'];
        }
      }
    }
  });
  return Object.values(merged);
}

const merged = mergeScpiEntries(scpiCompletJson);
const perial = merged.find(s => s['Nom SCPI'] === 'Perial Opportunités Europe');

if (!perial) {
  console.log('❌ Perial Opportunités Europe non trouvée');
  process.exit(1);
}

console.log('✅ Données Perial Opportunités Europe dans le JSON:\n');
console.log('='.repeat(80));
console.log(`Prix de souscription (€): ${perial['Prix de souscription (€)']}€`);
console.log(`Valeur de retrait (€): ${perial['Valeur de retrait (€)']}€`);
console.log(`Valeur de réalisation (€): ${perial['Valeur de réalisation (€)']}€`);
console.log(`Versement des loyers: ${perial['Versement des loyers']}`);
console.log('='.repeat(80));

// Vérifier que les valeurs sont correctes
if (perial['Prix de souscription (€)'] === 44) {
  console.log('\n✅ Prix de souscription correctement mis à jour à 44€');
} else {
  console.log(`\n❌ Prix de souscription incorrect: ${perial['Prix de souscription (€)']}€ (attendu: 44€)`);
}

if (perial['Valeur de retrait (€)'] === '39.60' || perial['Valeur de retrait (€)'] === 39.60) {
  console.log('✅ Valeur de retrait correctement mise à jour à 39.60€');
} else {
  console.log(`❌ Valeur de retrait incorrecte: ${perial['Valeur de retrait (€)']}€ (attendu: 39.60€)`);
}

if (perial['Valeur de réalisation (€)'] === 34.18) {
  console.log('✅ Valeur de réalisation correctement mise à jour à 34.18€');
} else {
  console.log(`❌ Valeur de réalisation incorrecte: ${perial['Valeur de réalisation (€)']}€ (attendu: 34.18€)`);
}

if (perial['Versement des loyers'] === 'Mensuel') {
  console.log('✅ Versement des loyers correctement mis à jour à "Mensuel"');
} else {
  console.log(`❌ Versement des loyers incorrect: "${perial['Versement des loyers']}" (attendu: "Mensuel")`);
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 Si les changements n\'apparaissent pas dans l\'interface:');
console.log('   1. Redémarrez le serveur de développement (Ctrl+C puis npm run dev)');
console.log('   2. Videz le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
console.log('   3. Vérifiez que vous regardez la bonne SCPI (Perial Opportunités Europe)');
