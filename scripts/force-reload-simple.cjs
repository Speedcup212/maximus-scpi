#!/usr/bin/env node

/**
 * Script de rechargement forcé - Version CommonJS Simple
 * Compatible avec tous les environnements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

console.log('🔄 Force Reload - Nettoyage du cache Vite...\n');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

try {
  // 1. Nettoyer le cache Vite
  const viteCachePath = path.join(projectRoot, 'node_modules', '.vite');
  if (fs.existsSync(viteCachePath)) {
    console.log('🗑️  Suppression du cache Vite...');
    deleteFolderRecursive(viteCachePath);
    console.log('✅ Cache Vite supprimé\n');
  }

  // 2. Nettoyer le dossier dist
  const distPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('🗑️  Suppression du dossier dist...');
    deleteFolderRecursive(distPath);
    console.log('✅ Dossier dist supprimé\n');
  }

  // 3. Créer un timestamp pour forcer le rechargement
  const timestampFile = path.join(projectRoot, 'src', '.reload-timestamp');
  const timestamp = Date.now();
  fs.writeFileSync(timestampFile, timestamp.toString());
  console.log(`✅ Timestamp de rechargement créé: ${timestamp}\n`);

  // 4. Toucher les fichiers modifiés
  console.log('🔨 Forçage du rechargement des composants...');
  const portfolioSummary = path.join(projectRoot, 'src', 'components', 'PortfolioSummary.tsx');
  const unifiedPortfolio = path.join(projectRoot, 'src', 'components', 'UnifiedPortfolio.tsx');

  if (fs.existsSync(portfolioSummary)) {
    const now = new Date();
    fs.utimesSync(portfolioSummary, now, now);
  }
  if (fs.existsSync(unifiedPortfolio)) {
    const now = new Date();
    fs.utimesSync(unifiedPortfolio, now, now);
  }
  console.log('✅ Composants touchés\n');

  // 5. Rebuild le projet
  console.log('🔨 Reconstruction du projet...\n');
  execSync('npm run build', {
    cwd: projectRoot,
    stdio: 'inherit',
    maxBuffer: 1024 * 1024 * 10
  });

  console.log('\n✅ Rechargement forcé terminé avec succès!\n');
  console.log('📌 Actions à faire manuellement:');
  console.log('   1. Ouvrez votre navigateur');
  console.log('   2. Appuyez sur Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)');
  console.log('   3. Ou ouvrez les DevTools et faites un "Empty Cache and Hard Reload"\n');
  console.log('🚀 Le serveur de dev devrait maintenant servir la nouvelle version!\n');

} catch (error) {
  console.error('❌ Erreur lors du rechargement forcé:', error.message);
  process.exit(1);
}
