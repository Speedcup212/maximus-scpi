/**
 * Script pour mettre à jour automatiquement les données SCPI depuis un bulletin trimestriel PDF
 * Utilise le script d'extraction TypeScript et met à jour le JSON
 * 
 * Usage: node scripts/updateFromBulletin.cjs <fichier.pdf> <nom-scpi>
 * Exemple: node scripts/updateFromBulletin.cjs "c:\Users\ericb\Desktop\BTI-T3-2025-Comete-1.pdf" "Comète"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/updateFromBulletin.cjs <fichier.pdf> <nom-scpi>');
  console.log('Exemple: node scripts/updateFromBulletin.cjs "BTI-T3-2025-Comete-1.pdf" "Comète"');
  process.exit(1);
}

const pdfPath = args[0];
const scpiName = args[1];
const jsonPath = path.join(__dirname, '../src/data/scpi_complet.json');

try {
  // 1. Extraire les données depuis le PDF
  console.log('📄 Extraction des données depuis le PDF...\n');
  const extractionResult = execSync(
    `npx tsx scripts/extractScpiQuarterlyData.ts "${pdfPath}" "${scpiName}"`,
    { encoding: 'utf-8', cwd: path.join(__dirname, '..') }
  );

  // Parser le JSON de sortie (les logs vont dans stderr, le JSON dans stdout)
  const jsonMatch = extractionResult.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('❌ Impossible de parser le résultat de l\'extraction');
    process.exit(1);
  }

  const extractedData = JSON.parse(jsonMatch[0]);
  console.log('✅ Données extraites:\n', JSON.stringify(extractedData, null, 2), '\n');

  // 2. Mettre à jour le JSON
  console.log('📝 Mise à jour du fichier JSON...\n');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

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

  let updated = false;

  // Mettre à jour l'endettement si trouvé
  if (extractedData.endettement !== null) {
    const ancien = scpi['Endettement (%)'];
    scpi['Endettement (%)'] = extractedData.endettement;
    console.log(`✅ Endettement: ${ancien}% → ${extractedData.endettement}%`);
    updated = true;
  }

  // Mettre à jour la collecte nette
  if (extractedData.collecte_nette_trimestre !== null) {
    scpi['Collecte nette trimestre'] = extractedData.collecte_nette_trimestre;
    console.log(`✅ Collecte nette trimestre: ${(extractedData.collecte_nette_trimestre / 1000000).toFixed(1)}M€`);
    updated = true;
  } else {
    scpi['Collecte nette trimestre'] = null;
    console.log('⚠️  Collecte nette trimestre: Non trouvée → N/A');
  }

  // Mettre à jour le nombre de cessions
  if (extractedData.nb_cessions_trimestre !== null) {
    scpi['Nombre de cessions trimestre'] = extractedData.nb_cessions_trimestre;
    console.log(`✅ Nombre de cessions trimestre: ${extractedData.nb_cessions_trimestre}`);
    updated = true;
  } else {
    scpi['Nombre de cessions trimestre'] = null;
    console.log('⚠️  Nombre de cessions trimestre: Non trouvé → N/A');
  }

  // Mettre à jour le nombre de locataires
  if (extractedData.nombre_locataires !== null) {
    scpi['Nombre de locataires'] = extractedData.nombre_locataires;
    console.log(`✅ Nombre de locataires: ${extractedData.nombre_locataires}`);
    updated = true;
  }

  // Mettre à jour WALT
  if (extractedData.walt !== null) {
    scpi['WALT'] = extractedData.walt;
    console.log(`✅ WALT: ${extractedData.walt} ans`);
    updated = true;
  }

  // Mettre à jour WALB
  if (extractedData.walb !== null) {
    scpi['WALB'] = extractedData.walb;
    console.log(`✅ WALB: ${extractedData.walb} ans`);
    updated = true;
  }

  if (updated) {
    // Sauvegarder
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log('\n✅ Fichier JSON mis à jour avec succès!');
  } else {
    console.log('\n⚠️  Aucune donnée trouvée dans le bulletin');
  }
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
