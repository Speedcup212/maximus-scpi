import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Détection CI : skip en environnement Netlify / CI headless
if (process.env.CI || process.env.NETLIFY) {
  console.log('⚠️  Environnement CI détecté — generateArticlesFromTSX skippé');
  console.log('   Les HTML Puppeteer doivent être pré-générés localement et commités.');
  process.exit(0);
}

// ============================================================
// 0. VÉRIFICATION PUPPETEER
// ============================================================

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch (e) {
  console.error('⚠️ Puppeteer manquant. Lance : npm install puppeteer --save-dev');
  process.exit(1);
}

// ============================================================
// 1. PARSER articleTemplatesConfig.ts → métadonnées par slug
// ============================================================

const configPath = path.join(__dirname, '../src/data/articleTemplatesConfig.ts');
const configRaw = fs.readFileSync(configPath, 'utf-8');

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
    if (depth === 0) objects.push(text.substring(braceIdx, j));
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

const arrayMatch = configRaw.match(/export const articleTemplates[:\s]*ArticleTemplate\[\][\s]*=[\s]*\[([\s\S]*?)\n\];/);
const articleMetaMap = new Map();

if (arrayMatch) {
  const rawObjects = extractObjects(arrayMatch[1]);
  rawObjects.forEach(block => {
    const slug = extractString(block, 'slug');
    const title = extractString(block, 'title');
    if (!slug || !title) return;
    articleMetaMap.set(slug, {
      slug,
      title,
      metaDescription: extractString(block, 'metaDescription') || '',
      keywords: extractArray(block, 'keywords')
    });
  });
}
console.log(`✓ ${articleMetaMap.size} métadonnées parsées depuis articleTemplatesConfig.ts`);

// ============================================================
// 2. MÉTADONNÉES HARDCODÉES pour les pages éducatives hors config
// (extraits des appels renderEducationalScpiPage() dans App.tsx)
// ============================================================

const hardcodedMeta = {
  'societes-de-gestion-scpi': {
    title: 'Sociétés de gestion SCPI : liste, analyse et comparatif',
    metaDescription: 'Découvrez les principales sociétés de gestion de SCPI, leurs stratégies, leurs SCPI phares et les points de vigilance à connaître avant d\'investir.',
    keywords: ['société de gestion SCPI', 'gestionnaire SCPI', 'SCPI', 'comparatif gestionnaires', 'AMF']
  }
};

// ============================================================
// 3. MAPPING SLUG → URL
// ============================================================

const slugToUrl = {
  // Articles TSX (accessibles via /articles/<slug>/)
  '100000-euros-fonds-euros-cout-opportunite': '/articles/100000-euros-fonds-euros-cout-opportunite/',
  'rendement-scpi-2025-tdvm-taux-distribution': '/articles/rendement-scpi-2025-tdvm-taux-distribution/',
  'per-scpi-retraite-deduction-fiscale': '/articles/per-scpi-retraite-deduction-fiscale/',
  'scpi-ou-opci-differences-avantages': '/articles/scpi-ou-opci-differences-avantages/',
  'scpi-sante-seniors-ehpad-cliniques-investissement': '/articles/scpi-sante-seniors-ehpad-cliniques-investissement/',
  'investir-scpi-tmi-11-pourcent-fiscalite-optimale': '/articles/investir-scpi-tmi-11-pourcent-fiscalite-optimale/',
  'scpi-investir-en-couple': '/articles/scpi-investir-en-couple/',
  // Pages éducatives (accessibles via leur currentView slug)
  'scpi-tmi-41': '/scpi-tmi-41/',
  'societes-de-gestion-scpi': '/societes-de-gestion-scpi/',
  'liquidite-scpi': '/liquidite-scpi/',
  'scpi-credit-impot': '/scpi-credit-impot/',
  'scpi-assurance-vie': '/scpi-assurance-vie/',
  'orias-scpi': '/orias-scpi/',
  'scpi-comptant': '/scpi-comptant/',
  'meilleures-scpi-attention': '/meilleures-scpi-attention/',
  'decote-valeur-reconstitution-scpi': '/decote-valeur-reconstitution-scpi/',
  'gestionnaire-scpi': '/gestionnaire-scpi/',
  'scpi-logistique': '/scpi-logistique/',
};

const slugs = Object.keys(slugToUrl);

// ============================================================
// 4. CSS CRITIQUE INLINE (même que sofidy/index.html)
// ============================================================

const criticalCSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#e2e8f0;background:#111827;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.hero{min-height:55vh;background:linear-gradient(135deg,#1e3a5f 0%,#111827 100%);color:#fff;padding:3rem 1.25rem;display:flex;align-items:center}
@media(min-width:768px){.hero{padding:4rem 2rem}}
.hero-wrap{max-width:900px;width:100%;margin:0 auto}
.hero h1{font-size:1.75rem;font-weight:800;margin-bottom:1rem;line-height:1.2;color:#fff}
@media(min-width:768px){.hero h1{font-size:2.25rem}}
.hero-meta{font-size:0.9375rem;color:#93c5fd;margin-bottom:1.5rem;line-height:1.6}
.article-body{max-width:800px;margin:0 auto;padding:2.5rem 1.25rem}
.article-body h2{font-size:1.5rem;font-weight:700;color:#fff;margin:2.5rem 0 1rem;border-left:4px solid #10b981;padding-left:0.75rem}
.article-body h3{font-size:1.25rem;font-weight:600;color:#e2e8f0;margin:2rem 0 1rem}
.article-body p{font-size:1.0625rem;color:#94a3b8;line-height:1.85;margin-bottom:1.25rem}
.article-body ul{list-style:none;padding:0;margin:1rem 0 1.5rem}
.article-body li{padding:0.5rem 0 0.5rem 1.5rem;position:relative;color:#94a3b8;line-height:1.7;font-size:1.0625rem}
.article-body li:before{content:"\u2713";position:absolute;left:0;color:#10b981;font-weight:700}
.article-body strong{color:#e2e8f0}
.article-body .intro{font-size:1.125rem;color:#cbd5e1;line-height:1.85;margin-bottom:1.5rem;padding:1.25rem;background:#1e2533;border-radius:0.75rem;border:1px solid #2d3748}
.article-body .conclusion{font-size:1.0625rem;color:#cbd5e1;line-height:1.85;margin-top:2rem;padding:1.25rem;background:#1e3a5f;border-radius:0.75rem;border-left:4px solid #10b981}
.article-body .disclaimer{font-size:0.8125rem;color:#64748b;margin-top:1.5rem;line-height:1.6;border-top:1px solid #2d3748;padding-top:1rem}
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

// ============================================================
// 5. GÉNÉRATION HTML STATIQUE
// ============================================================

const escapeHtml = (str) => {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

const buildStaticHTML = (meta, capturedHtml) => {
  const pageUrl = `https://maximusscpi.com/articles/${meta.slug}/`;
  const fullTitle = `${meta.title} | MaximusSCPI`;
  const keywordsStr = (meta.keywords || []).join(', ');

  // Nettoyer le HTML capturé : supprimer les balises React (className conditions, etc.)
  let cleanHtml = capturedHtml
    // Supprimer les attributs React spécifiques
    .replace(/\s+className="[^"]*"/g, '')
    .replace(/\s+style="[^"]*"/g, '')
    .replace(/\s+data-[a-z-]+="[^"]*"/gi, '')
    // Supprimer les balises SVG inline (icons)
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    // Supprimer les div vides
    .replace(/<div[^>]*>\s*<\/div>/g, '')
    // Corriger les double class sur article-body
    .replace(/class="article-body article-body"/g, 'class="article-body"');

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

    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(meta.metaDescription)}" />
    <meta name="keywords" content="${escapeHtml(keywordsStr)}" />

    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Eric Bellaiche - MaximusSCPI" />
    <link rel="alternate" hreflang="fr" href="${pageUrl}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(meta.metaDescription)}" />
    <meta property="og:image" content="https://maximusscpi.com/3-barres.svg" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${pageUrl}" />
    <meta property="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta property="twitter:description" content="${escapeHtml(meta.metaDescription)}" />
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
      "headline": "${escapeHtml(meta.title)}",
      "description": "${escapeHtml(meta.metaDescription)}",
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
        <h1>${escapeHtml(meta.title)}</h1>
        <p class="hero-meta">${escapeHtml(meta.metaDescription)}</p>
        <a href="#contact" class="btn btn-primary">Analyser ma situation SCPI</a>
      </div>
    </section>

    <article class="article-body">
      ${cleanHtml}

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
// 6. GÉNÉRATION MARKDOWN
// ============================================================

const buildMD = (meta, textContent) => {
  let md = `# ${meta.title}\n\n`;
  md += `${meta.metaDescription}\n\n`;
  md += `${textContent.trim()}\n\n`;
  md += `---\n\n`;
  md += `*Article généré par MaximusSCPI — Conseiller en gestion de patrimoine agréé ORIAS n°13001580.*\n`;
  md += `*URL : https://maximusscpi.com/articles/${meta.slug}/*\n`;
  return md;
};

// ============================================================
// 7. DÉMARRAGE VITE DEV SERVER
// ============================================================

const startViteServer = () => {
  return new Promise((resolve, reject) => {
    const viteBin = path.join(__dirname, '../node_modules/.bin/vite');
    const viteProcess = spawn(viteBin, ['--port', '5174', '--force', '--strictPort'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let started = false;

    const onData = (data) => {
      const msg = data.toString();
      process.stdout.write(msg);
      if (!started && (msg.includes('Local') || msg.includes('localhost') || msg.includes('5174'))) {
        started = true;
        resolve(viteProcess);
      }
    };

    viteProcess.stdout.on('data', onData);
    viteProcess.stderr.on('data', onData);

    viteProcess.on('error', (err) => {
      reject(new Error(`Failed to start Vite preview: ${err.message}`));
    });

    viteProcess.on('exit', (code) => {
      if (!started) {
        reject(new Error(`Vite preview exited with code ${code} before starting`));
      }
    });

    setTimeout(() => {
      if (!started) reject(new Error('Vite preview timeout (60s)'));
    }, 60000);
  });
};

const waitForServer = (url, maxRetries = 120, interval = 500) => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else if (retries < maxRetries) {
          retries++;
          setTimeout(check, interval);
        } else {
          reject(new Error(`Server returned ${res.statusCode} after ${maxRetries} retries`));
        }
      }).on('error', () => {
        if (retries < maxRetries) {
          retries++;
          setTimeout(check, interval);
        } else {
          reject(new Error(`Server unreachable after ${maxRetries} retries`));
        }
      });
    };
    check();
  });
};

// ============================================================
// 8. CAPTURE DU CONTENU RENDU
// ============================================================

const captureArticles = async (browser, page) => {
  const articlesDir = path.join(__dirname, '../dist/articles');
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  let done = 0;
  let errors = 0;
  const results = [];

  // Ouvrir UNE page et préchauffer Vite
  await page.setViewport({ width: 1280, height: 800 });

  // Premier chargement : accueil pour déclencher le bundling Vite
  console.log('  🔥 Préchauffage Vite (home page)...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 8000));
  // Recharger après optimisation des deps
  await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  console.log('  ✓ Préchauffage terminé\n');

  for (const slug of slugs) {
    const url = `http://localhost:5174${slugToUrl[slug]}`;
    const meta = articleMetaMap.get(slug) || hardcodedMeta[slug];

    if (!meta) {
      console.log(`⚠ SKIP [${slug}] — aucune métadonnée trouvée`);
      errors++;
      continue;
    }

    try {
      console.log(`  🔍 [${slug}] → ${url}`);

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 25000 });
      await new Promise(r => setTimeout(r, 3000));
      console.log(`    page loaded, waiting for render...`);

      // Attendre que le contenu soit chargé (pas de spinner, pas de "Chargement...")
      try {
        await page.waitForFunction(
          () => {
            const bodyText = document.body ? document.body.innerText || '' : '';
            const hasSpinner = document.querySelector('[class*="spinner"]');
            const isLoading = bodyText === 'Chargement...' || bodyText.includes('Chargement en cours');
            return !hasSpinner && !isLoading && bodyText.trim().length > 200;
          },
          { timeout: 15000 }
        );
      } catch (e) {
        // Attendre 3s de plus en fallback
        console.log(`    ⏳ waitForFunction timeout, fallback sleep 3s...`);
        await new Promise(r => setTimeout(r, 3000));
      }

      // Extraire le contenu textuel visible
      const textContent = await page.evaluate(() => {
        // Supprimer header, footer, nav, scripts, styles, modals
        const removals = document.querySelectorAll(
          'nav, footer, script, style, head, noscript, ' +
          '[class*="modal"], [class*="modal"] div, iframe, ' +
          'header, [class*="Header"], [class*="header"]'
        );
        removals.forEach(el => { try { el.remove(); } catch(_) {} });
        return (document.body ? document.body.innerText : '').trim();
      });

      // Extraire le HTML du contenu principal
      let capturedHtml = await page.evaluate(() => {
        // Supprimer les éléments non-contenu
        const removals = document.querySelectorAll(
          'nav, footer, script, style, noscript, head, iframe, ' +
          'header, [class*="Modal"], [class*="modal"], ' +
          'a[href*="calendly"], [class*="rdv"], [class*="elfsight"]'
        );
        removals.forEach(el => { try { el.remove(); } catch(_) {} });

        // Cibler le contenu principal
        const mainSelectors = [
          'main',
          '[class*="article-body"]',
          '[class*="article_content"]',
          '[class*="educational"]',
          '[class*="scpi-page"]',
          '#root > div > div:nth-child(2)',
          '.container',
          '#root'
        ];
        for (const sel of mainSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            const innerLen = (el.innerText || '').trim().length;
            const htmlLen = (el.innerHTML || '').length;
            if (innerLen > 100 || htmlLen > 500) {
              // Nettoyer : supprimer les scripts/styles/nav/footer de l'intérieur
              const clone = el.cloneNode(true);
              const strip = clone.querySelectorAll(
                'script, style, nav, footer, header, iframe, ' +
                '[class*="modal"], [class*="rdv"], [class*="floating"]'
              );
              strip.forEach(s => { try { s.remove(); } catch(_) {} });
              return clone.innerHTML.trim();
            }
          }
        }
        // Fallback : tout le body après avoir nettoyé
        const body = document.body;
        if (body) {
          const clone = body.cloneNode(true);
          const strip = clone.querySelectorAll('script, style, nav, footer, header, iframe');
          strip.forEach(s => { try { s.remove(); } catch(_) {} });
          return clone.innerHTML.trim();
        }
        return '';
      });

      if (!capturedHtml) {
        capturedHtml = `<p>${meta.metaDescription}</p>`;
        console.log(`    ⚠️ contenu HTML vide — fallback sur metaDescription`);
      }

      // Construire le HTML final
      const finalHtml = buildStaticHTML(meta, capturedHtml);
      const finalMd = buildMD(meta, textContent);

      // Écrire les fichiers
      const pageDir = path.join(articlesDir, slug);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      fs.writeFileSync(path.join(pageDir, 'index.html'), finalHtml, 'utf-8');
      fs.writeFileSync(path.join(pageDir, 'index.md'), finalMd, 'utf-8');

      const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
      console.log(`    ✓ [${slug}] — ${wordCount} mots`);
      results.push({ slug, words: wordCount });

      done++;
    } catch (err) {
      console.error(`    ❌ ERREUR [${slug}] : ${err.message}`);
      errors++;
    }
  }

  return { done, errors, results };
};

// ============================================================
// 9. MAIN
// ============================================================

const main = async () => {
  console.log('🚀 GÉNÉRATION ARTICLES DEPUIS TSX (Puppeteer)\n');
  console.log(`📋 ${slugs.length} slugs à traiter\n`);

  // Démarrer Vite
  console.log('🔧 Démarrage Vite dev server...');
  const viteProcess = await startViteServer();
  console.log('✓ Vite dev server prêt sur :5174');

  await waitForServer('http://localhost:5174');
  console.log('✓ Serveur HTTP accessible\n');

  // Lancer Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('✓ Puppeteer lancé\n');

  try {
    const { done, errors, results } = await captureArticles(browser, page);

    console.log('\n─────────────────────────────');
    console.log(`✅ ${done} slugs traités`);
    if (errors > 0) console.log(`❌ ${errors} erreurs`);
    console.log('─────────────────────────────');
    console.log('\n📊 Détail :');
    results.forEach(r => console.log(`   ${r.slug} : ${r.words} mots`));
  } finally {
    await page.close();
    await browser.close();
    viteProcess.kill('SIGTERM');
    console.log('\n🧹 Nettoyage terminé.');
  }
};

main().catch(err => {
  console.error('❌ Erreur fatale:', err.message);
  process.exit(1);
});
