import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const indexPath = path.join(projectRoot, 'dist', 'index.html');

const findRootBounds = (html) => {
  const rootStart = html.search(/<div\s+id=["']root["'][^>]*>/i);
  if (rootStart === -1) throw new Error('div#root absent de dist/index.html');
  const openEnd = html.indexOf('>', rootStart);
  if (openEnd === -1) throw new Error('ouverture #root invalide');

  const divTag = /<div\b[^>]*>|<\/div>/gi;
  divTag.lastIndex = openEnd + 1;
  let depth = 1;
  let match;
  while ((match = divTag.exec(html))) {
    if (/^<div\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) return { rootStart, openEnd, closeStart: match.index };
  }
  throw new Error('fermeture #root introuvable');
};

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html absent avant pré-rendu React.');
  process.exit(1);
}

const original = fs.readFileSync(indexPath, 'utf-8');
const { openEnd, closeStart } = findRootBounds(original);
const emptyRootShell = original.slice(0, openEnd + 1) + original.slice(closeStart);

let status = 1;
try {
  fs.writeFileSync(indexPath, emptyRootShell, 'utf-8');
  console.log('🧹 Shell temporaire de pré-rendu : #root vidé pour éviter le faux positif de la home.');

  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsx', 'scripts/prerenderArticlesFromReact.ts'],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env
    }
  );
  status = typeof result.status === 'number' ? result.status : 1;
  if (result.error) console.error('❌ Échec du lancement du pré-rendu :', result.error);
} finally {
  fs.writeFileSync(indexPath, original, 'utf-8');
  console.log('♻️ Home dist/index.html restaurée à l’identique après pré-rendu.');
}

// Le pré-rendu SEO ne doit pas empêcher la livraison de l'application.
// Les anomalies restent visibles dans les logs afin d'être corrigées séparément.
if (status !== 0) {
  console.warn(`⚠️ Pré-rendu React incomplet (code ${status}) : déploiement poursuivi, anomalies SEO à corriger.`);
  process.exit(0);
}

process.exit(0);
