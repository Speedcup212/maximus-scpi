import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const target = path.join(projectRoot, 'dist', 'index.html');

if (!fs.existsSync(target)) {
  console.error('❌ dist/index.html absent : impossible de synchroniser le H1 de la home.');
  process.exit(1);
}

const desiredBlock = `<h1>
                <span class="initial-title-main">Analysez. Comparez.</span>
                <span class="initial-title-accent">Investissez sur</span>
                <span class="initial-title-accent">MaximusSCPI.</span>
              </h1>`;

let html = fs.readFileSync(target, 'utf-8');

const heroPattern = /<h1>\s*<span class=["']initial-title-main["']>[\s\S]*?<\/span>\s*<span class=["']initial-title-accent["']>[\s\S]*?<\/span>(?:\s*<span class=["']initial-title-accent["']>[\s\S]*?<\/span>)?\s*<\/h1>/i;

if (!heroPattern.test(html)) {
  console.error('❌ H1 statique de la home introuvable dans dist/index.html.');
  process.exit(1);
}

html = html.replace(heroPattern, desiredBlock);
fs.writeFileSync(target, html, 'utf-8');

if (
  !html.includes('<span class="initial-title-main">Analysez. Comparez.</span>') ||
  !html.includes('<span class="initial-title-accent">Investissez sur</span>') ||
  !html.includes('<span class="initial-title-accent">MaximusSCPI.</span>')
) {
  console.error('❌ Synchronisation du H1 statique de la home non vérifiée.');
  process.exit(1);
}

console.log('✅ H1 statique de la home synchronisé avec HomeApp : Analysez. Comparez. / Investissez sur / MaximusSCPI.');
