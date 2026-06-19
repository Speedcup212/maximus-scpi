import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste de TOUTES les pages thématiques pour Google Ads (37 pages)
const priorityThematicPages = [
  'meilleures-scpi-rendement',
  'scpi-europeennes',
  'scpi-fiscales',
  'preparer-retraite-scpi',
  'revenu-complementaire-scpi',
  // 'comparateur-scpi' retiré : la route /comparateur-scpi est rendue par le SPA (App.tsx),
  // pas par une landing statique. Voir aussi generateThematicPages.js.
  // 'scpi-france' retiré : la route /scpi-france/ est rendue par le SPA en tant qu'article éducatif.
  'scpi-sans-frais',
  'recyclage-urbain-scpi',
  'alderan-scpi',
  'arkea-reim-scpi',
  'la-francaise-rem-scpi',
  'atland-voisin-scpi',
  'aestiam-scpi',
  'altixia-reim-scpi',
  'amundi-immobilier-scpi',
  'atream-scpi',
  'consultim-asset-management-scpi',
  'fiducial-gerance-scpi',
  'greenman-arth-scpi',
  'inter-gestion-reim-scpi',
  'iroko-scpi',
  'kyaneos-asset-management-scpi',
  'magellim-reim-scpi',
  'norma-capital-scpi',
  'novaxia-investissement-scpi',
  'paref-gestion-scpi',
  'perial-asset-management-scpi',
  'praemia-reim-france-scpi',
  'remake-asset-management-scpi',
  'sofidy-scpi',
  'sogenial-immobilier-scpi',
  'swiss-life-am-france-scpi',
  'theoreim-scpi',
  'urban-premium-scpi'
];

// ============================================================
// HELPERS
// ============================================================

const createSlugFromName = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Extraction robuste du bloc d'un slug (comptage d'accolades, indépendant de l'indentation)
const extractSlugBlock = (fileContent, slug) => {
  const keyPattern = `'${slug}':`;
  const keyIdx = fileContent.indexOf(keyPattern);
  if (keyIdx === -1) return null;

  // Trouver l'accolade ouvrante après la clé
  const braceStart = fileContent.indexOf('{', keyIdx + keyPattern.length);
  if (braceStart === -1) return null;

  // Compter les accolades pour trouver l'accolade fermante correspondante
  let depth = 1;
  let i = braceStart + 1;
  while (i < fileContent.length && depth > 0) {
    if (fileContent[i] === '{') depth++;
    else if (fileContent[i] === '}') depth--;
    i++;
  }

  return fileContent.substring(braceStart + 1, i - 1);
};

// Extraction d'un champ string depuis un bloc TypeScript (gère les single quotes échappées)
const extractString = (block, fieldName) => {
  const regex = new RegExp(`${fieldName}:\\s*'((?:[^'\\\\]|\\\\.)*)'`);
  const match = block.match(regex);
  return match ? match[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\") : null;
};

// Extraction d'un tableau de {value, label}
const extractKeyMetrics = (block) => {
  const match = block.match(/keyMetrics:\s*\[([\s\S]*?)\n\s*\]/);
  if (!match) return null;
  const items = [];
  const itemRegex = /\{\s*value:\s*'((?:[^'\\]|\\.)*)',\s*label:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  let m;
  while ((m = itemRegex.exec(match[1])) !== null) {
    items.push({ value: m[1].replace(/\\'/g, "'"), label: m[2].replace(/\\'/g, "'") });
  }
  return items.length > 0 ? items : null;
};

// Extraction d'un tableau de strings
const extractStringArray = (block, fieldName) => {
  const regex = new RegExp(`${fieldName}:\\s*\\[([^\\]]+)\\]`);
  const match = block.match(regex);
  if (!match) return null;
  const items = [];
  const itemRegex = /'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = itemRegex.exec(match[1])) !== null) {
    items.push(m[1].replace(/\\'/g, "'"));
  }
  return items.length > 0 ? items : null;
};

// Extraction du tableau FAQ [{question, answer}]
const extractFaq = (block) => {
  const match = block.match(/faq:\s*\[([\s\S]*?)\n\s*\]/);
  if (!match) return null;
  const items = [];
  const itemRegex = /\{\s*question:\s*'((?:[^'\\]|\\.)*)',\s*answer:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  let m;
  while ((m = itemRegex.exec(match[1])) !== null) {
    items.push({
      question: m[1].replace(/\\'/g, "'"),
      answer: m[2].replace(/\\'/g, "'")
    });
  }
  return items.length > 0 ? items : null;
};

// Extraction du tableau temoignages [{nom, texte, note}]
const extractTemoignages = (block) => {
  const match = block.match(/temoignages:\s*\[([\s\S]*?)\n\s*\]/);
  if (!match) return null;
  const items = [];
  const itemRegex = /\{\s*nom:\s*'((?:[^'\\]|\\.)*)',\s*texte:\s*'((?:[^'\\]|\\.)*)',\s*note:\s*(\d+)\s*\}/g;
  let m;
  while ((m = itemRegex.exec(match[1])) !== null) {
    items.push({
      nom: m[1].replace(/\\'/g, "'"),
      texte: m[2].replace(/\\'/g, "'"),
      note: parseInt(m[3], 10)
    });
  }
  return items.length > 0 ? items : null;
};

// Extraction d'un objet imbriqué (comptage d'accolades)
const extractNestedObject = (block, fieldName) => {
  const startRegex = new RegExp(`${fieldName}:\\s*\\{`);
  const startMatch = block.match(startRegex);
  if (!startMatch) return null;
  const startIdx = startMatch.index + startMatch[0].length - 1;
  let depth = 0;
  for (let i = startIdx; i < block.length; i++) {
    if (block[i] === '{') depth++;
    else if (block[i] === '}') {
      depth--;
      if (depth === 0) return block.substring(startIdx, i + 1);
    }
  }
  return null;
};

// Extraction de pourquoiChoisir (objet imbriqué complexe)
const extractPourquoiChoisir = (block) => {
  const objStr = extractNestedObject(block, 'pourquoiChoisir');
  if (!objStr) return null;
  const title = extractString(objStr, 'title');
  const subtitle = extractString(objStr, 'subtitle');
  const features = [];
  const featRegex = /\{\s*icon:\s*'([^']+)',\s*title:\s*'((?:[^'\\]|\\.)*)',\s*description:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  let m;
  while ((m = featRegex.exec(objStr)) !== null) {
    features.push({
      icon: m[1],
      title: m[2].replace(/\\'/g, "'"),
      description: m[3].replace(/\\'/g, "'")
    });
  }
  return features.length > 0 ? { title, subtitle, features } : null;
};

// Échappement pour attributs HTML
const escapeHtmlAttr = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Échappement des doubles quotes pour JSON-LD
const escapeJsonLd = (str) => {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
};

// ============================================================
// CRITICAL CSS (identique à generateOptimizedStaticPages.js + extensions)
// ============================================================
const criticalCSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1a202c;background:#fff;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.hero{min-height:60vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:2.5rem 1.25rem;display:flex;align-items:center}
.hero-content{max-width:1200px;width:100%;margin:0 auto;display:grid;grid-template-columns:1fr;gap:2rem;align-items:center}
@media(min-width:768px){.hero-content{grid-template-columns:1.2fr 1fr;gap:3rem;padding:2rem 1.5rem}}
.hero h1{font-size:1.625rem;font-weight:800;margin-bottom:1rem;line-height:1.2;color:#fff;word-wrap:break-word;overflow-wrap:break-word;hyphens:auto}
@media(min-width:640px){.hero h1{font-size:1.875rem}}
@media(min-width:768px){.hero h1{font-size:2.5rem}}
.hero h2{font-size:1.0625rem;margin-bottom:1.75rem;opacity:0.98;font-weight:400;color:#fff}
@media(min-width:768px){.hero h2{font-size:1.375rem}}
.expert-card{background:rgba(255,255,255,0.18);backdrop-filter:blur(10px);border-radius:1.125rem;padding:1.75rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem;border:1px solid rgba(255,255,255,0.25)}
.expert-img{width:120px;height:120px;border-radius:50%;border:4px solid #fff;object-fit:cover;object-position:center 15%;box-shadow:0 8px 24px rgba(0,0,0,0.3);display:block}
.expert-name{font-size:1.25rem;font-weight:700;margin-bottom:0.25rem;color:#fff}
.expert-title{font-size:0.9375rem;opacity:0.95;line-height:1.5;color:#fff}
.expert-badges{display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;margin-top:0.5rem}
.badge{background:rgba(255,255,255,0.28);padding:0.5rem 0.875rem;border-radius:0.5rem;font-size:0.8125rem;white-space:nowrap;backdrop-filter:blur(5px);color:#fff;font-weight:500}
.btn{display:inline-block;padding:0.9375rem 1.875rem;border-radius:0.5rem;font-weight:600;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;border:none;cursor:pointer;font-size:1.0625rem;text-align:center;-webkit-tap-highlight-color:transparent}
.btn-primary{background:#10b981;color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.25)}
.btn-primary:hover,.btn-primary:focus{background:#059669;transform:translateY(-2px);box-shadow:0 8px 20px rgba(16,185,129,0.35)}
.btn-white{background:#fff;color:#667eea;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.btn-white:hover,.btn-white:focus{background:#f8fafc;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1.25rem;max-width:1200px;margin:2.5rem auto;padding:0 1.25rem}
@media(min-width:768px){.stats{grid-template-columns:repeat(3,1fr);gap:1.5rem}}
.stat-card{background:#f8fafc;padding:1.5rem 1.25rem;border-radius:0.75rem;border-left:4px solid #667eea;transition:transform 0.2s,box-shadow 0.2s}
.stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}
.stat-label{display:block;font-size:0.8125rem;color:#475569;margin-bottom:0.625rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.stat-value{font-size:1.625rem;font-weight:700;color:#4f46e5;display:block}
.container{max-width:1200px;margin:0 auto;padding:2.5rem 1.25rem}
@media(min-width:768px){.container{padding:3rem 1.5rem}}
.section-title{font-size:1.75rem;font-weight:700;color:#1a202c;margin-bottom:2rem;text-align:center}
@media(min-width:768px){.section-title{font-size:2.25rem}}
.cta-section{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:3.5rem 1.25rem;text-align:center;margin:3.5rem 0}
.cta-section h3{font-size:1.75rem;margin-bottom:1rem;font-weight:700;color:#fff}
@media(min-width:768px){.cta-section h3{font-size:2.25rem}}
.cta-section p{font-size:1.0625rem;margin-bottom:1.75rem;opacity:0.98;color:#fff}
@media(min-width:768px){.cta-section p{font-size:1.25rem}}
.description{max-width:900px;margin:0 auto}
.description h3{font-size:1.375rem;font-weight:600;color:#1e293b;margin:2.25rem 0 1rem}
.description p{font-size:1rem;color:#475569;margin-bottom:1.5rem;line-height:1.75}
.description ul{list-style:none;padding:0;margin:1.5rem 0}
.description li{padding:0.625rem 0 0.625rem 1.875rem;position:relative;font-size:1rem;color:#1e293b;line-height:1.7}
.description li:before{content:"✓";position:absolute;left:0;color:#10b981;font-weight:700;font-size:1.125rem}
/* Header Navigation */
.site-header{background:#000;padding:0.75rem 0;position:sticky;top:0;z-index:1000;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.header-container{max-width:1200px;margin:0 auto;padding:0 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.logo-link{display:flex;align-items:center;text-decoration:none}
.logo-img{height:3rem;width:auto}
@media(min-width:640px){.logo-img{height:4rem}}
@media(min-width:1024px){.logo-img{height:5rem}}
.nav-links{display:none;gap:1.5rem;align-items:center}
@media(min-width:768px){.nav-links{display:flex}}
.nav-link{color:#fff;text-decoration:none;font-size:0.9375rem;font-weight:500;transition:color 0.2s;white-space:nowrap}
.nav-link:hover{color:#10b981}
.nav-btn{background:#10b981;color:#fff;padding:0.625rem 1.25rem;border-radius:0.5rem;font-weight:600;text-decoration:none;font-size:0.9375rem;transition:all 0.2s;white-space:nowrap}
.nav-btn:hover{background:#059669;transform:translateY(-1px)}
.mobile-menu-btn{display:flex;background:transparent;border:none;color:#fff;cursor:pointer;padding:0.5rem}
@media(min-width:768px){.mobile-menu-btn{display:none}}
.mobile-menu{display:none;position:fixed;top:4.5rem;left:0;right:0;background:#1a1a1a;padding:1rem;flex-direction:column;gap:0.75rem;box-shadow:0 4px 12px rgba(0,0,0,0.2)}
.mobile-menu.active{display:flex}
.mobile-nav-link{color:#fff;text-decoration:none;padding:0.75rem 1rem;font-size:1rem;font-weight:500;border-radius:0.5rem;transition:background 0.2s}
.mobile-nav-link:hover{background:rgba(255,255,255,0.1)}
/* Thematic specific */
.scpi-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
.scpi-card{background:#fff;border:1px solid #e2e8f0;border-radius:0.75rem;padding:1.5rem;transition:transform 0.2s,box-shadow 0.2s}
.scpi-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.1)}
.scpi-card-name{font-size:1.25rem;font-weight:700;color:#1a202c;margin-bottom:0.75rem}
.scpi-card-stats{display:flex;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap}
.scpi-card-stat-label{font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}
.scpi-card-stat-value{font-size:1.125rem;font-weight:600;color:#4f46e5}
.scpi-card-link{display:inline-block;color:#667eea;text-decoration:none;font-weight:600;font-size:0.9375rem;transition:color 0.2s}
.scpi-card-link:hover{color:#4f46e5;text-decoration:underline}
.faq-section details{margin-bottom:0.75rem;border:1px solid #e2e8f0;border-radius:0.5rem;overflow:hidden}
.faq-section summary{padding:1rem 1.25rem;font-weight:600;color:#1a202c;cursor:pointer;background:#f8fafc;transition:background 0.2s;list-style:none}
.faq-section summary::-webkit-details-marker{display:none}
.faq-section summary:hover{background:#f1f5f9}
.faq-section .faq-answer{padding:1rem 1.25rem;color:#475569;line-height:1.75;font-size:0.9375rem}
.temoignages-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
.temoignage-card{background:#f8fafc;border-radius:0.75rem;padding:1.5rem;border:1px solid #e2e8f0}
.temoignage-nom{font-weight:700;color:#1a202c;margin-bottom:0.5rem;font-size:1.0625rem}
.temoignage-texte{color:#475569;font-size:0.9375rem;line-height:1.7;margin-bottom:0.75rem;font-style:italic}
.temoignage-stars{color:#f59e0b;font-size:1.125rem;letter-spacing:2px}
.benefits-list{list-style:none;padding:0;margin:1rem 0}
.benefits-list li{padding:0.5rem 0 0.5rem 2rem;position:relative;font-size:1rem;color:#1e293b;line-height:1.7}
.benefits-list li:before{content:"✓";position:absolute;left:0;color:#10b981;font-weight:700;font-size:1.125rem}
.pourquoi-section .features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem}
.feature-card{background:#f8fafc;border-radius:0.75rem;padding:1.5rem;text-align:center;border:1px solid #e2e8f0;transition:transform 0.2s}
.feature-card:hover{transform:translateY(-2px)}
.feature-card h4{font-size:1.125rem;font-weight:600;color:#1a202c;margin:0.75rem 0 0.5rem}
.feature-card p{font-size:0.9375rem;color:#64748b;line-height:1.6}
.site-footer{background:#111;color:#9ca3af;padding:1.5rem;text-align:center;font-size:0.875rem}
.site-footer a{color:#9ca3af;text-decoration:underline;transition:color 0.2s}
.site-footer a:hover{color:#fff}
`;

// ============================================================
// GENERATEUR HTML STATIQUE COMPLET
// ============================================================

const generateThematicHTML = (slug, pageData, resolvedScpis) => {
  const baseUrl = 'https://maximusscpi.com';
  const pageUrl = `${baseUrl}/${slug}/`;
  const title = pageData.title || slug;
  const metaDescription = pageData.metaDescription || `Découvrez notre guide sur ${slug}`;

  // ---- Sections conditionnelles ----

  // Key metrics
  let keyMetricsHTML = '';
  if (pageData.keyMetrics && pageData.keyMetrics.length > 0) {
    keyMetricsHTML = `
    <div class="stats">
      ${pageData.keyMetrics.map(km => `
      <div class="stat-card">
        <span class="stat-label">${km.label}</span>
        <span class="stat-value">${km.value}</span>
      </div>`).join('\n      ')}
    </div>`;
  }

  // Benefits
  let benefitsHTML = '';
  if (pageData.benefits && pageData.benefits.length > 0) {
    benefitsHTML = `
      <ul class="benefits-list">
        ${pageData.benefits.map(b => `<li>${b}</li>`).join('\n        ')}
      </ul>`;
  }

  // PourquoiChoisir
  let pourquoiHTML = '';
  if (pageData.pourquoiChoisir) {
    const pc = pageData.pourquoiChoisir;
    pourquoiHTML = `
    <div class="pourquoi-section container" style="padding-top:0">
      ${pc.title ? `<h2 class="section-title">${pc.title}</h2>` : ''}
      ${pc.subtitle ? `<p style="text-align:center;color:#64748b;margin-bottom:2rem;font-size:1.0625rem">${pc.subtitle}</p>` : ''}
      ${pc.features && pc.features.length > 0 ? `
      <div class="features-grid">
        ${pc.features.map(f => `
        <div class="feature-card">
          <h4>${f.title}</h4>
          <p>${f.description}</p>
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>`;
  }

  // SCPI cards
  let scpiCardsHTML = '';
  if (resolvedScpis && resolvedScpis.length > 0) {
    scpiCardsHTML = `
    <div class="container">
      <h2 class="section-title">Les SCPI concernées</h2>
      <div class="scpi-cards">
        ${resolvedScpis.map(scpi => `
        <div class="scpi-card">
          <div class="scpi-card-name">${scpi.name}</div>
          <div class="scpi-card-stats">
            <div>
              <span class="scpi-card-stat-label">Rendement 2024</span>
              <span class="scpi-card-stat-value">${scpi.yield}%</span>
            </div>
            <div>
              <span class="scpi-card-stat-label">Capitalisation</span>
              <span class="scpi-card-stat-value">${scpi.capitalisation.toFixed(0)}M€</span>
            </div>
          </div>
          <div style="margin-bottom:0.75rem;font-size:0.875rem;color:#64748b">
            ${scpi.societeGestion}
          </div>
          <a href="/${scpi.slug}/" class="scpi-card-link">Voir la fiche complète →</a>
        </div>`).join('\n        ')}
      </div>
    </div>`;
  }

  // FAQ
  let faqHTML = '';
  let faqSchemaJSON = '';
  if (pageData.faq && pageData.faq.length > 0) {
    faqHTML = `
    <div class="container">
      <h2 class="section-title">Questions fréquentes</h2>
      <div class="faq-section">
        ${pageData.faq.map(item => `
        <details>
          <summary>${item.question}</summary>
          <div class="faq-answer">${item.answer}</div>
        </details>`).join('\n        ')}
      </div>
    </div>`;

    faqSchemaJSON = `,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        ${pageData.faq.map(item => `{
          "@type": "Question",
          "name": "${escapeJsonLd(item.question)}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${escapeJsonLd(item.answer)}"
          }
        }`).join(',\n        ')}
      ]
    }`;
  }

  // Témoignages
  let temoignagesHTML = '';
  if (pageData.temoignages && pageData.temoignages.length > 0) {
    temoignagesHTML = `
    <div class="container">
      <h2 class="section-title">Ils nous font confiance</h2>
      <div class="temoignages-grid">
        ${pageData.temoignages.map(t => {
          const stars = '★'.repeat(t.note) + '☆'.repeat(5 - t.note);
          return `
        <div class="temoignage-card">
          <div class="temoignage-nom">${t.nom}</div>
          <div class="temoignage-texte">"${t.texte}"</div>
          <div class="temoignage-stars">${stars}</div>
        </div>`;
        }).join('\n        ')}
      </div>
    </div>`;
  }

  // ---- HTML complet ----
  return `<!doctype html>
<html lang="fr" translate="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <link rel="icon" type="image/png" href="/Logo MaximusSCPI.com.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Critical Performance Optimizations for Google Ads -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://calendly.com">
    <link rel="dns-prefetch" href="https://elfsightcdn.com">

    <title>${escapeHtmlAttr(title)}</title>
    <meta name="description" content="${escapeHtmlAttr(metaDescription)}" />
    <meta name="keywords" content="${slug.split('-').join(', ')}, comparateur SCPI, investissement SCPI" />

    <!-- SEO Optimization -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Eric Bellaiche - MaximusSCPI" />
    <meta name="language" content="fr" />
    <link rel="alternate" hreflang="fr" href="${pageUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtmlAttr(title)}" />
    <meta property="og:description" content="${escapeHtmlAttr(metaDescription)}" />
    <meta property="og:image" content="https://maximusscpi.com/3-barres.svg" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${pageUrl}" />
    <meta property="twitter:title" content="${escapeHtmlAttr(title)}" />
    <meta property="twitter:description" content="${escapeHtmlAttr(metaDescription)}" />
    <meta property="twitter:image" content="https://maximusscpi.com/3-barres.svg" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${pageUrl}" />

    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N2JLWKH');</script>
    <!-- End Google Tag Manager -->

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": "${escapeJsonLd(title)}",
      "description": "${escapeJsonLd(metaDescription)}",
      "url": "${pageUrl}",
      "provider": {
        "@type": "Organization",
        "name": "MaximusSCPI",
        "url": "https://maximusscpi.com"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    }${faqSchemaJSON}
    </script>

    <!-- Inline Critical CSS for FCP < 1.5s -->
    <style>${criticalCSS}</style>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N2JLWKH"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <!-- Site Header -->
    <header class="site-header">
      <div class="header-container">
        <a href="/" class="logo-link">
          <img src="/maximus-logo.svg" alt="MaximusSCPI" class="logo-img" />
        </a>

        <nav class="nav-links">
          <a href="/" class="nav-link">Comparateur</a>
          <a href="/comprendre-les-scpi" class="nav-link">Comprendre les SCPI</a>
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
        <a href="/faq" class="mobile-nav-link">FAQ</a>
        <a href="/qui-sommes-nous" class="mobile-nav-link">Qui sommes-nous</a>
        <a href="https://calendly.com/eric-bellaiche/rdv-strategique-scpi" class="mobile-nav-link" rel="noopener" style="background:#10b981;text-align:center">Prendre RDV</a>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div>
          <h1>${pageData.heroTitle || title}</h1>
          ${pageData.heroSubtitle ? `<h2>${pageData.heroSubtitle}</h2>` : ''}
          ${benefitsHTML}
          <div style="margin-top:2rem">
            <a href="#contact" class="btn btn-primary">✓ Obtenir un Conseil Gratuit</a>
          </div>
        </div>
      </div>
    </section>

    ${keyMetricsHTML}
    ${pourquoiHTML}
    ${scpiCardsHTML}
    ${faqHTML}
    ${temoignagesHTML}

    <!-- Expert Profile Section -->
    <section style="background-color: white; padding: 3rem 1rem; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto;">
        <img
          src="/images/eric-192.webp"
          alt="Eric Bellaiche - Expert SCPI MaximusSCPI"
          style="width: 180px; height: 180px; border-radius: 50%; margin: 0 auto 1.5rem auto; display: block;"
          loading="lazy"
        >
        <h3 style="font-size: 1.75rem; font-weight: bold; color: #1a1a1a; margin-bottom: 0.5rem;">Eric Bellaiche</h3>
        <p style="font-size: 1.1rem; color: #4b5563; margin-bottom: 0.25rem;">Conseiller en Gestion de Patrimoine et en Investissements Financiers</p>
        <p style="font-size: 0.95rem; color: #6b7280;">Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience</p>
      </div>
    </section>

    <!-- CTA Section -->
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

    <!-- Footer -->
    <footer class="site-footer">
      <p>© 2026 MaximusSCPI — <a href="/">Comparateur SCPI</a> • <a href="/comprendre-les-scpi">Comprendre les SCPI</a></p>
    </footer>

    <!-- Deferred Scripts for Performance -->
    <script>
      // Mobile menu toggle
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

      // CTA smooth scroll
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

    <!-- Calendly Event Listener (idempotent) -->
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

    <!-- Lead Submit Helper with Enhanced Conversions (idempotent) -->
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
// GENERATION PRINCIPALE
// ============================================================

const generatePages = () => {
  console.log('🚀 Génération des landing pages thématiques optimisées (HTML statique complet)...\n');

  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Charger les SCPI depuis le fichier JSON
  const scpiDataPath = path.join(__dirname, '../src/data/scpi_complet.json');
  const scpiData = JSON.parse(fs.readFileSync(scpiDataPath, 'utf-8'));

  // Indexer les SCPI par slug
  const scpiBySlug = {};
  scpiData.forEach(scpi => {
    const scpiSlug = createSlugFromName(scpi['Nom SCPI']);
    scpiBySlug[scpiSlug] = scpi;
  });

  let generatedCount = 0;

  // Charger les données thématiques
  const thematicFilePath = path.join(__dirname, '../src/data/thematicLandingPages.ts');
  const thematicFile = fs.readFileSync(thematicFilePath, 'utf-8');

  priorityThematicPages.forEach(slug => {
    // Extraire le bloc du slug depuis le fichier TypeScript (comptage d'accolades)
    const slugBlock = extractSlugBlock(thematicFile, slug);

    let pageData;

    if (slugBlock) {
      // Extraire tous les champs
      const title = extractString(slugBlock, 'title');
      const metaDescription = extractString(slugBlock, 'metaDescription');
      const heroTitle = extractString(slugBlock, 'heroTitle');
      const heroSubtitle = extractString(slugBlock, 'heroSubtitle');
      const keyMetrics = extractKeyMetrics(slugBlock);
      const benefits = extractStringArray(slugBlock, 'benefits');
      const faq = extractFaq(slugBlock);
      const temoignages = extractTemoignages(slugBlock);
      const relatedScpi = extractStringArray(slugBlock, 'relatedScpi');
      const pourquoiChoisir = extractPourquoiChoisir(slugBlock);

      pageData = {
        slug,
        title: title || `SCPI ${slug}`,
        metaDescription: metaDescription || `Découvrez notre guide sur ${slug}`,
        heroTitle: heroTitle || '',
        heroSubtitle: heroSubtitle || '',
        keyMetrics,
        benefits,
        faq,
        temoignages,
        relatedScpi,
        pourquoiChoisir
      };
    } else {
      // Fallback si slug absent du fichier
      pageData = {
        slug,
        title: `SCPI ${slug}`,
        metaDescription: `Découvrez notre guide sur ${slug}`,
        heroTitle: slug,
        heroSubtitle: '',
        keyMetrics: null,
        benefits: null,
        faq: null,
        temoignages: null,
        relatedScpi: null,
        pourquoiChoisir: null
      };
    }

    // Résoudre les SCPI liées
    const resolvedScpis = [];
    if (pageData.relatedScpi && pageData.relatedScpi.length > 0) {
      pageData.relatedScpi.forEach(scpiSlug => {
        const scpi = scpiBySlug[scpiSlug];
        if (scpi) {
          resolvedScpis.push({
            slug: scpiSlug,
            name: scpi['Nom SCPI'],
            yield: scpi['Taux de distribution (%)'] != null ? scpi['Taux de distribution (%)'] : 'N/C',
            capitalisation: scpi['Capitalisation (M€)'] != null ? scpi['Capitalisation (M€)'] : 0,
            societeGestion: scpi['Société de gestion'] || ''
          });
        }
        // Ignorer silencieusement les slugs sans correspondance
      });
    }

    // Créer le répertoire
    const pageDir = path.join(distDir, slug);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // Générer le HTML statique complet
    const htmlContent = generateThematicHTML(slug, pageData, resolvedScpis);
    const htmlPath = path.join(pageDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent);

    generatedCount++;
    console.log(`✅ ${slug} → /${slug}/ (${resolvedScpis.length} SCPI liées)`);
  });

  console.log(`\n✅ ${generatedCount} landing pages thématiques générées en HTML statique complet\n`);

  // Récapitulatif
  const summaryPath = path.join(__dirname, '../THEMATIC_PAGES_OPTIMIZED.md');
  const summary = `# 🚀 Landing Pages Thématiques Optimisées (HTML Statique Complet)

## ✅ Pages Générées (${generatedCount})

${priorityThematicPages.map((slug) => {
  return `- [https://maximusscpi.com/${slug}/](https://maximusscpi.com/${slug}/)
`;
}).join('')}

## 📊 Performance

- **Format**: SSG (Static Site Generation) — HTML statique complet, zéro React
- **Lighthouse Score Target**: 95+
- **Temps de chargement**: < 1s
- **SEO**: Optimisé avec Schema.org (FinancialProduct + FAQPage si applicable)
- **Google Ads**: Tracking intégré

## 🎯 Optimisations Appliquées

1. **HTML Statique Pré-rendu**
   - Aucun JavaScript initial
   - Chargement instantané du contenu
   - SEO optimal

2. **Critical CSS Inline**
   - Styles critiques dans le \`<head>\`
   - Suppression du FOUC
   - First Contentful Paint rapide

3. **Contenu complet en dur**
   - Hero + Key Metrics + SCPI cards + FAQ + Témoignages + CTA
   - Zéro spinner, zéro bundle React
   - Header et footer en dur

4. **Schema.org enrichi**
   - FinancialProduct
   - FAQPage (si FAQ présentes)

## 🔄 Mise à Jour

Pour régénérer les pages :
\`\`\`bash
npm run build
\`\`\`

Les pages sont automatiquement générées dans \`dist/\`.

---

Généré le ${new Date().toLocaleString('fr-FR')}
`;

  fs.writeFileSync(summaryPath, summary);
  console.log(`📄 Rapport généré: THEMATIC_PAGES_OPTIMIZED.md\n`);
};

// Exécuter
generatePages();
