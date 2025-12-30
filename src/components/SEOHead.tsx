import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  schemaData?: object;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Comparateur SCPI 2025 : Meilleurs Rendements & Conseils Expert Gratuits',
  description = 'Comparez 51 SCPI en temps réel ✓ Rendements jusqu\'à 11,18% ✓ Simulateur personnalisé gratuit ✓ Conseiller certifié ORIAS ✓ Investissez dès 200€',
  keywords = ['comparateur SCPI', 'meilleure SCPI 2025', 'investir SCPI', 'rendement SCPI', 'SCPI européenne', 'simulateur SCPI', 'conseil SCPI gratuit'],
  canonical,
  schemaData,
  noIndex = false
}) => {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://maximusscpi.com';
    const isProd = import.meta.env.PROD;
    const isPreview = window.location.hostname.includes('webcontainer') ||
                      window.location.hostname.includes('stackblitz') ||
                      window.location.hostname.includes('bolt.new') ||
                      window.location.hostname === 'localhost';

    const shouldIndex = isProd && !isPreview && !noIndex;
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords.join(', ');
      document.head.appendChild(meta);
    }

    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (metaRobots) {
      metaRobots.content = shouldIndex ? 'index,follow' : 'noindex,nofollow';
    } else {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      metaRobots.content = shouldIndex ? 'index,follow' : 'noindex,nofollow';
      document.head.appendChild(metaRobots);
    }

    const canonicalUrl = canonical || `${siteUrl}${window.location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (linkCanonical) {
      linkCanonical.href = canonicalUrl;
    } else {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      linkCanonical.href = canonicalUrl;
      document.head.appendChild(linkCanonical);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = title;
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = description;
      document.head.appendChild(meta);
    }

    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "MaximusSCPI",
      "url": "https://www.maximusscpi.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.maximusscpi.com/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "description": description,
      "publisher": {
        "@type": "Organization",
        "name": "MaximusSCPI",
        "url": "https://www.maximusscpi.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.maximusscpi.com/images/logo-96.webp"
        }
      }
    };

    const scriptWebsite = document.createElement('script');
    scriptWebsite.type = 'application/ld+json';
    scriptWebsite.textContent = JSON.stringify(websiteSchema);
    document.head.appendChild(scriptWebsite);

    if (schemaData) {
      const scriptCustom = document.createElement('script');
      scriptCustom.type = 'application/ld+json';
      scriptCustom.textContent = JSON.stringify(schemaData);
      document.head.appendChild(scriptCustom);
    }
  }, [title, description, keywords, canonical, schemaData, noIndex]);

  return null;
};

export default SEOHead;
