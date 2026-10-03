import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const replaceOrVerify = (filePath, before, after, label) => {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(after)) {
    console.log(`✓ ${label} déjà appliqué`);
    return;
  }

  if (!content.includes(before)) {
    console.error(`❌ ${label}: motif source introuvable dans ${path.relative(projectRoot, filePath)}`);
    process.exit(1);
  }

  content = content.replace(before, after);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ ${label} appliqué`);
};

const homeAppPath = path.join(projectRoot, 'src', 'HomeApp.tsx');
const indexPath = path.join(projectRoot, 'index.html');
const syncPath = path.join(projectRoot, 'scripts', 'syncHomeStaticHero.mjs');

replaceOrVerify(
  homeAppPath,
  `                <h1 className="mt-5 mb-5 overflow-visible md:mb-6">\n                  <span className="block text-4xl font-bold leading-tight text-slate-100 sm:text-5xl lg:whitespace-nowrap lg:text-5xl">\n                    Analysez. Comparez.\n                  </span>\n                  <span className="mt-2 block bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text pb-1 text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">\n                    Investissez sur\n                  </span>\n                  <span className="block bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text pb-1 text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">\n                    MaximusSCPI.\n                  </span>\n                </h1>`,
  `                <h1 className="mt-4 mb-4 overflow-visible sm:mt-5 sm:mb-5 md:mb-6">\n                  <span className="block text-[clamp(1.9rem,5vw,3rem)] font-bold leading-[1.06] text-slate-100 lg:whitespace-nowrap lg:text-5xl">\n                    Analysez. Comparez.\n                  </span>\n                  <span className="mt-2 block whitespace-nowrap pb-1 text-[clamp(1.45rem,3.8vw,2.5rem)] font-bold leading-[1.08] text-slate-100 lg:text-5xl">\n                    Investissez sur <span className="text-emerald-400">MaximusSCPI.</span>\n                  </span>\n                </h1>`,
  'Hero React : Investissez sur en blanc, MaximusSCPI en vert'
);

replaceOrVerify(
  homeAppPath,
  `                <p className="max-w-xl text-lg font-semibold leading-relaxed text-slate-200 sm:text-xl">`,
  `                <p className="max-w-xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg">`,
  'Sous-titre React allégé'
);

replaceOrVerify(
  indexPath,
  `.initial-title-main{display:block;font-size:clamp(50px,5.4vw,72px);line-height:1;font-weight:800;color:#f1f5f9}`,
  `.initial-title-main{display:block;font-size:clamp(30px,5vw,48px);line-height:1.06;font-weight:800;color:#f1f5f9}`,
  'H1 statique principal redimensionné'
);

replaceOrVerify(
  indexPath,
  `.initial-title-accent{display:block;font-size:clamp(40px,4.5vw,60px);line-height:1.12;font-weight:800;color:#f9a8d4}`,
  `.initial-title-accent{display:block;white-space:nowrap;font-size:clamp(23px,3.8vw,48px);line-height:1.08;font-weight:800;color:#f1f5f9}\n        .initial-title-brand{color:#34d399}`,
  'H1 statique blanc avec accent de marque vert'
);

replaceOrVerify(
  indexPath,
  `.initial-lead{max-width:620px;font-size:18px;line-height:1.6;color:#cbd5e1;margin:0 0 28px}`,
  `.initial-lead{max-width:620px;font-size:clamp(16px,2vw,18px);line-height:1.6;font-weight:500;color:#cbd5e1;margin:0 0 28px}`,
  'Sous-titre statique allégé'
);

replaceOrVerify(
  syncPath,
  `const desiredBlock = \`<h1>\n                <span class="initial-title-main">Analysez. Comparez.</span>\n                <span class="initial-title-accent">Investissez sur</span>\n                <span class="initial-title-accent">MaximusSCPI.</span>\n              </h1>\`;`,
  `const desiredBlock = \`<h1>\n                <span class="initial-title-main">Analysez. Comparez.</span>\n                <span class="initial-title-accent">Investissez sur <span class="initial-title-brand">MaximusSCPI.</span></span>\n              </h1>\`;`,
  'H1 statique regroupé avec accent vert sur la marque'
);

replaceOrVerify(
  syncPath,
  `  !html.includes('<span class="initial-title-main">Analysez. Comparez.</span>') ||\n  !html.includes('<span class="initial-title-accent">Investissez sur</span>') ||\n  !html.includes('<span class="initial-title-accent">MaximusSCPI.</span>')`,
  `  !html.includes('<span class="initial-title-main">Analysez. Comparez.</span>') ||\n  !html.includes('<span class="initial-title-accent">Investissez sur <span class="initial-title-brand">MaximusSCPI.</span></span>')`,
  'Vérification H1 statique adaptée'
);

replaceOrVerify(
  syncPath,
  `console.log('✅ H1 statique de la home synchronisé avec HomeApp : Analysez. Comparez. / Investissez sur / MaximusSCPI.');`,
  `console.log('✅ H1 statique de la home synchronisé avec HomeApp : Analysez. Comparez. / Investissez sur (blanc) / MaximusSCPI. (vert)');`,
  'Journal H1 statique adapté'
);

console.log('✅ Patch visuel du hero de la home appliqué sans modification des textes.');
