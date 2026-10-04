import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');

const stripText = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const wordCount = (html) => stripText(html).split(' ').filter(Boolean).length;
const internalLinkCount = (html) => (html.match(/href=["']\//gi) || []).length;

const insertBeforeOuterSectionEnd = (html, content) => {
  const mainEnd = html.lastIndexOf('</main>');
  if (mainEnd === -1) throw new Error('fermeture </main> absente');
  const sectionEnd = html.lastIndexOf('</section>', mainEnd);
  if (sectionEnd === -1) throw new Error('section externe absente');
  return html.slice(0, sectionEnd) + content + html.slice(sectionEnd);
};

const comparatorExtra = `
<section id="comparator-seo-depth" style="margin-top:42px;border-top:1px solid #334155;padding-top:34px">
  <h2 style="font-size:26px;color:white;margin:0 0 14px">Quels critères regarder avant le rendement ?</h2>
  <p style="color:#cbd5e1;line-height:1.75;margin:0 0 16px">Un comparateur SCPI utile ne doit pas transformer le taux de distribution en classement automatique. Deux SCPI affichant un rendement proche peuvent présenter des profils très différents selon la qualité des actifs, l’occupation, la durée des baux, l’endettement, le niveau des frais, la valorisation des parts et la liquidité observée. MaximusSCPI affiche ces dimensions séparément pour éviter qu’un seul chiffre masque les autres risques.</p>
  <p style="color:#cbd5e1;line-height:1.75;margin:0 0 20px">La lecture peut commencer par le prix de souscription et la valeur de reconstitution, puis se poursuivre avec le TOF, le WALT, le WALB et l’endettement. La répartition sectorielle et géographique permet ensuite d’identifier les concentrations. Enfin, les données de retrait, la collecte et les éventuelles parts en attente apportent des éléments sur la liquidité, qui reste distincte de la qualité locative du patrimoine.</p>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin:24px 0 8px">
    <article style="border:1px solid #334155;border-radius:12px;padding:18px">
      <h3 style="color:white;margin:0 0 8px">Prix et valeur de reconstitution</h3>
      <p style="color:#94a3b8;line-height:1.65;margin:0">L’écart entre le prix de part et la valeur de reconstitution donne un repère de valorisation. Une décote n’est pas automatiquement une opportunité et une surcote n’est pas, seule, un motif d’exclusion.</p>
    </article>
    <article style="border:1px solid #334155;border-radius:12px;padding:18px">
      <h3 style="color:white;margin:0 0 8px">TOF, WALT et WALB</h3>
      <p style="color:#94a3b8;line-height:1.65;margin:0">Ces indicateurs décrivent l’occupation et la visibilité contractuelle des loyers. Ils doivent être lus dans le temps : une trajectoire qui se dégrade est souvent plus informative qu’un niveau isolé.</p>
    </article>
    <article style="border:1px solid #334155;border-radius:12px;padding:18px">
      <h3 style="color:white;margin:0 0 8px">Dette et collecte</h3>
      <p style="color:#94a3b8;line-height:1.65;margin:0">L’endettement peut soutenir l’investissement mais augmente l’exposition aux conditions de financement. La collecte, positive ou négative, doit être rapprochée des acquisitions, des cessions et du marché des parts.</p>
    </article>
    <article style="border:1px solid #334155;border-radius:12px;padding:18px">
      <h3 style="color:white;margin:0 0 8px">Liquidité des parts</h3>
      <p style="color:#94a3b8;line-height:1.65;margin:0">La revente n’est jamais garantie. Les délais, demandes de retrait et mécanismes de marché secondaire doivent être analysés séparément du rendement et du TOF.</p>
    </article>
  </div>

  <h2 style="font-size:24px;color:white;margin:36px 0 12px">Comparer selon votre objectif</h2>
  <p style="color:#cbd5e1;line-height:1.75;margin:0 0 14px">Le meilleur classement dépend du besoin étudié : recherche de revenus, diversification européenne, démembrement, préparation de la retraite ou arbitrage de liquidité. Le comparateur sert donc à filtrer et rapprocher les indicateurs, pas à désigner une SCPI universellement « meilleure ».</p>
  <ul style="color:#cbd5e1;line-height:1.75;padding-left:22px;margin:0 0 22px">
    <li>Pour projeter un revenu après hypothèses fiscales : <a href="/simulateur-revenus-nets-scpi/" style="color:#6ee7b7">simulateur de revenus nets SCPI</a>.</li>
    <li>Pour étudier une acquisition en nue-propriété : <a href="/comparateur-demembrement-scpi/" style="color:#6ee7b7">comparateur de démembrement SCPI</a>.</li>
    <li>Pour comprendre les délais de sortie : <a href="/articles/revendre-parts-scpi-delais-marche-secondaire/" style="color:#6ee7b7">guide sur la revente des parts</a>.</li>
    <li>Pour comparer les acteurs : <a href="/societes-de-gestion-scpi/" style="color:#6ee7b7">sociétés de gestion SCPI</a>.</li>
    <li>Pour approfondir fiscalité, risques et stratégies : <a href="/articles/" style="color:#6ee7b7">guides SCPI MaximusSCPI</a>.</li>
  </ul>
  <p style="color:#94a3b8;line-height:1.65;margin:0">Les données et analyses doivent être vérifiées avec les documents les plus récents. Consultez la <a href="/methodologie-donnees-scpi/" style="color:#6ee7b7">méthodologie des données SCPI</a> pour comprendre les sources, la fraîcheur et les limites des indicateurs.</p>
</section>`;

const simulatorExtra = `
<section id="simulator-seo-depth" style="margin-top:40px;border-top:1px solid #cbd5e1;padding-top:32px">
  <h2 style="font-size:26px;margin:0 0 14px">Pourquoi distinguer rendement brut et revenu net ?</h2>
  <p style="color:#475569;line-height:1.75;margin:0 0 16px">Le taux de distribution publié par une SCPI ne correspond pas directement au revenu réellement disponible pour l’investisseur. Le montant investi, le délai de jouissance, les hypothèses de distribution, la fiscalité et les frais modifient le résultat. Le simulateur sert à rendre ces hypothèses visibles et à comparer plusieurs scénarios sur une base homogène.</p>
  <p style="color:#475569;line-height:1.75;margin:0 0 20px">Une simulation reste toutefois une projection. Elle ne prévoit ni l’évolution du prix de la part, ni les distributions futures, ni le délai réel de revente. Pour cette raison, le revenu estimé doit être rapproché des indicateurs de la SCPI : TOF, valorisation, endettement, diversification, historique et liquidité.</p>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin:24px 0 30px">
    <article style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:18px"><h3 style="margin:0 0 8px">Hypothèse de distribution</h3><p style="color:#64748b;line-height:1.65;margin:0">Utilisez une hypothèse explicite et testez plusieurs niveaux plutôt qu’un seul rendement. Une distribution passée ne constitue pas une garantie future.</p></article>
    <article style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:18px"><h3 style="margin:0 0 8px">Fiscalité</h3><p style="color:#64748b;line-height:1.65;margin:0">Le traitement fiscal varie selon la situation, le mode de détention et l’origine des revenus. La simulation doit donc être considérée comme une estimation à confronter au cas patrimonial réel.</p></article>
    <article style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:18px"><h3 style="margin:0 0 8px">Première année</h3><p style="color:#64748b;line-height:1.65;margin:0">Le délai de jouissance peut réduire les distributions perçues après la souscription. Il faut l’intégrer pour éviter de comparer une première année incomplète à une année pleine.</p></article>
  </div>

  <h2 style="font-size:24px;margin:0 0 12px">Compléter la simulation par l’analyse de la SCPI</h2>
  <p style="color:#475569;line-height:1.75;margin:0 0 14px">Le revenu net n’est qu’un volet de la décision. Avant d’investir, comparez aussi la valorisation, les frais, le patrimoine, la dette, l’occupation et la liquidité. Pour une SCPI européenne, examinez également la provenance géographique des revenus et les règles fiscales applicables à votre situation.</p>
  <p style="line-height:1.75;margin:0"><a href="/comparateur-scpi/" style="color:#047857;font-weight:700">Comparer les SCPI</a> · <a href="/scpi-europeennes/" style="color:#047857;font-weight:700">Comprendre les SCPI européennes</a> · <a href="/comparateur-demembrement-scpi/" style="color:#047857;font-weight:700">Comparer le démembrement</a> · <a href="/articles/" style="color:#047857;font-weight:700">Guides SCPI</a> · <a href="/methodologie-donnees-scpi/" style="color:#047857;font-weight:700">Méthodologie</a></p>
</section>`;

const targets = [
  {
    slug: 'comparateur-scpi',
    marker: 'id="comparator-seo-depth"',
    extra: comparatorExtra,
    minWords: 600,
    minLinks: 7,
    replacements: [
      ['/methodologie-donnees/', '/methodologie-donnees-scpi/']
    ]
  },
  {
    slug: 'simulateur-revenus-nets-scpi',
    marker: 'id="simulator-seo-depth"',
    extra: simulatorExtra,
    minWords: 430,
    minLinks: 7,
    replacements: [
      ['Calculez vos revenus nets après impôts et prélèvements sociaux. Simulateur SCPI gratuit par CGP-CIF.', 'Estimez les revenus nets d’un investissement en SCPI selon montant, rendement, fiscalité et délai de jouissance. Simulation gratuite MaximusSCPI.']
    ]
  }
];

let enriched = 0;
for (const target of targets) {
  const file = path.join(distDir, target.slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Page prioritaire absente : /${target.slug}/`);
  let html = fs.readFileSync(file, 'utf-8');
  for (const [from, to] of target.replacements) html = html.split(from).join(to);
  if (!html.includes(target.marker)) html = insertBeforeOuterSectionEnd(html, target.extra);
  fs.writeFileSync(file, html, 'utf-8');

  const words = wordCount(html);
  const links = internalLinkCount(html);
  const canonical = `https://maximusscpi.com/${target.slug}/`;
  const problems = [];
  if (words < target.minWords) problems.push(`${words} mots < ${target.minWords}`);
  if (links < target.minLinks) problems.push(`${links} liens internes < ${target.minLinks}`);
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) problems.push('canonical non self');
  if (problems.length) throw new Error(`QA /${target.slug}/ : ${problems.join(' ; ')}`);
  console.log(`✅ /${target.slug}/ : ${words} mots, ${links} liens internes`);
  enriched++;
}

console.log(`✅ Landing pages haute intention enrichies : ${enriched}/${targets.length}`);
