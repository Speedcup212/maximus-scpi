const fs = require('fs');
const path = require('path');

// Simuler le chargement comme dans scpiData.ts
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Fonction de fusion (copie de scpiData.ts)
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

// Simuler la transformation comme dans scpiData.ts
const price = perial['Prix de souscription (€)'] || 0;
const valeurRetrait = perial['Valeur de retrait (€)'];
const valeurRealisation = perial['Valeur de réalisation (€)'];
const versementLoyers = perial['Versement des loyers'];

console.log('✅ Test de chargement des données (comme dans scpiData.ts):\n');
console.log('='.repeat(80));
console.log(`Prix de souscription (price): ${price}€`);
console.log(`Valeur de retrait: ${valeurRetrait}€`);
console.log(`Valeur de réalisation: ${valeurRealisation}€`);
console.log(`Versement des loyers: ${versementLoyers}`);
console.log('='.repeat(80));

if (price === 44) {
  console.log('\n✅ Le prix sera correctement chargé à 44€ dans l\'interface');
} else {
  console.log(`\n❌ PROBLÈME: Le prix sera chargé à ${price}€ au lieu de 44€`);
}

console.log('\n' + '='.repeat(80));
console.log('\n⚠️  IMPORTANT: Pour voir les changements dans l\'interface:');
console.log('   1. ARRÊTEZ le serveur de développement (Ctrl+C dans le terminal)');
console.log('   2. REDÉMARREZ le serveur (npm run dev)');
console.log('   3. VIDEZ le cache du navigateur (Ctrl+Shift+R ou Ctrl+F5)');
console.log('   4. Rechargez la page complètement');
