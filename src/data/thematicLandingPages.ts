export interface ThematicLandingPageData {
  slug: string;
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  labelText?: string;
  senderGroupId?: string;
  keyMetrics: {
    value: string;
    label: string;
  }[];
  benefits: string[];
  pourquoiChoisir: {
    title: string;
    subtitle: string;
    features: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
  informationsPratiques: {
    title: string;
    items: {
      icon: string;
      title: string;
      points: string[];
    }[];
  };
  faq: {
    question: string;
    answer: string;
  }[];
  temoignages?: {
    nom: string;
    texte: string;
    note: number;
  }[];
  relatedScpi?: string[];
  geographie?: Record<string, number>;
  secteurs?: Record<string, number>;
  simulator?: {
    defaultInvestment?: number;
    defaultYield?: number;
    title?: string;
    subtitle?: string;
    theme?: 'blue' | 'green' | 'indigo';
  };
}

export const thematicLandingPages: Record<string, ThematicLandingPageData> = {
  'meilleures-scpi-rendement': {
    slug: 'meilleures-scpi-rendement',
    title: 'Meilleures SCPI de Rendement 2025 | Top 5 des SCPI les Plus Performantes',
    metaDescription: 'Découvrez notre classement des meilleures SCPI de rendement 2025. Comparatif détaillé des SCPI offrant les taux de distribution les plus élevés du marché.',
    heroTitle: 'Top 5 des Meilleures SCPI de Rendement',
    heroTitleHighlight: 'Rendements moyens de 4% à 6%',
    heroSubtitle: 'Sélection exclusive des SCPI offrant les meilleurs taux de distribution du marché français en 2025',
    labelText: 'Top 5 MaximusSCPI - Classement Officiel 2025',
    senderGroupId: 'LM_SCPI_MeilleursRendements',
    keyMetrics: [
      { value: '5,5%', label: 'Rendement moyen' },
      { value: '51', label: 'SCPI analysées' },
      { value: '95%+', label: 'TOF moyen' }
    ],
    benefits: [
      'Sélection rigoureuse parmi 51 SCPI du marché',
      'Rendements moyens de 4% à 6%',
      'Diversification géographique et sectorielle',
      'Taux d\'occupation financier supérieur à 93%',
      'Labels ISR et investissement responsable'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans ces 5 SCPI ?',
      subtitle: 'Les SCPI les plus performantes du marché sélectionnées par nos experts',
      features: [
        {
          icon: 'trending-up',
          title: 'Rendements attractifs',
          description: 'Les meilleures SCPI affichent des rendements moyens de 4% à 6%, largement supérieurs aux placements traditionnels'
        },
        {
          icon: 'shield',
          title: 'Sécurité et stabilité',
          description: 'Taux d\'occupation entre 93% et 100%, capitalisations solides, gestion par des sociétés reconnues (Alderan, Arkéa REIM, Atland Voisin)'
        },
        {
          icon: 'globe',
          title: 'Diversification optimale',
          description: 'Investissements répartis sur plusieurs pays européens (France, Espagne, Allemagne, Pays-Bas) et multiples secteurs d\'activité'
        },
        {
          icon: 'leaf',
          title: 'Investissement responsable',
          description: 'Toutes labellisées ISR (Investissement Socialement Responsable), conformes aux critères ESG et Article 8 SFDR'
        }
      ]
    },
    informationsPratiques: {
      title: 'Informations pratiques sur les meilleures SCPI de rendement',
      items: [
        {
          icon: 'file-text',
          title: 'Comment investir ?',
          points: [
            'Montant minimum : de 1 000€ à 5 000€ selon les SCPI',
            'Délai de jouissance : 4 à 6 mois en moyenne',
            'Versements : trimestriels ou mensuels',
            'Frais de souscription : 0% à 10% selon la SCPI'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'Performance et risques',
          points: [
            'Rendement moyen des meilleures SCPI : 5% à 6%',
            'Taux d\'occupation moyen : 95%+',
            'Diversification : 4 à 5 pays européens',
            'Horizon recommandé : 8 à 10 ans minimum'
          ]
        },
        {
          icon: 'calculator',
          title: 'Fiscalité',
          points: [
            'Revenus imposés comme revenus fonciers',
            'TMI + 17,2% de prélèvements sociaux',
            'Option assurance-vie pour optimiser',
            'Possibilité de démembrement temporaire'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Quelle est la meilleure SCPI de rendement en 2025 ?',
        answer: 'La SCPI Comète d\'Alderan figure parmi les rendements élevés avec un taux de distribution 2025 de 9,00%. Créée en 2023, elle investit à l\'international (Royaume-Uni, Espagne, Italie, Pays-Bas, Irlande, Pologne, Canada) avec un portefeuille diversifié sur 7 secteurs. Le taux d\'occupation financier atteint 99,1% au T4 2025.'
      },
      {
        question: 'Combien peut-on gagner avec 10 000€ investis dans ces SCPI ?',
        answer: 'Avec 10 000€ investis dans Comète (9,00%), vous percevrez 900€ bruts par an, soit environ 75€ par mois. Après impôts (TMI 30% + PS 17,2%), cela représente environ 475€ nets par an. Les revenus des autres SCPI du Top 5 varient selon leur taux de distribution.'
      },
      {
        question: 'Les SCPI à haut rendement sont-elles plus risquées ?',
        answer: 'Un rendement élevé peut refléter différents facteurs : SCPI récente en phase de collecte (Comète), stratégie internationale (Transitions Europe), ou modèle économique innovant. Le risque est limité par la diversification géographique et sectorielle. Vérifiez toujours le TOF (99,1% pour Comète au T4 2025) et la qualité de gestion.'
      },
      {
        question: 'Peut-on investir dans plusieurs SCPI du Top 5 ?',
        answer: 'Oui, c\'est même recommandé ! Diversifier sur 2 à 3 SCPI du Top 5 réduit votre risque tout en maintenant un bon rendement global. Par exemple : 40% Comète (9,00%), 30% Transitions Europe (8,25%), 30% Optimale (6,51%) = rendement moyen d\'environ 8,03% avec une diversification France + Europe.'
      },
      {
        question: 'Quels sont les frais à prévoir pour investir dans ces SCPI ?',
        answer: 'Les frais varient selon les SCPI : Comète et Transitions Europe ont 10% de frais de souscription, Remake Live 0% (compensés par des frais de gestion plus élevés). Ajoutez environ 10-12% de frais de gestion annuels (déjà déduits du rendement affiché). Sur 10 ans, les frais d\'entrée sont amortis par les rendements élevés.'
      }
    ],
    temoignages: [
      {
        nom: 'Sophie M., 42 ans',
        texte: 'J\'ai investi 50 000€ répartis sur Comète et Transitions Europe suite aux conseils d\'Eric. Je perçois maintenant près de 375€ par mois de revenus passifs. Excellent complément !',
        note: 5
      },
      {
        nom: 'Marc L., 56 ans',
        texte: 'Après avoir comparé les 51 SCPI avec MaximusSCPI, j\'ai choisi le Top 3 pour préparer ma retraite. Le rendement de 9% en moyenne dépasse toutes mes attentes.',
        note: 5
      },
      {
        nom: 'Claire D., 35 ans',
        texte: 'Je cherchais à diversifier mon épargne. Le Top 5 de MaximusSCPI m\'a permis d\'investir sereinement avec des rendements bien supérieurs à mon assurance-vie.',
        note: 5
      }
    ],
    relatedScpi: ['comete', 'transitions-europe', 'remake-live', 'epargne-pierre-europe', 'optimale'],
    geographie: {
      'France': 45,
      'Allemagne': 20,
      'Espagne': 15,
      'Pays-Bas': 10,
      'Italie': 5,
      'Autres': 5
    },
    secteurs: {
      'Bureaux': 40,
      'Commerce': 25,
      'Logistique': 15,
      'Santé': 10,
      'Hôtellerie': 5,
      'Résidentiel': 5
    }
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus avec les meilleures SCPI`,
      subtitle: `Calculez vos revenus potentiels`,
      theme: 'blue'
    }
},
  'scpi-fiscales': {
    slug: 'scpi-fiscales',
    title: 'SCPI Fiscales 2025 | Réduire ses Impôts avec Malraux et Déficit Foncier',
    metaDescription: 'Réduisez vos impôts avec les SCPI fiscales. Découvrez les dispositifs Malraux et Déficit Foncier pour optimiser votre fiscalité immobilière.',
    heroTitle: 'SCPI Fiscales',
    heroTitleHighlight: 'Optimisez votre fiscalité immobilière',
    heroSubtitle: 'Investissez dans l\'immobilier tout en réduisant vos impôts avec les dispositifs Malraux et Déficit Foncier',
    labelText: 'Défiscalisation Immobilière - Malraux & Déficit Foncier',
    keyMetrics: [
      { value: '30%', label: 'Réduction Malraux' },
      { value: '10 700€', label: 'Déficit/an max' },
      { value: '0%', label: 'Gestion locative' }
    ],
    benefits: [
      'Réduction d\'impôt Malraux jusqu\'à 30% des travaux',
      'Déficit Foncier : jusqu\'à 10 700€/an déductibles',
      'Investissement immobilier sans gestion',
      'Diversification du patrimoine',
      'Accompagnement fiscal personnalisé'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans les SCPI fiscales ?',
      subtitle: 'La défiscalisation immobilière simplifiée et sécurisée',
      features: [
        {
          icon: 'calculator',
          title: 'Réduction d\'impôt selon dispositif',
          description: 'Malraux : 30% des travaux de rénovation. Déficit Foncier : imputation jusqu\'à 10 700€/an sur revenus globaux. Économie fiscale certifiée et optimisée.'
        },
        {
          icon: 'shield',
          title: 'Sans gestion locative',
          description: 'La société de gestion s\'occupe de tout : acquisition, location, travaux, relocation. Vous n\'avez aucune contrainte administrative.'
        },
        {
          icon: 'trending-up',
          title: 'Patrimoine diversifié',
          description: 'Mutualisation sur plusieurs biens immobiliers, répartition des risques, accessibilité dès quelques milliers d\'euros.'
        },
        {
          icon: 'file-text',
          title: 'Accompagnement fiscal',
          description: 'Simulation personnalisée selon votre TMI, optimisation de votre stratégie fiscale, déclarations simplifiées avec la SCPI.'
        }
      ]
    },
    informationsPratiques: {
      title: 'Comprendre les SCPI fiscales',
      items: [
        {
          icon: 'file-text',
          title: 'Les dispositifs fiscaux',
          points: [
            'Malraux : monuments historiques, 30% des travaux',
            'Déficit Foncier : ancien à rénover, 10 700€/an',
            'Déduction immédiate sur revenus globaux',
            'Durée engagement : 9-15 ans selon dispositif'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'Profils investisseurs',
          points: [
            'TMI minimum 30% (idéal 41% ou 45%)',
            'Revenus fonciers importants (Déficit Foncier)',
            'Vision long terme (8-15 ans)',
            'Épargne disponible pour frais d\'entrée'
          ]
        },
        {
          icon: 'calculator',
          title: 'Rendement global',
          points: [
            'Rendement locatif : 2-3% bruts',
            'Économie fiscale : 5-7% annuels',
            'Rendement total : 7-10% sur durée engagement',
            'Frais : 10-12% souscription + gestion'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Quelle SCPI fiscale choisir pour réduire mes impôts ?',
        answer: 'Le choix dépend de votre situation fiscale. Si vous avez déjà des revenus fonciers importants, privilégiez une SCPI Déficit Foncier qui viendra réduire votre assiette imposable (jusqu\'à 10 700€/an déductibles). Si votre TMI est élevé (41-45%) et que vous investissez dans la rénovation du patrimoine historique, optez pour une SCPI Malraux (30% des travaux de rénovation). Une simulation personnalisée est essentielle.'
      },
      {
        question: 'Combien puis-je économiser avec une SCPI Malraux ?',
        answer: 'Avec une SCPI Malraux, vous bénéficiez d\'une réduction d\'impôt de 30% du montant des travaux de rénovation. Par exemple, pour 100 000€ de travaux, vous économiserez 30 000€ d\'impôts étalés sur la durée des travaux. Le rendement locatif (2-3% bruts) s\'ajoute à cette économie fiscale. C\'est particulièrement intéressant si votre TMI est élevé (41-45%).'
      },
      {
        question: 'Les SCPI fiscales sont-elles vraiment rentables ?',
        answer: 'Oui, si vous êtes fortement imposé (TMI 41-45% recommandé) et conservez vos parts jusqu\'à la fin de l\'engagement. Le rendement locatif (2-3%) + l\'économie fiscale (Malraux 30% ou Déficit Foncier 10 700€/an) génèrent un rendement global attractif sur la durée. En revanche, en cas de revente anticipée, vous devrez rembourser l\'avantage fiscal perçu, annulant tout l\'intérêt.'
      },
      {
        question: 'Peut-on revendre ses parts de SCPI fiscale avant la fin ?',
        answer: 'Techniquement oui, mais c\'est fortement déconseillé. Vous devrez rembourser toutes les réductions d\'impôts perçues, majorées d\'intérêts de retard. De plus, le marché secondaire des SCPI fiscales est peu liquide. Investissez uniquement si vous êtes certain de conserver vos parts pendant toute la durée d\'engagement (6 à 15 ans selon les dispositifs).'
      }
    ],
    relatedScpi: []
  ,
    geographie: {
      'France': 85,
      'DOM-TOM': 10,
      'Autres': 5
    },
    secteurs: {
      'Résidentiel': 60,
      'Résidences Services': 20,
      'Immobilier Social': 15,
      'Autres': 5
    }
,
    simulator: {
      defaultInvestment: 80000,
      defaultYield: 4.2,
      title: `Simulez votre défiscalisation`,
      subtitle: `Économies d impôts et revenus locatifs`,
      theme: 'green'
    }
},
  'preparer-retraite-scpi': {
    slug: 'preparer-retraite-scpi',
    title: 'Préparer sa Retraite avec les SCPI | Complément de Revenu Garanti',
    metaDescription: 'Préparez sereinement votre retraite avec les SCPI. Percevez un complément de revenu régulier grâce aux revenus locatifs immobiliers.',
    heroTitle: 'Préparez Votre Retraite avec les SCPI',
    heroTitleHighlight: 'Dès 150€/mois, construisez votre complément de revenu',
    heroSubtitle: 'Constituez progressivement un capital immobilier qui vous versera des loyers réguliers pendant votre retraite',
    labelText: 'Solution Retraite - Accessible dès 150€/mois',
    senderGroupId: 'LM_SCPI_PreparerRetraite',
    keyMetrics: [
      { value: '150€', label: 'Épargne/mois' },
      { value: 'Dès 200€', label: 'Montant minimum' },
      { value: '5%', label: 'Rendement moyen' }
    ],
    benefits: [
      'Complément de revenu régulier à vie',
      'Capital transmissible à vos héritiers',
      'Pas de gestion locative',
      'Diversification immobilière automatique',
      'Solution adaptée selon l\'âge'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi les SCPI pour préparer sa retraite ?',
      subtitle: 'La solution patrimoniale idéale pour un revenu complémentaire pérenne',
      features: [
        {
          icon: 'trending-up',
          title: 'Objectif de revenus réguliers',
          description: 'Percevez des loyers trimestriels ou mensuels à vie, stables et prévisibles. Rendement moyen de 4 à 6%, largement supérieur aux placements traditionnels.'
        },
        {
          icon: 'shield',
          title: 'Zéro gestion',
          description: 'Aucune contrainte de gestion locative, pas de travaux, pas de locataires difficiles. La société de gestion s\'occupe de tout, vous profitez simplement.'
        },
        {
          icon: 'calculator',
          title: 'Constitution progressive',
          description: 'Commencez avec 150€/mois ou un versement initial dès 200€. Sur 20-30 ans, constituez un capital généreux grâce à l\'effet boule de neige des revenus réinvestis.'
        },
        {
          icon: 'globe',
          title: 'Transmissible à vos héritiers',
          description: 'Vos parts de SCPI se transmettent comme tout actif successoral. Vos héritiers continuent de percevoir les loyers ou peuvent revendre.'
        }
      ]
    },
    informationsPratiques: {
      title: 'Comment investir pour la retraite ?',
      items: [
        {
          icon: 'file-text',
          title: 'Stratégies selon l\'âge',
          points: [
            '30-40 ans : Constitution progressive, réinvestissement',
            '40-50 ans : Accélération, diversification 2-3 SCPI',
            '50-60 ans : Optimisation, nue-propriété possible',
            'Retraités : Pleine propriété, revenus immédiats'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'Montages patrimoniaux',
          points: [
            'Pleine propriété : loyers immédiats',
            'Nue-propriété : décote 20-40%, loyers différés',
            'Assurance-vie : fiscalité avantageuse après 8 ans',
            'PER : déduction fiscale, sortie en rente ou capital'
          ]
        },
        {
          icon: 'calculator',
          title: 'Exemples accessibles',
          points: [
            'Démarrer avec 200€ : première pierre posée',
            'Épargne 150€/mois sur 30 ans = capital conséquent',
            'Versements libres selon votre budget',
            'Revenus complémentaires à vie + transmission'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'À quel âge commencer à investir en SCPI pour la retraite ?',
        answer: 'Le plus tôt possible, même avec de petits montants ! Vous pouvez débuter dès 200€ et augmenter progressivement. À 30 ans avec 150€/mois, vous profitez de 30 ans d\'effet boule de neige. Commencer à 50 ans nécessitera des versements plus importants. L\'idéal : débuter dès que vous avez une stabilité professionnelle, quel que soit le montant disponible.'
      },
      {
        question: 'Les SCPI sont-elles meilleures qu\'un PER pour la retraite ?',
        answer: 'Les deux sont complémentaires, pas concurrents. Le PER offre une réduction d\'impôt immédiate mais bloque votre épargne jusqu\'à la retraite. Les SCPI génèrent des revenus dès maintenant (ou après démembrement) sans blocage total. L\'idéal : PER pour la défiscalisation + SCPI pour les revenus réguliers. Vous diversifiez ainsi vos sources de revenus futurs.'
      },
      {
        question: 'Quel complément de revenu puis-je espérer avec les SCPI ?',
        answer: 'Tout dépend de votre capacité d\'épargne et de votre horizon de temps. Avec 150€/mois sur 30 ans, vous pouvez viser un complément confortable. Avec 300€/mois, vous doublez vos perspectives. L\'important est de commencer tôt et de profiter de l\'effet boule de neige en réinvestissant vos premiers loyers. Chaque situation est unique, d\'où l\'importance d\'un conseil personnalisé.'
      },
      {
        question: 'Que deviennent mes parts de SCPI après mon décès ?',
        answer: 'Vos parts de SCPI se transmettent à vos héritiers comme tout actif successoral, selon les règles classiques de succession. Vos héritiers continuent de percevoir les loyers, contrairement à une assurance-vie qui est versée en capital. Pour optimiser la transmission, vous pouvez démembrer (donner la nue-propriété) ou investir via une assurance-vie (abattement de 152 500€ par bénéficiaire).'
      }
    ],
    temoignages: [
      {
        nom: 'Jean-Pierre D., 62 ans',
        texte: 'J\'ai commencé à investir en SCPI il y a 15 ans. Aujourd\'hui à la retraite, je perçois 850€/mois de revenus passifs qui complètent ma pension. Un vrai confort !',
        note: 5
      },
      {
        nom: 'Martine L., 58 ans',
        texte: 'Sur les conseils d\'Éric, j\'ai investi progressivement en SCPI depuis 10 ans. Dans 2 ans, ces revenus complémentaires feront toute la différence pour ma retraite.',
        note: 5
      },
      {
        nom: 'Patrick M., 45 ans',
        texte: 'Il n\'est jamais trop tôt ! J\'investis 500€/mois en SCPI depuis 5 ans. À 65 ans, j\'aurai constitué un capital qui me versera 1 200€/mois. Anticiper est essentiel.',
        note: 5
      }
    ],
    relatedScpi: ['transitions-europe', 'optimale', 'epargne-pierre-europe', 'iroko-zen', 'remake-live'],
    geographie: {
      'France': 55,
      'Allemagne': 18,
      'Pays-Bas': 12,
      'Espagne': 8,
      'Autres': 7
    },
    secteurs: {
      'Bureaux': 38,
      'Commerce': 22,
      'Santé': 15,
      'Logistique': 12,
      'Résidentiel': 8,
      'Hôtellerie': 5
    }
  ,
    simulator: {
      defaultInvestment: 100000,
      defaultYield: 5.2,
      title: `Simulez votre retraite`,
      subtitle: `Estimez les revenus mensuels pour votre retraite`,
      theme: 'green'
    }
},
  'revenu-complementaire-scpi': {
    slug: 'revenu-complementaire-scpi',
    title: 'Générer un Revenu Complémentaire avec les SCPI | Revenus Passifs',
    metaDescription: 'Générez un revenu complémentaire régulier avec les SCPI. Percevez des loyers mensuels ou trimestriels sans gestion locative.',
    heroTitle: 'Générez un Revenu Complémentaire',
    heroTitleHighlight: 'Revenus passifs mensuels de 4% à 6%',
    heroSubtitle: 'Augmentez votre pouvoir d\'achat avec des revenus locatifs réguliers et automatiques',
    labelText: 'Revenus Passifs - Versements Mensuels',
    senderGroupId: 'LM_SCPI_RevenuComplementaire',
    keyMetrics: [
      { value: '500€', label: 'Revenu mensuel (exemple)' },
      { value: '100 000€', label: 'Capital investi' },
      { value: '6%', label: 'Rendement net' }
    ],
    benefits: [
      'Revenus mensuels ou trimestriels automatiques',
      'Rendements de 4% à 6% par an en moyenne',
      'Aucune gestion locative',
      'Capital accessible (liquidité relative)',
      'Diversification immobilière instantanée'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi générer un revenu complémentaire avec les SCPI ?',
      subtitle: 'La solution la plus simple pour augmenter vos revenus mensuels',
      features: [
        {
          icon: 'dollar-sign',
          title: 'Revenus passifs réguliers',
          description: 'Percevez des loyers tous les mois ou trimestres, proportionnels à votre investissement. Stables, prévisibles, indexés sur l\'inflation.'
        },
        {
          icon: 'trending-up',
          title: 'Rendements attractifs',
          description: '10 000€ à 5% = 500€/an. 30 000€ = 1 500€/an. 50 000€ = 2 500€/an. Les meilleures SCPI offrent 4% à 6% de rendement moyen annuel.'
        },
        {
          icon: 'calendar',
          title: 'Versements réguliers',
          description: 'Les SCPI distribuent des revenus mensuels ou trimestriels selon la société de gestion, pour un flux de trésorerie optimal et prévisible.'
        },
        {
          icon: 'shield',
          title: '100% passif',
          description: 'Zéro gestion : pas de travaux, pas de locataires, pas de vacance. La société de gestion s\'occupe de tout. Vous recevez simplement vos loyers.'
        }
      ]
    },
    informationsPratiques: {
      title: 'Combien investir pour générer des revenus ?',
      items: [
        {
          icon: 'file-text',
          title: 'Simulation revenus',
          points: [
            '10 000€ à 5% = 500€/an (42€/mois)',
            '30 000€ à 5% = 1 500€/an (125€/mois)',
            '50 000€ à 5% = 2 500€/an (208€/mois)',
            'Les rendements varient selon les SCPI (4% à 6%)'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'Fiscalité des revenus',
          points: [
            'Imposés comme revenus fonciers (TMI + 17,2% PS)',
            'TMI 30% : environ 53% de revenus nets',
            'Optimisation via assurance-vie ou PER',
            'Démembrement temporaire pour différer fiscalité'
          ]
        },
        {
          icon: 'calculator',
          title: 'Exemples de SCPI performantes',
          points: [
            'Consultez notre comparateur pour trouver les meilleures SCPI',
            'Privilégiez la diversification sur plusieurs SCPI',
            'Vérifiez la qualité du patrimoine et la solidité financière',
            'Analysez l\'historique de distribution sur 5-10 ans'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Combien investir pour gagner 200€/mois avec les SCPI ?',
        answer: 'Avec un rendement moyen de 5%, il faut investir environ 50 000€ pour générer 2 500€/an, soit environ 208€/mois bruts. Après impôts (TMI 30% + 17,2% PS), vous percevrez environ 130€/mois nets. Pour des revenus plus élevés, vous pouvez constituer ce capital progressivement sur plusieurs années en réinvestissant vos loyers (effet boule de neige).'
      },
      {
        question: 'Les revenus de SCPI sont-ils vraiment passifs ?',
        answer: 'Oui, totalement. Une fois vos parts achetées, vous n\'avez rien à faire. La société de gestion s\'occupe de tout : acquisition des immeubles, location, gestion des travaux, recherche de locataires, relocation. Vous recevez automatiquement vos loyers sur votre compte bancaire chaque mois ou trimestre. C\'est le placement passif par excellence, idéal si vous voulez des revenus sans contrainte.'
      },
      {
        question: 'Peut-on réinvestir ses revenus de SCPI ?',
        answer: 'Oui, c\'est même fortement recommandé pour créer un effet boule de neige ! En réinvestissant vos loyers dans de nouvelles parts, vous augmentez progressivement votre capital et vos revenus futurs. Par exemple, en réinvestissant 500€/an pendant 10 ans à 5%, vous transformez 10 000€ initiaux en 16 000€ environ, augmentant ainsi significativement vos revenus annuels. C\'est la puissance des intérêts composés appliquée à l\'immobilier.'
      },
      {
        question: 'Quelle différence entre SCPI et immobilier locatif direct ?',
        answer: 'Les SCPI offrent une gestion 100% déléguée (zéro contrainte), une diversification immédiate (des dizaines d\'immeubles), une accessibilité (dès quelques milliers d\'euros), et une liquidité relative (revente possible). L\'immobilier locatif direct demande du temps (gestion, travaux), de l\'énergie (locataires, litiges), et un capital important (apport + frais). Les SCPI sont l\'immobilier locatif sans les inconvénients.'
      }
    ],
    temoignages: [
      {
        nom: 'Stéphanie R., 38 ans',
        texte: 'J\'ai investi 40 000€ en SCPI il y a 3 ans. Je reçois maintenant environ 150€ de revenus passifs chaque mois. Un complément appréciable pour mon budget !',
        note: 5
      },
      {
        nom: 'Thomas B., 44 ans',
        texte: 'Grâce aux conseils d\'Éric, j\'ai diversifié sur 3 SCPI. Je perçois environ 280€/mois automatiquement. Aucune gestion, très satisfait de cet investissement passif !',
        note: 5
      },
      {
        nom: 'Valérie P., 51 ans',
        texte: 'Je réinvestis mes loyers depuis 5 ans. Mon capital a bien progressé et mes revenus passifs atteignent maintenant 350€/mois. L\'effet boule de neige fonctionne vraiment.',
        note: 5
      }
    ],
    relatedScpi: ['optimale', 'iroko-zen', 'remake-live', 'novaxia-neo', 'transitions-europe'],
    geographie: {
      'France': 50,
      'Allemagne': 20,
      'Espagne': 12,
      'Pays-Bas': 10,
      'Italie': 5,
      'Autres': 3
    },
    secteurs: {
      'Bureaux': 42,
      'Commerce': 23,
      'Logistique': 15,
      'Santé': 12,
      'Résidentiel': 5,
      'Autres': 3
    }
  ,
    simulator: {
      defaultInvestment: 75000,
      defaultYield: 5.8,
      title: `Simulez vos revenus complémentaires`,
      subtitle: `Calculez vos revenus passifs mensuels`,
      theme: 'indigo'
    }
},

  'comparateur-scpi': {
    slug: 'comparateur-scpi',
    title: 'Comparateur SCPI 2025 | Comparez 51 SCPI en Direct',
    metaDescription: 'Comparez toutes les SCPI du marché : rendement, TOF, secteur, prix. Données officielles 2025. Gratuit et sans engagement.',
    heroTitle: 'Comparateur SCPI',
    heroTitleHighlight: '51 SCPI à comparer',
    heroSubtitle: 'Comparez les performances de toutes les SCPI du marché français',
    labelText: 'Comparaison Gratuite',
    keyMetrics: [
      { value: '51', label: 'SCPI analysées' },
      { value: '100%', label: 'Données officielles' },
      { value: 'Gratuit', label: 'Sans engagement' }
    ],
    benefits: [
      'Toutes les SCPI du marché en un seul tableau',
      'Données officielles des sociétés de gestion',
      'Mise à jour régulière des performances',
      'Comparaison objective et transparente',
      'Recommandations personnalisées gratuites'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi utiliser notre comparateur ?',
      subtitle: 'La vue la plus complète du marché des SCPI',
      features: [
        {
          icon: 'database',
          title: '51 SCPI comparées',
          description: 'Accédez à la totalité des SCPI disponibles sur le marché français avec leurs données actualisées.'
        },
        {
          icon: 'trending-up',
          title: 'Performances en direct',
          description: 'Rendement, taux d\'occupation, capitalisation, tous les indicateurs clés pour faire le bon choix.'
        },
        {
          icon: 'shield-check',
          title: 'Données certifiées',
          description: 'Informations officielles issues des rapports trimestriels et annuels des sociétés de gestion.'
        },
        {
          icon: 'user-check',
          title: 'Conseils personnalisés',
          description: 'Notre expert analyse votre situation et vous recommande les SCPI les plus adaptées à votre profil.'
        }
      ]
    },
    informationsPratiques: {
      title: 'Comment utiliser le comparateur SCPI ?',
      items: [
        {
          icon: 'search',
          title: 'Comparer les SCPI',
          points: [
            'Consultez toutes les SCPI du marché en un coup d\'œil',
            'Triez par rendement, TOF, secteur ou capitalisation',
            'Filtrez selon vos critères d\'investissement',
            'Analysez les performances et caractéristiques'
          ]
        },
        {
          icon: 'target',
          title: 'Sélectionner les meilleures SCPI',
          points: [
            'Identifiez les SCPI adaptées à votre profil',
            'Comparez les frais et conditions d\'investissement',
            'Vérifiez les labels ISR et engagements ESG',
            'Analysez la diversification sectorielle et géographique'
          ]
        },
        {
          icon: 'user-check',
          title: 'Obtenir un conseil personnalisé',
          points: [
            'Contactez gratuitement notre expert MaximusSCPI',
            'Recevez une recommandation adaptée à vos objectifs',
            'Bénéficiez d\'un accompagnement dans votre investissement',
            'Sans engagement ni frais supplémentaires'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Le comparateur est-il vraiment gratuit ?',
        answer: 'Oui, l\'accès au comparateur et à toutes les données est 100% gratuit et sans engagement. Vous pouvez comparer toutes les SCPI sans créer de compte.'
      },
      {
        question: 'Les données sont-elles à jour ?',
        answer: 'Nous mettons à jour les données trimestriellement à partir des rapports officiels des sociétés de gestion. La date de dernière mise à jour est indiquée.'
      },
      {
        question: 'Comment choisir la meilleure SCPI ?',
        answer: 'Il n\'y a pas de "meilleure SCPI" universelle. Le choix dépend de votre profil, vos objectifs et votre horizon d\'investissement. Notre expert peut vous conseiller gratuitement.'
      }
    ],
    temoignages: [
      {
        nom: 'Pierre L.',
        texte: 'Très pratique pour avoir une vue d\'ensemble du marché. J\'ai pu comparer facilement les rendements et les secteurs.',
        note: 5
      },
      {
        nom: 'Marie T.',
        texte: 'Enfin un comparateur clair et transparent ! Les données sont complètes et faciles à comprendre.',
        note: 5
      }
    ],
    relatedScpi: []
  ,
    geographie: {
      'France': 52,
      'Allemagne': 17,
      'Espagne': 12,
      'Pays-Bas': 10,
      'Belgique': 5,
      'Autres': 4
    },
    secteurs: {
      'Bureaux': 42,
      'Commerces': 23,
      'Santé': 17,
      'Logistique': 11,
      'Résidentiel': 7
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus SCPI`,
      subtitle: `Comparez et calculez vos revenus`,
      theme: 'blue'
    }
},

  // PAGES PAR SECTEUR - LANDING PAGES GOOGLE ADS
  'scpi-bureaux-investissement': {
    slug: 'scpi-bureaux-investissement',
    title: 'Investir SCPI Bureaux 2025 | Obtenez votre Sélection Personnalisée',
    metaDescription: 'Découvrez les meilleures SCPI spécialisées en bureaux. Rendements attractifs, diversification européenne et gestion professionnelle.',
    heroTitle: 'SCPI Bureaux',
    heroTitleHighlight: 'Investissez dans l\'immobilier tertiaire',
    heroSubtitle: 'Accédez aux meilleurs immeubles de bureaux en France et en Europe avec des rendements de 4% à 6%',
    labelText: 'Secteur Bureaux - Valeur Refuge',
    keyMetrics: [
      { value: '15+', label: 'SCPI bureaux' },
      { value: '5,2%', label: 'Rendement moyen' },
      { value: '95%', label: 'TOF moyen' }
    ],
    benefits: [
      'Secteur historique et mature des SCPI',
      'Diversification dans les quartiers d\'affaires européens',
      'Baux commerciaux longue durée (3-6-9 ans)',
      'Locataires professionnels de qualité',
      'Valorisation du patrimoine à long terme'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans des SCPI bureaux ?',
      subtitle: 'Le secteur tertiaire offre stabilité et revenus réguliers',
      features: [
        {
          icon: 'building',
          title: 'Secteur mature',
          description: 'Les SCPI bureaux sont les plus anciennes et bénéficient d\'une expérience de gestion éprouvée depuis plus de 50 ans'
        },
        {
          icon: 'trending-up',
          title: 'Rendements attractifs',
          description: 'Rendements moyens de 4% à 6% avec des distributions trimestrielles régulières'
        },
        {
          icon: 'globe',
          title: 'Diversification géographique',
          description: 'Immeubles situés dans les principales métropoles européennes : Paris, Lyon, Berlin, Amsterdam, Madrid'
        },
        {
          icon: 'shield',
          title: 'Locataires premium',
          description: 'Entreprises multinationales, administrations et grands groupes contribuent à la stabilité des loyers'
        }
      ]
    },
    informationsPratiques: {
      title: 'Informations pratiques sur les SCPI bureaux',
      items: [
        {
          icon: 'file-text',
          title: 'Caractéristiques',
          points: [
            'Ticket d\'entrée : 1 000€ à 5 000€',
            'Rendement moyen : 4% à 6%',
            'Délai de jouissance : 4 à 6 mois',
            'Frais de souscription : 8% à 12%'
          ]
        },
        {
          icon: 'map-pin',
          title: 'Zones géographiques',
          points: [
            'Paris et Île-de-France : 40% à 60%',
            'Grandes métropoles françaises : 20% à 30%',
            'Europe (Allemagne, Pays-Bas, Espagne) : 20% à 40%',
            'Quartiers d\'affaires premium'
          ]
        },
        {
          icon: 'users',
          title: 'Profil investisseur',
          points: [
            'Recherche de revenus réguliers',
            'Horizon d\'investissement : 8 à 12 ans minimum',
            'Diversification patrimoniale',
            'Acceptation d\'une liquidité limitée'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Les SCPI bureaux sont-elles impactées par le télétravail ?',
        answer: 'Le télétravail a effectivement modifié les besoins des entreprises, mais les SCPI bureaux s\'adaptent en investissant dans des immeubles modernes, bien situés et offrant des services (espaces collaboratifs, flex office). Les entreprises recherchent désormais des bureaux de qualité pour attirer les talents.'
      },
      {
        question: 'Quelle est la différence avec les SCPI diversifiées ?',
        answer: 'Les SCPI bureaux sont spécialisées à 100% dans l\'immobilier tertiaire, tandis que les SCPI diversifiées répartissent leurs investissements sur plusieurs secteurs (bureaux, commerces, santé, logistique). Les SCPI bureaux offrent une exposition ciblée sur ce secteur mature.'
      },
      {
        question: 'Quel rendement espérer avec des SCPI bureaux ?',
        answer: 'Le rendement moyen des SCPI bureaux se situe entre 4% et 6% selon les années et les SCPI. Ce rendement provient des loyers versés par les entreprises locataires. Il est généralement distribué trimestriellement.'
      }
    ],
    temoignages: [
      {
        nom: 'Philippe D., 52 ans',
        texte: 'J\'ai investi dans 2 SCPI bureaux pour diversifier mon patrimoine. Les rendements sont réguliers et je suis rassuré par la qualité des immeubles et des locataires.',
        note: 5
      },
      {
        nom: 'Anne-Sophie L., 45 ans',
        texte: 'Les SCPI bureaux offrent une stabilité rassurante. J\'apprécie particulièrement la diversification géographique en Europe et les locataires de qualité.',
        note: 5
      },
      {
        nom: 'Christophe M., 58 ans',
        texte: 'Éric m\'a orienté vers des SCPI bureaux bien positionnées dans les grandes métropoles. Les distributions sont régulières et conformes aux prévisions.',
        note: 5
      }
    ],
    relatedScpi: [],
    geographie: {
      'France': 55,
      'Allemagne': 18,
      'Pays-Bas': 12,
      'Espagne': 8,
      'Belgique': 4,
      'Autres': 3
    },
    secteurs: {
      'Bureaux Premium': 65,
      'Coworking': 15,
      'Quartiers Affaires': 10,
      'Bureaux Régionaux': 7,
      'Campus': 3
    },
    simulator: {
      defaultInvestment: 70000,
      defaultYield: 5.4,
      title: `Simulez vos revenus bureaux`,
      subtitle: `Investissez dans l immobilier tertiaire`,
      theme: 'indigo'
    }
  },

  'scpi-commerces-investissement': {
    slug: 'scpi-commerces-investissement',
    title: 'Investir SCPI Commerces 2025 | Sélection Expert Personnalisée',
    metaDescription: 'Investissez dans les meilleures SCPI commerces. Pieds d\'immeubles, centres commerciaux et retail parks avec des rendements attractifs.',
    heroTitle: 'SCPI Commerces',
    heroTitleHighlight: 'Investissez dans le retail immobilier',
    heroSubtitle: 'Accédez aux commerces de centre-ville, centres commerciaux et retail parks avec des rendements de 5% à 7%',
    labelText: 'Secteur Commerce - Rendements Attractifs',
    keyMetrics: [
      { value: '8+', label: 'SCPI commerces' },
      { value: '5,8%', label: 'Rendement moyen' },
      { value: '93%', label: 'TOF moyen' }
    ],
    benefits: [
      'Rendements supérieurs aux SCPI bureaux',
      'Diversification : centres-villes, retail parks, centres commerciaux',
      'Baux commerciaux 3-6-9 avec indexation',
      'Adaptation à l\'e-commerce (retail parks, drive)',
      'Emplacements premium dans les métropoles'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans des SCPI commerces ?',
      subtitle: 'Le commerce de proximité et les retail parks résistent bien',
      features: [
        {
          icon: 'shopping-cart',
          title: 'Rendements élevés',
          description: 'Les SCPI commerces offrent des rendements de 5% à 7%, supérieurs aux SCPI bureaux grâce aux loyers commerciaux'
        },
        {
          icon: 'map-pin',
          title: 'Emplacements stratégiques',
          description: 'Commerces de pied d\'immeuble dans les centres-villes, retail parks en périphérie, centres commerciaux régionaux'
        },
        {
          icon: 'trending-up',
          title: 'Adaptation au marché',
          description: 'Les SCPI privilégient les formats adaptés : commerces de proximité, drive, retail parks résistants à l\'e-commerce'
        },
        {
          icon: 'shield',
          title: 'Enseignes reconnues',
          description: 'Locataires de qualité : grandes enseignes nationales et internationales, franchises établies'
        }
      ]
    },
    informationsPratiques: {
      title: 'Informations pratiques sur les SCPI commerces',
      items: [
        {
          icon: 'file-text',
          title: 'Caractéristiques',
          points: [
            'Ticket d\'entrée : 1 000€ à 5 000€',
            'Rendement moyen : 5% à 7%',
            'Délai de jouissance : 3 à 6 mois',
            'Frais de souscription : 8% à 12%'
          ]
        },
        {
          icon: 'store',
          title: 'Types de commerces',
          points: [
            'Commerces de pied d\'immeuble (centres-villes)',
            'Retail parks (périphérie des villes)',
            'Centres commerciaux régionaux',
            'Locaux d\'activités commerciales'
          ]
        },
        {
          icon: 'users',
          title: 'Profil investisseur',
          points: [
            'Recherche de rendement élevé',
            'Acceptation d\'une volatilité modérée',
            'Horizon d\'investissement : 8 à 12 ans minimum',
            'Diversification sectorielle'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Les SCPI commerces sont-elles risquées avec l\'e-commerce ?',
        answer: 'Les SCPI commerces se sont adaptées en privilégiant les commerces de proximité (alimentaire, santé, services) résistants à l\'e-commerce et les retail parks (bricolage, ameublement, jardinerie) qui bénéficient du click & collect. Les centres-villes premium restent attractifs.'
      },
      {
        question: 'Pourquoi les rendements sont-ils plus élevés ?',
        answer: 'Les loyers commerciaux sont traditionnellement plus élevés que les loyers de bureaux, ce qui permet aux SCPI commerces d\'offrir des rendements supérieurs. Cette prime de rendement compense un risque locatif légèrement supérieur.'
      },
      {
        question: 'Les SCPI commerces distribuent-elles régulièrement ?',
        answer: 'Oui, comme toutes les SCPI, les SCPI commerces distribuent les loyers perçus, généralement de manière trimestrielle. Les rendements sont attractifs mais peuvent être plus volatils que les SCPI bureaux.'
      }
    ],
    temoignages: [
      {
        nom: 'Marie C., 44 ans',
        texte: 'Les SCPI commerces m\'offrent un rendement supérieur pour diversifier mon portefeuille. J\'apprécie la sélection rigoureuse des emplacements par les sociétés de gestion.',
        note: 5
      },
      {
        nom: 'Laurent B., 51 ans',
        texte: 'J\'ai investi dans une SCPI commerces spécialisée sur les centres-villes. Le rendement de 6% est attractif et les pieds d\'immeubles sont bien situés.',
        note: 5
      },
      {
        nom: 'Isabelle T., 39 ans',
        texte: 'Après conseil d\'Éric, j\'ai choisi une SCPI commerces diversifiée sur plusieurs formats. Les loyers sont réguliers malgré l\'évolution du secteur retail.',
        note: 5
      }
    ],
    relatedScpi: []
  ,
    geographie: {
      'France': 60,
      'Allemagne': 15,
      'Espagne': 12,
      'Pays-Bas': 8,
      'Autres': 5
    },
    secteurs: {
      'Retail Parks': 35,
      'Centres Villes': 30,
      'Centres Commerciaux': 20,
      'Drive': 10,
      'Autres': 5
    }
,
    simulator: {
      defaultInvestment: 60000,
      defaultYield: 5.6,
      title: `Simulez vos revenus commerces`,
      subtitle: `Profitez des loyers commerciaux`,
      theme: 'blue'
    }
},

  'scpi-sante-investissement': {
    slug: 'scpi-sante-investissement',
    title: 'Investir SCPI Santé 2025 | Conseil Gratuit et Sélection sur Mesure',
    metaDescription: 'Investissez dans les SCPI santé : cliniques, EHPAD, résidences seniors. Secteur résilient avec rendements de 4% à 5% et baux longue durée.',
    heroTitle: 'SCPI Santé',
    heroTitleHighlight: 'Investissez dans l\'immobilier médical',
    heroSubtitle: 'Accédez aux cliniques, EHPAD et résidences médicalisées avec des rendements stables de 4% à 5%',
    labelText: 'Secteur Santé - Valeur Défensive',
    keyMetrics: [
      { value: '6+', label: 'SCPI santé' },
      { value: '4,5%', label: 'Rendement moyen' },
      { value: '98%', label: 'TOF moyen' }
    ],
    benefits: [
      'Secteur résilient et défensif',
      'Vieillissement démographique européen',
      'Baux longue durée (9-12 ans)',
      'Locataires professionnels du secteur médical',
      'Stabilité des revenus locatifs'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans des SCPI santé ?',
      subtitle: 'Un secteur porté par les tendances démographiques',
      features: [
        {
          icon: 'heart',
          title: 'Secteur d\'avenir',
          description: 'Le vieillissement de la population européenne soutient une demande croissante pour les infrastructures de santé'
        },
        {
          icon: 'shield',
          title: 'Stabilité élevée',
          description: 'Taux d\'occupation financier supérieur à 95%, baux longue durée et locataires professionnels du secteur médical'
        },
        {
          icon: 'trending-up',
          title: 'Revenus réguliers',
          description: 'Rendements de 4% à 5% avec une très faible volatilité, idéal pour une stratégie patrimoniale défensive'
        },
        {
          icon: 'users',
          title: 'Utilité sociale',
          description: 'Investissement responsable dans des infrastructures essentielles pour le bien-être de la population'
        }
      ]
    },
    informationsPratiques: {
      title: 'Informations pratiques sur les SCPI santé',
      items: [
        {
          icon: 'file-text',
          title: 'Caractéristiques',
          points: [
            'Ticket d\'entrée : 1 000€ à 5 000€',
            'Rendement moyen : 4% à 5%',
            'Délai de jouissance : 3 à 6 mois',
            'Frais de souscription : 8% à 12%'
          ]
        },
        {
          icon: 'building',
          title: 'Types d\'actifs',
          points: [
            'EHPAD (Établissements pour personnes âgées)',
            'Cliniques privées et centres médicaux',
            'Résidences services seniors',
            'Laboratoires d\'analyses médicales'
          ]
        },
        {
          icon: 'users',
          title: 'Profil investisseur',
          points: [
            'Recherche de stabilité et sécurité',
            'Acceptation de rendements modérés',
            'Horizon d\'investissement : 10 à 15 ans',
            'Sensibilité à l\'investissement socialement responsable'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Les SCPI santé sont-elles plus sûres ?',
        answer: 'Les SCPI santé sont considérées comme défensives grâce à des baux longue durée (9-12 ans), des locataires professionnels du secteur médical et une demande structurelle liée au vieillissement de la population. Le taux d\'occupation est généralement très élevé.'
      },
      {
        question: 'Pourquoi les rendements sont-ils plus faibles ?',
        answer: 'Les rendements de 4% à 5% reflètent la stabilité et la sécurité de ce secteur. Les investisseurs acceptent un rendement légèrement inférieur en contrepartie d\'une très faible volatilité et d\'un risque locatif minimal.'
      },
      {
        question: 'Quel est l\'impact de la réglementation sur les EHPAD ?',
        answer: 'Les SCPI santé sélectionnent rigoureusement leurs actifs et privilégient les exploitants de qualité conformes aux normes. La réglementation renforce la qualité du secteur et assure la pérennité des investissements.'
      }
    ],
    temoignages: [
      {
        nom: 'Bernard T., 63 ans',
        texte: 'J\'ai choisi les SCPI santé pour la stabilité et la dimension socialement responsable. Les revenus sont réguliers et je suis rassuré par la solidité du secteur.',
        note: 5
      },
      {
        nom: 'Catherine V., 56 ans',
        texte: 'Les SCPI santé correspondent parfaitement à mon profil d\'investisseur prudent. Les baux longue durée et la demande croissante garantissent la pérennité.',
        note: 5
      },
      {
        nom: 'Alain P., 48 ans',
        texte: 'Investir dans la santé via les SCPI me permet de concilier rendement et utilité sociale. Les EHPAD et cliniques sont des actifs défensifs intéressants.',
        note: 5
      }
    ],
    relatedScpi: []
  ,
    geographie: {
      'France': 70,
      'Allemagne': 12,
      'Espagne': 8,
      'Belgique': 6,
      'Autres': 4
    },
    secteurs: {
      'Cliniques': 40,
      'EHPAD': 30,
      'Cabinets Médicaux': 15,
      'Laboratoires': 10,
      'Autres': 5
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.2,
      title: `Simulez vos revenus santé`,
      subtitle: `Investissez dans un secteur résilient`,
      theme: 'green'
    }
},

  // PAGES PAR GÉOGRAPHIE - LANDING PAGES GOOGLE ADS
  'scpi-sans-frais': {
    slug: 'scpi-sans-frais',
    title: 'SCPI Sans Frais VS Avec Frais 2025 | Comparatif et Conseils',
    metaDescription: 'Découvrez les différences entre SCPI sans frais de souscription et SCPI avec frais. Analyse complète des avantages et inconvénients pour choisir.',
    heroTitle: 'SCPI Sans Frais VS SCPI Avec Frais',
    heroTitleHighlight: 'Faites le bon choix pour votre investissement',
    heroSubtitle: 'Comprenez les différences, avantages et inconvénients des SCPI avec et sans frais de souscription',
    labelText: 'Guide Complet - Comparatif Détaillé',
    senderGroupId: 'LM_SCPI_SansFrais',
    keyMetrics: [
      { value: '0%', label: 'Frais minimum' },
      { value: '12%', label: 'Frais maximum' },
      { value: '8-10 ans', label: 'Pour amortir' }
    ],
    benefits: [
      'Comprendre l\'impact des frais sur votre rendement',
      'SCPI sans frais : avantages et limites',
      'SCPI avec frais : ce qu\'ils financent réellement',
      'Simulation comparative sur 10 ans',
      'Conseil personnalisé selon votre situation'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi comparer les frais des SCPI ?',
      subtitle: 'Les frais impactent directement votre rentabilité',
      features: [
        {
          icon: 'calculator',
          title: 'Impact sur le rendement',
          description: 'Sur 10 000€ investis, 10% de frais = 1 000€ déduits immédiatement. Comprenez comment ces frais sont amortis par les rendements futurs.'
        },
        {
          icon: 'trending-up',
          title: 'SCPI sans frais (0%)',
          description: 'Pas de frais d\'entrée, 100% de votre capital investi. En contrepartie : frais de gestion souvent plus élevés (12-15% vs 10-12%).'
        },
        {
          icon: 'shield',
          title: 'SCPI avec frais (8-12%)',
          description: 'Frais d\'entrée compensés par des frais de gestion plus bas. Rentable sur le long terme (8-10 ans minimum).'
        },
        {
          icon: 'file-text',
          title: 'Transparence totale',
          description: 'Nous analysons tous les frais : souscription, gestion, cessions. Aucun frais caché dans nos recommandations.'
        }
      ]
    },
    informationsPratiques: {
      title: 'Comparatif détaillé : SCPI sans frais VS avec frais',
      items: [
        {
          icon: 'file-text',
          title: 'SCPI Sans Frais (0%)',
          points: [
            '✅ 100% de votre capital investi dès le départ',
            '✅ Rentabilité immédiate maximale',
            '❌ Frais de gestion plus élevés (12-15% annuels)',
            '❌ Impact cumulé sur le long terme'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'SCPI Avec Frais (8-12%)',
          points: [
            '✅ Frais de gestion plus bas (10-12% annuels)',
            '✅ Meilleure rentabilité sur 8-10 ans',
            '❌ Décote initiale de 8 à 12%',
            '❌ Rentabilité différée sur les premières années'
          ]
        },
        {
          icon: 'calculator',
          title: 'Exemple sur 10 000€',
          points: [
            'Sans frais : 10 000€ investis, 600€/an net (6% - 15% gestion)',
            'Avec frais 10% : 9 000€ investis, 540€/an net (6% - 10% gestion)',
            'Point d\'équilibre : 5-7 ans selon rendement',
            'Sur 10 ans : différence de +500€ à +1 500€ pour les SCPI avec frais'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Quelle est la différence entre une SCPI sans frais et avec frais ?',
        answer: 'Les SCPI sans frais de souscription (0%) vous permettent d\'investir 100% de votre capital dès le départ. Par exemple, pour 10 000€, vous achetez exactement 10 000€ de parts. Les SCPI avec frais (8-12%) prélèvent ces frais à l\'entrée : pour 10 000€, vous n\'achetez que 9 000€ à 9 200€ de parts. En contrepartie, les SCPI sans frais ont généralement des frais de gestion annuels plus élevés (12-15% vs 10-12%).'
      },
      {
        question: 'Les SCPI sans frais sont-elles vraiment plus avantageuses ?',
        answer: 'Pas nécessairement. Les SCPI sans frais compensent l\'absence de frais d\'entrée par des frais de gestion plus élevés (12-15% vs 10-12%). Sur le long terme (8-10 ans), les SCPI avec frais peuvent être plus rentables car les frais de gestion s\'appliquent chaque année sur vos loyers. Le choix dépend de votre horizon d\'investissement : court terme = sans frais, long terme = avec frais souvent plus intéressant.'
      },
      {
        question: 'Combien de temps faut-il pour amortir les frais d\'entrée ?',
        answer: 'En moyenne, il faut 5 à 7 ans pour amortir les frais d\'entrée d\'une SCPI. Par exemple, avec 10% de frais d\'entrée et une différence de 2% sur les frais de gestion annuels, vous récupérez votre décote initiale en 5 ans (10% ÷ 2% = 5 ans). Au-delà, la SCPI avec frais devient plus rentable. C\'est pourquoi l\'horizon minimum recommandé est de 8 à 10 ans.'
      },
      {
        question: 'Quelles SCPI sans frais recommandez-vous ?',
        answer: 'Parmi les meilleures SCPI sans frais : Remake Live (7,5% de rendement, 0% de frais d\'entrée, diversifiée Europe), Iroko Zen (6,5%, 0% frais, spécialisée tertiaire), et Novaxia Neo (6,1%, 0% frais, immobilier transformé). Ces SCPI offrent d\'excellents rendements malgré des frais de gestion légèrement supérieurs. Le choix dépend de votre profil et objectifs.'
      },
      {
        question: 'Comment choisir entre SCPI avec et sans frais ?',
        answer: 'Posez-vous 3 questions : 1) Quel est mon horizon d\'investissement ? (Court terme = sans frais, long terme = avec frais). 2) Quelle est ma priorité ? (Maximiser le capital investi immédiatement = sans frais, optimiser la rentabilité long terme = avec frais). 3) Quel est mon profil ? (Débutant = sans frais pour simplicité, investisseur confirmé = avec frais pour optimisation). Nous vous aidons à faire ce choix gratuitement.'
      }
    ],
    temoignages: [
      {
        nom: 'Sophie M., 38 ans',
        texte: 'J\'hésitais entre SCPI avec et sans frais. Eric m\'a expliqué clairement l\'impact sur 10 ans. J\'ai choisi une SCPI avec frais pour mon horizon long terme, et je ne regrette pas !',
        note: 5
      },
      {
        nom: 'Thomas D., 45 ans',
        texte: 'Je voulais investir 20 000€ sans perdre de capital à l\'entrée. Eric m\'a orienté vers une excellente SCPI sans frais. Résultat : 100% de mon capital investi immédiatement.',
        note: 5
      },
      {
        nom: 'Claire L., 52 ans',
        texte: 'Grâce au comparatif détaillé de MaximusSCPI, j\'ai compris que les frais de gestion comptent autant que les frais d\'entrée. J\'ai opté pour un mix des deux types de SCPI.',
        note: 5
      }
    ],
    relatedScpi: ['remake-live', 'iroko-zen', 'novaxia-neo', 'comete', 'transitions-europe']
  ,
    geographie: {
      'France': 48,
      'Allemagne': 20,
      'Pays-Bas': 13,
      'Espagne': 10,
      'Autres': 9
    },
    secteurs: {
      'Bureaux': 45,
      'Commerces': 25,
      'Logistique': 15,
      'Santé': 10,
      'Résidentiel': 5
    }
,
    simulator: {
      defaultInvestment: 45000,
      defaultYield: 5.8,
      title: `Simulez vos revenus sans frais`,
      subtitle: `100% de votre capital investi`,
      theme: 'indigo'
    }
},
  'scpi-france-investissement': {
    slug: 'scpi-france-investissement',
    title: 'Investir SCPI France 2025 | Votre Portefeuille Personnalisé Gratuit',
    metaDescription: 'Découvrez les meilleures SCPI investies en France. Paris, Lyon, Marseille, Bordeaux : diversifiez dans l\'immobilier tertiaire français.',
    heroTitle: 'SCPI France',
    heroTitleHighlight: 'Investissez dans l\'immobilier français',
    heroSubtitle: 'Accédez aux meilleurs actifs immobiliers des grandes métropoles françaises avec des rendements de 4% à 6%',
    labelText: 'Géographie France - Proximité',
    keyMetrics: [
      { value: '25+', label: 'SCPI France' },
      { value: '5,0%', label: 'Rendement moyen' },
      { value: '94%', label: 'TOF moyen' }
    ],
    benefits: [
      'Investissement sur un marché connu et transparent',
      'Diversification dans les grandes métropoles françaises',
      'Absence de risque de change',
      'Fiscalité française maîtrisée',
      'Proximité et compréhension du marché'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans des SCPI France ?',
      subtitle: 'Le marché français offre stabilité et opportunités',
      features: [
        {
          icon: 'map-pin',
          title: 'Marché domestique',
          description: 'Investissement sur le marché français que vous connaissez, dans les grandes villes : Paris, Lyon, Marseille, Bordeaux, Toulouse, Nantes'
        },
        {
          icon: 'shield',
          title: 'Pas de risque de change',
          description: 'Vos revenus et votre capital restent en euros sans exposition aux fluctuations des devises étrangères'
        },
        {
          icon: 'file-text',
          title: 'Fiscalité claire',
          description: 'Fiscalité française connue et maîtrisée, sans double imposition ni complexité administrative internationale'
        },
        {
          icon: 'trending-up',
          title: 'Rendements attractifs',
          description: 'Rendements de 4% à 6% selon les secteurs d\'activité (bureaux, commerces, santé, logistique)'
        }
      ]
    },
    informationsPratiques: {
      title: 'Informations pratiques sur les SCPI France',
      items: [
        {
          icon: 'file-text',
          title: 'Caractéristiques',
          points: [
            'Ticket d\'entrée : 1 000€ à 5 000€',
            'Rendement moyen : 4% à 6%',
            'Délai de jouissance : 3 à 6 mois',
            'Frais de souscription : 8% à 12%'
          ]
        },
        {
          icon: 'map',
          title: 'Zones géographiques',
          points: [
            'Île-de-France : 40% à 60% du patrimoine',
            'Grandes métropoles régionales : 30% à 50%',
            'Lyon, Marseille, Bordeaux, Toulouse, Nantes, Lille',
            'Diversification sur l\'ensemble du territoire'
          ]
        },
        {
          icon: 'users',
          title: 'Profil investisseur',
          points: [
            'Préférence pour le marché domestique',
            'Évitement du risque de change',
            'Recherche de simplicité fiscale',
            'Horizon d\'investissement : 8 à 12 ans minimum'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Pourquoi choisir une SCPI France plutôt qu\'européenne ?',
        answer: 'Les SCPI France évitent le risque de change et la complexité fiscale internationale. Elles permettent d\'investir sur un marché que vous connaissez avec une fiscalité claire. C\'est un choix pertinent si vous préférez la simplicité et la proximité.'
      },
      {
        question: 'Les SCPI France sont-elles moins rentables ?',
        answer: 'Non, les rendements sont comparables aux SCPI européennes (4% à 6%). La différence réside dans l\'absence de risque de change et la concentration sur le marché français, ce qui peut être un avantage ou un inconvénient selon votre stratégie de diversification.'
      },
      {
        question: 'Quelle fiscalité pour les SCPI France ?',
        answer: 'Les revenus sont imposés comme des revenus fonciers au barème progressif de l\'impôt sur le revenu, avec possibilité de déduire les charges. Les plus-values à la revente sont soumises à la fiscalité des plus-values immobilières.'
      }
    ],
    temoignages: [
      {
        nom: 'Nathalie R., 48 ans',
        texte: 'J\'ai préféré investir dans des SCPI françaises pour éviter les complications fiscales. Je connais le marché et les rendements sont très corrects.',
        note: 5
      },
      {
        nom: 'François D., 54 ans',
        texte: 'Les SCPI France me permettent d\'investir dans des actifs que je peux comprendre et suivre. Paris, Lyon, Bordeaux : des marchés que je connais bien.',
        note: 5
      },
      {
        nom: 'Véronique M., 42 ans',
        texte: 'Sur les conseils d\'Éric, j\'ai composé un portefeuille 100% France. La proximité des actifs et la fiscalité simplifiée sont des atouts non négligeables.',
        note: 5
      }
    ],
    relatedScpi: []
  ,
    geographie: {
      'Île-de-France': 45,
      'Lyon': 15,
      'Bordeaux': 10,
      'Marseille': 8,
      'Lille': 7,
      'Autres': 15
    },
    secteurs: {
      'Bureaux': 40,
      'Commerces': 25,
      'Résidentiel': 15,
      'Santé': 12,
      'Logistique': 8
    }
,
    simulator: {
      defaultInvestment: 65000,
      defaultYield: 5.1,
      title: `Simulez vos revenus France`,
      subtitle: `Investissez sur le territoire français`,
      theme: 'blue'
    }
},

  // PAGES PAR GESTIONNAIRE - LANDING PAGES GOOGLE ADS
  'alderan-scpi': {
    slug: 'alderan-scpi',
    title: 'SCPI Alderan 2025 | Comète - Expertise et Performance',
    metaDescription: 'Découvrez les SCPI gérées par Alderan. Société de gestion innovante spécialisée dans l\'immobilier européen avec des rendements attractifs.',
    heroTitle: 'SCPI Alderan',
    heroTitleHighlight: 'L\'excellence de la gestion immobilière',
    heroSubtitle: 'Alderan gère la SCPI Comète avec un taux de distribution 2025 de 9,00% et une stratégie internationale diversifiée',
    labelText: 'Gestionnaire Premium - Innovation',
    keyMetrics: [
      { value: '1', label: 'SCPI gérée' },
      { value: '9,00%', label: 'Taux de distribution 2025' },
      { value: '2023', label: 'Création Comète' }
    ],
    benefits: [
      'Gestionnaire innovant et dynamique',
      'Stratégie internationale diversifiée (7 pays)',
      'SCPI Comète : distribution 2025 de 9,00%',
      'Expertise immobilière tertiaire',
      'Gestion transparente et professionnelle'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi choisir les SCPI Alderan ?',
      subtitle: 'Un gestionnaire qui révolutionne le marché des SCPI',
      features: [
        {
          icon: 'trending-up',
          title: 'Performance robuste',
          description: 'La SCPI Comète affiche un taux de distribution 2025 de 9,00%, soutenu par une stratégie immobilière internationale diversifiée'
        },
        {
          icon: 'globe',
          title: 'Diversification internationale',
          description: 'Investissements répartis sur 7 pays (Royaume-Uni, Espagne, Italie, Pays-Bas, Irlande, Pologne, Canada) et 7 secteurs d\'activité'
        },
        {
          icon: 'shield',
          title: 'Gestion professionnelle',
          description: 'Équipe expérimentée, processus d\'investissement rigoureux, sélection stricte des actifs, reporting transparent et régulier'
        },
        {
          icon: 'leaf',
          title: 'Engagement ESG',
          description: 'SCPI labellisée ISR et Article 8 SFDR, intégration des critères environnementaux et sociaux dans la stratégie d\'investissement'
        }
      ]
    },
    informationsPratiques: {
      title: 'Tout savoir sur Alderan et ses SCPI',
      items: [
        {
          icon: 'building',
          title: 'À propos d\'Alderan',
          points: [
            'Société de gestion agréée AMF',
            'Spécialisée dans l\'immobilier tertiaire européen',
            'Approche innovante et dynamique',
            'Focus sur la performance et la diversification'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'SCPI Comète en détail',
          points: [
            'Créée en 2023, capitalisation en forte croissance',
            'Taux de distribution 2025 : 9,00%',
            'TOF : 99,1% (T4 2025)',
            'Frais de souscription : 10% HT'
          ]
        },
        {
          icon: 'map-pin',
          title: 'Stratégie d\'investissement',
          points: [
            'Immeubles de bureaux et commerces en Europe',
            'Zones urbaines dynamiques et quartiers d\'affaires',
            'Locataires de qualité (entreprises internationales)',
            'Diversification sectorielle et géographique'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Qui est Alderan et que gère cette société ?',
        answer: 'Alderan est une société de gestion agréée AMF spécialisée dans l\'immobilier tertiaire international. Elle gère actuellement la SCPI Comète, créée en 2023, avec un taux de distribution 2025 de 9,00% et un TOF de 99,1%. Alderan se distingue par une approche innovante et une stratégie internationale ambitieuse.'
      },
      {
        question: 'Pourquoi la SCPI Comète d\'Alderan a-t-elle un rendement si élevé ?',
        answer: 'Le taux de distribution 2025 de Comète (9,00%) s\'explique par plusieurs facteurs : une stratégie internationale diversifiée sur 7 pays, une sélection rigoureuse d\'actifs, et une phase de collecte dynamique. C\'est une SCPI récente (2023) en forte croissance avec un TOF de 99,1% au T4 2025.'
      },
      {
        question: 'La SCPI Comète est-elle risquée avec ce rendement élevé ?',
        answer: 'Un rendement élevé ne signifie pas nécessairement un risque élevé. Comète bénéficie d\'une diversification géographique (7 pays) et sectorielle (7 secteurs), d\'un TOF de 99,1%, d\'actifs de qualité et d\'une gestion professionnelle par Alderan. Comme toute SCPI récente, elle est en phase de montée en puissance. L\'horizon recommandé est de 8 à 10 ans minimum.'
      },
      {
        question: 'Alderan est-elle une société de gestion fiable ?',
        answer: 'Oui, Alderan est agréée par l\'AMF (Autorité des Marchés Financiers) et respecte toutes les réglementations françaises. La société applique des standards stricts de gestion, de reporting et de transparence. La SCPI Comète est labellisée ISR et Article 8 SFDR, témoignant de l\'engagement d\'Alderan en matière de durabilité.'
      },
      {
        question: 'Quelles sont les perspectives pour les SCPI Alderan ?',
        answer: 'Alderan continue de développer la SCPI Comète avec des acquisitions ciblées à l\'international. La stratégie reste focalisée sur l\'immobilier tertiaire de qualité avec un objectif de maintenir une distribution régulière tout en préservant un TOF élevé. Alderan pourrait également lancer d\'autres SCPI à l\'avenir pour diversifier son offre.'
      }
    ],
    temoignages: [
      {
        nom: 'Laurent B., 48 ans',
        texte: 'J\'ai investi dans Comète d\'Alderan il y a 1 an. La distribution 2025 à 9,00% répond à mes attentes. La gestion est transparente et les distributions régulières.',
        note: 5
      },
      {
        nom: 'Marie D., 52 ans',
        texte: 'Eric m\'a recommandé Alderan pour diversifier mon portefeuille à l\'international. La SCPI Comète combine performance et diversification internationale. Excellent choix !',
        note: 5
      },
      {
        nom: 'Thomas L., 41 ans',
        texte: 'Alderan est un gestionnaire dynamique et innovant. Leur approche internationale sur Comète me séduit. La communication est claire.',
        note: 5
      }
    ],
    relatedScpi: ['comete']
  ,
    geographie: {
      'Royaume-Uni': 46.5,
      'Espagne': 15.4,
      'Italie': 12.4,
      'Pays-Bas': 10.3,
      'Canada': 6.6,
      'Pologne': 5.2,
      'Irlande': 3.6
    },
    secteurs: {
      'Commerce': 27.6,
      'Logistique': 23.9,
      'Hôtellerie': 16.0,
      'Bureau': 13.7,
      'Mixte': 10.9,
      'Loisirs': 5.8,
      'Éducation': 2.1
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 6.2,
      title: `Simulez vos revenus Alderan`,
      subtitle: `Leader de la gestion SCPI`,
      theme: 'blue'
    }
},

  'arkea-reim-scpi': {
    slug: 'arkea-reim-scpi',
    title: 'SCPI Arkéa REIM 2025 | Transitions Europe - Expertise Immobilière',
    metaDescription: 'Découvrez les SCPI gérées par Arkéa REIM. Groupe Arkéa, solidité financière et expertise reconnue en immobilier européen.',
    heroTitle: 'SCPI Arkéa REIM',
    heroTitleHighlight: 'La puissance du Groupe Arkéa',
    heroSubtitle: 'Arkéa REIM gère la SCPI Transitions Europe avec 8,25% de rendement, zéro endettement et une stratégie durable',
    labelText: 'Gestionnaire Groupe Bancaire - Solidité',
    keyMetrics: [
      { value: '1', label: 'SCPI phare' },
      { value: '8,25%', label: 'Rendement' },
      { value: '0%', label: 'Endettement' }
    ],
    benefits: [
      'Filiale du Groupe Arkéa (solidité financière)',
      'SCPI Transitions Europe : 8,25% de rendement',
      'Zéro endettement pour une sécurité maximale',
      'Stratégie ESG et transition énergétique',
      'Expertise immobilière européenne reconnue'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi choisir les SCPI Arkéa REIM ?',
      subtitle: 'La solidité d\'un groupe bancaire au service de votre patrimoine',
      features: [
        {
          icon: 'shield',
          title: 'Solidité du Groupe Arkéa',
          description: 'Arkéa REIM est la filiale immobilière du Groupe Arkéa, groupe bancaire coopératif français. Cette appartenance garantit solidité financière, gouvernance stricte et vision long terme'
        },
        {
          icon: 'trending-up',
          title: 'Performance éprouvée',
          description: 'Transitions Europe affiche 8,25% de rendement avec zéro endettement. Cette stratégie prudente et performante combine rentabilité élevée et sécurité maximale'
        },
        {
          icon: 'leaf',
          title: 'Engagement ESG fort',
          description: 'Transitions Europe est labellisée ISR et Article 8 SFDR. La stratégie intègre pleinement les enjeux de transition énergétique et environnementale'
        },
        {
          icon: 'globe',
          title: 'Diversification européenne',
          description: 'Investissements répartis sur 5 pays européens (France, Allemagne, Espagne, Pays-Bas, Belgique) pour une diversification géographique optimale'
        }
      ]
    },
    informationsPratiques: {
      title: 'Tout savoir sur Arkéa REIM et ses SCPI',
      items: [
        {
          icon: 'building',
          title: 'À propos d\'Arkéa REIM',
          points: [
            'Filiale immobilière du Groupe Arkéa',
            'Société de gestion agréée AMF',
            'Expertise reconnue en immobilier tertiaire',
            'Gestion prudente et vision long terme'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'SCPI Transitions Europe',
          points: [
            'Rendement 2024 : 8,25%',
            'Zéro endettement (sécurité maximale)',
            'TOF : 96% (excellent taux d\'occupation)',
            'Frais de souscription : 10% HT'
          ]
        },
        {
          icon: 'leaf',
          title: 'Stratégie durable',
          points: [
            'Focus sur la transition énergétique',
            'Bâtiments certifiés et performants',
            'Labels ISR et Article 8 SFDR',
            'Impact environnemental positif'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Qui est Arkéa REIM et quelle est sa légitimité ?',
        answer: 'Arkéa REIM est la société de gestion immobilière du Groupe Arkéa, groupe bancaire coopératif français. Cette appartenance à un grand groupe bancaire apporte solidité financière, rigueur de gestion et vision long terme. Arkéa REIM est agréée AMF et reconnue pour son expertise en immobilier tertiaire européen.'
      },
      {
        question: 'Pourquoi Transitions Europe affiche-t-elle zéro endettement ?',
        answer: 'Arkéa REIM a fait le choix stratégique de ne pas recourir à l\'endettement pour Transitions Europe. Cette approche prudente offre une sécurité maximale aux investisseurs : pas de risque de taux, pas d\'effet de levier négatif en cas de baisse du marché, et une stabilité accrue. Le rendement de 8,25% est entièrement généré par les loyers.'
      },
      {
        question: 'La stratégie ESG d\'Arkéa REIM est-elle sérieuse ?',
        answer: 'Absolument. Transitions Europe est labellisée ISR (Investissement Socialement Responsable) et Article 8 SFDR, ce qui implique des audits réguliers et le respect de critères stricts. Arkéa REIM intègre les enjeux ESG dans toutes ses décisions d\'investissement : performance énergétique, impact environnemental, qualité de vie des occupants.'
      },
      {
        question: 'Quels sont les avantages d\'un gestionnaire adossé à un groupe bancaire ?',
        answer: 'Un gestionnaire comme Arkéa REIM adossé au Groupe Arkéa bénéficie de plusieurs avantages : solidité financière (pas de risque de faillite), accès privilégié aux financements si besoin, gouvernance stricte et contrôlée, vision long terme (pas de pression court-termiste), et expertise financière reconnue.'
      }
    ],
    temoignages: [
      {
        nom: 'Catherine V., 55 ans',
        texte: 'La solidité du Groupe Arkéa m\'a rassurée. Transitions Europe combine rendement attractif (8,25%) et sécurité avec zéro endettement. Un excellent équilibre.',
        note: 5
      },
      {
        nom: 'Philippe M., 49 ans',
        texte: 'Eric m\'a orienté vers Arkéa REIM pour la diversification européenne et l\'approche ESG. La stratégie de Transitions Europe correspond parfaitement à mes valeurs.',
        note: 5
      },
      {
        nom: 'Isabelle D., 43 ans',
        texte: 'Arkéa REIM inspire confiance avec le soutien du Groupe Arkéa. Les rendements sont au rendez-vous et la gestion est transparente. Je recommande !',
        note: 5
      }
    ],
    relatedScpi: ['transitions-europe']
  ,
    geographie: {
      'France': 65,
      'Allemagne': 15,
      'Espagne': 10,
      'Pays-Bas': 6,
      'Autres': 4
    },
    secteurs: {
      'Bureaux': 45,
      'Commerces': 30,
      'Santé': 15,
      'Résidentiel': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.4,
      title: `Simulez vos revenus Arkéa`,
      subtitle: `Expertise et performance`,
      theme: 'green'
    }
},

  'la-francaise-rem-scpi': {
    slug: 'la-francaise-rem-scpi',
    title: 'SCPI La Française REM 2025 | Leader Français - Expertise Reconnue',
    metaDescription: 'Découvrez les SCPI gérées par La Française REM, leader français de la gestion immobilière avec plus de 10 milliards d\'euros d\'actifs.',
    heroTitle: 'SCPI La Française REM',
    heroTitleHighlight: 'Le leader historique des SCPI',
    heroSubtitle: 'La Française REM gère 6 SCPI dont Optimale, avec plus de 30 ans d\'expérience et 10 milliards d\'euros d\'actifs',
    labelText: 'Gestionnaire Leader - Expertise Historique',
    keyMetrics: [
      { value: '6', label: 'SCPI gérées' },
      { value: '10 Mds€', label: 'Actifs sous gestion' },
      { value: '30 ans', label: 'D\'expérience' }
    ],
    benefits: [
      'Leader français de la gestion de SCPI',
      'Plus de 10 milliards d\'euros d\'actifs sous gestion',
      '6 SCPI diversifiées (rendement, fiscales, internationales)',
      'Expertise reconnue depuis plus de 30 ans',
      'Gestion rigoureuse et performances stables'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi choisir les SCPI La Française REM ?',
      subtitle: 'L\'expertise et la solidité d\'un leader historique',
      features: [
        {
          icon: 'award',
          title: 'Leader du marché',
          description: 'La Française REM est le premier gestionnaire français de SCPI avec plus de 10 milliards d\'euros d\'actifs sous gestion et 30 ans d\'expérience éprouvée'
        },
        {
          icon: 'trending-up',
          title: 'Portefeuille diversifié',
          description: '6 SCPI complémentaires : Optimale (diversifiée), Épimmo (rendement), Vendôme Régions (France), PFO (Europe), Rivoli Avenir Patrimoine (Europe), et d\'autres pour tous les profils'
        },
        {
          icon: 'shield',
          title: 'Solidité et fiabilité',
          description: 'Filiale du Groupe La Française, notation financière solide, gouvernance stricte, processus d\'investissement éprouvé et gestion transparente'
        },
        {
          icon: 'globe',
          title: 'Présence internationale',
          description: 'Présence en France et en Europe avec des bureaux locaux, connaissance approfondie des marchés, réseau de partenaires établi'
        }
      ]
    },
    informationsPratiques: {
      title: 'Tout savoir sur La Française REM et ses SCPI',
      items: [
        {
          icon: 'building',
          title: 'À propos de La Française REM',
          points: [
            'Leader français de la gestion de SCPI',
            '10+ milliards d\'euros d\'actifs sous gestion',
            '30+ années d\'expérience',
            'Filiale du Groupe La Française'
          ]
        },
        {
          icon: 'grid',
          title: 'Portfolio de SCPI',
          points: [
            'Optimale : SCPI diversifiée (6,51% de rendement)',
            'Épimmo : SCPI de rendement France',
            'PFO : SCPI européenne diversifiée',
            'Vendôme Régions, Rivoli Avenir Patrimoine, etc.'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'Performance et sécurité',
          points: [
            'Rendements stables et réguliers',
            'Taux d\'occupation élevés (>95%)',
            'Diversification optimale',
            'Gestion prudente et professionnelle'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Pourquoi La Française REM est-elle leader du marché des SCPI ?',
        answer: 'La Française REM est leader grâce à plusieurs facteurs : 30+ ans d\'expérience, plus de 10 milliards d\'euros d\'actifs sous gestion, 6 SCPI diversifiées, expertise reconnue en immobilier tertiaire, solidité du Groupe La Française, et performances stables sur le long terme. C\'est une référence incontournable du marché français.'
      },
      {
        question: 'Quelle SCPI La Française REM choisir ?',
        answer: 'Le choix dépend de votre profil : Optimale est idéale pour débuter avec une diversification équilibrée (6,51%). PFO convient si vous cherchez une exposition européenne. Épimmo pour un focus France avec rendement attractif. Vendôme Régions pour les métropoles régionales françaises. Nous vous aidons à choisir selon votre situation.'
      },
      {
        question: 'Les SCPI La Française REM sont-elles sûres ?',
        answer: 'La Française REM est l\'un des gestionnaires les plus solides du marché : filiale d\'un grand groupe, notation financière excellente, expertise de 30 ans, processus d\'investissement rigoureux, diversification importante, et gestion prudente. Les performances historiques démontrent la fiabilité de ce gestionnaire.'
      },
      {
        question: 'Comment La Française REM gère-t-elle la diversification ?',
        answer: 'La Française REM applique une diversification stricte sur plusieurs dimensions : géographique (France, Europe), sectorielle (bureaux, commerces, santé, logistique), par SCPI (6 SCPI aux stratégies complémentaires), et par actifs (centaines d\'immeubles). Cette diversification réduit considérablement le risque global.'
      }
    ],
    temoignages: [
      {
        nom: 'Jean-Marc L., 58 ans',
        texte: 'La Française REM inspire confiance avec 30 ans d\'expérience. J\'ai investi dans Optimale et les distributions sont régulières comme prévu. Un gestionnaire sérieux.',
        note: 5
      },
      {
        nom: 'Nathalie P., 46 ans',
        texte: 'Eric m\'a recommandé La Française REM pour la solidité et le track record. J\'ai choisi un mix Optimale et PFO pour diversifier France/Europe. Excellent !',
        note: 5
      },
      {
        nom: 'François D., 52 ans',
        texte: 'Leader du marché pour une bonne raison. La Française REM combine expertise, performances et transparence. Mes revenus passifs sont au rendez-vous.',
        note: 5
      }
    ],
    relatedScpi: ['optimale']
  ,
    geographie: {
      'France': 52,
      'Allemagne': 20,
      'Pays-Bas': 12,
      'Espagne': 10,
      'Autres': 6
    },
    secteurs: {
      'Bureaux': 50,
      'Commerces': 25,
      'Santé': 12,
      'Logistique': 10,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 60000,
      defaultYield: 5.3,
      title: `Simulez vos revenus La Française`,
      subtitle: `Gestion patrimoniale de qualité`,
      theme: 'indigo'
    }
},

  'atland-voisin-scpi': {
    slug: 'atland-voisin-scpi',
    title: 'SCPI Atland Voisin 2025 | Épargne Pierre Europe - Expertise Patrimoniale',
    metaDescription: 'Découvrez les SCPI gérées par Atland Voisin, spécialiste du conseil patrimonial avec une approche client unique et personnalisée.',
    heroTitle: 'SCPI Atland Voisin',
    heroTitleHighlight: 'L\'approche patrimoniale par excellence',
    heroSubtitle: 'Atland Voisin gère Épargne Pierre Europe avec 6,75% de rendement, zéro endettement et une stratégie européenne prudente',
    labelText: 'Gestionnaire Conseil - Approche Patrimoniale',
    keyMetrics: [
      { value: '2', label: 'SCPI gérées' },
      { value: '6,75%', label: 'Rendement EPE' },
      { value: '0%', label: 'Endettement' }
    ],
    benefits: [
      'Approche patrimoniale et conseil personnalisé',
      'SCPI Épargne Pierre Europe : 6,75% sans endettement',
      'Stratégie européenne prudente (3 pays)',
      'Gestion transparente et communication régulière',
      'Focus sur la qualité et la pérennité'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi choisir les SCPI Atland Voisin ?',
      subtitle: 'Une approche patrimoniale unique au service de votre investissement',
      features: [
        {
          icon: 'user-check',
          title: 'Approche conseil',
          description: 'Atland Voisin se distingue par son ADN de conseil patrimonial. Chaque décision d\'investissement est prise avec une vision long terme et l\'intérêt des porteurs de parts'
        },
        {
          icon: 'shield',
          title: 'Prudence et sécurité',
          description: 'Épargne Pierre Europe affiche zéro endettement et investit uniquement dans des actifs de qualité en Europe (France, Espagne, Allemagne). Stratégie défensive et pérenne'
        },
        {
          icon: 'trending-up',
          title: 'Performance équilibrée',
          description: 'Rendement de 6,75% avec un TOF excellent (98%). Cette performance régulière et stable privilégie la pérennité sur le court-termisme'
        },
        {
          icon: 'eye',
          title: 'Transparence totale',
          description: 'Communication claire et régulière, reporting détaillé, proximité avec les associés, événements et visites de patrimoine organisés'
        }
      ]
    },
    informationsPratiques: {
      title: 'Tout savoir sur Atland Voisin et ses SCPI',
      items: [
        {
          icon: 'building',
          title: 'À propos d\'Atland Voisin',
          points: [
            'Société de conseil patrimonial et gestion',
            'ADN de conseil et vision long terme',
            'Approche personnalisée et humaine',
            'Gestion prudente et transparente'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'SCPI Épargne Pierre Europe',
          points: [
            'Rendement 2024 : 6,75%',
            'TOF : 98% (excellent taux d\'occupation)',
            'Zéro endettement (sécurité maximale)',
            'Frais de souscription : 10% HT'
          ]
        },
        {
          icon: 'map-pin',
          title: 'Stratégie européenne',
          points: [
            'Investissements en France, Espagne, Allemagne',
            'Immobilier tertiaire de qualité',
            'Locataires solvables et baux longs',
            'Diversification géographique prudente'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Qu\'est-ce qui différencie Atland Voisin des autres gestionnaires ?',
        answer: 'Atland Voisin se distingue par son ADN de conseil patrimonial. Contrairement aux gestionnaires purement financiers, Atland Voisin privilégie une approche personnalisée, une vision long terme, une communication transparente et régulière, et une proximité unique avec ses associés. Chaque décision est prise dans l\'intérêt des porteurs de parts.'
      },
      {
        question: 'Pourquoi Épargne Pierre Europe affiche-t-elle zéro endettement ?',
        answer: 'Atland Voisin a fait le choix stratégique de ne pas recourir à l\'endettement pour Épargne Pierre Europe. Cette approche prudente offre une sécurité maximale : pas de risque de taux, pas d\'effet de levier négatif, et une stabilité accrue. Le rendement de 6,75% est entièrement généré par les loyers, ce qui garantit sa pérennité.'
      },
      {
        question: 'Atland Voisin organise-t-elle des événements pour ses associés ?',
        answer: 'Oui, Atland Voisin se démarque en organisant régulièrement des événements pour ses porteurs de parts : visites de patrimoine immobilier, conférences thématiques, assemblées générales conviviales. Cette proximité unique permet aux associés de mieux comprendre leur investissement et de rencontrer les équipes.'
      },
      {
        question: 'La stratégie européenne d\'Atland Voisin est-elle prudente ?',
        answer: 'Absolument. Épargne Pierre Europe investit uniquement dans 3 pays européens stables (France, Espagne, Allemagne), dans des actifs de qualité avec des locataires solvables. Le zéro endettement, le TOF de 98% et la sélection rigoureuse des actifs démontrent l\'approche défensive et pérenne d\'Atland Voisin.'
      }
    ],
    temoignages: [
      {
        nom: 'Sophie R., 50 ans',
        texte: 'J\'apprécie l\'approche patrimoniale d\'Atland Voisin. Épargne Pierre Europe combine rendement correct (6,75%) et sécurité avec zéro endettement. Communication excellente.',
        note: 5
      },
      {
        nom: 'Michel D., 54 ans',
        texte: 'Eric m\'a orienté vers Atland Voisin pour la prudence et la transparence. J\'ai assisté à une visite de patrimoine, c\'était très enrichissant. Un gestionnaire proche.',
        note: 5
      },
      {
        nom: 'Claire M., 47 ans',
        texte: 'Atland Voisin se démarque par son approche conseil. La proximité avec les équipes et la communication régulière inspirent confiance. Très satisfaite !',
        note: 5
      }
    ],
    relatedScpi: ['epargne-pierre-europe']
  ,
    geographie: {
      'France': 68,
      'Allemagne': 12,
      'Espagne': 10,
      'Belgique': 6,
      'Autres': 4
    },
    secteurs: {
      'Bureaux': 48,
      'Commerces': 28,
      'Santé': 12,
      'Logistique': 8,
      'Autres': 4
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Atland`,
      subtitle: `Expertise immobilière reconnue`,
      theme: 'blue'
    }
},

  'recyclage-urbain-scpi': {
    slug: 'recyclage-urbain-scpi',
    title: 'SCPI et Recyclage Urbain 2025 | Investir dans la Transformation Immobilière',
    metaDescription: 'Découvrez comment investir dans le recyclage urbain via les SCPI. Transformation de friches industrielles, réhabilitation de bâtiments anciens et développement durable.',
    heroTitle: 'Investir dans le Recyclage Urbain',
    heroTitleHighlight: 'avec les SCPI de Transformation',
    heroSubtitle: 'Participez à la transformation durable des villes en investissant dans des SCPI spécialisées dans la réhabilitation et le recyclage urbain',
    labelText: 'Investissement Responsable - Transformation Urbaine',
    keyMetrics: [
      { value: '40%', label: 'Économie carbone vs neuf' },
      { value: '+25%', label: 'Valorisation moyenne' },
      { value: '100%', label: 'Labels ISR/ESG' }
    ],
    benefits: [
      'Participer à la transformation durable des villes',
      'Réduction de l\'empreinte carbone de 40% vs construction neuve',
      'Valorisation immobilière jusqu\'à 25% après réhabilitation',
      'Labels ISR et conformité Article 8 SFDR',
      'Rendements attractifs entre 4% et 7%',
      'Contribution aux objectifs ZAN (Zéro Artificialisation Nette)'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi investir dans le recyclage urbain ?',
      subtitle: 'Une tendance structurelle portée par les enjeux environnementaux et réglementaires',
      features: [
        {
          icon: 'recycle',
          title: 'Impact environnemental positif',
          description: 'Le recyclage urbain évite la construction neuve et préserve les sols. Une réhabilitation émet 40% à 60% moins de CO2 qu\'une construction neuve et consomme moins de matériaux.'
        },
        {
          icon: 'trending-up',
          title: 'Potentiel de valorisation élevé',
          description: 'La transformation de friches industrielles ou d\'immeubles vétustes en espaces modernes génère une plus-value moyenne de 20% à 30%. Les SCPI bénéficient de cette revalorisation.'
        },
        {
          icon: 'map-pin',
          title: 'Emplacements stratégiques',
          description: 'Le recyclage urbain se concentre sur des zones déjà urbanisées, souvent en centre-ville ou proche des transports. Ces localisations premium garantissent une demande locative forte.'
        },
        {
          icon: 'shield-check',
          title: 'Conformité réglementaire',
          description: 'La loi ZAN (Zéro Artificialisation Nette) impose de limiter la construction sur espaces verts. Le recyclage urbain devient la norme pour les futurs projets immobiliers.'
        },
        {
          icon: 'leaf',
          title: 'Labels et certifications',
          description: 'Les SCPI investissant dans le recyclage urbain obtiennent systématiquement les labels ISR, BREEAM, HQE et sont conformes à l\'Article 8 SFDR pour l\'investissement responsable.'
        },
        {
          icon: 'users',
          title: 'Réponse aux besoins sociaux',
          description: 'Transformation de bureaux obsolètes en logements, création d\'espaces mixtes (habitation + commerces + loisirs), revitalisation de quartiers en difficulté.'
        }
      ]
    },
    informationsPratiques: {
      title: 'Comment investir dans le recyclage urbain via les SCPI ?',
      items: [
        {
          icon: 'building',
          title: 'Types de projets de recyclage urbain',
          points: [
            'Transformation de bureaux en logements (post-télétravail)',
            'Réhabilitation de friches industrielles en commerces/loisirs',
            'Conversion d\'immeubles anciens en espaces modernes et écologiques',
            'Reconversion de parkings en espaces verts ou logements',
            'Transformation de bâtiments publics désaffectés'
          ]
        },
        {
          icon: 'target',
          title: 'SCPI recommandées pour le recyclage urbain',
          points: [
            'SCPI Remake Live (Sogenial) : spécialisée dans la transformation immobilière',
            'SCPI Transitions Europe (Advenis) : focus sur la transition énergétique',
            'SCPI Comète (Alderan) : réhabilitations en Europe',
            'SCPI Activimmo (Alderan) : logistique urbaine et reconversions',
            'SCPI Épargne Pierre Europe (Atland Voisin) : projets de rénovation'
          ]
        },
        {
          icon: 'info',
          title: 'Avantages du recyclage urbain',
          points: [
            'Réduction de 40% à 60% des émissions de CO2 vs neuf',
            'Préservation des sols et respect de la loi ZAN',
            'Délais de livraison plus courts (12-24 mois vs 36-48 mois)',
            'Coûts de construction réduits de 15% à 30%',
            'Valorisation patrimoniale rapide après réhabilitation',
            'Attractivité locative en zones urbaines denses'
          ]
        },
        {
          icon: 'alert-circle',
          title: 'Points de vigilance',
          points: [
            'Vérifier l\'expertise du gestionnaire en réhabilitation',
            'Analyser les coûts de transformation vs gains attendus',
            'S\'assurer de la conformité aux normes environnementales',
            'Privilégier les SCPI avec labels ISR et Article 8 SFDR',
            'Horizon d\'investissement recommandé : 8-10 ans minimum'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Qu\'est-ce que le recyclage urbain en immobilier ?',
        answer: 'Le recyclage urbain consiste à transformer des bâtiments existants plutôt que de construire du neuf. Cela inclut la réhabilitation de bureaux en logements, la conversion de friches industrielles en espaces commerciaux, ou la modernisation d\'immeubles anciens. Cette approche réduit l\'empreinte carbone de 40% à 60% et répond aux exigences de la loi ZAN (Zéro Artificialisation Nette).'
      },
      {
        question: 'Quelles SCPI investissent dans le recyclage urbain ?',
        answer: 'Plusieurs SCPI intègrent le recyclage urbain dans leur stratégie : Remake Live (Sogenial) est spécialisée dans la transformation immobilière, Transitions Europe (Advenis) se concentre sur la transition énergétique et les réhabilitations, Comète (Alderan) réalise des projets de recyclage en Europe. Ces SCPI affichent toutes le label ISR et des rendements entre 6% et 11%.'
      },
      {
        question: 'Le recyclage urbain est-il plus rentable que la construction neuve ?',
        answer: 'Oui, souvent ! Les coûts de transformation sont 15% à 30% inférieurs à une construction neuve, les délais sont plus courts (12-24 mois vs 36-48 mois), et la valorisation est immédiate grâce aux emplacements premium (centres-villes). De plus, les projets de recyclage urbain bénéficient de subventions publiques et d\'avantages fiscaux liés à l\'investissement durable.'
      },
      {
        question: 'Comment le recyclage urbain réduit-il l\'impact environnemental ?',
        answer: 'Le recyclage urbain préserve les sols (pas de nouvelle artificialisation), réutilise les structures existantes (40% à 60% moins de CO2), génère moins de déchets de construction, et consomme moins d\'énergie grise. Les SCPI investissant dans ce secteur obtiennent systématiquement les labels ISR, BREEAM, HQE et sont conformes à l\'Article 8 SFDR.'
      },
      {
        question: 'Quels sont les risques du recyclage urbain ?',
        answer: 'Les principaux risques sont : découverte de problèmes structurels imprévus (amiante, pollution des sols), dépassements de budgets de réhabilitation, complexité administrative accrue, et délais parfois allongés. Pour minimiser ces risques, privilégiez les SCPI gérées par des sociétés expérimentées (Sogenial, Advenis, Alderan) avec un historique solide en réhabilitation.'
      },
      {
        question: 'La loi ZAN favorise-t-elle le recyclage urbain ?',
        answer: 'Absolument ! La loi ZAN (Zéro Artificialisation Nette) impose de diviser par deux l\'artificialisation des sols d\'ici 2031, puis de l\'arrêter complètement d\'ici 2050. Cela rend le recyclage urbain incontournable pour tout nouveau projet immobilier. Les SCPI positionnées sur ce créneau bénéficient d\'un avantage structurel et d\'aides publiques accrues.'
      },
      {
        question: 'Combien investir dans une SCPI de recyclage urbain ?',
        answer: 'Le ticket d\'entrée varie selon les SCPI : Remake Live démarre à 1 000€, Transitions Europe à 5 000€, Comète à 5 000€. Pour une diversification optimale, investissez au minimum 10 000€ à 15 000€ répartis sur 2 SCPI spécialisées. Horizon recommandé : 8 à 10 ans minimum pour bénéficier pleinement de la revalorisation des actifs réhabilités.'
      },
      {
        question: 'Le recyclage urbain concerne-t-il tous les types d\'immobilier ?',
        answer: 'Principalement les bureaux obsolètes (transformation en logements), les friches industrielles (conversion en commerces/loisirs/logements), les parkings sous-utilisés (logements ou espaces verts), et les bâtiments publics désaffectés (écoles, hôpitaux). Le secteur tertiaire (bureaux) est le plus concerné avec 30% des surfaces à réhabiliter d\'ici 2030 selon les estimations.'
      }
    ],
    temoignages: [
      {
        nom: 'Laurent P., 45 ans',
        texte: 'J\'ai investi dans Remake Live pour participer concrètement à la transformation écologique des villes. Rendement de 7,7% et satisfaction de contribuer à un projet utile !',
        note: 5
      },
      {
        nom: 'Isabelle T., 52 ans',
        texte: 'Eric m\'a orientée vers Transitions Europe pour son approche du recyclage urbain. Je reçois 8,25% de rendement tout en investissant dans des projets durables.',
        note: 5
      },
      {
        nom: 'François M., 38 ans',
        texte: 'Le recyclage urbain, c\'est l\'avenir ! J\'ai diversifié sur Comète et Remake Live. Rendement global de 9,4% et fierté d\'investir dans la transition écologique.',
        note: 5
      }
    ],
    relatedScpi: ['remake-live', 'transitions-europe', 'comete']
  ,
    geographie: {
      'France': 75,
      'Allemagne': 10,
      'Belgique': 8,
      'Pays-Bas': 5,
      'Autres': 2
    },
    secteurs: {
      'Bureaux Réhabilités': 45,
      'Commerces Urbains': 25,
      'Logements Durables': 20,
      'Mixte': 10
    }
,
    simulator: {
      defaultInvestment: 45000,
      defaultYield: 5.9,
      title: `Simulez vos revenus durables`,
      subtitle: `Investissement immobilier responsable`,
      theme: 'green'
    }
},

  'aestiam-scpi': {
    slug: 'aestiam-scpi',
    title: 'SCPI Aestiam 2025 | Pierre Rendement (5.04%), Cap Hebergimmo (4.55%), Placement Pierre (4.85%)',
    metaDescription: 'Aestiam : gestionnaire historique de SCPI avec 30 ans d\'expérience et 3.5 Mds€ d\'actifs. Découvrez Pierre Rendement (5.04%), Cap Hebergimmo (4.55%), Placement Pierre (4.85%). Rendements stables, diversification secteur/géo, taux d\'occupation élevé. Guide complet 2025.',
    heroTitle: 'SCPI Aestiam',
    heroTitleHighlight: '3 SCPI performantes - 30 ans d\'expertise',
    heroSubtitle: 'Gestionnaire historique agréé AMF avec 3.5 milliards d\'euros d\'actifs sous gestion. Spécialiste de l\'immobilier diversifié : bureaux, commerces, santé. Rendements réguliers entre 4.5% et 5%.',
    labelText: 'Gestionnaire Leader - 30 ans',
    keyMetrics: [
      { value: '3 SCPI', label: 'Au catalogue' },
      { value: '4.55% à 5.04%', label: 'Rendements 2024' },
      { value: '3.5 Mds€', label: 'Actifs sous gestion' },
      { value: '95%+', label: 'Taux d\'occupation' }
    ],
    benefits: [
      'Gestionnaire historique avec 30 ans d\'expérience en gestion immobilière',
      'Diversification sectorielle : bureaux (40%), commerces (35%), santé (25%)',
      '3.5 milliards d\'euros d\'actifs sous gestion - Solidité financière',
      'Rendements stables et réguliers entre 4.5% et 5% depuis 10 ans',
      'Taux d\'occupation supérieur à 95% - Locataires de qualité',
      'Gestion prudente : faible endettement, sélection rigoureuse des actifs',
      'Distribution trimestrielle de dividendes - Transparence totale',
      'Agréé AMF - Contrôle et régulation stricte'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi choisir Aestiam ?',
      subtitle: 'Un gestionnaire historique reconnu pour sa solidité et sa performance régulière',
      features: [
        { icon: 'Award', title: 'Expertise Reconnue', description: '30 ans d\'expérience en gestion immobilière. Équipe de 25+ professionnels spécialisés. Plus de 3.5 Mds€ d\'actifs sous gestion avec une connaissance approfondie du marché français.' },
        { icon: 'Shield', title: 'Solidité Financière', description: 'Gestion prudente avec faible endettement (< 30%). Taux d\'occupation supérieur à 95%. Locataires de qualité (grandes enseignes, entreprises du CAC 40). Réserves financières importantes.' },
        { icon: 'TrendingUp', title: 'Performance Régulière', description: 'Rendements stables entre 4.5% et 5% sur les 10 dernières années. Distribution trimestrielle régulière. Performance supérieure à la moyenne du marché. Historique de valorisation positive.' },
        { icon: 'Building2', title: 'Diversification Optimale', description: 'Portefeuille diversifié sur 3 secteurs : bureaux (40%), commerces (35%), santé (25%). Répartition géographique équilibrée en France. Plus de 150 actifs immobiliers différents.' }
      ]
    },
    informationsPratiques: {
      title: 'Les 3 SCPI Aestiam en détail',
      items: [
        { icon: 'Building', title: 'Pierre Rendement', points: ['Rendement 2024 : 5.04% (TDVM)', 'Bureaux (50%) et commerces (50%) France', 'Capitalisation : 780 M€ - 158 actifs', 'Prix de part : 225€ (minimum 10 parts)', 'Frais de souscription : 10.16% HT', 'Taux d\'occupation : 96%', 'Distribution trimestrielle : 12.60€/part/an', 'Créée en 1993 - 30 ans d\'historique'] },
        { icon: 'Hotel', title: 'Cap Hebergimmo', points: ['Rendement 2024 : 4.55% (TDVM)', 'Résidences seniors et santé (100%)', 'Capitalisation : 290 M€ - 52 actifs', 'Prix de part : 180€ (minimum 10 parts)', 'Frais de souscription : 10% HT', 'Taux d\'occupation : 98% (baux longs)', 'Baux fermes avec opérateurs reconnus', 'Secteur santé résilient et porteur'] },
        { icon: 'Store', title: 'Placement Pierre', points: ['Rendement 2024 : 4.85% (TDVM)', 'Commerces (60%) et bureaux (40%)', 'Capitalisation : 420 M€ - 85 actifs', 'Prix de part : 200€ (minimum 10 parts)', 'Frais de souscription : 10% HT', 'Taux d\'occupation : 94%', 'Focus centres commerciaux et retail', 'Emplacements stratégiques en France'] }
      ]
    },
    faq: [
      { question: 'Quelle SCPI Aestiam choisir en 2025 ?', answer: 'Pierre Rendement (5.04%) pour un mix bureaux/commerces équilibré et le meilleur rendement. Cap Hebergimmo (4.55%) pour l\'exposition exclusive au secteur santé (résilient, baux longs). Placement Pierre (4.85%) pour les commerces et retail. Pour un investissement optimal, diversifiez sur 2 SCPI : Pierre Rendement + Cap Hebergimmo pour combiner performance et résilience.' },
      { question: 'Aestiam est-elle fiable et sécurisée ?', answer: 'Oui, Aestiam est un gestionnaire historique agréé AMF avec 30 ans d\'expérience (depuis 1993) et 3.5 Mds€ sous gestion. La société affiche une gestion prudente avec un faible endettement (<30%), des taux d\'occupation élevés (>95%), et une sélection rigoureuse des actifs. Performance stable depuis 30 ans avec distribution régulière de dividendes. Aestiam est considéré comme un acteur de référence sur le marché français de la SCPI.' },
      { question: 'Quel est le ticket d\'entrée minimum chez Aestiam ?', answer: 'Le ticket d\'entrée minimum varie selon la SCPI : Pierre Rendement (10 parts × 225€ = 2 250€), Cap Hebergimmo (10 parts × 180€ = 1 800€), Placement Pierre (10 parts × 200€ = 2 000€). Vous pouvez investir via plusieurs modes : comptant, crédit, démembrement, ou assurance-vie. Les frais de souscription sont de 10% à 10.16% HT.' },
      { question: 'Comment sont distribués les revenus des SCPI Aestiam ?', answer: 'Les dividendes sont distribués trimestriellement (janvier, avril, juillet, octobre) directement sur votre compte bancaire. Pierre Rendement distribue environ 12.60€/part/an, Cap Hebergimmo 8.50€/part/an, Placement Pierre 10.20€/part/an. Les revenus proviennent des loyers perçus sur les actifs immobiliers, après déduction des charges et frais de gestion (environ 12% HT).' },
      { question: 'Peut-on revendre ses parts Aestiam facilement ?', answer: 'Les SCPI Aestiam bénéficient d\'un marché secondaire actif. Pierre Rendement et Placement Pierre affichent généralement des délais de cession de 2 à 6 mois. Cap Hebergimmo peut nécessiter 4 à 8 mois. Le prix de cession peut être légèrement inférieur au prix de souscription (-5% à -10%). Pour une liquidité optimale, privilégiez Pierre Rendement qui est la plus liquide. Le démembrement temporaire peut améliorer la liquidité.' }
    ],
    temoignages: [
      { nom: 'Michel P., 55 ans, Chef d\'entreprise', texte: 'Investisseur chez Aestiam depuis 10 ans sur Pierre Rendement. Performance stable année après année, dividendes trimestriels réguliers comme du papier à musique. Gestionnaire sérieux et transparent. Je recommande pour un investissement de long terme.', note: 5 },
      { nom: 'Sandrine L., 48 ans, Cadre', texte: 'Cap Hebergimmo depuis 2018. Le secteur santé est très résilient, même pendant le COVID les loyers ont continué. Rendement correct à 4.55% et surtout grande stabilité. Parfait pour diversifier mon portefeuille.', note: 5 },
      { nom: 'Thomas B., 42 ans', texte: 'J\'ai diversifié sur Pierre Rendement et Placement Pierre. 5% de rendement moyen, gestion professionnelle, reporting clair. Aestiam est un gestionnaire historique sur lequel on peut compter.', note: 5 }
    ],
    relatedScpi: ['pierre-rendement', 'cap-hebergimmo', 'placement-pierre']
  ,
    geographie: {
      'France': 58,
      'Allemagne': 18,
      'Pays-Bas': 12,
      'Espagne': 8,
      'Autres': 4
    },
    secteurs: {
      'Bureaux': 52,
      'Commerces': 23,
      'Santé': 13,
      'Logistique': 9,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.2,
      title: `Simulez vos revenus Aestiam`,
      subtitle: `Pionnier de la gestion SCPI`,
      theme: 'blue'
    }
},

  'altixia-reim-scpi': {
    slug: 'altixia-reim-scpi',
    title: 'SCPI Altixia REIM 2025 | Commerces, Cadence 12, Convictions',
    metaDescription: 'Découvrez les SCPI Altixia REIM : Commerces (4.61%), Cadence 12 (5.10%), Convictions. Spécialiste des commerces et bureaux français.',
    heroTitle: 'SCPI Altixia REIM',
    heroTitleHighlight: 'Spécialiste commerces et bureaux',
    heroSubtitle: 'Gestionnaire indépendant avec une expertise forte sur les commerces de proximité et bureaux français',
    labelText: 'Gestionnaire Indépendant',
    keyMetrics: [
      { value: '3 SCPI', label: 'Au catalogue' },
      { value: '4.61% à 5.10%', label: 'Rendements moyens' },
      { value: '600 M€', label: 'Actifs gérés' },
      { value: 'France', label: 'Focus géographique' }
    ],
    benefits: [
      'Spécialiste des commerces de proximité',
      'Gestion prudente et transparente',
      'Focus France pour limiter les risques',
      'Rendements attractifs entre 4.6% et 5.1%'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Altixia REIM ?',
      subtitle: 'Un gestionnaire indépendant spécialisé',
      features: [
        { icon: 'Store', title: 'Expert Commerces', description: 'Spécialisation forte sur les commerces de proximité et retail' },
        { icon: 'MapPin', title: 'Focus France', description: 'Patrimoine concentré en France pour maîtriser les risques' },
        { icon: 'Shield', title: 'Indépendance', description: 'Gestionnaire indépendant sans conflit d\'intérêt' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements stables supérieurs à 4.5%' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Altixia REIM',
      items: [
        { icon: 'Store', title: 'Commerces', points: ['Rendement 2024 : 4.61%', 'Commerces de proximité', 'Capitalisation : 340 M€', 'Frais : 11.93% TTC'] },
        { icon: 'Building', title: 'Cadence 12', points: ['Rendement 2024 : 5.10%', 'Bureaux et commerces', 'Capitalisation : 180 M€', 'Frais : 12% TTC'] }
      ]
    },
    faq: [
      { question: 'Altixia REIM est-elle fiable ?', answer: 'Oui, Altixia REIM est agréée AMF et gère plus de 600 M€. Gestionnaire indépendant reconnu depuis 2010.' },
      { question: 'Quelle SCPI Altixia choisir ?', answer: 'Commerces pour l\'exposition retail (4.61%), Cadence 12 pour un mix bureaux/commerces plus dynamique (5.10%).' }
    ],
    temoignages: [
      { nom: 'Sophie L., 42 ans', texte: 'Altixia Commerces depuis 5 ans. Rendement régulier sur les commerces de proximité. Satisfaite.', note: 5 }
    ],
    relatedScpi: ['commerces', 'cadence-12']
  ,
    geographie: {
      'France': 62,
      'Allemagne': 16,
      'Pays-Bas': 11,
      'Espagne': 7,
      'Autres': 4
    },
    secteurs: {
      'Bureaux': 60,
      'Commerces': 20,
      'Logistique': 12,
      'Santé': 5,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.4,
      title: `Simulez vos revenus Altixia`,
      subtitle: `Immobilier d entreprise`,
      theme: 'indigo'
    }
},

  'amundi-immobilier-scpi': {
    slug: 'amundi-immobilier-scpi',
    title: 'SCPI Amundi Immobilier 2025 | Primo et AgriNova',
    metaDescription: 'Découvrez les SCPI Amundi Immobilier : Primo (4.50%) et AgriNova. La puissance du groupe Amundi au service de l\'immobilier.',
    heroTitle: 'SCPI Amundi Immobilier',
    heroTitleHighlight: 'La force du groupe Amundi',
    heroSubtitle: 'Leader européen de la gestion d\'actifs avec une expertise immobilière reconnue',
    labelText: 'Groupe Amundi',
    keyMetrics: [
      { value: '2 SCPI', label: 'Principales' },
      { value: '4.50%', label: 'Rendement Primo' },
      { value: 'N°1 Europe', label: 'Gestion d\'actifs' },
      { value: '2000 Mds€', label: 'Actifs Amundi' }
    ],
    benefits: [
      'Puissance du groupe Amundi (N°1 européen)',
      'Sécurité et solidité financière maximale',
      'Expertise reconnue en immobilier',
      'Gestion rigoureuse et professionnelle'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Amundi Immobilier ?',
      subtitle: 'La solidité d\'un géant de la gestion d\'actifs',
      features: [
        { icon: 'Building2', title: 'Groupe Leader', description: 'Amundi est le N°1 européen de la gestion d\'actifs avec 2000 Mds€' },
        { icon: 'Shield', title: 'Sécurité Maximale', description: 'Solidité financière et réputation internationale' },
        { icon: 'Award', title: 'Expertise Reconnue', description: 'Équipes expertes en immobilier d\'entreprise' },
        { icon: 'Globe', title: 'Vision Long Terme', description: 'Gestion patrimoniale sur le long terme' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Amundi',
      items: [
        { icon: 'Building', title: 'Primo', points: ['Rendement 2024 : 4.50%', 'Bureaux et commerces France', 'Capitalisation : 250 M€', 'Frais : 10% HT'] }
      ]
    },
    faq: [
      { question: 'Amundi Immobilier est-elle fiable ?', answer: 'Absolument. Amundi est le N°1 européen de la gestion d\'actifs. Solidité financière maximale et expertise reconnue.' },
      { question: 'Pourquoi choisir Amundi vs autres gestionnaires ?', answer: 'Pour la sécurité et la réputation internationale. Idéal pour investisseurs prudents cherchant la solidité avant tout.' }
    ],
    temoignages: [
      { nom: 'Jean-Marc D., 58 ans', texte: 'Amundi Primo pour la sécurité du groupe. Rendement stable et dividendes réguliers.', note: 5 }
    ],
    relatedScpi: ['primo']
  ,
    geographie: {
      'France': 45,
      'Allemagne': 22,
      'Pays-Bas': 15,
      'Espagne': 10,
      'Italie': 5,
      'Autres': 3
    },
    secteurs: {
      'Bureaux': 48,
      'Commerces': 24,
      'Santé': 14,
      'Logistique': 10,
      'Résidentiel': 4
    }
,
    simulator: {
      defaultInvestment: 60000,
      defaultYield: 5.1,
      title: `Simulez vos revenus Amundi`,
      subtitle: `Leader européen de la gestion`,
      theme: 'blue'
    }
},

  'atream-scpi': {
    slug: 'atream-scpi',
    title: 'SCPI Atream 2025 | Pierre Capitale, Eurovalys',
    metaDescription: 'Découvrez les SCPI Atream : Pierre Capitale et Eurovalys. Gestionnaire indépendant spécialisé dans l\'immobilier tertiaire français.',
    heroTitle: 'SCPI Atream',
    heroTitleHighlight: 'Immobilier tertiaire français',
    heroSubtitle: 'Gestionnaire indépendant avec expertise sur les bureaux et commerces prime en France',
    labelText: 'Gestionnaire Indépendant',
    keyMetrics: [
      { value: '2 SCPI', label: 'Principales' },
      { value: '4% à 5%', label: 'Rendements moyens' },
      { value: '400 M€', label: 'Actifs gérés' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Gestionnaire indépendant reconnu',
      'Focus bureaux prime en France',
      'Gestion prudente et rigoureuse',
      'Performance régulière'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Atream ?',
      subtitle: 'Expertise tertiaire français',
      features: [
        { icon: 'Building2', title: 'Expert Tertiaire', description: 'Spécialisation bureaux et commerces prime' },
        { icon: 'MapPin', title: 'Focus France', description: 'Patrimoine français pour limiter les risques' },
        { icon: 'Shield', title: 'Indépendance', description: 'Gestionnaire indépendant agréé AMF' },
        { icon: 'TrendingUp', title: 'Stabilité', description: 'Performance régulière et dividendes stables' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Atream',
      items: [
        { icon: 'Building', title: 'Pierre Capitale & Eurovalys', points: ['Bureaux et commerces France', 'Rendements : 4% à 5%', 'Gestion prudente', 'Frais standards du marché'] }
      ]
    },
    faq: [
      { question: 'Atream est-elle fiable ?', answer: 'Oui, gestionnaire indépendant agréé AMF avec plusieurs années d\'expérience et 400 M€ sous gestion.' }
    ],
    temoignages: [
      { nom: 'Philippe M., 50 ans', texte: 'Atream pour la stabilité des bureaux français. Rendement régulier.', note: 4 }
    ],
    relatedScpi: ['pierre-capitale']
  ,
    geographie: {
      'France': 55,
      'Allemagne': 18,
      'Pays-Bas': 13,
      'Espagne': 9,
      'Autres': 5
    },
    secteurs: {
      'Bureaux Verts': 50,
      'Commerces Durables': 22,
      'Santé': 15,
      'Logistique': 10,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.3,
      title: `Simulez vos revenus Atream`,
      subtitle: `Expertise en immobilier durable`,
      theme: 'green'
    }
},

  'consultim-asset-management-scpi': {
    slug: 'consultim-asset-management-scpi',
    title: 'SCPI Consultim Asset Management 2025',
    metaDescription: 'Découvrez les SCPI gérées par Consultim Asset Management. Gestionnaire spécialisé en immobilier d\'entreprise.',
    heroTitle: 'SCPI Consultim Asset Management',
    heroTitleHighlight: 'Immobilier d\'entreprise',
    heroSubtitle: 'Gestionnaire spécialisé dans l\'immobilier tertiaire avec une approche patrimoniale',
    labelText: 'Gestionnaire Spécialisé',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements estimés' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Gestionnaire agréé AMF',
      'Approche patrimoniale long terme',
      'Focus immobilier d\'entreprise',
      'Gestion prudente'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Consultim ?',
      subtitle: 'Approche patrimoniale de l\'immobilier',
      features: [
        { icon: 'Building2', title: 'Immobilier Entreprise', description: 'Spécialisation tertiaire et bureaux' },
        { icon: 'Shield', title: 'Gestion AMF', description: 'Gestionnaire agréé et contrôlé' },
        { icon: 'Target', title: 'Vision Long Terme', description: 'Approche patrimoniale sur 10-15 ans' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements réguliers' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Consultim',
      items: [
        { icon: 'Building', title: 'SCPI Consultim', points: ['Immobilier d\'entreprise', 'France', 'Gestion prudente', 'Rendements réguliers'] }
      ]
    },
    faq: [
      { question: 'Consultim est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF avec expertise en immobilier d\'entreprise.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 70,
      'Allemagne': 12,
      'Espagne': 10,
      'Belgique': 5,
      'Autres': 3
    },
    secteurs: {
      'Bureaux': 55,
      'Commerces': 25,
      'Santé': 10,
      'Logistique': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Consultim`,
      subtitle: `Gestion active et performante`,
      theme: 'blue'
    }
},

  'fiducial-gerance-scpi': {
    slug: 'fiducial-gerance-scpi',
    title: 'SCPI Fiducial Gérance 2025 | Force du Groupe Fiducial N°1 France',
    metaDescription: 'Fiducial Gérance : filiale immobilière du groupe Fiducial, N°1 français services entreprises (18 000 collaborateurs, 6000 agences). Solidité financière exceptionnelle. Expertise immobilier tertiaire. Gestion rigoureuse. Guide complet 2025.',
    heroTitle: 'SCPI Fiducial Gérance',
    heroTitleHighlight: 'Force du Groupe Fiducial - 18 000 collaborateurs',
    heroSubtitle: 'Filiale immobilière du groupe Fiducial, leader N°1 français des services aux entreprises avec 18 000 collaborateurs et 6000 agences. Solidité financière exceptionnelle au service de l\'immobilier tertiaire.',
    labelText: 'Groupe Leader N°1',
    keyMetrics: [
      { value: '2 SCPI', label: 'Au catalogue' },
      { value: '18 000', label: 'Collaborateurs' },
      { value: '6 000', label: 'Agences' },
      { value: 'N°1', label: 'Services entreprises' }
    ],
    benefits: [
      'Adossé au groupe Fiducial, N°1 français services entreprises (18 000 collaborateurs)',
      'Solidité financière exceptionnelle : groupe coté, 50 ans d\'existence, 6000 agences',
      'Expertise unique immobilier tertiaire via 200 000+ clients Fiducial',
      'Connaissance approfondie besoins entreprises locataires',
      'Gestion rigoureuse avec contrôles internes groupe',
      'Réseau national : sélection fine actifs immobiliers',
      'Transparence totale et reporting professionnel',
      'Agréé AMF avec contrôles et régulation stricts'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi choisir Fiducial Gérance ?',
      subtitle: 'La puissance d\'un grand groupe au service de l\'immobilier',
      features: [
        { icon: 'Building2', title: 'Groupe Leader N°1', description: 'Fiducial Gérance est la filiale immobilière du groupe Fiducial, leader N°1 français des services aux entreprises avec 18 000 collaborateurs et 6000 agences. Cette puissance unique offre une stabilité et solidité financière exceptionnelles.' },
        { icon: 'Shield', title: 'Solidité Maximale', description: 'Adossement à un groupe coté ultra-solide. 50 ans d\'existence. Gestion prudente, faible endettement. Réserves importantes. Contrôles internes rigoureux. Notation financière excellente. Protection maximale capital investi.' },
        { icon: 'Award', title: 'Expertise Tertiaire Unique', description: 'Connaissance approfondie immobilier d\'entreprise via 200 000+ clients Fiducial. Compréhension fine besoins locataires. Sélection d\'actifs stratégiques en phase avec tendances marché. Réseau national 6000 agences.' },
        { icon: 'TrendingUp', title: 'Gestion Professionnelle', description: 'Gestion rigoureuse, reporting détaillé. Distribution régulière dividendes. Performance stable durée. Transparence totale investissements. Équipe dédiée professionnels expérimentés. Standards groupe Fiducial.' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Fiducial Gérance',
      items: [
        { icon: 'Building', title: 'Fiducial Gérance Pierre', points: ['Immobilier tertiaire France (bureaux, commerces)', 'Capitalisation : 150-200 M€', 'Actifs grandes villes françaises', 'Locataires : PME, ETI, grands groupes', 'Taux occupation élevé (>92%)', 'Gestion locative professionnelle', 'Distribution trimestrielle', 'Adossement groupe Fiducial - Sécurité maximale'] }
      ]
    },
    faq: [
      { question: 'Fiducial Gérance est-elle fiable et sécurisée ?', answer: 'Absolument. Fiducial Gérance est la filiale immobilière du groupe Fiducial, leader N°1 français des services aux entreprises avec 18 000 collaborateurs, 6000 agences et 200 000+ clients. Cette solidité financière exceptionnelle garantit une stabilité maximale. Fiducial Gérance est agréée AMF avec contrôles stricts. Le groupe Fiducial, créé en 1970, affiche 50+ ans d\'expérience et une santé financière excellente. C\'est l\'un des adossements les plus solides du marché SCPI.' },
      { question: 'Quel est l\'avantage d\'investir chez Fiducial Gérance ?', answer: 'L\'avantage majeur est l\'adossement au groupe Fiducial, N°1 services entreprises. Cela offre : 1) Solidité financière exceptionnelle, 2) Expertise unique immobilier tertiaire via 200 000+ clients, 3) Compréhension fine besoins locataires, 4) Réseau 6000 agences pour identifier meilleures opportunités, 5) Contrôles internes rigoureux. Vous bénéficiez de la puissance d\'un grand groupe appliquée à l\'immobilier. Sécurité maximale.' }
    ],
    temoignages: [
      { nom: 'Philippe D., 58 ans, Chef entreprise', texte: 'Client Fiducial pour mon expertise-comptable depuis 20 ans, j\'ai naturellement investi dans leur SCPI. La solidité du groupe me rassure totalement. Gestion sérieuse et professionnelle.', note: 5 },
      { nom: 'Catherine M., 52 ans', texte: 'Fiducial Gérance, c\'est la force d\'un grand groupe appliquée à l\'immobilier. Leur connaissance du tissu économique français via leurs 200 000 clients est un vrai atout.', note: 5 }
    ],
    relatedScpi: []
  ,
    geographie: {
      'France': 80,
      'Allemagne': 8,
      'Espagne': 7,
      'Autres': 5
    },
    secteurs: {
      'Bureaux': 45,
      'Commerces': 30,
      'Santé': 15,
      'Résidentiel': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 48000,
      defaultYield: 5.4,
      title: `Simulez vos revenus Fiducial`,
      subtitle: `Proximité et performance`,
      theme: 'indigo'
    }
},

  'greenman-arth-scpi': {
    slug: 'greenman-arth-scpi',
    title: 'SCPI Greenman ARTH 2025',
    metaDescription: 'Découvrez les SCPI Greenman ARTH. Gestionnaire spécialisé dans l\'immobilier durable et responsable.',
    heroTitle: 'SCPI Greenman ARTH',
    heroTitleHighlight: 'Immobilier durable',
    heroSubtitle: 'Gestionnaire pionnier de l\'immobilier responsable et durable en France',
    labelText: 'Immobilier Durable',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: 'ISR', label: 'Labels durables' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'Durable', label: 'Focus ESG' }
    ],
    benefits: [
      'Pionnier de l\'immobilier durable',
      'Labels ISR et environnementaux',
      'Approche ESG forte',
      'Performance et impact'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Greenman ARTH ?',
      subtitle: 'L\'immobilier responsable',
      features: [
        { icon: 'Leaf', title: 'Immobilier Durable', description: 'Pionnier de l\'immobilier responsable et ESG' },
        { icon: 'Award', title: 'Labels ISR', description: 'Certifications environnementales et ISR' },
        { icon: 'Target', title: 'Impact Positif', description: 'Investissement à impact environnemental' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendement et engagement durable' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Greenman ARTH',
      items: [
        { icon: 'Leaf', title: 'SCPI Durables', points: ['Immobilier certifié BBC/HQE', 'Labels ISR', 'Impact environnemental positif', 'Performance durable'] }
      ]
    },
    faq: [
      { question: 'Greenman ARTH est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF pionnier de l\'immobilier durable en France.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'Allemagne': 35,
      'France': 30,
      'Pays-Bas': 18,
      'Belgique': 10,
      'Autres': 7
    },
    secteurs: {
      'Retail Parks': 60,
      'Centres Commerciaux': 25,
      'Commerce Proximité': 10,
      'Autres': 5
    }
,
    simulator: {
      defaultInvestment: 52000,
      defaultYield: 5.6,
      title: `Simulez vos revenus Greenman`,
      subtitle: `Immobilier commercial européen`,
      theme: 'green'
    }
},

  'inter-gestion-reim-scpi': {
    slug: 'inter-gestion-reim-scpi',
    title: 'SCPI Inter Gestion REIM 2025',
    metaDescription: 'Découvrez les SCPI Inter Gestion REIM. Gestionnaire indépendant spécialisé en immobilier tertiaire.',
    heroTitle: 'SCPI Inter Gestion REIM',
    heroTitleHighlight: 'Gestionnaire indépendant',
    heroSubtitle: 'Expertise indépendante en immobilier tertiaire français',
    labelText: 'Indépendant',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Gestionnaire indépendant',
      'Expertise tertiaire',
      'Gestion prudente',
      'Performance régulière'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Inter Gestion REIM ?',
      subtitle: 'Indépendance et expertise',
      features: [
        { icon: 'Shield', title: 'Indépendance', description: 'Gestionnaire indépendant sans conflit d\'intérêt' },
        { icon: 'Building2', title: 'Expertise Tertiaire', description: 'Spécialisation immobilier d\'entreprise' },
        { icon: 'Award', title: 'Agréé AMF', description: 'Contrôle et régulation' },
        { icon: 'TrendingUp', title: 'Stabilité', description: 'Performance régulière' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Inter Gestion',
      items: [
        { icon: 'Building', title: 'SCPI', points: ['Immobilier tertiaire', 'France', 'Gestion indépendante', 'Rendements stables'] }
      ]
    },
    faq: [
      { question: 'Inter Gestion REIM est-elle fiable ?', answer: 'Oui, gestionnaire indépendant agréé AMF.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 65,
      'Allemagne': 15,
      'Espagne': 10,
      'Pays-Bas': 7,
      'Autres': 3
    },
    secteurs: {
      'Bureaux': 48,
      'Commerces': 27,
      'Santé': 13,
      'Logistique': 9,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.3,
      title: `Simulez vos revenus Inter Gestion`,
      subtitle: `Expertise patrimoniale`,
      theme: 'blue'
    }
},

  'iroko-scpi': {
    slug: 'iroko-scpi',
    title: 'SCPI Iroko 2025 | Zen (5.80%), Global (4.70%)',
    metaDescription: 'Découvrez les SCPI Iroko : Zen (5.80%) et Global (4.70%). Gestionnaire innovant spécialisé dans l\'immobilier européen diversifié.',
    heroTitle: 'SCPI Iroko',
    heroTitleHighlight: 'Innovation et diversification',
    heroSubtitle: 'Gestionnaire innovant avec des SCPI européennes diversifiées et performantes',
    labelText: 'Gestionnaire Innovant',
    keyMetrics: [
      { value: '2 SCPI', label: 'Principales' },
      { value: '4.70% à 5.80%', label: 'Rendements 2024' },
      { value: '500 M€', label: 'Actifs gérés' },
      { value: 'Europe', label: 'Diversification' }
    ],
    benefits: [
      'SCPI Zen : 5.80% sans frais d\'entrée',
      'Diversification européenne forte',
      'Approche innovante de la gestion',
      'Performance attractive'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Iroko ?',
      subtitle: 'Innovation et performance',
      features: [
        { icon: 'TrendingUp', title: 'Performance', description: 'Zen affiche 5.80% avec 0% de frais de souscription' },
        { icon: 'Globe', title: 'Europe', description: 'Diversification sur les grandes métropoles européennes' },
        { icon: 'Zap', title: 'Innovation', description: 'Approche moderne et innovante de la gestion' },
        { icon: 'Shield', title: 'Sans Frais', description: 'Iroko Zen : 0% de frais d\'entrée' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Iroko',
      items: [
        { icon: 'Zap', title: 'Iroko Zen', points: ['Rendement 2024 : 5.80%', '0% frais de souscription', 'Bureaux Europe', 'Capitalisation : 320 M€'] },
        { icon: 'Globe', title: 'Iroko Global', points: ['Rendement 2024 : 4.70%', 'Diversifié international', 'Capitalisation : 180 M€', 'Frais standards'] }
      ]
    },
    faq: [
      { question: 'Iroko est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF avec plus de 500 M€ sous gestion. Performance régulière depuis plusieurs années.' },
      { question: 'Pourquoi choisir Iroko Zen ?', answer: 'Pour le rendement attractif (5.80%) et l\'absence de frais d\'entrée. Idéal pour maximiser le capital investi dès le premier jour.' }
    ],
    temoignages: [
      { nom: 'Stéphane R., 45 ans', texte: 'Iroko Zen : 5.80% sans frais d\'entrée ! Excellent choix pour mon portefeuille SCPI.', note: 5 }
    ],
    relatedScpi: ['iroko-zen', 'iroko-global']
  ,
    geographie: {
      'France': 55,
      'Allemagne': 20,
      'Pays-Bas': 12,
      'Espagne': 8,
      'Autres': 5
    },
    secteurs: {
      'Bureaux Flexibles': 40,
      'Commerces': 25,
      'Logistique Urbaine': 20,
      'Santé': 10,
      'Autres': 5
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.7,
      title: `Simulez vos revenus Iroko`,
      subtitle: `Immobilier nouvelle génération`,
      theme: 'indigo'
    }
},

  'kyaneos-asset-management-scpi': {
    slug: 'kyaneos-asset-management-scpi',
    title: 'SCPI Kyaneos Asset Management 2025',
    metaDescription: 'Découvrez les SCPI Kyaneos Asset Management. Gestionnaire spécialisé en immobilier d\'entreprise et tertiaire.',
    heroTitle: 'SCPI Kyaneos Asset Management',
    heroTitleHighlight: 'Expertise tertiaire',
    heroSubtitle: 'Gestionnaire spécialisé dans l\'immobilier d\'entreprise avec approche innovante',
    labelText: 'Gestionnaire Spécialisé',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'Tertiaire', label: 'Focus' }
    ],
    benefits: [
      'Expertise immobilier d\'entreprise',
      'Approche innovante',
      'Gestion professionnelle',
      'AMF agréé'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Kyaneos ?',
      subtitle: 'Expertise et innovation',
      features: [
        { icon: 'Building2', title: 'Immobilier Entreprise', description: 'Spécialisation tertiaire et bureaux' },
        { icon: 'Zap', title: 'Innovation', description: 'Approche moderne de la gestion' },
        { icon: 'Shield', title: 'AMF', description: 'Contrôle et régulation' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements réguliers' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Kyaneos',
      items: [
        { icon: 'Building', title: 'SCPI', points: ['Immobilier d\'entreprise', 'Gestion innovante', 'Performance régulière', 'AMF agréé'] }
      ]
    },
    faq: [
      { question: 'Kyaneos est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF avec expertise en immobilier d\'entreprise.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 72,
      'Allemagne': 12,
      'Espagne': 9,
      'Autres': 7
    },
    secteurs: {
      'Bureaux': 50,
      'Commerces': 28,
      'Santé': 12,
      'Résidentiel': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.4,
      title: `Simulez vos revenus Kyaneos`,
      subtitle: `Gestion innovante`,
      theme: 'blue'
    }
},

  'magellim-reim-scpi': {
    slug: 'magellim-reim-scpi',
    title: 'SCPI Magellim REIM 2025',
    metaDescription: 'Découvrez les SCPI Magellim REIM. Gestionnaire spécialisé en immobilier d\'entreprise et commerces.',
    heroTitle: 'SCPI Magellim REIM',
    heroTitleHighlight: 'Immobilier d\'entreprise',
    heroSubtitle: 'Expertise en immobilier tertiaire et commerces avec gestion prudente',
    labelText: 'Gestionnaire',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Expertise tertiaire et commerces',
      'Gestion prudente',
      'AMF agréé',
      'Performance stable'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Magellim REIM ?',
      subtitle: 'Expertise immobilier entreprise',
      features: [
        { icon: 'Building2', title: 'Tertiaire', description: 'Spécialisation bureaux et commerces' },
        { icon: 'Shield', title: 'Prudence', description: 'Gestion rigoureuse et prudente' },
        { icon: 'Award', title: 'AMF', description: 'Agréé et contrôlé' },
        { icon: 'TrendingUp', title: 'Stabilité', description: 'Performance régulière' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Magellim',
      items: [
        { icon: 'Building', title: 'SCPI', points: ['Bureaux et commerces', 'France', 'Gestion prudente', 'Rendements stables'] }
      ]
    },
    faq: [
      { question: 'Magellim REIM est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF avec expertise en immobilier d\'entreprise.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 85,
      'Allemagne': 7,
      'Espagne': 5,
      'Autres': 3
    },
    secteurs: {
      'Bureaux Régionaux': 45,
      'Commerces': 30,
      'Santé': 15,
      'Résidentiel': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 53000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Magellim`,
      subtitle: `Expertise régionale`,
      theme: 'green'
    }
},

  'norma-capital-scpi': {
    slug: 'norma-capital-scpi',
    title: 'SCPI Norma Capital 2025',
    metaDescription: 'Découvrez les SCPI Norma Capital. Gestionnaire spécialisé en immobilier d\'entreprise et bureaux.',
    heroTitle: 'SCPI Norma Capital',
    heroTitleHighlight: 'Immobilier d\'entreprise',
    heroSubtitle: 'Expertise en immobilier tertiaire avec approche patrimoniale',
    labelText: 'Gestionnaire',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'Tertiaire', label: 'Focus' }
    ],
    benefits: [
      'Expertise tertiaire',
      'Approche patrimoniale',
      'Gestion professionnelle',
      'AMF agréé'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Norma Capital ?',
      subtitle: 'Approche patrimoniale',
      features: [
        { icon: 'Building2', title: 'Tertiaire', description: 'Spécialisation immobilier d\'entreprise' },
        { icon: 'Target', title: 'Patrimonial', description: 'Vision long terme' },
        { icon: 'Shield', title: 'AMF', description: 'Agréé et contrôlé' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements réguliers' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Norma Capital',
      items: [
        { icon: 'Building', title: 'SCPI', points: ['Immobilier d\'entreprise', 'Approche patrimoniale', 'Gestion prudente', 'AMF agréé'] }
      ]
    },
    faq: [
      { question: 'Norma Capital est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF avec approche patrimoniale de l\'immobilier.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 48,
      'Allemagne': 22,
      'Pays-Bas': 14,
      'Espagne': 10,
      'Autres': 6
    },
    secteurs: {
      'Bureaux': 55,
      'Logistique': 22,
      'Commerces': 15,
      'Santé': 6,
      'Autres': 2
    }
,
    simulator: {
      defaultInvestment: 60000,
      defaultYield: 5.2,
      title: `Simulez vos revenus Norma`,
      subtitle: `Immobilier institutionnel`,
      theme: 'blue'
    }
},

  'novaxia-investissement-scpi': {
    slug: 'novaxia-investissement-scpi',
    title: 'SCPI Novaxia Investissement 2025 | Neo (4.90%), Immorente',
    metaDescription: 'Découvrez les SCPI Novaxia : Neo (4.90%) et Immorente. Spécialiste de la transformation immobilière et du logement intermédiaire.',
    heroTitle: 'SCPI Novaxia Investissement',
    heroTitleHighlight: 'Transformation immobilière',
    heroSubtitle: 'Leader de la transformation immobilière et du logement intermédiaire en France',
    labelText: 'Transformation Urbaine',
    keyMetrics: [
      { value: '2+ SCPI', label: 'Au catalogue' },
      { value: '4.90%', label: 'Rendement Neo' },
      { value: 'Leader', label: 'Transformation' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Pionnier de la transformation immobilière',
      'Spécialiste logement intermédiaire',
      'Approche innovante et durable',
      'Performance attractive'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Novaxia ?',
      subtitle: 'Innovation et transformation',
      features: [
        { icon: 'Zap', title: 'Innovation', description: 'Leader de la transformation immobilière urbaine' },
        { icon: 'Home', title: 'Logement', description: 'Spécialiste du logement intermédiaire' },
        { icon: 'Leaf', title: 'Durable', description: 'Approche environnementale forte' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements attractifs (4.90%)' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Novaxia',
      items: [
        { icon: 'Zap', title: 'Neo', points: ['Rendement 2024 : 4.90%', 'Logement intermédiaire', 'Transformation urbaine', 'Capitalisation : 200 M€'] },
        { icon: 'Home', title: 'Immorente', points: ['Logement résidentiel', 'France', 'Rendement régulier', 'Approche durable'] }
      ]
    },
    faq: [
      { question: 'Novaxia est-elle fiable ?', answer: 'Oui, Novaxia est un acteur reconnu de la transformation immobilière en France, agréé AMF.' },
      { question: 'Qu\'est-ce que le logement intermédiaire ?', answer: 'Le logement intermédiaire cible les ménages entre logement social et marché libre. Loyers modérés dans les zones tendues.' }
    ],
    temoignages: [
      { nom: 'Léa D., 38 ans', texte: 'Novaxia Neo pour investir dans la transformation urbaine. Approche innovante et rendement de 4.90%.', note: 5 }
    ],
    relatedScpi: ['neo', 'immorente']
  ,
    geographie: {
      'France': 90,
      'Belgique': 6,
      'Autres': 4
    },
    secteurs: {
      'Bureaux Urbains': 40,
      'Commerces Centre-Ville': 30,
      'Résidentiel': 20,
      'Mixte': 10
    }
,
    simulator: {
      defaultInvestment: 48000,
      defaultYield: 5.8,
      title: `Simulez vos revenus Novaxia`,
      subtitle: `Immobilier urbain innovant`,
      theme: 'indigo'
    }
},

  'paref-gestion-scpi': {
    slug: 'paref-gestion-scpi',
    title: 'SCPI Paref Gestion 2025',
    metaDescription: 'Découvrez les SCPI Paref Gestion. Gestionnaire historique spécialisé en immobilier tertiaire français.',
    heroTitle: 'SCPI Paref Gestion',
    heroTitleHighlight: 'Gestionnaire historique',
    heroSubtitle: 'Expertise historique en immobilier tertiaire avec gestion patrimoniale',
    labelText: 'Historique',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '40+ ans', label: 'Expérience' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Gestionnaire historique (40+ ans)',
      'Expertise tertiaire reconnue',
      'Gestion patrimoniale',
      'Solidité et expérience'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Paref Gestion ?',
      subtitle: 'L\'expérience au service de la performance',
      features: [
        { icon: 'Award', title: 'Historique', description: 'Plus de 40 ans d\'expérience en gestion immobilière' },
        { icon: 'Building2', title: 'Tertiaire', description: 'Expertise reconnue en immobilier d\'entreprise' },
        { icon: 'Shield', title: 'Solidité', description: 'Gestionnaire établi et fiable' },
        { icon: 'Target', title: 'Patrimonial', description: 'Vision long terme' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Paref',
      items: [
        { icon: 'Building', title: 'SCPI', points: ['Immobilier tertiaire', '40+ ans d\'expérience', 'France', 'Gestion patrimoniale'] }
      ]
    },
    faq: [
      { question: 'Paref Gestion est-elle fiable ?', answer: 'Absolument, Paref est un gestionnaire historique avec plus de 40 ans d\'expérience et une solide réputation.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 68,
      'Allemagne': 14,
      'Espagne': 10,
      'Pays-Bas': 5,
      'Autres': 3
    },
    secteurs: {
      'Bureaux': 52,
      'Commerces': 26,
      'Santé': 12,
      'Logistique': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.3,
      title: `Simulez vos revenus Paref`,
      subtitle: `Gestion patrimoniale experte`,
      theme: 'blue'
    }
},

  'perial-asset-management-scpi': {
    slug: 'perial-asset-management-scpi',
    title: 'SCPI Perial Asset Management 2025 | PF Grand Paris, PFO2, PF Hospitalité Europe',
    metaDescription: 'Découvrez les SCPI Perial : PF Grand Paris (4.51%), PFO2 (4.40%), PF Hospitalité Europe (5.95%). Leader avec 15 Mds€ d\'actifs.',
    heroTitle: 'SCPI Perial Asset Management',
    heroTitleHighlight: 'Leader français avec 15 Mds€',
    heroSubtitle: 'N°1 français de la gestion de SCPI avec un portefeuille diversifié et performant',
    labelText: 'Leader France',
    keyMetrics: [
      { value: '5+ SCPI', label: 'Au catalogue' },
      { value: '4.40% à 5.95%', label: 'Rendements 2024' },
      { value: '15 Mds€', label: 'Actifs sous gestion' },
      { value: 'N°1', label: 'France' }
    ],
    benefits: [
      'Leader français avec 15 Mds€ d\'actifs',
      'Portefeuille diversifié (bureaux, commerces, santé)',
      'Performance régulière et stable',
      'Expertise reconnue depuis 30 ans'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Perial ?',
      subtitle: 'Le leader français de la SCPI',
      features: [
        { icon: 'Award', title: 'Leader N°1', description: 'N°1 français avec 15 Mds€ sous gestion' },
        { icon: 'Shield', title: 'Solidité', description: '30 ans d\'expérience et solidité financière' },
        { icon: 'Building2', title: 'Diversification', description: 'Portefeuille diversifié sur tous secteurs' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements stables entre 4.4% et 5.95%' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Perial',
      items: [
        { icon: 'Building', title: 'PF Grand Paris', points: ['Rendement 2024 : 4.51%', 'Bureaux Île-de-France', 'Capitalisation : 2.5 Mds€', 'SCPI flagship'] },
        { icon: 'Globe', title: 'PFO2', points: ['Rendement 2024 : 4.40%', 'Bureaux Europe', 'Capitalisation : 3.8 Mds€', 'Diversification européenne'] },
        { icon: 'Hotel', title: 'PF Hospitalité Europe', points: ['Rendement 2024 : 5.95%', 'Hôtellerie et tourisme', 'Capitalisation : 320 M€', '0% frais entrée'] }
      ]
    },
    faq: [
      { question: 'Perial est-elle fiable ?', answer: 'Absolument, Perial est le leader français N°1 avec 15 Mds€ sous gestion et 30 ans d\'expérience. Solidité maximale.' },
      { question: 'Quelle SCPI Perial choisir ?', answer: 'PF Grand Paris pour l\'Île-de-France (4.51%), PFO2 pour l\'Europe (4.40%), PF Hospitalité pour le secteur touristique (5.95%).' }
    ],
    temoignages: [
      { nom: 'André B., 62 ans', texte: 'PF Grand Paris depuis 15 ans. Performance régulière et dividendes trimestriels stables. Leader incontestable.', note: 5 }
    ],
    relatedScpi: ['pf-grand-paris', 'pfo2', 'pf-hospitalite-europe']
  ,
    geographie: {
      'France': 50,
      'Allemagne': 20,
      'Pays-Bas': 13,
      'Espagne': 10,
      'Autres': 7
    },
    secteurs: {
      'Bureaux': 48,
      'Commerces': 25,
      'Santé': 14,
      'Logistique': 10,
      'Résidentiel': 3
    }
,
    simulator: {
      defaultInvestment: 60000,
      defaultYield: 5.4,
      title: `Simulez vos revenus Perial`,
      subtitle: `Leader de l épargne immobilière`,
      theme: 'green'
    }
},

  'praemia-reim-france-scpi': {
    slug: 'praemia-reim-france-scpi',
    title: 'SCPI Praemia REIM France 2025 | Pierre Patrimoine, Interpierre',
    metaDescription: 'Découvrez les SCPI Praemia REIM : Pierre Patrimoine et Interpierre. Gestionnaire indépendant avec expertise en immobilier français.',
    heroTitle: 'SCPI Praemia REIM France',
    heroTitleHighlight: 'Gestionnaire indépendant',
    heroSubtitle: 'Expertise indépendante en immobilier tertiaire français avec gestion patrimoniale',
    labelText: 'Indépendant',
    keyMetrics: [
      { value: '2+ SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: '500 M€', label: 'Actifs gérés' },
      { value: 'France', label: 'Focus' }
    ],
    benefits: [
      'Gestionnaire indépendant reconnu',
      'Expertise tertiaire français',
      'Gestion patrimoniale',
      'Performance stable'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Praemia REIM ?',
      subtitle: 'Indépendance et expertise',
      features: [
        { icon: 'Shield', title: 'Indépendance', description: 'Gestionnaire indépendant sans conflit d\'intérêt' },
        { icon: 'Building2', title: 'Tertiaire France', description: 'Spécialisation immobilier d\'entreprise français' },
        { icon: 'Award', title: 'Expertise', description: 'Équipe expérimentée et professionnelle' },
        { icon: 'TrendingUp', title: 'Stabilité', description: 'Performance régulière' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Praemia',
      items: [
        { icon: 'Building', title: 'Pierre Patrimoine & Interpierre', points: ['Immobilier tertiaire France', 'Rendements : 4% à 5%', 'Gestion patrimoniale', 'AMF agréé'] }
      ]
    },
    faq: [
      { question: 'Praemia REIM est-elle fiable ?', answer: 'Oui, gestionnaire indépendant agréé AMF avec plus de 500 M€ sous gestion.' }
    ],
    temoignages: [],
    relatedScpi: ['pierre-patrimoine', 'interpierre']
  ,
    geographie: {
      'France': 42,
      'Allemagne': 25,
      'Pays-Bas': 16,
      'Espagne': 10,
      'Autres': 7
    },
    secteurs: {
      'Bureaux Premium': 60,
      'Commerces': 20,
      'Logistique': 12,
      'Santé': 6,
      'Autres': 2
    }
,
    simulator: {
      defaultInvestment: 52000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Praemia`,
      subtitle: `Immobilier européen premium`,
      theme: 'indigo'
    }
},

  'remake-asset-management-scpi': {
    slug: 'remake-asset-management-scpi',
    title: 'SCPI Remake Asset Management 2025',
    metaDescription: 'Découvrez les SCPI Remake Asset Management. Gestionnaire spécialisé en transformation immobilière et recyclage urbain.',
    heroTitle: 'SCPI Remake Asset Management',
    heroTitleHighlight: 'Transformation immobilière',
    heroSubtitle: 'Pionnier de la transformation immobilière et du recyclage urbain en France',
    labelText: 'Transformation',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '7% à 8%', label: 'Rendements estimés' },
      { value: 'Recyclage', label: 'Urbain' },
      { value: 'ISR', label: 'Labels' }
    ],
    benefits: [
      'Pionnier du recyclage urbain',
      'Transformation de friches',
      'Approche durable et ISR',
      'Performance attractive'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Remake ?',
      subtitle: 'Innovation urbaine',
      features: [
        { icon: 'Zap', title: 'Transformation', description: 'Spécialiste de la transformation de friches urbaines' },
        { icon: 'Leaf', title: 'Durable', description: 'Approche environnementale et ISR forte' },
        { icon: 'Target', title: 'Innovation', description: 'Pionnier du recyclage urbain' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements attractifs' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Remake',
      items: [
        { icon: 'Zap', title: 'SCPI Transformation', points: ['Recyclage urbain', 'Transformation de friches', 'Labels ISR', 'Performance attractive'] }
      ]
    },
    faq: [
      { question: 'Remake est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF pionnier de la transformation immobilière urbaine.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 58,
      'Allemagne': 18,
      'Pays-Bas': 12,
      'Espagne': 8,
      'Autres': 4
    },
    secteurs: {
      'Bureaux Verts': 45,
      'Commerces Durables': 25,
      'Santé': 15,
      'Logistique': 10,
      'Résidentiel': 5
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.6,
      title: `Simulez vos revenus Remake`,
      subtitle: `Immobilier durable et performant`,
      theme: 'green'
    }
},

  'sofidy-scpi': {
    slug: 'sofidy-scpi',
    title: 'SCPI Sofidy 2025 | Edissimmo, InterContinents, Immorente 2',
    metaDescription: 'Découvrez les SCPI Sofidy : Edissimmo (4.40%), InterContinents (4.70%). Gestionnaire historique avec 50 ans d\'expérience et 7 Mds€ d\'actifs.',
    heroTitle: 'SCPI Sofidy',
    heroTitleHighlight: 'Historique - 50 ans d\'expertise',
    heroSubtitle: 'Gestionnaire historique avec 7 milliards d\'actifs sous gestion et une expertise reconnue',
    labelText: 'Gestionnaire Historique',
    keyMetrics: [
      { value: '5+ SCPI', label: 'Au catalogue' },
      { value: '4.40% à 4.70%', label: 'Rendements 2024' },
      { value: '7 Mds€', label: 'Actifs sous gestion' },
      { value: '50 ans', label: 'Expérience' }
    ],
    benefits: [
      'Gestionnaire historique (50 ans)',
      '7 milliards d\'actifs sous gestion',
      'Portefeuille diversifié et stable',
      'Performance régulière'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Sofidy ?',
      subtitle: 'L\'expérience d\'un leader historique',
      features: [
        { icon: 'Award', title: '50 Ans', description: '50 ans d\'expérience en gestion immobilière' },
        { icon: 'Shield', title: '7 Mds€', description: '7 milliards d\'actifs sous gestion' },
        { icon: 'Building2', title: 'Diversification', description: 'Portefeuille diversifié sur tous secteurs' },
        { icon: 'TrendingUp', title: 'Stabilité', description: 'Performance régulière et dividendes stables' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Sofidy',
      items: [
        { icon: 'Building', title: 'Edissimmo', points: ['Rendement 2024 : 4.40%', 'Bureaux et commerces', 'Capitalisation : 2.1 Mds€', 'SCPI historique'] },
        { icon: 'Globe', title: 'InterContinents', points: ['Rendement 2024 : 4.70%', 'Bureaux Europe', 'Capitalisation : 1.4 Mds€', 'Diversification internationale'] }
      ]
    },
    faq: [
      { question: 'Sofidy est-elle fiable ?', answer: 'Absolument, Sofidy est un gestionnaire historique avec 50 ans d\'expérience et 7 Mds€ sous gestion. Solidité maximale.' },
      { question: 'Quelle SCPI Sofidy choisir ?', answer: 'Edissimmo pour bureaux/commerces France (4.40%), InterContinents pour l\'Europe (4.70%).' }
    ],
    temoignages: [
      { nom: 'Robert M., 68 ans', texte: 'Sofidy Edissimmo depuis 20 ans. Fiabilité totale et dividendes réguliers. Gestionnaire solide.', note: 5 }
    ],
    relatedScpi: ['edissimmo', 'intercontinents']
  ,
    geographie: {
      'France': 75,
      'Allemagne': 10,
      'Espagne': 8,
      'Autres': 7
    },
    secteurs: {
      'Bureaux': 50,
      'Commerces': 28,
      'Santé': 12,
      'Résidentiel': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 55000,
      defaultYield: 5.2,
      title: `Simulez vos revenus Sofidy`,
      subtitle: `Expertise patrimoniale française`,
      theme: 'blue'
    }
},

  'sogenial-immobilier-scpi': {
    slug: 'sogenial-immobilier-scpi',
    title: 'SCPI Sogenial Immobilier 2025 | Remake Live (7.70%), Immorente (4.35%)',
    metaDescription: 'Découvrez les SCPI Sogenial : Remake Live (7.70% - transformation urbaine), Immorente (4.35% - résidentiel). Filiale Crédit du Nord.',
    heroTitle: 'SCPI Sogenial Immobilier',
    heroTitleHighlight: 'Groupe Crédit du Nord',
    heroSubtitle: 'La solidité du groupe Crédit du Nord avec des SCPI innovantes et performantes',
    labelText: 'Groupe Bancaire',
    keyMetrics: [
      { value: '2+ SCPI', label: 'Principales' },
      { value: '4.35% à 7.70%', label: 'Rendements 2024' },
      { value: 'Crédit du Nord', label: 'Groupe' },
      { value: '1.2 Mds€', label: 'Actifs gérés' }
    ],
    benefits: [
      'Solidité du groupe Crédit du Nord',
      'Remake Live : 7.70% avec 0% frais',
      'Innovation : transformation immobilière',
      'Performance attractive'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Sogenial ?',
      subtitle: 'Innovation et solidité bancaire',
      features: [
        { icon: 'Shield', title: 'Groupe Bancaire', description: 'Solidité du groupe Crédit du Nord' },
        { icon: 'Zap', title: 'Innovation', description: 'Remake Live : pionnier de la transformation urbaine' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Remake Live affiche 7.70% avec 0% frais' },
        { icon: 'Building2', title: 'Diversification', description: 'Transformation urbaine et résidentiel' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Sogenial',
      items: [
        { icon: 'Zap', title: 'Remake Live', points: ['Rendement 2024 : 7.70%', '0% frais de souscription', 'Transformation urbaine', 'Capitalisation : 580 M€'] },
        { icon: 'Home', title: 'Immorente', points: ['Rendement 2024 : 4.35%', 'Résidentiel France', 'Capitalisation : 620 M€', 'Frais standards'] }
      ]
    },
    faq: [
      { question: 'Sogenial est-elle fiable ?', answer: 'Absolument, Sogenial est la filiale immobilière du groupe Crédit du Nord. Solidité financière maximale.' },
      { question: 'Pourquoi Remake Live affiche 7.70% ?', answer: 'Spécialisation sur la transformation urbaine (recyclage de friches), 0% frais de souscription, et stratégie opportuniste sur des actifs décotés.' }
    ],
    temoignages: [
      { nom: 'Claire T., 46 ans', texte: 'Remake Live : 7.70% sans frais d\'entrée ! Performance exceptionnelle et approche durable. Très satisfaite.', note: 5 }
    ],
    relatedScpi: ['remake-live', 'immorente']
  ,
    geographie: {
      'France': 70,
      'Allemagne': 12,
      'Espagne': 10,
      'Pays-Bas': 5,
      'Autres': 3
    },
    secteurs: {
      'Bureaux': 48,
      'Commerces': 27,
      'Santé': 15,
      'Logistique': 7,
      'Autres': 3
    }
,
    simulator: {
      defaultInvestment: 58000,
      defaultYield: 5.3,
      title: `Simulez vos revenus Sogenial`,
      subtitle: `Gestion prudente et stable`,
      theme: 'blue'
    }
},

  'swiss-life-am-france-scpi': {
    slug: 'swiss-life-am-france-scpi',
    title: 'SCPI Swiss Life AM France 2025 | Renovalys, Swiss Life Dynapierre',
    metaDescription: 'Découvrez les SCPI Swiss Life : Renovalys et Dynapierre. La puissance du groupe Swiss Life au service de l\'immobilier français.',
    heroTitle: 'SCPI Swiss Life AM France',
    heroTitleHighlight: 'Groupe Swiss Life',
    heroSubtitle: 'La solidité d\'un géant de l\'assurance appliquée à l\'immobilier',
    labelText: 'Groupe Swiss Life',
    keyMetrics: [
      { value: '2+ SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'Swiss Life', label: 'Groupe' },
      { value: '300 Mds€', label: 'Actifs groupe' }
    ],
    benefits: [
      'Puissance du groupe Swiss Life',
      'Solidité financière maximale',
      'Expertise immobilière reconnue',
      'Gestion patrimoniale long terme'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Swiss Life AM ?',
      subtitle: 'La solidité d\'un géant européen',
      features: [
        { icon: 'Shield', title: 'Groupe Leader', description: 'Swiss Life : leader européen de l\'assurance' },
        { icon: 'Award', title: 'Solidité', description: 'Solidité financière et réputation internationale' },
        { icon: 'Building2', title: 'Expertise', description: 'Équipes expertes en immobilier' },
        { icon: 'Target', title: 'Patrimonial', description: 'Vision long terme' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Swiss Life',
      items: [
        { icon: 'Building', title: 'Renovalys & Dynapierre', points: ['Immobilier tertiaire France', 'Rendements : 4% à 5%', 'Groupe Swiss Life', 'Gestion patrimoniale'] }
      ]
    },
    faq: [
      { question: 'Swiss Life AM est-elle fiable ?', answer: 'Absolument, Swiss Life est un géant européen de l\'assurance. Solidité financière maximale.' }
    ],
    temoignages: [
      { nom: 'François G., 60 ans', texte: 'Swiss Life pour la sécurité absolue. Groupe solide et performance régulière.', note: 5 }
    ],
    relatedScpi: ['renovalys']
  ,
    geographie: {
      'France': 46,
      'Allemagne': 23,
      'Pays-Bas': 14,
      'Espagne': 10,
      'Suisse': 5,
      'Autres': 2
    },
    secteurs: {
      'Bureaux': 52,
      'Commerces': 23,
      'Santé': 13,
      'Logistique': 10,
      'Résidentiel': 2
    }
,
    simulator: {
      defaultInvestment: 62000,
      defaultYield: 5.1,
      title: `Simulez vos revenus Swiss Life`,
      subtitle: `Solidité et performance`,
      theme: 'indigo'
    }
},

  'theoreim-scpi': {
    slug: 'theoreim-scpi',
    title: 'SCPI Théoreim 2025',
    metaDescription: 'Découvrez les SCPI Théoreim. Gestionnaire spécialisé en immobilier d\'entreprise et tertiaire.',
    heroTitle: 'SCPI Théoreim',
    heroTitleHighlight: 'Immobilier d\'entreprise',
    heroSubtitle: 'Gestionnaire spécialisé en immobilier tertiaire avec expertise reconnue',
    labelText: 'Gestionnaire',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'AMF', label: 'Agréé' },
      { value: 'Tertiaire', label: 'Focus' }
    ],
    benefits: [
      'Expertise tertiaire',
      'Gestion professionnelle',
      'AMF agréé',
      'Performance stable'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Théoreim ?',
      subtitle: 'Expertise immobilier entreprise',
      features: [
        { icon: 'Building2', title: 'Tertiaire', description: 'Spécialisation immobilier d\'entreprise' },
        { icon: 'Shield', title: 'AMF', description: 'Agréé et contrôlé' },
        { icon: 'Award', title: 'Expertise', description: 'Équipe professionnelle' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements réguliers' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Théoreim',
      items: [
        { icon: 'Building', title: 'SCPI', points: ['Immobilier d\'entreprise', 'Gestion professionnelle', 'Performance régulière', 'AMF agréé'] }
      ]
    },
    faq: [
      { question: 'Théoreim est-elle fiable ?', answer: 'Oui, gestionnaire agréé AMF avec expertise en immobilier d\'entreprise.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 44,
      'Allemagne': 22,
      'Pays-Bas': 15,
      'Espagne': 11,
      'Autres': 8
    },
    secteurs: {
      'Bureaux': 50,
      'Commerces': 24,
      'Santé': 13,
      'Logistique': 10,
      'Résidentiel': 3
    }
,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.4,
      title: `Simulez vos revenus Théoreim`,
      subtitle: `Immobilier européen diversifié`,
      theme: 'blue'
    }
},

  'urban-premium-scpi': {
    slug: 'urban-premium-scpi',
    title: 'SCPI Urban Premium 2025',
    metaDescription: 'Découvrez les SCPI Urban Premium. Gestionnaire spécialisé en immobilier premium urbain.',
    heroTitle: 'SCPI Urban Premium',
    heroTitleHighlight: 'Immobilier premium',
    heroSubtitle: 'Spécialiste de l\'immobilier premium dans les grandes métropoles',
    labelText: 'Premium',
    keyMetrics: [
      { value: '1-2 SCPI', label: 'Au catalogue' },
      { value: '4% à 5%', label: 'Rendements' },
      { value: 'Premium', label: 'Positionnement' },
      { value: 'Métropoles', label: 'Focus' }
    ],
    benefits: [
      'Focus immobilier premium',
      'Grandes métropoles',
      'Qualité des actifs',
      'Performance attractive'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi Urban Premium ?',
      subtitle: 'Excellence urbaine',
      features: [
        { icon: 'Award', title: 'Premium', description: 'Focus sur l\'immobilier haut de gamme' },
        { icon: 'MapPin', title: 'Métropoles', description: 'Emplacements premium en centre-ville' },
        { icon: 'Building2', title: 'Qualité', description: 'Actifs de qualité supérieure' },
        { icon: 'TrendingUp', title: 'Performance', description: 'Rendements attractifs' }
      ]
    },
    informationsPratiques: {
      title: 'Les SCPI Urban Premium',
      items: [
        { icon: 'Award', title: 'SCPI Premium', points: ['Immobilier haut de gamme', 'Centres-villes', 'Qualité supérieure', 'Performance attractive'] }
      ]
    },
    faq: [
      { question: 'Urban Premium est-elle fiable ?', answer: 'Oui, gestionnaire spécialisé dans l\'immobilier premium urbain.' }
    ],
    temoignages: [],
    relatedScpi: []
  ,
    geographie: {
      'France': 78,
      'Belgique': 10,
      'Luxembourg': 7,
      'Autres': 5
    },
    secteurs: {
      'Bureaux Urbains': 50,
      'Commerces Centre-Ville': 30,
      'Mixte': 12,
      'Résidentiel': 8
    }
,
    simulator: {
      defaultInvestment: 53000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Urban`,
      subtitle: `Immobilier urbain premium`,
      theme: 'green'
    }
}
};
