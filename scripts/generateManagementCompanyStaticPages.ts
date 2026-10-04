import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { managementCompanyConfigs } from '../src/data/managementCompanyArticlesConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const shellPath = path.join(distDir, 'index.html');
const SITE = 'https://maximusscpi.com';
const LOGO = `${SITE}/Logo%20MaximusSCPI.com.png`;

const esc = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const replaceOrInsert = (html: string, pattern: RegExp, replacement: string) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);

const rootBounds = (html: string) => {
  const rootStart = html.search(/<div\s+id=["']root["'][^>]*>/i);
  if (rootStart === -1) throw new Error('div#root absent');
  const openEnd = html.indexOf('>', rootStart);
  const divTag = /<div\b[^>]*>|<\/div>/gi;
  divTag.lastIndex = openEnd + 1;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = divTag.exec(html))) {
    if (/^<div\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) return { rootStart, openEnd, closeStart: match.index };
  }
  throw new Error('fermeture div#root introuvable');
};

if (!fs.existsSync(shellPath)) throw new Error('dist/index.html absent');
const shell = fs.readFileSync(shellPath, 'utf-8');
let generated = 0;

for (const config of managementCompanyConfigs) {
  const canonical = `${SITE}/societe-gestion/${config.slug}/`;
  const pageDir = path.join(distDir, 'societe-gestion', config.slug);
  fs.mkdirSync(pageDir, { recursive: true });

  const managed = config.managedScpis.length
    ? `<section><h2>SCPI associées</h2><ul>${config.managedScpis.map((s) => `<li><strong>${esc(s.name)}</strong>${s.sector ? ` — ${esc(s.sector)}` : ''}</li>`).join('')}</ul></section>`
    : '';
  const keyPoints = config.keyPoints.length
    ? `<section><h2>Points clés</h2><ul>${config.keyPoints.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></section>`
    : '';
  const vigilance = config.vigilancePoints.length
    ? `<section><h2>Points de vigilance</h2>${config.vigilancePoints.map((v) => `<article><h3>${esc(v.critere)}</h3><p><strong>Pourquoi c’est important :</strong> ${esc(v.importance)}</p><p><strong>Vigilance :</strong> ${esc(v.vigilance)}</p></article>`).join('')}</section>`
    : '';
  const faqHtml = config.faq.length
    ? `<section><h2>Questions fréquentes</h2>${config.faq.map((f) => `<article><h3>${esc(f.question)}</h3><p>${esc(f.reponse)}</p></article>`).join('')}</section>`
    : '';
  const links = config.internalLinks.length
    ? `<nav aria-label="Ressources liées"><h2>Ressources MaximusSCPI</h2><ul>${config.internalLinks.slice(0, 12).map((l) => `<li><a href="${esc(l.url)}">${esc(l.label)}</a></li>`).join('')}</ul></nav>`
    : '';

  const root = `<div id="root" data-management-company-static="true"><main class="mc-static"><header><a href="/"><img src="/Maximus logo 250x50 4.svg" width="205" height="41" alt="MaximusSCPI" /></a><a href="/societes-de-gestion-scpi/">Toutes les sociétés de gestion</a></header><article><p class="kicker">Société de gestion SCPI</p><h1>${esc(config.title)}</h1><p class="summary">${esc(config.summary)}</p>${managed}${keyPoints}${vigilance}${faqHtml}${links}<p class="disclaimer">Une société de gestion ne garantit ni le rendement, ni la liquidité, ni le capital des SCPI qu’elle gère. Vérifie les documents réglementaires et les données les plus récentes avant toute décision.</p></article></main><style>.mc-static{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}.mc-static>header{height:66px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 24px}.mc-static>header img{width:205px;height:auto}.mc-static>header a:last-child{color:#047857;text-decoration:none;font-weight:700;font-size:14px}.mc-static article{max-width:920px;margin:0 auto;padding:56px 24px 80px}.mc-static .kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-weight:800;font-size:12px}.mc-static h1{color:#fff;font-size:clamp(36px,5vw,58px);line-height:1.05;margin:10px 0 22px}.mc-static h2{color:#fff;font-size:26px;margin:34px 0 14px}.mc-static h3{color:#fff;font-size:18px;margin:18px 0 6px}.mc-static p,.mc-static li{line-height:1.65}.mc-static .summary{font-size:19px;color:#cbd5e1}.mc-static section,.mc-static nav{border-top:1px solid #334155;margin-top:32px;padding-top:8px}.mc-static a{color:#6ee7b7}.mc-static li{margin:7px 0}.mc-static .disclaimer{margin-top:36px;padding:16px;border:1px solid #334155;border-radius:10px;color:#94a3b8;font-size:13px}@media(max-width:700px){.mc-static>header a:last-child{display:none}.mc-static article{padding:42px 20px 64px}}</style></div>`;

  let html = shell;
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(config.seoTitle)}</title>`);
  html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(config.metaDescription)}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
  html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsert(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i, `<link rel="alternate" hreflang="fr" href="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(config.seoTitle)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(config.metaDescription)}" />`);

  html = html.replace(/\s*<script[^>]+id=["']management-company-static-schema["'][^>]*>[\s\S]*?<\/script>/gi, '');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: config.seoTitle,
        description: config.metaDescription,
        about: { '@type': 'Organization', name: config.displayName },
        publisher: { '@type': 'Organization', name: 'MaximusSCPI', url: SITE, logo: { '@type': 'ImageObject', url: LOGO } }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Sociétés de gestion', item: `${SITE}/societes-de-gestion-scpi/` },
          { '@type': 'ListItem', position: 3, name: config.displayName, item: canonical }
        ]
      },
      ...(config.faq.length ? [{
        '@type': 'FAQPage',
        mainEntity: config.faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.reponse } }))
      }] : [])
    ]
  };
  html = html.replace('</head>', `    <script id="management-company-static-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n  </head>`);

  const bounds = rootBounds(html);
  html = html.slice(0, bounds.rootStart) + root + html.slice(bounds.closeStart + 6);
  fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8');

  const check = fs.readFileSync(path.join(pageDir, 'index.html'), 'utf-8');
  if (!check.includes(`<link rel="canonical" href="${canonical}"`) || !check.includes('data-management-company-static="true"') || !check.includes('<h1>')) {
    throw new Error(`Page société de gestion invalide: ${config.slug}`);
  }
  generated++;
}

if (generated !== managementCompanyConfigs.length) throw new Error(`Génération incomplète: ${generated}/${managementCompanyConfigs.length}`);
console.log(`✅ Pages sociétés de gestion statiques : ${generated}/${managementCompanyConfigs.length}`);
