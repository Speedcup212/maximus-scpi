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

const title = 'Comparateur SCPI 2026 : rendement, TOF, frais et risques';
const description = 'Comparez les SCPI selon taux de distribution, TOF, frais, capitalisation, décote, endettement, secteurs, géographie et liquidité observée.';
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

const staticRoot = `<div id="root">
  <main style="min-height:100vh;background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif">
    <section style="max-width:1100px;margin:0 auto;padding:48px 24px">
      <h1 style="font-size:32px;line-height:1.2;margin:0 0 12px;font-weight:800;color:white">Comparateur SCPI 2026</h1>
      <p style="max-width:850px;color:#94a3b8;line-height:1.7;margin:0 0 32px">Comparez les SCPI selon leurs principaux indicateurs : taux de distribution, frais, TOF, capitalisation, valeur de reconstitution, décote ou surcote, endettement, secteurs, géographie et liquidité observée.</p>

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

      <section style="margin-top:36px;padding:20px;border:1px solid #065f46;border-radius:12px;background:#052e2b">
        <h2 style="font-size:22px;color:white;margin:0 0 10px">Méthodologie MaximusSCPI</h2>
        <p style="color:#cbd5e1;line-height:1.7">Les données sont consolidées à partir des documents publics des sociétés de gestion. La note MaximusSCPI et le radar de sélection sont des indicateurs propriétaires multicritères ; ils ne constituent ni une notation réglementaire, ni une garantie de performance ou de liquidité.</p>
        <p style="margin-top:12px"><a href="/methodologie-donnees/" style="color:#34d399">Voir la méthodologie des données</a> · <a href="/articles/revendre-parts-scpi-delais-marche-secondaire/" style="color:#34d399">Comprendre la revente des parts</a></p>
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
