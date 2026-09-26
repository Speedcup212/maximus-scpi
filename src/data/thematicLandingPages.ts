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
    title: 'SCPI rendement 2026 : comparer les taux de distribution et les risques',
    metaDescription: 'Comparez les SCPI en 2026 : taux de distribution, frais, capitalisation, TOF, endettement, valeur de reconstitution et risques. Analyse MaximusSCPI.',
    heroTitle: 'Comparer les SCPI de rendement en 2026',
    heroTitleHighlight: 'Rendements moyens de 4% à 6%',
    heroSubtitle: 'Le taux de distribution ne suffit pas : comparez rendement, prix de part, TOF, endettement, liquidité et qualité du patrimoine.',
    labelText: 'Comparatif MaximusSCPI - Données 2026',
    senderGroupId: 'LM_SCPI_MeilleursRendements',
    keyMetrics: [
      { value: 'Variable', label: 'Distribution passée, non garantie' },
      { value: '63', label: 'SCPI analysées' },
      { value: '95%+', label: 'TOF moyen' }
    ],
    benefits: [
      'Sélection rigoureuse parmi 63 SCPI du marché',
      'Rendements moyens de 4% à 6%',
      'Diversification géographique et sectorielle',
      'Taux d\'occupation financier supérieur à 93%',
      'Labels ISR et investissement responsable'
    ],
    pourquoiChoisir: {
      title: 'Comment analyser les SCPI affichant les taux de distribution les plus élevés ?',
      subtitle: 'Une comparaison fondée sur plusieurs indicateurs, pas sur le seul taux de distribution',
      features: [
        {
          icon: 'trending-up',
          title: 'Rendements attractifs',
          description: 'Les taux de distribution varient fortement selon les SCPI et les années. Ils doivent être analysés avec les risques, les frais et l’évolution du prix de part.'
        },
        {
          icon: 'shield',
          title: 'Occupation et solidité à vérifier',
          description: 'Le TOF, la capitalisation, l’endettement, la qualité des actifs et la société de gestion doivent être lus ensemble ; aucun de ces indicateurs ne garantit la stabilité future.'
        },
        {
          icon: 'globe',
          title: 'Diversification à analyser',
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
      title: 'Informations pratiques pour comparer les SCPI de rendement',
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
            'Taux de distribution : variable selon les SCPI et les années',
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
        question: 'Comment comparer les SCPI de rendement en 2026 ?',
        answer: 'La SCPI Comète d\'Alderan a affiché un taux de distribution de 9,00% en 2025. Créée en 2023, elle investit à l\'international (Royaume-Uni, Espagne, Italie, Pays-Bas, Irlande, Pologne, Canada) avec un portefeuille diversifié. Son taux d\'occupation financier atteint 99,6% au 30 juin 2026, selon le bulletin périodique T2 2026 d\'Alderan.'
      },
      {
        question: 'Combien peut-on gagner avec 10 000€ investis dans ces SCPI ?',
        answer: 'À titre d\'illustration, un taux de distribution de 9,00% appliqué à 10 000€ correspondrait à 900€ bruts sur un an. Ce calcul ne constitue pas une prévision : le taux de 9,00% correspond à la performance 2025 de Comète et les distributions futures ne sont pas garanties. La fiscalité dépend notamment de l\'origine géographique des revenus et de la situation de l\'investisseur.'
      },
      {
        question: 'Les SCPI à haut rendement sont-elles plus risquées ?',
        answer: 'Un rendement élevé peut refléter différents facteurs : SCPI récente en phase de collecte, stratégie internationale, niveau de risque immobilier ou politique de distribution. La diversification géographique et sectorielle peut réduire certains risques de concentration sans supprimer le risque de perte en capital. Pour Comète, le TOF publié au 30 juin 2026 est de 99,6%.'
      },
      {
        question: 'Peut-on investir dans plusieurs SCPI du Top 5 ?',
        answer: 'Diversifier plusieurs SCPI peut réduire la concentration sur un seul gestionnaire, secteur ou pays, sans supprimer le risque de perte en capital. La pondération doit dépendre de votre horizon, de votre fiscalité, de la liquidité recherchée et des caractéristiques de chaque SCPI.'
      },
      {
        question: 'Quels sont les frais à prévoir pour investir dans ces SCPI ?',
        answer: 'Les frais varient selon les SCPI : Comète et Transitions Europe ont 10% de frais de souscription, Remake Live 0% (compensés par des frais de gestion plus élevés). Ajoutez environ 10-12% de frais de gestion annuels (déjà déduits du rendement affiché). Sur 10 ans, les frais d\'entrée sont amortis par les rendements élevés.'
      }
    ],
    temoignages: [],
    relatedScpi: ['comete', 'transitions-europe', 'epargne-pierre-europe', 'remake-live', 'iroko-zen', 'coeur-d-europe', 'lf-europimmo', 'paref-evo', 'perial-hospitalite-europe', 'atream-hotel', 'log-in']
  },
  'scpi-fiscales': {
    slug: 'scpi-fiscales',
    title: 'SCPI Fiscales 2026 | Réduire ses Impôts avec Malraux et Déficit Foncier',
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
            'Intérêt fiscal à analyser selon la TMI et l’origine géographique des revenus',
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
    relatedScpi: ['ncap-regions', 'ncap-education-sante', 'ncap-continent', 'novaxia-neo', 'urban-coeur-de-commerce']
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
    title: 'Préparer sa retraite avec les SCPI | Revenus, fiscalité et risques',
    metaDescription: 'SCPI et retraite : analyse des revenus potentiels, de la fiscalité, du démembrement, de la liquidité et des principaux risques avant d’investir.',
    heroTitle: 'Préparez Votre Retraite avec les SCPI',
    heroTitleHighlight: 'Construisez progressivement une stratégie de revenus complémentaires',
    heroSubtitle: 'Les SCPI peuvent contribuer à diversifier un patrimoine et à rechercher des revenus complémentaires à la retraite, sans garantie de rendement ni de liquidité.',
    labelText: 'Stratégie retraite - À adapter à votre situation',
    senderGroupId: 'LM_SCPI_PreparerRetraite',
    keyMetrics: [
      { value: 'Long terme', label: 'Horizon à privilégier' },
      { value: 'Variable', label: 'Distribution non garantie' },
      { value: 'Limitée', label: 'Liquidité des parts' }
    ],
    benefits: [
      'Recherche de revenus complémentaires, non garantis',
      'Capital transmissible à vos héritiers',
      'Pas de gestion locative',
      'Diversification immobilière selon la SCPI choisie',
      'Stratégie à calibrer selon l\'âge, la fiscalité et l\'horizon'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi les SCPI pour préparer sa retraite ?',
      subtitle: 'Une brique patrimoniale possible pour rechercher des revenus complémentaires à long terme',
      features: [
        {
          icon: 'trending-up',
          title: 'Objectif de revenus réguliers',
          description: 'Les SCPI peuvent distribuer des revenus trimestriels ou mensuels selon les véhicules. Leur montant et leur régularité ne sont pas garantis et dépendent notamment des loyers encaissés, du taux d’occupation et de la gestion du patrimoine.'
        },
        {
          icon: 'shield',
          title: 'Gestion immobilière déléguée',
          description: 'La société de gestion prend en charge la gestion locative et immobilière. L’investisseur reste exposé aux frais, aux travaux supportés par la SCPI, au risque de vacance et à la variation de la valeur des parts.'
        },
        {
          icon: 'calculator',
          title: 'Constitution progressive',
          description: 'L’investissement peut être progressif selon les conditions propres à chaque SCPI ou contrat. Les projections à long terme dépendent des distributions, du prix des parts, des frais, de la fiscalité et d’un éventuel réinvestissement des revenus.'
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
            '30-40 ans : horizon long et capacité d’épargne à analyser',
            '40-50 ans : diversification et fiscalité à recalibrer',
            '50-60 ans : liquidité, démembrement et date de retraite à croiser',
            'Retraités : besoin de revenus, liquidité et transmission à arbitrer'
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
            'Montant minimum variable selon la SCPI ou le contrat',
            'Versements programmés possibles sur certains supports',
            'Projection à simuler selon rendement, frais et fiscalité',
            'Revenus et valeur des parts non garantis'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'À quel âge commencer à investir en SCPI pour la retraite ?',
        answer: 'Il n’existe pas d’âge universel. L’intérêt dépend surtout de l’horizon de placement, de l’épargne de précaution, de la fiscalité, de l’endettement et du besoin futur de liquidité. Un horizon long peut être cohérent avec la nature immobilière des SCPI, mais le montant investi doit rester compatible avec l’ensemble du patrimoine.'
      },
      {
        question: 'Les SCPI sont-elles meilleures qu\'un PER pour la retraite ?',
        answer: 'PER et SCPI répondent à des logiques différentes. Le PER peut procurer une déduction fiscale à l’entrée sous conditions et comporte des règles de disponibilité spécifiques. Les SCPI exposent à l’immobilier, avec revenus et valeur non garantis et une liquidité limitée. L’arbitrage dépend de la TMI, de l’horizon, du besoin de disponibilité et du reste du patrimoine.'
      },
      {
        question: 'Quel complément de revenu puis-je espérer avec les SCPI ?',
        answer: 'Il faut partir du capital réellement investi, du taux de distribution retenu comme hypothèse, des frais, de la fiscalité et d’une éventuelle évolution du prix de part. Une simulation doit présenter plusieurs scénarios et rappeler que les distributions futures ne sont pas garanties.'
      },
      {
        question: 'Que deviennent mes parts de SCPI après mon décès ?',
        answer: 'Les parts détenues en direct entrent en principe dans la succession et leur traitement dépend de la situation civile et fiscale du détenteur. Donation, démembrement et assurance-vie peuvent modifier les modalités de transmission ; leur intérêt doit être vérifié au cas par cas, notamment selon l’âge des versements et la clause bénéficiaire.'
      }
    ],
    temoignages: [],
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
    title: 'SCPI et revenu complémentaire : rendement, fiscalité et risques',
    metaDescription: 'SCPI et revenu complémentaire : estimez les distributions potentielles selon capital, rendement, frais et fiscalité, avec les risques de liquidité et de perte en capital.',
    heroTitle: 'Générez un Revenu Complémentaire',
    heroTitleHighlight: 'Simulez des revenus potentiels, non garantis',
    heroSubtitle: 'Les SCPI peuvent verser des distributions mensuelles ou trimestrielles selon les véhicules, sans garantie de montant ni de régularité.',
    labelText: 'Revenus complémentaires - Hypothèses à analyser',
    senderGroupId: 'LM_SCPI_RevenuComplementaire',
    keyMetrics: [
      { value: 'Variable', label: 'Revenu selon hypothèses' },
      { value: '100 000€', label: 'Capital investi' },
      { value: 'Non garanti', label: 'Distribution future' }
    ],
    benefits: [
      'Distributions mensuelles ou trimestrielles selon la SCPI',
      'Taux de distribution variables selon les SCPI et les années',
      'Aucune gestion locative',
      'Liquidité limitée et dépendante du marché des parts',
      'Diversification immobilière selon la composition de la SCPI'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi générer un revenu complémentaire avec les SCPI ?',
      subtitle: 'Une solution à comparer avec les autres sources de revenus et de liquidité',
      features: [
        {
          icon: 'dollar-sign',
          title: 'Distributions potentielles',
          description: 'Les distributions peuvent être mensuelles ou trimestrielles selon la SCPI. Leur montant varie avec les loyers encaissés, les charges, l’occupation et les décisions de distribution.'
        },
        {
          icon: 'trending-up',
          title: 'Rendements attractifs',
          description: 'Les revenus doivent être simulés à partir d’hypothèses de distribution explicites, puis corrigés des frais et de la fiscalité. Les performances passées ne garantissent pas les distributions futures.'
        },
        {
          icon: 'calendar',
          title: 'Versements réguliers',
          description: 'Les SCPI peuvent distribuer mensuellement ou trimestriellement selon la société de gestion. La fréquence ne rend pas le niveau de revenu prévisible ou garanti.'
        },
        {
          icon: 'shield',
          title: 'Gestion immobilière déléguée',
          description: 'La société de gestion prend en charge la gestion locative et immobilière. L’associé reste exposé aux frais, à la vacance, aux travaux supportés par la SCPI, à la baisse des distributions et à la liquidité.'
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
            'Consultez notre comparateur pour analyser les SCPI selon plusieurs critères',
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
        answer: 'La gestion immobilière est déléguée à la société de gestion, mais l’investissement n’est pas sans contraintes : frais, fiscalité, risque locatif, variation du prix de part et liquidité restent à la charge économique de l’associé.'
      },
      {
        question: 'Peut-on réinvestir ses revenus de SCPI ?',
        answer: 'Le réinvestissement des distributions est possible selon le mode de détention et peut accroître progressivement le nombre de parts. Son intérêt dépend toutefois des frais, de la fiscalité, de l’évolution du prix des parts et des distributions futures, qui ne sont pas garanties.'
      },
      {
        question: 'Quelle différence entre SCPI et immobilier locatif direct ?',
        answer: 'Les SCPI délèguent la gestion immobilière et peuvent offrir une diversification plus large qu’un bien locatif unique. En contrepartie, l’investisseur supporte des frais, une liquidité limitée, un risque de perte en capital et n’a pas la maîtrise directe des actifs.'
      }
    ],
    temoignages: [],
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
    title: 'Comparateur SCPI 2026 : Comparez 63 SCPI (Rendement, Frais, Secteur)',
    metaDescription: 'Comparez les meilleures SCPI en temps réel : rendements, frais, capitalisation, secteur et géographie. Outil gratuit par un conseiller certifié ORIAS.',
    heroTitle: 'Comparateur SCPI',
    heroTitleHighlight: '63 SCPI à comparer',
    heroSubtitle: 'Comparez les performances de toutes les SCPI du marché français',
    labelText: 'Comparaison Gratuite',
    keyMetrics: [
      { value: '63', label: 'SCPI analysées' },
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
          title: '63 SCPI comparées',
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
    temoignages: [],
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
  'scpi-bureaux': {
    slug: 'scpi-bureaux',
    title: 'SCPI bureaux : analyse, comparaison et points de vigilance | MaximusSCPI',
    metaDescription: 'Comprendre les SCPI spécialisées en bureaux : secteurs, caractéristiques, points de vigilance. Analyse pédagogique et comparaison indicative.',
    heroTitle: 'SCPI Bureaux',
    heroTitleHighlight: 'Analyser l\'immobilier tertiaire',
    heroSubtitle: 'Comprendre les SCPI investies en bureaux : secteurs, zones géographiques et points de vigilance pour votre portefeuille',
    labelText: 'Secteur Bureaux - Analyse pédagogique',
    keyMetrics: [
      { value: '15+', label: 'SCPI bureaux référencées' },
      { value: 'Variable', label: 'Distribution passée non garantie' },
      { value: '95%', label: 'TOF moyen (indicatif)' }
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
          title: 'Distributions historiques',
          description: 'Les taux de distribution passés varient selon les SCPI et les années. Ils ne sont pas garantis et ne préjugent pas des performances futures.'
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
            'Distribution passée : variable selon les SCPI (non garantie)',
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
        answer: 'Les taux de distribution des SCPI bureaux varient selon les SCPI et les années. Ils proviennent des loyers versés par les entreprises locataires et sont généralement distribués trimestriellement. Ces données passées ne préjugent pas des performances futures et ne sont pas garanties.'
      }
    ],
    temoignages: [],
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

  'scpi-commerces': {
    slug: 'scpi-commerces',
    title: 'SCPI commerces : analyse, comparaison et points de vigilance | MaximusSCPI',
    metaDescription: 'Comprendre les SCPI investies en commerces : pieds d\'immeubles, retail parks, centres commerciaux. Analyse pédagogique et comparaison indicative.',
    heroTitle: 'SCPI Commerces',
    heroTitleHighlight: 'Analyser le retail immobilier',
    heroSubtitle: 'Comprendre les SCPI investies en commerces : formats, zones géographiques et points de vigilance pour votre portefeuille',
    labelText: 'Secteur Commerce - Analyse pédagogique',
    keyMetrics: [
      { value: '8+', label: 'SCPI commerces référencées' },
      { value: 'Variable', label: 'Distribution passée non garantie' },
      { value: '93%', label: 'TOF moyen (indicatif)' }
    ],
    benefits: [
      'Diversification sur plusieurs formats de commerce',
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
          title: 'Loyers commerciaux',
          description: 'Les loyers commerciaux constituent la source de distribution des SCPI commerces. Les taux de distribution passés varient selon les SCPI et ne sont pas garantis.'
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
            'Distribution passée : variable selon les SCPI (non garantie)',
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
        question: 'Quelle est la structure des loyers dans les SCPI commerces ?',
        answer: 'Les loyers commerciaux sont encadrés par des baux 3-6-9, souvent indexés sur l\'Indice des Loyers Commerciaux (ILC). Leur niveau dépend de l\'emplacement, du locataire et des conditions du marché. Les taux de distribution passés ne préjugent pas des performances futures.'
      },
      {
        question: 'Les SCPI commerces sont-elles adaptées à tous les profils ?',
        answer: 'Les SCPI commerces peuvent convenir à des investisseurs cherchant une diversification sectorielle sur le commerce physique. Elles présentent un risque de vacance locative et de perte en capital. Une analyse de votre situation patrimoniale est nécessaire avant toute décision.'
      }
    ],
    temoignages: [],
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

  'scpi-sante': {
    slug: 'scpi-sante',
    title: 'SCPI santé : analyse, comparaison et points de vigilance | MaximusSCPI',
    metaDescription: 'Comprendre les SCPI investies dans l\'immobilier de santé : cliniques, EHPAD, résidences médicalisées. Analyse pédagogique et comparaison indicative.',
    heroTitle: 'SCPI Santé',
    heroTitleHighlight: 'Analyser l\'immobilier médical',
    heroSubtitle: 'Comprendre les SCPI investies dans l\'immobilier de santé : types d\'actifs, baux et points de vigilance pour votre portefeuille',
    labelText: 'Secteur Santé - Analyse pédagogique',
    keyMetrics: [
      { value: '6+', label: 'SCPI santé référencées' },
      { value: 'Variable', label: 'Distribution passée non garantie' },
      { value: '98%', label: 'TOF moyen (indicatif)' }
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
          title: 'Distributions historiques',
          description: 'Les taux de distribution passés des SCPI santé varient selon les SCPI et les années. Revenus non garantis, risque de perte en capital et liquidité limitée.'
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
            'Distribution passée : variable selon les SCPI (non garantie)',
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
        question: 'Les SCPI santé sont-elles moins risquées ?',
        answer: 'Les SCPI santé présentent des caractéristiques défensives : baux longue durée (9-12 ans), locataires professionnels du secteur médical et demande structurelle liée au vieillissement de la population. Cependant, elles restent soumises au risque de perte en capital, de vacance locative et de liquidité limitée, comme toute SCPI.'
      },
      {
        question: 'Comment sont construits les taux de distribution des SCPI santé ?',
        answer: 'Les distributions proviennent des loyers perçus sur les actifs de santé. Leur niveau dépend de l\'occupation, des baux en cours et de la gestion des actifs. Les données passées ne préjugent pas des performances futures et ne constituent pas une garantie de revenus.'
      },
      {
        question: 'Quel est l\'impact de la réglementation sur les EHPAD ?',
        answer: 'Les SCPI santé sélectionnent rigoureusement leurs actifs et privilégient les exploitants de qualité conformes aux normes. La réglementation renforce la qualité du secteur et assure la pérennité des investissements.'
      }
    ],
    temoignages: [],
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
    title: 'SCPI sans frais d’entrée : comparer les coûts en 2026',
    metaDescription: 'SCPI sans frais d’entrée : comparez commission de souscription, frais de gestion, frais de sortie, durée de détention, liquidité et rendement net avant de choisir.',
    heroTitle: 'SCPI sans frais d’entrée : que faut-il vraiment comparer ?',
    heroTitleHighlight: 'Le coût total compte plus que le seul 0 % à l’entrée',
    heroSubtitle: 'L’absence de commission de souscription ne signifie pas absence de frais : analysez l’ensemble des coûts et les conditions de sortie.',
    labelText: 'Comparatif des frais - Données à vérifier par SCPI',
    senderGroupId: 'LM_SCPI_SansFrais',
    keyMetrics: [
      { value: '0%', label: 'Frais minimum' },
      { value: 'Variables', label: 'Autres frais selon la SCPI' },
      { value: 'Long terme', label: 'Horizon généralement adapté' }
    ],
    benefits: [
      'Comprendre l\'impact des frais sur votre rendement',
      'SCPI sans commission de souscription : avantages et limites',
      'SCPI avec frais : ce qu\'ils financent réellement',
      'Comparaison du coût total sur plusieurs horizons',
      'Conseil personnalisé selon votre situation'
    ],
    pourquoiChoisir: {
      title: 'Pourquoi comparer les frais des SCPI ?',
      subtitle: 'Les frais impactent directement votre rentabilité',
      features: [
        {
          icon: 'calculator',
          title: 'Impact du coût total',
          description: 'La commission de souscription, les frais de gestion, les éventuels frais de sortie et la durée de détention doivent être comparés ensemble. Aucun point d’équilibre universel ne s’applique à toutes les SCPI.'
        },
        {
          icon: 'trending-up',
          title: 'SCPI sans frais (0%)',
          description: 'Une commission de souscription à 0 % réduit le coût d’entrée, mais d’autres frais peuvent s’appliquer. Leur niveau doit être vérifié dans la documentation de chaque SCPI.'
        },
        {
          icon: 'shield',
          title: 'SCPI avec frais (8-12%)',
          description: 'Les SCPI avec commission de souscription peuvent présenter une structure de frais différente. Leur intérêt dépend du rendement, des autres frais, de la durée de détention et du prix de sortie.'
        },
        {
          icon: 'file-text',
          title: 'Transparence totale',
          description: 'L’analyse doit intégrer souscription, gestion, cession, acquisition, arbitrage éventuel et conditions de retrait à partir des documents de la SCPI.'
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
            '✅ Pas de commission de souscription lorsqu’elle est réellement fixée à 0 %',
            '✅ Coût d’entrée réduit',
            '⚠️ Frais de gestion et autres frais à comparer',
            '⚠️ Conditions de sortie et durée de détention à vérifier'
          ]
        },
        {
          icon: 'bar-chart',
          title: 'SCPI Avec Frais (8-12%)',
          points: [
            '✅ Structure de frais parfois différente selon les véhicules',
            '✅ Rentabilité à comparer sur un horizon long, après frais',
            '⚠️ Commission de souscription pouvant être significative',
            '⚠️ Horizon long nécessaire pour apprécier le coût total'
          ]
        },
        {
          icon: 'calculator',
          title: 'Méthode de comparaison',
          points: [
            'Comparer le montant réellement investi et la valeur de retrait',
            'Comparer les frais de gestion sur la même base de rendement',
            'Tester plusieurs durées de détention et scénarios de distribution',
            'Intégrer l’évolution possible du prix des parts et les frais de sortie'
          ]
        }
      ]
    },
    faq: [
      {
        question: 'Quelle est la différence entre une SCPI sans frais et avec frais ?',
        answer: 'Une SCPI dite « sans frais d’entrée » affiche généralement une commission de souscription nulle. Cela ne signifie pas qu’elle est sans frais : frais de gestion, d’acquisition, de cession ou de retrait peuvent exister. Il faut comparer le coût total à partir de la note d’information.'
      },
      {
        question: 'Les SCPI sans frais sont-elles vraiment plus avantageuses ?',
        answer: 'Pas nécessairement. L’absence de commission de souscription est un avantage de coût à l’entrée, mais le résultat dépend du taux de distribution, des autres frais, de l’évolution du prix de part, de la fiscalité et des conditions de sortie.'
      },
      {
        question: 'Combien de temps faut-il pour amortir les frais d\'entrée ?',
        answer: 'Il n’existe pas de durée universelle d’amortissement. Elle dépend notamment de la commission de souscription, du taux de distribution, des frais récurrents, du prix de retrait et de l’évolution de la valeur de la part. Une simulation par scénarios est préférable.'
      },
      {
        question: 'Comment comparer les SCPI sans frais ?',
        answer: 'Comparez au minimum la commission de souscription, les frais de gestion, les frais liés aux acquisitions ou cessions, le taux de distribution, le TOF, l’endettement, la valeur de reconstitution, la liquidité et l’horizon recommandé.'
      },
      {
        question: 'Comment choisir entre SCPI avec et sans frais ?',
        answer: 'Le choix doit reposer sur le coût total, l’horizon, la liquidité, le niveau de risque, la qualité du patrimoine et la fiscalité. Le seul niveau des frais d’entrée ne permet pas de conclure.'
      }
    ],
    temoignages: [],
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
  'scpi-france': {
    slug: 'scpi-france',
    title: 'SCPI France : analyse, comparaison et points de vigilance | MaximusSCPI',
    metaDescription: 'Comprendre les SCPI investies en France : Paris, Lyon, Bordeaux, grandes métropoles. Analyse pédagogique et comparaison indicative.',
    heroTitle: 'SCPI France',
    heroTitleHighlight: 'Analyser l\'immobilier français',
    heroSubtitle: 'Comprendre les SCPI investies sur le marché français : zones géographiques, secteurs et points de vigilance pour votre portefeuille',
    labelText: 'Géographie France - Analyse pédagogique',
    keyMetrics: [
      { value: '25+', label: 'SCPI France référencées' },
      { value: 'Variable', label: 'Distribution passée non garantie' },
      { value: '94%', label: 'TOF moyen (indicatif)' }
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
          title: 'Distributions historiques',
          description: 'Les taux de distribution varient selon les SCPI et les secteurs (bureaux, commerces, santé, logistique). Ces données passées ne sont pas garanties et ne préjugent pas des performances futures.'
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
            'Distribution passée : variable selon les SCPI (non garantie)',
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
        answer: 'Les SCPI France et européennes présentent des niveaux de distribution historiques comparables, mais ces données passées ne sont pas garanties. La principale différence réside dans l\'absence de risque de change pour les SCPI France et la concentration sur le marché domestique, ce qui peut être un avantage ou un inconvénient selon votre stratégie.'
      },
      {
        question: 'Quelle fiscalité pour les SCPI France ?',
        answer: 'Les revenus sont imposés comme des revenus fonciers au barème progressif de l\'impôt sur le revenu, avec possibilité de déduire les charges. Les plus-values à la revente sont soumises à la fiscalité des plus-values immobilières.'
      }
    ],
    temoignages: [],
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
    title: 'SCPI Alderan 2026 | Comète - Expertise et Performance',
    metaDescription: 'Découvrez les SCPI gérées par Alderan. Société de gestion innovante spécialisée dans l\'immobilier européen avec des rendements attractifs.',
    heroTitle: 'SCPI Alderan',
    heroTitleHighlight: 'L\'excellence de la gestion immobilière',
    heroSubtitle: 'Alderan gère la SCPI Comète avec un taux de distribution 2026 de 9,00% et une stratégie internationale diversifiée',
    labelText: 'Gestionnaire Premium - Innovation',
    keyMetrics: [
      { value: '1', label: 'SCPI gérée' },
      { value: '9,00%', label: 'Taux de distribution 2026' },
      { value: '2023', label: 'Création Comète' }
    ],
    benefits: [
      'Gestionnaire innovant et dynamique',
      'Stratégie internationale diversifiée (7 pays)',
      'SCPI Comète : distribution 2026 de 9,00%',
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
          description: 'La SCPI Comète affiche un taux de distribution 2026 de 9,00%, soutenu par une stratégie immobilière internationale diversifiée'
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
            'Taux de distribution 2026 : 9,00%',
            'TOF : 99,1% (T4 2026)',
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
        answer: 'Alderan est une société de gestion agréée AMF spécialisée dans l\'immobilier tertiaire international. Elle gère actuellement la SCPI Comète, créée en 2023, avec un taux de distribution 2026 de 9,00% et un TOF de 99,1%. Alderan se distingue par une approche innovante et une stratégie internationale ambitieuse.'
      },
      {
        question: 'Pourquoi la SCPI Comète d\'Alderan a-t-elle un rendement si élevé ?',
        answer: 'Le taux de distribution 2026 de Comète (9,00%) s\'explique par plusieurs facteurs : une stratégie internationale diversifiée sur 7 pays, une sélection rigoureuse d\'actifs, et une phase de collecte dynamique. C\'est une SCPI récente (2023) en forte croissance avec un TOF de 99,1% au T4 2026.'
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
    temoignages: [],
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
    title: 'SCPI Arkéa REIM 2026 | Transitions Europe - Expertise Immobilière',
    metaDescription: 'Découvrez les SCPI gérées par Arkéa REIM. Groupe Arkéa, solidité financière et expertise reconnue en immobilier européen.',
    heroTitle: 'SCPI Arkéa REIM',
    heroTitleHighlight: 'La puissance du Groupe Arkéa',
    heroSubtitle: 'Arkéa REIM gère la SCPI Transitions Europe avec 7,6% de rendement, zéro endettement et une stratégie durable',
    labelText: 'Gestionnaire Groupe Bancaire - Solidité',
    keyMetrics: [
      { value: '1', label: 'SCPI phare' },
      { value: '7,6%', label: 'Rendement' },
      { value: '0%', label: 'Endettement' }
    ],
    benefits: [
      'Filiale du Groupe Arkéa (solidité financière)',
      'SCPI Transitions Europe : 7,6% de rendement',
      'Absence d’endettement : réduction du risque de taux, sans supprimer les autres risques',
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
          description: 'Arkéa REIM est la filiale immobilière du Groupe Arkéa, groupe bancaire coopératif français. Cette appartenance constitue un élément de contexte sur l’actionnariat et la gouvernance, sans garantir la performance ni la solidité future de la SCPI'
        },
        {
          icon: 'trending-up',
          title: 'Performance éprouvée',
          description: 'L’absence d’endettement réduit l’exposition au risque de taux et à l’effet de levier. Elle ne garantit ni la valeur des parts ni le niveau futur des distributions.'
        },
        {
          icon: 'leaf',
          title: 'Engagement ESG fort',
          description: 'Transitions Europe est labellisée ISR et Article 8 SFDR. La stratégie intègre pleinement les enjeux de transition énergétique et environnementale'
        },
        {
          icon: 'globe',
          title: 'Diversification européenne',
          description: 'La répartition sur plusieurs pays vise à diversifier l’exposition géographique ; son efficacité dépend du poids réel de chaque marché et de la qualité des actifs.'
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
            'Rendement 2024 : 7,6%',
            'Zéro endettement (risque de taux direct limité)',
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
        answer: 'L’absence d’endettement limite le risque de taux et l’effet de levier financier. Elle ne supprime toutefois ni le risque immobilier, ni la vacance, ni le risque de baisse des distributions ou du prix des parts.'
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
    temoignages: [],
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
    title: 'SCPI La Française REM 2026 | Leader Français - Expertise Reconnue',
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
            'Diversification à analyser',
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
        answer: 'Le choix dépend du profil recherché : diversification, exposition géographique, secteurs, endettement, frais, liquidité et historique des distributions doivent être comparés avant toute allocation.'
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
    temoignages: [],
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
    title: 'SCPI Atland Voisin 2026 | Épargne Pierre Europe - Expertise Patrimoniale',
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
            'Zéro endettement (réduction de certains risques)',
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
        answer: 'L’absence d’endettement limite le risque de taux et l’effet de levier financier. Elle ne garantit ni la pérennité de la distribution, ni la valeur des parts, ni la liquidité.'
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
    temoignages: [],
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
    title: 'SCPI et Recyclage Urbain 2026 | Investir dans la Transformation Immobilière',
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
          description: 'Le recyclage urbain se concentre sur des zones déjà urbanisées, souvent en centre-ville ou proche des transports. Ces localisations peuvent soutenir la demande locative, sans la garantir.'
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
        answer: 'Le ticket d\'entrée varie selon les SCPI : Remake Live démarre à 1 000€, Transitions Europe à 5 000€, Comète à 5 000€. Pour une diversification à analyser, investissez au minimum 10 000€ à 15 000€ répartis sur 2 SCPI spécialisées. Horizon recommandé : 8 à 10 ans minimum pour bénéficier pleinement de la revalorisation des actifs réhabilités.'
      },
      {
        question: 'Le recyclage urbain concerne-t-il tous les types d\'immobilier ?',
        answer: 'Principalement les bureaux obsolètes (transformation en logements), les friches industrielles (conversion en commerces/loisirs/logements), les parkings sous-utilisés (logements ou espaces verts), et les bâtiments publics désaffectés (écoles, hôpitaux). Le secteur tertiaire (bureaux) est le plus concerné avec 30% des surfaces à réhabiliter d\'ici 2030 selon les estimations.'
      }
    ],
    temoignages: [],
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
    title: 'SCPI Aestiam 2026 | Pierre Rendement (5.04%), Cap Hebergimmo (4.55%), Placement Pierre (4.85%)',
    metaDescription: 'Aestiam : gestionnaire historique de SCPI avec 30 ans d\'expérience et 3.5 Mds€ d\'actifs. Découvrez Pierre Rendement (5.04%), Cap Hebergimmo (4.55%), Placement Pierre (4.85%). Rendements stables, diversification secteur/géo, taux d\'occupation élevé. Guide complet 2026.',
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
        { icon: 'Building2', title: 'Diversification à analyser', description: 'Portefeuille diversifié sur 3 secteurs : bureaux (40%), commerces (35%), santé (25%). Répartition géographique équilibrée en France. Plus de 150 actifs immobiliers différents.' }
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
      { question: 'Quelle SCPI Aestiam choisir en 2026 ?', answer: 'Pierre Rendement (5.04%) pour un mix bureaux/commerces équilibré et le meilleur rendement. Cap Hebergimmo (4.55%) pour l\'exposition exclusive au secteur santé (résilient, baux longs). Placement Pierre (4.85%) pour les commerces et retail. Pour un investissement optimal, diversifiez sur 2 SCPI : Pierre Rendement + Cap Hebergimmo pour combiner performance et résilience.' },
      { question: 'Aestiam est-elle fiable et sécurisée ?', answer: 'Oui, Aestiam est un gestionnaire historique agréé AMF avec 30 ans d\'expérience (depuis 1993) et 3.5 Mds€ sous gestion. La société affiche une gestion prudente avec un faible endettement (<30%), des taux d\'occupation élevés (>95%), et une sélection rigoureuse des actifs. Performance stable depuis 30 ans avec distribution régulière de dividendes. Aestiam est considéré comme un acteur de référence sur le marché français de la SCPI.' },
      { question: 'Quel est le ticket d\'entrée minimum chez Aestiam ?', answer: 'Le ticket d\'entrée minimum varie selon la SCPI : Pierre Rendement (10 parts × 225€ = 2 250€), Cap Hebergimmo (10 parts × 180€ = 1 800€), Placement Pierre (10 parts × 200€ = 2 000€). Vous pouvez investir via plusieurs modes : comptant, crédit, démembrement, ou assurance-vie. Les frais de souscription sont de 10% à 10.16% HT.' },
      { question: 'Comment sont distribués les revenus des SCPI Aestiam ?', answer: 'Les dividendes sont distribués trimestriellement (janvier, avril, juillet, octobre) directement sur votre compte bancaire. Pierre Rendement distribue environ 12.60€/part/an, Cap Hebergimmo 8.50€/part/an, Placement Pierre 10.20€/part/an. Les revenus proviennent des loyers perçus sur les actifs immobiliers, après déduction des charges et frais de gestion (environ 12% HT).' },
      { question: 'Peut-on revendre ses parts Aestiam facilement ?', answer: 'Les SCPI Aestiam bénéficient d\'un marché secondaire actif. Pierre Rendement et Placement Pierre affichent généralement des délais de cession de 2 à 6 mois. Cap Hebergimmo peut nécessiter 4 à 8 mois. Le prix de cession peut être légèrement inférieur au prix de souscription (-5% à -10%). Pour une liquidité optimale, privilégiez Pierre Rendement qui est la plus liquide. Le démembrement temporaire peut améliorer la liquidité.' }
    ],
    temoignages: [],
    relatedScpi: ['aestiam-pierre-rendement', 'aestiam-cap-hebergimmo']
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
    title: 'SCPI Altixia REIM 2026 | Commerces, Cadence 12, Convictions',
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
    temoignages: [],
    relatedScpi: ['altixia-commerces', 'altixia-cadence-12']
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
    title: 'SCPI Amundi Immobilier 2026 | Primo et AgriNova',
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
        { icon: 'Shield', title: 'Gouvernance et adossement', description: 'Éléments à analyser avec la qualité de gestion, les actifs et les risques propres à chaque SCPI' },
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
      { question: 'Pourquoi choisir Amundi vs autres gestionnaires ?', answer: 'L’adossement et la réputation du gestionnaire sont des critères parmi d’autres ; ils ne garantissent ni la performance, ni la liquidité, ni la valeur du capital.' }
    ],
    temoignages: [],
    relatedScpi: ['edissimo', 'rivoli-avenir-patrimoine']
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
    title: 'SCPI Atream 2026 | Pierre Capitale, Eurovalys',
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
    temoignages: [],
    relatedScpi: ['atream-hotel']
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
    title: 'SCPI Consultim Asset Management 2026',
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
    relatedScpi: ['buroboutic-metropoles', 'ficommerce-proximite', 'selectipierre-2']
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


  'kyaneos-asset-management-scpi': {
    slug: 'kyaneos-asset-management-scpi',
    title: 'SCPI Kyaneos Asset Management 2026',
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
    relatedScpi: ['novaxia-neo', 'immorente']
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
    title: 'SCPI Paref Gestion 2026',
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
    relatedScpi: ['perial-grand-paris', 'perial-o2', 'perial-hospitalite-europe']
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
    title: 'SCPI Praemia REIM France 2026 | Pierre Patrimoine, Interpierre',
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
    relatedScpi: ['efimmo-1', 'immorente']
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
    title: 'SCPI Sogenial Immobilier 2026 | Remake Live (7.70%), Immorente (4.35%)',
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
    temoignages: [],
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
    title: 'SCPI Swiss Life AM France 2026 | Renovalys, Swiss Life Dynapierre',
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
    temoignages: [],
    relatedScpi: ['esg-pierre-capital']
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
    title: 'SCPI Théoreim 2026',
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
    relatedScpi: ['log-in']
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
    title: 'SCPI Urban Premium 2026',
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
    relatedScpi: ['urban-coeur-de-commerce']
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
