const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const novaxia = data.find(s => s['Nom SCPI'] === 'Novaxia NEO' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!novaxia) {
  console.error('Novaxia NEO T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Répartition géographique:');
const geo = novaxia['Répartition Géographique JSON'];
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const total = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`\nTotal: ${total.toFixed(1)}%`);

if (Math.abs(total - 100) > 0.1) {
  console.warn(`\n⚠️ ATTENTION: Le total fait ${total}% au lieu de 100%`);
  console.warn('   Vérifiez les pourcentages fournis.');
}

console.log('\n✅ Format texte:', novaxia['Répartition Géographique']);
