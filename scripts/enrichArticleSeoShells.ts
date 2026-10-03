import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articleTemplates } from '../src/data/articleTemplatesConfig';
import { educationArticles } from '../src/data/educationArticles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distArticlesDir = path.join(__dirname, '../dist/articles');
const SITE = 'https://maximusscpi.com';

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const categoryLabels: Record<string, string> = {
  comparatifs: 'Comparatif SCPI',
  'choix-comparatifs': 'Choix & comparaison',
  fiscalite: 'Fiscalité SCPI',
  'fiscalite-modes': 'Fiscalité & modes de détention',
  'fiscalite-avancee': 'Fiscalité avancée',
  strategies: 'Stratégie patrimoniale',
  'strategies-patrimoniales': 'Stratégie patrimoniale',
  marche: 'Marché SCPI',
  guides: 'Guide pratique',
  analyse: 'Analyse SCPI',
  'analyse-criteres': 'Critères d’analyse',
  'risques-vigilance': 'Risques & vigilance',
  'secteurs-immo': 'Secteurs immobiliers',
  'gestionnaires-acteurs': 'Gestionnaires & acteurs',
  'reglementation-transparence': 'Réglementation & transparence'
};

const frameworkFor = (category: string, keyword: string) => {
  const k = keyword || 'ce sujet';
  if (['comparatifs', 'choix-comparatifs'].includes(category)) return [
    ['Comparer à périmètre identique', `Pour comparer ${k}, il faut utiliser le même horizon, distinguer rendement brut et résultat net, et intégrer les frais ainsi que la fiscalité. Une comparaison fondée sur un seul taux de distribution est insuffisante.`],
    ['Mesurer le risque et la liquidité', 'Le potentiel de revenu doit être mis en regard du risque de perte en capital, de la liquidité réelle, de la durée de placement et des conditions de sortie.'],
    ['Tester plusieurs scénarios', 'Une décision robuste confronte au minimum un scénario central et un scénario défavorable. L’objectif est de mesurer la sensibilité du résultat aux hypothèses, pas de produire une promesse de performance.']
  ];
  if (['fiscalite', 'fiscalite-modes', 'fiscalite-avancee'].includes(category)) return [
    ['Identifier la nature des revenus', `L’analyse de ${k} commence par distinguer la nature et l’origine des revenus ainsi que le mode de détention. Ces paramètres conditionnent le traitement fiscal.`],
    ['Raisonner en rendement net', 'Deux solutions affichant le même rendement brut peuvent produire un résultat net différent après fiscalité, frais et éventuels prélèvements à la source.'],
    ['Éviter les règles universelles', 'La fiscalité dépend de la situation du contribuable et peut évoluer. Une optimisation n’est pertinente que si elle reste cohérente avec l’horizon, la liquidité et le niveau de risque accepté.']
  ];
  if (['strategies', 'strategies-patrimoniales'].includes(category)) return [
    ['Partir de l’objectif', `La pertinence de ${k} dépend d’abord de l’objectif : revenus, diversification, retraite, transmission ou capitalisation. Le même support ne répond pas de la même manière à chaque besoin.`],
    ['Aligner horizon et liquidité', 'Les SCPI sont des placements immobiliers de long terme. La stratégie doit anticiper le besoin futur de liquidité et les conditions possibles de revente.'],
    ['Diversifier sans empiler', 'La diversification doit porter sur les gestionnaires, les secteurs, les zones géographiques et les moteurs de risque. Ajouter des lignes très corrélées ne suffit pas à diversifier réellement.']
  ];
  if (category === 'marche') return [
    ['Distinguer niveau et trajectoire', `Pour analyser ${k}, un chiffre ponctuel doit être replacé dans son historique. La direction du TOF, des valeurs, de la collecte, de la dette ou de la liquidité peut être plus informative que le niveau isolé.`],
    ['Vérifier la fraîcheur des sources', 'Bulletins trimestriels, rapports annuels et communications officielles n’ont pas la même date. Toute lecture de marché doit préciser la période observée.'],
    ['Séparer signal et conclusion', 'Un indicateur qui se dégrade est un signal à analyser, pas automatiquement une conclusion d’achat ou de vente. Il faut croiser plusieurs métriques et le contexte immobilier.']
  ];
  if (category === 'risques-vigilance') return [
    ['Identifier le risque concret', `L’analyse de ${k} distingue notamment risque de perte en capital, vacance, liquidité, dette, concentration et baisse des valeurs immobilières.`],
    ['Chercher les signaux documentés', 'Les parts en attente, les variations de TOF, les baisses de valeur, les refinancements ou les ruptures de collecte doivent être suivis dans le temps et reliés à leurs sources.'],
    ['Évaluer la capacité d’absorption', 'Un risque n’a pas le même impact selon la diversification du patrimoine, la maturité des baux, l’endettement et la capacité de la société de gestion à arbitrer les actifs.']
  ];
  if (category === 'analyse-criteres' || category === 'analyse') return [
    ['Définir correctement l’indicateur', `Avant d’interpréter ${k}, il faut vérifier sa définition, son unité, sa date et la source utilisée. Des métriques proches peuvent mesurer des réalités différentes.`],
    ['Observer plusieurs périodes', 'La trajectoire permet de distinguer une variation ponctuelle d’une tendance persistante. MaximusSCPI privilégie la lecture historique lorsque les documents le permettent.'],
    ['Croiser avec les autres fondamentaux', 'Aucun indicateur ne suffit seul. Occupation, valorisation, dette, liquidité, revenus et qualité locative doivent être lus ensemble.']
  ];
  if (category === 'secteurs-immo') return [
    ['Lire le cycle sectoriel', `L’analyse de ${k} dépend de l’offre, de la demande locative, des loyers, des taux de vacance et des besoins d’investissement propres au secteur.`],
    ['Regarder la qualité des actifs', 'La localisation, la qualité technique, les usages, les locataires et les échéances de baux conditionnent la résilience d’un portefeuille.'],
    ['Relier secteur et valorisation', 'Un secteur porteur ne garantit pas la performance d’une SCPI. Prix d’acquisition, dette, frais et valorisation des actifs restent déterminants.']
  ];
  if (category === 'gestionnaires-acteurs') return [
    ['Analyser le gestionnaire et chaque fonds', `Pour étudier ${k}, il faut séparer la qualité de la société de gestion des caractéristiques propres à chaque SCPI qu’elle administre.`],
    ['Comparer les décisions de gestion', 'Collecte, acquisitions, cessions, dette, politique de distribution et gestion de la liquidité permettent d’observer la manière dont le gestionnaire traverse le cycle.'],
    ['Contrôler les documents source', 'Les données utiles doivent être reliées aux bulletins trimestriels, rapports annuels et documents réglementaires afin d’éviter les comparaisons sur des périodes différentes.']
  ];
  if (category === 'reglementation-transparence') return [
    ['Identifier le document de référence', `Pour comprendre ${k}, il faut partir des documents réglementaires et des informations officielles applicables à la SCPI et à sa société de gestion.`],
    ['Séparer information et conseil', 'L’information générale décrit un mécanisme ou un risque. Une recommandation personnalisée suppose d’intégrer la situation, les objectifs et le profil de l’investisseur.'],
    ['Vérifier les limites de l’indicateur', 'La transparence implique de préciser la date, la source et les limites des données utilisées, notamment lorsqu’une information n’est pas publiée ou n’est plus à jour.']
  ];
  return [
    ['Comprendre le mécanisme', `Cette page traite de ${k} en replaçant le sujet dans le fonctionnement général des SCPI.`],
    ['Contrôler les données utiles', 'Rendement, occupation, valeurs, dette, frais et liquidité doivent être lus avec leur date et leur source.'],
    ['Relier le sujet à votre objectif', 'La pertinence d’une solution dépend de l’horizon, du besoin de revenus, de la fiscalité, de la liquidité souhaitée et de la capacité de perte.']
  ];
};

const linksFor = (category: string) => {
  const base: [string, string][] = [
    ['/comparateur-scpi/', 'Comparer les SCPI'],
    ['/methodologie-donnees-scpi/', 'Méthodologie des données'],
    ['/avertissements-risques-scpi/', 'Risques des SCPI']
  ];
  if (['fiscalite', 'fiscalite-modes', 'fiscalite-avancee'].includes(category)) {
    base.unshift(['/simulateur-impact-fiscal-scpi/', 'Simuler l’impact fiscal']);
  } else if (category === 'risques-vigilance' || category === 'marche') {
    base.unshift(['/simulateur-marche-secondaire-scpi/', 'Diagnostic de revente']);
  } else if (['strategies', 'strategies-patrimoniales'].includes(category)) {
    base.unshift(['/simulateurs/', 'Tester une stratégie']);
  }
  return base.slice(0, 4);
};

const educationBySlug = new Map<string, any>(
  (educationArticles as any[]).map((article) => [String(article.slug || ''), article])
);

const replaceRoot = (html: string, rootContent: string) => {
  const rootStart = html.indexOf('<div id="root">');
  if (rootStart === -1) throw new Error('#root introuvable');
  const rootOpenEnd = html.indexOf('>', rootStart);
  const divRegex = /<\/?div\b[^>]*>/g;
  divRegex.lastIndex = rootOpenEnd + 1;
  let depth = 1;
  let rootEnd = -1;
  let match: RegExpExecArray | null;
  while ((match = divRegex.exec(html)) !== null) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) {
      rootEnd = divRegex.lastIndex;
      break;
    }
  }
  if (rootEnd === -1) throw new Error('fermeture #root introuvable');
  return html.slice(0, rootStart) + rootContent + html.slice(rootEnd);
};

const buildEducationSections = (education: any) => {
  const sections = Array.isArray(education?.content?.sections) ? education.content.sections : [];
  return sections.map((section: any) => {
    const paragraphs = Array.isArray(section?.content) ? section.content : [];
    return `<section class="article-depth-section"><h2>${escapeHtml(section?.title || '')}</h2>${paragraphs.map((p: unknown) => `<p>${escapeHtml(p)}</p>`).join('')}</section>`;
  }).join('');
};

let enhanced = 0;
let fromEditorialSource = 0;
let methodologicalFallback = 0;
let alreadyFull = 0;

for (const article of articleTemplates.filter((entry) => entry.indexable !== false)) {
  const filePath = path.join(distArticlesDir, article.slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Article HTML absent : ${article.slug}`);
    process.exit(1);
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  if (!html.includes('article-seo-shell')) {
    alreadyFull++;
    continue;
  }

  const canonical = `${SITE}/articles/${article.slug}/`;
  const education = educationBySlug.get(article.slug);
  const categoryLabel = categoryLabels[article.category] || 'Guide & analyse SCPI';
  const keywords = (article.keywords || []).filter(Boolean);
  const keywordHtml = keywords.length
    ? `<section class="article-depth-keywords"><h2>Points couverts</h2><div>${keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('')}</div></section>`
    : '';

  let mainContent = '';
  if (education?.content?.intro && Array.isArray(education?.content?.sections) && education.content.sections.length) {
    mainContent = `<section class="article-depth-intro-source"><h2>Comprendre le sujet</h2><p>${escapeHtml(education.content.intro)}</p></section>${buildEducationSections(education)}${education?.content?.conclusion ? `<section class="article-depth-conclusion"><h2>À retenir</h2><p>${escapeHtml(education.content.conclusion)}</p></section>` : ''}`;
    fromEditorialSource++;
  } else {
    const framework = frameworkFor(article.category, article.mainKeyword || article.title);
    mainContent = framework.map(([heading, paragraph]) => `<section class="article-depth-section"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(paragraph)}</p></section>`).join('');
    methodologicalFallback++;
  }

  const linkHtml = linksFor(article.category)
    .map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`)
    .join('');

  const rootContent = `<div id="root" data-seo-depth="enhanced">
    <main class="article-depth-shell">
      <header class="article-depth-header">
        <a href="/" aria-label="Accueil MaximusSCPI"><img src="/Maximus logo 250x50 4.svg" width="250" height="50" alt="MaximusSCPI" /></a>
        <nav><a href="/comparateur-scpi/">Comparateur</a><a href="/simulateurs/">Simulateurs</a><a href="/articles/">Articles</a></nav>
      </header>
      <article class="article-depth-main">
        <nav class="article-depth-crumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span>›</span><a href="/articles/">Articles</a><span>›</span><span>${escapeHtml(categoryLabel)}</span></nav>
        <p class="article-depth-kicker">${escapeHtml(categoryLabel)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-depth-lead">${escapeHtml(article.metaDescription)}</p>
        <section class="article-depth-context">
          ${article.searchIntent ? `<div><strong>Question traitée</strong><p>${escapeHtml(article.searchIntent)}</p></div>` : ''}
          ${article.targetAudience ? `<div><strong>Pour qui ?</strong><p>${escapeHtml(article.targetAudience)}</p></div>` : ''}
        </section>
        ${mainContent}
        ${keywordHtml}
        <nav class="article-depth-links" aria-label="Outils et ressources liés">${linkHtml}</nav>
        <p class="article-depth-note">Les SCPI présentent un risque de perte en capital et une liquidité non garantie. Les données de marché doivent toujours être vérifiées à leur date de publication.</p>
      </article>
    </main>
    <style>
      .article-depth-shell{min-height:100vh;background:#0D1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.article-depth-header{height:64px;max-width:1280px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;background:#111827;border-bottom:1px solid #1f2937}.article-depth-header img{width:205px;height:auto}.article-depth-header nav{display:flex;gap:20px}.article-depth-header a,.article-depth-crumb a,.article-depth-links a{color:#6ee7b7;text-decoration:none}.article-depth-header a{font-size:14px;font-weight:650;color:#e5e7eb}.article-depth-main{max-width:920px;margin:0 auto;padding:46px 24px 78px}.article-depth-crumb{display:flex;gap:8px;flex-wrap:wrap;color:#94a3b8;font-size:13px;margin-bottom:42px}.article-depth-kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.article-depth-main h1{color:#fff;font-size:clamp(38px,5vw,58px);line-height:1.08;letter-spacing:-.035em;margin:12px 0 20px}.article-depth-lead{color:#cbd5e1;font-size:19px;line-height:1.7;margin:0 0 30px}.article-depth-context{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:34px}.article-depth-context>div{border:1px solid #263244;border-radius:12px;background:#121a25;padding:17px}.article-depth-context strong{color:#fff;font-size:13px}.article-depth-context p{margin:6px 0 0;color:#aebbd0;line-height:1.55}.article-depth-section,.article-depth-intro-source,.article-depth-conclusion{padding:25px 0;border-top:1px solid #263244}.article-depth-section h2,.article-depth-intro-source h2,.article-depth-conclusion h2,.article-depth-keywords h2{color:#fff;font-size:25px;line-height:1.25;margin:0 0 12px}.article-depth-section p,.article-depth-intro-source p,.article-depth-conclusion p{color:#cbd5e1;font-size:16px;line-height:1.78;margin:0 0 12px}.article-depth-keywords{padding:25px 0;border-top:1px solid #263244}.article-depth-keywords>div{display:flex;gap:8px;flex-wrap:wrap}.article-depth-keywords span{border:1px solid #334155;border-radius:999px;padding:6px 10px;color:#cbd5e1;font-size:13px}.article-depth-links{display:flex;gap:12px;flex-wrap:wrap;padding:25px 0;border-top:1px solid #263244}.article-depth-links a{font-weight:700}.article-depth-note{color:#94a3b8;font-size:13px;line-height:1.6;padding-top:18px;border-top:1px solid #263244}@media(max-width:760px){.article-depth-header nav{display:none}.article-depth-context{grid-template-columns:1fr}.article-depth-main h1{font-size:39px}}
    </style>
  </div>`;

  html = replaceRoot(html, rootContent);
  html = html.replace(/<script\s+id=["']article-static-depth-schema["'][\s\S]*?<\/script>\s*/i, '');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.metaDescription,
        url: canonical,
        inLanguage: 'fr-FR',
        articleSection: categoryLabel,
        keywords,
        author: { '@type': 'Organization', name: 'MaximusSCPI', url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: 'MaximusSCPI', url: `${SITE}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE}/articles/` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
        ]
      }
    ]
  };
  html = html.replace('</head>', `    <script id="article-static-depth-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n  </head>`);
  fs.writeFileSync(filePath, html, 'utf-8');
  enhanced++;
}

console.log(`✅ Articles SEO enrichis : ${enhanced} shells ; ${fromEditorialSource} depuis une source éditoriale structurée ; ${methodologicalFallback} enrichis méthodologiquement ; ${alreadyFull} déjà complets.`);
