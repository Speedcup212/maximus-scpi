import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import article templates
const templatesPath = path.join(__dirname, '../src/data/articleTemplatesConfig.ts');
const templatesContent = fs.readFileSync(templatesPath, 'utf-8');

// Parse article templates from TypeScript file - simplified approach
const parseArticleTemplates = (content) => {
  const articles = [];

  // Extract all article objects
  const articleMatches = content.match(/\{\s*id:\s*\d+,[\s\S]*?\}/g) || [];

  articleMatches.forEach(match => {
    // Extract individual fields
    const idMatch = match.match(/id:\s*(\d+)/);
    const slugMatch = match.match(/slug:\s*'([^']+)'/);
    const titleMatch = match.match(/title:\s*'([^']+)'/);
    const metaMatch = match.match(/metaDescription:\s*'([^']+)'/);
    const keywordsMatch = match.match(/keywords:\s*\[(.*)\]/s);

    if (slugMatch && titleMatch && metaMatch) {
      const slug = slugMatch[1];

      // Skip the main pillar article that has its own dedicated page
      if (slug === 'fonds-euros-ou-scpi') return;

      // Extract keywords
      let keywords = [];
      if (keywordsMatch) {
        const keywordsStr = keywordsMatch[1];
        keywords = keywordsStr.split(',').map(k => k.trim().replace(/['"]/g, ''));
      }

      articles.push({
        id: idMatch ? parseInt(idMatch[1]) : 0,
        slug,
        title: titleMatch[1],
        metaDescription: metaMatch[1],
        keywords
      });
    }
  });

  return articles;
};

const articles = parseArticleTemplates(templatesContent);

console.log(`🚀 Génération de ${articles.length} articles éducatifs statiques...`);

// Generate HTML for each article
articles.forEach(article => {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | MaximusSCPI</title>
  <meta name="description" content="${article.metaDescription}">
  <meta name="keywords" content="${article.keywords.join(', ')}">
  <link rel="canonical" href="https://www.maximusscpi.com/${article.slug}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${article.metaDescription}">
  <meta property="og:url" content="https://www.maximusscpi.com/${article.slug}">
  <meta property="og:image" content="https://www.maximusscpi.com/images/eric-384.webp">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${article.title}">
  <meta name="twitter:description" content="${article.metaDescription}">
  <meta name="twitter:image" content="https://www.maximusscpi.com/images/eric-384.webp">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${article.title}",
    "description": "${article.metaDescription}",
    "author": {
      "@type": "Person",
      "name": "Éric Bellaiche"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MaximusSCPI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.maximusscpi.com/images/eric-192.webp"
      }
    },
    "datePublished": "2025-01-20",
    "dateModified": "2025-01-20",
    "image": "https://www.maximusscpi.com/images/eric-384.webp",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.maximusscpi.com/${article.slug}"
    }
  }
  </script>

  <!-- Preload critical resources -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      min-height: 100vh;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="spinner"></div>
    </div>
  </div>

  <script type="module">
    // Store article slug for React app to pick up
    window.__ARTICLE_SLUG__ = '${article.slug}';

    // Redirect to React app with correct routing
    window.addEventListener('DOMContentLoaded', () => {
      // The React app will detect the slug and render the correct article
      import('/assets/index.js').catch(() => {
        // Fallback: redirect to home if module fails to load
        window.location.href = '/';
      });
    });
  </script>

  <noscript>
    <div style="padding: 40px; text-align: center;">
      <h1>${article.title}</h1>
      <p>${article.metaDescription}</p>
      <p>JavaScript est requis pour afficher cet article. Veuillez activer JavaScript dans votre navigateur.</p>
      <a href="/" style="color: #667eea; text-decoration: none;">← Retour à l'accueil</a>
    </div>
  </noscript>
</body>
</html>`;

  const outputDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${article.slug}.html`);
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`  ✅ ${article.slug}.html`);
});

console.log(`\n✅ ${articles.length} articles éducatifs générés avec succès\n`);
