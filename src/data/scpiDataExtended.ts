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
    "tof": 92.8,
    "capitalization": "1,4Md€",
    "sectors": [
      {
        "name": "Entrepôts logistiques",
        "value": 51.0
      },
      {
        "name": "Locaux d'activités",
        "value": 31.0
      },
      {
        "name": "Logistique urbaine",
        "value": 10.0
      },
      {
        "name": "Transport",
        "value": 7.0
      },
      {
        "name": "Autres",
        "value": 1.0
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 78.2
      },
      {
        "name": "Espagne",
        "value": 13.8
      },
      {
        "name": "Portugal",
        "value": 4.2
      },
      {
        "name": "Italie",
        "value": 1.5
      },
      {
        "name": "Allemagne",
        "value": 1.0
      },
      {
        "name": "Autres",
        "value": 0.3
      }
    ],
    "reconstitutionValue": 609.65,
    "valeurRetrait": 545.34,
    "valeurRealisation": 507.28,
    "ranDays": 0,
    "ltv": 1.46,
    "hasWaitingShares": false,
    "withdrawalDelay": "1er jour du 3ème mois",
    "entryFees": 12,
    "managementFees": 10,
    "assetsCount": 78,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
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
    "yield": 5.4,
    "price": 350,
    "minInvestment": 350,
    "category": "Bureaux",
    "managementCompany": "Aestiam",
    "tof": 86.5,
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
        "value": 2
      },
      {
        "name": "Enseignement",
        "value": 4
      },
      {
        "name": "Locaux d'activités",
        "value": 2
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 20
      },
      {
        "name": "Région Parisienne",
        "value": 30
      },
      {
        "name": "Régions",
        "value": 39
      },
      {
        "name": "Etranger",
        "value": 11
      }
    ],
    "reconstitutionValue": 346,
    "ranDays": 42,
    "ltv": 12,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 5,
    "name": "Altixia Cadence 12",
    "yield": 5.73,
    "price": 200,
    "minInvestment": 2000,
    "category": "Diversifiée",
    "managementCompany": "ALTIXIA REIM",
    "tof": 92.6,
    "capitalization": "188.26M€",
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
    "ltv": 10.56,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 6,
    "name": "Altixia Commerces",
    "yield": 5.12,
    "price": 203,
    "minInvestment": 2030,
    "category": "Bureaux",
    "managementCompany": "ALTIXIA REIM",
    "tof": 90.77,
    "capitalization": "108M€",
    "sectors": [
      {
        "name": "Bureaux et activités",
        "value": 4
      },
      {
        "name": "Commerces en retail park",
        "value": 58
      },
      {
        "name": "Commerces en pied d'immeuble",
        "value": 38
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 9
      },
      {
        "name": "Régions",
        "value": 62
      },
      {
        "name": "Ile-de-France",
        "value": 29
      }
    ],
    "reconstitutionValue": 190,
    "ranDays": 102,
    "ltv": 29,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
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
    "capitalization": "299M€",
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
        "value": 33
      },
      {
        "name": "Belgique",
        "value": 23
      },
      {
        "name": "Pays-Bas",
        "value": 14
      },
      {
        "name": "Allemagne",
        "value": 30
      }
    ],
    "reconstitutionValue": 993,
    "ranDays": 18,
    "ltv": 18,
    "hasWaitingShares": false,
    "strategy": "Portefeuille d'actifs hôteliers et de tourisme"
  },
  {
    "id": 8,
    "name": "Buroboutic Métropoles",
    "yield": 5.07,
    "price": 230,
    "minInvestment": 2300,
    "category": "Bureaux",
    "managementCompany": "FIDUCIAL Gérance",
    "tof": 97.17,
    "capitalization": "319M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 32.2
      },
      {
        "name": "Locaux commerciaux",
        "value": 50.8
      },
      {
        "name": "Locaux d'activités",
        "value": 17
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 14.8
      },
      {
        "name": "Régions",
        "value": 53.3
      },
      {
        "name": "Ile-de-France",
        "value": 31.9
      }
    ],
    "reconstitutionValue": 213,
    "ranDays": 108,
    "ltv": 20,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 9,
    "name": "Coeur d'Europe",
    "yield": 6.02,
    "price": 200,
    "minInvestment": 2000,
    "category": "Diversifiée",
    "managementCompany": "Sogenial Immobilier",
    "tof": 98.56,
    "capitalization": "170M€",
    "sectors": [
      {
        "name": "Espagne",
        "value": 38.7
      },
      {
        "name": "Belgique",
        "value": 30.4
      },
      {
        "name": "Portugal",
        "value": 20.7
      },
      {
        "name": "Allemagne",
        "value": 10.2
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 20
      },
      {
        "name": "Italie",
        "value": 12
      },
      {
        "name": "Espagne",
        "value": 8
      },
      {
        "name": "Pays-Bas",
        "value": 16
      },
      {
        "name": "Allemagne",
        "value": 44
      }
    ],
    "reconstitutionValue": 209,
    "ranDays": 86,
    "ltv": 18,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 10,
    "name": "Coeur de Région",
    "yield": 6.2,
    "price": 664,
    "minInvestment": 2656,
    "category": "Diversifiée",
    "managementCompany": "Sogenial Immobilier",
    "tof": 96.62,
    "capitalization": "385M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 51.08
      },
      {
        "name": "Commerces",
        "value": 29.62
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 17.47
      },
      {
        "name": "Santé et éducation",
        "value": 1.77
      },
      {
        "name": "Alternatifs",
        "value": 0.06
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 86.0
      },
      {
        "name": "Île-de-France",
        "value": 14.0
      }
    ],
    "reconstitutionValue": 640,
    "ranDays": 22,
    "ltv": 17,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 11,
    "name": "Coeur de ville",
    "yield": 5.3,
    "price": 210,
    "minInvestment": 2100,
    "category": "Diversifiée",
    "managementCompany": "Sogenial Immobilier",
    "tof": 98.31,
    "capitalization": "28.5M€",
    "sectors": [
      {
        "name": "Services",
        "value": 21.4
      },
      {
        "name": "Commerce alimentaire",
        "value": 46.1
      },
      {
        "name": "Santé et éducation",
        "value": 3.2
      },
      {
        "name": "Commerce non alimentaire",
        "value": 29.2
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 15.6
      },
      {
        "name": "Province",
        "value": 84.4
      }
    ],
    "reconstitutionValue": 237,
    "ranDays": 23,
    "ltv": 17,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 12,
    "name": "Comète",
    "yield": 9.0,
    "price": 250,
    "minInvestment": 5000,
    "category": "Diversifiée",
    "managementCompany": "Alderan",
    "tof": 99.1,
    "capitalization": "519,6M€",
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
        "value": 46.5
      },
      {
        "name": "Espagne",
        "value": 15.4
      },
      {
        "name": "Italie",
        "value": 12.4
      },
      {
        "name": "Pays-Bas",
        "value": 10.3
      },
      {
        "name": "Canada",
        "value": 6.6
      },
      {
        "name": "Pologne",
        "value": 5.2
      },
      {
        "name": "Irlande",
        "value": 3.6
      }
    ],
    "reconstitutionValue": 255,
    "ranDays": 86,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 13,
    "name": "Crédit Mutuel Pierre 1",
    "yield": 4.52,
    "price": 210,
    "minInvestment": 210,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 93.8,
    "capitalization": "2,2Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 80.1
      },
      {
        "name": "Locaux commerciaux",
        "value": 19.9
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 26.9
      },
      {
        "name": "Régions",
        "value": 16.8
      },
      {
        "name": "Allemagne",
        "value": 3.1
      },
      {
        "name": "Île-de-France",
        "value": 53.2
      }
    ],
    "reconstitutionValue": 207,
    "ranDays": 10,
    "ltv": 26,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 14,
    "name": "Cristal Life",
    "yield": 6.51,
    "price": 208,
    "minInvestment": 2080,
    "category": "Santé",
    "managementCompany": "Inter Gestion REIM",
    "tof": 99.87,
    "capitalization": "301M€",
    "sectors": [
      {
        "name": "Santé",
        "value": 14
      },
      {
        "name": "Bureaux",
        "value": 22
      },
      {
        "name": "Commerce",
        "value": 42
      },
      {
        "name": "Éducation",
        "value": 10
      },
      {
        "name": "Résidentiel",
        "value": 12
      }
    ],
    "geography": [
      {
        "name": "France (Régions)",
        "value": 50.41
      },
      {
        "name": "France (Île-de-France)",
        "value": 2.38
      },
      {
        "name": "Europe (hors France)",
        "value": 47.21
      }
    ],
    "reconstitutionValue": 257,
    "ranDays": 6,
    "ltv": 25,
    "hasWaitingShares": false,
    "strategy": "Spécialisée dans les actifs de santé avec une forte exposition aux EHPAD et cliniques"
  },
  {
    "id": 15,
    "name": "Edissimo",
    "yield": 4.45,
    "price": 338,
    "minInvestment": 338,
    "category": "Bureaux",
    "managementCompany": "Amundi Immobilier",
    "tof": 89.45,
    "capitalization": "1,6Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 88
      },
      {
        "name": "Logistique",
        "value": 3
      },
      {
        "name": "Hôtellerie",
        "value": 9
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 65
      },
      {
        "name": "Régions",
        "value": 5
      },
      {
        "name": "Île-de-France",
        "value": 30
      }
    ],
    "reconstitutionValue": 334,
    "ranDays": 116,
    "ltv": 33,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 16,
    "name": "Efimmo 1",
    "yield": 5.07,
    "price": 212,
    "minInvestment": 212,
    "category": "Bureaux",
    "managementCompany": "Sofidy",
    "tof": 87.67,
    "capitalization": "1,7Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 73.5
      },
      {
        "name": "Autres locaux commerciaux",
        "value": 9.3
      },
      {
        "name": "Divers",
        "value": 7.5
      },
      {
        "name": "Commerces de centre-ville et milieu urbain",
        "value": 5.2
      },
      {
        "name": "Éducation",
        "value": 4.5
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 74.5
      },
      {
        "name": "Paris Centre",
        "value": 10.0
      },
      {
        "name": "Grand Paris",
        "value": 35.6
      },
      {
        "name": "Métropoles françaises",
        "value": 28.9
      },
      {
        "name": "Étranger",
        "value": 25.5
      },
      {
        "name": "Allemagne",
        "value": 10.0
      },
      {
        "name": "Pays-Bas",
        "value": 5.1
      },
      {
        "name": "Royaume-Uni",
        "value": 4.2
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
        "value": 1.2
      },
      {
        "name": "Espagne",
        "value": 0.6
      },
      {
        "name": "Reste de l'Europe",
        "value": 0.7
      }
    ],
    "reconstitutionValue": 202.65,
    "valeurRetrait": 190.80,
    "valeurRealisation": 168.78,
    "ranDays": 0,
    "ltv": 20.2,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 17,
    "name": "Épargne Foncière",
    "yield": 4.52,
    "price": 670,
    "minInvestment": 670,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 89.2,
    "capitalization": "5,2Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 71
      },
      {
        "name": "Hôtels",
        "value": 5.7
      },
      {
        "name": "Commerces",
        "value": 19.4
      },
      {
        "name": "Santé et éducation",
        "value": 3.4
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 0.5
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 22.4
      },
      {
        "name": "Irlande",
        "value": 0.4
      },
      {
        "name": "Pays-Bas",
        "value": 1.5
      },
      {
        "name": "Régions",
        "value": 31.8
      },
      {
        "name": "Allemagne",
        "value": 5.4
      },
      {
        "name": "Royaume-Uni",
        "value": 0.9
      },
      {
        "name": "Île-de-France",
        "value": 37.6
      }
    ],
    "reconstitutionValue": 672,
    "ranDays": 54,
    "ltv": 33,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 18,
    "name": "Épargne Pierre",
    "yield": 5.28,
    "price": 208,
    "minInvestment": 2080,
    "category": "Diversifiée",
    "managementCompany": "Atland Voisin",
    "tof": 94.30,
    "capitalization": "2,8Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 48.15
      },
      {
        "name": "Commerces",
        "value": 29.35
      },
      {
        "name": "Activités/Entrepôts",
        "value": 8.41
      },
      {
        "name": "Tourisme/Hôtel",
        "value": 8.70
      },
      {
        "name": "Santé/Education",
        "value": 5.23
      },
      {
        "name": "Résidentiel/Alternatif",
        "value": 0.16
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 27.57
      },
      {
        "name": "Île-de-France",
        "value": 15.43
      },
      {
        "name": "Sud-Ouest",
        "value": 17.39
      },
      {
        "name": "Nord-Ouest",
        "value": 12.92
      },
      {
        "name": "Nord",
        "value": 12.65
      },
      {
        "name": "Sud-Est",
        "value": 14.04
      },
      {
        "name": "Nord-Est",
        "value": 11.15
      }
    ],
    "reconstitutionValue": 208.64,
    "valeurRetrait": 187.20,
    "valeurRealisation": 170.10,
    "ranDays": 0,
    "ltv": 11.0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 19,
    "name": "Épargne Pierre Europe",
    "yield": 5.50,
    "price": 200,
    "minInvestment": 6000,
    "category": "Diversifiée",
    "managementCompany": "Atland Voisin",
    "tof": 100,
    "capitalization": "479M€",
    "sectors": [
      {
        "name": "Hôtellerie",
        "value": 35.56
      },
      {
        "name": "Bureaux",
        "value": 27.34
      },
      {
        "name": "Commerces",
        "value": 19.22
      },
      {
        "name": "Activités/Entrepôts",
        "value": 11.52
      },
      {
        "name": "Santé",
        "value": 6.36
      }
      ],
    "geography": [
      {
        "name": "Irlande",
        "value": 33.97
      },
      {
        "name": "Allemagne",
        "value": 30.47
      },
      {
        "name": "Espagne",
        "value": 24.04
      },
      {
        "name": "Pays-Bas",
        "value": 11.52
      }
    ],
    "reconstitutionValue": 206.51,
    "valeurRetrait": 180,
    "valeurRealisation": 176.3,
    "ranDays": 0,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Investissement dans des actifs immobiliers européens diversifiés"
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
        "value": 27.30
      },
      {
        "name": "Logistique",
        "value": 24.23
      },
      {
        "name": "Bureaux",
        "value": 19.60
      },
      {
        "name": "Hôtellerie",
        "value": 17.40
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
    "valeurRetrait": 169.20,
    "valeurRealisation": 152.49,
    "ranDays": 0,
    "ltv": 28.0,
    "hasWaitingShares": false,
    "strategy": "SCPI ISR investissant dans des actifs immobiliers responsables en France et en Europe"
  },
  {
    "id": 21,
    "name": "Ficommerce Proximité",
    "yield": 5.07,
    "price": 210,
    "minInvestment": 2100,
    "category": "Bureaux",
    "managementCompany": "FIDUCIAL Gérance",
    "tof": 95.72,
    "capitalization": "600M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 15.8
      },
      {
        "name": "Locaux commerciaux",
        "value": 84.1
      },
      {
        "name": "Entrepôts et activités",
        "value": 0.1
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 25.8
      },
      {
        "name": "Europe",
        "value": 2.5
      },
      {
        "name": "Régions",
        "value": 51.8
      },
      {
        "name": "Île-de-France",
        "value": 19.9
      }
    ],
    "reconstitutionValue": 238,
    "ranDays": 77,
    "ltv": 20,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 22,
    "name": "Foncière des Praticiens",
    "yield": 5.5,
    "price": 1100,
    "minInvestment": 1100,
    "category": "Santé",
    "managementCompany": "MAGELLIM REIM",
    "tof": 97.08,
    "capitalization": "179M€",
    "sectors": [
      {
        "name": "Lieux de soins, de traitement et de consultation",
        "value": 46
      },
      {
        "name": "Locaux d'accompagnement et rééducation",
        "value": 37
      },
      {
        "name": "Locaux supports au secteur de la santé",
        "value": 17
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 70
      },
      {
        "name": "Belgique",
        "value": 30
      }
    ],
    "reconstitutionValue": 1069,
    "ranDays": 27,
    "ltv": 22,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 23,
    "name": "GMA Essentialis",
    "yield": 0,
    "price": 150,
    "minInvestment": 2060,
    "category": "Diversifiée",
    "managementCompany": "GREENMAN ARTH",
    "tof": 99.67,
    "capitalization": "42M€",
    "sectors": [
      {
        "name": "Tertiaire",
        "value": 10
      },
      {
        "name": "Alimentaire",
        "value": 90
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
    "ltv": 18,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 24,
    "name": "Grand Paris Résidentiel",
    "yield": 0,
    "price": 200,
    "minInvestment": 200,
    "category": "Diversifiée",
    "managementCompany": "Inter Gestion REIM",
    "tof": 92.14,
    "capitalization": "12M€",
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
        "name": "Régions",
        "value": 13
      },
      {
        "name": "Ile-de-France",
        "value": 87
      }
    ],
    "reconstitutionValue": 186,
    "ranDays": 43,
    "ltv": 20,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 25,
    "name": "Immorente",
    "yield": 5.04,
    "price": 340,
    "minInvestment": 1360,
    "category": "Diversifiée",
    "managementCompany": "SOFIDY",
    "tof": 92.61,
    "capitalization": "4,4Md€",
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
    "ltv": 29,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 26,
    "name": "Iroko Zen",
    "yield": 7.12,
    "price": 204,
    "minInvestment": 204,
    "category": "Bureaux",
    "managementCompany": "Iroko",
    "tof": 98.1,
    "capitalization": "1,2Md€",
    "sectors": [
      {
        "name": "Commerces",
        "value": 36.2
      },
      {
        "name": "Bureaux",
        "value": 29.4
      },
      {
        "name": "Locaux d'activités",
        "value": 15.1
      },
      {
        "name": "Entrepôts",
        "value": 10.4
      },
      {
        "name": "Santé / Crèches / Éducation / Hôtellerie",
        "value": 9.0
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 29.5
      },
      {
        "name": "Royaume-Uni",
        "value": 25.8
      },
      {
        "name": "Pays-Bas",
        "value": 13.3
      },
      {
        "name": "Espagne",
        "value": 11.5
      },
      {
        "name": "Irlande",
        "value": 10.9
      },
      {
        "name": "Allemagne",
        "value": 8.0
      },
      {
        "name": "Italie",
        "value": 1.0
      }
    ],
    "reconstitutionValue": 213.65,
    "ranDays": 73,
    "ltv": 30.1,
    "hasWaitingShares": false,
    "assetsCount": 164,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 27,
    "name": "Kyaneos Pierre",
    "yield": 4.96,
    "price": 224,
    "minInvestment": 2240,
    "category": "Diversifiée",
    "managementCompany": "KYANEOS ASSET MANAGEMENT",
    "tof": 90,
    "capitalization": "385M€",
    "sectors": [
      {
        "name": "Tertiaire",
        "value": 20
      },
      {
        "name": "Résidentiel",
        "value": 80
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
    "ltv": 38,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 28,
    "name": "LF Avenir Santé",
    "yield": 5.2,
    "price": 300,
    "minInvestment": 300,
    "category": "Diversifiée",
    "managementCompany": "La Française REM",
    "tof": 100,
    "capitalization": "232M€",
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
        "name": "Paris",
        "value": 32.8
      },
      {
        "name": "Irlande",
        "value": 9.7
      },
      {
        "name": "Belgique",
        "value": 11.9
      },
      {
        "name": "Régions",
        "value": 40.1
      },
      {
        "name": "Ile-de-France",
        "value": 5.6
      }
    ],
    "reconstitutionValue": 321,
    "ranDays": 36,
    "ltv": 10,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 29,
    "name": "LF Europimmo",
    "yield": 4.3,
    "price": 725,
    "minInvestment": 725,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 97.3,
    "capitalization": "874M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 87
      },
      {
        "name": ", Commerces",
        "value": 12
      },
      {
        "name": ", Résidences gérées",
        "value": 1
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 16.3
      },
      {
        "name": "Espagne",
        "value": 1.1
      },
      {
        "name": "Belgique",
        "value": 2.2
      },
      {
        "name": "Pays-Bas",
        "value": 8.8
      },
      {
        "name": "Allemagne",
        "value": 71.6
      }
    ],
    "reconstitutionValue": 774,
    "ranDays": 13,
    "ltv": 16,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 30,
    "name": "LF Grand Paris Patrimoine",
    "yield": 4.4,
    "price": 218,
    "minInvestment": 218,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 95.1,
    "capitalization": "1,3Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 75
      },
      {
        "name": "Commerces",
        "value": 25
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 15
      },
      {
        "name": "Ile-de-France",
        "value": 85
      }
    ],
    "reconstitutionValue": 225,
    "ranDays": 50,
    "ltv": 20,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 31,
    "name": "Log In",
    "yield": 6,
    "price": 250,
    "minInvestment": 1000,
    "category": "Bureaux",
    "managementCompany": "THEOREIM",
    "tof": 98.6,
    "capitalization": "192M€",
    "sectors": [
      {
        "name": ", Bureaux",
        "value": 3
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 97
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 40
      },
      {
        "name": "Belgique",
        "value": 10
      },
      {
        "name": "Pays-Bas",
        "value": 15
      },
      {
        "name": "Allemagne",
        "value": 25
      },
      {
        "name": "Royaume-Uni",
        "value": 10
      }
    ],
    "reconstitutionValue": 270,
    "ranDays": 86,
    "ltv": 20,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 32,
    "name": "NCap Education Santé",
    "yield": 4.85,
    "price": 202,
    "minInvestment": 2020,
    "category": "Diversifiée",
    "managementCompany": "Norma Capital",
    "tof": 96.5,
    "capitalization": "110M€",
    "sectors": [
      {
        "name": "Bien-être",
        "value": 16
      },
      {
        "name": "Éducation",
        "value": 16
      },
      {
        "name": "Environnement",
        "value": 2
      },
      {
        "name": "Santé / social",
        "value": 66
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
    "ltv": 10,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 33,
    "name": "NCap Régions",
    "yield": 5.72,
    "price": 682,
    "minInvestment": 3410, // 5 parts minimum * 682€
    "category": "Diversifiée",
    "managementCompany": "Norma Capital",
    "tof": 92.7,
    "capitalization": "1067.7M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 54
      },
      {
        "name": "Commerce",
        "value": 32
      },
      {
        "name": "Activités",
        "value": 14
      }
    ],
    "geography": [
      {
        "name": "Grandes agglomérations de province",
        "value": 65
      },
      {
        "name": "Ile-de-France",
        "value": 35
      }
    ],
    "reconstitutionValue": 701.49,
    "valeurRetrait": 613.80,
    "valeurRealisation": 576.68,
    "ranDays": 0,
    "ltv": 25.9,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 34,
    "name": "Novapierre 1",
    "yield": 5,
    "price": 442,
    "minInvestment": 2210,
    "category": "Diversifiée",
    "managementCompany": "PAREF GESTION",
    "tof": 89.7,
    "capitalization": "180M€",
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
    "ltv": 31,
    "hasWaitingShares": false,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
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
    "yield": 6.01,
    "price": 182.79,
    "minInvestment": 748,
    "category": "Bureaux",
    "managementCompany": "Novaxia Investissement",
    "tof": 91.8,
    "capitalization": "427.9M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 93
      },
      {
        "name": "Hôtels",
        "value": 4
      },
      {
        "name": "Activités",
        "value": 2
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
    "ltv": 35,
    "hasWaitingShares": false,
    "assetsCount": 39,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 37,
    "name": "Opportunité Immo",
    "yield": 5.62,
    "price": 203,
    "minInvestment": 203,
    "category": "Logistique",
    "managementCompany": "La Française REM",
    "tof": 95.3,
    "capitalization": "313M€",
    "sectors": [
      {
        "name": "Logistique et locaux d'activités",
        "value": 89.41
      },
      {
        "name": "Bureaux",
        "value": 10.59
      }
    ],
    "geography": [
      {
        "name": "Île-de-France",
        "value": 47.82
      },
      {
        "name": "Régions",
        "value": 39.93
      },
      {
        "name": "Espagne",
        "value": 5.82
      },
      {
        "name": "Allemagne",
        "value": 4.50
      },
      {
        "name": "Royaume-Uni",
        "value": 1.93
      }
    ],
    "reconstitutionValue": 215.40,
    "valeurRetrait": 184.73,
    "valeurRealisation": 175.34,
    "ranDays": 0,
    "ltv": 14.45,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 38,
    "name": "Optimale",
    "yield": 6.51,
    "price": 250,
    "minInvestment": 1500,
    "category": "Bureaux",
    "managementCompany": "CONSULTIM Asset Management",
    "tof": 96,
    "capitalization": "76M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 65
      },
      {
        "name": ", Commerces",
        "value": 10
      },
      {
        "name": ", Hôtellerie",
        "value": 5
      },
      {
        "name": ", Santé et éducation",
        "value": 5
      },
      {
        "name": ", Logistique et locaux d'activités",
        "value": 15
      }
    ],
    "geography": [
      {
        "name": "Métropoles françaises",
        "value": 100
      }
    ],
    "reconstitutionValue": 241,
    "ranDays": 77,
    "ltv": 13,
    "hasWaitingShares": true,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 39,
    "name": "Paref Evo",
    "yield": 6,
    "price": 250,
    "minInvestment": 1250,
    "category": "Bureaux",
    "managementCompany": "PAREF GESTION",
    "tof": 97.2,
    "capitalization": "47M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 89.7
      },
      {
        "name": "Locaux d'activité",
        "value": 10.3
      }
    ],
    "geography": [
      {
        "name": "Pologne",
        "value": 100
      }
    ],
    "reconstitutionValue": 248,
    "valeurRetrait": 225,
    "valeurRealisation": 214.15,
    "ranDays": 35,
    "ltv": 0,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 40,
    "name": "Paref Hexa",
    "yield": 6,
    "price": 210,
    "minInvestment": 1050,
    "category": "Diversifiée",
    "managementCompany": "PAREF GESTION",
    "tof": 90.5,
    "capitalization": "245.6M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 67.2
      },
      {
        "name": "Locaux d'activité",
        "value": 24.8
      },
      {
        "name": "Logistique et Messagerie",
        "value": 4.5
      },
      {
        "name": "Autres",
        "value": 3.5
      }
    ],
    "geography": [
      {
        "name": "Métropoles régionales",
        "value": 56.0
      },
      {
        "name": "Ile-de-France hors Paris",
        "value": 26.7
      },
      {
        "name": "Paris",
        "value": 5.3
      },
      {
        "name": "Autres régions",
        "value": 12.0
      }
    ],
    "reconstitutionValue": 196.02,
    "valeurRetrait": 189,
    "valeurRealisation": 159.56,
    "ranDays": 0,
    "ltv": 26.6,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
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
    "capitalization": "190M€",
    "sectors": [
      {
        "name": "Logement",
        "value": 100
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 32.6
      },
      {
        "name": "Régions",
        "value": 27.8
      },
      {
        "name": "Parts SCPI",
        "value": 2.8
      },
      {
        "name": "Région parisienne",
        "value": 36.8
      }
    ],
    "reconstitutionValue": 717,
    "ranDays": 43,
    "ltv": 27,
    "hasWaitingShares": true,
    "strategy": "Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque"
  },
  {
    "id": 42,
    "name": "Perial Grand Paris",
    "yield": 5.1,
    "price": 458,
    "minInvestment": 1000,
    "category": "Bureaux",
    "managementCompany": "PERIAL Asset Management",
    "tof": 89.4,
    "capitalization": "1,1Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 94.4
      },
      {
        "name": "Commerces",
        "value": 2.2
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 1.6
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 1.8
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 20.3
      },
      {
        "name": "Régions",
        "value": 4.3
      },
      {
        "name": "Région Parisienne",
        "value": 75.4
      }
    ],
    "reconstitutionValue": 451,
    "ranDays": 10,
    "ltv": 32,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 43,
    "name": "Perial Hospitalité Europe",
    "yield": 4.02,
    "price": 181,
    "minInvestment": 905,
    "category": "Santé",
    "managementCompany": "PERIAL Asset Management",
    "tof": 98.1,
    "capitalization": "333M€",
    "sectors": [
      {
        "name": "Santé et éducation",
        "value": 61
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 37.9
      },
      {
        "name": "Alternatifs, résidences étudiantes",
        "value": 1.1
      }
    ],
    "geography": [
      {
        "name": "Italie",
        "value": 11.4
      },
      {
        "name": "Espagne",
        "value": 17.6
      },
      {
        "name": "Pays-Bas",
        "value": 3.5
      },
      {
        "name": "Allemagne",
        "value": 67.5
      }
    ],
    "reconstitutionValue": 211,
    "ranDays": 13,
    "ltv": 20,
    "hasWaitingShares": false,
    "strategy": "Spécialisée dans les actifs de santé avec une forte exposition aux EHPAD et cliniques"
  },
  {
    "id": 44,
    "name": "Perial O2",
    "yield": 4.91,
    "price": 164,
    "minInvestment": 4920,
    "category": "Bureaux",
    "managementCompany": "PERIAL Asset Management",
    "tof": 91.3,
    "capitalization": "2,4Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 85.4
      },
      {
        "name": "Commerces",
        "value": 3.6
      },
      {
        "name": "Santé & éducation",
        "value": 4.5
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 5.8
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 0.7
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 38.4
      },
      {
        "name": "Région parisienne",
        "value": 36.6
      },
      {
        "name": "Europe (hors France)",
        "value": 22.5
      }
    ],
    "reconstitutionValue": 175,
    "ranDays": 42,
    "ltv": 26,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 45,
    "name": "Perial Opportunités Europe",
    "yield": 6.27,
    "price": 44,
    "minInvestment": 220,
    "category": "Bureaux",
    "managementCompany": "PERIAL Asset Management",
    "tof": 93.6,
    "capitalization": "783.62M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 49.5
      },
      {
        "name": "Commerces",
        "value": 18.3
      },
      {
        "name": "Alternatifs",
        "value": 0.1
      },
      {
        "name": "Santé & éducation",
        "value": 4.9
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 26.3
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 0.8
      }
    ],
    "geography": [
      {
        "name": "Régions",
        "value": 41
      },
      {
        "name": "Région parisienne",
        "value": 19.2
      },
      {
        "name": "Europe (hors France)",
        "value": 39.8
      }
    ],
    "reconstitutionValue": 43.50,
    "valeurRetrait": 39.82,
    "valeurRealisation": 33.93,
    "ranDays": 21,
    "ltv": 28,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 46,
    "name": "Remake Live",
    "yield": 7.5,
    "price": 204,
    "minInvestment": 204,
    "category": "Bureaux",
    "managementCompany": "Remake Asset Management",
    "tof": 99,
    "capitalization": "647M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 37.8
      },
      {
        "name": "Commerces",
        "value": 13.2
      },
      {
        "name": "Alternatifs",
        "value": 1.1
      },
      {
        "name": "Résidentiel",
        "value": 3.7
      },
      {
        "name": "Santé & éducation",
        "value": 24
      },
      {
        "name": "Hôtels, tourisme, loisirs",
        "value": 4.8
      },
      {
        "name": "Logistique & locaux d'activité",
        "value": 15.4
      }
    ],
    "geography": [
      {
        "name": "France",
        "value": 24.5
      },
      {
        "name": "Espagne",
        "value": 12.7
      },
      {
        "name": "Irlande",
        "value": 7.2
      },
      {
        "name": "Pologne",
        "value": 8.7
      },
      {
        "name": "Pays-Bas",
        "value": 10.4
      },
      {
        "name": "Portugal",
        "value": 1.1
      },
      {
        "name": "Allemagne",
        "value": 3.3
      },
      {
        "name": "Royaume Uni",
        "value": 32.2
      }
    ],
    "reconstitutionValue": 203,
    "ranDays": 84,
    "ltv": 19,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 47,
    "name": "Selectinvest 1",
    "yield": 4.4,
    "price": 530,
    "minInvestment": 530,
    "category": "Bureaux",
    "managementCompany": "La Française REM",
    "tof": 89.8,
    "capitalization": "1,6Md€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 72.5
      },
      {
        "name": "Commerces",
        "value": 21.4
      },
      {
        "name": "Santé et éducation",
        "value": 0.5
      },
      {
        "name": "Hotels, tourisme et loisirs",
        "value": 1.7
      },
      {
        "name": "Logistique et locaux d'activités",
        "value": 3.9
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 17.3
      },
      {
        "name": "Régions",
        "value": 24.8
      },
      {
        "name": "Allemagne",
        "value": 3.4
      },
      {
        "name": "Ile-de-France",
        "value": 54.5
      }
    ],
    "reconstitutionValue": 566,
    "ranDays": 73,
    "ltv": 37,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 48,
    "name": "Selectipierre 2",
    "yield": 4.08,
    "price": 773,
    "minInvestment": 7730,
    "category": "Bureaux",
    "managementCompany": "FIDUCIAL Gérance",
    "tof": 95.35,
    "capitalization": "473M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 67.5
      },
      {
        "name": "Locaux commerciaux",
        "value": 21.3
      },
      {
        "name": "Locaux d'activité",
        "value": 1.3
      },
      {
        "name": "Locaux d'habitation",
        "value": 5.6
      },
      {
        "name": "Résidence hôtelières / étudiantes",
        "value": 4.3
      }
    ],
    "geography": [
      {
        "name": "Paris",
        "value": 71
      },
      {
        "name": "Régions",
        "value": 6.4
      },
      {
        "name": "Ile-de-France",
        "value": 22.6
      }
    ],
    "reconstitutionValue": 813,
    "ranDays": 24,
    "ltv": 18,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 49,
    "name": "Sofiprime",
    "yield": 0.54,
    "price": 280,
    "minInvestment": 2800,
    "category": "Bureaux",
    "managementCompany": "Sofidy",
    "tof": 88.52,
    "capitalization": "45M€",
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
    "ltv": 35,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 50,
    "name": "Transitions Europe",
    "yield": 8.6,
    "price": 200,
    "minInvestment": 1000,
    "category": "Bureaux",
    "managementCompany": "Arkéa REIM",
    "tof": 100,
    "capitalization": "542M€",
    "sectors": [
      {
        "name": "Bureaux",
        "value": 38
      },
      {
        "name": "Commerces",
        "value": 18
      },
      {
        "name": "Logistique",
        "value": 13
      },
      {
        "name": "Éducation",
        "value": 7
      },
      {
        "name": "Hospitalité",
        "value": 11
      },
      {
        "name": "Life Sciences",
        "value": 13
      }
    ],
    "geography": [
      {
        "name": "Espagne",
        "value": 34
      },
      {
        "name": "Irlande",
        "value": 12
      },
      {
        "name": "Pologne",
        "value": 7
      },
      {
        "name": "Pays-Bas",
        "value": 27
      },
      {
        "name": "Allemagne",
        "value": 20
      }
    ],
    "reconstitutionValue": 210,
    "ranDays": 26,
    "ltv": 10,
    "hasWaitingShares": false,
    "strategy": "Investissement principalement dans des immeubles de bureaux de qualité"
  },
  {
    "id": 51,
    "name": "Urban Coeur de Commerce",
    "yield": 5.1,
    "price": 300,
    "minInvestment": 3000,
    "category": "Commerce",
    "managementCompany": "Urban Premium",
    "tof": 92.3,
    "capitalization": "73M€",
    "sectors": [
      {
        "name": "Commerces divers",
        "value": 25
      },
      {
        "name": "Commerces de santé",
        "value": 16
      },
      {
        "name": "Commerces de services",
        "value": 30
      },
      {
        "name": "Commerces alimentaires, restauration",
        "value": 29
      }
    ],
    "geography": [
      {
        "name": "Province",
        "value": 83
      },
      {
        "name": "Île de France",
        "value": 17
      }
    ],
    "reconstitutionValue": 284,
    "ranDays": 11,
    "ltv": 23,
    "hasWaitingShares": true,
    "strategy": "Portefeuille orienté vers les actifs commerciaux et de retail"
  }
];

export const scpiDataExtended: SCPIExtended[] = baseSCPIData;

export default scpiDataExtended;
