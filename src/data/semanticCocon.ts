interface SemanticLink {
  title: string;
  url: string;
  description: string;
  icon: string;
  type: 'parent' | 'sibling' | 'child';
}

export const semanticCoconConfig: Record<string, SemanticLink[]> = {
  // PAGE D'ACCUEIL - HUB CENTRAL
  '/': [
    {
      title: 'Comprendre les SCPI : Guide Complet 2025',
      url: '/comprendre-scpi',
      description: 'Fonctionnement, fiscalité, avantages et risques des SCPI expliqués simplement',
      icon: 'book-open',
      type: 'child'
    },
    {
      title: 'Top 10 Meilleures SCPI de Rendement 2025',
      url: '/meilleures-scpi-rendement',
      description: 'Classement exclusif des SCPI les plus performantes avec rendements actualisés',
      icon: 'trophy',
      type: 'child'
    },
    {
      title: 'SCPI Européennes : Diversification Internationale',
      url: '/scpi-europeennes',
      description: 'Investir en Allemagne, Pays-Bas, Espagne avec les meilleures SCPI européennes',
      icon: 'globe',
      type: 'child'
    },
    {
      title: 'Préparer sa Retraite avec les SCPI',
      url: '/preparer-retraite-scpi',
      description: 'Constituer un revenu complémentaire pour une retraite confortable',
      icon: 'piggy-bank',
      type: 'child'
    },
    {
      title: 'Comparateur SCPI : Trouvez la Meilleure',
      url: '/comparateur-scpi',
      description: 'Outil de comparaison intelligent pour sélectionner votre SCPI idéale',
      icon: 'bar-chart',
      type: 'child'
    }
  ],

  // PAGE COMPRENDRE
  '/comprendre-scpi': [
    {
      title: 'Accueil MaximusSCPI',
      url: '/',
      description: 'Retour au comparateur et à nos outils d\'aide à la décision',
      icon: 'home',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement 2025',
      url: '/meilleures-scpi-rendement',
      description: 'Maintenant que vous comprenez les SCPI, découvrez les meilleures',
      icon: 'trending-up',
      type: 'child'
    },
    {
      title: 'SCPI Fiscales : Réduire ses Impôts',
      url: '/scpi-fiscales',
      description: 'Défiscalisation Pinel, Malraux, Déficit Foncier : comprendre les SCPI fiscales',
      icon: 'file-text',
      type: 'child'
    },
    {
      title: 'SCPI Sans Frais d\'Entrée 2025',
      url: '/scpi-sans-frais',
      description: '0% de frais de souscription : maximisez votre capital investi dès le départ',
      icon: 'percent',
      type: 'child'
    },
    {
      title: 'FAQ SCPI : Toutes vos Questions',
      url: '/faq',
      description: 'Réponses d\'expert à toutes vos questions sur l\'investissement en SCPI',
      icon: 'help-circle',
      type: 'sibling'
    }
  ],

  // PAGE MEILLEURES SCPI
  '/meilleures-scpi-rendement': [
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Les fondamentaux pour bien investir en SCPI',
      icon: 'book-open',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes Performantes',
      url: '/scpi-europeennes',
      description: 'Les meilleures SCPI diversifiées en Europe avec 5-7% de rendement',
      icon: 'globe',
      type: 'sibling'
    },
    {
      title: 'SCPI de Bureaux : Secteur Tertiaire',
      url: '/scpi-bureaux-investissement',
      description: 'Les SCPI bureaux les plus performantes en France et Europe',
      icon: 'building',
      type: 'child'
    },
    {
      title: 'SCPI de Commerces : Retail & Distribution',
      url: '/scpi-commerces-investissement',
      description: 'SCPI spécialisées commerces avec rendements attractifs de 5-7%',
      icon: 'shopping-cart',
      type: 'child'
    },
    {
      title: 'SCPI de Santé : EHPAD & Cliniques',
      url: '/scpi-sante-investissement',
      description: 'Secteur porteur de la santé : EHPAD, cliniques, cabinets médicaux',
      icon: 'heart',
      type: 'child'
    },
    {
      title: 'SCPI France : Investir en Immobilier National',
      url: '/scpi-france-investissement',
      description: 'Les meilleures SCPI 100% investies en France métropolitaine',
      icon: 'flag',
      type: 'child'
    }
  ],

  // PAGE SCPI EUROPÉENNES
  '/scpi-europeennes': [
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Les bases de l\'investissement en SCPI avant de diversifier en Europe',
      icon: 'book-open',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Top 10 des SCPI les plus performantes (France + Europe)',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'Alderan : Leader SCPI Européennes',
      url: '/alderan-scpi',
      description: 'Découvrez Alderan, gestionnaire expert des SCPI européennes depuis 2010',
      icon: 'award',
      type: 'child'
    },
    {
      title: 'Perial Asset Management',
      url: '/perial-asset-management-scpi',
      description: 'SCPI européennes performantes avec forte diversification internationale',
      icon: 'award',
      type: 'child'
    },
    {
      title: 'SCPI France vs Europe : Comparaison',
      url: '/scpi-france-investissement',
      description: 'Comparer les avantages de l\'investissement France vs Europe',
      icon: 'flag',
      type: 'sibling'
    }
  ],

  // PAGE PRÉPARER RETRAITE
  '/preparer-retraite-scpi': [
    {
      title: 'Accueil MaximusSCPI',
      url: '/',
      description: 'Tous nos outils pour préparer votre retraite avec les SCPI',
      icon: 'home',
      type: 'parent'
    },
    {
      title: 'Revenu Complémentaire avec les SCPI',
      url: '/revenu-complementaire-scpi',
      description: 'Générer des revenus passifs mensuels grâce aux SCPI',
      icon: 'euro',
      type: 'sibling'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Sélectionner les SCPI les plus performantes pour votre retraite',
      icon: 'trending-up',
      type: 'child'
    },
    {
      title: 'SCPI Européennes pour la Retraite',
      url: '/scpi-europeennes',
      description: 'Diversifier votre patrimoine retraite avec des SCPI européennes',
      icon: 'globe',
      type: 'child'
    },
    {
      title: 'SCPI Sans Frais : Optimiser son Capital',
      url: '/scpi-sans-frais',
      description: 'Maximiser votre investissement retraite avec 0% de frais d\'entrée',
      icon: 'percent',
      type: 'child'
    }
  ],

  // PAGE REVENU COMPLÉMENTAIRE
  '/revenu-complementaire-scpi': [
    {
      title: 'Accueil MaximusSCPI',
      url: '/',
      description: 'Comparez les SCPI générant les meilleurs revenus mensuels',
      icon: 'home',
      type: 'parent'
    },
    {
      title: 'Préparer sa Retraite avec les SCPI',
      url: '/preparer-retraite-scpi',
      description: 'Anticiper votre retraite avec un revenu complémentaire SCPI',
      icon: 'piggy-bank',
      type: 'sibling'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Top 10 des SCPI offrant les distributions les plus régulières',
      icon: 'trophy',
      type: 'child'
    },
    {
      title: 'SCPI Fiscales : Optimiser la Fiscalité',
      url: '/scpi-fiscales',
      description: 'Combiner revenus et défiscalisation avec les SCPI fiscales',
      icon: 'file-text',
      type: 'child'
    }
  ],

  // PAGE COMPARATEUR
  '/comparateur-scpi': [
    {
      title: 'Accueil MaximusSCPI',
      url: '/',
      description: 'Retour à l\'accueil et au tableau comparatif complet',
      icon: 'home',
      type: 'parent'
    },
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Guide pour comprendre les critères de comparaison des SCPI',
      icon: 'book-open',
      type: 'child'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Résultat de notre comparaison : le Top 10 des meilleures SCPI',
      icon: 'trophy',
      type: 'child'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Comparer les SCPI investies en Europe',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  // PAGE SCPI FISCALES
  '/scpi-fiscales': [
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Les bases avant d\'investir dans les SCPI fiscales',
      icon: 'book-open',
      type: 'parent'
    },
    {
      title: 'SCPI Sans Frais',
      url: '/scpi-sans-frais',
      description: 'Défiscaliser sans frais d\'entrée : certaines SCPI fiscales le proposent',
      icon: 'percent',
      type: 'sibling'
    },
    {
      title: 'Revenu Complémentaire',
      url: '/revenu-complementaire-scpi',
      description: 'SCPI de rendement vs SCPI fiscales : combiner les deux stratégies',
      icon: 'euro',
      type: 'sibling'
    }
  ],

  // PAGES SECTORIELLES

  '/scpi-bureaux-investissement': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Retour au classement général incluant les meilleures SCPI bureaux',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Commerces : Secteur Retail',
      url: '/scpi-commerces-investissement',
      description: 'Alternative aux bureaux : les SCPI spécialisées commerces',
      icon: 'shopping-cart',
      type: 'sibling'
    },
    {
      title: 'SCPI Santé : Secteur Porteur',
      url: '/scpi-sante-investissement',
      description: 'Diversifier avec le secteur de la santé : EHPAD et cliniques',
      icon: 'heart',
      type: 'sibling'
    },
    {
      title: 'SCPI Européennes Bureaux',
      url: '/scpi-europeennes',
      description: 'Bureaux premium en Europe : Paris, Berlin, Amsterdam, Madrid',
      icon: 'globe',
      type: 'child'
    },
    {
      title: 'Amundi Immobilier : Expert Bureaux',
      url: '/amundi-immobilier-scpi',
      description: 'Leader français des SCPI bureaux avec performances solides',
      icon: 'award',
      type: 'child'
    }
  ],

  '/scpi-commerces-investissement': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Top 10 incluant les meilleures SCPI commerces',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Bureaux : Secteur Tertiaire',
      url: '/scpi-bureaux-investissement',
      description: 'Comparer avec les SCPI bureaux pour diversifier votre portefeuille',
      icon: 'building',
      type: 'sibling'
    },
    {
      title: 'SCPI Santé : Diversification Sectorielle',
      url: '/scpi-sante-investissement',
      description: 'Compléter votre investissement avec le secteur santé',
      icon: 'heart',
      type: 'sibling'
    },
    {
      title: 'Greenman : Leader Retail Parks',
      url: '/greenman-arth-scpi',
      description: 'Spécialiste européen des retail parks avec rendements attractifs',
      icon: 'award',
      type: 'child'
    }
  ],

  '/scpi-sante-investissement': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement complet des SCPI incluant le secteur santé',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Bureaux',
      url: '/scpi-bureaux-investissement',
      description: 'Diversifier avec les SCPI bureaux en complément santé',
      icon: 'building',
      type: 'sibling'
    },
    {
      title: 'SCPI Commerces',
      url: '/scpi-commerces-investissement',
      description: 'Alternative ou complément : les SCPI commerces',
      icon: 'shopping-cart',
      type: 'sibling'
    },
    {
      title: 'Préparer sa Retraite',
      url: '/preparer-retraite-scpi',
      description: 'Secteur santé idéal pour préparer sa retraite (demande croissante)',
      icon: 'piggy-bank',
      type: 'child'
    }
  ],

  '/scpi-france-investissement': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Top 10 des SCPI France et Europe confondues',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes : Diversification',
      url: '/scpi-europeennes',
      description: 'Comparer France vs Europe : avantages de la diversification internationale',
      icon: 'globe',
      type: 'sibling'
    },
    {
      title: 'Novaxia : Expert Urbain France',
      url: '/novaxia-investissement-scpi',
      description: 'Spécialiste du recyclage urbain et de l\'immobilier français',
      icon: 'award',
      type: 'child'
    },
    {
      title: 'Fiducial Gérance : SCPI France',
      url: '/fiducial-gerance-scpi',
      description: 'Gestionnaire historique avec forte présence sur le territoire français',
      icon: 'award',
      type: 'child'
    }
  ],

  '/scpi-sans-frais': [
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Comprendre l\'impact des frais sur votre rendement SCPI',
      icon: 'book-open',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Top 10 avec identification des SCPI sans ou à frais réduits',
      icon: 'trophy',
      type: 'child'
    },
    {
      title: 'SCPI Fiscales Sans Frais',
      url: '/scpi-fiscales',
      description: 'Défiscaliser sans frais d\'entrée : optimisation maximale',
      icon: 'file-text',
      type: 'sibling'
    },
    {
      title: 'Comparateur SCPI',
      url: '/comparateur-scpi',
      description: 'Comparer les frais de toutes les SCPI du marché',
      icon: 'bar-chart',
      type: 'child'
    }
  ],

  // PAGES GESTIONNAIRES - TOP GESTIONNAIRES

  '/alderan-scpi': [
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Retour aux SCPI européennes (Alderan est leader européen)',
      icon: 'globe',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement incluant les SCPI Alderan (Diversipierre, Comète)',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'Perial Asset Management',
      url: '/perial-asset-management-scpi',
      description: 'Alternative : autre grand gestionnaire européen',
      icon: 'award',
      type: 'sibling'
    },
    {
      title: 'La Française REM',
      url: '/la-francaise-rem-scpi',
      description: 'Comparer avec un autre acteur majeur du marché',
      icon: 'award',
      type: 'sibling'
    }
  ],

  '/perial-asset-management-scpi': [
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Perial propose des SCPI fortement diversifiées en Europe',
      icon: 'globe',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement des SCPI incluant PFO2 et autres SCPI Perial',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'Alderan SCPI',
      url: '/alderan-scpi',
      description: 'Comparer avec Alderan, autre leader des SCPI européennes',
      icon: 'award',
      type: 'sibling'
    },
    {
      title: 'Amundi Immobilier',
      url: '/amundi-immobilier-scpi',
      description: 'Alternative : leader français de la gestion d\'actifs immobiliers',
      icon: 'award',
      type: 'sibling'
    }
  ],

  '/amundi-immobilier-scpi': [
    {
      title: 'SCPI Bureaux',
      url: '/scpi-bureaux-investissement',
      description: 'Amundi : expert des SCPI bureaux premium',
      icon: 'building',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement incluant les SCPI Amundi',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'La Française REM',
      url: '/la-francaise-rem-scpi',
      description: 'Comparer avec un autre gestionnaire historique',
      icon: 'award',
      type: 'sibling'
    }
  ],

  '/la-francaise-rem-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement complet incluant les SCPI La Française',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'La Française propose plusieurs SCPI diversifiées en Europe',
      icon: 'globe',
      type: 'parent'
    },
    {
      title: 'Amundi Immobilier',
      url: '/amundi-immobilier-scpi',
      description: 'Alternative : autre gestionnaire de premier plan',
      icon: 'award',
      type: 'sibling'
    }
  ],

  '/novaxia-investissement-scpi': [
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'Novaxia : spécialiste du recyclage urbain en France',
      icon: 'flag',
      type: 'parent'
    },
    {
      title: 'Recyclage Urbain SCPI',
      url: '/recyclage-urbain-scpi',
      description: 'Page dédiée à la SCPI Recyclage Urbain de Novaxia',
      icon: 'recycle',
      type: 'child'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement incluant les SCPI Novaxia',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/recyclage-urbain-scpi': [
    {
      title: 'Novaxia Investissement',
      url: '/novaxia-investissement-scpi',
      description: 'Retour au gestionnaire Novaxia',
      icon: 'building',
      type: 'parent'
    },
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'SCPI 100% France avec impact environnemental positif',
      icon: 'flag',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Position de Recyclage Urbain dans le classement général',
      icon: 'trophy',
      type: 'sibling'
    }
  ],

  '/greenman-arth-scpi': [
    {
      title: 'SCPI Commerces',
      url: '/scpi-commerces-investissement',
      description: 'Greenman : leader européen des retail parks',
      icon: 'shopping-cart',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Forte présence en Allemagne, Pays-Bas et Europe du Nord',
      icon: 'globe',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement incluant les SCPI Greenman',
      icon: 'trophy',
      type: 'sibling'
    }
  ],

  // AUTRES GESTIONNAIRES

  '/aestiam-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement des SCPI Aestiam (Pierre Capitalisation, Placement Pierre)',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Diversification européenne avec Aestiam',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/altixia-reim-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Position des SCPI Altixia dans notre classement',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Bureaux',
      url: '/scpi-bureaux-investissement',
      description: 'Altixia spécialisé en immobilier de bureaux',
      icon: 'building',
      type: 'sibling'
    }
  ],

  '/arkea-reim-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Arkea REIM dans le classement',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'Arkea : forte présence en France',
      icon: 'flag',
      type: 'sibling'
    }
  ],

  '/atland-voisin-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement des SCPI Atland Voisin',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/atream-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Performance des SCPI Atream (immobilier durable)',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'SCPI durables avec diversification européenne',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/consultim-asset-management-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Consultim dans notre sélection',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/fiducial-gerance-scpi': [
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'Fiducial : gestionnaire historique français depuis 1977',
      icon: 'flag',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement incluant les SCPI Fiducial',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/inter-gestion-reim-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Performance des SCPI Intergestion',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/iroko-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Iroko dans le classement (Zen, Rendement)',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Iroko avec forte diversification européenne',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/kyaneos-asset-management-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Position des SCPI Kyaneos',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/magellim-reim-scpi': [
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'Magellim : focus sur les régions françaises',
      icon: 'flag',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Magellim dans le classement',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/norma-capital-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Performance des SCPI Norma Capital',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Norma Capital avec présence européenne',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/paref-gestion-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Paref dans notre sélection',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/praemia-reim-france-scpi': [
    {
      title: 'SCPI Bureaux',
      url: '/scpi-bureaux-investissement',
      description: 'Praemia : spécialiste des bureaux premium',
      icon: 'building',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Classement des SCPI Praemia REIM',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Forte présence européenne de Praemia',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/remake-asset-management-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Remake dans le classement',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Diversification européenne durable avec Remake',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/sofidy-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Performance des SCPI Sofidy',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'Sofidy : acteur majeur français',
      icon: 'flag',
      type: 'sibling'
    }
  ],

  '/sogenial-immobilier-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Sogenial dans notre classement',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  '/swiss-life-am-france-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Performance des SCPI Swiss Life',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Swiss Life : expertise européenne en immobilier',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/theoreim-scpi': [
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Les SCPI Théoreim dans le classement',
      icon: 'trophy',
      type: 'parent'
    },
    {
      title: 'SCPI Européennes',
      url: '/scpi-europeennes',
      description: 'Diversification européenne avec Théoreim',
      icon: 'globe',
      type: 'sibling'
    }
  ],

  '/urban-premium-scpi': [
    {
      title: 'SCPI France',
      url: '/scpi-france-investissement',
      description: 'Urban Premium : immobilier urbain premium français',
      icon: 'flag',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Position d\'Urban Premium dans le classement',
      icon: 'trophy',
      type: 'parent'
    }
  ],

  // PAGES LÉGALES

  '/faq': [
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Guide détaillé complétant les réponses de la FAQ',
      icon: 'book-open',
      type: 'parent'
    },
    {
      title: 'Meilleures SCPI de Rendement',
      url: '/meilleures-scpi-rendement',
      description: 'Notre sélection des meilleures SCPI après vos questions',
      icon: 'trophy',
      type: 'child'
    },
    {
      title: 'À propos de MaximusSCPI',
      url: '/a-propos',
      description: 'Découvrez notre expertise et nos valeurs',
      icon: 'users',
      type: 'sibling'
    }
  ],

  '/a-propos': [
    {
      title: 'Accueil MaximusSCPI',
      url: '/',
      description: 'Retour au comparateur et à nos outils',
      icon: 'home',
      type: 'parent'
    },
    {
      title: 'FAQ : Vos Questions',
      url: '/faq',
      description: 'Toutes les réponses sur les SCPI',
      icon: 'help-circle',
      type: 'sibling'
    },
    {
      title: 'Comprendre les SCPI',
      url: '/comprendre-scpi',
      description: 'Notre guide complet pour investir en SCPI',
      icon: 'book-open',
      type: 'child'
    }
  ]
};

export const getSemanticLinks = (pagePath: string): SemanticLink[] => {
  return semanticCoconConfig[pagePath] || [];
};
