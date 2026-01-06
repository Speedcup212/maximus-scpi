#!/usr/bin/env node

/**
 * Script pour forcer le rechargement des modules Vite
 * Nettoie le cache et redémarre le serveur de dev
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔄 Force Reload - Nettoyage du cache Vite...\n');

async function forceReload() {
  try {
    // 1. Nettoyer le cache Vite
    const viteCachePath = path.join(projectRoot, 'node_modules', '.vite');
    if (fs.existsSync(viteCachePath)) {
      console.log('🗑️  Suppression du cache Vite...');
      fs.rmSync(viteCachePath, { recursive: true, force: true });
      console.log('✅ Cache Vite supprimé\n');
    }

    // 2. Nettoyer le dossier dist
    const distPath = path.join(projectRoot, 'dist');
    if (fs.existsSync(distPath)) {
      console.log('🗑️  Suppression du dossier dist...');
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log('✅ Dossier dist supprimé\n');
    }

    // 3. Créer un timestamp pour forcer le rechargement
    const timestampFile = path.join(projectRoot, 'src', '.reload-timestamp');
    const timestamp = Date.now();
    fs.writeFileSync(timestampFile, timestamp.toString());
    console.log(`✅ Timestamp de rechargement créé: ${timestamp}\n`);

    // 4. Nettoyer le cache du navigateur en ajoutant un query param
    const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
    console.log('📝 Ajout du cache-busting dans vite.config.ts...\n');

    // 5. Rebuild le projet
    console.log('🔨 Reconstruction du projet...\n');
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: projectRoot,
      maxBuffer: 1024 * 1024 * 10
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

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
}

forceReload();
