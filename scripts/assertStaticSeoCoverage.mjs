import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sitemapPath = path.join(distDir, 'sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  console.error('❌ dist/sitemap.xml introuvable.');
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const failures = [];

const normalizeCanonical = (value) => {
  try {
    const u = new URL(value);
    let pathname = u.pathname || '/';
    if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/';
    return `${u.origin}${pathname}`;
  } catch {
    return value;
  }
};

for (const url of urls) {
  const parsed = new URL(url);
  const cleanPath = parsed.pathname.replace(/^\/+|\/+$/g, '');
  const filePath = cleanPath
    ? path.join(distDir, ...cleanPath.split('/'), 'index.html')
    : path.join(distDir, 'index.html');

  if (!fs.existsSync(filePath)) {
    failures.push(`${parsed.pathname} → index.html dédié absent`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i);

  if (!canonicalMatch) failures.push(`${parsed.pathname} → canonical absent`);
  else if (normalizeCanonical(canonicalMatch[1]) !== normalizeCanonical(url)) {
    failures.push(`${parsed.pathname} → canonical ${canonicalMatch[1]} au lieu de ${url}`);
  }

  if (!titleMatch || !titleMatch[1].trim()) failures.push(`${parsed.pathname} → title absent`);
  if (!h1Match) failures.push(`${parsed.pathname} → H1 HTML absent`);

  if (parsed.pathname !== '/' && /<link\s+rel=["']canonical["']\s+href=["']https:\/\/maximusscpi\.com\/["']/i.test(html)) {
    failures.push(`${parsed.pathname} → canonical home détecté`);
  }
}

// Contrat SEO des pages prioritaires Windsor.ai : contrôler le HTML final
// après tous les post-traitements, et pas uniquement les scripts générateurs.
{
  const comparator = path.join(distDir, 'comparateur-scpi', 'index.html');
  if (!fs.existsSync(comparator)) {
    failures.push('/comparateur-scpi/ → page commerciale absente');
  } else {
    const html = fs.readFileSync(comparator, 'utf8');
    if (!html.includes('id="comparator-related-scpi"')) {
      failures.push('/comparateur-scpi/ → section de fiches SCPI absente du HTML final');
    }
    for (const slug of ['comete', 'iroko-zen', 'transitions-europe', 'remake-live']) {
      if (!html.includes(`href="/${slug}/"`)) {
        failures.push(`/comparateur-scpi/ → lien certifié /${slug}/ absent du HTML final`);
      }
    }
  }

  const simulatorFile = path.join(distDir, 'simulateur-revenus-nets-scpi', 'index.html');
  const simulatorConfig = path.join(__dirname, '../src/data/simulatorSeoConfig.ts');
  if (!fs.existsSync(simulatorFile) || !fs.existsSync(simulatorConfig)) {
    failures.push('/simulateur-revenus-nets-scpi/ → source de simulation ou HTML absent');
  } else {
    const html = fs.readFileSync(simulatorFile, 'utf8');
    const config = fs.readFileSync(simulatorConfig, 'utf8');
    const entry = config.match(/'simulateur-revenus-nets':\s*\{\s*title:\s*'([^']+)',\s*description:\s*'([^']+)'/);
    if (!entry) {
      failures.push('/simulateur-revenus-nets-scpi/ → metadata React introuvables');
    } else {
      const [, expectedTitle, expectedDescription] = entry;
      const staticTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
      const staticDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
      if (staticTitle !== expectedTitle) {
        failures.push('/simulateur-revenus-nets-scpi/ → désalignement title React/HTML');
      }
      if (staticDescription !== expectedDescription) {
        failures.push('/simulateur-revenus-nets-scpi/ → désalignement description React/HTML');
      }
      if (!/Simulateur SCPI gratuit/i.test(staticTitle)) {
        failures.push('/simulateur-revenus-nets-scpi/ → intention de recherche absente du title');
      }
    }
  }
}

// Contrat de parité des deux hubs analytiques : les métadonnées de l'application
// React et celles du HTML livré doivent rester identiques. Réutilise les
// sources existantes, sans nouveau générateur SEO ni valeurs copiées à la main.
{
  const hubs = [
    { slug: 'analyses', source: 'AnalysesApp.tsx' },
    { slug: 'surveillance', source: 'SurveillanceApp.tsx' },
  ];

  for (const { slug, source } of hubs) {
    const sourcePath = path.join(__dirname, '../src', source);
    const htmlPath = path.join(distDir, slug, 'index.html');
    if (!fs.existsSync(sourcePath) || !fs.existsSync(htmlPath)) {
      failures.push(`/${slug}/ → source React ou HTML final absent`);
      continue;
    }

    const react = fs.readFileSync(sourcePath, 'utf8');
    const seoHead = react.match(/<SEOHead\b([\s\S]*?)\/>/)?.[1] || '';
    const reactValue = (prop) =>
      seoHead.match(new RegExp(`\\b${prop}=["']([^"']+)["']`))?.[1] || '';
    const reactTitle = reactValue('title');
    const reactDescription = reactValue('description');
    const reactCanonical = reactValue('canonical');

    if (!reactTitle || !reactDescription || !reactCanonical) {
      failures.push(`/${slug}/ → métadonnées SEOHead React non contrôlables`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const staticTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const metaTag = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)?.[0] || '';
    const staticDescription = metaTag.match(/\bcontent=["']([^"']*)["']/i)?.[1] || '';
    const canonicalTag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] || '';
    const staticCanonical = canonicalTag.match(/\bhref=["']([^"']+)["']/i)?.[1] || '';

    if (staticTitle !== reactTitle) failures.push(`/${slug}/ → title HTML/React différent`);
    if (staticDescription !== reactDescription) failures.push(`/${slug}/ → description HTML/React différente`);
    if (normalizeCanonical(staticCanonical) !== normalizeCanonical(reactCanonical)) {
      failures.push(`/${slug}/ → URL canonique HTML/React différente`);
    }
  }
}

// Contrôle du contenu SERP ciblé à partir des impressions Windsor.ai.
// Les titres et descriptions doivent survivre à TOUTES les phases de nettoyage.
{
  const targets = [
    {
      slug: 'amf-scpi',
      title: "SCPI et AMF : visa, agrément, risques | MaximusSCPI",
      description: "SCPI et AMF : que vérifie le régulateur ? Visa, société de gestion, DIC, note d’information, conditions de retrait et risques pour l’épargnant.",
      requiredLinks: ['/dic-scpi/', '/note-information-scpi/', '/orias-scpi/'],
      sourceLink: 'https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/placements-collectifs/scpi-comment-bien-sinformer',
    },
  ];

  for (const target of targets) {
    const file = path.join(distDir, ...target.slug.split('/'), 'index.html');
    if (!fs.existsSync(file)) {
      failures.push(`/${target.slug}/ → HTML cible Windsor.ai manquant`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
    const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '';
    if (title !== target.title) failures.push(`/${target.slug}/ → title SERP incorrect`);
    if (description !== target.description) failures.push(`/${target.slug}/ → description SERP incorrecte`);
    if (!html.includes(`href="https://maximusscpi.com/${target.slug}/"`)) {
      failures.push(`/${target.slug}/ → canonical propre absent`);
    }
    for (const link of target.requiredLinks) {
      if (!html.includes(`href="${link}"`)) {
        failures.push(`/${target.slug}/ → lien réglementaire ${link} manquant`);
      }
    }
    if (target.sourceLink && !html.includes(`href="${target.sourceLink}"`)) {
      failures.push(`/${target.slug}/ → source officielle AMF absente`);
    }
  }
}

// Conformité et existence de la page restaurée : le succès Supabase seul ne suffit pas.
{
  const slug = 'articles/investir-10000-euros-scpi';
  const file = path.join(distDir, 'articles', 'investir-10000-euros-scpi', 'index.html');
  const url = 'https://maximusscpi.com/articles/investir-10000-euros-scpi/';
  if (!sitemap.includes('<loc>' + url + '</loc>')) {
    failures.push(slug + ' → absent du sitemap');
  }
  if (!fs.existsSync(file)) {
    failures.push(slug + ' → page HTML absente du livrable');
  } else {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('Investir 10 000 € en SCPI : revenus et risques')
      || !html.includes('href="' + url + '"')) {
      failures.push(slug + ' → titre ou canonical non conforme au texte financier approuvé');
    }
    for (const link of ['/comparateur-scpi/', '/simulateur-revenus-nets-scpi/', 'https://www.amf-france.org/']) {
      if (!html.includes(link)) failures.push(slug + ' → lien obligatoire absent : ' + link);
    }
    for (const stale of ['23 €/mois', '279 €/an', '330 €/an', 'à 2,5 % garanti']) {
      if (html.includes(stale)) failures.push(slug + ' → projection financière périmée : ' + stale);
    }
    const articleContent = html.match(/<article[^>]*class=["']article-prose["'][^>]*>([\s\S]*?)<\/article>/i)?.[1] || '';
    const wordCount = articleContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (wordCount < 700) failures.push(slug + ' → article approuvé trop court : ' + wordCount);
  }
}

if (failures.length) {
  console.error(`❌ Couverture SEO statique incomplète : ${failures.length} anomalie(s) sur ${urls.length} URLs`);
  failures.slice(0, 60).forEach((failure) => console.error(`   - ${failure}`));
  process.exit(1);
}

console.log(`✅ Couverture SEO statique certifiée : ${urls.length}/${urls.length} URLs avec HTML dédié, canonical propre, title et H1.`);
