export interface SCPIExtended {
  id: number;
  name: string;
  yield: number;
  price: number;
  minInvestment: number;
  category: string;
  managementCompany: string;
  tof: number;
  capitalization: string;
  sectors: Array<{ name: string; value: number }>;
  geography: Array<{ name: string; value: number }>;
  strategy: string;
  reconstitutionValue?: number;
  // Décote/surcote QA-validée (issue de la QA métier reconstitution) et son statut.
  discount?: number;
  discountQaStatus?: 'publishable' | 'manual_review' | 'excluded_non_scpi';
  ranDays?: number;
  ltv?: number;
  hasWaitingShares?: boolean;
  withdrawalDelay?: string;
  entryFees?: number;
  managementFees?: number;
  assetsCount?: number;
  // Champs supplémentaires depuis le fichier Excel
  delaiJouissance?: number; // Délai de jouissance en mois
  versementLoyers?: string; // Fréquence de versement des loyers
  dureeDetentionRecommandee?: number; // Durée de détention recommandée en années
  valeurRetrait?: number; // Valeur de retrait (€)
  valeurRealisation?: number; // Valeur de réalisation (€)
  distribution?: number; // Distribution par part (€/part)
  sfdr?: string; // Classification SFDR
  profilCible?: string; // Profil cible
  profilRisque?: number; // Profil de risque de 1 à 7
  // Données locatives extraites des bulletins trimestriels
  nombreLocataires?: number; // Nombre total de locataires
  walt?: number; // Weighted Average Lease Term (en années)
  walb?: number; // Weighted Average Lease Break (en années)
  // Données trimestrielles extraites des bulletins
  collecteNetteTrimestre?: number; // Collecte nette du trimestre (en €)
  nbCessionsTrimestre?: number; // Nombre de cessions du trimestre
}

const baseSCPIData: SCPIExtended[] = [
  {
    "id": 1,
    "name": "Activimmo",
    "yield": 5.5,
    "price": 610,
    "minInvestment": 6100,
    "category": "Logistique",
    "managementCompany": "Alderan",
    "tof": 92.6,
    "capitalization": "1400M€",
    "sectors": [
      {
        "name": "Entrepôt logistique",
        "value": 53.2
      },
      {
        "name": "Locaux d'activités",
        "value": 30.8
      },
      {
        "name": "Logistique urbaine",
        "value": 8.5
      },
      {
        "name": "Transport",
        "value": 6.7
      },
      {
        "name": "Autres",
        "value": 0.8
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 77.5
      },
      {
        "name": "Espagne",
        "value": 13.4
      },
      {
        "name": "Italie",
        "value": 4.1
      },
      {
        "name": "Pays-Bas",
        "value": 2.8
      },
      {
        "name": "Irlande",
        "value": 1.0
      },
      {
        "name": "Portugal",
        "value": 0.9
      },
      {
        "name": "Allemagne",
        "value": 0.3
      }
    ],
    "reconstitutionValue": 609.65,
    "valeurRetrait": 545.34,
    "valeurRealisation": 507.28,
    "ranDays": 0,
    "ltv": 0.48,
    "hasWaitingShares": false,
    "withdrawalDelay": "1er jour du 3ème mois",
    "entryFees": 10.6,
    "managementFees": 10,
    "assetsCount": 179,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "nombreLocataires": 373
  },
  {
    "id": 2,
    "name": "Aestiam Cap'Hebergimmo",
    "yield": 3.18,
    "price": 252,
    "minInvestment": 2520,
    "category": "Hôtellerie",
    "managementCompany": "Aestiam",
    "tof": 91.79,
    "capitalization": "82M€",
    "sectors": [
      {
        "name": "Hôtels",
        "value": 71
      },
      {
        "name": "Loisirs",
        "value": 2
      },
      {
        "name": "Séminaires",
        "value": 27
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 35
      },
      {
        "name": "Étranger",
        "value": 42
      },
      {
        "name": "Région Parisienne",
        "value": 23
      }
    ],
    "reconstitutionValue": 268,
    "ranDays": 14,
    "ltv": 26,
    "hasWaitingShares": true,
    "withdrawalDelay": "3 mois",
    "entryFees": 0,
    "managementFees": 9.5,
    "assetsCount": 25,
    "strategy": "Portefeuille d'actifs hôteliers et de tourisme"
  },
  {
    "id": 3,
    "name": "Aestiam Pierre Rendement",
    "yield": 4.49,
    "price": 922,
    "minInvestment": 9220,
    "category": "Bureaux",
    "managementCompany": "Aestiam",
    "tof": 94.25,
    "capitalization": "401M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 7
      },
      {
        "name": "Commerces",
        "value": 69
      },
      {
        "name": "Enseignement",
        "value": 3
      },
      {
        "name": "Hôtels Séminaires",
        "value": 21
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 37
      },
      {
        "name": "Étranger",
        "value": 6
      },
      {
        "name": "Région Parisienne",
        "value": 30
      },
      {
        "name": "Métropoles Régionales",
        "value": 27
      }
    ],
    "reconstitutionValue": 1026,
    "ranDays": 66,
    "ltv": 27,
    "hasWaitingShares": false,
    "withdrawalDelay": "1er jour du 6ème mois",
    "entryFees": 10,
    "managementFees": 11,
    "assetsCount": 42,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 4,
    "name": "Aestiam Horizon",
    "yield": 5.1,
    "price": 350,
    "minInvestment": 350,
    "category": "Bureaux",
    "managementCompany": "Aestiam",
    "tof": 88.65,
    "capitalization": "380M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 76
      },
      {
        "name": "Commerces",
        "value": 16
      },
      {
        "name": "Hôtels",
        "value": 4
      },
      {
        "name": "Locaux d'activités",
        "value": 2
      },
      {
        "name": "Enseignement",
        "value": 2
      }
    ],
    "geography": [
      {
        "name": "IDF",
        "value": 29
      },
      {
        "name": "Paris",
        "value": 21
      },
      {
        "name": "Sud-Est",
        "value": 12
      },
      {
        "name": "Sud-Ouest",
        "value": 12
      },
      {
        "name": "Europe",
        "value": 12
      },
      {
        "name": "Nord-Ouest",
        "value": 8
      },
      {
        "name": "Nord",
        "value": 5
      },
      {
        "name": "Nord-Est",
        "value": 1
      }
    ],
    "reconstitutionValue": 346,
    "ranDays": 42,
    "ltv": 11,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 315,
    "assetsCount": 146,
    "entryFees": 10,
    "managementFees": 9.5,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 217
  },
  {
    "id": 5,
    "name": "Altixia Cadence 12",
    "yield": 5.15,
    "price": 200,
    "minInvestment": 2000,
    "category": "Diversifiée",
    "managementCompany": "ALTIXIA REIM",
    "tof": 92.5,
    "capitalization": "190.36M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 37
      },
      {
        "name": "Activités",
        "value": 30
      },
      {
        "name": "Bureaux",
        "value": 29
      },
      {
        "name": "Logistique",
        "value": 4
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 56
      },
      {
        "name": "Ile-de-France",
        "value": 22
      },
      {
        "name": "Espagne",
        "value": 13
      },
      {
        "name": "Irlande",
        "value": 6
      },
      {
        "name": "Paris",
        "value": 3
      }
    ],
    "reconstitutionValue": 200.54,
    "valeurRetrait": 182,
    "valeurRealisation": 165.11,
    "ranDays": 0,
    "ltv": 10.99,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 32,
    "entryFees": 9,
    "managementFees": 10,
    "dureeDetentionRecommandee": 9,
    "nombreLocataires": 95
  },
  {
    "id": 6,
    "name": "Altixia Commerces",
    "yield": 5.0,
    "price": 203,
    "minInvestment": 2030,
    "category": "Bureaux",
    "managementCompany": "ALTIXIA REIM",
    "tof": 89.1,
    "capitalization": "107.08M€",
    "sectors": [
      {
        "name": "Commerces en retail park",
        "value": 61
      },
      {
        "name": "Commerces de pied d'immeuble",
        "value": 35
      },
      {
        "name": "Bureaux",
        "value": 2
      },
      {
        "name": "Activités",
        "value": 2
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 65
      },
      {
        "name": "Ile-de-France",
        "value": 27
      },
      {
        "name": "Paris",
        "value": 8
      }
    ],
    "reconstitutionValue": 190,
    "ranDays": 102,
    "ltv": 14.3,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 197.92,
    "assetsCount": 22,
    "entryFees": 2.5,
    "managementFees": 15,
    "dureeDetentionRecommandee": 9,
    "nombreLocataires": 73
  },
  {
    "id": 7,
    "name": "Atream Hotel",
    "yield": 5.05,
    "price": 1000,
    "minInvestment": 5000,
    "category": "Hôtellerie",
    "managementCompany": "Atream",
    "tof": 100,
    "capitalization": "325.99M€",
    "sectors": [
      {
        "name": "Hôtels",
        "value": 71
      },
      {
        "name": "Autres types d'hébergements touristiques",
        "value": 29
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 32
      },
      {
        "name": "Allemagne",
        "value": 29
      },
      {
        "name": "Belgique",
        "value": 22
      },
      {
        "name": "Pays-Bas",
        "value": 14
      },
      {
        "name": "Italie",
        "value": 3
      }
    ],
    "reconstitutionValue": 993,
    "ranDays": 18,
    "ltv": 24.23,
    "hasWaitingShares": false,
    "strategy": "Portefeuille d'actifs hôteliers et de tourisme",
    "valeurRetrait": 900,
    "assetsCount": 23,
    "entryFees": 10,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 8,
    "name": "Buroboutic Métropoles",
    "yield": 5.1,
    "price": 77,
    "minInvestment": 2300,
    "category": "Bureaux",
    "managementCompany": "FIDUCIAL Gérance",
    "tof": 93.85,
    "capitalization": "316M€",
    "sectors": [
      {
        "name": "Locaux commerciaux",
        "value": 52.6
      },
      {
        "name": "Bureaux",
        "value": 31.8
      },
      {
        "name": "Locaux d'activités",
        "value": 15.6
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 53.6
      },
      {
        "name": "Ile-de-France",
        "value": 30.6
      },
      {
        "name": "Paris",
        "value": 15.8
      }
    ],
    "reconstitutionValue": 213,
    "ranDays": 108,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 69.3,
    "assetsCount": 161,
    "entryFees": 10,
    "managementFees": 9.5,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8",
    "nombreLocataires": 263
  },
  {
    "id": 9,
    "name": "Coeur d'Europe",
    "yield": 6.25,
    "price": 204,
    "minInvestment": 2000,
    "category": "Diversifiée",
    "managementCompany": "Sogenial Immobilier",
    "tof": 95.02,
    "capitalization": "256.2M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 47.2
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 29.33
      },
      {
        "name": "Bureaux",
        "value": 20.16
      },
      {
        "name": "Santé et éducation",
        "value": 3.31
      }
    ],
    "geography": [
      {
        "name": "Espagne",
        "value": 43.8
      },
      {
        "name": "Portugal",
        "value": 33.5
      },
      {
        "name": "Belgique",
        "value": 15.5
      },
      {
        "name": "Allemagne",
        "value": 7.2
      }
    ],
    "reconstitutionValue": 209,
    "ranDays": 86,
    "ltv": 3.9,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 179.52,
    "assetsCount": 41,
    "entryFees": 12,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 132
  },
  {
    "id": 10,
    "name": "Coeur de Région",
    "yield": 6.2,
    "price": 664,
    "minInvestment": 2656,
    "category": "Diversifiée",
    "managementCompany": "Sogenial Immobilier",
    "tof": 95.03,
    "capitalization": "435.63M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 45.97
      },
      {
        "name": "Commerces",
        "value": 31.4
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 21.35
      },
      {
        "name": "Santé et éducation",
        "value": 1.23
      },
      {
        "name": "Alternatifs",
        "value": 0.05
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 86.7
      },
      {
        "name": "Île-de-France",
        "value": 13.3
      }
    ],
    "reconstitutionValue": 640,
    "ranDays": 22,
    "ltv": 9.88,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 584.32,
    "assetsCount": 93,
    "entryFees": 12,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 198
  },
  {
    "id": 11,
    "name": "Coeur de ville",
    "yield": 6.2,
    "price": 210,
    "minInvestment": 2100,
    "category": "Diversifiée",
    "managementCompany": "Sogenial Immobilier",
    "tof": 97.63,
    "capitalization": "28.84M€",
    "sectors": [
      {
        "name": "Commerces alimentaires",
        "value": 55.87
      },
      {
        "name": "Commerces non alimentaires",
        "value": 25.67
      },
      {
        "name": "Services",
        "value": 15.8
      },
      {
        "name": "Santé et éducation",
        "value": 2.66
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 80.2
      },
      {
        "name": "Île-de-France",
        "value": 19.8
      }
    ],
    "reconstitutionValue": 237,
    "ranDays": 23,
    "ltv": 30.23,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 184.8,
    "assetsCount": 32,
    "entryFees": 12,
    "managementFees": 1.2,
    "dureeDetentionRecommandee": 10,
    "nombreLocataires": 36
  },
  {
    "id": 12,
    "name": "Comète",
    "yield": 9.0,
    "price": 250,
    "minInvestment": 5000,
    "category": "Diversifiée",
    "managementCompany": "Alderan",
    "tof": 99.5,
    "capitalization": "652.0M€",
    "sectors": [
      {
        "name": "Commerce",
        "value": 27.6
      },
      {
        "name": "Logistique",
        "value": 23.9
      },
      {
        "name": "Hôtellerie",
        "value": 16.0
      },
      {
        "name": "Bureau",
        "value": 13.7
      },
      {
        "name": "Mixte",
        "value": 10.9
      },
      {
        "name": "Loisirs",
        "value": 5.8
      },
      {
        "name": "Éducation",
        "value": 2.1
      }
    ],
    "geography": [
      {
        "name": "Royaume-Uni",
        "value": 43.3
      },
      {
        "name": "Canada",
        "value": 16.2
      },
      {
        "name": "Espagne",
        "value": 15.2
      },
      {
        "name": "Italie",
        "value": 9.1
      },
      {
        "name": "Pays-Bas",
        "value": 7.8
      },
      {
        "name": "Pologne",
        "value": 5.7
      },
      {
        "name": "Irlande",
        "value": 2.7
      }
    ],
    "reconstitutionValue": 255,
    "ranDays": 86,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 225.0,
    "assetsCount": 34,
    "entryFees": 10,
    "managementFees": 11,
    "dureeDetentionRecommandee": 8,
    "nombreLocataires": 94
  },
  {
    "id": 13,
    "name": "Crédit Mutuel Pierre 1",
    "yield": 4.49,
    "price": 215,
    "minInvestment": 215,
    "category": "Bureaux",
    "managementCompany": "La Française Real Estate Managers",
    "tof": 82.3,
    "capitalization": "800.35M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 84.94
      },
      {
        "name": "Commerces",
        "value": 13.1
      },
      {
        "name": "Hôtels, tourisme et loisirs",
        "value": 1.96
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 51.53
      },
      {
        "name": "Régions",
        "value": 22.63
      },
      {
        "name": "Paris",
        "value": 21.84
      },
      {
        "name": "Allemagne",
        "value": 3.91
      },
      {
        "name": "Espagne",
        "value": 0.09
      }
    ],
    "reconstitutionValue": 219.5,
    "valeurRetrait": 197.8,
    "valeurRealisation": 179.26,
    "ranDays": 10,
    "ltv": 21.78,
    "hasWaitingShares": true,
    "entryFees": 8,
    "managementFees": 10,
    "delaiJouissance": 1,
    "versementLoyers": "Trimestriel",
    "dureeDetentionRecommandee": 9,
    "assetsCount": 64,
    "sfdr": "Article 9",
    "profilRisque": 4,
    "nbCessionsTrimestre": 3,
    "strategy": "SCPI d'entreprise à capital variable investissant principalement dans des bureaux en Île-de-France et Régions. Point d'attention liquidité : marché des parts suspendu depuis le 12/02/2026 — 396 756 parts en attente de retrait (10,7 % des parts). Prochaine confrontation prévue au 31/07/2026."
  },
  {
    "id": 14,
    "name": "Cristal Life",
    "yield": 6.54,
    "price": 208,
    "minInvestment": 2080,
    "category": "Santé",
    "managementCompany": "Inter Gestion REIM",
    "tof": 95.57,
    "capitalization": "387.43M€",
    "sectors": [
      {
        "name": "Commerce",
        "value": 29.25
      },
      {
        "name": "Bureau",
        "value": 26.7
      },
      {
        "name": "Santé",
        "value": 23.0
      },
      {
        "name": "Hôtel",
        "value": 13.66
      },
      {
        "name": "Activité & logistique",
        "value": 7.39
      }
    ],
    "geography": [
      {
        "name": "France (Régions)",
        "value": 56.34
      },
      {
        "name": "Espagne",
        "value": 17.92
      },
      {
        "name": "Irlande",
        "value": 9.21
      },
      {
        "name": "Pays-Bas",
        "value": 3.9
      },
      {
        "name": "Pologne",
        "value": 3.84
      },
      {
        "name": "Estonie",
        "value": 3.76
      },
      {
        "name": "Royaume-Uni",
        "value": 3.15
      },
      {
        "name": "France (Île-de-France)",
        "value": 1.88
      }
    ],
    "reconstitutionValue": 257,
    "ranDays": 6,
    "ltv": 25,
    "hasWaitingShares": false,
    "strategy": "Spécialisée dans les actifs de santé avec une forte exposition aux EHPAD et cliniques",
    "valeurRetrait": 183.04,
    "assetsCount": 42,
    "entryFees": 12,
    "managementFees": 1.01,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 15,
    "name": "Edissimo",
    "yield": 3.63,
    "price": 172,
    "minInvestment": 172,
    "category": "Bureaux",
    "managementCompany": "Amundi Immobilier",
    "tof": 87.03,
    "capitalization": "3030M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 68.9
      },
      {
        "name": "Commerces",
        "value": 14.5
      },
      {
        "name": "Logistique",
        "value": 9.0
      },
      {
        "name": "Hôtels",
        "value": 4.3
      },
      {
        "name": "Résidences Services",
        "value": 1.6
      },
      {
        "name": "Cliniques",
        "value": 1.2
      },
      {
        "name": "Locaux d'activité",
        "value": 0.5
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 30.2
      },
      {
        "name": "Paris",
        "value": 24.8
      },
      {
        "name": "Régions",
        "value": 21.0
      },
      {
        "name": "Allemagne",
        "value": 13.7
      },
      {
        "name": "Espagne",
        "value": 3.5
      },
      {
        "name": "Pays-Bas",
        "value": 3.4
      },
      {
        "name": "Autriche",
        "value": 0.9
      },
      {
        "name": "Rép. Tchèque",
        "value": 0.9
      },
      {
        "name": "Belgique",
        "value": 0.9
      },
      {
        "name": "Pologne",
        "value": 0.7
      }
    ],
    "reconstitutionValue": 187,
    "valeurRetrait": 158.25,
    "ranDays": 116,
    "ltv": 33,
    "hasWaitingShares": true,
    "strategy": "SCPI bureaux à capital variable — prix de souscription 172€ (depuis 31/03/2025, commission incluse), prix de retrait 158,25€. Perte en capital par rapport au prix historique. Données au T1 2026.",
    "assetsCount": 178,
    "entryFees": 7.993,
    "managementFees": 1.03,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8"
  },
  {
    "id": 16,
    "name": "Efimmo 1",
    "yield": 4.44,
    "price": 212,
    "minInvestment": 212,
    "category": "Bureaux",
    "managementCompany": "Sofidy",
    "tof": 86.02,
    "capitalization": "1741M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 74.4
      },
      {
        "name": "Divers",
        "value": 9.4
      },
      {
        "name": "Autres locaux commerciaux",
        "value": 7.6
      },
      {
        "name": "Commerces de centre-ville et milieu urbain",
        "value": 5.2
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 74.1
      },
      {
        "name": "Allemagne",
        "value": 10.0
      },
      {
        "name": "Pays-Bas",
        "value": 5.2
      },
      {
        "name": "Royaume-Uni",
        "value": 4.5
      },
      {
        "name": "Belgique",
        "value": 2.3
      },
      {
        "name": "Irlande",
        "value": 1.4
      },
      {
        "name": "Italie",
        "value": 1.3
      },
      {
        "name": "Reste de l'Europe",
        "value": 0.7
      },
      {
        "name": "Espagne",
        "value": 0.6
      }
    ],
    "reconstitutionValue": 202.65,
    "valeurRetrait": 190.8,
    "valeurRealisation": 168.78,
    "ranDays": 0,
    "ltv": 22,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 239,
    "entryFees": 10,
    "managementFees": 10,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8"
  },
  {
    "id": 17,
    "name": "Épargne Foncière",
    "yield": 4.86,
    "price": 670,
    "minInvestment": 670,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 88.7,
    "capitalization": "4142.67M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 69.56
      },
      {
        "name": "Commerces",
        "value": 19.93
      },
      {
        "name": "Hôtels, tourisme et loisirs",
        "value": 6.26
      },
      {
        "name": "Santé et éducation",
        "value": 3.81
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 0.44
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 36.9
      },
      {
        "name": "Régions",
        "value": 32.67
      },
      {
        "name": "Paris",
        "value": 21.86
      },
      {
        "name": "Allemagne",
        "value": 5.57
      },
      {
        "name": "Pays-Bas",
        "value": 1.6
      },
      {
        "name": "Royaume-Uni",
        "value": 0.99
      },
      {
        "name": "Irlande",
        "value": 0.41
      }
    ],
    "reconstitutionValue": 672,
    "ranDays": 54,
    "ltv": 19.15,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 619.75,
    "assetsCount": 235,
    "entryFees": 7.5,
    "managementFees": 10,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 9"
  },
  {
    "id": 18,
    "name": "Épargne Pierre",
    "yield": 5.28,
    "price": 208,
    "minInvestment": 2080,
    "category": "Diversifiée",
    "managementCompany": "Atland Voisin",
    "tof": 94.41,
    "capitalization": "2811M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 46.88
      },
      {
        "name": "Commerces",
        "value": 28.95
      },
      {
        "name": "Tourisme / Hôtel",
        "value": 10.14
      },
      {
        "name": "Activités / Entrepôts",
        "value": 8.28
      },
      {
        "name": "Santé / Education",
        "value": 5.59
      },
      {
        "name": "Résidentiel / Alternatif",
        "value": 0.16
      }
    ],
    "geography": [
      {
        "name": "Paris / Île-de-France",
        "value": 27.06
      },
      {
        "name": "Nord-Ouest",
        "value": 17.39
      },
      {
        "name": "Sud-Ouest",
        "value": 16.21
      },
      {
        "name": "Nord-Est",
        "value": 13.7
      },
      {
        "name": "Sud-Est",
        "value": 12.95
      },
      {
        "name": "Nord",
        "value": 12.69
      }
    ],
    "reconstitutionValue": 208.64,
    "valeurRetrait": 187.2,
    "valeurRealisation": 170.1,
    "ranDays": 0,
    "ltv": 11.2,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 414,
    "entryFees": 12,
    "managementFees": 0.97,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 1020
  },
  {
    "id": 19,
    "name": "Épargne Pierre Europe",
    "yield": 6.75,
    "price": 200,
    "minInvestment": 6000,
    "category": "Diversifiée",
    "managementCompany": "Atland Voisin",
    "tof": 99.88,
    "capitalization": "635M€",
    "sectors": [
      {
        "name": "Hôtellerie",
        "value": 27.87
      },
      {
        "name": "Commerces",
        "value": 25.78
      },
      {
        "name": "Bureaux",
        "value": 24.61
      },
      {
        "name": "Activités/Entrepôts",
        "value": 16.98
      },
      {
        "name": "Santé",
        "value": 4.76
      }
    ],
    "geography": [
      {
        "name": "Espagne",
        "value": 29.53
      },
      {
        "name": "Irlande",
        "value": 25.64
      },
      {
        "name": "Allemagne",
        "value": 23.88
      },
      {
        "name": "Royaume-Uni",
        "value": 11.99
      },
      {
        "name": "Pays-Bas",
        "value": 8.96
      }
    ],
    "reconstitutionValue": 206.51,
    "valeurRetrait": 180,
    "valeurRealisation": 176.3,
    "ranDays": 0,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Investissement dans des actifs immobiliers européens diversifiés",
    "assetsCount": 27,
    "entryFees": 12,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 54
  },
  {
    "id": 20,
    "name": "ESG Pierre Capital",
    "yield": 5.22,
    "price": 188,
    "minInvestment": 188,
    "category": "Diversifiée",
    "managementCompany": "Swiss Life Asset Managers",
    "tof": 96.28,
    "capitalization": "117M€",
    "sectors": [
      {
        "name": "Services",
        "value": 27.3
      },
      {
        "name": "Logistique",
        "value": 24.23
      },
      {
        "name": "Bureaux",
        "value": 19.6
      },
      {
        "name": "Hôtellerie",
        "value": 17.4
      },
      {
        "name": "Commerces",
        "value": 11.46
      }
    ],
    "geography": [
      {
        "name": "Regions",
        "value": 49.15
      },
      {
        "name": "Paris",
        "value": 28.47
      },
      {
        "name": "Ile_de_France",
        "value": 17.89
      },
      {
        "name": "Allemagne",
        "value": 4.48
      }
    ],
    "reconstitutionValue": 187.11,
    "valeurRetrait": 169.2,
    "valeurRealisation": 152.49,
    "ranDays": 0,
    "ltv": 28.0,
    "hasWaitingShares": false,
    "strategy": "SCPI ISR investissant dans des actifs immobiliers responsables en France et en Europe"
  },
  {
    "id": 21,
    "name": "Ficommerce Proximité",
    "yield": 5.1,
    "price": 70,
    "minInvestment": 700,
    "category": "Bureaux",
    "managementCompany": "FIDUCIAL Gérance",
    "tof": 94.56,
    "capitalization": "596M€",
    "sectors": [
      {
        "name": "Locaux commerciaux",
        "value": 84.9
      },
      {
        "name": "Bureaux",
        "value": 14.9
      },
      {
        "name": "Entrepôts, activités et divers",
        "value": 0.2
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 51.9
      },
      {
        "name": "Paris",
        "value": 25.3
      },
      {
        "name": "Île-de-France",
        "value": 20.3
      },
      {
        "name": "Europe",
        "value": 2.5
      }
    ],
    "reconstitutionValue": 238,
    "ranDays": 77,
    "ltv": 6.86,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 63,
    "assetsCount": 281,
    "entryFees": 12,
    "managementFees": 11.4,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8",
    "nombreLocataires": 443
  },
  {
    "id": 22,
    "name": "Foncière des Praticiens",
    "yield": 5.5,
    "price": 1100,
    "minInvestment": 1100,
    "category": "Santé",
    "managementCompany": "MAGELLIM REIM",
    "tof": 96.7,
    "capitalization": "173M€",
    "sectors": [
      {
        "name": "Lieux de soins, de traitement et de consultation",
        "value": 45
      },
      {
        "name": "Locaux d'accompagnement et rééducation",
        "value": 39
      },
      {
        "name": "Locaux supports au secteur de la santé",
        "value": 16
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 68
      },
      {
        "name": "Belgique",
        "value": 32
      }
    ],
    "reconstitutionValue": 1069,
    "ranDays": 27,
    "ltv": 20.69,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 1012,
    "assetsCount": 23,
    "entryFees": 9.6,
    "sfdr": "Article 8",
    "nombreLocataires": 80
  },
  {
    "id": 23,
    "name": "GMA Essentialis",
    "yield": 4.0,
    "price": 206,
    "minInvestment": 2060,
    "category": "Diversifiée",
    "managementCompany": "GREENMAN ARTH",
    "tof": 99.7,
    "capitalization": "44.55M€",
    "sectors": [
      {
        "name": "Commerce alimentaire",
        "value": 96.49
      },
      {
        "name": "Droguerie",
        "value": 2.08
      },
      {
        "name": "Autres commerces",
        "value": 1.43
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 51
      },
      {
        "name": "Allemagne",
        "value": 49
      }
    ],
    "reconstitutionValue": 167,
    "ranDays": 49,
    "ltv": 38.8,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 185.4,
    "assetsCount": 14,
    "entryFees": 12,
    "managementFees": 14.4,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 9",
    "nombreLocataires": 19
  },
  {
    "id": 24,
    "name": "Grand Paris Résidentiel",
    "yield": 0,
    "price": 200,
    "minInvestment": 200,
    "category": "Diversifiée",
    "managementCompany": "Inter Gestion REIM",
    "tof": 92.38,
    "capitalization": "12.04M€",
    "sectors": [
      {
        "name": "Logement",
        "value": 99.6
      },
      {
        "name": ", Commerces",
        "value": 0.4
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 87
      },
      {
        "name": "Régions",
        "value": 13
      }
    ],
    "reconstitutionValue": 186,
    "ranDays": 43,
    "ltv": 38.77,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 176,
    "assetsCount": 7,
    "entryFees": 12,
    "managementFees": 12,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 6"
  },
  {
    "id": 25,
    "name": "Immorente",
    "yield": 5.0,
    "price": 340,
    "minInvestment": 1360,
    "category": "Diversifiée",
    "managementCompany": "SOFIDY",
    "tof": 91.21,
    "capitalization": "4391M€",
    "sectors": [
      {
        "name": "Autres",
        "value": 9.5
      },
      {
        "name": "Bureaux",
        "value": 36.3
      },
      {
        "name": "Galeries commerciales",
        "value": 13.7
      },
      {
        "name": "Commerces de centre-ville et milieu urbain",
        "value": 24.1
      },
      {
        "name": "Moyennes surfaces commerciales de périphéries",
        "value": 16.4
      }
    ],
    "geography": [
      {
        "name": "Irlande",
        "value": 0.6
      },
      {
        "name": "Belgique",
        "value": 3
      },
      {
        "name": "Pays-Bas",
        "value": 7.9
      },
      {
        "name": "Allemagne",
        "value": 4.5
      },
      {
        "name": "Grand Paris",
        "value": 25
      },
      {
        "name": "Royaume-Uni",
        "value": 2.9
      },
      {
        "name": "Paris Centre",
        "value": 22.5
      },
      {
        "name": "Reste de l'Europe",
        "value": 0.8
      },
      {
        "name": "Métropoles françaises",
        "value": 32.8
      }
    ],
    "reconstitutionValue": 328,
    "ranDays": 106,
    "ltv": 19.1,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 306,
    "assetsCount": 994,
    "entryFees": 10,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8",
    "nombreLocataires": 3261
  },
  {
    "id": 26,
    "name": "Iroko Zen",
    "yield": 7.12,
    "price": 204,
    "minInvestment": 204,
    "category": "Bureaux",
    "managementCompany": "Iroko",
    "tof": 97.11,
    "capitalization": "1499M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 37.0
      },
      {
        "name": "Bureaux",
        "value": 27.7
      },
      {
        "name": "Locaux d'activités",
        "value": 12.9
      },
      {
        "name": "Logistique",
        "value": 11.4
      },
      {
        "name": "Santé/hôtellerie/autre",
        "value": 8.7
      },
      {
        "name": "Entrepôts",
        "value": 2.3
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 27.5
      },
      {
        "name": "Royaume-Uni",
        "value": 27.4
      },
      {
        "name": "Pays-Bas",
        "value": 13.7
      },
      {
        "name": "Espagne",
        "value": 11.3
      },
      {
        "name": "Irlande",
        "value": 10.6
      },
      {
        "name": "Allemagne",
        "value": 8.6
      },
      {
        "name": "Italie",
        "value": 0.9
      }
    ],
    "reconstitutionValue": 213.65,
    "ranDays": 73,
    "ltv": 25.07,
    "hasWaitingShares": false,
    "assetsCount": 177,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 204,
    "entryFees": 0,
    "managementFees": 14.4,
    "dureeDetentionRecommandee": 10,
    "nombreLocataires": 411
  },
  {
    "id": 27,
    "name": "Kyaneos Pierre",
    "yield": 4.35,
    "price": 224,
    "minInvestment": 2240,
    "category": "Diversifiée",
    "managementCompany": "KYANEOS ASSET MANAGEMENT",
    "tof": 88.9,
    "capitalization": "445M€",
    "sectors": [
      {
        "name": "Habitations",
        "value": 89.3
      },
      {
        "name": "Commerces et bureaux",
        "value": 10.7
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 100
      }
    ],
    "reconstitutionValue": 263,
    "ranDays": 83,
    "ltv": 24,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 199.36,
    "assetsCount": 648,
    "entryFees": 11,
    "managementFees": 8,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 28,
    "name": "LF Avenir Santé",
    "yield": 5.08,
    "price": 300,
    "minInvestment": 300,
    "category": "Diversifiée",
    "managementCompany": "La Française REM",
    "tof": 100,
    "capitalization": "273.43M€",
    "sectors": [
      {
        "name": "Soins de ville",
        "value": 43
      },
      {
        "name": "Établissements sanitaires",
        "value": 41
      },
      {
        "name": "Solutions d'accueil générationnelles",
        "value": 16
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 51.79
      },
      {
        "name": "Paris",
        "value": 25.97
      },
      {
        "name": "Belgique",
        "value": 9.56
      },
      {
        "name": "Irlande",
        "value": 7.54
      },
      {
        "name": "Ile-de-France",
        "value": 5.14
      }
    ],
    "reconstitutionValue": 321,
    "ranDays": 36,
    "ltv": 26.21,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 273,
    "assetsCount": 35,
    "entryFees": 9,
    "managementFees": 10,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 8"
  },
  {
    "id": 29,
    "name": "LF Europimmo",
    "yield": 4.63,
    "price": 725,
    "minInvestment": 725,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 95.3,
    "capitalization": "812.91M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 76.83
      },
      {
        "name": "Commerces",
        "value": 13.5
      },
      {
        "name": "Hôtels, tourisme et loisirs",
        "value": 6.82
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 2.73
      },
      {
        "name": "Santé et éducation",
        "value": 0.12
      }
    ],
    "geography": [
      {
        "name": "Allemagne",
        "value": 56.52
      },
      {
        "name": "Royaume-Uni",
        "value": 18.04
      },
      {
        "name": "Pays-Bas",
        "value": 7.99
      },
      {
        "name": "Ile-de-France",
        "value": 4.93
      },
      {
        "name": "Belgique",
        "value": 3.71
      },
      {
        "name": "Luxembourg",
        "value": 2.27
      },
      {
        "name": "Irlande",
        "value": 2.1
      },
      {
        "name": "Paris",
        "value": 2.06
      },
      {
        "name": "Régions",
        "value": 1.7
      },
      {
        "name": "Espagne",
        "value": 0.68
      }
    ],
    "reconstitutionValue": 774,
    "ranDays": 13,
    "ltv": 19.3,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 667,
    "assetsCount": 52,
    "entryFees": 8,
    "managementFees": 10,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 9"
  },
  {
    "id": 30,
    "name": "LF Grand Paris Patrimoine",
    "yield": 4.66,
    "price": 218,
    "minInvestment": 218,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 88.1,
    "capitalization": "1069.86M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 91.95
      },
      {
        "name": "Santé et éducation",
        "value": 7.85
      },
      {
        "name": "Commerces",
        "value": 0.2
      }
    ],
    "geography": [
      {
        "name": "Ile-de-France",
        "value": 67.3
      },
      {
        "name": "Paris",
        "value": 26.82
      },
      {
        "name": "Régions",
        "value": 5.88
      }
    ],
    "reconstitutionValue": 225,
    "ranDays": 50,
    "ltv": 30.85,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 200.56,
    "assetsCount": 58,
    "entryFees": 8,
    "managementFees": 10,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 9"
  },
  {
    "id": 31,
    "name": "Log In",
    "yield": 6.21,
    "price": 255,
    "minInvestment": 1000,
    "category": "Bureaux",
    "managementCompany": "THEOREIM",
    "tof": 100.0,
    "capitalization": "240.81M€",
    "sectors": [
      {
        "name": "Locaux d'activités et sites de production",
        "value": 71
      },
      {
        "name": "Logistique",
        "value": 23
      },
      {
        "name": "Life Science",
        "value": 5
      }
    ],
    "geography": [
      {
        "name": "Italie",
        "value": 28
      },
      {
        "name": "Espagne",
        "value": 26
      },
      {
        "name": "Royaume-Uni",
        "value": 22
      },
      {
        "name": "Allemagne",
        "value": 12
      },
      {
        "name": "Irlande",
        "value": 8
      },
      {
        "name": "Pologne",
        "value": 4
      }
    ],
    "reconstitutionValue": 270,
    "ranDays": 86,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 229.5,
    "assetsCount": 20,
    "entryFees": 12,
    "managementFees": 0.88,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 22
  },
  {
    "id": 32,
    "name": "NCap Education Santé",
    "yield": 4.52,
    "price": 202,
    "minInvestment": 2020,
    "category": "Diversifiée",
    "managementCompany": "Norma Capital",
    "tof": 96.0,
    "capitalization": "116.7M€",
    "sectors": [
      {
        "name": "Santé/Social",
        "value": 66
      },
      {
        "name": "Bien-être",
        "value": 17
      },
      {
        "name": "Éducation",
        "value": 10
      },
      {
        "name": "Commerce",
        "value": 6
      },
      {
        "name": "Environnement",
        "value": 1
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 85
      },
      {
        "name": "Zone euro",
        "value": 10
      },
      {
        "name": "Hors zone euro",
        "value": 5
      }
    ],
    "reconstitutionValue": 206,
    "ranDays": 72,
    "ltv": 0.62,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 181.8,
    "assetsCount": 55,
    "entryFees": 10,
    "managementFees": 0.56,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 75
  },
  {
    "id": 33,
    "name": "NCap Régions",
    "yield": 5.72,
    "price": 682,
    "minInvestment": 3410,
    "category": "Diversifiée",
    "managementCompany": "Norma Capital",
    "tof": 91.6,
    "capitalization": "1097.1M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 57
      },
      {
        "name": "Commerce",
        "value": 30
      },
      {
        "name": "Activités",
        "value": 13
      },
      {
        "name": "Hôtellerie",
        "value": 0.5
      }
    ],
    "geography": [
      {
        "name": "Ile-de-France",
        "value": 22
      },
      {
        "name": "PACA",
        "value": 19
      },
      {
        "name": "Occitanie",
        "value": 11
      },
      {
        "name": "Auvergne-Rhône-Alpes",
        "value": 10
      },
      {
        "name": "Hauts-de-France",
        "value": 10
      },
      {
        "name": "Pays de la Loire",
        "value": 8
      },
      {
        "name": "Bretagne",
        "value": 4
      },
      {
        "name": "Grand Est",
        "value": 3
      },
      {
        "name": "La Réunion",
        "value": 3
      },
      {
        "name": "Nouvelle-Aquitaine",
        "value": 3
      },
      {
        "name": "Bourgogne-Franche-Comté",
        "value": 2
      },
      {
        "name": "Centre-Val de Loire",
        "value": 2
      },
      {
        "name": "Paris",
        "value": 2
      },
      {
        "name": "Normandie",
        "value": 1
      }
    ],
    "reconstitutionValue": 701.49,
    "valeurRetrait": 613.8,
    "valeurRealisation": 576.68,
    "ranDays": 0,
    "ltv": 21.69,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 180,
    "entryFees": 10,
    "managementFees": 0.65,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 425
  },
  {
    "id": 34,
    "name": "Novapierre 1",
    "yield": 5,
    "price": 442,
    "minInvestment": 2210,
    "category": "Diversifiée",
    "managementCompany": "PAREF GESTION",
    "tof": 85.3,
    "capitalization": "172.1M€",
    "sectors": [
      {
        "name": "Autres",
        "value": 9.9
      },
      {
        "name": "Santé",
        "value": 9.8
      },
      {
        "name": "Services",
        "value": 12.5
      },
      {
        "name": "Alimentaire",
        "value": 15.2
      },
      {
        "name": "Restauration",
        "value": 15.7
      },
      {
        "name": "Culture et loisirs",
        "value": 6.6
      },
      {
        "name": "Équipement de la maison",
        "value": 30.3
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 28.6
      },
      {
        "name": "Autres régions",
        "value": 30.8
      },
      {
        "name": "Ile-de-France hors Paris",
        "value": 19.4
      },
      {
        "name": "12 métropoles régionales",
        "value": 21.2
      }
    ],
    "reconstitutionValue": 462,
    "ranDays": 34,
    "ltv": 29.3,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 406.64,
    "assetsCount": 110,
    "entryFees": 8,
    "managementFees": 8,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 6",
    "nombreLocataires": 206
  },
  {
    "id": 35,
    "name": "Novapierre Résidentiel",
    "yield": 0,
    "price": 1664,
    "minInvestment": 8320,
    "category": "Résidentiel",
    "managementCompany": "PAREF GESTION",
    "tof": 90.7,
    "capitalization": "348M€",
    "sectors": [
      {
        "name": "Résidentiel",
        "value": 100
      }
    ],
    "geography": [
      {
        "name": "Nice",
        "value": 2.3
      },
      {
        "name": "Paris",
        "value": 77.8
      },
      {
        "name": "Région parisienne",
        "value": 19.9
      }
    ],
    "reconstitutionValue": 1549,
    "ranDays": 75,
    "ltv": 26,
    "hasWaitingShares": false,
    "strategy": "Investissement dans l'immobilier résidentiel de qualité"
  },
  {
    "id": 36,
    "name": "Novaxia NEO",
    "yield": 5.5,
    "price": 176.68,
    "minInvestment": 748,
    "category": "Bureaux",
    "managementCompany": "Novaxia Investissement",
    "tof": 90.6,
    "capitalization": "427.9M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 94
      },
      {
        "name": "Hôtels",
        "value": 4
      },
      {
        "name": "Activités",
        "value": 1
      },
      {
        "name": "Enseignement",
        "value": 1
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 54
      },
      {
        "name": "Allemagne",
        "value": 28
      },
      {
        "name": "Espagne",
        "value": 8
      },
      {
        "name": "Irlande",
        "value": 7
      },
      {
        "name": "Belgique",
        "value": 3
      }
    ],
    "reconstitutionValue": 187,
    "ranDays": 59,
    "ltv": 32.8,
    "hasWaitingShares": false,
    "assetsCount": 38,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "entryFees": 0,
    "managementFees": 15,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 9",
    "nombreLocataires": 128
  },
  {
    "id": 37,
    "name": "Opportunité Immo",
    "yield": 5.68,
    "price": 203,
    "minInvestment": 203,
    "category": "Logistique",
    "managementCompany": "La Française REM",
    "tof": 95.0,
    "capitalization": "313015444Md€",
    "sectors": [
      {
        "name": "Logistique et locaux d'activités",
        "value": 90.04
      },
      {
        "name": "Bureaux",
        "value": 9.96
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 45.07
      },
      {
        "name": "Régions",
        "value": 39.95
      },
      {
        "name": "Espagne",
        "value": 5.51
      },
      {
        "name": "Allemagne",
        "value": 4.52
      },
      {
        "name": "Pays-Bas",
        "value": 3.11
      },
      {
        "name": "Royaume-Uni",
        "value": 1.84
      }
    ],
    "reconstitutionValue": 215.4,
    "valeurRetrait": 184.73,
    "valeurRealisation": 175.34,
    "ranDays": 0,
    "ltv": 21.46,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 48,
    "entryFees": 9,
    "managementFees": 12,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 9"
  },
  {
    "id": 38,
    "name": "Optimale",
    "yield": 6.5,
    "price": 255,
    "minInvestment": 1500,
    "category": "Bureaux",
    "managementCompany": "CONSULTIM Asset Management",
    "tof": 95.31,
    "capitalization": "92M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 40.2
      },
      {
        "name": "Commerces",
        "value": 28.3
      },
      {
        "name": "Activités et Logistique",
        "value": 26.4
      },
      {
        "name": "Santé et éducation",
        "value": 5.1
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 100.0
      }
    ],
    "reconstitutionValue": 241,
    "ranDays": 77,
    "ltv": 19.63,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 229.5,
    "assetsCount": 39,
    "entryFees": 10,
    "managementFees": 0.95,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 83
  },
  {
    "id": 39,
    "name": "Paref Evo",
    "yield": 4.72,
    "price": 250,
    "minInvestment": 1250,
    "category": "Bureaux",
    "managementCompany": "PAREF GESTION",
    "tof": 87.8,
    "capitalization": "49.3M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 89.4
      },
      {
        "name": "Locaux d'activité",
        "value": 10.6
      }
    ],
    "geography": [
      {
        "name": "Pologne - Cracovie",
        "value": 53.3
      },
      {
        "name": "Pologne - Varsovie",
        "value": 46.7
      }
    ],
    "reconstitutionValue": 248,
    "valeurRetrait": 225,
    "valeurRealisation": 214.15,
    "ranDays": 35,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 5,
    "entryFees": 10,
    "managementFees": 11,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 13
  },
  {
    "id": 40,
    "name": "Paref Hexa",
    "yield": 6,
    "price": 172,
    "minInvestment": 1050,
    "category": "Diversifiée",
    "managementCompany": "PAREF GESTION",
    "tof": 84.9,
    "capitalization": "201.1M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 65.1
      },
      {
        "name": "Autres",
        "value": 26.2
      },
      {
        "name": "Logistique & Messagerie",
        "value": 4.8
      },
      {
        "name": "Locaux d'activité",
        "value": 3.9
      }
    ],
    "geography": [
      {
        "name": "Métropoles régionales",
        "value": 56.0
      },
      {
        "name": "Ile-de-France hors Paris",
        "value": 25.5
      },
      {
        "name": "Autres régions",
        "value": 12.9
      },
      {
        "name": "Paris",
        "value": 5.6
      }
    ],
    "reconstitutionValue": 196.02,
    "valeurRetrait": 154.8,
    "valeurRealisation": 159.56,
    "ranDays": 0,
    "ltv": 29.1,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "assetsCount": 41,
    "entryFees": 10,
    "managementFees": 8,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 75
  },
  {
    "id": 41,
    "name": "Patrimmo Croissance Impact",
    "yield": 0,
    "price": 677,
    "minInvestment": 7200,
    "category": "Diversifiée",
    "managementCompany": "Præmia REIM France",
    "tof": 92.4,
    "capitalization": "189.7M€",
    "sectors": [
      {
        "name": "Résidentiel",
        "value": 97.6
      },
      {
        "name": "SCPI",
        "value": 2.4
      }
    ],
    "geography": [
      {
        "name": "Île-de-France hors Paris",
        "value": 36.8
      },
      {
        "name": "Paris",
        "value": 32.4
      },
      {
        "name": "France hors région parisienne",
        "value": 28.4
      },
      {
        "name": "SCPI",
        "value": 2.4
      }
    ],
    "reconstitutionValue": 717,
    "ranDays": 43,
    "ltv": 6.4,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque",
    "valeurRetrait": 597.38,
    "assetsCount": 64,
    "entryFees": 11.76,
    "managementFees": 10,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 9"
  },
  {
    "id": 42,
    "name": "Perial Grand Paris",
    "yield": 4.8,
    "price": 458,
    "minInvestment": 1000,
    "category": "Bureaux",
    "managementCompany": "PERIAL Asset Management",
    "tof": 84.4,
    "capitalization": "1051.87M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 95.2
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 1.9
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 1.7
      },
      {
        "name": "Commerces",
        "value": 1.3
      }
    ],
    "geography": [
      {
        "name": "Région Parisienne",
        "value": 76.2
      },
      {
        "name": "Paris",
        "value": 19.6
      },
      {
        "name": "Régions",
        "value": 4.2
      }
    ],
    "reconstitutionValue": 451,
    "ranDays": 10,
    "ltv": 35.0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 91,
    "entryFees": 9.5,
    "managementFees": 10,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 9",
    "nombreLocataires": 321
  },
  {
    "id": 43,
    "name": "Perial Hospitalité Europe",
    "yield": 4.11,
    "price": 181,
    "minInvestment": 905,
    "category": "Santé",
    "managementCompany": "PERIAL Asset Management",
    "tof": 99.3,
    "capitalization": "333.04M€",
    "sectors": [
      {
        "name": "Santé et éducation",
        "value": 59.0
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 40.4
      },
      {
        "name": "Alternatifs (résidence étudiante)",
        "value": 0.6
      }
    ],
    "geography": [
      {
        "name": "Allemagne",
        "value": 65.1
      },
      {
        "name": "Espagne",
        "value": 18.0
      },
      {
        "name": "Italie",
        "value": 13.2
      },
      {
        "name": "Pays-Bas",
        "value": 3.7
      }
    ],
    "reconstitutionValue": 211,
    "ranDays": 13,
    "ltv": 28.1,
    "hasWaitingShares": false,
    "strategy": "Spécialisée dans les actifs de santé avec une forte exposition aux EHPAD et cliniques",
    "valeurRetrait": 165.61,
    "assetsCount": 29,
    "entryFees": 8.5,
    "managementFees": 9,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8",
    "nombreLocataires": 29
  },
  {
    "id": 44,
    "name": "Perial O2",
    "yield": 4.65,
    "price": 164,
    "minInvestment": 4920,
    "category": "Bureaux",
    "managementCompany": "PERIAL Asset Management",
    "tof": 86.2,
    "capitalization": "2401.59M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 85.2
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 6.1
      },
      {
        "name": "Santé et éducation",
        "value": 5.0
      },
      {
        "name": "Commerces",
        "value": 2.7
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 0.9
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 76.5
      },
      {
        "name": "Pays-Bas",
        "value": 9.9
      },
      {
        "name": "Allemagne",
        "value": 4.4
      },
      {
        "name": "Italie",
        "value": 4.1
      },
      {
        "name": "Belgique",
        "value": 2.3
      },
      {
        "name": "Portugal",
        "value": 1.5
      },
      {
        "name": "Espagne",
        "value": 1.3
      }
    ],
    "reconstitutionValue": 175,
    "ranDays": 42,
    "ltv": 31.2,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 137,
    "entryFees": 11.5,
    "managementFees": 1.06,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 9",
    "nombreLocataires": 491
  },
  {
    "id": 45,
    "name": "Perial Opportunités Europe",
    "yield": 6.1,
    "price": 44,
    "minInvestment": 220,
    "category": "Bureaux",
    "managementCompany": "PERIAL Asset Management",
    "tof": 89.4,
    "capitalization": "790.46M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 47.7
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 27.3
      },
      {
        "name": "Commerces",
        "value": 18.6
      },
      {
        "name": "Santé et éducation",
        "value": 4.6
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 1.7
      },
      {
        "name": "Alternatifs",
        "value": 0.1
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 58.7
      },
      {
        "name": "Pays-Bas",
        "value": 14.0
      },
      {
        "name": "Espagne",
        "value": 12.7
      },
      {
        "name": "Allemagne",
        "value": 12.6
      },
      {
        "name": "Italie",
        "value": 1.9
      }
    ],
    "reconstitutionValue": 43.5,
    "valeurRetrait": 39.82,
    "valeurRealisation": 33.93,
    "ranDays": 21,
    "ltv": 30.7,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 127,
    "entryFees": 9.5,
    "managementFees": 10.0,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8"
  },
  {
    "id": 46,
    "name": "Remake Live",
    "yield": 7.05,
    "price": 204,
    "minInvestment": 204,
    "category": "Bureaux",
    "managementCompany": "Remake Asset Management",
    "tof": 99.16,
    "capitalization": "882.0M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 39.82
      },
      {
        "name": "Santé & éducation",
        "value": 19.57
      },
      {
        "name": "Logistique et locaux d'activité",
        "value": 15.27
      },
      {
        "name": "Commerces",
        "value": 11.5
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 8.99
      },
      {
        "name": "Résidentiel",
        "value": 3.46
      },
      {
        "name": "Alternatifs",
        "value": 1.39
      },
      {
        "name": "VEFA",
        "value": 0.6
      }
    ],
    "geography": [
      {
        "name": "Royaume-Uni",
        "value": 29.79
      },
      {
        "name": "France",
        "value": 23.88
      },
      {
        "name": "Espagne",
        "value": 10.01
      },
      {
        "name": "Irlande",
        "value": 9.57
      },
      {
        "name": "Pays-Bas",
        "value": 9.34
      },
      {
        "name": "Pologne",
        "value": 7.83
      },
      {
        "name": "Allemagne",
        "value": 5.41
      },
      {
        "name": "Italie",
        "value": 3.34
      },
      {
        "name": "Portugal",
        "value": 0.84
      }
    ],
    "reconstitutionValue": 203,
    "ranDays": 84,
    "ltv": 24.42,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 204.0,
    "assetsCount": 71,
    "entryFees": 0.0,
    "managementFees": 18.0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 97
  },
  {
    "id": 47,
    "name": "Selectinvest 1",
    "yield": 4.44,
    "price": 530,
    "minInvestment": 530,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 84.1,
    "capitalization": "1241.94M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 70.94
      },
      {
        "name": "Commerces",
        "value": 22.04
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 4.19
      },
      {
        "name": "Hôtels, tourisme et loisirs",
        "value": 2.36
      },
      {
        "name": "Santé et éducation",
        "value": 0.47
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 54.93
      },
      {
        "name": "Régions",
        "value": 26.61
      },
      {
        "name": "Paris",
        "value": 15.08
      },
      {
        "name": "Allemagne",
        "value": 3.38
      }
    ],
    "reconstitutionValue": 566,
    "ranDays": 73,
    "ltv": 24.54,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 496.88,
    "assetsCount": 235,
    "entryFees": 6.25,
    "managementFees": 9.0,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 9"
  },
  {
    "id": 48,
    "name": "Selectipierre 2",
    "yield": 4.14,
    "price": 773,
    "minInvestment": 7730,
    "category": "Bureaux",
    "managementCompany": "FIDUCIAL Gérance",
    "tof": 94.89,
    "capitalization": "466.5M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 70.9
      },
      {
        "name": "Locaux commerciaux",
        "value": 17.3
      },
      {
        "name": "Locaux d'habitation",
        "value": 5.9
      },
      {
        "name": "Résidences hôtelières / étudiantes",
        "value": 4.5
      },
      {
        "name": "Locaux d'activité",
        "value": 1.4
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 74.0
      },
      {
        "name": "Île-de-France",
        "value": 19.3
      },
      {
        "name": "Régions",
        "value": 6.7
      }
    ],
    "reconstitutionValue": 813,
    "ranDays": 24,
    "ltv": 6.96,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 695.7,
    "assetsCount": 67,
    "entryFees": 10.0,
    "managementFees": 9.2,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8",
    "nombreLocataires": 254
  },
  {
    "id": 49,
    "name": "Sofiprime",
    "yield": 0.54,
    "price": 280,
    "minInvestment": 2800,
    "category": "Bureaux",
    "managementCompany": "Sofidy",
    "tof": 79.47,
    "capitalization": "44.9M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 98
      },
      {
        "name": ", Commerces",
        "value": 2
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 41
      },
      {
        "name": "Régions françaises",
        "value": 25
      },
      {
        "name": "Île-de-France hors Paris",
        "value": 34
      }
    ],
    "reconstitutionValue": 273,
    "ranDays": 22,
    "ltv": 21.0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "assetsCount": 26,
    "entryFees": 10.0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 50,
    "name": "Transitions Europe",
    "yield": 7.6,
    "price": 202.0,
    "minInvestment": 1000,
    "category": "Bureaux",
    "managementCompany": "Arkéa REIM",
    "tof": 98.5,
    "capitalization": "1250.0M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 35.0
      },
      {
        "name": "Commerce",
        "value": 25.0
      },
      {
        "name": "Logistique",
        "value": 15.0
      },
      {
        "name": "Life Science",
        "value": 11.0
      },
      {
        "name": "Hospitalité",
        "value": 6.0
      },
      {
        "name": "Activité",
        "value": 5.0
      },
      {
        "name": "Éducation",
        "value": 3.0
      }
    ],
    "geography": [
      {
        "name": "Espagne",
        "value": 34.0
      },
      {
        "name": "Allemagne",
        "value": 20.0
      },
      {
        "name": "Pays-Bas",
        "value": 14.0
      },
      {
        "name": "Italie",
        "value": 12.0
      },
      {
        "name": "Irlande",
        "value": 10.0
      },
      {
        "name": "Pologne",
        "value": 7.0
      },
      {
        "name": "Belgique",
        "value": 3.0
      }
    ],
    "reconstitutionValue": 210,
    "ranDays": 26,
    "ltv": 10,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité",
    "valeurRetrait": 181.8,
    "assetsCount": 56,
    "entryFees": 10.0,
    "managementFees": 10.0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 319
  },
  {
    "id": 51,
    "name": "Urban Coeur de Commerce",
    "yield": 5.3,
    "price": 303.0,
    "minInvestment": 3000,
    "category": "Commerce",
    "managementCompany": "Urban Premium",
    "tof": 91.95,
    "capitalization": "92.36M€",
    "sectors": [
      {
        "name": "Alimentation / Restauration",
        "value": 34.0
      },
      {
        "name": "Opportunités & tendances (discount, bijouteries...)",
        "value": 27.0
      },
      {
        "name": "Santé, sport & bien-être",
        "value": 26.0
      },
      {
        "name": "Services de proximité",
        "value": 13.0
      }
    ],
    "geography": [
      {
        "name": "Province",
        "value": 86.0
      },
      {
        "name": "Île-de-France",
        "value": 14.0
      }
    ],
    "reconstitutionValue": 284,
    "ranDays": 11,
    "ltv": 12.2,
    "hasWaitingShares": true,
    "strategy": "Portefeuille orienté vers les actifs commerciaux et de retail",
    "valeurRetrait": 264.31,
    "assetsCount": 123,
    "entryFees": 11.833,
    "managementFees": 12.0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 104
  },
  {
    "id": 52,
    "name": "NCap Continent",
    "yield": 7.1,
    "price": 210,
    "minInvestment": 2100,
    "category": "Diversifié",
    "managementCompany": "Norma Capital",
    "tof": 100.0,
    "capitalization": "71.5M€",
    "sectors": [
      {
        "name": "Commerce",
        "value": 74.0
      },
      {
        "name": "Bureaux",
        "value": 12.0
      },
      {
        "name": "Activités",
        "value": 9.0
      },
      {
        "name": "Éducation",
        "value": 5.0
      }
    ],
    "geography": [
      {
        "name": "Royaume-Uni",
        "value": 54.0
      },
      {
        "name": "Espagne",
        "value": 38.0
      },
      {
        "name": "Allemagne",
        "value": 8.0
      }
    ],
    "ltv": 11.42,
    "versementLoyers": "Mensuel",
    "distribution": 13.96,
    "reconstitutionValue": 214.87,
    "strategy": "SCPI diversifiée européenne multi-pays et multi-secteurs visant une diversification optimale",
    "valeurRetrait": 154.98,
    "assetsCount": 18,
    "entryFees": 10.0,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8",
    "nombreLocataires": 25
  },
  {
    "id": 53,
    "name": "Wemo One",
    "yield": 15.27,
    "price": 210,
    "minInvestment": 2100,
    "category": "Diversifié",
    "managementCompany": "Wemo REIM",
    "tof": 100,
    "capitalization": "121.9M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 66.7
      },
      {
        "name": "Activités",
        "value": 18.4
      },
      {
        "name": "Industriel",
        "value": 6.6
      },
      {
        "name": "Éducation",
        "value": 5.2
      },
      {
        "name": "Bureaux",
        "value": 3.1
      }
    ],
    "geography": [
      {
        "name": "Italie",
        "value": 46.1
      },
      {
        "name": "Espagne",
        "value": 29.4
      },
      {
        "name": "France",
        "value": 20.9
      },
      {
        "name": "Irlande",
        "value": 3.6
      }
    ],
    "versementLoyers": "Mensuel",
    "strategy": "SCPI jeune (2024) à stratégie de rendement élevé, pan-européenne (Italie, Espagne, France, Irlande)",
    "ltv": 14,
    "valeurRetrait": 189,
    "assetsCount": 33,
    "entryFees": 10,
    "managementFees": 11,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 6"
  },
  {
    "id": 54,
    "name": "Iroko Atlas",
    "yield": 9.66,
    "price": 200,
    "minInvestment": 2000,
    "category": "Diversifié",
    "managementCompany": "Iroko",
    "tof": 99.93,
    "capitalization": "120M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 63.6
      },
      {
        "name": "Santé, hôtellerie, autre",
        "value": 11.6
      },
      {
        "name": "Entrepôts",
        "value": 10.1
      },
      {
        "name": "Bureaux",
        "value": 9.0
      },
      {
        "name": "Locaux d'activités",
        "value": 5.7
      }
    ],
    "geography": [
      {
        "name": "Royaume-Uni",
        "value": 37.6
      },
      {
        "name": "Pays-Bas",
        "value": 28.9
      },
      {
        "name": "Allemagne",
        "value": 10.8
      },
      {
        "name": "Espagne",
        "value": 10.2
      },
      {
        "name": "Irlande",
        "value": 6.9
      },
      {
        "name": "Tchéquie",
        "value": 5.7
      }
    ],
    "versementLoyers": "Mensuel",
    "distribution": 19.32,
    "reconstitutionValue": 204.87,
    "valeurRetrait": 200,
    "strategy": "SCPI diversifiée multi-secteurs (commerces, entrepôts, bureaux) à vocation européenne, distributions mensuelles",
    "ltv": 0,
    "assetsCount": 14,
    "entryFees": 0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 20
  },
  {
    "id": 55,
    "name": "Epsicap Nano",
    "yield": 6.08,
    "price": 257,
    "minInvestment": 2570,
    "category": "Diversifié",
    "managementCompany": "Epsicap",
    "tof": 97.9,
    "capitalization": "202M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 54
      },
      {
        "name": "Logistique, Locaux d'activité",
        "value": 19
      },
      {
        "name": "Bureaux",
        "value": 13
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 8
      },
      {
        "name": "Santé et éducation",
        "value": 5
      },
      {
        "name": "Alternatifs",
        "value": 1
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 62
      },
      {
        "name": "Royaume-Uni",
        "value": 22
      },
      {
        "name": "Espagne",
        "value": 12
      },
      {
        "name": "Portugal",
        "value": 4
      }
    ],
    "versementLoyers": "Mensuel",
    "distribution": 18,
    "strategy": "SCPI à dividendes mensuels, stratégie de rendement et liquidité pour investisseurs court terme",
    "ltv": 26.5,
    "valeurRetrait": 244.15,
    "assetsCount": 56,
    "entryFees": 5,
    "managementFees": 10,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8"
  },
  {
    "id": 56,
    "name": "Alta Convictions",
    "yield": 6.57,
    "price": 308,
    "minInvestment": 3080,
    "category": "Diversifié",
    "managementCompany": "Altarea Investment Managers",
    "tof": 96,
    "capitalization": "121M€",
    "sectors": [
      {
        "name": "Diversifié",
        "value": 100
      }
    ],
    "geography": [
      {
        "name": "Nouvelle-Aquitaine",
        "value": 43
      },
      {
        "name": "Auvergne-Rhône-Alpes",
        "value": 20
      },
      {
        "name": "Île-de-France",
        "value": 13
      },
      {
        "name": "Espagne",
        "value": 8
      },
      {
        "name": "Grand Est",
        "value": 6
      },
      {
        "name": "Hauts-de-France",
        "value": 6
      },
      {
        "name": "Centre-Val de Loire",
        "value": 4
      }
    ],
    "versementLoyers": "Mensuel",
    "distribution": 20.64,
    "strategy": "SCPI à fortes convictions, sélection d'actifs premium en France et Europe",
    "ltv": 10,
    "valeurRetrait": 281.97,
    "assetsCount": 18,
    "entryFees": 8.45,
    "managementFees": 0.74,
    "dureeDetentionRecommandee": 9,
    "sfdr": "Article 8",
    "nombreLocataires": 30
  },
  {
    "id": 57,
    "name": "Cristal Rente",
    "yield": 5,
    "price": 255.68,
    "minInvestment": 2556.8,
    "category": "Diversifié",
    "managementCompany": "Inter Gestion REIM",
    "tof": 98.99,
    "capitalization": "682.95M€",
    "sectors": [
      {
        "name": "Commerce alimentaire",
        "value": 48.51
      },
      {
        "name": "Bricolage et jardinerie",
        "value": 28.23
      },
      {
        "name": "Restauration",
        "value": 13.27
      },
      {
        "name": "Autre",
        "value": 9.99
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 67.69
      },
      {
        "name": "Île-de-France",
        "value": 16.99
      },
      {
        "name": "Espagne",
        "value": 8.65
      },
      {
        "name": "Irlande",
        "value": 4.05
      },
      {
        "name": "Pays-Bas",
        "value": 2.62
      }
    ],
    "versementLoyers": "Trimestriel",
    "distribution": 12.78,
    "strategy": "SCPI de rendement diversifiée, actifs tertiaires sélectionnés pour leur qualité locative",
    "valeurRetrait": 225,
    "assetsCount": 153,
    "entryFees": 12,
    "managementFees": 1.12,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 58,
    "name": "Rivoli Avenir Patrimoine",
    "yield": 3.46,
    "price": 228,
    "minInvestment": 2280,
    "category": "Bureaux",
    "managementCompany": "Amundi Immobilier",
    "tof": 86.03,
    "capitalization": "2927M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 79.1
      },
      {
        "name": "Commerces",
        "value": 13.9
      },
      {
        "name": "Hôtels",
        "value": 3.3
      },
      {
        "name": "Logistique",
        "value": 3.1
      },
      {
        "name": "Résidences Services",
        "value": 0.7
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 45.6
      },
      {
        "name": "Île-de-France",
        "value": 23.4
      },
      {
        "name": "Régions (France)",
        "value": 11.0
      },
      {
        "name": "Allemagne",
        "value": 10.4
      },
      {
        "name": "Espagne",
        "value": 3.7
      },
      {
        "name": "Pays-Bas",
        "value": 2.7
      },
      {
        "name": "Belgique",
        "value": 0.9
      },
      {
        "name": "Autriche",
        "value": 0.9
      },
      {
        "name": "Rép. Tchèque",
        "value": 0.9
      },
      {
        "name": "Pologne",
        "value": 0.6
      }
    ],
    "ltv": 38.6,
    "versementLoyers": "Trimestriel",
    "assetsCount": 181,
    "strategy": "SCPI de bureaux franciliens et européens, grand patrimoine tertiaire avec diversification sectorielle",
    "valeurRetrait": 209.78,
    "entryFees": 7.993,
    "managementFees": 0.89,
    "dureeDetentionRecommandee": 8,
    "sfdr": "Article 8"
  },
  {
    "id": 59,
    "name": "Primovie",
    "yield": 4.04,
    "price": 164,
    "minInvestment": 1640,
    "category": "Santé",
    "managementCompany": "Praemia REIM France",
    "tof": 94.7,
    "capitalization": "4.2Md€",
    "sectors": [
      {
        "name": "Santé / Sénior",
        "value": 78.6
      },
      {
        "name": "Bureaux",
        "value": 16.3
      },
      {
        "name": "Éducation",
        "value": 3.9
      },
      {
        "name": "Hôtellerie",
        "value": 1.2
      }
    ],
    "geography": [
      {
        "name": "France hors région parisienne",
        "value": 37.5
      },
      {
        "name": "Île-de-France hors Paris",
        "value": 23.7
      },
      {
        "name": "Allemagne",
        "value": 18.5
      },
      {
        "name": "Italie",
        "value": 12.8
      },
      {
        "name": "Paris",
        "value": 4.8
      },
      {
        "name": "Espagne",
        "value": 2.0
      },
      {
        "name": "Belgique",
        "value": 0.5
      },
      {
        "name": "Pays-Bas",
        "value": 0.3
      }
    ],
    "ltv": 29.2,
    "versementLoyers": "Trimestriel",
    "assetsCount": 298,
    "valeurRealisation": 149.24,
    "strategy": "SCPI santé et sénior, investissement en EHPAD, cliniques et résidences services en France et Europe",
    "valeurRetrait": 149.24,
    "entryFees": 9,
    "managementFees": 10,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 60,
    "name": "Praemia Hôtels Europe",
    "yield": 3.9,
    "price": 204,
    "minInvestment": 2040,
    "category": "Hôtellerie",
    "managementCompany": "Praemia REIM France",
    "tof": 97.7,
    "capitalization": "252.5M€",
    "sectors": [
      {
        "name": "Hôtel",
        "value": 67.3
      },
      {
        "name": "Résidentiel",
        "value": 15.1
      },
      {
        "name": "Commerce",
        "value": 10.0
      },
      {
        "name": "Mixte Résidentiel / Commerce",
        "value": 7.6
      }
    ],
    "geography": [
      {
        "name": "France hors région parisienne",
        "value": 37.8
      },
      {
        "name": "Grèce",
        "value": 15.9
      },
      {
        "name": "Irlande",
        "value": 15.5
      },
      {
        "name": "Île-de-France hors Paris",
        "value": 12.9
      },
      {
        "name": "Paris",
        "value": 7.9
      },
      {
        "name": "Belgique",
        "value": 5.5
      },
      {
        "name": "Espagne",
        "value": 4.2
      },
      {
        "name": "Italie",
        "value": 0.3
      }
    ],
    "ltv": 30.9,
    "versementLoyers": "Trimestriel",
    "assetsCount": 117,
    "distribution": 5.6,
    "valeurRealisation": 170.19,
    "reconstitutionValue": 201.43,
    "strategy": "SCPI hôtelière européenne (ex-Primofamily), pivot stratégique vers l'hôtellerie et le résidentiel européen",
    "valeurRetrait": 185.64,
    "entryFees": 9,
    "managementFees": 10,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8"
  },
  {
    "id": 61,
    "name": "Pierval Santé",
    "yield": 4.39,
    "price": 204,
    "minInvestment": 2040,
    "category": "Santé",
    "managementCompany": "Euryale AM",
    "tof": 94.59,
    "capitalization": "3300M€",
    "sectors": [
      {
        "name": "Secteur médico-social (EHPAD/Alzheimer, hébergement, RSS)",
        "value": 71.7
      },
      {
        "name": "Secteur sanitaire et soins de ville (cliniques, cabinets, dialyse)",
        "value": 19.9
      },
      {
        "name": "Autres secteurs santé (laboratoires, sièges, bureaux, locaux d'activité)",
        "value": 8.4
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 90
      },
      {
        "name": "Europe",
        "value": 10
      }
    ],
    "ltv": 16.39,
    "versementLoyers": "Trimestriel",
    "distribution": 7.36,
    "strategy": "SCPI santé référente, actifs médico-sociaux (cliniques, EHPAD, cabinets) en France et Europe",
    "valeurRetrait": 182.56,
    "assetsCount": 252,
    "entryFees": 10.51,
    "managementFees": 1.22,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "nombreLocataires": 1005,
    "reconstitutionValue": 199.2
  },
  {
    "id": 62,
    "name": "Patrimmo Commerce",
    "yield": 3.38,
    "price": 160,
    "minInvestment": 1600,
    "category": "Commerces",
    "managementCompany": "Praemia REIM France",
    "tof": 91,
    "capitalization": "613.7M€",
    "sectors": [
      {
        "name": "Commerce",
        "value": 86.7
      },
      {
        "name": "Bureaux",
        "value": 11.6
      },
      {
        "name": "Activité / Logistique",
        "value": 1.7
      }
    ],
    "geography": [
      {
        "name": "France hors région parisienne",
        "value": 47.1
      },
      {
        "name": "Paris",
        "value": 14.2
      },
      {
        "name": "Belgique",
        "value": 13.8
      },
      {
        "name": "Île-de-France hors Paris",
        "value": 12.9
      },
      {
        "name": "Pays-Bas",
        "value": 5.5
      },
      {
        "name": "Italie",
        "value": 3.9
      },
      {
        "name": "Allemagne",
        "value": 2.6
      }
    ],
    "ltv": 24.1,
    "versementLoyers": "Trimestriel",
    "assetsCount": 193,
    "distribution": 5,
    "valeurRealisation": 145.6,
    "strategy": "SCPI de commerces, surfaces de pieds d'immeuble et commerces de centre-ville en France",
    "valeurRetrait": 145.6,
    "entryFees": 9.0,
    "managementFees": 10.0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 8",
    "reconstitutionValue": 151.36
  },
  {
    "id": 63,
    "name": "Aestiam Agora",
    "yield": 4.5,
    "price": 922,
    "minInvestment": 9220,
    "category": "Diversifié",
    "managementCompany": "Aestiam",
    "tof": 91.7,
    "capitalization": "468M€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 57
      },
      {
        "name": "Hôtels / Séminaires",
        "value": 34
      },
      {
        "name": "Bureaux",
        "value": 6
      },
      {
        "name": "Enseignement",
        "value": 3
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 30
      },
      {
        "name": "Île-de-France (IDF)",
        "value": 29
      },
      {
        "name": "Sud-Est",
        "value": 11
      },
      {
        "name": "Europe",
        "value": 11
      },
      {
        "name": "Nord",
        "value": 8
      },
      {
        "name": "Nord-Est",
        "value": 4
      },
      {
        "name": "Sud-Ouest",
        "value": 4
      },
      {
        "name": "Nord-Ouest",
        "value": 3
      }
    ],
    "ltv": 12,
    "versementLoyers": "Trimestriel",
    "assetsCount": 193,
    "distribution": 35.64,
    "strategy": "SCPI diversifiée multisectorielle (commerces, hôtels, bureaux), patrimoine tertiaire de qualité",
    "valeurRetrait": 829.8,
    "entryFees": 10.0,
    "managementFees": 10.0,
    "dureeDetentionRecommandee": 10,
    "sfdr": "Article 6",
    "nombreLocataires": 265,
    "reconstitutionValue": 965.93
  }
];
export const scpiDataExtended: SCPIExtended[] = baseSCPIData;

export default scpiDataExtended;
