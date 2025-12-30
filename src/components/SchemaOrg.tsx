import React from 'react';

interface SchemaOrgProps {
  type: 'Organization' | 'BreadcrumbList' | 'FAQPage' | 'Article' | 'FinancialProduct';
  data: any;
}

export const SchemaOrg: React.FC<SchemaOrgProps> = ({ type, data }) => {
  let schema: any = {};

  switch (type) {
    case 'Organization':
      schema = {
        "@context": "https://schema.org",
        "@type": "FinancialService",
        "name": "MaximusSCPI",
        "description": "Comparateur indépendant SCPI : 51 SCPI analysées, simulation gratuite, conseiller ORIAS",
        "url": "https://maximusscpi.com",
        "logo": "https://maximusscpi.com/Maximus%20logo%20250x50%204.svg",
        "founder": {
          "@type": "Person",
          "name": "Eric Bellaiche",
          "jobTitle": "Conseiller en Investissement Financier",
          "description": "Expert SCPI indépendant, CIF certifié ORIAS"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "FR"
        },
        "areaServed": "FR",
        "serviceType": "Conseil en investissement SCPI"
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
          "item": `https://maximusscpi.com${item.url}`
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

    case 'Article':
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "author": {
          "@type": "Person",
          "name": "Eric Bellaiche",
          "jobTitle": "Conseiller en Investissement Financier"
        },
        "datePublished": data.datePublished || "2025-01-15",
        "dateModified": data.dateModified || new Date().toISOString().split('T')[0],
        "publisher": {
          "@type": "Organization",
          "name": "MaximusSCPI",
          "logo": {
            "@type": "ImageObject",
            "url": "https://maximusscpi.com/Maximus%20logo%20250x50%204.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://maximusscpi.com${data.url}`
        }
      };
      break;

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
    'scpi': 'SCPI',
    'comprendre-scpi': 'Comprendre les SCPI',
    'faq': 'Questions Fréquentes',
    'about-us': 'À Propos',
    'comparateur-scpi': 'Comparateur SCPI',
    'scpi-secteurs': 'SCPI par Secteur',
    'scpi-gestionnaires': 'SCPI par Gestionnaire',
    'scpi-objectifs': 'SCPI par Objectif',
    'scpi-europeennes': 'SCPI Européennes'
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
