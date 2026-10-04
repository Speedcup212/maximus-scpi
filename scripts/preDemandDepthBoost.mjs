import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');

const additions = {
  'scpi-ifi': 'Pour fiabiliser une déclaration, il faut également conserver une trace de la valeur communiquée pour l’année concernée et identifier précisément le véhicule détenu. Une variation du prix de part, de la composition du patrimoine ou du mode de détention peut modifier l’analyse d’une année à l’autre. Les données historiques servent à comprendre la trajectoire, mais la déclaration doit toujours s’appuyer sur les informations fiscales et patrimoniales applicables à la période déclarée.',
  'societes-de-gestion-scpi': 'La comparaison gagne aussi à intégrer la stabilité des équipes, la lisibilité des décisions de gestion et la cohérence entre collecte et capacité réelle à investir. Une forte collecte n’est pas automatiquement positive si elle conduit à acheter trop vite, tandis qu’une collecte faible peut devenir problématique lorsque les demandes de retrait progressent. Ces éléments doivent être lus avec les données propres à chaque SCPI.',
  'scpi-sci-is-fiscalite': 'La qualité du scénario dépend enfin des hypothèses de durée de détention, de financement et de distribution des résultats. Une structure pertinente à court terme peut produire un résultat différent lors d’une cession ou d’une remontée de trésorerie vers les associés. Le coût de fonctionnement de la SCI et les conséquences d’une sortie doivent donc être intégrés dès la comparaison initiale, et pas ajoutés après coup.',
  'risques-scpi': 'La diversification réduit certaines concentrations mais ne supprime pas le risque immobilier. Plusieurs SCPI peuvent être exposées aux mêmes secteurs, aux mêmes zones économiques ou au même cycle de taux. Il faut donc regarder les corrélations réelles entre patrimoines, gestionnaires et sources de revenus, puis conserver une part du patrimoine sur des supports plus liquides lorsque l’horizon ou les besoins de trésorerie l’exigent.',
  'orias-scpi': 'La vérification doit être faite sur l’identité exacte du professionnel et la catégorie d’immatriculation pertinente pour la prestation proposée. Elle peut utilement être complétée par les mentions légales, les documents précontractuels et les informations relatives aux éventuels conflits d’intérêts ou rémunérations. L’objectif est de vérifier le cadre de l’intervention avant d’examiner séparément l’adéquation et les risques du placement.',
  'scpi-commerce': 'Le type de commerce compte également : pied d’immeuble, retail park, centre commercial ou commerce essentiel ne réagissent pas de la même manière aux cycles économiques et à la concurrence du commerce en ligne. La granularité des actifs et des locataires peut réduire certaines concentrations. Les acquisitions récentes doivent enfin être confrontées au niveau des taux de rendement immobiliers et aux besoins futurs de travaux.',
  'scpi-retraite': 'La phase de décumulation doit être anticipée avant la retraite. Si une partie du capital doit être récupérée à une date précise, la SCPI n’est pas un substitut à une poche liquide, car le délai de vente n’est pas garanti. Il faut aussi tester un scénario de baisse temporaire des distributions afin de vérifier que le budget reste soutenable sans vendre des parts dans de mauvaises conditions de marché.'
};

let changed = 0;
for (const [slug, text] of Object.entries(additions)) {
  const file = path.join(distDir, slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<p[^>]*data-pre-demand-depth[^>]*>[\s\S]*?<\/p>/i, '');
  html = html.replace('</main>', `<p data-pre-demand-depth="true" style="max-width:1000px;margin:18px auto;padding:0 22px;line-height:1.7">${text}</p></main>`);
  fs.writeFileSync(file, html, 'utf8');
  changed += 1;
}

console.log(`✅ Profondeur pré-QA renforcée : ${changed}/${Object.keys(additions).length} pages.`);
