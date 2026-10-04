import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.join(__dirname, '../dist');

const targets = {
  'index.html': 'Pour comparer utilement deux SCPI, il faut enfin regarder la cohérence entre rendement, occupation, valorisation, dette, collecte et liquidité. MaximusSCPI privilégie cette lecture multicritère et l’évolution dans le temps plutôt qu’un classement fondé sur un seul taux de distribution.',
  'paref-evo/index.html': 'La lecture de Paref Evo doit donc être complétée par les derniers bulletins de la société de gestion, notamment l’évolution de l’occupation, des valeurs immobilières, de l’endettement et des éventuelles demandes de retrait. Ces données permettent de distinguer un niveau ponctuel d’une tendance durable.',
  'societe-gestion/alderan/index.html': 'L’analyse du gestionnaire doit être rapprochée de la trajectoire de chacune de ses SCPI : collecte, rythme d’investissement, taux d’occupation, valeurs immobilières et liquidité peuvent évoluer différemment d’un véhicule à l’autre.',
  'societe-gestion/euryale-am/index.html': 'Pour apprécier le gestionnaire, il faut aussi comparer dans le temps les indicateurs de ses différentes SCPI : collecte, occupation, diversification, valorisation, dette et liquidité ne se lisent pas uniquement au niveau de la société de gestion.'
};

let changed = 0;
for (const [relative, text] of Object.entries(targets)) {
  const file = path.join(dist, relative);
  if (!fs.existsSync(file)) throw new Error(`Page cible absente : ${relative}`);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<p[^>]*data-final-crawler-depth[^>]*>[\s\S]*?<\/p>/i, '');
  const block = `<p data-final-crawler-depth="true" style="max-width:1000px;margin:18px auto;padding:0 24px;line-height:1.7">${text}</p>`;
  const mainClose = html.lastIndexOf('</main>');
  if (mainClose !== -1) html = html.slice(0, mainClose) + block + html.slice(mainClose);
  else html = html.replace('</body>', `${block}</body>`);
  fs.writeFileSync(file, html, 'utf8');
  changed += 1;
}

console.log(`✅ Profondeur crawler finale renforcée : ${changed}/${Object.keys(targets).length} pages.`);
