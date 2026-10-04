import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const SITE = 'https://maximusscpi.com';
const MAXIMUS_LOGO = `${SITE}/Maximus%20logo%20250x50%204.svg`;

const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, html) => fs.writeFileSync(file, html, 'utf8');
const wordCount = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .filter(Boolean).length;

// 1) AMF : title SERP sous 60 caractères + profondeur pédagogique suffisante.
{
  const file = path.join(distDir, 'amf-scpi', 'index.html');
  if (!fs.existsSync(file)) throw new Error('Page /amf-scpi/ absente');
  let html = read(file);
  const title = 'AMF et SCPI : contrôle, agrément et limites | MaximusSCPI';
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${title}" />`)
    .replace(/<section[^>]*data-final-seo-amf[^>]*>[\s\S]*?<\/section>/i, '');

  const extra = `<section data-final-seo-amf="true"><h2>Ce qu’il faut vérifier avant une souscription</h2><p>L’encadrement de l’AMF porte sur le cadre réglementaire et les acteurs concernés, mais l’investisseur doit toujours examiner la SCPI elle-même. Il faut notamment rapprocher le DIC, la note d’information, les derniers bulletins trimestriels et le rapport annuel. Les indicateurs utiles comprennent le taux d’occupation financier, l’endettement, la capitalisation, la valeur de reconstitution, les frais et les conditions de retrait.</p><p>Une autorisation, un agrément ou un visa ne transforme donc pas une SCPI en placement garanti. La valeur des parts peut évoluer, les revenus distribués peuvent diminuer et la revente peut prendre du temps. Sur MaximusSCPI, le rôle du cadre réglementaire est distingué de l’analyse financière, immobilière et de liquidité afin d’éviter de confondre conformité du véhicule et qualité économique du placement.</p></section>`;
  html = html.replace('</main>', `${extra}</main>`);
  write(file, html);
  if (title.length > 60) throw new Error(`Title AMF trop long: ${title.length}`);
  if (wordCount(html) < 250) throw new Error(`Page AMF encore trop courte: ${wordCount(html)} mots`);
}

// 2) Home : enrichir le HTML initial avec une synthèse cohérente avec les outils réellement présents.
{
  const file = path.join(distDir, 'index.html');
  if (!fs.existsSync(file)) throw new Error('Home dist/index.html absente');
  let html = read(file);
  html = html.replace(/<section[^>]*data-home-seo-summary[^>]*>[\s\S]*?<\/section>/i, '');
  const summary = `<section data-home-seo-summary="true" class="initial-seo-summary" aria-label="Outils d’analyse MaximusSCPI"><div><h2>Comparer une SCPI au-delà du rendement affiché</h2><p>MaximusSCPI regroupe un comparateur, des fiches détaillées et des simulateurs pour analyser les principaux critères d’une SCPI. Le taux de distribution est replacé avec le TOF, la capitalisation, l’endettement, les frais, la valeur de reconstitution, la diversification sectorielle et géographique ainsi que les éléments de liquidité disponibles.</p><p>Les fiches suivent aussi la trajectoire des indicateurs dans le temps. Cette lecture permet de distinguer un chiffre isolé d’une évolution plus durable : baisse du taux d’occupation, progression des retraits en attente, modification du prix de part ou évolution des valeurs immobilières. Les sources et leur fraîcheur sont précisées lorsque l’information est disponible.</p><p>Les outils restent pédagogiques : ni le rendement, ni le capital, ni la liquidité ne sont garantis. Pour une décision d’investissement, l’analyse doit être adaptée à l’horizon, à la fiscalité, au besoin de revenus et à la capacité à supporter une perte ou un délai de revente.</p></div></section>`;
  html = html.replace('</main>', `</main>${summary}`);
  html = html.replace('</style>', `.initial-seo-summary{max-width:1280px;margin:0 auto;padding:34px 24px 46px;color:#cbd5e1}.initial-seo-summary>div{max-width:900px}.initial-seo-summary h2{font-size:24px;line-height:1.25;color:#f8fafc;font-weight:800;margin:0 0 14px}.initial-seo-summary p{font-size:14px;line-height:1.7;margin:10px 0} </style>`);
  write(file, html);
  if (wordCount(html) < 220) throw new Error(`Home statique encore trop courte: ${wordCount(html)} mots`);
}

// 3) Sociétés de gestion : garder l'Organization éditeur avec un vrai logo,
// et décrire le sujet de page comme Thing lorsque nous ne disposons pas d'un logo officiel vérifié du gestionnaire.
{
  const root = path.join(distDir, 'societe-gestion');
  if (!fs.existsSync(root)) throw new Error('Répertoire sociétés de gestion absent');
  let fixed = 0;
  for (const slug of fs.readdirSync(root)) {
    const file = path.join(root, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = read(file);
    const re = /<script[^>]+id=["']management-company-static-schema["'][^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(re);
    if (!match) continue;
    const schema = JSON.parse(match[1]);
    const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
    for (const node of graph) {
      if (node?.['@type'] === 'WebPage') {
        if (node.about?.['@type'] === 'Organization') {
          node.about = { '@type': 'Thing', name: node.about.name };
        }
        if (node.publisher?.['@type'] === 'Organization') {
          node.publisher.logo = { '@type': 'ImageObject', url: MAXIMUS_LOGO };
        }
      }
    }
    const replacement = `<script id="management-company-static-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
    html = html.replace(re, replacement);
    write(file, html);
    const check = JSON.parse(read(file).match(re)?.[1] || '{}');
    const checkGraph = Array.isArray(check['@graph']) ? check['@graph'] : [];
    const page = checkGraph.find((node) => node?.['@type'] === 'WebPage');
    if (!page?.publisher?.logo?.url) throw new Error(`Publisher sans logo: ${slug}`);
    if (page?.about?.['@type'] === 'Organization') throw new Error(`Organization sujet sans logo vérifié: ${slug}`);
    fixed += 1;
  }
  if (fixed === 0) throw new Error('Aucune page société de gestion post-traitée');
  console.log(`✅ Structured data sociétés de gestion nettoyée : ${fixed} pages`);
}

console.log('✅ Nettoyage SEO final : AMF + home + sociétés de gestion');
