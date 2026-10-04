import React from 'react';

interface SchemaOrgProps {
  type: 'Organization' | 'BreadcrumbList' | 'FAQPage' | 'Article' | 'FinancialProduct';
  data: any;
}

const SITE_URL = 'https://maximusscpi.com';
const BRAND_LOGO = `${SITE_URL}/Logo%20MaximusSCPI.com.png`;

export const SchemaOrg: React.FC<SchemaOrgProps> = ({ type, data }) => {
  let schema: any = {};

  switch (type) {
    case 'Organization':
      schema = {
        "@context": "https://schema.org",
        "@type": "FinancialService",
        "name": "MaximusSCPI",
        "description": "Comparateur et site d'analyse pédagogique des SCPI : données, trajectoires, risques, fiscalité et simulateurs",
        "url": SITE_URL,
        "logo": BRAND_LOGO,
        "founder": {
          "@type": "Person",
          "name": "Eric Bellaiche",
          "jobTitle": "Conseiller en Investissement Financier"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "FR"
        },
        "areaServed": "FR",
        "serviceType": "Information, comparaison et conseil en investissement SCPI"
      };
      break;

    case 'BreadcrumbList':
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `${SITE_URL}${item.url}`
        }))
      };
      break;

    case 'FAQPage':
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.questions.map((q: any) => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.answer
          }
        }))
      };
      break;

    case 'Article': {
      const articleSchema: any = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "image": data.image || BRAND_LOGO,
        "author": {
          "@type": "Person",
          "name": "Eric Bellaiche",
          "jobTitle": "Conseiller en Investissement Financier"
        },
        "publisher": {
          "@type": "Organization",
          "name": "MaximusSCPI",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": BRAND_LOGO
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${SITE_URL}${data.url}`
        }
      };
      // Ne jamais fabriquer une date de publication/modification. Une date n'est émise
      // que si elle provient réellement des données de l'article.
      if (data.datePublished) articleSchema.datePublished = data.datePublished;
      if (data.dateModified) articleSchema.dateModified = data.dateModified;
      schema = articleSchema;
      break;
    }

    case 'FinancialProduct':
      schema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": data.name,
        "description": data.description,
        "provider": {
          "@type": "Organization",
          "name": data.provider
        },
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "EUR"
        },
        "feesAndCommissionsSpecification": data.fees
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { name: 'Accueil', url: '/' }
  ];

  if (path === '/' || path === '') return items;

  const pathParts = path.split('/').filter(p => p);

  const pathMapping: Record<string, string> = {
    'article': 'Articles SCPI',
    'articles': 'Articles SCPI',
    'scpi': 'SCPI',
    'comprendre-scpi': 'Comprendre les SCPI',
    'faq': 'Questions Fréquentes',
    'about-us': 'À Propos',
    'comparateur-scpi': 'Comparateur SCPI',
    'scpi-secteurs': 'SCPI par Secteur',
    'scpi-gestionnaires': 'SCPI par Gestionnaire',
    'scpi-objectifs': 'SCPI par Objectif',
    'scpi-europeennes': 'SCPI Européennes',
    'expertise-orias-cif': 'Expertise ORIAS / CIF',
    'methodologie-donnees-scpi': 'Méthodologie',
    'avertissements-risques-scpi': 'Avertissements Risques'
  };

  let currentPath = '';
  pathParts.forEach(part => {
    currentPath += `/${part}`;
    const name = pathMapping[part] || part.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    items.push({ name, url: currentPath });
  });

  return items;
};

export default SchemaOrg;
