import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sourcePath = path.join(distDir, 'index.html');
const targetDir = path.join(distDir, 'simulateur-revenus-nets-scpi');
const targetPath = path.join(targetDir, 'index.html');

if (!fs.existsSync(sourcePath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder la génération du simulateur statique.');
  process.exit(1);
}

let html = fs.readFileSync(sourcePath, 'utf-8');

const title = 'Simulateur SCPI 2026 : revenus nets après impôts | MaximusSCPI';
const description = 'Simulez gratuitement vos revenus SCPI nets après fiscalité, frais et délai de jouissance. Estimation mensuelle et annuelle selon vos hypothèses.';
const url = 'https://maximusscpi.com/simulateur-revenus-nets-scpi/';

const replaceOrInsert = (source, pattern, replacement) => {
  if (pattern.test(source)) return source.replace(pattern, replacement);
  return source.replace('</head>', `    ${replacement}\n  </head>`);
};

html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}" />`);
html = replaceOrInsert(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
html = replaceOrInsert(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i, `<link rel="alternate" hreflang="fr" href="${url}" />`);
html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${url}" />`);
html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`);
html = replaceOrInsert(html, /<meta\s+property=["']twitter:url["'][^>]*>/i, `<meta property="twitter:url" content="${url}" />`);
html = replaceOrInsert(html, /<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${title}" />`);
html = replaceOrInsert(html, /<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${description}" />`);

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Simulateur Revenus Nets SCPI',
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      description: 'Estimez les revenus nets d’un investissement en SCPI après fiscalité, frais d’entrée et délai de jouissance.'
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maximusscpi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Simulateurs', item: 'https://maximusscpi.com/simulateurs/' },
        { '@type': 'ListItem', position: 3, name: 'Revenus nets SCPI', item: url }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Que calcule le simulateur de revenus nets SCPI ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Il estime les revenus bruts et nets à partir du montant investi, du rendement, de la fiscalité, du délai de jouissance et des frais renseignés.'
          }
        },
        {
          '@type': 'Question',
          name: 'Le résultat du simulateur constitue-t-il une performance garantie ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Non. Le résultat est une simulation fondée sur les hypothèses saisies. Les distributions, la fiscalité, la valeur des parts et la liquidité peuvent évoluer.'
          }
        }
      ]
    }
  ]
};

html = html.replace(
  '</head>',
  `    <script id="net-income-simulator-static-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n  </head>`
);

const staticRoot = `<div id="root">
  <main style="min-height:100vh;background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <section style="max-width:1100px;margin:0 auto;padding:48px 24px 56px">
      <nav aria-label="Fil d’Ariane" style="font-size:14px;margin-bottom:28px"><a href="/" style="color:#047857">Accueil</a> · <a href="/simulateurs/" style="color:#047857">Simulateurs</a> · Revenus nets SCPI</nav>
      <p style="margin:0 0 10px;color:#047857;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Outil SCPI gratuit</p>
      <h1 style="font-size:clamp(36px,5vw,54px);line-height:1.08;margin:0 0 16px;font-weight:800;letter-spacing:-.03em">Simulateur SCPI : revenus nets après impôts</h1>
      <p style="max-width:820px;font-size:19px;line-height:1.65;color:#475569;margin:0 0 34px">Estimez vos revenus après fiscalité, frais d’entrée et délai de jouissance. Le simulateur permet de distinguer revenu brut, revenu net et rendement net selon vos hypothèses.</p>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin:0 0 36px">
        <article style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:20px"><h2 style="font-size:18px;margin:0 0 8px">Montant et rendement</h2><p style="margin:0;color:#64748b;line-height:1.6">Saisissez le capital investi et une hypothèse de taux de distribution pour estimer les revenus bruts.</p></article>
        <article style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:20px"><h2 style="font-size:18px;margin:0 0 8px">Fiscalité</h2><p style="margin:0;color:#64748b;line-height:1.6">Adaptez la tranche marginale d’imposition et l’origine des revenus pour obtenir une estimation nette cohérente avec les paramètres du simulateur.</p></article>
        <article style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:20px"><h2 style="font-size:18px;margin:0 0 8px">Délai de jouissance</h2><p style="margin:0;color:#64748b;line-height:1.6">La première année peut être proratisée pour tenir compte du délai avant le début de la distribution.</p></article>
        <article style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:20px"><h2 style="font-size:18px;margin:0 0 8px">Frais et projection</h2><p style="margin:0;color:#64748b;line-height:1.6">Visualisez l’écart souscription/retrait et projetez les revenus sur votre horizon d’investissement.</p></article>
      </section>

      <section style="background:#052e2b;color:#e2e8f0;border:1px solid #065f46;border-radius:14px;padding:24px">
        <h2 style="color:white;font-size:24px;margin:0 0 10px">Comment lire le résultat ?</h2>
        <p style="line-height:1.7;margin:0 0 12px">Le résultat est une simulation, pas une promesse de rendement. Les distributions d’une SCPI, sa fiscalité, la valeur de ses parts et sa liquidité peuvent évoluer. Les hypothèses doivent donc être confrontées aux données de la SCPI analysée.</p>
        <p style="margin:0"><a href="/comparateur-scpi/" style="color:#6ee7b7;font-weight:700">Comparer les SCPI</a> · <a href="/methodologie-donnees-scpi/" style="color:#6ee7b7;font-weight:700">Méthodologie des données</a></p>
      </section>
    </section>
  </main>
</div>`;

const rootStart = html.indexOf('<div id="root">');
if (rootStart === -1) {
  console.error('❌ Impossible de repérer #root dans dist/index.html.');
  process.exit(1);
}

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
console.log('✅ Page statique SEO générée : /simulateur-revenus-nets-scpi/');
