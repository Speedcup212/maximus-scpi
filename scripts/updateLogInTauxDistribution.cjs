const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInEntries = data.filter(s => s['Nom SCPI'] === 'Log In');

console.log(`✅ Nombre d'entrées LOG-IN: ${logInEntries.length}\n`);

let updated = false;

logInEntries.forEach((entry, idx) => {
  const periode = entry['Période bulletin trimestriel'] || 'principale';
  const ancienTaux = entry['Taux de distribution (%)'];
  
  if (ancienTaux !== 6.30) {
    entry['Taux de distribution (%)'] = 6.30;
    console.log(`✅ Entrée ${idx + 1} (${periode}): ${ancienTaux}% → 6.30%`);
    updated = true;
  } else {
    console.log(`✓ Entrée ${idx + 1} (${periode}): déjà à 6.30%`);
  }
});

if (updated) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('\n✅ Fichier scpi_complet.json mis à jour');
} else {
  console.log('\n✓ Toutes les entrées sont déjà à jour');
}
