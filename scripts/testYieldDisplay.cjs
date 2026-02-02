const fs = require('fs');
const path = require('path');

// Simuler extractNetYield
function extractNetYield(actualites) {
  if (!actualites) return null;
  
  // Pattern 1: "X,XX% brut / Y,YY% net" ou "X.XX% brut / Y.YY% net"
  const brutNetPattern1 = actualites.match(/(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i);
  if (brutNetPattern1) {
    return parseFloat(brutNetPattern1[2].replace(',', '.'));
  }
  
  // Pattern 2: "Taux de distribution 2024: X,XX% brut / Y,YY% net"
  const brutNetPattern2 = actualites.match(/taux\s+de\s+distribution[^:]*:\s*(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i);
  if (brutNetPattern2) {
    return parseFloat(brutNetPattern2[2].replace(',', '.'));
  }
  
  // Pattern 3: "X,XX% net" ou "net: X,XX%"
  const netPattern1 = actualites.match(/(\d+[.,]\d+)%\s*net[^%]/i);
  if (netPattern1) {
    return parseFloat(netPattern1[1].replace(',', '.'));
  }
  
  const netPattern2 = actualites.match(/net[:\s]+(\d+[.,]\d+)/i);
  if (netPattern2) {
    return parseFloat(netPattern2[1].replace(',', '.'));
  }
  
  // Pattern 4: "X,XX% net de fiscalité étrangère"
  const netPattern3 = actualites.match(/(\d+[.,]\d+)%\s*net\s+de\s+fiscalité/i);
  if (netPattern3) {
    return parseFloat(netPattern3[1].replace(',', '.'));
  }
  
  return null;
}

// Simuler isEuropeanScpi
function isEuropeanScpi(repartitionGeo) {
  if (!repartitionGeo || repartitionGeo.length === 0) return false;
  
  const franceEntry = repartitionGeo.find(g => 
    g.name.toLowerCase().includes('france') || 
    g.name.toLowerCase().includes('français')
  );
  const francePercentage = franceEntry?.value || 0;
  
  return francePercentage < 50;
}

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver LOG-IN
const logIn = data.find(s => s['Nom SCPI'] === 'Log In' && !s['Période bulletin trimestriel']);

if (!logIn) {
  console.error('❌ LOG-IN non trouvée');
  process.exit(1);
}

console.log('✅ Test de détection du taux de distribution pour LOG-IN:\n');

// Simuler repartitionGeo depuis JSON
const repartitionGeoJSON = logIn['Répartition Géographique JSON'] || {};
const repartitionGeo = Object.entries(repartitionGeoJSON).map(([name, value]) => ({
  name,
  value: typeof value === 'number' ? value : 0
}));

const isEuropean = isEuropeanScpi(repartitionGeo);
console.log('  Géographie:', isEuropean ? '🇪🇺 Européenne' : '🇫🇷 Française');
console.log('  Répartition France:', repartitionGeo.find(g => g.name.includes('France'))?.value || 0, '%');

const actualites = logIn['Actualités trimestrielles'] || '';
const netYield = extractNetYield(actualites);
const brutYield = logIn['Taux de distribution (%)'];

console.log('\n📊 Taux de distribution:');
console.log('  Brut:', brutYield, '%');
console.log('  Net détecté:', netYield !== null ? `${netYield}%` : '❌ Non trouvé');

if (actualites) {
  console.log('\n🔍 Recherche dans les actualités:');
  const netMatches = [
    actualites.match(/(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i),
    actualites.match(/taux\s+de\s+distribution[^:]*:\s*(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i),
    actualites.match(/(\d+[.,]\d+)%\s*net[^%]/i),
    actualites.match(/net[:\s]+(\d+[.,]\d+)/i),
    actualites.match(/(\d+[.,]\d+)%\s*net\s+de\s+fiscalité/i)
  ];
  
  netMatches.forEach((match, idx) => {
    if (match) {
      console.log(`  Pattern ${idx + 1} trouvé:`, match[0].substring(0, 50));
    }
  });
}

console.log('\n✅ Affichage attendu:');
if (isEuropean) {
  if (netYield !== null) {
    console.log('  ✅ Afficher NET:', netYield, '% (principal)');
    console.log('  ✅ Afficher BRUT:', brutYield, '% (secondaire)');
  } else {
    console.log('  ⚠️  Afficher BRUT:', brutYield, '% (net non communiqué)');
  }
} else {
  console.log('  ✅ Afficher BRUT:', brutYield, '%');
}
