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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#e2e8f0;background:#111827;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.hero{min-height:60vh;background:linear-gradient(135deg,#1e3a5f 0%,#111827 100%);color:#fff;padding:2.5rem 1.25rem;display:flex;align-items:center}
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
.btn-white{background:#fff;color:#10b981;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.btn-white:hover,.btn-white:focus{background:#e2e8f0;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1.25rem;max-width:1200px;margin:2.5rem auto;padding:0 1.25rem}
@media(min-width:768px){.stats{grid-template-columns:repeat(3,1fr);gap:1.5rem}}
.stat-card{background:#1e2533;padding:1.5rem 1.25rem;border-radius:0.75rem;border-left:4px solid #10b981;transition:transform 0.2s,box-shadow 0.2s}
.stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.3)}
.stat-label{display:block;font-size:0.8125rem;color:#64748b;margin-bottom:0.625rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.stat-value{font-size:1.625rem;font-weight:700;color:#10b981;display:block}
.container{max-width:1200px;margin:0 auto;padding:2.5rem 1.25rem}
@media(min-width:768px){.container{padding:3rem 1.5rem}}
.section-title{font-size:1.75rem;font-weight:700;color:#fff;margin-bottom:2rem;text-align:center}
@media(min-width:768px){.section-title{font-size:2.25rem}}
.cta-section{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:3.5rem 1.25rem;text-align:center;margin:3.5rem 0}
.cta-section h3{font-size:1.75rem;margin-bottom:1rem;font-weight:700;color:#fff}
@media(min-width:768px){.cta-section h3{font-size:2.25rem}}
.cta-section p{font-size:1.0625rem;margin-bottom:1.75rem;opacity:0.98;color:#fff}
@media(min-width:768px){.cta-section p{font-size:1.25rem}}
.description{max-width:900px;margin:0 auto}
.description h3{font-size:1.375rem;font-weight:600;color:#e2e8f0;margin:2.25rem 0 1rem}
.description p{font-size:1rem;color:#94a3b8;margin-bottom:1.5rem;line-height:1.75}
.description ul{list-style:none;padding:0;margin:1.5rem 0}
.description li{padding:0.625rem 0 0.625rem 1.875rem;position:relative;font-size:1rem;color:#cbd5e1;line-height:1.7}
.description li:before{content:"✓";position:absolute;left:0;color:#10b981;font-weight:700;font-size:1.125rem}
/* Header Navigation */
.site-header{background:#0f172a;padding:0.75rem 0;position:sticky;top:0;z-index:1000;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
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
.scpi-card{background:#1e2533;border:1px solid #2d3748;border-radius:0.75rem;padding:1.5rem;transition:transform 0.2s,box-shadow 0.2s}
.scpi-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
.scpi-card-name{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:0.75rem}
.scpi-card-stats{display:flex;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap}
.scpi-card-stat-label{font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}
.scpi-card-stat-value{font-size:1.125rem;font-weight:600;color:#10b981}
.scpi-card-link{display:inline-block;color:#3b82f6;text-decoration:none;font-weight:600;font-size:0.9375rem;transition:color 0.2s}
.scpi-card-link:hover{color:#60a5fa;text-decoration:underline}
.faq-section details{margin-bottom:0.75rem;border:1px solid #2d3748;border-radius:0.5rem;overflow:hidden}
.faq-section summary{padding:1rem 1.25rem;font-weight:600;color:#fff;cursor:pointer;background:#1e2533;transition:background 0.2s;list-style:none}
.faq-section summary::-webkit-details-marker{display:none}
.faq-section summary:hover{background:#253044}
.faq-section .faq-answer{padding:1rem 1.25rem;color:#94a3b8;line-height:1.75;font-size:0.9375rem}
.temoignages-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
.temoignage-card{background:#1e2533;border-radius:0.75rem;padding:1.5rem;border:1px solid #2d3748}
.temoignage-nom{font-weight:700;color:#fff;margin-bottom:0.5rem;font-size:1.0625rem}
.temoignage-texte{color:#94a3b8;font-size:0.9375rem;line-height:1.7;margin-bottom:0.75rem;font-style:italic}
.temoignage-stars{color:#f59e0b;font-size:1.125rem;letter-spacing:2px}
.benefits-list{list-style:none;padding:0;margin:1rem 0}
.benefits-list li{padding:0.5rem 0 0.5rem 2rem;position:relative;font-size:1rem;color:#cbd5e1;line-height:1.7}
.benefits-list li:before{content:"✓";position:absolute;left:0;color:#10b981;font-weight:700;font-size:1.125rem}
.pourquoi-section .features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem}
.feature-card{background:#1e2533;border-radius:0.75rem;padding:1.5rem;text-align:center;border:1px solid #2d3748;transition:transform 0.2s}
.feature-card:hover{transform:translateY(-2px)}
.feature-card h4{font-size:1.125rem;font-weight:600;color:#fff;margin:0.75rem 0 0.5rem}
.feature-card p{font-size:0.9375rem;color:#94a3b8;line-height:1.6}
.site-footer{background:#0f172a;color:#9ca3af;padding:1.5rem;text-align:center;font-size:0.875rem}
.site-footer a{color:#9ca3af;text-decoration:underline;transition:color 0.2s}
.site-footer a:hover{color:#fff}
`;

// ============================================================
// SOCIETY PAGE CSS (dark design system #111827)
// ============================================================
const societyCSS = `
body.society-page{background:#111827;color:#9ca3af}
.society-hero{min-height:55vh;background:linear-gradient(135deg,#1e3a5f 0%,#111827 100%);color:#fff;padding:3rem 1.25rem 2.5rem;display:flex;align-items:center}
.society-hero-wrap{max-width:1200px;width:100%;margin:0 auto}
.society-breadcrumb{font-size:0.875rem;margin-bottom:1.5rem;opacity:0.7}
.society-breadcrumb a{color:#93c5fd;text-decoration:none}
.society-breadcrumb a:hover{text-decoration:underline}
.society-hero h1{font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;line-height:1.25;color:#fff;word-wrap:break-word;overflow-wrap:break-word;hyphens:auto}
@media(min-width:768px){.society-hero h1{font-size:2.5rem}}
.society-hero-subtitle{font-size:1.0625rem;opacity:0.85;margin-bottom:2rem;color:#cbd5e1;font-weight:400}
@media(min-width:768px){.society-hero-subtitle{font-size:1.25rem}}
.society-hero-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:2rem}
@media(min-width:768px){.society-hero-stats{grid-template-columns:repeat(3,1fr);gap:1.25rem}}
.society-hero-stat{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:0.75rem;padding:1.25rem;text-align:center;backdrop-filter:blur(8px)}
.society-hero-stat-value{font-size:1.5rem;font-weight:700;color:#10b981;display:block}
.society-hero-stat-label{font-size:0.8125rem;color:#94a3b8;margin-top:0.25rem;display:block}
.society-cta-btn{display:inline-block;background:#10b981;color:#fff;padding:0.9375rem 1.875rem;border-radius:0.5rem;font-weight:600;text-decoration:none;font-size:1.0625rem;transition:background 0.2s,transform 0.2s;text-align:center}
.society-cta-btn:hover{background:#059669;transform:translateY(-2px)}
.society-section{padding:3rem 1.25rem;max-width:1200px;margin:0 auto}
.society-section h2{font-size:1.625rem;font-weight:700;color:#fff;margin-bottom:1.5rem;border-left:4px solid #10b981;padding-left:1rem}
@media(min-width:768px){.society-section h2{font-size:2rem}}
.society-section h2.accent-blue{border-left-color:#3b82f6}
.society-section h2.accent-yellow{border-left-color:#f59e0b}
.society-presentation p{font-size:1.0625rem;color:#9ca3af;line-height:1.8;margin-bottom:1.5rem;max-width:900px}
.society-two-col{display:grid;grid-template-columns:1fr;gap:1.5rem;margin-top:1.5rem}
@media(min-width:768px){.society-two-col{grid-template-columns:1fr 1fr}}
.society-col{background:#1e2533;border:1px solid #2d3748;border-radius:0.75rem;padding:1.5rem}
.society-col h3{font-size:1.125rem;font-weight:600;margin-bottom:1rem;color:#fff}
.society-col ul{list-style:none;padding:0}
.society-col li{padding:0.5rem 0;color:#9ca3af;font-size:0.9375rem;line-height:1.6}
.society-col-strong li:before{content:"✅ ";color:#10b981;margin-right:0.25rem}
.society-col-warn li:before{content:"⚠️ ";color:#f59e0b;margin-right:0.25rem}
.society-scpi-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;margin-top:0}
.society-scpi-card{background:#1e2533;border:1px solid #2d3748;border-radius:0.75rem;padding:1.5rem;transition:transform 0.2s,border-color 0.2s;border-left:3px solid #10b981}
.society-scpi-card:hover{transform:translateY(-3px);border-color:#10b981}
.society-scpi-card-name{font-size:1.125rem;font-weight:700;color:#fff;margin-bottom:0.75rem}
.society-scpi-card-stats{display:flex;gap:1.5rem;margin-bottom:0.75rem;flex-wrap:wrap}
.society-scpi-card-stat-label{font-size:0.75rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;display:block}
.society-scpi-card-stat-value{font-size:1.0625rem;font-weight:600;color:#10b981;display:block}
.society-scpi-card-link{display:inline-block;color:#3b82f6;text-decoration:none;font-weight:600;font-size:0.9375rem;transition:color 0.2s}
.society-scpi-card-link:hover{color:#60a5fa;text-decoration:underline}
.society-avis{background:#1e3a5f;border:1px solid #2d4a6e;border-radius:0.75rem;padding:2rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem;margin-top:1rem}
@media(min-width:768px){.society-avis{flex-direction:row;align-items:flex-start}}
.society-avis-text{flex:1}
.society-avis-text h3{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:0.75rem}
.society-avis-text p{font-size:1rem;color:#93c5fd;line-height:1.7;font-style:italic}
.society-avis-expert{text-align:center;min-width:140px}
.society-avis-expert img{width:80px;height:80px;border-radius:50%;border:3px solid #60a5fa;object-fit:cover;object-position:center 15%;margin-bottom:0.5rem;display:block;margin-left:auto;margin-right:auto}
.society-avis-expert-name{font-size:0.9375rem;font-weight:600;color:#fff}
.society-avis-expert-orias{font-size:0.75rem;color:#93c5fd;margin-top:0.25rem}
.society-faq details{background:#1e2533;border:1px solid #2d3748;border-radius:0.5rem;margin-bottom:0.75rem;overflow:hidden}
.society-faq summary{padding:1rem 1.25rem;font-weight:600;color:#e2e8f0;cursor:pointer;transition:background 0.2s;list-style:none;font-size:1rem}
.society-faq summary::-webkit-details-marker{display:none}
.society-faq summary:hover{background:#253044}
.society-faq .society-faq-answer{padding:1rem 1.25rem;color:#9ca3af;line-height:1.75;font-size:0.9375rem;border-top:1px solid #2d3748}
.society-cta-final{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:3.5rem 1.25rem;text-align:center;margin:2rem 0 0 0}
.society-cta-final h3{font-size:1.75rem;margin-bottom:1rem;font-weight:700}
@media(min-width:768px){.society-cta-final h3{font-size:2.25rem}}
.society-footer{background:#0f172a;color:#6b7280;padding:1.5rem;text-align:center;font-size:0.875rem;line-height:1.8}
.society-footer a{color:#9ca3af;text-decoration:underline;transition:color 0.2s}
.society-footer a:hover{color:#fff}
body.society-page .site-header{background:#0f172a}
.scpi-detail-card{background:#1e2533;border:1px solid #2d3748;border-radius:0.75rem;padding:1.5rem;margin-bottom:1.5rem}
.scpi-detail-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem}
.scpi-detail-name{font-size:1.25rem;font-weight:700;color:#fff}
.scpi-detail-badge{font-size:0.75rem;background:rgba(16,185,129,0.13);color:#10b981;padding:0.25rem 0.5rem;border-radius:0.25rem;white-space:nowrap}
.scpi-detail-desc{font-size:0.9375rem;color:#94a3b8;line-height:1.7;margin-bottom:1rem}
.scpi-detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;margin-bottom:1rem}
@media(min-width:480px){.scpi-detail-grid{grid-template-columns:repeat(3,1fr)}}
.scpi-detail-grid .scpi-stat-label{display:block;font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.25rem}
.scpi-detail-grid .scpi-stat-value{display:block;font-size:1rem;font-weight:600;color:#10b981}
.scpi-detail-geo,.scpi-detail-sector{font-size:0.875rem;color:#94a3b8;margin-bottom:0.5rem;line-height:1.6}
.scpi-detail-section-label{font-weight:600;color:#cbd5e1;margin-right:0.5rem}
.scpi-detail-link{display:inline-block;color:#3b82f6;text-decoration:none;font-weight:600;margin-top:1rem;font-size:0.9375rem;transition:color 0.2s}
.scpi-detail-link:hover{color:#60a5fa;text-decoration:underline}
`;

// ============================================================
// CONTENU ÉDITORIAL PAR SOCIÉTÉ DE GESTION (dark design)
// ============================================================
const societyContent = {
  'amundi-immobilier-scpi': {
    specialite: "Leader français de la SCPI patrimoniale avec 6Md€ sous gestion",
    presentation: "Amundi Immobilier est la filiale immobilière d'Amundi, premier gestionnaire d'actifs européen. Avec 2 SCPI emblématiques, elle cible les investisseurs recherchant sécurité et patrimoine de qualité.",
    points_forts: ["Solidité du groupe Amundi (Crédit Agricole)", "Patrimoine diversifié bureaux/commerces", "Longue track-record (30+ ans)"],
    points_vigilance: ["Rendements en baisse (3.5% moyen)", "Exposition majoritaire France", "Capitalisation élevée = mouvements lents"],
    avis_cgp: "Amundi Immobilier convient aux profils défensifs cherchant la sécurité du groupe plutôt que la performance. À TMI 11-30%, les SCPI européennes surperforment nettement.",
    faq: [["Edissimo est-elle une bonne SCPI ?","Edissimo est solide mais affiche un rendement de 3.53%, inférieur aux nouvelles SCPI européennes. Pertinente pour un profil très défensif ou en assurance-vie."],["Peut-on souscrire en assurance-vie ?","Oui, Edissimo et Rivoli Avenir Patrimoine sont disponibles dans de nombreux contrats d'assurance-vie."],["Quel profil pour Amundi Immobilier ?","Investisseur patrimonial, TMI 11-30%, horizon 10+ ans, priorité à la stabilité sur la performance."]]
  },
  'atream-scpi': {
    specialite: "Spécialiste de l'hôtellerie et du tourisme en Europe",
    presentation: "Atream est un gestionnaire indépendant spécialisé dans l'immobilier hôtelier et touristique. Sa SCPI Atream Hotel cible les actifs hospitality avec une approche pan-européenne.",
    points_forts: ["Expertise sectorielle unique hôtellerie", "Diversification européenne", "Secteur en fort rebond post-Covid"],
    points_vigilance: ["Mono-secteur = risque concentré", "Sensibilité aux cycles touristiques", "Liquidité limitée sur ce segment"],
    avis_cgp: "Atream Hotel est une niche intéressante en complément d'un portefeuille SCPI diversifié. Ne pas dépasser 20% d'allocation sur ce secteur cyclique.",
    faq: [["Atream Hotel est-elle risquée ?","Le secteur hôtelier est cyclique. La SCPI a bien rebondi post-Covid mais reste sensible aux crises du tourisme. Horizon minimum 10 ans."],["Quel rendement pour Atream Hotel ?","Le TD 2024 est de 5.05% brut, en ligne avec les SCPI diversifiées françaises."],["En assurance-vie ou en direct ?","En direct pour bénéficier d'une éventuelle déductibilité, en AV pour la liquidité. À analyser selon votre TMI."]]
  },
  'consultim-asset-management-scpi': {
    specialite: "Gestionnaire indépendant spécialisé dans les SCPI à rendement",
    presentation: "Consultim Asset Management gère la SCPI Optimale, positionnée sur les actifs tertiaires avec un objectif de rendement élevé. Gestionnaire de taille intermédiaire en croissance.",
    points_forts: ["Rendement cible attractif (6.5%)", "Approche sélective des actifs", "Équipe de gestion indépendante"],
    points_vigilance: ["Capitalisation encore modeste (92M€)", "Track-record court", "Liquidité à surveiller"],
    avis_cgp: "Optimale est une SCPI récente à suivre. Le rendement est attractif mais la taille modeste implique une liquidité réduite. À positionner en complément d'une SCPI établie.",
    faq: [["Qu'est-ce que la SCPI Optimale ?","Optimale est gérée par Consultim AM, avec un TD de 6.5% et une capitalisation de 92M€. Profil rendement, horizon 10 ans minimum."],["Consultim est-il un gestionnaire sérieux ?","Oui, agréé AMF, mais taille modeste. À monitorer sur la durée."],["Comment souscrire à Optimale ?","Via un conseiller en gestion de patrimoine ou en direct. Contactez-nous pour une analyse de compatibilité avec votre profil."]]
  },
  'fiducial-gerance-scpi': {
    specialite: "Gestionnaire historique français spécialisé commerce et bureaux",
    presentation: "FIDUCIAL Gérance est une société de gestion appartenant au groupe FIDUCIAL, expert comptable et financier. Elle gère 3 SCPI positionnées sur commerces de proximité et bureaux régionaux.",
    points_forts: ["Appui du groupe FIDUCIAL", "Diversification commerces/bureaux", "Présence en régions"],
    points_vigilance: ["Rendements moyens (4.78%)", "Exposition aux commerces physiques", "Capitalisation modérée"],
    avis_cgp: "Les SCPI FIDUCIAL conviennent aux investisseurs cherchant une exposition aux commerces de proximité résiliants. Rendement modeste mais régulier.",
    faq: [["Buroboutic est-elle toujours pertinente ?","Buroboutic Métropoles mixe bureaux et commerces en zones urbaines. TD stable mais inférieur aux nouvelles SCPI. Profil défensif."],["Ficommerce Proximité : quel risque ?","Exposition aux commerces de proximité, secteur plus résilient que les grands centres commerciaux. Risque modéré."],["Quel horizon pour les SCPI FIDUCIAL ?","Minimum 8 ans, idéalement 12-15 ans pour lisser les cycles immobiliers."]]
  },
  'greenman-arth-scpi': {
    specialite: "Pionnier de l'immobilier alimentaire durable en Europe",
    presentation: "GREENMAN ARTH est un gestionnaire franco-irlandais spécialisé dans la grande distribution alimentaire. Sa SCPI GMA Essentialis investit exclusivement dans des supermarchés et alimentations en Europe.",
    points_forts: ["Niche défensive : alimentation = besoins essentiels", "Baux longs (10-15 ans)", "Locataires solides (grands distributeurs)"],
    points_vigilance: ["Capitalisation faible (45M€)", "Mono-thématique = risque sectoriel", "Rendement de 4% en dessous du marché"],
    avis_cgp: "GMA Essentialis est originale mais trop petite pour être positionnée seule. Intéressante en diversification pour son profil défensif alimentaire. Attendre 200M€+ de capitalisation.",
    faq: [["Pourquoi investir dans des supermarchés ?","Les supermarchés ont des baux longs avec des locataires solides. C'est un actif défensif peu sensible aux cycles économiques."],["GMA Essentialis est-elle disponible en AV ?","La disponibilité en assurance-vie est limitée vu la taille. Vérifiez avec votre contrat."],["Quel rendement pour GMA Essentialis ?","4.0% brut en 2024. Inférieur aux SCPI européennes diversifiées mais avec un profil risque très faible."]]
  },
  'inter-gestion-reim-scpi': {
    specialite: "Spécialiste de la SCPI résidentielle et diversifiée depuis 1983",
    presentation: "Inter Gestion REIM est l'un des plus anciens gestionnaires de SCPI français, créé en 1983. Il gère notamment Grand Paris Résidentiel, unique SCPI résidentielle du marché.",
    points_forts: ["Track-record exceptionnel (40+ ans)", "Unique SCPI résidentielle (Grand Paris)", "Gestion patrimoniale stable"],
    points_vigilance: ["Rendements faibles sur le résidentiel", "Grand Paris Résidentiel à 0% (valorisation)", "Cristal Rente peu liquide"],
    avis_cgp: "Inter Gestion REIM est intéressant pour sa longévité et son positionnement résidentiel unique. Grand Paris Résidentiel est une SCPI de valorisation, pas de rendement.",
    faq: [["Grand Paris Résidentiel distribue-t-elle des loyers ?","Très peu (0%). C'est une SCPI de valorisation capitalisant sur l'immobilier résidentiel parisien."],["Cristal Rente est-elle liquide ?","La liquidité est limitée. Comptez 2-4 mois pour une revente. Capital fixe."],["Quel profil pour Inter Gestion ?","Patrimoniaux long terme (15+ ans), TMI élevé souhaitant une valorisation plutôt que du revenu."]]
  },
  'kyaneos-asset-management-scpi': {
    specialite: "Pionnier de la SCPI résidentielle responsable et ISR",
    presentation: "KYANEOS ASSET MANAGEMENT gère Kyaneos Pierre, unique SCPI résidentielle ISR du marché français. Approche impact investing sur le logement, avec rénovation énergétique systématique.",
    points_forts: ["Label ISR", "Immobilier résidentiel = besoin fondamental", "Rénovation énergétique = valorisation"],
    points_vigilance: ["Rendement de 4.35% modeste", "Fiscalité résidentielle France = charges PS", "Liquidité réduite (logements individuels)"],
    avis_cgp: "Kyaneos Pierre est unique sur son segment ISR résidentiel. Pertinente pour les investisseurs sensibles à l'impact, mais le rendement est inférieur aux SCPI européennes.",
    faq: [["Kyaneos Pierre est-elle vraiment ISR ?","Oui, certifiée ISR, avec des critères de rénovation énergétique stricts sur chaque acquisition."],["Quel rendement net pour Kyaneos Pierre ?","4.35% brut. Net TMI 30% : ~2.5%. Les SCPI européennes offrent mieux fiscalement."],["Comment fonctionne la rénovation énergétique ?","Kyaneos rénove chaque bien aux normes BBC avant location, augmentant la valeur et les loyers."]]
  },
  'magellim-reim-scpi': {
    specialite: "Expert de la SCPI médicale et santé en France",
    presentation: "MAGELLIM REIM gère Foncière des Praticiens, SCPI spécialisée dans les maisons de santé, cliniques et cabinets médicaux. Un positionnement défensif sur la santé française.",
    points_forts: ["Secteur santé = demande structurelle", "Baux longs avec professionnels de santé", "Rendement correct (5.5%)"],
    points_vigilance: ["Capitalisation modeste (173M€)", "Concentration France = PS sur 100% des revenus", "Niche médicale = moins de sources d'actifs"],
    avis_cgp: "Foncière des Praticiens est solide sur son créneau médical. Bonne SCPI de diversification mais attention à la fiscalité France pour les TMI 30%+.",
    faq: [["La santé est-elle un bon secteur pour les SCPI ?","Oui, les professionnels de santé signent des baux longs (9-12 ans) et le secteur est peu sensible aux crises."],["Foncière des Praticiens vs Pierval Santé ?","Pierval Santé (Euryale) est plus grande (3.3Md€) et européenne. Foncière des Praticiens est plus concentrée France."],["Rendement net pour un TMI 30% ?","5.5% brut → ~3.2% net PS + IR. Préférer via assurance-vie pour optimiser."]]
  },
  'norma-capital-scpi': {
    specialite: "Spécialiste des SCPI fiscales et de diversification",
    presentation: "Norma Capital est un gestionnaire indépendant proposant 3 SCPI complémentaires : NCap Régions (bureaux/commerces), NCap Education Santé (santé/éducation) et NCap Continent (diversifiée).",
    points_forts: ["3 SCPI complémentaires", "Exposition éducation/santé défensive", "Frais compétitifs"],
    points_vigilance: ["Capitalisations encore modestes", "Track-record en construction", "Liquidité à surveiller"],
    avis_cgp: "Norma Capital propose une gamme intéressante. NCap Education Santé est particulièrement pertinente pour sa résilience sectorielle. Gestionnaire à surveiller sur sa croissance.",
    faq: [["Quelle différence entre NCap Régions et NCap Continent ?","NCap Régions cible bureaux/commerces en province. NCap Continent est plus diversifiée géographiquement en Europe."],["Les SCPI Norma Capital sont-elles disponibles en AV ?","La disponibilité est limitée. Contactez-nous pour vérifier la compatibilité avec votre contrat."],["Quel rendement moyen pour Norma Capital ?","5.78% moyen sur les 3 SCPI en 2024."]]
  },
  'paref-gestion-scpi': {
    specialite: "Gestionnaire historique spécialisé en immobilier tertiaire et résidentiel",
    presentation: "PAREF GESTION est une société de gestion cotée en bourse (groupe Sinarmas), gérant 4 SCPI dont Novapierre 1 (commerces Paris) et Paref Evo (bureaux Europe).",
    points_forts: ["Diversité de l'offre (résidentiel, bureaux, commerces)", "Novapierre 1 : actifs prime Paris", "Paref Evo : exposition européenne"],
    points_vigilance: ["Rendements inégaux selon SCPI", "Novapierre Résidentiel : rendement très faible", "Liquidité variable"],
    avis_cgp: "PAREF GESTION offre une gamme hétérogène. Paref Evo est la plus intéressante fiscalement (européenne). Novapierre 1 pour les patrimoines parisiens défensifs.",
    faq: [["Novapierre 1 distribue-t-elle des revenus ?","Oui, axé commerces parisiens prime. TD modeste mais actifs très sécurisés."],["Paref Evo est-elle européenne ?","Oui, Paref Evo investit en Europe continentale, avec avantage fiscal PS 0% sur revenus étrangers."],["Novapierre Résidentiel : bonne idée ?","Très faible rendement. À éviter si vous cherchez des revenus. Plutôt une SCPI de valorisation."]]
  },
  'praemia-reim-france-scpi': {
    specialite: "Gestionnaire santé et hospitalité, présent en Europe",
    presentation: "Praemia REIM France (ex-Primonial REIM) gère 4 SCPI dont Primovie (santé), Praemia Hôtels Europe (hospitalité) et Patrimmo Commerce (commerces). Groupe en restructuration depuis 2023.",
    points_forts: ["Primovie : 3.3Md€, leader santé", "Diversification secteurs défensifs", "Présence européenne sur l'hospitalité"],
    points_vigilance: ["Groupe en restructuration (ex-Primonial)", "Rendements en baisse (3.77% moyen)", "Patrimmo Commerce sous pression"],
    avis_cgp: "Praemia est en transition. Primovie reste solide malgré la baisse de rendement. Éviter Patrimmo Commerce actuellement. Attendre la stabilisation du groupe avant de renforcer.",
    faq: [["Primovie est-elle toujours recommandée ?","Primovie reste une valeur refuge sur la santé malgré un rendement en baisse à 4%. Horizon 12+ ans."],["Praemia a-t-il changé de nom ?","Oui, ex-Primonial REIM rebaptisé Praemia REIM France en 2023 suite à la restructuration du groupe."],["Patrimmo Commerce : faut-il vendre ?","La situation est difficile. Consultez votre CGP avant toute décision de cession."]]
  },
  'remake-asset-management-scpi': {
    specialite: "Pionnier du recyclage urbain et de la transformation immobilière",
    presentation: "Remake Asset Management est un gestionnaire indépendant créé en 2020, spécialisé dans la transformation de friches urbaines (Remake Live) et l'immobilier britannique (Remake UK 2025). Approche ISR forte.",
    points_forts: ["Remake Live : 7.05%, ISR, 882M€", "Innovation : recyclage urbain = création de valeur", "Remake UK : diversification hors zone euro"],
    points_vigilance: ["Remake UK 2025 : capitalisation de 19M€, très récent", "Remake UK : capital fixe, liquidité secondaire", "Risque de change GBP sur Remake UK"],
    avis_cgp: "Remake Live est l'une des meilleures SCPI du marché en 2026 — rendement, ISR, gestion active. Remake UK 2025 est intéressante en diversification GBP pour les profils dynamiques.",
    faq: [["Remake Live est-elle ISR ?","Oui, certifiée ISR. L'approche recyclage urbain transforme des friches en actifs modernes."],["Remake UK 2025 : quel risque de change ?","Les loyers et la valeur des parts sont en GBP. Un affaiblissement de la livre sterling impacte le rendement en euros."],["Peut-on combiner Remake Live et Remake UK ?","Oui, c'est une combinaison cohérente : ISR France + diversification UK. Budget minimum recommandé : 5000€."]]
  },
  'swiss-life-am-france-scpi': {
    specialite: "Gestionnaire ISR spécialisé immobilier durable",
    presentation: "Swiss Life AM France gère ESG Pierre Capital, SCPI 100% ISR investissant dans des actifs immobiliers répondant aux critères ESG stricts du groupe Swiss Life. Approche qualitative et sélective.",
    points_forts: ["Label ISR", "Appui groupe Swiss Life (assureur AAA)", "Sélection qualitative des actifs"],
    points_vigilance: ["Capitalisation modeste (117M€)", "TD de 5.22% dans la moyenne", "Track-record court"],
    avis_cgp: "ESG Pierre Capital bénéficie de la solidité de Swiss Life mais reste petite. Bonne option pour les investisseurs ISR cherchant un groupe institutionnel de référence.",
    faq: [["ESG Pierre Capital est-elle vraiment ISR ?","Oui, certifiée ISR avec des critères ESG stricts appliqués à chaque acquisition."],["Quel rendement pour ESG Pierre Capital ?","5.22% brut en 2024, dans la moyenne du marché."],["Swiss Life AM gère-t-elle d'autres SCPI ?","En France, ESG Pierre Capital est la seule SCPI du groupe. Swiss Life gère aussi des fonds immobiliers institutionnels."]]
  },
  'theoreim-scpi': {
    specialite: "Spécialiste de la logistique et de l'immobilier industriel en Europe",
    presentation: "THEOREIM gère Log In, SCPI spécialisée dans la logistique urbaine et les entrepôts de dernière génération en Europe. Positionnement sur la mégatendance e-commerce.",
    points_forts: ["Logistique = mégatendance e-commerce", "Baux longs (8-12 ans) avec grands acteurs", "Rendement de 6.21%"],
    points_vigilance: ["Capitalisation modeste (241M€)", "Niche logistique = concentration sectorielle", "Sensibilité aux cycles e-commerce"],
    avis_cgp: "Log In est une SCPI sectorielle convaincante sur la logistique. Bonne diversification en complément de SCPI de bureaux ou diversifiées. Ne pas dépasser 25% d'allocation.",
    faq: [["La logistique est-elle un bon secteur SCPI ?","Oui, la croissance de l'e-commerce soutient une demande structurelle en entrepôts. Baux longs avec locataires solides."],["Log In vs une SCPI logistique classique ?","Log In se distingue par la logistique urbaine (last-mile delivery), segment premium avec moins d'offre disponible."],["Quel rendement net pour Log In ?","6.21% brut. Revenus européens = PS 0% potentiel selon pays. Net TMI 30% : ~4.5%."]]
  },
  'urban-premium-scpi': {
    specialite: "Expert du commerce de centre-ville et retail premium",
    presentation: "Urban Premium gère Urban Coeur de Commerce, SCPI spécialisée dans les commerces de centre-ville premium (pied d'immeuble haussmannien, rues commerçantes) en France.",
    points_forts: ["Positionnement premium = locataires solides", "Commerce physique premium résilient", "Actifs de centre-ville à forte valeur"],
    points_vigilance: ["Capitalisation modeste (92M€)", "Exposition 100% France = PS sur 100% revenus", "Commerce physique vs e-commerce"],
    avis_cgp: "Urban Coeur de Commerce est pertinente pour les TMI faibles (11%) ou en assurance-vie. Pour TMI 30%+, préférer une SCPI européenne. Le positionnement premium est défensif.",
    faq: [["Urban Premium vs une grande SCPI de commerces ?","Urban Premium est plus sélective sur les emplacements premium. Plus défensive mais moins diversifiée."],["Commerce de centre-ville : quel avenir ?","Les commerces prime de centre-ville résistent mieux que les centres commerciaux. L'alimentaire et le luxe tiennent bien."],["Quel rendement pour Urban Coeur de Commerce ?","5.3% brut en 2024."]]
  }
};

// ============================================================
// DESCRIPTIONS ENRICHIES PAR SCPI (pour les cards détaillées)
// ============================================================
const scpiDescriptions = {
  'Edissimo': "SCPI bureaux ISR positionnée à 88% sur Paris et l'Île-de-France, avec 3Md€ de patrimoine. Rendement stable (3.63%) mais orientation très France = fiscalité IR + PS. Profil défensif, horizon 12+ ans.",
  'Rivoli Avenir Patrimoine': "Grande SCPI patrimoniale Amundi (2.9Md€), profil très sécuritaire. Rendement de 3.46% reflète la qualité prime des actifs. Idéale en assurance-vie pour les profils défensifs TMI 30%+.",
  'Atream Hotel': "SCPI hôtelière pan-européenne (France 33%, Allemagne 30%, Belgique 23%, Pays-Bas 14%), 100% TOF. TD de 5.05% avec frais de gestion élevés (10%). Profil de niche, horizon minimum 10 ans.",
  'Optimale': "SCPI diversifiée ISR sur métropoles françaises (bureaux 43%, commerces 29%, logistique 23%). TD attractif de 6.5%, capitalisation en croissance (92M€). Frais d'entrée de 10%, min 1500€.",
  'Buroboutic Métropoles': "SCPI mixte bureaux/commerces ISR (53% régions, 32% IDF). TD de 5.1%, TOF solide à 93.85%. Frais de gestion HT élevés (9.5%). Minimum d'entrée 2300€, délai jouissance 3 mois.",
  'Ficommerce Proximité': "Spécialiste commerces de proximité ISR (84% commerces). Large présence régionale et parisienne. TD 5.1%, TOF 94.56%. Frais souscription 12%, accessible dès 700€.",
  'Selectipierre 2': "SCPI bureaux Paris premium (71% Paris, 23% IDF). TD plus faible (4.14%) reflétant la qualité des actifs prime. Min élevé (7730€), délai jouissance 6 mois. Profil patrimonial long terme.",
  'GMA Essentialis': "SCPI alimentaire SFDR Article 9 (90% alimentaire, France 51% + Allemagne 49%). TOF excellent (99.7%) avec locataires grande distribution. TD de 4% pour un profil très défensif. Min 2060€.",
  'Cristal Life': "SCPI diversifiée ISR pan-européenne (7 pays). Commerces 33%, Bureaux 30%, Hôtellerie 17%, Santé 16%. TD de 6.54%, TOF 95.57%. Bonne alternative aux SCPI mono-secteur. Min 2250€.",
  'Grand Paris Résidentiel': "SCPI résidentielle de valorisation (0% de distribution). 100% logement en IDF (87%) et régions. Capital fixe, horizon 15+ ans. À éviter si vous cherchez des revenus réguliers. Accessible dès 200€.",
  'Cristal Rente': "SCPI de rendement SFDR Art.8 avec TOF solide à 98.99%. TD de 5%, profil équilibré. Bonne option pour un complément de revenu régulier. Gestionnaire historique depuis 1983.",
  'Kyaneos Pierre': "Seule SCPI résidentielle ISR du marché (80% résidentiel, 100% France). Rénovation énergétique systématique. TD de 4.35%, TOF 88.9%. Min 2240€. Fiscalité 100% France = PS sur tous les revenus.",
  'Foncière des Praticiens': "SCPI médicale ISR (cabinets, maisons de santé, cliniques). France 70% + Belgique 30%. TD 5.5%, TOF 96.7%. Baux longs avec professionnels de santé. Min 1100€, délai jouissance 5 mois.",
  'NCap Régions': "Grande SCPI ISR sur métropoles provinciales et IDF (bureaux 54%, commerce 32%). TD de 5.72%, TOF 91.6%. Frais gestion très bas (0.65%). Min 3350€, délai jouissance 6 mois.",
  'NCap Education Santé': "SCPI thématique ISR (santé 66%, bien-être 16%, éducation 16%). TD de 4.52%, TOF 96%. Profil très défensif sur besoins essentiels. Frais gestion bas (0.56%). Min 2020€.",
  'NCap Continent': "SCPI diversifiée géographiquement, TOF 100%, TD attractif de 7.1%. Capitalisation encore modeste (71.5M€). Profil rendement, à suivre sur sa montée en puissance. SFDR Art.8.",
  'Novapierre 1': "SCPI commerces prime (alimentaire 15%, santé 10%) sur Paris et métropoles régionales. TD de 5%, TOF 85.3%. SFDR Art.6, profil patrimonial. Frais souscription compétitifs (8%). Min non précisé.",
  'Novapierre Résidentiel': "SCPI résidentielle 100% de valorisation (1.2% TD, quasi zéro distribution). 77% Paris intra-muros. Capital fixe, à éviter pour les chercheurs de revenus. Horizon 20 ans minimum.",
  'Paref Evo': "SCPI européenne ISR 100% Pologne (bureaux 90%). TD de 4.72%, TOF 87.8%. Exposition mono-pays = risque concentré. Capitalisation modeste (49.3M€). SFDR Art.8, revenus polonais potentiellement hors PS.",
  'Paref Hexa': "SCPI bureaux ISR sur métropoles régionales (56%) et IDF (26%). TD de 6%, TOF 84.9%. Mix bureaux (67%) et activités (25%). Capitalisation 201M€, min non précisé.",
  'Primovie': "Leader SCPI santé avec 4.2M€ de patrimoine géré (ex-Primonial, désormais Praemia). TD de 4.04% en baisse, TOF solide 94.7%. Incontournable sur la thématique santé malgré la restructuration du groupe.",
  'Praemia Hôtels Europe': "SCPI hôtelière européenne (252.5M€), TD de 3.9%, TOF 97.7%. Positionnement hospitalité premium. Groupe en transition (ex-Primonial). Frais souscription 9%. SFDR Art.8.",
  'Patrimmo Commerce': "SCPI commerces en difficulté structurelle. TD de 3.38%, capitalisation 613.7M€. TOF de 91%, groupe en restructuration. À éviter pour nouveaux investissements jusqu'à stabilisation.",
  'Patrimmo Croissance Impact': "SCPI résidentielle ISR SFDR Art.9 (100% logement, 0% TD). Valorisation pure sur immobilier résidentiel Paris/IDF. Min élevé (11.76% frais souscription). Horizon très long terme (20+ ans).",
  'ESG Pierre Capital': "SCPI ISR Swiss Life diversifiée (bureaux 20%, logistique 24%, services 27%). TD 5.22%, TOF 96.28%, capitalisation 117M€. Présence France + Allemagne. Frais souscription 12%. Appui groupe AAA.",
  'Log In': "SCPI logistique ISR pan-européenne (France 37%, Allemagne 25%, UK 13%, Italie). TD 6.21%, TOF 100%, frais souscription 12%. Profil rendement sur mégatendance e-commerce. Min non précisé.",
  'Urban Coeur de Commerce': "SCPI commerces premium ISR de centre-ville (province 83%, IDF 17%). TD 5.3%, TOF 91.95%. Locataires services et alimentaire. Frais souscription 11.8%. 100% France = PS sur tous les revenus.",
  'Remake Live': "SCPI ISR de recyclage urbain. TD 7.05% avec 882M€ de capitalisation. Transformation de friches en actifs modernes. Profil rendement + impact. Min non précisé.",
  'Remake UK 2025': "SCPI britannique capital fixe. TD non encore établi (création 2025), capitalisation 19M€. Diversification GBP hors zone euro. Risque de change. Profil dynamique, min 5000€."
};

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
    ${faqSchemaJSON ? '[' : ''}
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
    }${faqSchemaJSON ? `,
    ${faqSchemaJSON.replace(/^,\s*/, '')}
  ]` : ''}
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
          <img src="/Maximus logo 250x50 4.svg" alt="MaximusSCPI" class="logo-img" />
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
    <section style="background-color: #1e2533; padding: 3rem 1rem; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto;">
        <img
          src="/images/eric-192.webp"
          alt="Eric Bellaiche - Expert SCPI MaximusSCPI"
          style="width: 180px; height: 180px; border-radius: 50%; margin: 0 auto 1.5rem auto; display: block;"
          loading="lazy"
        >
        <h3 style="font-size: 1.75rem; font-weight: bold; color: #fff; margin-bottom: 0.5rem;">Eric Bellaiche</h3>
        <p style="font-size: 1.1rem; color: #94a3b8; margin-bottom: 0.25rem;">Conseiller en Gestion de Patrimoine et en Investissements Financiers</p>
        <p style="font-size: 0.95rem; color: #94a3b8;">Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience</p>
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
// GENERATEUR HTML PAGES SOCIÉTÉ (dark design system)
// ============================================================

const generateSocietyHTML = (slug, content, resolvedScpis) => {
  const baseUrl = 'https://maximusscpi.com';
  const pageUrl = `${baseUrl}/${slug}/`;

  // Extraire le nom de la société depuis le slug
  const societyName = slug
    .replace(/-scpi$/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const title = `SCPI ${societyName} — Analyse 2026`;
  const metaDescription = `${societyName} : ${content.specialite}. Découvrez l'analyse complète de ses SCPI, rendements, avis CGP et fiscalité.`;

  // Stats hero
  const scpiCount = resolvedScpis.length;
  const totalCap = resolvedScpis.reduce((sum, s) => sum + (s.capitalisation || 0), 0);
  const avgYield = scpiCount > 0
    ? resolvedScpis.reduce((sum, s) => sum + (parseFloat(s.yield) || 0), 0) / scpiCount
    : 0;

  // Breadcrumb
  const breadcrumbHTML = `
    <div class="society-breadcrumb">
      <a href="/">Accueil</a> / ${societyName}
    </div>`;

  // Hero stats
  const heroStatsHTML = `
    <div class="society-hero-stats">
      <div class="society-hero-stat">
        <span class="society-hero-stat-value">${scpiCount}</span>
        <span class="society-hero-stat-label">SCPI au catalogue</span>
      </div>
      <div class="society-hero-stat">
        <span class="society-hero-stat-value">${totalCap.toFixed(0)} M€</span>
        <span class="society-hero-stat-label">Capitalisation totale</span>
      </div>
      <div class="society-hero-stat">
        <span class="society-hero-stat-value">${avgYield.toFixed(2)}%</span>
        <span class="society-hero-stat-label">TD moyen 2024</span>
      </div>
    </div>`;

  // Points forts / vigilance
  const pointsHTML = `
    <div class="society-two-col">
      <div class="society-col">
        <h3>✅ Points forts</h3>
        <ul class="society-col-strong">
          ${content.points_forts.map(p => `<li>${p}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="society-col">
        <h3>⚠️ Points de vigilance</h3>
        <ul class="society-col-warn">
          ${content.points_vigilance.map(p => `<li>${p}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>`;

  // SCPI cards (enriched)
  let scpiCardsHTML = '';
  if (resolvedScpis && resolvedScpis.length > 0) {
    scpiCardsHTML = resolvedScpis.map(scpi => `
    <div class="scpi-detail-card">
      <div class="scpi-detail-header">
        <h3 class="scpi-detail-name">${scpi.name}</h3>
        ${scpi.badge ? `<span class="scpi-detail-badge">${scpi.badge}</span>` : ''}
      </div>
      ${scpi.description ? `<p class="scpi-detail-desc">${scpi.description}</p>` : ''}
      <div class="scpi-detail-grid">
        <div><span class="scpi-stat-label">Rendement 2024</span><span class="scpi-stat-value">${scpi.yield}%</span></div>
        <div><span class="scpi-stat-label">Capitalisation</span><span class="scpi-stat-value">${typeof scpi.capitalisation === 'number' ? scpi.capitalisation.toFixed(0) : scpi.capitalisation} M€</span></div>
        <div><span class="scpi-stat-label">TOF</span><span class="scpi-stat-value">${typeof scpi.tof === 'number' ? scpi.tof.toFixed(2) : scpi.tof}%</span></div>
        <div><span class="scpi-stat-label">Frais entrée</span><span class="scpi-stat-value">${scpi.fraisSouscription}%</span></div>
        <div><span class="scpi-stat-label">Délai jouissance</span><span class="scpi-stat-value">${scpi.delaiJouissance} mois</span></div>
        <div><span class="scpi-stat-label">Min. souscription</span><span class="scpi-stat-value">${scpi.minSouscription}€</span></div>
      </div>
      ${scpi.geoText ? `<div class="scpi-detail-geo"><span class="scpi-detail-section-label">🌍 Géographie</span><span>${scpi.geoText}</span></div>` : ''}
      ${scpi.secteurText ? `<div class="scpi-detail-sector"><span class="scpi-detail-section-label">🏢 Secteurs</span><span>${scpi.secteurText}</span></div>` : ''}
      <a href="/${scpi.slug}/" class="scpi-detail-link">Voir la fiche complète →</a>
    </div>`).join('\n    ');
  }

  // FAQ
  let faqHTML = '';
  let faqSchemaJSON = '';
  if (content.faq && content.faq.length > 0) {
    faqHTML = `
      <div class="society-faq">
        ${content.faq.map(item => `
        <details>
          <summary>${item[0]}</summary>
          <div class="society-faq-answer">${item[1]}</div>
        </details>`).join('\n        ')}
      </div>`;

    faqSchemaJSON = `,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        ${content.faq.map(item => `{
          "@type": "Question",
          "name": "${escapeJsonLd(item[0])}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${escapeJsonLd(item[1])}"
          }
        }`).join(',\n        ')}
      ]
    }`;
  }

  // HTML complet
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

    <title>${escapeHtmlAttr(title)}</title>
    <meta name="description" content="${escapeHtmlAttr(metaDescription)}" />
    <meta name="keywords" content="${slug.split('-').join(', ')}, SCPI, comparateur SCPI, investissement SCPI" />

    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Eric Bellaiche - MaximusSCPI" />
    <meta name="language" content="fr" />
    <link rel="alternate" hreflang="fr" href="${pageUrl}" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtmlAttr(title)}" />
    <meta property="og:description" content="${escapeHtmlAttr(metaDescription)}" />
    <meta property="og:image" content="https://maximusscpi.com/3-barres.svg" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${pageUrl}" />
    <meta property="twitter:title" content="${escapeHtmlAttr(title)}" />
    <meta property="twitter:description" content="${escapeHtmlAttr(metaDescription)}" />
    <meta property="twitter:image" content="https://maximusscpi.com/3-barres.svg" />

    <link rel="canonical" href="${pageUrl}" />

    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N2JLWKH');</script>

    <script type="application/ld+json">
    ${faqSchemaJSON ? '[' : ''}
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
    }${faqSchemaJSON ? `,
    ${faqSchemaJSON.replace(/^,\s*/, '')}
  ]` : ''}
    </script>

    <style>${criticalCSS}${societyCSS}</style>
  </head>
  <body class="society-page">
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N2JLWKH"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <!-- Site Header -->
    <header class="site-header">
      <div class="header-container">
        <a href="/" class="logo-link">
          <img src="/Maximus logo 250x50 4.svg" alt="MaximusSCPI" class="logo-img" />
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

    <!-- 1. HERO -->
    <section class="society-hero">
      <div class="society-hero-wrap">
        ${breadcrumbHTML}
        <h1>SCPI ${societyName} — Analyse 2026</h1>
        <p class="society-hero-subtitle">${content.specialite}</p>
        ${heroStatsHTML}
        <a href="#contact" class="society-cta-btn">Analyser ma situation SCPI</a>
      </div>
    </section>

    <!-- 2. PRÉSENTATION SOCIÉTÉ -->
    <section class="society-section">
      <h2>🏢 Qui est ${societyName} ?</h2>
      <div class="society-presentation">
        <p>${content.presentation}</p>
      </div>
      ${pointsHTML}
    </section>

    <!-- 3. SCPI GÉRÉES -->
    <section class="society-section">
      <h2 class="accent-blue">Les SCPI ${societyName} en détail</h2>
      ${scpiCardsHTML}
    </section>

    <!-- 4. AVIS CGP -->
    <section class="society-section">
      <h2 class="accent-yellow">💡 L'avis d'Eric Bellaiche, CGP</h2>
      <div class="society-avis">
        <div class="society-avis-text">
          <p>"${content.avis_cgp}"</p>
        </div>
        <div class="society-avis-expert">
          <img
            src="/images/eric-192.webp"
            alt="Eric Bellaiche - Expert SCPI"
            loading="lazy"
          />
          <div class="society-avis-expert-name">Eric Bellaiche</div>
          <div class="society-avis-expert-orias">ORIAS 13001580</div>
          <div class="society-avis-expert-orias">CNCEF D016571</div>
        </div>
      </div>
    </section>

    <!-- 5. FAQ -->
    <section class="society-section">
      <h2>❓ Questions fréquentes</h2>
      ${faqHTML}
    </section>

    <!-- 6. CTA FINAL -->
    <section class="society-cta-final" id="contact">
      <h3>Prêt à investir avec ${societyName} ?</h3>
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

    <!-- 7. FOOTER -->
    <footer class="society-footer">
      <p>© 2026 MaximusSCPI | Eric Bellaiche | ORIAS 13001580 | CNCEF D016571</p>
      <p style="margin-top:0.5rem">
        <a href="/">Comparateur SCPI</a> • <a href="/comprendre-les-scpi">Comprendre les SCPI</a> • <a href="/faq">FAQ</a>
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
          const isrLabel = scpi['Label ISR'] || '';
          const sfdrArticle = scpi['Article SFDR'] || '';
          const sfdrArticleNum = typeof sfdrArticle === 'number' ? sfdrArticle : parseInt(sfdrArticle, 10);
          const badgeParts = [];
          if (isrLabel && isrLabel.toLowerCase() !== 'non') badgeParts.push('✅ ISR');
          if (sfdrArticleNum) badgeParts.push('SFDR Art.' + sfdrArticleNum);
          const badge = badgeParts.join(' ');

          resolvedScpis.push({
            slug: scpiSlug,
            name: scpi['Nom SCPI'],
            yield: scpi['Taux de distribution (%)'] != null ? scpi['Taux de distribution (%)'] : 'N/C',
            capitalisation: scpi['Capitalisation (M€)'] != null ? scpi['Capitalisation (M€)'] : 0,
            societeGestion: scpi['Société de gestion'] || '',
            description: scpiDescriptions[scpi['Nom SCPI']] || '',
            badge: badge,
            tof: scpi['TOF (%)'] != null ? scpi['TOF (%)'] : 'N/C',
            fraisSouscription: scpi['Frais de souscription (TTC/%)'] != null ? scpi['Frais de souscription (TTC/%)'] : 'N/C',
            delaiJouissance: scpi['Délai de jouissance (mois)'] != null ? scpi['Délai de jouissance (mois)'] : 'N/C',
            minSouscription: scpi['Minimum de souscription €'] != null ? scpi['Minimum de souscription €'] : 'N/C',
            geoText: scpi['Répartition Géographique'] || scpi['Pays principaux'] || '',
            secteurText: scpi['Répartition Sectorielle'] || ''
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

    // Générer le HTML statique complet (société ou standard)
    const isSociety = slug.endsWith('-scpi') && societyContent[slug];
    const htmlContent = isSociety
      ? generateSocietyHTML(slug, societyContent[slug], resolvedScpis)
      : generateThematicHTML(slug, pageData, resolvedScpis);
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
