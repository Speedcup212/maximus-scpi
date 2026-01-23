/**
 * Script pour ajouter le champ "Profil_de_risque" à chaque SCPI dans scpi_complet.json
 * 
 * IMPORTANT: Les valeurs SRRI doivent être vérifiées depuis les DIC officiels.
 * Ce script ajoute la structure avec des valeurs null par défaut.
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
console.log('🔄 Ajout du champ "Profil_de_risque" à chaque SCPI...\n');

let updated = 0;
let alreadyHasField = 0;

const updatedData = scpiData.map((scpi, index) => {
  // Vérifier si le champ existe déjà
  if (scpi['Profil_de_risque']) {
    alreadyHasField++;
    return scpi;
  }

  // Ajouter le champ avec structure par défaut
  const updatedScpi = {
    ...scpi,
    "Profil_de_risque": {
      "SRRI": null, // À remplir depuis le DIC officiel (3 ou 4 uniquement)
      "Echelle": "1-7",
      "Source": "À vérifier dans le DIC officiel",
      "Verification": "Not found"
    }
  };

  updated++;
  return updatedScpi;
});

// Sauvegarder le fichier mis à jour
fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), 'utf-8');

console.log(`✅ ${updated} SCPI mises à jour`);
console.log(`ℹ️  ${alreadyHasField} SCPI avaient déjà le champ\n`);
console.log(`📁 Fichier sauvegardé: ${outputPath}\n`);
console.log('⚠️  IMPORTANT: Les valeurs SRRI doivent être vérifiées depuis les DIC officiels.');
console.log('   Pour chaque SCPI, consultez le Document d\'Informations Clés (DIC)');
console.log('   et mettez à jour le champ "SRRI" avec la valeur officielle (3 ou 4).\n');
