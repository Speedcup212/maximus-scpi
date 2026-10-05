import { Scpi } from '../types/scpi';

export interface OptimizedSEO {
  title: string;
  description: string;
  h1: string;
}

const clampDescription = (value: string): string => value.replace(/\s+/g, ' ').trim().substring(0, 155);

const formatMetric = (value: number | null | undefined, digits = 1): string | null => {
  if (!Number.isFinite(value)) return null;
  return Number(value).toFixed(digits).replace('.', ',');
};

export const generateOptimizedScpiSEO = (scpi: Scpi): OptimizedSEO => {
  const rendement = formatMetric(scpi.yield);
  const tof = formatMetric(scpi.tof);
  const sector = scpi.sector ? scpi.sector.charAt(0).toUpperCase() + scpi.sector.slice(1) : null;
  const geography = scpi.european ? 'Europe' : 'France';

  const title = `SCPI ${scpi.name} : rendement, TOF, frais et analyse | MaximusSCPI`;

  const descriptionParts = [`SCPI ${scpi.name} (${scpi.company})`];
  if (rendement) descriptionParts.push(`taux de distribution ${rendement} %`);
  if (tof) descriptionParts.push(`TOF ${tof} %`);
  if (sector) descriptionParts.push(`${sector}, ${geography}`);
  descriptionParts.push('Radar, trajectoire, liquidité, frais et points de vigilance.');

  return {
    title,
    description: clampDescription(descriptionParts.join(' · ')),
    h1: `SCPI ${scpi.name} : analyse, rendement et trajectoire`,
  };
};

export const generateOptimizedSectorSEO = (sector: string): OptimizedSEO => {
  const sectorName = sector.charAt(0).toUpperCase() + sector.slice(1);

  return {
    title: `SCPI ${sectorName} : comparatif, rendement et risques | MaximusSCPI`,
    description: clampDescription(
      `Comparez les SCPI ${sectorName} selon rendement, TOF, frais, capitalisation, endettement, valorisation, liquidité et trajectoire.`
    ),
    h1: `SCPI ${sectorName} : comparer les fondamentaux et les risques`,
  };
};

export const generateOptimizedManagerSEO = (manager: string, scpiCount: number, avgYield: number): OptimizedSEO => {
  const countLabel = Number.isFinite(scpiCount) && scpiCount > 0 ? `${scpiCount} SCPI` : 'SCPI gérées';
  const avgYieldLabel = Number.isFinite(avgYield) && avgYield > 0
    ? ` · taux de distribution moyen observé ${avgYield.toFixed(1).replace('.', ',')} %`
    : '';

  return {
    title: `${manager} : ${countLabel}, analyses et données SCPI | MaximusSCPI`,
    description: clampDescription(
      `${manager} : ${countLabel}${avgYieldLabel}. Comparez les fonds, leurs données, leur trajectoire et leurs points de vigilance.`
    ),
    h1: `${manager} : SCPI, données et analyses`,
  };
};

export const generateOptimizedThematicSEO = (theme: string, keyword: string, count: number, avgYield: string): OptimizedSEO => {
  const countLabel = Number.isFinite(count) && count > 0 ? `${count} SCPI` : 'SCPI';
  const normalizedYield = typeof avgYield === 'string' && avgYield.trim() ? avgYield.trim() : null;
  const yieldLabel = normalizedYield ? ` · rendement moyen observé ${normalizedYield} %` : '';
  const keywordLabel = keyword?.trim() ? ` ${keyword.trim()}` : '';

  return {
    title: `${theme} : comparatif ${countLabel} et critères d'analyse | MaximusSCPI`,
    description: clampDescription(
      `${theme}${keywordLabel} : comparez ${countLabel}${yieldLabel}. Rendement, TOF, frais, valorisation, dette, liquidité et risques.`
    ),
    h1: `${theme} : comparer les SCPI sur leurs fondamentaux`,
  };
};

export const generateFAQSchema = (questions: ReadonlyArray<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
  };
};

export const generateFinancialProductSchema = (scpi: Scpi, _rating?: number) => {
  const rendement = formatMetric(scpi.yield, 2);
  const price = Number.isFinite(scpi.price) && scpi.price > 0 ? scpi.price : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `SCPI ${scpi.name}`,
    description: rendement
      ? `SCPI ${scpi.name} gérée par ${scpi.company}, secteur ${scpi.sector}, taux de distribution observé ${rendement} %.`
      : `SCPI ${scpi.name} gérée par ${scpi.company}, secteur ${scpi.sector}.`,
    provider: {
      '@type': 'Organization',
      name: scpi.company,
    },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: 'EUR',
      },
    }),
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

export const generateSoftwareApplicationSchema = (simulator: {
  name: string;
  description: string;
  url: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: simulator.name,
    description: simulator.description,
    url: simulator.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    provider: {
      '@type': 'Organization',
      '@id': 'https://maximusscpi.com/#organization',
      name: 'MaximusSCPI',
      url: 'https://maximusscpi.com',
    },
  };
};

export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  author: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      url: 'https://maximusscpi.com/qui-sommes-nous/',
    },
    ...(article.datePublished && { datePublished: article.datePublished }),
    ...(article.dateModified && { dateModified: article.dateModified }),
    ...(article.image && { image: article.image }),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://maximusscpi.com/#organization',
      name: 'MaximusSCPI',
      url: 'https://maximusscpi.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://maximusscpi.com/Logo%20MaximusSCPI.com.png',
      },
    },
  };
};