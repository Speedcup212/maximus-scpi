import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const operations = [];
const replaceOrVerify = (filePath, before, after, label) => {
  operations.push({filePath, before, after, label});
};

const removeOrVerify = (filePath, target, label) => {
  operations.push({filePath, before: target, after: '', label, optional: true});
};

const homeAppPath = path.join(projectRoot, 'src', 'HomeApp.tsx');
const indexPath = path.join(projectRoot, 'index.html');

replaceOrVerify(homeAppPath,`                <h1 className="mt-5 mb-5 overflow-visible md:mb-6">\n                  <span className="block text-4xl font-bold leading-tight text-slate-100 sm:text-5xl lg:whitespace-nowrap lg:text-5xl">\n                    Analysez. Comparez.\n                  </span>\n                  <span className="mt-2 block bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text pb-1 text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">\n                    Investissez sur\n                  </span>\n                  <span className="block bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text pb-1 text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">\n                    MaximusSCPI.\n                  </span>\n                </h1>`,`                <h1 className="mt-4 mb-4 overflow-visible sm:mt-5 sm:mb-5 md:mb-6">\n                  <span className="block text-[clamp(2rem,4.1vw,3rem)] font-bold leading-[1.12] text-slate-100">\n                    Analysez et comparez\n                  </span>\n                  <span className="mt-2 block text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-[1.14] text-slate-100">\n                    les <span className="text-emerald-400">SCPI</span> avant d'investir.\n                  </span>\n                </h1>`,'Hero React : positionnement analyse et comparaison');
replaceOrVerify(homeAppPath,`                <p className="max-w-xl text-lg font-semibold leading-relaxed text-slate-200 sm:text-xl">`,`                <p className="max-w-xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg">`,'Sous-titre React allégé');
replaceOrVerify(homeAppPath,`              <div className="relative mx-auto min-h-[550px] w-full max-w-2xl lg:mx-0">`,`              <div className="relative mx-auto min-h-[560px] w-full max-w-2xl sm:min-h-[590px] lg:mx-0 lg:min-h-[620px] lg:w-[116%] lg:max-w-none lg:-translate-x-8">`,'Zone visuelle droite agrandie et recentrée');
replaceOrVerify(homeAppPath,`                <div className="absolute left-0 top-6 z-10 w-[60%] overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-800 shadow-2xl shadow-black/30">`,`                <div className="absolute left-0 top-5 z-10 w-[64%] overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-800 shadow-2xl shadow-black/30">`,'Carte comparateur agrandie et légèrement descendue');
replaceOrVerify(homeAppPath,`                <div className="absolute right-0 top-20 z-20 w-[47%] rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/30">`,`                <div className="absolute right-4 top-14 z-20 w-[49%] rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30">`,'Carte analyse agrandie et rapprochée du centre');
replaceOrVerify(homeAppPath,`                <div className="absolute bottom-10 left-3 z-10 w-[57%] rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/30">`,`                <div className="absolute bottom-14 left-4 z-10 w-[61%] rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30">`,'Carte évolution agrandie et remontée');
replaceOrVerify(homeAppPath,`                <div className="absolute bottom-0 right-1 z-20 w-[42%] rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/30">`,`                <div className="absolute bottom-6 right-4 z-20 w-[45%] rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30">`,'Carte simulateurs agrandie et rapprochée du centre');
removeOrVerify(homeAppPath,`\n                <p className="absolute -bottom-7 left-3 text-[10px] text-slate-500">\n                  Aperçus construits à partir des composants et données du site.\n                </p>`,'Mention sous les visuels supprimée');
replaceOrVerify(homeAppPath,`              <div className="relative mx-auto min-h-[560px] w-full max-w-2xl sm:min-h-[590px] lg:mx-0 lg:min-h-[620px] lg:w-[116%] lg:max-w-none lg:-translate-x-8">`,`              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 rounded-3xl border border-slate-700/60 bg-slate-900/35 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm lg:mx-0 lg:w-[116%] lg:max-w-none lg:-translate-x-6 lg:grid-cols-12 lg:gap-4 lg:p-5">`,'Bloc outils transformé en dashboard unifié');
replaceOrVerify(homeAppPath,`                <div className="absolute left-0 top-5 z-10 w-[64%] overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-800 shadow-2xl shadow-black/30">`,`                <div className="relative h-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/95 shadow-xl shadow-black/20 lg:col-span-7">`,'Comparateur intégré à la grille');
replaceOrVerify(homeAppPath,`                <div className="absolute right-4 top-14 z-20 w-[49%] rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30">`,`                <div className="relative h-full rounded-2xl border border-slate-700 bg-slate-800/95 p-5 shadow-xl shadow-black/20 lg:col-span-5">`,'Analyse intégrée à la grille');
replaceOrVerify(homeAppPath,`                <div className="absolute bottom-14 left-4 z-10 w-[61%] rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30">`,`                <div className="relative h-full rounded-2xl border border-slate-700 bg-slate-800/95 p-5 shadow-xl shadow-black/20 lg:col-span-7">`,'Évolution intégrée à la grille');
replaceOrVerify(homeAppPath,`                <div className="absolute bottom-6 right-4 z-20 w-[45%] rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30">`,`                <div className="relative h-full rounded-2xl border border-slate-700 bg-slate-800/95 p-5 shadow-xl shadow-black/20 lg:col-span-5">`,'Simulateurs intégrés à la grille');
replaceOrVerify(homeAppPath,`              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 rounded-3xl border border-slate-700/60 bg-slate-900/35 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm lg:mx-0 lg:w-[116%] lg:max-w-none lg:-translate-x-6 lg:grid-cols-12 lg:gap-4 lg:p-5">`,`              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 rounded-3xl border border-slate-700/60 bg-slate-900/35 p-3 shadow-2xl shadow-black/20 backdrop-blur-sm lg:mx-0 lg:w-[128%] lg:max-w-none lg:-translate-x-8 lg:-translate-y-2.5 lg:grid-cols-12 lg:gap-3 lg:p-3.5">`,'Dashboard agrandi de 10 %, densifié et remonté');
replaceOrVerify(homeAppPath,`              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 rounded-3xl border border-slate-700/60 bg-slate-900/35 p-3 shadow-2xl shadow-black/20 backdrop-blur-sm lg:mx-0 lg:w-[128%] lg:max-w-none lg:-translate-x-8 lg:-translate-y-2.5 lg:grid-cols-12 lg:gap-3 lg:p-3.5">`,`              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 lg:mx-0 lg:w-[128%] lg:max-w-none lg:-translate-x-8 lg:-translate-y-2.5 lg:grid-cols-12 lg:gap-3">`,'Cadre extérieur du dashboard supprimé');
replaceOrVerify(indexPath,`.initial-title-main{display:block;font-size:clamp(50px,5.4vw,72px);line-height:1;font-weight:800;color:#f1f5f9}`,`.initial-title-main{display:block;font-size:clamp(29px,4.4vw,46px);line-height:1.12;font-weight:800;color:#f1f5f9}`,'H1 statique principal redimensionné');
replaceOrVerify(indexPath,`.initial-title-accent{display:block;font-size:clamp(40px,4.5vw,60px);line-height:1.12;font-weight:800;color:#f9a8d4}`,`.initial-title-accent{display:block;font-size:clamp(27px,3.8vw,42px);line-height:1.14;font-weight:800;color:#f1f5f9}\n        .initial-title-brand{color:#34d399}`,'H1 statique blanc avec accent de marque vert');
replaceOrVerify(indexPath,`.initial-lead{max-width:620px;font-size:18px;line-height:1.6;color:#cbd5e1;margin:0 0 28px}`,`.initial-lead{max-width:620px;font-size:clamp(16px,2vw,18px);line-height:1.6;font-weight:500;color:#cbd5e1;margin:0 0 28px}`,'Sous-titre statique allégé');
// Validate the complete chain before writing; repeated builds must recognize
// terminal states instead of demanding an intermediate layout already replaced.
const contents = new Map();
for (const [index, op] of operations.entries()) {
  let content = contents.get(op.filePath) ?? fs.readFileSync(op.filePath, 'utf8');
  let terminal = op.after;
  for (const later of operations.slice(index + 1)) {
    if (later.filePath === op.filePath && terminal === later.before) terminal = later.after;
  }
  if (content.includes(op.before)) content = content.replaceAll(op.before, op.after);
  else if (!op.optional && !content.includes(op.after) && !content.includes(terminal)) {
    throw new Error(`${op.label}: motif source ou résultat final introuvable dans ${path.relative(projectRoot, op.filePath)}`);
  }
  contents.set(op.filePath, content);
}
for (const [file, content] of contents) fs.writeFileSync(file, content, 'utf8');
console.log('✅ Patch visuel du hero de la home vérifié (positionnement analyse et comparaison).');
