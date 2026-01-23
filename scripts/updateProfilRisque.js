/**
 * Script pour mettre à jour les valeurs SRRI par défaut dans scpi_complet.json
 * 
 * Règles :
 * - SCPI françaises : 3/7
 * - Iroko Zen : 4/7
 * - Les autres : 3/7
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/data/scpi_complet.json');
const outputPath = path.join(__dirname, '../src/data/scpi_complet.json');

console.log('📊 Lecture du fichier scpi_complet.json...\n');

const jsonContent = fs.readFileSync(inputPath, 'utf-8');
const scpiData = JSON.parse(jsonContent);

if (!Array.isArray(scpiData)) {
  console.error('❌ Le fichier JSON doit être un tableau');
  process.exit(1);
}

console.log(`✅ ${scpiData.length} SCPI trouvées\n`);
console.log('🔄 Mise à jour des valeurs SRRI par défaut...\n');

/**
 * Détermine si une SCPI est française en analysant sa répartition géographique
 */
function isFrenchScpi(scpi) {
  const geoJson = scpi['Répartition Géographique JSON'];
  if (!geoJson || typeof geoJson !== 'object') {
    return false;
  }

  // Calculer le pourcentage de France
  let francePercentage = 0;
  Object.keys(geoJson).forEach(key => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('france') || 
        keyLower.includes('paris') || 
        keyLower.includes('région') || 
        keyLower.includes('ile-de-france') ||
        keyLower.includes('métropole')) {
      francePercentage += geoJson[key] || 0;
    }
  });

  // Considérer comme française si > 50% en France
  return francePercentage > 50;
}

let updated = 0;
let irokoZenCount = 0;
let frenchCount = 0;
let otherCount = 0;

const updatedData = scpiData.map((scpi) => {
  const scpiName = scpi['Nom SCPI'] || '';
  const isIrokoZen = scpiName.toLowerCase().includes('iroko zen');
  const isFrench = isFrenchScpi(scpi);

  let srriValue = 3; // Par défaut : 3/7
  let source = 'Valeur par défaut';
  let verification = 'Default';

  if (isIrokoZen) {
    srriValue = 4;
    source = 'Valeur par défaut (Iroko Zen)';
    irokoZenCount++;
  } else if (isFrench) {
    srriValue = 3;
    source = 'Valeur par défaut (SCPI française)';
    frenchCount++;
  } else {
    srriValue = 3;
    source = 'Valeur par défaut (Autre)';
    otherCount++;
  }

  // Mettre à jour ou créer le champ Profil_de_risque
  const updatedScpi = {
    ...scpi,
    "Profil_de_risque": {
      "SRRI": srriValue,
      "Echelle": "1-7",
      "Source": source,
      "Verification": verification
    }
  };

  updated++;
  return updatedScpi;
});

// Sauvegarder le fichier mis à jour
fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), 'utf-8');

console.log(`✅ ${updated} SCPI mises à jour\n`);
console.log('📊 Répartition :');
console.log(`   - Iroko Zen : ${irokoZenCount} SCPI (SRRI: 4/7)`);
console.log(`   - SCPI françaises : ${frenchCount} SCPI (SRRI: 3/7)`);
console.log(`   - Autres : ${otherCount} SCPI (SRRI: 3/7)\n`);
console.log(`📁 Fichier sauvegardé: ${outputPath}\n`);
