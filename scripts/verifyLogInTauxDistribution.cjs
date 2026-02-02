const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInEntries = data.filter(s => s['Nom SCPI'] === 'Log In');

console.log('✅ Vérification du taux de distribution LOG-IN:\n');

logInEntries.forEach((entry, idx) => {
  const periode = entry['Période bulletin trimestriel'] || 'principale';
  const taux = entry['Taux de distribution (%)'];
  const ok = taux === 6.30;
  console.log(`  ${ok ? '✅' : '❌'} Entrée ${idx + 1} (${periode}): ${taux}% ${ok ? '(correct)' : '(à corriger)'}`);
});
