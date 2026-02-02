const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Répartitions exactes à appliquer
const repartitionSectorielle = {
  "Logistique / Activité": 36.9,
  "Bureaux": 27.9,
  "Hôtellerie": 8.7,
  "Résidentiel": 7.7,
  "Éducation": 7.5,
  "Commerces": 5.5,
  "Santé": 3.5,
  "Autres": 2.3
};

const repartitionGeographique = {
  "France": 37.3,
  "Allemagne": 25.3,
  "Royaume-Uni": 13.1,
  "Italie": 7.6,
  "Pays-Bas": 6.7,
  "Espagne": 3.5,
  "Portugal": 2.4,
  "Grèce": 2.4,
  "Autres pays": 1.7
};

// Générer les textes
const sectText = Object.entries(repartitionSectorielle)
  .map(([k, v]) => `${k} (${v}%)`)
  .join(', ');

const geoText = Object.entries(repartitionGeographique)
  .map(([k, v]) => `${k} (${v}%)`)
  .join(', ');

// Trouver toutes les entrées LOG-IN
const logInEntries = data.filter(s => s['Nom SCPI'] === 'Log In');

console.log(`✅ Nombre d'entrées LOG-IN: ${logInEntries.length}\n`);

let updated = false;

logInEntries.forEach((entry, idx) => {
  const periode = entry['Période bulletin trimestriel'] || 'principale';
  
  // Vérifier si les répartitions sont différentes
  const sectDifferent = JSON.stringify(entry['Répartition Sectorielle JSON']) !== JSON.stringify(repartitionSectorielle);
  const geoDifferent = JSON.stringify(entry['Répartition Géographique JSON']) !== JSON.stringify(repartitionGeographique);
  
  if (sectDifferent || geoDifferent) {
    entry['Répartition Sectorielle JSON'] = { ...repartitionSectorielle };
    entry['Répartition Sectorielle'] = sectText;
    entry['Répartition Géographique JSON'] = { ...repartitionGeographique };
    entry['Répartition Géographique'] = geoText;
    
    console.log(`✅ Entrée ${idx + 1} (${periode}): répartitions mises à jour`);
    updated = true;
  } else {
    console.log(`✓ Entrée ${idx + 1} (${periode}): répartitions déjà à jour`);
  }
});

if (updated) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('\n✅ Fichier scpi_complet.json mis à jour');
} else {
  console.log('\n✓ Toutes les entrées sont déjà à jour');
}

// Afficher un résumé
console.log('\n📊 Répartition Sectorielle:');
Object.entries(repartitionSectorielle)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(repartitionSectorielle).reduce((a, b) => a + b, 0);
console.log(`  Total: ${totalSect.toFixed(1)}%`);

console.log('\n🌍 Répartition Géographique:');
Object.entries(repartitionGeographique)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(repartitionGeographique).reduce((a, b) => a + b, 0);
console.log(`  Total: ${totalGeo.toFixed(1)}%`);
