import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sourcePath = path.join(distDir, 'index.html');
const targetDir = path.join(distDir, 'comparateur-scpi');
const targetPath = path.join(targetDir, 'index.html');

if (!fs.existsSync(sourcePath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder la génération du comparateur statique.');
  process.exit(1);
}

let html = fs.readFileSync(sourcePath, 'utf-8');

const cohort = JSON.parse(fs.readFileSync(path.join(__dirname,'../src/data/certified_scpi_cohort.json'),'utf8'));
const scpiCount=cohort.count;
if(![61,65].includes(scpiCount)||cohort.slugs.length!==scpiCount)
  throw Error('Invalid published SCPI cohort in comparator HTML');
const title = 'Comparateur SCPI 2026 : rendement et risques | MaximusSCPI';
const description = 'Comparateur SCPI : confrontez rendement, frais, valeur de reconstitution, TOF, dette et liquidité. Historique, Radar et Trajectoire sourcés.';
const url = 'https://maximusscpi.com/comparateur-scpi/';

html = html
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
  .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
  .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
  .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
  .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
  .replace(/<meta property="twitter:url" content="[^"]*"\s*\/>/, `<meta property="twitter:url" content="${url}" />`)
  .replace(/<meta property="twitter:title" content="[^"]*"\s*\/>/, `<meta property="twitter:title" content="${title}" />`)
  .replace(/<meta property="twitter:description" content="[^"]*"\s*\/>/, `<meta property="twitter:description" content="${description}" />`);

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Comparateur SCPI MaximusSCPI',
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Comment comparer deux SCPI ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Comparez le taux de distribution, le prix de part, la valeur de reconstitution, le TOF, l’endettement, les frais, la capitalisation, les secteurs, la géographie, les baux et la liquidité du marché des parts.'
          }
        },
        {
          '@type': 'Question',
          name: 'Le rendement suffit-il pour choisir une SCPI ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Non. Le taux de distribution est historique et ne garantit pas les distributions futures. Il doit être analysé avec la valorisation, l’occupation locative, les frais, la dette, la qualité des actifs et la liquidité.'
          }
        },
        {
          '@type': 'Question',
          name: 'Comment évaluer la liquidité d’une SCPI ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'La liquidité des parts est distincte du TOF. Elle dépend notamment du marché des parts, des demandes de retrait, de la collecte et du mode de fonctionnement de la SCPI. Elle n’est jamais garantie.'
          }
        }
      ]
    }
  ]
};

html = html.replace(
  '</head>',
  `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`
);

const priorityScpiLinks = [
  ['comete', 'Comète'],
  ['iroko-zen', 'Iroko Zen'],
  ['transitions-europe', 'Transitions Europe'],
  ['remake-live', 'Remake Live'],
];
const certifiedScpi = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/certified_scpi_cohort.json'), 'utf8'
));
const certifiedSlugs = new Set(certifiedScpi.slugs || []);
for (const [slug] of priorityScpiLinks) {
  if (!certifiedSlugs.has(slug)) {
    throw new Error('Lien de comparaison non certifié : ' + slug);
  }
}
const priorityScpiHtml = priorityScpiLinks
  .map(([slug, label]) => '<a href="/' + slug + '/" style="color:#6ee7b7">' + label + '</a>')
  .join(' · ');

const staticRoot = `<div id="root">
  <main style="min-height:100vh;background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif">
    <section style="max-width:1100px;margin:0 auto;padding:48px 24px">
      <h1 style="font-size:32px;line-height:1.2;margin:0 0 12px;font-weight:800;color:white">Comparateur SCPI 2026 : comparez ${scpiCount} SCPI</h1>
      <p style="max-width:850px;color:#94a3b8;line-height:1.7;margin:0 0 32px">Comparez ${scpiCount} SCPI sur des indicateurs documentés : distribution, frais, TOF, prix et valeur de reconstitution, dette, diversification et liquidité. Examinez ensuite le Radar, l’Historique, la Trajectoire et la Surveillance sur les fiches, sans réduire la sélection au rendement.</p>

      <section style="margin-top:36px">
        <h2 style="font-size:24px;color:white;margin-bottom:12px">Comment comparer des SCPI ?</h2>
        <p style="color:#cbd5e1;line-height:1.75">Le taux de distribution ne suffit pas. Une comparaison robuste associe rendement historique, prix de part, valeur de reconstitution, occupation locative, WALT et WALB, endettement, frais, capitalisation, diversification et marché des parts.</p>
      </section>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:28px">
        <article style="border:1px solid #334155;border-radius:12px;padding:18px"><h3 style="color:white;margin:0 0 8px">Rendement</h3><p style="color:#94a3b8;line-height:1.6">Le taux de distribution est une donnée historique. Il doit être comparé à la qualité du patrimoine et aux risques.</p></article>
        <article style="border:1px solid #334155;border-radius:12px;padding:18px"><h3 style="color:white;margin:0 0 8px">Valorisation</h3><p style="color:#94a3b8;line-height:1.6">Le prix de souscription et la valeur de reconstitution permettent d’identifier une décote ou une surcote.</p></article>
        <article style="border:1px solid #334155;border-radius:12px;padding:18px"><h3 style="color:white;margin:0 0 8px">Occupation et baux</h3><p style="color:#94a3b8;line-height:1.6">TOF, WALT et WALB renseignent sur l’occupation et la durée des engagements locatifs, pas sur la liquidité des parts.</p></article>
        <article style="border:1px solid #334155;border-radius:12px;padding:18px"><h3 style="color:white;margin:0 0 8px">Liquidité</h3><p style="color:#94a3b8;line-height:1.6">La liquidité dépend du marché des parts, des demandes de retrait, de la collecte et du type de SCPI. Elle n’est pas garantie.</p></article>
        <article style="border:1px solid #334155;border-radius:12px;padding:18px"><h3 style="color:white;margin:0 0 8px">Endettement</h3><p style="color:#94a3b8;line-height:1.6">L’endettement peut amplifier les résultats comme les risques et doit être lu avec la qualité des actifs et les échéances.</p></article>
        <article style="border:1px solid #334155;border-radius:12px;padding:18px"><h3 style="color:white;margin:0 0 8px">Diversification</h3><p style="color:#94a3b8;line-height:1.6">Secteurs, pays, sociétés de gestion et locataires doivent être analysés ensemble pour apprécier les concentrations.</p></article>
      </section>

      <section id="comparateur-analyse-360" style="margin-top:36px;padding:22px;border:1px solid #334155;border-radius:12px;background:#111c2d">
        <h2 style="font-size:22px;color:white;margin:0 0 12px">Comment passer du comparateur à une décision documentée ?</h2>
        <p style="color:#cbd5e1;line-height:1.75">Le comparateur répond à la première question : quelles SCPI sont comparables sur un même indicateur et une même période ? Les outils MaximusSCPI prolongent l'examen sans attribuer une note réglementaire ni prévoir un rendement.</p>
        <ol style="color:#cbd5e1;line-height:1.85;padding-left:24px">
          <li><strong>Historique :</strong> replacer distribution, prix de part, valorisation et occupation sur des périodes identifiées, sans mélanger TD et ancien TDVM.</li>
          <li><strong>Radar :</strong> confronter plusieurs dimensions de qualité et de risque sur la fiche ; une note ne dispense pas de lire ses critères et ses limites.</li>
          <li><strong>Trajectoire :</strong> repérer les changements de tendance documentés et les ruptures de comparabilité.</li>
          <li><strong>Surveillance :</strong> contrôler l'évolution du TOF, de la dette, des valeurs et des mécanismes de retrait ; l'absence de signal n'est pas une garantie.</li>
        </ol>
        <p style="color:#cbd5e1;line-height:1.75">Exemple de méthode : face à deux distributions proches, examiner d'abord l'écart entre prix de souscription et valeur de reconstitution, puis la qualité locative et le régime de liquidité. Une donnée manquante demeure « non publiée », jamais assimilée à zéro.</p>
        <nav aria-label="Poursuivre l'analyse multicritère" style="line-height:2;margin-top:10px"><a href="/analyses/" style="color:#6ee7b7">Ouvrir les analyses et trajectoires</a> · <a href="/surveillance/" style="color:#6ee7b7">Surveiller les signaux</a> · <a href="/methodologie-donnees-scpi/" style="color:#6ee7b7">Lire les règles de calcul</a></nav>
      </section>

      <section style="margin-top:36px;padding:20px;border:1px solid #065f46;border-radius:12px;background:#052e2b">
        <h2 style="font-size:22px;color:white;margin:0 0 10px">Méthodologie MaximusSCPI</h2>
        <p style="color:#cbd5e1;line-height:1.7">Les données sont consolidées à partir des documents publics des sociétés de gestion. La note MaximusSCPI et le radar de sélection sont des indicateurs propriétaires multicritères ; ils ne constituent ni une notation réglementaire, ni une garantie de performance ou de liquidité.</p>
        <p style="margin-top:12px"><a href="/methodologie-donnees-scpi/" style="color:#34d399">Voir la méthodologie des données</a> · <a href="/articles/revendre-parts-scpi-delais-marche-secondaire/" style="color:#34d399">Comprendre la revente des parts</a></p>
      </section>
      <section id="comparator-related-scpi" aria-label="Fiches SCPI à approfondir" style="margin-top:38px;padding:20px;border:1px solid #334155;border-radius:12px">
        <h2 style="font-size:22px;color:white;margin:0 0 10px">Approfondir les SCPI à comparer</h2>
        <p style="color:#cbd5e1;line-height:1.7">Consultez les fiches des SCPI suivies, puis confrontez leurs indicateurs et leurs risques dans le comparateur. Les performances passées et la liquidité ne sont pas garanties.</p>
        <nav aria-label="Fiches SCPI" style="line-height:2.1;margin-top:12px">${priorityScpiHtml}</nav>
        <p style="line-height:1.9;margin-top:12px"><a href="/simulateur-revenus-nets-scpi/" style="color:#6ee7b7">Simuler les revenus nets</a> · <a href="/articles/scpi-ou-etf-immobilier/" style="color:#6ee7b7">SCPI ou ETF immobilier</a></p>
      </section>
    </section>
  </main>
</div>`;

const rootStart = html.indexOf('<div id="root">');
if (rootStart === -1) {
  console.error('❌ Impossible de repérer #root dans dist/index.html.');
  process.exit(1);
}

// Trouver la fermeture réelle de #root en tenant compte des <div> imbriqués.
// Le script Vite peut être injecté dans <head>, donc on ne dépend pas de sa position.
const rootOpenEnd = html.indexOf('>', rootStart);
const divRegex = /<\/?div\b[^>]*>/g;
divRegex.lastIndex = rootOpenEnd + 1;
let depth = 1;
let rootEnd = -1;
let match;

while ((match = divRegex.exec(html)) !== null) {
  if (match[0].startsWith('</')) depth -= 1;
  else depth += 1;

  if (depth === 0) {
    rootEnd = divRegex.lastIndex;
    break;
  }
}

if (rootEnd === -1) {
  console.error('❌ Impossible de repérer la fermeture de #root dans dist/index.html.');
  process.exit(1);
}

html = html.slice(0, rootStart) + staticRoot + html.slice(rootEnd);

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, html, 'utf-8');
console.log('✅ Page statique SEO générée : /comparateur-scpi/');
