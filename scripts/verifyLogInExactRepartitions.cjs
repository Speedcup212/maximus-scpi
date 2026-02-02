const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée principale
const logInMain = data.find(s => s['Nom SCPI'] === 'Log In' && !s['Période bulletin trimestriel']);

if (!logInMain) {
  console.error('❌ Entrée principale LOG-IN non trouvée');
  process.exit(1);
}

console.log('✅ Vérification des répartitions exactes:\n');

// Vérifier répartition sectorielle
const expectedSect = {
  "Logistique / Activité": 36.9,
  "Bureaux": 27.9,
  "Hôtellerie": 8.7,
  "Résidentiel": 7.7,
  "Éducation": 7.5,
  "Commerces": 5.5,
  "Santé": 3.5,
  "Autres": 2.3
};

const actualSect = logInMain['Répartition Sectorielle JSON'] || {};

console.log('📊 Répartition Sectorielle:');
let sectOk = true;
Object.entries(expectedSect).forEach(([k, v]) => {
  const actual = actualSect[k];
  const match = actual === v;
  if (!match) {
    sectOk = false;
    console.log(`  ❌ ${k}: attendu ${v}%, trouvé ${actual}%`);
  } else {
    console.log(`  ✅ ${k}: ${v}%`);
  }
});

const totalSect = Object.values(actualSect).reduce((a, b) => a + b, 0);
console.log(`  Total: ${totalSect.toFixed(1)}% (attendu: 100.0%)\n`);

// Vérifier répartition géographique
const expectedGeo = {
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

const actualGeo = logInMain['Répartition Géographique JSON'] || {};

console.log('🌍 Répartition Géographique:');
let geoOk = true;
Object.entries(expectedGeo).forEach(([k, v]) => {
  const actual = actualGeo[k];
  const match = actual === v;
  if (!match) {
    geoOk = false;
    console.log(`  ❌ ${k}: attendu ${v}%, trouvé ${actual}%`);
  } else {
    console.log(`  ✅ ${k}: ${v}%`);
  }
});

const totalGeo = Object.values(actualGeo).reduce((a, b) => a + b, 0);
console.log(`  Total: ${totalGeo.toFixed(1)}% (attendu: 100.0%)\n`);

if (sectOk && geoOk) {
  console.log('✅ Toutes les répartitions sont correctes!');
} else {
  console.log('❌ Certaines répartitions ne correspondent pas');
}
