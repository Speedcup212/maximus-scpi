/**
 * Script pour mettre à jour les répartitions sectorielles et géographiques
 * depuis un bulletin trimestriel
 * 
 * Usage: node scripts/updateRepartitionsFromBulletin.cjs <nom-scpi> <fichier-json-repartitions>
 * 
 * Le fichier JSON doit contenir:
 * {
 *   "secteurs": {
 *     "Commerce": 26,
 *     "Bureau": 21,
 *     ...
 *   },
 *   "geographie": {
 *     "Royaume-Uni": 43,
 *     "Espagne": 23,
 *     ...
 *   }
 * }
 * 
 * Exemple:
 * node scripts/updateRepartitionsFromBulletin.cjs "Comète" repartitions-comete-t3-2025.json
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/updateRepartitionsFromBulletin.cjs <nom-scpi> <fichier-json-repartitions>');
  console.log('\nLe fichier JSON doit contenir:');
  console.log('{');
  console.log('  "secteurs": { "Commerce": 26, "Bureau": 21, ... },');
  console.log('  "geographie": { "Royaume-Uni": 43, "Espagne": 23, ... }');
  console.log('}');
  process.exit(1);
}

const scpiName = args[0];
const repartitionsPath = path.resolve(args[1]);
const jsonPath = path.join(__dirname, '../src/data/scpi_complet.json');

try {
  // Lire les nouvelles répartitions
  const repartitionsData = JSON.parse(fs.readFileSync(repartitionsPath, 'utf8'));
  
  if (!repartitionsData.secteurs || !repartitionsData.geographie) {
    console.error('❌ Le fichier JSON doit contenir "secteurs" et "geographie"');
    process.exit(1);
  }

  // Lire le JSON principal
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Trouver la SCPI
  const scpi = data.find(s => {
    const nom = s['Nom SCPI'];
    return nom && (nom === scpiName || nom.toLowerCase() === scpiName.toLowerCase());
  });

  if (!scpi) {
    console.error(`❌ SCPI "${scpiName}" non trouvée dans le fichier JSON`);
    process.exit(1);
  }

  console.log(`✅ SCPI trouvée: ${scpi['Nom SCPI']}\n`);

  // Mettre à jour les répartitions JSON
  scpi['Répartition Sectorielle JSON'] = repartitionsData.secteurs;
  scpi['Répartition Géographique JSON'] = repartitionsData.geographie;

  // Mettre à jour les répartitions en format texte (pour compatibilité)
  const secteursTexte = Object.entries(repartitionsData.secteurs)
    .sort((a, b) => b[1] - a[1]) // Trier par pourcentage décroissant
    .map(([secteur, pct]) => `${secteur} (${pct}%)`)
    .join(', ');

  const geographieTexte = Object.entries(repartitionsData.geographie)
    .sort((a, b) => b[1] - a[1]) // Trier par pourcentage décroissant
    .map(([pays, pct]) => `${pays} (${pct}%)`)
    .join(', ');

  scpi['Répartition Sectorielle'] = secteursTexte;
  scpi['Répartition Géographique'] = geographieTexte;

  // Sauvegarder
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  console.log('✅ Répartitions mises à jour:\n');
  console.log('📊 Répartition Sectorielle:');
  Object.entries(repartitionsData.secteurs)
    .sort((a, b) => b[1] - a[1])
    .forEach(([secteur, pct]) => {
      console.log(`   - ${secteur}: ${pct}%`);
    });

  console.log('\n🌍 Répartition Géographique:');
  Object.entries(repartitionsData.geographie)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pays, pct]) => {
      console.log(`   - ${pays}: ${pct}%`);
    });

  console.log('\n✅ Fichier JSON mis à jour!');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
