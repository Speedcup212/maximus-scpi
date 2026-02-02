const fs = require('fs');
const path = require('path');

const scpiCompletPath = path.join(__dirname, '../src/data/scpi_complet.json');
const scpiDataExtendedPath = path.join(__dirname, '../src/data/scpiDataExtended.ts');

console.log('🔍 Vérification de Paref Evo...\n');

// Vérifier dans scpi_complet.json
const scpiComplet = JSON.parse(fs.readFileSync(scpiCompletPath, 'utf8'));
const parefEntries = scpiComplet.filter(s => s['Nom SCPI'] === 'Paref Evo');
console.log(`📊 Entrées dans scpi_complet.json: ${parefEntries.length}`);

// Simuler la fusion
const merged = {};
scpiComplet.forEach(e => {
  const nom = e['Nom SCPI'];
  if (!nom) return;
  if (!merged[nom]) {
    merged[nom] = e;
  } else {
    // Fusionner les données trimestrielles
    if (e['Période bulletin trimestriel'] && !merged[nom]['Période bulletin trimestriel']) {
      merged[nom]['Actualités trimestrielles'] = e['Actualités trimestrielles'];
      merged[nom]['Période bulletin trimestriel'] = e['Période bulletin trimestriel'];
    }
  }
});

const parefMerged = merged['Paref Evo'];
console.log(`✅ Paref Evo après fusion: ${parefMerged ? 'TROUVÉ' : 'NON TROUVÉ'}`);

if (parefMerged) {
  console.log(`   - Nom: ${parefMerged['Nom SCPI']}`);
  console.log(`   - Prix: ${parefMerged['Prix de souscription (€)']}€`);
  console.log(`   - Actualités: ${parefMerged['Actualités trimestrielles'] ? 'OUI' : 'NON'}`);
  console.log(`   - Période: ${parefMerged['Période bulletin trimestriel'] || 'N/A'}`);
}

// Vérifier dans scpiDataExtended.ts
const scpiDataExtendedContent = fs.readFileSync(scpiDataExtendedPath, 'utf8');
const parefInExtended = scpiDataExtendedContent.includes('"name": "Paref Evo"');
console.log(`\n📋 Paref Evo dans scpiDataExtended.ts: ${parefInExtended ? 'TROUVÉ' : 'NON TROUVÉ'}`);

// Vérifier tous les noms Paref
const allParefNames = Object.keys(merged).filter(n => n.toLowerCase().includes('paref'));
console.log(`\n📝 Tous les noms Paref trouvés: ${allParefNames.join(', ')}`);

// Vérifier la correspondance exacte
const scpiDataExtendedMatch = scpiDataExtendedContent.match(/"name":\s*"([^"]+)"/g);
if (scpiDataExtendedMatch) {
  const names = scpiDataExtendedMatch.map(m => m.match(/"name":\s*"([^"]+)"/)[1]);
  const parefNamesInExtended = names.filter(n => n.toLowerCase().includes('paref'));
  console.log(`\n📋 Noms Paref dans scpiDataExtended.ts: ${parefNamesInExtended.join(', ')}`);
  
  // Vérifier correspondance exacte
  const exactMatch = names.find(n => n === 'Paref Evo');
  console.log(`\n🎯 Correspondance exacte "Paref Evo": ${exactMatch ? 'OUI' : 'NON'}`);
}
