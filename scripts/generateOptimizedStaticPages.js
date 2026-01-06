import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import SCPI data
const scpiDataPath = path.join(__dirname, '../src/data/SCPI_complet_avec_SFDR_Profil.json');
const scpiDataJson = JSON.parse(fs.readFileSync(scpiDataPath, 'utf-8'));
const scpiData = scpiDataJson.Sheet1 || scpiDataJson;

// Helper functions
const parseGeoDistribution = (geoStr) => {
  try {
    return JSON.parse(geoStr);
  } catch {
    return {};
  }
};

const isEuropeanScpi = (geoStr) => {
  const geo = parseGeoDistribution(geoStr);
  const europeanCountries = [
    'Allemagne', 'Espagne', 'Italie', 'Pays-Bas', 'Pays bas', 'Belgique', 'Portugal',
    'Pologne', 'Irlande', 'Finlande', 'Europe', 'Royaume-Uni', 'Suisse'
  ];
  return Object.keys(geo).some(country =>
    europeanCountries.some(eu => country.toLowerCase().includes(eu.toLowerCase()))
  );
};

const determineSector = (repartitionStr) => {
  if (!repartitionStr) return 'diversifie';
  const lowerStr = repartitionStr.toLowerCase();

  if (lowerStr.includes('bureau') && !lowerStr.includes('commerce')) return 'bureaux';
  if (lowerStr.includes('commerce') || lowerStr.includes('retail')) return 'commerces';
  if (lowerStr.includes('résidentiel') || lowerStr.includes('residentiel') || lowerStr.includes('logement')) return 'residentiel';
  if (lowerStr.includes('santé') || lowerStr.includes('sante') || lowerStr.includes('ehpad')) return 'sante';
  if (lowerStr.includes('logistique') || lowerStr.includes('entrepôt')) return 'logistique';
  if (lowerStr.includes('hôtel') || lowerStr.includes('hotel') || lowerStr.includes('tourisme')) return 'hotellerie';

  return 'diversifie';
};

const createSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Advanced parser for all distribution formats
const parseAdvancedDistribution = (input) => {
  if (!input || input === 'null' || (typeof input === 'string' && input.trim() === '')) return null;

  const result = {};

  // Case 1: JSON format with values in keys (ex: {"Allemagne : 71": null, "6 %": null})
  if (typeof input === 'string' && input.startsWith('{')) {
    try {
      const obj = JSON.parse(input);
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Pattern: "Name : 71" followed by "6 %" = 71.6%
        const match = key.match(/^(.+?)\s*[:：]\s*([0-9,\.]+)/);
        if (match) {
          const name = match[1].trim();
          const valueStr = match[2].replace(',', '.');

          if (i + 1 < keys.length) {
            const nextKey = keys[i + 1];
            if (nextKey.includes('%')) {
              const percentMatch = nextKey.match(/([0-9,\.]+)/);
              if (percentMatch) {
                const decimal = percentMatch[1].replace(',', '.');
                const fullValue = parseFloat(valueStr + '.' + decimal);
                if (!isNaN(fullValue)) {
                  result[name] = fullValue;
                  i++;
                  continue;
                }
              }
            }
          }

          const value = parseFloat(valueStr);
          if (!isNaN(value)) {
            result[name] = value;
          }
        }
        // Pattern: "Régions (38" followed by "4%)"
        else if (key.match(/\(/)) {
          const nameMatch = key.match(/^(.+?)\s*\(([0-9,\.]+)/);
          if (nameMatch && i + 1 < keys.length) {
            const name = nameMatch[1].trim();
            const firstPart = nameMatch[2].replace(',', '.');
            const nextKey = keys[i + 1];
            const secondMatch = nextKey.match(/([0-9,\.]+)/);

            if (secondMatch) {
              const fullValue = parseFloat(firstPart + '.' + secondMatch[1].replace(',', '.'));
              if (!isNaN(fullValue)) {
                result[name] = fullValue;
                i++;
                continue;
              }
            }
          }
        }
      }

      if (Object.keys(result).length > 0) return result;

      // Normal parsing if correct values
      const hasValidValues = Object.values(obj).some(v => v !== null && !isNaN(parseFloat(v)));
      if (hasValidValues) {
        Object.entries(obj).forEach(([k, v]) => {
          if (v !== null) result[k] = parseFloat(v);
        });
        return Object.keys(result).length > 0 ? result : null;
      }
    } catch (e) {
      // Continue to text parsing
    }
  }

  // Case 2: Already an object
  if (typeof input === 'object' && input !== null) {
    const hasValidValues = Object.values(input).some(v => v !== null && !isNaN(parseFloat(v)));
    if (hasValidValues) {
      Object.entries(input).forEach(([k, v]) => {
        if (v !== null) result[k] = parseFloat(v);
      });
      return Object.keys(result).length > 0 ? result : null;
    }
  }

  // Case 3: Text format "Name (XX%)" or "Name : XX %"
  if (typeof input === 'string') {
    const regex1 = /([^(]+)\s*\(([0-9,\.]+)%\)/g;
    const regex2 = /([^:：]+)\s*[:：]\s*([0-9,\.]+)\s*%/g;

    let match;
    while ((match = regex1.exec(input)) !== null) {
      const key = match[1].trim().replace(/^[,\s]+/, '').replace(/[,\s]+$/, '');
      const value = parseFloat(match[2].replace(',', '.'));
      if (!isNaN(value) && key) {
        result[key] = value;
      }
    }

    if (Object.keys(result).length === 0) {
      while ((match = regex2.exec(input)) !== null) {
        const key = match[1].trim();
        const value = parseFloat(match[2].replace(',', '.'));
        if (!isNaN(value) && key) {
          result[key] = value;
        }
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
};

// Function to format distribution data for display
const formatDistribution = (distributionStr) => {
  const distribution = parseAdvancedDistribution(distributionStr);

  if (!distribution) return '';

  // Get ALL entries sorted by percentage (removed slice(0, 5) limitation)
  const entries = Object.entries(distribution)
    .filter(([key, value]) => value !== null && typeof value === 'number')
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return '';

  return entries
    .map(([region, pct]) => `<li>${region} : ${pct.toFixed(1)}%</li>`)
    .join('\n          ');
};

// Critical CSS inline (Above the fold only - Optimized for mobile FCP)
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
`;

// Generate HTML for each SCPI
const generateScpiPages = () => {
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  let generatedCount = 0;

  // H1 variants for A/B testing
  const h1Variants = {
    variant_a: (scpi) => `SCPI ${scpi['Nom SCPI']} : Analyse Complète & Rendement ${scpi['Taux de distribution (%)']}%`,
    variant_b: (scpi) => `Investir dans la SCPI ${scpi['Nom SCPI']} : ${scpi['Taux de distribution (%)']}% de Rendement en 2025`,
    variant_c: (scpi) => `SCPI ${scpi['Nom SCPI']} par ${scpi['Société de gestion']} : Guide Complet`
  };

  scpiData.forEach(scpi => {
    const slug = createSlug(scpi['Nom SCPI']);
    const isISR = scpi['Label ISR']?.toLowerCase() === 'oui';
    const isEuropean = isEuropeanScpi(scpi['Répartition Géographique']);
    const sector = determineSector(scpi['Répartition Sectorielle']);

    const performanceLevel = scpi['Taux de distribution (%)'] >= 7 ? 'Excellent' :
                             scpi['Taux de distribution (%)'] >= 5.5 ? 'Attractif' : 'Solide';
    const tofQuality = scpi['TOF (%)'] >= 95 ? 'Taux d\'occupation optimal' : 'Bien occupée';
    const sectorKeyword = sector === 'bureaux' ? 'Bureaux Premium' :
                         sector === 'commerces' ? 'Commerce & Retail' :
                         sector === 'sante' ? 'Santé & Médical' :
                         sector === 'logistique' ? 'Logistique & Entrepôts' :
                         sector === 'residentiel' ? 'Résidentiel' :
                         sector === 'hotellerie' ? 'Hôtellerie & Tourisme' : 'Diversifié';

    const title = `SCPI ${scpi['Nom SCPI']} : ${scpi['Taux de distribution (%)']}% Rendement 2025 ✓ ${scpi['Société de gestion']} | Analyse & Avis`;
    const metaDescription = `✓ SCPI ${scpi['Nom SCPI']} (${scpi['Société de gestion']}) : ${performanceLevel} rendement ${scpi['Taux de distribution (%)']}% ✓ ${tofQuality} ${scpi['TOF (%)']}% ✓ Capitalisation ${scpi['Capitalisation (M€)'].toFixed(0)}M€ ✓ ${sectorKeyword}${isISR ? ' ✓ Label ISR' : ''} ✓ Prix ${scpi['Prix de souscription (€)']}€ ✓ Analyse complète & conseils expert gratuits`;

    // Using variant A by default (variants B and C can be used for A/B testing)
    const h1 = h1Variants.variant_a(scpi);
    const subtitle = `${performanceLevel} rendement ${scpi['Taux de distribution (%)']}% avec ${scpi['Société de gestion']} | ${sectorKeyword}`;

    const htmlContent = `<!doctype html>
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

    <title>${title}</title>
    <meta name="description" content="${metaDescription}" />
    <meta name="keywords" content="SCPI ${scpi['Nom SCPI']}, ${scpi['Société de gestion']}, investir SCPI ${scpi['Nom SCPI']}, rendement SCPI ${scpi['Taux de distribution (%)']}%, ${sectorKeyword}, comparateur SCPI, meilleure SCPI 2025" />

    <!-- SEO Optimization -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Eric Bellaiche - MaximusSCPI" />
    <meta name="language" content="fr" />
    <link rel="alternate" hreflang="fr" href="https://www.maximusscpi.com/${slug}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.maximusscpi.com/${slug}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${metaDescription}" />
    <meta property="og:image" content="https://www.maximusscpi.com/3-barres.svg" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://www.maximusscpi.com/${slug}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${metaDescription}" />
    <meta property="twitter:image" content="https://www.maximusscpi.com/3-barres.svg" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.maximusscpi.com/${slug}" />

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
      "name": "SCPI ${scpi['Nom SCPI']}",
      "description": "${metaDescription.replace(/"/g, '\\"')}",
      "url": "https://www.maximusscpi.com/${slug}",
      "provider": {
        "@type": "Organization",
        "name": "${scpi['Société de gestion']}",
        "url": "https://www.maximusscpi.com"
      },
      "offers": {
        "@type": "Offer",
        "price": "${scpi['Prix de souscription (€)']}",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://www.maximusscpi.com/${slug}"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    }
    </script>

    <!-- Inline Critical CSS for FCP < 1.5s -->
    <style>${criticalCSS}
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
    </style>
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
          <a href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone" class="nav-btn" rel="noopener">Prendre RDV</a>
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
        <a href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone" class="mobile-nav-link" rel="noopener" style="background:#10b981;text-align:center">Prendre RDV</a>
      </div>
    </header>

    <!-- Pre-rendered Hero Section - Critical for FCP -->
    <section class="hero">
      <div class="hero-content">
        <div>
          <h1>${h1}</h1>
          <h2>${subtitle}</h2>

          <div style="margin-top:2rem">
            <a href="#contact" class="btn btn-primary">✓ Obtenir un Conseil Gratuit</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section - Quick metrics -->
    <div class="stats">
      <div class="stat-card">
        <span class="stat-label">Rendement 2024</span>
        <span class="stat-value">${scpi['Taux de distribution (%)']}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Capitalisation</span>
        <span class="stat-value">${scpi['Capitalisation (M€)'].toFixed(0)}M€</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">TOF</span>
        <span class="stat-value">${scpi['TOF (%)']}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Prix</span>
        <span class="stat-value">${scpi['Prix de souscription (€)']}€</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Société</span>
        <span class="stat-value" style="font-size:1.25rem">${scpi['Société de gestion']}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Création</span>
        <span class="stat-value">${scpi['Année de création']}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="description">
        <h2 class="section-title">Présentation de la SCPI ${scpi['Nom SCPI']}</h2>
        <p>La SCPI ${scpi['Nom SCPI']}, gérée par <strong>${scpi['Société de gestion']}</strong>, offre un rendement de <strong>${scpi['Taux de distribution (%)']}%</strong> en 2024.
        Avec une capitalisation de <strong>${scpi['Capitalisation (M€)'].toFixed(0)} millions d'euros</strong> et un taux d'occupation financier de <strong>${scpi['TOF (%)']}%</strong>,
        cette SCPI se positionne comme ${performanceLevel.toLowerCase()} sur le marché de l'investissement immobilier pierre-papier.</p>

        <h3>Caractéristiques principales</h3>
        <ul>
          <li>Rendement ${performanceLevel.toLowerCase()} de ${scpi['Taux de distribution (%)']}% en 2024</li>
          <li>${tofQuality} avec un TOF de ${scpi['TOF (%)']}%</li>
          <li>Capitalisation importante de ${scpi['Capitalisation (M€)'].toFixed(0)} M€</li>
          <li>Spécialisation : ${sectorKeyword}</li>
          <li>Prix de souscription : ${scpi['Prix de souscription (€)']} €</li>
          <li>Endettement maîtrisé : ${scpi['Endettement (%)']}%</li>
          ${isISR ? '<li>Labellisée ISR (Investissement Socialement Responsable) ✓</li>' : ''}
        </ul>

        <h3>Pourquoi investir dans la SCPI ${scpi['Nom SCPI']} ?</h3>
        <p><strong>MaximusSCPI</strong> vous accompagne dans votre investissement en SCPI ${scpi['Nom SCPI']}.
        Bénéficiez de l'expertise d'<strong>Eric Bellaiche</strong>, conseiller certifié ORIAS avec 15 ans d'expérience,
        pour optimiser votre portefeuille immobilier pierre-papier et maximiser vos revenus passifs.</p>

        <h3>Accompagnement personnalisé MaximusSCPI</h3>
        <ul>
          <li>Conseil gratuit et sans engagement</li>
          <li>Analyse personnalisée de votre profil investisseur</li>
          <li>Zéro commission cachée</li>
          <li>Suivi régulier de votre portefeuille SCPI</li>
          <li>Réponse sous 24h garantie</li>
        </ul>

        ${(() => {
          const geoDistribution = formatDistribution(scpi['Répartition Géographique']);
          const sectorDistribution = formatDistribution(scpi['Répartition Sectorielle']);

          let html = '';

          if (geoDistribution) {
            html += `
        <h3>Répartition géographique</h3>
        <ul>
          ${geoDistribution}
        </ul>`;
          }

          if (sectorDistribution) {
            html += `
        <h3>Répartition sectorielle</h3>
        <ul>
          ${sectorDistribution}
        </ul>`;
          }

          return html;
        })()}
      </div>
    </div>

    <!-- Expert Profile Section -->
    <section style="background-color: white; padding: 3rem 1rem; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto;">
        <img
          src="/Eric%20Bellaiche%201000x1000%20copy%20copy.png"
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
      <h3>Prêt à investir dans la SCPI ${scpi['Nom SCPI']} ?</h3>
      <p>Eric Bellaiche vous rappelle gratuitement sous 24h</p>
      <a
        href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
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

    <!-- React App Hydration -->
    <div id="root"></div>

    <!-- Deferred Scripts for Performance (loaded after FCP) -->
    <!-- No React bundle - Pure static HTML for maximum performance -->
    <script>
      // Mobile menu toggle
      function toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        menu.classList.toggle('active');
      }

      // Close mobile menu when clicking outside
      document.addEventListener('click', function(e) {
        const menu = document.getElementById('mobileMenu');
        const btn = document.querySelector('.mobile-menu-btn');
        if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.remove('active');
        }
      });

      // Minimal inline JS for CTA interactions (< 1KB)
      document.addEventListener('DOMContentLoaded', function() {
        const ctaBtns = document.querySelectorAll('[href="#contact"]');
        ctaBtns.forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'https://calendly.com/maximusscpi/conseil-scpi-gratuit?hide_gdpr_banner=1&primary_color=10b981';
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
              // TODO (plus tard) : activer la conversion Ads dédiée RDV
              // gtag('event','conversion', { 'send_to':'AW-XXXXXXX/RDV_LABEL' });
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
              // Prépare Enhanced Conversions for leads (Google hash si nécessaire)
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
              // Event GA4 (importable ensuite dans Google Ads)
              gtag('event','lead_submit', { page_location: location.href });

              // TODO (plus tard) : activer la conversion Ads "Lead – Formulaire (site)"
              // gtag('event','conversion', { 'send_to':'AW-XXXXXXX/CONV_LABEL', 'value':1.0, 'currency':'EUR' });
            }
          }catch(e){}
        };
      })();
    </script>

    <script src="https://elfsightcdn.com/platform.js" defer></script>
  </body>
</html>`;

    // Create folder structure for clean URLs (dist/scpi-comete/index.html)
    const pageDir = path.join(distDir, slug);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const filePath = path.join(pageDir, 'index.html');
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    generatedCount++;
  });

  // Save H1 variants to a separate file for A/B testing
  const variantsDoc = `# H1 Variants for A/B Testing

## Variant A (Default - Currently Active)
Format: "SCPI [Nom] [Année] : Analyse Complète & Rendement [X]%"
Focus: Trust + Performance

## Variant B (Alternative 1)
Format: "Investir dans la SCPI [Nom] : [X]% de Rendement en 2025"
Focus: Action + Year + Performance

## Variant C (Alternative 2)
Format: "SCPI [Nom] par [Société] : Guide Complet [Année]"
Focus: Authority + Comprehensive

## Recommended A/B Testing Strategy:
1. Test Variant A vs B for 2 weeks (50/50 split)
2. Winner vs Variant C for 2 weeks
3. Implement best performer globally

## Key Metrics to Track:
- Click-Through Rate (CTR)
- Bounce Rate
- Time on Page
- Conversion Rate (form submissions)
- Quality Score (Google Ads)
`;

  fs.writeFileSync(path.join(distDir, 'H1_AB_TESTING_VARIANTS.md'), variantsDoc, 'utf-8');

  console.log(`✅ ${generatedCount} pages SCPI optimisées générées avec succès`);
  console.log(`📊 Document A/B testing H1 créé: H1_AB_TESTING_VARIANTS.md`);
};

// Run the generator
generateScpiPages();
