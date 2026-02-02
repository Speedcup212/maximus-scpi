const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoZen = data.find(s => 
  s['Nom SCPI'] === 'Iroko Zen' && 
  s['Période bulletin trimestriel'] === 'T3 2025'
);

if (!irokoZen) {
  console.log('❌ Iroko Zen T3 2025 non trouvée');
  process.exit(1);
}

const actualites = irokoZen['Actualités trimestrielles'] || '';
const items = actualites.split(' | ');

console.log('✅ Vérification des acquisitions Iroko Zen\n');
console.log('='.repeat(80));

const acquisitions = items.filter(i => i.toLowerCase().includes('acquisition à'));

console.log(`Nombre d'acquisitions trouvées: ${acquisitions.length}\n`);

acquisitions.forEach((acq, i) => {
  // Extraire ville et pays
  const villeMatch = acq.match(/Acquisition à ([^(]+)\s*\(([^,]+)/);
  if (villeMatch) {
    const ville = villeMatch[1].trim();
    const pays = villeMatch[2].trim();
    // Extraire montant
    const montantMatch = acq.match(/(\d+[.,]\d+)\s*M€/);
    const montant = montantMatch ? montantMatch[1] : 'N/A';
    console.log(`   ${i + 1}. ${ville} (${pays}) - ${montant}M€`);
  } else {
    console.log(`   ${i + 1}. ${acq.substring(0, 80)}...`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`✅ ${acquisitions.length} acquisitions détaillées enregistrées`);
