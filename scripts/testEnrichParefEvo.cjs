const fs = require('fs');
const path = require('path');

// Simuler le chargement des données
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
const parefInMerged = mergedData.find(s => s['Nom SCPI'] === 'Paref Evo');

console.log('🔍 Test de correspondance Paref Evo\n');
console.log(`✅ Paref Evo dans mergedData: ${parefInMerged ? 'TROUVÉ' : 'NON TROUVÉ'}`);

if (parefInMerged) {
  console.log(`   Nom exact: "${parefInMerged['Nom SCPI']}"`);
  
  // Tester la correspondance comme dans enrichScpiExtended
  const scpiExtendedName = 'Paref Evo';
  const scpiDataName = parefInMerged['Nom SCPI'];
  
  const match1 = scpiDataName.toLowerCase() === scpiExtendedName.toLowerCase();
  console.log(`\n🎯 Correspondance (toLowerCase): ${match1 ? 'OUI' : 'NON'}`);
  console.log(`   scpiExtendedName: "${scpiExtendedName}"`);
  console.log(`   scpiDataName: "${scpiDataName}"`);
  console.log(`   scpiExtendedName.toLowerCase(): "${scpiExtendedName.toLowerCase()}"`);
  console.log(`   scpiDataName.toLowerCase(): "${scpiDataName.toLowerCase()}"`);
  
  // Vérifier s'il y a des espaces ou caractères invisibles
  console.log(`\n📏 Longueurs:`);
  console.log(`   scpiExtendedName.length: ${scpiExtendedName.length}`);
  console.log(`   scpiDataName.length: ${scpiDataName.length}`);
  console.log(`   Codes caractères scpiExtendedName: ${Array.from(scpiExtendedName).map(c => c.charCodeAt(0)).join(', ')}`);
  console.log(`   Codes caractères scpiDataName: ${Array.from(scpiDataName).map(c => c.charCodeAt(0)).join(', ')}`);
}

// Vérifier tous les noms dans mergedData
const allNames = mergedData.map(s => s['Nom SCPI']).filter(Boolean);
const parefNames = allNames.filter(n => n.toLowerCase().includes('paref'));
console.log(`\n📝 Tous les noms Paref dans mergedData: ${parefNames.join(', ')}`);
console.log(`📊 Total SCPI dans mergedData: ${mergedData.length}`);
