/**
 * Script simple pour traiter un bulletin trimestriel
 * 
 * Usage:
 *   node scripts/processBulletinSimple.cjs <fichier_json>
 * 
 * Le fichier JSON doit contenir les données extraites du bulletin
 * Voir template_bulletin.json pour le format
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: node processBulletinSimple.cjs <fichier_json>');
  console.error('Exemple: node processBulletinSimple.cjs bulletin_comete_t3_2025.json');
  process.exit(1);
}

const jsonFile = args[0];
const jsonPath = path.resolve(jsonFile);

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Fichier non trouvé: ${jsonPath}`);
  process.exit(1);
}

// Lire les données du bulletin
const bulletinData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Créer un script TypeScript temporaire pour traiter le bulletin
const tempScript = `
import { processAndOutput } from './processBulletinTrimestriel.ts';

const bulletinData = ${JSON.stringify(bulletinData, null, 2)};

console.log('\\n📊 Traitement du bulletin trimestriel...\\n');
const result = processAndOutput(bulletinData, false);

console.log('\\n✅ Traitement terminé.\\n');
console.log('Pour appliquer la mise à jour, utilisez: --apply');
`;

const tempScriptPath = path.join(__dirname, 'temp_process.ts');
fs.writeFileSync(tempScriptPath, tempScript);

try {
  // Exécuter le script
  execSync(`npx tsx ${tempScriptPath}`, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
} catch (error) {
  console.error('Erreur lors du traitement:', error.message);
  process.exit(1);
} finally {
  // Nettoyer le fichier temporaire
  if (fs.existsSync(tempScriptPath)) {
    fs.unlinkSync(tempScriptPath);
  }
}
