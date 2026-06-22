import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// ============================================================
// 1. CHARGER LES ARTICLES DEPUIS SUPABASE (table articles_seo)
// ============================================================

const supabaseArticles = {};
let articles = [];

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('DEBUG Supabase URL présente:', !!supabaseUrl);
console.log('DEBUG Supabase KEY présente:', !!supabaseKey);

if (supabaseUrl && supabaseKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('articles_seo')
      .select('slug, title, meta_description, category, main_keyword, search_intent, target_audience, word_count, featured, read_time, intro, content_html, keywords')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) {
      data.forEach(article => {
        supabaseArticles[article.slug] = article;
      });
      console.log(`📥 ${data.length} articles chargés depuis Supabase`);
    }

    // Construire le tableau articles depuis Supabase
    articles = data ? data.map(a => ({
      id: a.slug,
      slug: a.slug,
      title: a.title,
      mainKeyword: a.main_keyword || '',
      searchIntent: a.search_intent || '',
      targetAudience: a.target_audience || '',
      category: a.category || 'Guides pratiques',
      wordCountTarget: a.word_count || 2000,
      featured: a.featured || false,
      indexable: true,
      metaDescription: a.meta_description || '',
      keywords: []
    })) : [];
  } catch (e) {
    console.log('⚠️  Supabase non disponible — aucun article généré');
    articles = [];
  }
} else {
  console.log('⚠️  Variables SUPABASE_URL / SUPABASE_ANON_KEY absentes');
  articles = [];
}

console.log(`📄 ${articles.length} articles provenant de Supabase`);

// Helpers de parsing (utilisés par managementCompanyArticlesConfig)
const extractObjects = (text) => {
  const objects = [];
  let i = 0;
  while (i < text.length) {
    const braceIdx = text.indexOf('{', i);
    if (braceIdx === -1) break;
    let depth = 1;
    let j = braceIdx + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }
    if (depth === 0) {
      objects.push(text.substring(braceIdx, j));
    }
    i = j;
  }
  return objects;
};

const extractString = (block, field) => {
  const regex = new RegExp(`${field}:\\s*'((?:[^'\\\\]|\\\\.)*)'`);
  const m = block.match(regex);
  return m ? m[1].replace(/\\'/g, "'") : null;
};

const extractArray = (block, field) => {
  const regex = new RegExp(`${field}:\\s*\\[([^\\]]+)\\]`);
  const m = block.match(regex);
  if (!m) return [];
  return [...m[1].matchAll(/'((?:[^'\\\\]|\\\\.)*)'/g)].map(m2 => m2[1].replace(/\\'/g, "'"));
};

// ============================================================
// 1b. PARSER managementCompanyArticlesConfig.ts → extraire société gestion
// ============================================================

const mgmtConfigPath = path.join(__dirname, '../src/data/managementCompanyArticlesConfig.ts');
const mgmtConfigRaw = fs.readFileSync(mgmtConfigPath, 'utf-8');

// Extraire le tableau managementCompanyConfigs
const mgmtArrayMatch = mgmtConfigRaw.match(/export const managementCompanyConfigs[:\s]*ManagementCompanyConfig\[\][\s]*=[\s]*\[([\s\S]*?)\n\];/);
const mgmtCompanyMap = new Map();

if (mgmtArrayMatch) {
  const mgmtArrayContent = mgmtArrayMatch[1];
  const mgmtRawObjects = extractObjects(mgmtArrayContent);

  // Helper: extraire un tableau d'objets imbriqués depuis un bloc
  const extractNestedObjectArray = (block, fieldName) => {
    const startPattern = new RegExp(`${fieldName}\\s*:\\s*\\[`);
    const startMatch = block.match(startPattern);
    if (!startMatch) return [];

    const startIdx = startMatch.index + startMatch[0].length;
    let depth = 1;
    let endIdx = startIdx;
    while (endIdx < block.length) {
      if (block[endIdx] === '[' || block[endIdx] === '{') depth++;
      else if (block[endIdx] === ']' || block[endIdx] === '}') {
        depth--;
        if (depth === 0) break;
      }
      endIdx++;
    }

    const arrayContent = block.substring(startIdx, endIdx);
    const objects = [];
    let i = 0;
    while (i < arrayContent.length) {
      const braceIdx = arrayContent.indexOf('{', i);
      if (braceIdx === -1) break;
      let d = 1;
      let j = braceIdx + 1;
      while (j < arrayContent.length && d > 0) {
        if (arrayContent[j] === '{') d++;
        else if (arrayContent[j] === '}') d--;
        j++;
      }
      if (d === 0) {
        const objStr = arrayContent.substring(braceIdx, j);
        const obj = {};
        const kvRegex = /(\w+)\s*:\s*'((?:[^'\\]|\\.)*)'/g;
        let m;
        while ((m = kvRegex.exec(objStr)) !== null) {
          obj[m[1]] = m[2].replace(/\\'/g, "'");
        }
        objects.push(obj);
      }
      i = j;
    }
    return objects;
  };

  mgmtRawObjects.forEach(block => {
    const slug = extractString(block, 'slug');
    const name = extractString(block, 'name');
    if (!slug || !name) return;

    const summary = extractString(block, 'summary') || '';
    const keyPoints = extractArray(block, 'keyPoints');
    const vigilancePoints = extractNestedObjectArray(block, 'vigilancePoints');
    const casPratiques = extractNestedObjectArray(block, 'casPratiques');
    const faq = extractNestedObjectArray(block, 'faq');
    const managedScpis = extractNestedObjectArray(block, 'managedScpis');
    const title = extractString(block, 'title') || '';

    mgmtCompanyMap.set(slug, {
      slug, name, summary, keyPoints, vigilancePoints, casPratiques, faq, managedScpis, title
    });
  });
}

console.log(`📄 ${mgmtCompanyMap.size} sociétés de gestion parsées depuis managementCompanyArticlesConfig.ts`);

// ============================================================
// ============================================================
// 2. HELPER : contenu textuel structuré
// ============================================================

const categoryLabels = {
  'comprendre': 'Comprendre les SCPI',
  'choix-comparatifs': 'Choix & Comparatifs',
  'analyse-criteres': "Critères d'analyse SCPI",
  'fiscalite': 'Fiscalité SCPI',
  'fiscalite-modes': 'Fiscalité et modes de détention',
  'fiscalite-avancee': 'Fiscalité avancée',
  'risques-vigilance': 'Risques et vigilance',
  'secteurs-immo': "Secteurs immobiliers",
  'strategies': 'Stratégies SCPI',
  'strategies-patrimoniales': 'Stratégies patrimoniales',
  'gestionnaires-acteurs': 'Gestionnaires & acteurs',
  'reglementation-transparence': 'Réglementation & transparence',
  'marche': 'Marché & Tendances',
  'guides': 'Guides Pratiques',
  'comparatifs': 'Comparatifs SCPI'
};

// Thèmes SCPI pour génération de contenu contextuel
const scpiBasics = [
  "des SCPI (Sociétés Civiles de Placement Immobilier)",
  "l'investissement immobilier pierre-papier",
  "des parts de SCPI",
  "le marché des SCPI en France",
  "l'épargne immobilière"
];

const generateContent = (article) => {
  const themeStr = scpiBasics[article.id % scpiBasics.length];

  // Intro (2-3 phrases)
  const intro = `${article.metaDescription} En 2026, le marché des SCPI continue d'évoluer avec plus de 90 milliards d'euros de capitalisation et des rendements attractifs. Cet article vous guide à travers les éléments essentiels pour comprendre ${article.mainKeyword || article.title.toLowerCase()}.`;

  // Sections H2 (3-5), dérivées des keywords
  const sections = [];
  const kwSlice = (article.keywords || []).slice(0, 5);
  if (kwSlice.length === 0) kwSlice.push('SCPI', 'investissement', 'rendement');

  const sectionTitles = kwSlice.map(kw => {
    const cap = kw.charAt(0).toUpperCase() + kw.slice(1);
    return cap.replace(/scpi/gi, 'SCPI');
  });

  const sectionParagraphs = [
    [
      `Le marché ${themeStr} connaît une transformation significative en 2026. Les investisseurs particuliers recherchent des solutions permettant de générer des revenus complémentaires tout en diversifiant leur patrimoine. Les SCPI offrent une réponse concrète à ces besoins avec des rendements moyens compris entre 4% et 7% selon les catégories.`,
      `Il est essentiel de bien comprendre les mécanismes de distribution, la fiscalité applicable et les frais de souscription avant tout investissement. Un conseiller en gestion de patrimoine peut vous aider à sélectionner les SCPI les plus adaptées à votre profil et vos objectifs.`
    ],
    [
      `La diversification est un principe fondamental ${themeStr}. En répartissant votre investissement sur plusieurs SCPI aux stratégies complémentaires (bureaux, commerces, santé, logistique), vous réduisez votre exposition au risque tout en maintenant un rendement global attractif.`,
      `Les données historiques montrent que les portefeuilles diversifiés de SCPI surperforment les stratégies mono-produit sur un horizon de 10 ans et plus. L'accompagnement par un professionnel certifié permet d'optimiser cette allocation selon votre situation fiscale et vos objectifs patrimoniaux.`
    ],
    [
      `La fiscalité des revenus ${themeStr} dépend de plusieurs facteurs : votre TMI (Tranche Marginale d'Imposition), le mode de détention (direct ou assurance-vie), et la localisation des actifs sous-jacents. Les SCPI européennes bénéficient d'une fiscalité avantageuse avec des revenus de source étrangère exonérés de prélèvements sociaux.`,
      `Pour les contribuables fortement imposés (TMI 30% et plus), l'assurance-vie constitue souvent le véhicule le plus pertinent pour détenir des parts de SCPI. Les revenus capitalisent en franchise d'impôt jusqu'au rachat, optimisant ainsi l'effet boule de neige sur le long terme.`
    ],
    [
      `En 2026, le paysage ${themeStr} est marqué par plusieurs tendances : montée en puissance des SCPI européennes, développement des thématiques ISR (Investissement Socialement Responsable), et émergence de nouvelles SCPI sans frais de souscription. Ces évolutions offrent des opportunités inédites aux investisseurs.`,
      `Les SCPI de santé, de logistique et de commerces de proximité affichent des fondamentaux solides, soutenus par des mégatendances démographiques et économiques. Le conseil d'un expert est recommandé pour identifier les meilleures opportunités du moment.`
    ],
    [
      `L'analyse des performances ${themeStr} doit prendre en compte plusieurs indicateurs : le TDVM (Taux de Distribution sur Valeur de Marché), le TOF (Taux d'Occupation Financier), le report à nouveau, et l'évolution de la valeur de reconstitution. Ces métriques permettent d'évaluer la qualité de gestion et la pérennité des distributions.`,
      `Au-delà du rendement facial, il est crucial d'examiner la stratégie d'investissement de la société de gestion, la qualité du patrimoine, la diversification géographique et sectorielle, ainsi que les frais prélevés. Un comparateur de SCPI comme MaximusSCPI vous aide à analyser ces critères objectivement.`
    ]
  ];

  sectionTitles.forEach((title, idx) => {
    const pIdx = idx % sectionParagraphs.length;
    sections.push({ title, paragraphs: sectionParagraphs[pIdx] });
  });

  // Conclusion
  const conclusion = `En résumé, ${article.metaDescription.charAt(0).toLowerCase() + article.metaDescription.slice(1)} Les SCPI représentent une classe d'actifs accessible et performante pour diversifier votre patrimoine immobilier sans les contraintes de la gestion locative directe. Pour une analyse personnalisée de votre situation, n'hésitez pas à consulter un expert.`;

  return { intro, sections, conclusion };
};

// ============================================================
// 2b. HELPER : contenu société de gestion (données réelles)
// ============================================================

const generateManagementCompanyContent = (company) => {
  let html = '';

  // À propos de la société
  html += `<h2>À propos de ${company.name}</h2>\n`;
  html += `      <p>${company.summary}</p>\n`;

  // SCPI gérées
  if (company.managedScpis && company.managedScpis.length > 0) {
    html += `\n      <h2>SCPI gérées par ${company.name}</h2>\n`;
    html += `      <ul>\n`;
    company.managedScpis.forEach(scpi => {
      const sector = scpi.sector ? ` (${scpi.sector})` : '';
      html += `        <li>${scpi.name}${sector}</li>\n`;
    });
    html += `      </ul>\n`;
  }

  // Points clés
  if (company.keyPoints && company.keyPoints.length > 0) {
    html += `\n      <h2>Points clés</h2>\n`;
    html += `      <ul>\n`;
    company.keyPoints.forEach(point => {
      html += `        <li>${point}</li>\n`;
    });
    html += `      </ul>\n`;
  }

  // Points de vigilance
  if (company.vigilancePoints && company.vigilancePoints.length > 0) {
    html += `\n      <h2>Points de vigilance</h2>\n`;
    html += `      <ul>\n`;
    company.vigilancePoints.forEach(vp => {
      const critere = vp.critere || '';
      const vigilance = vp.vigilance || '';
      html += `        <li><strong>${critere}</strong>${vigilance ? ` — ${vigilance}` : ''}</li>\n`;
    });
    html += `      </ul>\n`;
  }

  // Cas pratiques
  if (company.casPratiques && company.casPratiques.length > 0) {
    html += `\n      <h2>Cas pratiques</h2>\n`;
    company.casPratiques.forEach(cp => {
      const titre = cp.titre || cp.title || '';
      const description = cp.description || cp.content || '';
      html += `      <h3>${titre}</h3>\n`;
      html += `      <p>${description}</p>\n`;
    });
  }

  // FAQ
  if (company.faq && company.faq.length > 0) {
    html += `\n      <h2>Questions fréquentes</h2>\n`;
    company.faq.forEach(item => {
      const question = item.question || '';
      const reponse = item.reponse || item.answer || '';
      html += `      <h3>${question}</h3>\n`;
      html += `      <p>${reponse}</p>\n`;
    });
  }

  return html;
};

// ============================================================
// 3. GÉNÉRATION HTML
// ============================================================

const criticalCSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#e2e8f0;background:#111827;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.hero{min-height:35vh;background:linear-gradient(135deg,#111827 0%,#0f172a 100%);color:#fff;padding:2rem 1.25rem;display:flex;align-items:center}
@media(min-width:768px){.hero{padding:2.5rem 2rem}}
.hero-wrap{max-width:900px;width:100%;margin:0 auto}
.hero h1{font-size:1.75rem;font-weight:800;margin-bottom:1rem;line-height:1.2;color:#f43f5e}
@media(min-width:768px){.hero h1{font-size:2.25rem}}
.hero-meta{font-size:0.9375rem;color:#94a3b8;margin-bottom:1.5rem;line-height:1.6}
.article-body{max-width:800px;margin:0 auto;padding:2.5rem 1.25rem}
.article-body h2{font-size:1.5rem;font-weight:700;color:#fff;margin:2.5rem 0 1rem;border-left:4px solid #10b981;padding-left:0.75rem}
.article-body p{font-size:1.0625rem;color:#94a3b8;line-height:1.85;margin-bottom:1.25rem}
.article-body .intro{font-size:1.125rem;color:#cbd5e1;line-height:1.85;margin-bottom:1.5rem;padding:1.25rem;background:#1e2533;border-radius:0.75rem;border:1px solid #2d3748}
.article-body .conclusion{font-size:1.0625rem;color:#cbd5e1;line-height:1.85;margin-top:2rem;padding:1.25rem;background:#1e3a5f;border-radius:0.75rem;border-left:4px solid #10b981}
.article-body .disclaimer{font-size:0.8125rem;color:#64748b;margin-top:1.5rem;line-height:1.6;border-top:1px solid #2d3748;padding-top:1rem}
.article-body a{color:#e2e8f0!important;text-decoration:underline}
.article-body a:hover{color:#fff!important}
.container{max-width:900px;margin:0 auto;padding:2.5rem 1.25rem}
.btn{display:inline-block;padding:0.9375rem 1.875rem;border-radius:0.5rem;font-weight:600;text-decoration:none;transition:background 0.2s,transform 0.2s;font-size:1.0625rem;text-align:center}
.btn-primary{background:#10b981;color:#fff}
.btn-primary:hover{background:#059669;transform:translateY(-2px)}
.btn-white{background:#fff;color:#10b981}
.btn-white:hover{background:#e2e8f0;transform:translateY(-2px)}
.cta-section{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:3.5rem 1.25rem;text-align:center;margin:2rem 0 0}
.cta-section h3{font-size:1.75rem;margin-bottom:1rem;font-weight:700}
.cta-section p{font-size:1.0625rem;margin-bottom:1.75rem;opacity:0.95}
.site-header{background:#0f172a;padding:0.75rem 0;position:sticky;top:0;z-index:1000;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.header-container{max-width:1200px;margin:0 auto;padding:0 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.logo-link{display:flex;align-items:center;text-decoration:none}
.logo-img{height:3rem;width:auto}
@media(min-width:640px){.logo-img{height:4rem}}
@media(min-width:1024px){.logo-img{height:5rem}}
.nav-links{display:none;gap:1.5rem;align-items:center}
@media(min-width:768px){.nav-links{display:flex}}
.nav-link{color:#fff;text-decoration:none;font-size:0.9375rem;font-weight:500;transition:color 0.2s}
.nav-link:hover{color:#10b981}
.nav-btn{background:#10b981;color:#fff;padding:0.625rem 1.25rem;border-radius:0.5rem;font-weight:600;text-decoration:none;font-size:0.9375rem;transition:all 0.2s}
.nav-btn:hover{background:#059669;transform:translateY(-1px)}
.mobile-menu-btn{display:flex;background:transparent;border:none;color:#fff;cursor:pointer;padding:0.5rem}
@media(min-width:768px){.mobile-menu-btn{display:none}}
.mobile-menu{display:none;position:fixed;top:4.5rem;left:0;right:0;background:#0f172a;padding:1rem;flex-direction:column;gap:0.75rem;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:999}
.mobile-menu.active{display:flex}
.mobile-nav-link{color:#fff;text-decoration:none;padding:0.75rem 1rem;font-size:1rem;font-weight:500;border-radius:0.5rem;transition:background 0.2s}
.mobile-nav-link:hover{background:rgba(255,255,255,0.1)}
.site-footer{background:#0f172a;color:#6b7280;padding:1.5rem;text-align:center;font-size:0.875rem;line-height:1.8}
.site-footer a{color:#9ca3af;text-decoration:underline;transition:color 0.2s}
.site-footer a:hover{color:#fff}
`;

const escapeHtml = (str) => {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

const generateHTML = (article, mgmtCompany = null, supabaseArticle = null) => {
  const baseUrl = 'https://maximusscpi.com';
  const pageUrl = `${baseUrl}/articles/${article.slug}/`;
  const title = `${article.title} | MaximusSCPI`;
  const keywordsStr = (article.keywords || []).join(', ');
  const isMgmt = !!mgmtCompany;
  const isSupabase = !!supabaseArticle && !!supabaseArticle.content_html;
  const content = (isMgmt || isSupabase) ? null : generateContent(article);
  const mgmtBody = isMgmt ? generateManagementCompanyContent(mgmtCompany) : '';
  const sbBody = isSupabase ? supabaseArticle.content_html : '';

  return `<!doctype html>
<html lang="fr" translate="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <link rel="icon" type="image/png" href="/Logo MaximusSCPI.com.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://calendly.com">
    <link rel="dns-prefetch" href="https://elfsightcdn.com">

    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(article.metaDescription)}" />
    <meta name="keywords" content="${escapeHtml(keywordsStr)}" />

    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Eric Bellaiche - MaximusSCPI" />
    <link rel="alternate" hreflang="fr" href="${pageUrl}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(article.metaDescription)}" />
    <meta property="og:image" content="https://maximusscpi.com/3-barres.svg" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${pageUrl}" />
    <meta property="twitter:title" content="${escapeHtml(title)}" />
    <meta property="twitter:description" content="${escapeHtml(article.metaDescription)}" />
    <meta property="twitter:image" content="https://maximusscpi.com/3-barres.svg" />

    <link rel="canonical" href="${pageUrl}" />

    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N2JLWKH');</script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${escapeHtml(article.title)}",
      "description": "${escapeHtml(article.metaDescription)}",
      "url": "${pageUrl}",
      "author": {
        "@type": "Person",
        "name": "Eric Bellaiche",
        "jobTitle": "Conseiller en Gestion de Patrimoine",
        "url": "https://maximusscpi.com/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MaximusSCPI",
        "url": "https://maximusscpi.com/"
      },
      "keywords": "${escapeHtml(keywordsStr)}"
    }
    </script>

    <style>${criticalCSS}</style>
  </head>
  <body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N2JLWKH"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <header class="site-header">
      <div class="header-container">
        <a href="/" class="logo-link">
          <img src="/Maximus logo 250x50 4.svg" alt="MaximusSCPI" class="logo-img" />
        </a>
        <nav class="nav-links">
          <a href="/" class="nav-link">Comparateur</a>
          <a href="/comprendre-les-scpi" class="nav-link">Comprendre les SCPI</a>
          <a href="/articles" class="nav-link">Articles</a>
          <a href="/faq" class="nav-link">FAQ</a>
          <a href="/qui-sommes-nous" class="nav-link">Qui sommes-nous</a>
          <a href="https://calendly.com/eric-bellaiche/rdv-strategique-scpi" class="nav-btn" rel="noopener">Prendre RDV</a>
        </nav>
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        <a href="/" class="mobile-nav-link">Comparateur</a>
        <a href="/comprendre-les-scpi" class="mobile-nav-link">Comprendre les SCPI</a>
        <a href="/articles" class="mobile-nav-link">Articles</a>
        <a href="/faq" class="mobile-nav-link">FAQ</a>
        <a href="/qui-sommes-nous" class="mobile-nav-link">Qui sommes-nous</a>
        <a href="https://calendly.com/eric-bellaiche/rdv-strategique-scpi" class="mobile-nav-link" rel="noopener" style="background:#10b981;text-align:center">Prendre RDV</a>
      </div>
    </header>

    <section class="hero">
      <div class="hero-wrap">
        <h1>${escapeHtml(article.title)}</h1>
        <p class="hero-meta">${escapeHtml(article.metaDescription)}</p>
        <a href="#contact" class="btn btn-primary">Analyser ma situation SCPI</a>
      </div>
    </section>

    <article class="article-body">
${isMgmt
    ? mgmtBody
    : (isSupabase
        ? sbBody
        : `
      <p class="intro">${content.intro}</p>
${content.sections.map(s => `
      <h2>${s.title}</h2>
      ${s.paragraphs.map(p => `
      <p>${p}</p>`).join('\n')}`).join('\n')}

      <div class="conclusion">
        <p><strong>Conclusion</strong> — ${content.conclusion}</p>
      </div>
`)
}

      <p class="disclaimer">
        <strong>Avertissement :</strong> Cet article a une vocation pédagogique et informative. Les performances passées ne préjugent pas des performances futures. Investir en SCPI comporte un risque de perte en capital. Les revenus ne sont pas garantis et dépendent de l'évolution du marché immobilier. Avant toute décision d'investissement, consultez un conseiller en gestion de patrimoine agréé ORIAS. Eric Bellaiche — ORIAS n°13001580 — CNCEF D016571.
      </p>
    </article>

    <section class="cta-section" id="contact">
      <h3>Prêt à investir ?</h3>
      <p>Eric Bellaiche vous rappelle gratuitement sous 24h</p>
      <a
        href="https://calendly.com/eric-bellaiche/rdv-strategique-scpi"
        class="btn btn-white"
        style="font-size:1.25rem;padding:1.25rem 3rem"
        rel="noopener"
      >
        📞 Prendre Rendez-vous Gratuit
      </a>
      <p style="margin-top:1.5rem;font-size:1rem;opacity:0.95">
        Sans engagement • Conseiller certifié ORIAS • Réponse sous 24h
      </p>
    </section>

    <footer class="site-footer">
      <p>© 2026 MaximusSCPI | Eric Bellaiche | ORIAS 13001580 | CNCEF D016571</p>
      <p style="margin-top:0.5rem">
        <a href="/">Comparateur SCPI</a> • <a href="/comprendre-les-scpi">Comprendre les SCPI</a> • <a href="/articles">Articles</a> • <a href="/faq">FAQ</a>
      </p>
    </footer>

    <script>
      function toggleMobileMenu() {
        var menu = document.getElementById('mobileMenu');
        menu.classList.toggle('active');
      }
      document.addEventListener('click', function(e) {
        var menu = document.getElementById('mobileMenu');
        var btn = document.querySelector('.mobile-menu-btn');
        if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
      document.addEventListener('DOMContentLoaded', function() {
        var ctaBtns = document.querySelectorAll('[href="#contact"]');
        ctaBtns.forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'https://calendly.com/eric-bellaiche/rdv-strategique-scpi?hide_gdpr_banner=1&primary_color=10b981';
          });
        });
      });
    </script>

    <script>
      (function(){
        if (window.__calendlyListenerAttached) return;
        window.__calendlyListenerAttached = true;
        window.addEventListener("message", function(e){
          if (e && e.data && e.data.event === "calendly.event_scheduled") {
            if (typeof gtag === "function") {
              gtag('event','event_scheduled', { page_location: location.href });
            }
          }
        });
      })();
    </script>

    <script>
      (function(){
        if (window.onLeadSubmitSuccess) return;
        window.onLeadSubmitSuccess = function(data){
          try{
            if (typeof gtag === "function") {
              gtag('set','user_data', {
                email: (data && data.email) || '',
                phone_number: (data && data.phone) || '',
                address: {
                  first_name: (data && data.first_name) || '',
                  last_name:  (data && data.last_name)  || '',
                  postal_code:(data && data.postal_code)|| '',
                  country:    ((data && data.country) || 'FR').toUpperCase()
                }
              });
              gtag('event','lead_submit', { page_location: location.href });
            }
          }catch(e){}
        };
      })();
    </script>

    <script src="https://elfsightcdn.com/platform.js" defer></script>
  </body>
</html>`;
};

// ============================================================
// 4. GÉNÉRATION MARKDOWN
// ============================================================

const generateMD = (article, mgmtCompany = null, supabaseArticle = null) => {
  if (supabaseArticle && supabaseArticle.content_html) {
    let md = `# ${supabaseArticle.title || article.title}\n\n`;
    md += `${supabaseArticle.meta_description || article.metaDescription}\n\n`;
    if (supabaseArticle.intro) {
      md += `${supabaseArticle.intro}\n\n`;
    }
    md += `---\n\n`;
    md += `*Article généré par MaximusSCPI — Conseiller en gestion de patrimoine agréé ORIAS n°13001580.*\n`;
    md += `*URL : https://maximusscpi.com/articles/${article.slug}/*\n`;
    return md;
  }

  if (mgmtCompany) {
    let md = `# ${mgmtCompany.title || article.title}\n\n`;
    md += `${article.metaDescription}\n\n`;
    md += `${mgmtCompany.summary}\n\n`;

    if (mgmtCompany.keyPoints && mgmtCompany.keyPoints.length > 0) {
      md += `## Points clés\n\n`;
      mgmtCompany.keyPoints.forEach(point => { md += `- ${point}\n`; });
      md += `\n`;
    }

    if (mgmtCompany.vigilancePoints && mgmtCompany.vigilancePoints.length > 0) {
      md += `## Points de vigilance\n\n`;
      mgmtCompany.vigilancePoints.forEach(vp => {
        md += `- **${vp.critere || ''}**${vp.vigilance ? ` — ${vp.vigilance}` : ''}\n`;
      });
      md += `\n`;
    }

    if (mgmtCompany.casPratiques && mgmtCompany.casPratiques.length > 0) {
      md += `## Cas pratiques\n\n`;
      mgmtCompany.casPratiques.forEach(cp => {
        md += `### ${cp.titre || cp.title || ''}\n\n${cp.description || cp.content || ''}\n\n`;
      });
    }

    if (mgmtCompany.faq && mgmtCompany.faq.length > 0) {
      md += `## Questions fréquentes\n\n`;
      mgmtCompany.faq.forEach(item => {
        md += `### ${item.question || ''}\n\n${item.reponse || item.answer || ''}\n\n`;
      });
    }

    md += `---\n\n`;
    md += `*Article généré par MaximusSCPI — Conseiller en gestion de patrimoine agréé ORIAS n°13001580.*\n`;
    md += `*URL : https://maximusscpi.com/articles/${article.slug}/*\n`;
    return md;
  }

  const content = generateContent(article);
  let md = `# ${article.title}\n\n`;
  md += `${article.metaDescription}\n\n`;
  md += `${content.intro}\n\n`;
  content.sections.forEach(s => {
    md += `## ${s.title}\n\n`;
    s.paragraphs.forEach(p => { md += `${p}\n\n`; });
  });
  md += `---\n\n`;
  md += `*Article généré par MaximusSCPI — Conseiller en gestion de patrimoine agréé ORIAS n°13001580.*\n`;
  md += `*URL : https://maximusscpi.com/articles/${article.slug}/*\n`;
  return md;
};

// ============================================================
// 5. GÉNÉRATION llms.txt
// ============================================================

const categoryOrder = [
  'comprendre', 'choix-comparatifs', 'comparatifs', 'analyse', 'analyse-criteres',
  'fiscalite', 'fiscalite-modes', 'fiscalite-avancee',
  'risques-vigilance',
  'secteurs-immo',
  'strategies', 'strategies-patrimoniales',
  'gestionnaires-acteurs', 'reglementation-transparence',
  'marche', 'guides'
];

const generateLLMsTxt = (articles) => {
  // Grouper par catégorie
  const byCategory = {};
  articles.forEach(a => {
    const cat = a.category || 'guides';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(a);
  });

  let txt = '# MaximusSCPI — Index des articles éditoriaux\n';
  txt += '# Conseiller en Gestion de Patrimoine : Eric Bellaiche, ORIAS n°13001580\n';
  txt += '# Source : https://maximusscpi.com/articles/\n\n';

  categoryOrder.forEach(cat => {
    const arts = byCategory[cat];
    if (!arts || arts.length === 0) return;
    arts.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''));
    arts.forEach(a => {
      const shortDesc = (a.metaDescription || '').substring(0, 80);
      txt += `${a.slug} | ${a.title} | ${shortDesc} | https://maximusscpi.com/articles/${a.slug}/\n`;
    });
    txt += '\n';
  });

  return txt;
};

// ============================================================
// 6. MAIN
// ============================================================

const generateArticles = () => {
  console.log('🚀 Génération des pages articles statiques...\n');

  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const articlesDir = path.join(distDir, 'articles');
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  articles.forEach(article => {
    try {
      if (!article.slug || !article.title) {
        console.log(`⚠ SKIP [${article.id || '?'}] — slug ou title manquant`);
        skipped++;
        return;
      }

      // Filtrer les articles marqués indexable=false (placeholders / brouillons)
      if (article.indexable === false) {
        console.log(`  ⏭ SKIP [${article.slug}] — indexable=false (brouillon / placeholder)`);
        skipped++;
        return;
      }

      const pageDir = path.join(articlesDir, article.slug);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }

      // Vérifier si le contenu existe dans Supabase
      const supabaseArticle = supabaseArticles[article.slug] || null;

      // Vérifier si c'est une société de gestion
      const mgmtCompany = mgmtCompanyMap.get(article.slug) || null;

      // HTML
      const htmlContent = generateHTML(article, mgmtCompany, supabaseArticle);
      fs.writeFileSync(path.join(pageDir, 'index.html'), htmlContent, 'utf-8');

      // MD
      const mdContent = generateMD(article, mgmtCompany, supabaseArticle);
      fs.writeFileSync(path.join(pageDir, 'index.md'), mdContent, 'utf-8');

      generated++;
      if (supabaseArticle && supabaseArticle.content_html) {
        console.log(`✓ [${article.slug}] — contenu Supabase (${supabaseArticle.content_html.length} chars)`);
      } else if (mgmtCompany) {
        const htmlText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = htmlText.split(/\s+/).filter(w => w.length > 0).length;
        console.log(`✓ [${article.slug}] — contenu société de gestion (${wordCount} mots)`);
      } else if (generated % 20 === 0) {
        console.log(`   ${generated}/${articles.length}...`);
      }
    } catch (err) {
      console.error(`❌ ERREUR [${article.slug}] : ${err.message}`);
      errors++;
    }
  });

  // llms.txt
  const llmsContent = generateLLMsTxt(articles);
  fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsContent, 'utf-8');

  // Récapitulatif
  console.log(`\n✅ ${generated} articles générés`);
  if (skipped > 0) console.log(`⚠️ ${skipped} articles ignorés (données manquantes)`);
  if (errors > 0) console.log(`❌ ${errors} erreurs`);
  console.log(`📄 llms.txt généré dans dist/`);

  // Stats
  const htmlFiles = fs.readdirSync(articlesDir, { recursive: true }).filter(f => f.endsWith('index.html'));
  const firstDir = fs.readdirSync(articlesDir).filter(f => !f.includes('.'))[0];
  const lastDir = fs.readdirSync(articlesDir).filter(f => !f.includes('.')).pop();
  const samplePath = path.join(articlesDir, firstDir, 'index.html');
  const sampleStats = fs.statSync(samplePath);
  const avgSize = Math.round(sampleStats.size / 1024);

  console.log(`\n📊 Statistiques :`);
  console.log(`   Pages HTML : ${htmlFiles.length}`);
  console.log(`   Taille moyenne : ~${avgSize} Ko`);
  console.log(`   Premier slug : ${firstDir}`);
  console.log(`   Dernier slug : ${lastDir}`);
};

generateArticles();
