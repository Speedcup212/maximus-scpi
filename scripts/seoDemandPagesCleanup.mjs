import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');

const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, html) => fs.writeFileSync(file, html, 'utf8');
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const textOnly = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim().split(' ').filter(Boolean).length;

const setTitle = (html, title) => html
  .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
  .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`)
  .replace(/<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${esc(title)}" />`);

const setDescription = (html, description) => html
  .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(description)}" />`)
  .replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(description)}" />`)
  .replace(/<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${esc(description)}" />`);

const dedupeH1 = (html) => {
  const matches = [...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)];
  if (matches.length <= 1) return html;
  let out = html;
  // Le premier H1 reste le titre principal. Les H1 suivants deviennent des H2
  // en conservant leurs attributs/classes pour limiter l'impact visuel.
  for (let i = matches.length - 1; i >= 1; i -= 1) {
    const block = matches[i][0];
    const replacement = block.replace(/^<h1\b/i, '<h2').replace(/<\/h1>$/i, '</h2>');
    out = out.slice(0, matches[i].index) + replacement + out.slice(matches[i].index + block.length);
  }
  return out;
};

const pageFile = (slug) => path.join(distDir, ...slug.replace(/^\/+|\/+$/g, '').split('/'), 'index.html');

const metadataFixes = {
  'articles/scpi-direct-ou-assurance-vie': {
    title: 'SCPI direct ou assurance-vie : que choisir ? | MaximusSCPI',
    description: 'SCPI en direct ou en assurance-vie : comparez fiscalité, frais, liquidité, IFI et transmission selon votre situation et votre horizon.'
  },
  'articles/scpi-bureaux-tertiaire-teletravail-2025': {
    title: 'SCPI bureaux et télétravail : quels risques ? | MaximusSCPI',
    description: 'Analyse des SCPI de bureaux face au télétravail : occupation, loyers, localisation, qualité des actifs et indicateurs à surveiller.'
  },
  'articles/scpi-investir-en-couple': {
    title: 'SCPI en couple : investir seul ou à deux ? | MaximusSCPI'
  },
  'meilleures-scpi-rendement': {
    title: 'SCPI rendement 2026 : comparer les taux | MaximusSCPI'
  },
  'scpi-ifi': {
    title: 'SCPI et IFI : valeur imposable et déclaration | MaximusSCPI'
  },
  'societes-de-gestion-scpi': {
    title: 'Sociétés de gestion SCPI : comparer | MaximusSCPI'
  },
  'scpi-sci-is-fiscalite': {
    title: 'SCPI en SCI à l’IS : fiscalité et risques | MaximusSCPI'
  },
  'risques-scpi': {
    title: 'Risques SCPI : capital, revenus et liquidité | MaximusSCPI'
  },
  'orias-scpi': {
    title: 'ORIAS et SCPI : vérifier un intermédiaire | MaximusSCPI'
  },
  'scpi-commerce': {
    title: 'SCPI commerce : rendement et risques | MaximusSCPI'
  }
};

let metadataChanged = 0;
for (const [slug, fix] of Object.entries(metadataFixes)) {
  const file = pageFile(slug);
  if (!fs.existsSync(file)) continue;
  let html = read(file);
  if (fix.title) {
    if (fix.title.length > 60) throw new Error(`Title >60 pour ${slug}: ${fix.title.length}`);
    html = setTitle(html, fix.title);
  }
  if (fix.description) {
    if (fix.description.length < 80 || fix.description.length > 155) throw new Error(`Meta hors plage pour ${slug}: ${fix.description.length}`);
    html = setDescription(html, fix.description);
  }
  if (slug.startsWith('articles/')) html = dedupeH1(html);
  write(file, html);
  metadataChanged += 1;
}

// Enrichissements ciblés sur les pages déjà visibles dans Search Console.
// Les textes restent factuels et n'inventent ni rendement ni règle fiscale automatique.
const depthBlocks = {
  'scpi-ifi': [
    'Points à contrôler pour l’IFI',
    'La valeur à retenir ne se déduit pas simplement du prix de souscription. Il faut vérifier les informations communiquées par la société de gestion, la quote-part immobilière entrant dans le champ de l’IFI, le mode de détention des parts et les règles applicables à la date de déclaration. Le traitement peut différer selon que les parts sont détenues en direct, via une société ou dans une enveloppe assurantielle.',
    'Une analyse fiable consiste donc à rapprocher l’attestation annuelle, les documents du gestionnaire et la situation patrimoniale globale. Les seuils, dettes déductibles et règles de valorisation sont des sujets fiscaux à vérifier pour l’année concernée ; MaximusSCPI ne remplace pas cette vérification individualisée.'
  ],
  'societes-de-gestion-scpi': [
    'Comment comparer les sociétés de gestion ?',
    'La notoriété d’un gestionnaire ne suffit pas pour juger ses SCPI. Il faut regarder la qualité du reporting, la discipline d’investissement, la gestion de la collecte, l’endettement des véhicules, l’évolution des taux d’occupation et la manière dont les difficultés de liquidité sont traitées. Deux SCPI d’une même société peuvent présenter des profils très différents.',
    'MaximusSCPI relie les pages des gestionnaires aux fiches des SCPI suivies afin de comparer les véhicules sur des critères homogènes. L’objectif est de séparer l’analyse de la société de gestion de celle de chaque fonds, puis d’observer la trajectoire des indicateurs dans le temps.'
  ],
  'scpi-sci-is-fiscalite': [
    'Ce qu’il faut modéliser avant une détention via SCI à l’IS',
    'Détenir des SCPI dans une SCI soumise à l’impôt sur les sociétés modifie la lecture économique de l’investissement. Il faut distinguer la fiscalité et la comptabilité de la société de celles de l’associé, intégrer les frais de structure, le financement éventuel, les distributions et le scénario de sortie. Une comparaison pertinente se fait sur plusieurs années, pas uniquement sur le revenu immédiat.',
    'Le traitement comptable et fiscal dépend de la situation de la SCI, de la nature des revenus et des règles en vigueur. Les hypothèses d’amortissement, de déductibilité et de distribution doivent donc être validées avec le professionnel compétent avant toute décision.'
  ],
  'risques-scpi': [
    'Lire les risques ensemble, pas séparément',
    'Le risque d’une SCPI ne se résume pas au niveau de rendement. Une baisse du TOF peut affecter les revenus ; un endettement élevé peut amplifier la sensibilité aux taux ; une valorisation immobilière sous pression peut peser sur le prix de part ; et une file de retraits importante peut allonger fortement le délai de revente. Ces facteurs peuvent aussi se cumuler.',
    'MaximusSCPI suit donc plusieurs familles d’indicateurs : occupation, dette, valorisation, collecte, liquidité, diversification et trajectoire. Un signal isolé n’est pas automatiquement une raison d’acheter ou de vendre ; c’est sa persistance et sa combinaison avec les autres données qui doivent être analysées.'
  ],
  'orias-scpi': [
    'Ce que la vérification ORIAS permet — et ne permet pas',
    'Le registre ORIAS sert à vérifier l’immatriculation déclarée d’un intermédiaire dans les catégories concernées. Cette vérification porte sur le professionnel, pas sur la qualité d’une SCPI. Elle ne garantit ni le capital, ni le rendement, ni la liquidité du placement et ne remplace pas l’examen des documents réglementaires du produit.',
    'Avant une souscription, il faut donc distinguer trois contrôles : le statut de l’intermédiaire, le cadre réglementaire de la société de gestion et l’analyse économique de la SCPI. MaximusSCPI traite ces dimensions séparément pour éviter qu’un statut professionnel soit interprété comme une validation du produit.'
  ],
  'scpi-commerce': [
    'Quels indicateurs suivre pour une SCPI de commerces ?',
    'Les actifs commerciaux sont sensibles à l’emplacement, au pouvoir d’achat local, au format des points de vente, à la solidité des enseignes et à la durée des baux. Un taux d’occupation élevé doit être lu avec les franchises, les renégociations de loyers et la concentration sur quelques locataires ou zones géographiques.',
    'Pour comparer des SCPI de commerces, MaximusSCPI rapproche ces éléments du rendement distribué, de l’endettement, des valeurs immobilières et de la liquidité des parts. L’évolution sur plusieurs trimestres est généralement plus informative qu’un indicateur observé à une date unique.'
  ],
  'scpi-retraite': [
    'SCPI et retraite : raisonner en besoin de revenus et en liquidité',
    'Une stratégie retraite ne consiste pas seulement à viser un taux de distribution. Il faut estimer le revenu réellement nécessaire, l’horizon avant les premiers retraits, la fiscalité du mode de détention et la part du patrimoine qui doit rester disponible rapidement. La SCPI peut apporter des revenus immobiliers, mais ceux-ci ne sont pas garantis.',
    'À l’approche de la retraite, la liquidité devient particulièrement importante : la revente de parts peut prendre du temps et le prix de cession peut être inférieur au prix d’achat. Une allocation cohérente combine donc les SCPI avec une réserve disponible et évite de dépendre d’une seule source de revenus.'
  ]
};

let depthChanged = 0;
for (const [slug, [heading, p1, p2]] of Object.entries(depthBlocks)) {
  const file = pageFile(slug);
  if (!fs.existsSync(file)) continue;
  let html = read(file);
  html = html.replace(/<section[^>]*data-demand-depth[^>]*>[\s\S]*?<\/section>/i, '');
  const block = `<section data-demand-depth="true" style="max-width:1000px;margin:32px auto 0;padding:22px;border:1px solid #263244;border-radius:14px"><h2>${esc(heading)}</h2><p>${esc(p1)}</p><p>${esc(p2)}</p></section>`;
  html = html.replace('</main>', `${block}</main>`);
  write(file, html);
  if (wordCount(html) < 300) throw new Error(`Contenu encore trop court pour ${slug}: ${wordCount(html)} mots`);
  depthChanged += 1;
}

// Home et AMF : dépasser proprement le seuil du crawler avec une phrase utile, pas du bourrage.
for (const [slug, sentence] of [
  ['', 'Le comparateur et les simulateurs doivent être utilisés avec les fiches détaillées : aucun score propriétaire ne remplace la lecture des documents réglementaires, des bulletins trimestriels et des rapports annuels publiés par les sociétés de gestion.'],
  ['amf-scpi', 'Le contrôle réglementaire et l’analyse économique répondent donc à deux questions différentes et complémentaires pour l’investisseur.']
]) {
  const file = slug ? pageFile(slug) : path.join(distDir, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = read(file);
  html = html.replace(/<p[^>]*data-demand-extra[^>]*>[\s\S]*?<\/p>/i, '');
  html = html.replace('</main>', `<p data-demand-extra="true" style="max-width:1000px;margin:18px auto;padding:0 24px;line-height:1.65">${esc(sentence)}</p></main>`);
  write(file, html);
}

// Pages sociétés de gestion : titles courts et, uniquement si nécessaire, quelques mots de contexte utiles.
{
  const root = path.join(distDir, 'societe-gestion');
  if (fs.existsSync(root)) {
    for (const slug of fs.readdirSync(root)) {
      const file = path.join(root, slug, 'index.html');
      if (!fs.existsSync(file)) continue;
      let html = read(file);
      const currentTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
      if (currentTitle.length > 60) {
        const name = currentTitle.split(/\s+SCPI\s*:/i)[0].trim() || textOnly(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').split(':')[0];
        const title = `${name} : société de gestion SCPI | MaximusSCPI`;
        html = setTitle(html, title.length <= 60 ? title : `${name} SCPI | MaximusSCPI`);
      }
      if (wordCount(html) < 300) {
        html = html.replace('</article>', '<p data-demand-management-extra="true">Pour compléter la lecture, compare aussi la trajectoire des SCPI gérées, la régularité du reporting, les valeurs immobilières et les éventuelles tensions de liquidité sur plusieurs trimestres.</p></article>');
      }
      write(file, html);
    }
  }
}

// Fiches SCPI : lorsqu’un HTML initial reste sous 300 mots, ajouter une lecture méthodologique contextualisée.
// Cela améliore le contenu crawlable sans inventer de donnée propre à la SCPI.
let scpiDepthAdded = 0;
for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(distDir, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = read(file);
  if (!html.includes('"@type":"FinancialProduct"') && !html.includes('"@type": "FinancialProduct"')) continue;
  if (wordCount(html) >= 300) continue;
  const name = textOnly(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || entry.name);
  const block = `<section data-scpi-demand-depth="true" style="max-width:1180px;margin:0 auto;padding:28px 24px 40px;color:#cbd5e1"><h2 style="color:#fff;font-size:24px;margin:0 0 12px">Comment lire les indicateurs de ${esc(name)} ?</h2><p style="line-height:1.7">Pour ${esc(name)}, le rendement historique doit être rapproché du taux d’occupation, de l’endettement, de la capitalisation, des valeurs de réalisation et de reconstitution, des frais et des conditions de retrait. Aucun de ces indicateurs ne suffit isolément pour conclure sur la qualité ou le risque du placement.</p><p style="line-height:1.7">La trajectoire est également essentielle : une variation sur plusieurs trimestres peut être plus informative qu’un chiffre ponctuel. Les distributions, la valeur des parts et la liquidité ne sont pas garanties ; les dernières publications de la société de gestion restent la source de référence à vérifier avant toute décision.</p></section>`;
  const rootEnd = html.lastIndexOf('</div>');
  if (rootEnd > 0) html = html.slice(0, rootEnd) + block + html.slice(rootEnd);
  write(file, html);
  scpiDepthAdded += 1;
}

// Assertions ciblées sur les pages qui ont déjà des impressions significatives.
for (const slug of Object.keys(metadataFixes)) {
  const file = pageFile(slug);
  if (!fs.existsSync(file)) continue;
  const html = read(file);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  if (title.length > 60) throw new Error(`Régression title ${slug}: ${title.length}`);
  if (slug.startsWith('articles/') && [...html.matchAll(/<h1\b/gi)].length > 1) throw new Error(`Double H1 persistant: ${slug}`);
}
for (const slug of Object.keys(depthBlocks)) {
  const file = pageFile(slug);
  if (fs.existsSync(file) && wordCount(read(file)) < 300) throw new Error(`Régression thin-content ${slug}`);
}
if (wordCount(read(path.join(distDir, 'index.html'))) < 300) throw new Error('Home <300 mots après durcissement');
if (wordCount(read(pageFile('amf-scpi'))) < 300) throw new Error('AMF <300 mots après durcissement');

console.log(`✅ Durcissement pages à demande : ${metadataChanged} metadata ; ${depthChanged} pages enrichies ; ${scpiDepthAdded} fiches SCPI approfondies.`);
