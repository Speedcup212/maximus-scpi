import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sourcePath = path.join(distDir, 'index.html');
const targetDir = path.join(distDir, 'comprendre-les-scpi');
const targetPath = path.join(targetDir, 'index.html');
const url = 'https://maximusscpi.com/comprendre-les-scpi/';

if (!fs.existsSync(sourcePath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder la génération.');
  process.exit(1);
}

let html = fs.readFileSync(sourcePath, 'utf-8');
const title = 'Comprendre les SCPI : fonctionnement, rendement et risques | MaximusSCPI';
const description = 'Guide pour comprendre les SCPI : fonctionnement, rendement, frais, fiscalité, liquidité, valorisation, endettement et risques avant d’investir.';

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const replaceOrInsert = (source, pattern, replacement) =>
  pattern.test(source) ? source.replace(pattern, replacement) : source.replace('</head>', `    ${replacement}\n  </head>`);

html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(description)}" />`);
html = replaceOrInsert(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
html = replaceOrInsert(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i, `<link rel="alternate" hreflang="fr" href="${url}" />`);

for (const [property, value] of [
  ['og:url', url], ['og:title', title], ['og:description', description],
  ['twitter:url', url], ['twitter:title', title], ['twitter:description', description]
]) {
  html = replaceOrInsert(
    html,
    new RegExp(`<meta\\s+property=["']${property.replace(':', '\\:')}["'][^>]*>`, 'i'),
    `<meta property="${property}" content="${esc(value)}" />`
  );
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Comprendre les SCPI',
      description,
      url,
      inLanguage: 'fr-FR',
      author: { '@type': 'Person', name: 'Eric Bellaiche' },
      publisher: { '@type': 'Organization', name: 'MaximusSCPI', url: 'https://maximusscpi.com/' }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maximusscpi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Comprendre les SCPI', item: url }
      ]
    }
  ]
};
html = html.replace('</head>', `    <script id="comprendre-static-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n  </head>`);

const staticRoot = `<div id="root">
  <main class="learn-shell">
    <header class="learn-header">
      <a href="/" aria-label="Accueil MaximusSCPI"><img src="/Maximus logo 250x50 4.svg" width="250" height="50" alt="MaximusSCPI" /></a>
      <nav><a href="/comparateur-scpi/">Comparateur</a><a href="/simulateurs/">Simulateurs</a><a href="/articles/">Articles</a></nav>
    </header>
    <section class="learn-main">
      <nav class="learn-crumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span>›</span><span>Comprendre les SCPI</span></nav>
      <p class="learn-kicker">Guide SCPI 2026</p>
      <h1>Comprendre les SCPI</h1>
      <p class="learn-lead">Une SCPI permet d’investir indirectement dans un portefeuille immobilier géré. Pour l’analyser correctement, il faut regarder ensemble rendement, occupation, valorisation, dette, frais, fiscalité et liquidité.</p>

      <section class="learn-grid">
        <article><h2>Comment fonctionne une SCPI ?</h2><p>Les associés détiennent des parts d’une société qui acquiert et gère des actifs immobiliers. Les revenus distribués dépendent des loyers, des charges, des décisions de gestion et de la situation du patrimoine.</p></article>
        <article><h2>Rendement et occupation</h2><p>Le taux de distribution est un indicateur passé. Le TOF, la qualité des locataires, les échéances de baux et les impayés permettent d’évaluer la solidité des revenus.</p></article>
        <article><h2>Valeur des parts</h2><p>Prix de souscription, valeur de retrait, valeur de réalisation et valeur de reconstitution répondent à des logiques différentes. Leur trajectoire compte davantage qu’un chiffre isolé.</p></article>
        <article><h2>Liquidité</h2><p>La revente n’est pas garantie. Selon le type de capital et la situation de la SCPI, la sortie peut passer par une demande de retrait, un marché secondaire ou une cession de gré à gré.</p></article>
        <article><h2>Endettement et risques</h2><p>L’effet de levier peut accroître la sensibilité aux taux, aux refinancements et à la baisse des valeurs. Une SCPI reste un placement immobilier avec risque de perte en capital.</p></article>
        <article><h2>Fiscalité et frais</h2><p>La fiscalité dépend de la provenance des revenus et du mode de détention. Les frais de souscription, gestion, acquisition, cession ou retrait doivent être lus avec l’horizon de placement.</p></article>
      </section>

      <section class="learn-next">
        <h2>Passer de la théorie à l’analyse</h2>
        <p>MaximusSCPI met ces critères en regard dans les fiches, la trajectoire historique, le radar et le comparateur.</p>
        <div><a href="/comparateur-scpi/">Comparer les SCPI</a><a href="/methodologie-donnees-scpi/">Voir la méthodologie</a><a href="/avertissements-risques-scpi/">Comprendre les risques</a></div>
      </section>
    </section>
  </main>
  <style>
    .learn-shell{min-height:100vh;background:#0D1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.learn-header{height:64px;max-width:1280px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;background:#111827}.learn-header img{width:205px;height:auto}.learn-header nav{display:flex;gap:20px}.learn-header a{color:#e5e7eb;text-decoration:none;font-size:14px;font-weight:650}.learn-main{max-width:1120px;margin:0 auto;padding:46px 24px 72px}.learn-crumb{display:flex;gap:8px;color:#94a3b8;font-size:13px;margin-bottom:42px}.learn-crumb a,.learn-next a{color:#6ee7b7;text-decoration:none}.learn-kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.learn-main h1{color:#fff;font-size:clamp(42px,5vw,64px);line-height:1.05;letter-spacing:-.035em;margin:12px 0 20px}.learn-lead{max-width:900px;color:#cbd5e1;font-size:19px;line-height:1.65;margin:0 0 36px}.learn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.learn-grid article{border:1px solid #263244;border-radius:14px;background:#121a25;padding:22px}.learn-grid h2,.learn-next h2{color:#fff;font-size:20px;margin:0 0 10px}.learn-grid p,.learn-next p{color:#aebbd0;line-height:1.7;margin:0}.learn-next{margin-top:28px;border:1px solid #065f46;border-radius:14px;background:#052e2b;padding:24px}.learn-next div{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px}.learn-next a{font-weight:700}@media(max-width:760px){.learn-header nav{display:none}.learn-grid{grid-template-columns:1fr}.learn-main h1{font-size:42px}}
  </style>
</div>`;

const rootStart = html.indexOf('<div id="root">');
if (rootStart < 0) throw new Error('#root introuvable');
const rootOpenEnd = html.indexOf('>', rootStart);
const divRegex = /<\/?div\b[^>]*>/g;
divRegex.lastIndex = rootOpenEnd + 1;
let depth = 1;
let rootEnd = -1;
let match;
while ((match = divRegex.exec(html)) !== null) {
  depth += match[0].startsWith('</') ? -1 : 1;
  if (depth === 0) { rootEnd = divRegex.lastIndex; break; }
}
if (rootEnd < 0) throw new Error('fermeture #root introuvable');
html = html.slice(0, rootStart) + staticRoot + html.slice(rootEnd);

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, html, 'utf-8');
console.log('✅ Page statique SEO /comprendre-les-scpi/ générée avec H1, contenu et schema.');
