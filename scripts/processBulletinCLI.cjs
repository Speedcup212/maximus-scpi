/**
 * Interface CLI pour traiter un bulletin trimestriel SCPI
 * 
 * Usage:
 * node scripts/processBulletinCLI.cjs <nom_scpi> <periode> [--apply]
 * 
 * Exemple:
 * node scripts/processBulletinCLI.cjs "Comète" "T3 2025" --apply
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node processBulletinCLI.cjs <nom_scpi> <periode> [--apply]');
  console.error('Exemple: node processBulletinCLI.cjs "Comète" "T3 2025" --apply');
  process.exit(1);
}

const nomScpi = args[0];
const periode = args[1];
const applyUpdate = args.includes('--apply');

// Template de données à remplir manuellement ou via extraction
const bulletinData = {
  nomScpi,
  periode,
  
  // À remplir avec les données extraites du bulletin
  endettement: null,
  collecteNetteTrimestre: null,
  nbCessionsTrimestre: null,
  nombreLocataires: null,
  walt: null,
  walb: null,
  tof: null,
  tauxDistribution: null,
  distribution: null,
  capitalisation: null,
  prixPart: null,
  valeurReconstitution: null,
  decoteSurcote: null,
  
  repartitionSectorielle: null,
  repartitionGeographique: null,
  
  actualitesTrimestrielles: null,
};

// Exécuter le script TypeScript
try {
  const scriptPath = path.join(__dirname, 'processBulletinTrimestriel.ts');
  const command = `npx tsx -e "import { processAndOutput } from './processBulletinTrimestriel.ts'; processAndOutput(${JSON.stringify(bulletinData)}, ${applyUpdate});"`;
  
  execSync(command, { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  console.error('Erreur lors du traitement:', error.message);
  process.exit(1);
}
