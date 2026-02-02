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
  
  // Pattern 2b: "X,XX% brut / Y,YY% net" (sans "Taux de distribution" avant)
  const brutNetPattern2b = actualites.match(/(\d+[.,]\d+)%\s*brut\s*\/\s*(\d+[.,]\d+)%\s*net/i);
  if (brutNetPattern2b) {
    return parseFloat(brutNetPattern2b[2].replace(',', '.'));
  }
  
  return null;
}

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver LOG-IN T3 2025 (qui a les actualités)
const logInT3 = data.find(s => s['Nom SCPI'] === 'Log In' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!logInT3) {
  console.error('❌ LOG-IN T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Test de détection du taux net dans LOG-IN T3 2025:\n');

const actualites = logInT3['Actualités trimestrielles'] || '';
const netYield = extractNetYield(actualites);
const brutYield = logInT3['Taux de distribution (%)'] || 6.3;

console.log('📊 Résultats:');
console.log('  Brut:', brutYield, '%');
console.log('  Net détecté:', netYield !== null ? `${netYield}% ✅` : '❌ Non trouvé');

if (actualites) {
  console.log('\n🔍 Extrait des actualités contenant "Taux de distribution":');
  const tauxIndex = actualites.indexOf('Taux de distribution');
  if (tauxIndex !== -1) {
    const extract = actualites.substring(tauxIndex, tauxIndex + 100);
    console.log('  ', extract);
    
    // Tester tous les patterns
    const patterns = [
      actualites.match(/(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i),
      actualites.match(/taux\s+de\s+distribution[^:]*:\s*(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i),
      actualites.match(/(\d+[.,]\d+)%\s*brut\s*\/\s*(\d+[.,]\d+)%\s*net/i)
    ];
    
    patterns.forEach((match, idx) => {
      if (match) {
        console.log(`\n  ✅ Pattern ${idx + 1} trouvé:`);
        console.log('    Match complet:', match[0]);
        console.log('    Brut:', match[1]);
        console.log('    Net:', match[2]);
      }
    });
  }
}
