import { Scpi } from '../types/scpi';

export interface OptimizedSEO {
  title: string;
  description: string;
  h1: string;
}

export const generateOptimizedScpiSEO = (scpi: Scpi): OptimizedSEO => {
  const year = new Date().getFullYear();
  const rendement = scpi.yield.toFixed(1);

  const trustBadges = [];
  if (scpi.fees === 0) trustBadges.push('0% Frais');
  if (scpi.isr) trustBadges.push('Label ISR');
  if (scpi.capitalization >= 500000000) trustBadges.push('Leader Marché');
  const trustBadge = trustBadges[0] || 'Analyse Expert';

  const geoUSP = scpi.european ? 'Europe' : 'France';
  const sectorUSP = scpi.sector.charAt(0).toUpperCase() + scpi.sector.slice(1);

  const title = `SCPI ${scpi.name} (${scpi.company}) : Rendement ${rendement}% | ${trustBadge} ${year}`;

  const descriptionParts = [];
  descriptionParts.push(`✓ SCPI ${scpi.name} : ${rendement}% de rendement ${year - 1}`);
  descriptionParts.push(`✓ ${geoUSP} ${sectorUSP}`);
  if (scpi.tof >= 95) {
    descriptionParts.push(`✓ TOF ${scpi.tof}%`);
  }
  if (scpi.fees === 0) {
    descriptionParts.push('✓ 0% frais');
  }
  descriptionParts.push('✓ Analyse détaillée');
  descriptionParts.push('✓ Simulation gratuite → RDV conseiller ORIAS');

  const description = descriptionParts.join(' ');

  const h1 = `SCPI ${scpi.name} (${scpi.company}) : ${rendement}% de Rendement sur Actifs ${geoUSP} ${sectorUSP}`;

  return {
    title,
    description: description.substring(0, 155),
    h1
  };
};

export const generateOptimizedSectorSEO = (sector: string): OptimizedSEO => {
  const year = new Date().getFullYear();
  const sectorName = sector.charAt(0).toUpperCase() + sector.slice(1);

  const sectorData: Record<string, { count: number; avgYield: string; top: string }> = {
    'bureaux': { count: 15, avgYield: '4.8', top: 'Iroko Zen' },
    'commerces': { count: 12, avgYield: '5.2', top: 'Comète' },
    'sante': { count: 8, avgYield: '4.5', top: 'Primovie' },
    'diversifie': { count: 20, avgYield: '5.5', top: 'Epargne Pierre' }
  };

  const data = sectorData[sector.toLowerCase()] || { count: 10, avgYield: '5.0', top: 'Alderan' };

  const title = `SCPI ${sectorName} : Top ${data.count} Meilleures ${year} | Comparatif Expert`;

  const description = `✓ Comparez ${data.count} SCPI ${sectorName} ✓ Rendement moyen ${data.avgYield}% ✓ Leader: ${data.top} ✓ Analyse détaillée ✓ Simulation gratuite → Conseiller ORIAS`;

  const h1 = `SCPI ${sectorName} : Top ${data.count} Meilleures ${year} (Rendement Moyen ${data.avgYield}%)`;

  return {
    title,
    description: description.substring(0, 155),
    h1
  };
};

export const generateOptimizedManagerSEO = (manager: string, scpiCount: number, avgYield: number): OptimizedSEO => {
  const year = new Date().getFullYear();

  const title = `${manager} SCPI : ${scpiCount} Fonds | Rendement Moyen ${avgYield.toFixed(1)}% | Avis ${year}`;

  const description = `✓ ${manager} : ${scpiCount} SCPI au catalogue ✓ Rendement moyen ${avgYield.toFixed(1)}% ✓ Analyse complète ✓ Comparatif détaillé ✓ Avis expert → Conseiller ORIAS`;

  const h1 = `${manager} : ${scpiCount} SCPI | Rendement Moyen ${avgYield.toFixed(1)}% | Analyse Complète ${year}`;

  return {
    title,
    description: description.substring(0, 155),
    h1
  };
};

export const generateOptimizedThematicSEO = (theme: string, keyword: string, count: number, avgYield: string): OptimizedSEO => {
  const year = new Date().getFullYear();

  const title = `${theme} : Top ${count} SCPI ${year} | Rendement ${avgYield}% | Guide Expert`;

  const description = `✓ ${theme} : sélection ${count} meilleures SCPI ✓ Rendement moyen ${avgYield}% ✓ Comparatif détaillé ✓ Stratégie optimale ✓ Simulation gratuite → RDV conseiller ORIAS`;

  const h1 = `${theme} : Top ${count} Meilleures SCPI ${year} (Rendement ${avgYield}%)`;

  return {
    title,
    description: description.substring(0, 155),
    h1
  };
};

export const generateFAQSchema = (questions: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(qa => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer
      }
    }))
  };
};

export const generateFinancialProductSchema = (scpi: Scpi, rating?: number) => {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": `SCPI ${scpi.name}`,
    "description": `SCPI ${scpi.name} gérée par ${scpi.company}, secteur ${scpi.sector}, rendement ${scpi.yield.toFixed(2)}%`,
    "provider": {
      "@type": "Organization",
      "name": scpi.company
    },
    "offers": {
      "@type": "Offer",
      "price": scpi.price.toString(),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    ...(rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating.toFixed(1),
        "bestRating": "10",
        "worstRating": "0",
        "ratingCount": "1"
      }
    })
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "image": article.image,
    "publisher": {
      "@type": "Organization",
      "name": "MaximusSCPI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.maximusscpi.com/images/logo.png"
      }
    }
  };
};
