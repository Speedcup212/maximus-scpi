const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lire les données du bulletin
const bulletinDataPath = path.join(__dirname, 'processLogInT3_2025.json');
const bulletinData = JSON.parse(fs.readFileSync(bulletinDataPath, 'utf8'));

console.log('📄 Traitement du bulletin LOG-IN T3 2025...\n');
console.log('Données extraites:', JSON.stringify(bulletinData, null, 2), '\n');

// Exécuter le script de traitement
try {
  const scriptPath = path.join(__dirname, 'processBulletinTrimestriel.ts');
  const command = `npx tsx -e "import { processAndOutput } from './processBulletinTrimestriel.ts'; processAndOutput(${JSON.stringify(bulletinData)}, true);"`;
  
  execSync(command, { 
    stdio: 'inherit', 
    cwd: __dirname,
    encoding: 'utf8'
  });
  
  console.log('\n✅ Bulletin traité avec succès');
} catch (error) {
  console.error('❌ Erreur lors du traitement:', error.message);
  process.exit(1);
}
