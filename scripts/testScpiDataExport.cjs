// Simuler le chargement de scpiData.ts
const fs = require('fs');
const path = require('path');

// Lire scpi_complet.json
const scpiComplet = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Simuler mergeScpiEntries
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

const mergedData = mergeScpiEntries(scpiComplet);

// Simuler la transformation en Scpi (simplifiée)
const scpiData = mergedData.map((scpi, index) => {
  return {
    id: index + 1,
    name: scpi['Nom SCPI'],
    yield: scpi['Taux de distribution (%)'] || 0,
    price: scpi['Prix de souscription (€)'] || 0,
    // ... autres champs
  };
});

const parefInScpiData = scpiData.find(s => s.name === 'Paref Evo');

console.log('🔍 Test export scpiData\n');
console.log(`✅ Paref Evo dans scpiData: ${parefInScpiData ? 'TROUVÉ' : 'NON TROUVÉ'}`);
if (parefInScpiData) {
  console.log(`   - ID: ${parefInScpiData.id}`);
  console.log(`   - Nom: ${parefInScpiData.name}`);
  console.log(`   - Yield: ${parefInScpiData.yield}%`);
  console.log(`   - Price: ${parefInScpiData.price}€`);
}

console.log(`\n📊 Total SCPI dans scpiData: ${scpiData.length}`);
console.log(`📝 Tous les noms Paref: ${scpiData.filter(s => s.name.toLowerCase().includes('paref')).map(s => s.name).join(', ')}`);
