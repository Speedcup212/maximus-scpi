import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sourcePath = path.join(distDir, 'index.html');
const SITE = 'https://maximusscpi.com';

if (!fs.existsSync(sourcePath)) {
  console.error('❌ dist/index.html introuvable.');
  process.exit(1);
}

const SIMS = [
  ['simulateurs','Simulateurs SCPI 2026 : Revenus, Crédit, Démembrement | MaximusSCPI','Outils SCPI gratuits : revenus nets, crédit, démembrement, enveloppes, impact fiscal, profil investisseur.','Simulateurs SCPI','Testez plusieurs scénarios avant d’investir : revenus nets, crédit, démembrement, fiscalité, enveloppes et liquidité.',null],
  ['simulateur-marche-secondaire-scpi','Diagnostic revente SCPI 2026 | Liquidité, prix & sources | MaximusSCPI','Sélectionnez votre SCPI : Maximus analyse son mode de sortie, sa liquidité, ses valeurs patrimoniales et la fraîcheur des sources.','Diagnostic revente SCPI','Analysez le mécanisme de sortie, la liquidité, les prix réellement applicables et la fraîcheur des sources avant de vendre ou d’attendre.','Diagnostic de revente SCPI'],
  ['simulateur-credit-scpi','Simulateur Crédit SCPI 2026 | Effet de Levier | MaximusSCPI','Simulez votre investissement SCPI à crédit : mensualité, cash-flow et effet de levier.','Simulateur crédit SCPI','Projetez mensualité, effort d’épargne, revenus et coût du financement pour tester un investissement en SCPI à crédit.','Simulateur Crédit SCPI'],
  ['simulateur-demembrement-scpi','Simulateur Démembrement SCPI 2026 | Nue Propriété | MaximusSCPI','Calculez le rendement indicatif d’une SCPI en démembrement temporaire.','Simulateur démembrement SCPI','Testez une acquisition en nue-propriété ou en usufruit selon la durée et la clé de démembrement.','Simulateur Démembrement SCPI'],
  ['simulateur-enveloppes-scpi','Simulateur Enveloppes SCPI 2026 | AV vs Direct | MaximusSCPI','Comparez SCPI en direct et assurance-vie selon frais, fiscalité et horizon.','Comparer les enveloppes de détention SCPI','Comparez détention en direct et assurance-vie selon les frais, la fiscalité, l’horizon et les contraintes propres à chaque enveloppe.','Simulateur Enveloppes SCPI'],
  ['simulateur-tresorerie-is','Simulateur Trésorerie IS 2026 | SCPI & Impôt sur Sociétés','Simulez la trésorerie de SCPI détenues en société à l’IS : revenus, charges et impôt.','Simulateur trésorerie à l’IS et SCPI','Projetez les revenus, la fiscalité et la trésorerie d’une société soumise à l’IS qui détient des parts de SCPI.','Simulateur Trésorerie IS SCPI'],
  ['simulateur-impact-fiscal-scpi','Simulateur Impact Fiscal SCPI 2026 | MaximusSCPI','Estimez l’impact fiscal indicatif d’un investissement SCPI selon les hypothèses saisies.','Simulateur impact fiscal SCPI','Estimez l’effet de revenus SCPI sur votre fiscalité selon leur origine, votre situation et le mode de détention.','Simulateur Impact Fiscal SCPI'],
  ['simulateur-profil-investisseur','Simulateur Profil Investisseur SCPI 2026 | MaximusSCPI','Évaluez objectifs, horizon et tolérance au risque avant d’investir en SCPI.','Profil investisseur SCPI','Évaluez votre horizon, vos objectifs, votre capacité de perte et votre tolérance au risque avant de comparer les SCPI.','Simulateur Profil Investisseur SCPI'],
  ['comparateur-demembrement-scpi','Comparateur Démembrement SCPI 2026 | Nue Propriété | MaximusSCPI','Comparez les clés de démembrement de SCPI selon la durée.','Comparateur démembrement SCPI','Comparez les clés de démembrement et le rendement annualisé implicite de la nue-propriété selon la durée.','Comparateur Démembrement SCPI']
];

const SECTORS = [
  ['scpi-bureaux','bureaux','la demande locative, la localisation, la qualité des immeubles et les baux'],
  ['scpi-commerces','commerces','l’emplacement, la qualité des locataires, les baux et l’évolution des usages'],
  ['scpi-sante','santé','la qualité des exploitants, les baux, la spécialisation des actifs et les tendances démographiques'],
  ['scpi-logistique','logistique','la localisation, la qualité technique des actifs, les locataires et les baux'],
  ['scpi-residentiel','résidentielles','la localisation, la réglementation, la tension locative et la valorisation'],
  ['scpi-hotellerie','hôtellerie et tourisme','les exploitants, les baux, la fréquentation, la localisation et le cycle touristique']
];

const PAGES = [
  {
    slug:'analyses',
    title:'Analyses SCPI : indicateurs, trajectoires et risques | MaximusSCPI',
    description:'Consultez les analyses SCPI : occupation, valorisation, dette, liquidité et évolution des indicateurs. Sources et limites à vérifier pour chaque fonds.',
    h1:'Analyses SCPI : indicateurs, trajectoires et risques',
    intro:'Comparez les fondamentaux des SCPI et leur évolution à partir des indicateurs documentés. Chaque analyse distingue les chiffres disponibles, leur période et les éléments qui restent à vérifier.',
    sections:[['Lire les indicateurs','Occupation financière, valorisation, endettement et liquidité complètent le taux de distribution historique.'],['Observer les trajectoires','Les évolutions se lisent sur des périodes comparables. Un changement de mécanisme de sortie peut empêcher certaines comparaisons.'],['Vérifier les sources et les limites','Consultez les périodes et documents de chaque fiche. Une donnée absente ne constitue pas une preuve d’absence de risque.']],
    links:[['/comete/','Analyse de Comète'],['/transitions-europe/','Analyse de Transitions Europe'],['/comparateur-scpi/','Comparer les SCPI'],['/methodologie-donnees-scpi/','Sources et méthodologie'],['/avertissements-risques-scpi/','Risques des SCPI']]
  },
  ...SIMS.map(([slug,title,description,h1,intro,appName]) => ({
    slug,title,description,h1,intro,appName,
    sections: [
      ['Comparer des hypothèses','Le résultat dépend des paramètres saisis. Il faut tester plusieurs scénarios plutôt qu’une seule hypothèse.'],
      ['Lire le résultat net','Frais, fiscalité, horizon et liquidité peuvent modifier sensiblement le résultat économique.'],
      ['Garder les risques visibles','Une simulation ne garantit ni le rendement, ni la valeur des parts, ni le délai de revente.']
    ],
    links: [['/comparateur-scpi/','Comparer les SCPI'],['/avertissements-risques-scpi/','Risques des SCPI']]
  })),
  ...SECTORS.map(([slug,label,criteria]) => ({
    slug,
    title: `SCPI ${label} 2026 : rendement, indicateurs et risques | MaximusSCPI`,
    description: `Analyse des SCPI ${label} : rendement, TOF, valorisation, dette, liquidité et principaux risques sectoriels.`,
    h1: `SCPI ${label}`,
    intro: `Les SCPI ${label} doivent être analysées à travers ${criteria}, sans se limiter au taux de distribution.`,
    sections: [
      ['Occupation et revenus','Le TOF, les loyers, les impayés et les échéances de baux permettent de lire la qualité des revenus.'],
      ['Valeur des actifs','L’évolution des valeurs de réalisation et de reconstitution aide à suivre la trajectoire patrimoniale.'],
      ['Liquidité et dette','Le mécanisme de sortie, les parts en attente et l’endettement complètent l’analyse sectorielle.']
    ],
    links: [['/comparateur-scpi/','Comparer les SCPI'],['/methodologie-donnees-scpi/','Méthodologie des données']]
  })),
  {
    slug:'faq', title:'FAQ SCPI 2026 : rendement, fiscalité, risques et revente | MaximusSCPI',
    description:'Réponses aux questions fréquentes sur les SCPI : rendement, capital, fiscalité, liquidité, frais, revente et choix des supports.',
    h1:'Questions fréquentes sur les SCPI',
    intro:'Les réponses essentielles pour comprendre le fonctionnement des SCPI avant de comparer un fonds ou de prendre une décision.',
    sections:[['Rendement et capital','Le taux de distribution n’est pas garanti et la valeur des parts peut varier.'],['Liquidité','La revente dépend du mécanisme de sortie et de la présence d’acheteurs ou de nouvelles souscriptions.'],['Fiscalité','Elle dépend de la nature des revenus, de leur provenance et du mode de détention.']],
    links:[['/comprendre-les-scpi/','Comprendre les SCPI'],['/comparateur-scpi/','Comparateur SCPI']]
  },
  {
    slug:'investir-scpi', title:'Investir en SCPI en 2026 : méthode, critères et risques | MaximusSCPI',
    description:'Guide pour investir en SCPI : objectifs, rendement net, TOF, liquidité, endettement, valorisation, frais et diversification.',
    h1:'Investir en SCPI avec une méthode complète',
    intro:'Un investissement en SCPI doit être analysé au-delà du rendement affiché : qualité immobilière, liquidité, valorisation, dette, frais, fiscalité et horizon.',
    sections:[['Définir l’objectif','Revenus, diversification, retraite ou transmission ne conduisent pas aux mêmes critères.'],['Analyser les fondamentaux','TOF, valeurs, dette, diversification et qualité locative permettent de lire la trajectoire.'],['Vérifier la liquidité','Le délai de revente et le mécanisme de sortie sont des risques à part entière.']],
    links:[['/comparateur-scpi/','Comparer les SCPI'],['/simulateur-revenus-nets-scpi/','Simuler les revenus nets']]
  },
  {
    slug:'scpi-fiscalite', title:'Fiscalité SCPI 2026 : revenus français, étrangers et détention | MaximusSCPI',
    description:'Comprendre la fiscalité des SCPI : revenus français, revenus étrangers, assurance-vie et société à l’IS.',
    h1:'Fiscalité des SCPI',
    intro:'La fiscalité d’une SCPI dépend de la provenance des revenus, de votre situation et du mode de détention. Elle doit être analysée avant de comparer les rendements.',
    sections:[['Revenus français','Ils suivent les règles fiscales applicables aux revenus fonciers selon la situation du contribuable.'],['Revenus étrangers','Le traitement dépend du pays source et des conventions fiscales applicables.'],['Enveloppes de détention','Assurance-vie et société à l’IS ajoutent leurs propres règles, frais et contraintes.']],
    links:[['/simulateur-impact-fiscal-scpi/','Simuler l’impact fiscal'],['/simulateur-revenus-nets-scpi/','Simuler les revenus nets']]
  },
  {
    slug:'scpi-retraite', title:'SCPI et retraite 2026 : revenus complémentaires et stratégie | MaximusSCPI',
    description:'Comment utiliser les SCPI pour préparer la retraite : revenus, horizon, démembrement, fiscalité, liquidité et diversification.',
    h1:'Préparer sa retraite avec des SCPI',
    intro:'Les SCPI peuvent contribuer à un objectif de revenus complémentaires, mais leur horizon, leur fiscalité et leur liquidité doivent être compatibles avec la date de retraite.',
    sections:[['Horizon','La durée disponible permet de choisir entre revenus immédiats et stratégie de capitalisation.'],['Démembrement','La nue-propriété peut être étudiée lorsque l’objectif de revenus est différé.'],['Préparer la sortie','Le besoin futur de liquidité doit être anticipé car la revente des parts n’est pas garantie.']],
    links:[['/simulateur-demembrement-scpi/','Simulateur démembrement'],['/comparateur-scpi/','Comparer les SCPI']]
  },
  {
    slug:'scpi-france', title:'SCPI France 2026 : secteurs, rendement et risques | MaximusSCPI',
    description:'Comparer les SCPI investies en France : secteurs, régions, fiscalité, TOF, valorisation et risques.',
    h1:'SCPI investies en France',
    intro:'Les SCPI françaises couvrent des marchés immobiliers différents. L’analyse doit combiner secteur, localisation, fiscalité, occupation et valorisation.',
    sections:[['Paris et métropoles','Loyers, vacance et perspectives de valorisation diffèrent selon les marchés.'],['Régions','La diversification régionale réduit certaines concentrations sans supprimer le risque immobilier.'],['Fiscalité','Les revenus immobiliers de source française suivent les règles fiscales applicables au détenteur.']],
    links:[['/comparateur-scpi/','Comparer les SCPI'],['/scpi-europeennes/','SCPI européennes']]
  },
  {
    slug:'expertise-orias-cif', title:'Expertise ORIAS & CIF | MaximusSCPI',
    description:'Cadre professionnel de MaximusSCPI : conseil en investissements financiers, ORIAS, devoir de conseil et transparence.',
    h1:'Expertise, statut CIF et cadre ORIAS',
    intro:'MaximusSCPI distingue l’information générale du conseil personnalisé et présente le cadre professionnel applicable.',
    sections:[['Information générale','Les contenus publics ne remplacent pas une recommandation personnalisée.'],['Conseil personnalisé','Une recommandation individualisée suppose de recueillir les informations nécessaires sur le client.'],['Transparence','Statuts, rémunérations et conflits d’intérêts doivent être présentés dans le cadre applicable.']],
    links:[['/qui-sommes-nous/','Qui sommes-nous'],['/avertissements-risques-scpi/','Risques']]
  },
  {
    slug:'methodologie-donnees-scpi', title:'Méthodologie des données SCPI | Sources, fraîcheur et contrôle | MaximusSCPI',
    description:'Comment MaximusSCPI collecte, historise et contrôle les données : bulletins, rapports annuels, valeurs, TOF, liquidité et dette.',
    h1:'Méthodologie des données SCPI',
    intro:'Les indicateurs sont rattachés à des sources et à des périodes pour distinguer les données actuelles, historiques et celles qui restent à confirmer.',
    sections:[['Sources primaires','Bulletins trimestriels, rapports annuels et documents des sociétés de gestion sont privilégiés.'],['Historisation','Les périodes successives permettent de détecter une trajectoire plutôt que de lire un chiffre isolé.'],['Contrôles','Prix, valeurs, TOF, dette et liquidité sont vérifiés pour limiter les incohérences.']],
    links:[['/comparateur-scpi/','Comparateur SCPI'],['/avertissements-risques-scpi/','Risques et limites']]
  },
  {
    slug:'avertissements-risques-scpi', title:'Risques des SCPI : capital, liquidité, revenus et dette | MaximusSCPI',
    description:'Les principaux risques des SCPI : perte en capital, baisse des revenus, liquidité, vacance, dette, valorisation et fiscalité.',
    h1:'Avertissements et risques des SCPI',
    intro:'Une SCPI est un placement immobilier non garanti. Le rendement passé ne préjuge pas du rendement futur et la revente des parts peut prendre du temps.',
    sections:[['Perte en capital','La valeur des parts peut baisser en fonction du patrimoine et du marché.'],['Liquidité','Le délai de revente et la présence d’un acheteur ne sont pas garantis.'],['Revenus et dette','Distributions, vacance et endettement peuvent évoluer défavorablement.']],
    links:[['/comparateur-scpi/','Comparer les risques'],['/methodologie-donnees-scpi/','Méthodologie']]
  },
  {
    slug:'qui-sommes-nous', title:'Qui sommes-nous ? MaximusSCPI | Analyse et comparaison de SCPI',
    description:'Découvrez MaximusSCPI : analyses de SCPI, comparateur, trajectoires, simulateurs et cadre professionnel.',
    h1:'À propos de MaximusSCPI',
    intro:'MaximusSCPI développe des outils pour comparer les SCPI, suivre leur trajectoire et rendre visibles les risques, la liquidité et les données qui évoluent.',
    sections:[['Comparer','Rendement, frais, occupation, valorisation et dette sont mis en regard.'],['Suivre la trajectoire','Les bulletins successifs permettent d’observer les changements de TOF, prix, valeurs et liquidité.'],['Expliquer les risques','L’analyse distingue un chiffre ponctuel d’une rupture structurelle.']],
    links:[['/comparateur-scpi/','Comparateur SCPI'],['/expertise-orias-cif/','Cadre professionnel']]
  },
  {
    slug:'articles/construire-portefeuille-scpi', title:'Construire un portefeuille de SCPI : diversification et méthode | MaximusSCPI',
    description:'Méthode pour construire un portefeuille de SCPI : diversification, secteurs, zones, gestionnaires, liquidité et risques.',
    h1:'Construire un portefeuille de SCPI',
    intro:'Un portefeuille de SCPI se construit selon les objectifs, l’horizon et les risques, pas en empilant les meilleurs rendements du moment.',
    sections:[['Diversifier les gestionnaires','Répartir les encours limite la dépendance à une seule politique de gestion.'],['Diversifier secteurs et pays','Les marchés immobiliers ne réagissent pas tous de la même manière aux cycles.'],['Suivre la trajectoire','TOF, dette, valeurs et liquidité doivent être suivis après l’investissement.']],
    links:[['/comparateur-scpi/','Comparer les SCPI'],['/simulateur-profil-investisseur/','Évaluer son profil']]
  }
];

const esc = (v='') => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const canonical = (slug) => `${SITE}/${slug.replace(/^\/+|\/+$/g,'')}/`;
const replaceOrInsert = (html, pattern, replacement) => pattern.test(html) ? html.replace(pattern,replacement) : html.replace('</head>',`    ${replacement}\n  </head>`);

function replaceRoot(html, root) {
  const start = html.indexOf('<div id="root">');
  if (start < 0) throw new Error('#root introuvable');
  const openEnd = html.indexOf('>', start);
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = openEnd + 1;
  let depth = 1, end = -1, m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) { end = re.lastIndex; break; }
  }
  if (end < 0) throw new Error('fermeture #root introuvable');
  return html.slice(0,start) + root + html.slice(end);
}

function schema(page) {
  const url = canonical(page.slug);
  const crumbs = [{name:'Accueil',url:`${SITE}/`}];
  if (page.slug.startsWith('articles/')) crumbs.push({name:'Articles',url:`${SITE}/articles/`});
  else if ((page.slug.startsWith('simulateur') || page.slug.startsWith('comparateur-demembrement')) && page.slug !== 'simulateurs') crumbs.push({name:'Simulateurs',url:`${SITE}/simulateurs/`});
  crumbs.push({name:page.h1,url});
  const graph = [
    {'@type':'WebPage',name:page.h1,description:page.description,url,inLanguage:'fr-FR'},
    {'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:c.url}))}
  ];
  if (page.appName) graph.push({'@type':'SoftwareApplication',name:page.appName,applicationCategory:'FinanceApplication',operatingSystem:'Web',isAccessibleForFree:true,url,description:page.description});
  return {'@context':'https://schema.org','@graph':graph};
}

function root(page) {
  const cards = page.sections.map(([h,p])=>`<article class="seo-card"><h2>${esc(h)}</h2><p>${esc(p)}</p></article>`).join('');
  const links = (page.links||[]).map(([u,l])=>`<a href="${esc(u)}">${esc(l)}</a>`).join('<span>·</span>');
  return `<div id="root"><main class="seo-shell"><header class="seo-head"><a href="/"><img src="/Maximus logo 250x50 4.svg" width="250" height="50" alt="MaximusSCPI" /></a><nav><a href="/comparateur-scpi/">Comparateur</a><a href="/simulateurs/">Simulateurs</a><a href="/articles/">Apprendre</a></nav></header><section class="seo-main"><nav class="seo-crumb"><a href="/">Accueil</a><span>›</span><span>${esc(page.h1)}</span></nav><p class="seo-kicker">MaximusSCPI · Analyse & outils</p><h1>${esc(page.h1)}</h1><p class="seo-lead">${esc(page.intro)}</p><section class="seo-grid">${cards}</section>${links?`<nav class="seo-links">${links}</nav>`:''}<p class="seo-note">Informations générales, non personnalisées. Les SCPI présentent un risque de perte en capital et une liquidité non garantie.</p></section></main><style>.seo-shell{min-height:100vh;background:#0D1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.seo-head{height:64px;max-width:1280px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;background:#111827}.seo-head img{width:205px;height:auto}.seo-head nav{display:flex;gap:20px}.seo-head a{color:#e5e7eb;text-decoration:none;font-size:14px;font-weight:650}.seo-main{max-width:1120px;margin:0 auto;padding:46px 24px 72px}.seo-crumb{display:flex;gap:8px;color:#94a3b8;font-size:13px;margin-bottom:42px}.seo-crumb a,.seo-links a{color:#6ee7b7;text-decoration:none}.seo-kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.seo-main h1{max-width:920px;color:#fff;font-size:clamp(38px,5vw,60px);line-height:1.06;letter-spacing:-.035em;margin:12px 0 20px}.seo-lead{max-width:900px;color:#cbd5e1;font-size:19px;line-height:1.65;margin:0 0 34px}.seo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.seo-card{border:1px solid #263244;border-radius:14px;background:#121a25;padding:20px}.seo-card h2{color:#fff;font-size:18px;margin:0 0 9px}.seo-card p{color:#aebbd0;line-height:1.65;margin:0}.seo-links{margin-top:28px;display:flex;gap:10px;flex-wrap:wrap}.seo-note{margin-top:34px;padding-top:20px;border-top:1px solid #263244;color:#94a3b8;font-size:13px}@media(max-width:760px){.seo-head nav{display:none}.seo-grid{grid-template-columns:1fr}.seo-main h1{font-size:40px}}</style></div>`;
}

const source = fs.readFileSync(sourcePath,'utf-8');
let generated=0, skipped=0;
for (const page of PAGES) {
  const dir = path.join(distDir,...page.slug.split('/'));
  const target = path.join(dir,'index.html');
  if (fs.existsSync(target)) { skipped++; continue; }
  const url = canonical(page.slug);
  let html = source;
  html = replaceOrInsert(html,/<title>[\s\S]*?<\/title>/i,`<title>${esc(page.title)}</title>`);
  html = replaceOrInsert(html,/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${esc(page.description)}" />`);
  html = replaceOrInsert(html,/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
  html = replaceOrInsert(html,/<link\s+rel=["']canonical["'][^>]*>/i,`<link rel="canonical" href="${url}" />`);
  html = replaceOrInsert(html,/<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i,`<link rel="alternate" hreflang="fr" href="${url}" />`);
  for (const [prop,value] of [['og:url',url],['og:title',page.title],['og:description',page.description],['twitter:url',url],['twitter:title',page.title],['twitter:description',page.description]]) {
    html = replaceOrInsert(html,new RegExp(`<meta\\s+property=["']${prop.replace(':','\\:')}["'][^>]*>`,'i'),`<meta property="${prop}" content="${esc(value)}" />`);
  }
  // The source is the home shell. Remove its schemas before adding the page-specific graph.
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
  html = html.replace('</head>',`    <script id="seo-catchup-schema" type="application/ld+json">${JSON.stringify(schema(page)).replace(/</g,'\\u003c')}</script>\n  </head>`);
  html = replaceRoot(html,root(page));
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(target,html,'utf-8');
  generated++;
}
console.log(`✅ Rattrapage SEO statique : ${generated} pages générées, ${skipped} déjà couvertes.`);
if (generated + skipped !== PAGES.length) process.exit(1);
