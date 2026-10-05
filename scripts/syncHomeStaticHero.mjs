import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const target = path.join(projectRoot, 'dist', 'index.html');

if (!fs.existsSync(target)) {
  console.error('❌ dist/index.html absent : impossible de synchroniser la home statique.');
  process.exit(1);
}

let html = fs.readFileSync(target, 'utf-8');

const desiredBlock = `<h1>
                <span class="initial-title-main">Analysez. Comparez.</span>
                <span class="initial-title-accent">Investissez sur <span class="initial-title-brand">MaximusSCPI.</span></span>
              </h1>`;

const heroPattern = /<h1>\s*<span class=["']initial-title-main["']>[\s\S]*?<\/span>\s*<span class=["']initial-title-accent["']>[\s\S]*?<\/span>(?:\s*<span class=["']initial-title-accent["']>[\s\S]*?<\/span>)?\s*<\/h1>/i;

if (!heroPattern.test(html)) {
  console.error('❌ H1 statique de la home introuvable dans dist/index.html.');
  process.exit(1);
}
html = html.replace(heroPattern, desiredBlock);

html = html.replace(
  `<a href="/simulateurs/">Simulateurs</a>\n            <a href="/articles/">Apprendre</a>`,
  `<a href="/simulateurs/">Simulateurs</a>\n            <a href="/analyses/">Analyses</a>\n            <a href="/articles/">Comprendre</a>`
);
html = html.replace(`<a href="/articles/">Apprendre</a>`, `<a href="/articles/">Comprendre</a>`);

html = html.replace(
  'Analyse SCPI pédagogique • Fiscalité • Rendement net',
  'Analyse SCPI • Comparaison • Simulation • Suivi'
);
html = html.replace(
  `En 2 minutes, obtenez une première orientation pédagogique selon votre montant, votre fiscalité, votre horizon d'investissement et votre tolérance au risque.`,
  `Un seul espace pour comprendre les SCPI, les comparer, simuler votre investissement et construire votre portefeuille.`
);
html = html.replace(
  `Comparateur, simulateurs, fiches SCPI, fiscalité, risques et rendement net : une expérience complète pour avancer avec méthode.`,
  `Au-delà du rendement, découvrez les forces, la trajectoire et les fondamentaux de chaque SCPI.`
);
html = html.replace(/\s*<p class="initial-proof-strong">Plus de 4 650 situations patrimoniales étudiées — plus de 330 M€ de projets analysés<\/p>/g, '');

fs.writeFileSync(target, html, 'utf-8');

// Cette vérification conserve volontairement la signature attendue par
// patchHomeHeroVisuals.mjs afin que le prebuild reste idempotent.
if (
  !html.includes('<span class="initial-title-main">Analysez. Comparez.</span>') ||
  !html.includes('<span class="initial-title-accent">Investissez sur <span class="initial-title-brand">MaximusSCPI.</span></span>')
) {
  console.error('❌ Synchronisation du H1 statique de la home non vérifiée.');
  process.exit(1);
}

const required = [
  '<a href="/analyses/">Analyses</a>',
  '<a href="/articles/">Comprendre</a>',
  'Analyse SCPI • Comparaison • Simulation • Suivi',
  'Au-delà du rendement, découvrez les forces, la trajectoire et les fondamentaux de chaque SCPI.',
];
const forbidden = [
  '>Apprendre</a>',
  'Plus de 4 650 situations patrimoniales étudiées',
  'plus de 330 M€ de projets analysés',
  'Testez. Comparez. Décidez.',
];

const missing = required.filter((value) => !html.includes(value));
const leaked = forbidden.filter((value) => html.includes(value));
if (missing.length || leaked.length) {
  console.error('❌ Home statique non conforme.', { missing, leaked });
  process.exit(1);
}

console.log('✅ H1 statique de la home synchronisé avec HomeApp : Analysez. Comparez. / Investissez sur (blanc) / MaximusSCPI. (vert)');
console.log('✅ Home statique alignée : Analyses, Comprendre, copie actuelle, anciennes preuves sociales supprimées.');
