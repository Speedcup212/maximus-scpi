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
  return 'scpi-' + name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Generate HTML for each SCPI
const generateScpiPages = () => {
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  let generatedCount = 0;

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
    const h1 = `SCPI ${scpi['Nom SCPI']} : ${isISR ? 'Investissement Responsable ISR' : 'Analyse & Avis 2025'}`;
    const subtitle = `${performanceLevel} rendement ${scpi['Taux de distribution (%)']}% avec ${scpi['Société de gestion']} | ${sectorKeyword}`;

    const htmlContent = `<!doctype html>
<html lang="fr" translate="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <link rel="icon" type="image/png" href="/Logo MaximusSCPI.com.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Performance optimizations -->
    <link rel="preconnect" href="https://elfsightcdn.com" crossorigin>
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
    <meta property="og:image" content="https://www.maximusscpi.com/Logo MaximusSCPI.com.png" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://www.maximusscpi.com/${slug}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${metaDescription}" />
    <meta property="twitter:image" content="https://www.maximusscpi.com/Logo MaximusSCPI.com.png" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.maximusscpi.com/${slug}" />

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
      }
    }
    </script>
  </head>
  <body>
    <div id="root">
      <!-- Pre-rendered content for SEO -->
      <div class="seo-content">
        <h1>${h1}</h1>
        <h2>${subtitle}</h2>

        <div class="scpi-stats">
          <p><strong>Rendement 2024:</strong> ${scpi['Taux de distribution (%)']}%</p>
          <p><strong>Capitalisation:</strong> ${scpi['Capitalisation (M€)'].toFixed(0)} M€</p>
          <p><strong>Taux d'Occupation Financier (TOF):</strong> ${scpi['TOF (%)']}%</p>
          <p><strong>Prix de souscription:</strong> ${scpi['Prix de souscription (€)']} €</p>
          <p><strong>Société de gestion:</strong> ${scpi['Société de gestion']}</p>
          <p><strong>Année de création:</strong> ${scpi['Année de création']}</p>
          <p><strong>Secteur:</strong> ${sectorKeyword}</p>
          ${isISR ? '<p><strong>Label ISR:</strong> Oui ✓</p>' : ''}
        </div>

        <div class="scpi-description">
          <h3>Présentation de la SCPI ${scpi['Nom SCPI']}</h3>
          <p>La SCPI ${scpi['Nom SCPI']}, gérée par ${scpi['Société de gestion']}, offre un rendement de ${scpi['Taux de distribution (%)']}% en 2024.
          Avec une capitalisation de ${scpi['Capitalisation (M€)'].toFixed(0)} millions d'euros et un taux d'occupation financier de ${scpi['TOF (%)']}%,
          cette SCPI se positionne comme ${performanceLevel.toLowerCase()} sur le marché de l'investissement immobilier pierre-papier.</p>

          <h3>Caractéristiques principales</h3>
          <ul>
            <li>Rendement ${performanceLevel.toLowerCase()} de ${scpi['Taux de distribution (%)']}% en 2024</li>
            <li>${tofQuality} avec un TOF de ${scpi['TOF (%)']}%</li>
            <li>Capitalisation importante de ${scpi['Capitalisation (M€)'].toFixed(0)} M€</li>
            <li>Spécialisation : ${sectorKeyword}</li>
            <li>Prix de souscription : ${scpi['Prix de souscription (€)']} €</li>
            <li>Endettement : ${scpi['Endettement (%)']}%</li>
            ${isISR ? '<li>Labellisée ISR (Investissement Socialement Responsable)</li>' : ''}
          </ul>

          <h3>Pourquoi investir dans la SCPI ${scpi['Nom SCPI']} ?</h3>
          <p>MaximusSCPI vous accompagne dans votre investissement en SCPI ${scpi['Nom SCPI']}.
          Bénéficiez de l'expertise d'Eric Bellaiche, conseiller certifié ORIAS avec 15 ans d'expérience,
          pour optimiser votre portefeuille immobilier pierre-papier.</p>

          <h3>Contact et accompagnement personnalisé</h3>
          <p>✓ Conseil gratuit et sans engagement<br>
          ✓ Analyse personnalisée de votre profil investisseur<br>
          ✓ Zéro commission cachée<br>
          ✓ Suivi régulier de votre portefeuille SCPI</p>

          <div style="text-align: center; margin: 30px 0;">
            <img src="/Eric Bellaiche 1000x1000 copy copy.png" alt="Eric Bellaiche - Expert SCPI MaximusSCPI" style="width: 200px; height: 200px; border-radius: 50%; margin: 0 auto; display: block;">
            <h4 style="margin-top: 15px; font-weight: bold;">Eric Bellaiche</h4>
            <p style="margin: 5px 0;">Conseiller en Gestion de Patrimoine et en Investissements Financiers</p>
            <p style="margin: 5px 0; font-size: 14px;">Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience</p>
          </div>
        </div>
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
    <script src="https://elfsightcdn.com/platform.js" defer></script>
  </body>
</html>`;

    const filePath = path.join(distDir, `${slug}.html`);
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    generatedCount++;
  });

  console.log(`✅ ${generatedCount} pages SCPI statiques générées avec succès`);
};

// Run the generator
generateScpiPages();
