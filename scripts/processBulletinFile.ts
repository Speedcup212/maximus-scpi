/**
 * Script simple pour traiter un fichier JSON de bulletin
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processAndOutput } from './processBulletinTrimestriel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/processBulletinFile.ts <fichier_json> [--apply]');
  process.exit(1);
}

const jsonFile = args[0];
const applyUpdate = args.includes('--apply');
const jsonPath = path.resolve(jsonFile);

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Fichier non trouvé: ${jsonPath}`);
  process.exit(1);
}

// Lire les données du bulletin
const bulletinData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('\n📊 Traitement du bulletin trimestriel...\n');

// Traiter et afficher le résultat
const result = processAndOutput(bulletinData, applyUpdate);

console.log('\n✅ Traitement terminé.\n');
