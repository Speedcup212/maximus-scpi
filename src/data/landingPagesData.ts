export interface ScpiLandingData {
  nom: string;
  slug: string;
  h1_question?: string;
  societe_gestion: string;
  annee_creation: number;
  label_isr: boolean;
  capitalisation: string;
  prix_souscription: string;
  rendement: string;
  tof: string;
  decote: string;
  endettement: string;
  frais_souscription: string;
  frequence_versement?: string;
  strategie_isr?: boolean;
  zone_geo?: string;
  geographie: Record<string, number>;
  secteurs: Record<string, number>;
  avantages: string[];
  description_courte: string;
  description_longue: string;
  pourquoi_investir: string[];
  points_attention: string[];
  profil_investisseur: string;
  simulator?: {
    defaultInvestment?: number;
    defaultYield?: number;
    title?: string;
    subtitle?: string;
    theme?: 'blue' | 'green' | 'indigo';
  };
}

export const scpiLandingPages: Record<string, ScpiLandingData> = {
  'comete': {
    nom: "Comète",
    slug: "comete",
    h1_question: "Analyse : Faut-il Investir dans la SCPI Comète ?",
    societe_gestion: "Alderan",
    annee_creation: 2023,
    label_isr: true,
    capitalisation: "121 M€",
    prix_souscription: "250 €",
    rendement: "11,18%",
    tof: "93,6%",
    decote: "-3,27%",
    endettement: "30%",
    frais_souscription: "10%",
    geographie: {
      "Espagne": 31,
      "Royaume-Uni": 26,
      "Pays-Bas": 24,
      "Italie": 19
    },
    secteurs: {
      "Bureaux": 28,
      "Loisir": 24,
      "Locaux mixtes": 15,
      "Logistique": 13,
      "Commerces": 12,
      "Hôtellerie": 9
    },
    avantages: [
      "Rendement exceptionnel de 11,18%",
      "Taux d'occupation élevé de 93,6%",
      "Capitalisation solide de 121 M€",
      "Diversification européenne sur 4 pays",
      "Label ISR - Investissement durable"
    ],
    description_courte: "SCPI européenne récente offrant un taux de distribution de 11,18% avec une diversification sur 4 pays.",
    description_longue: "Lancée en 2023 par Alderan, Comète est une SCPI européenne diversifiée qui investit dans l'immobilier tertiaire et commercial en Europe. Avec un rendement de 11,18%, elle se positionne parmi les SCPI les plus performantes du marché. Son portefeuille diversifié sur 4 pays européens (Espagne, Royaume-Uni, Pays-Bas et Italie) et 6 secteurs d'activité offre une résilience face aux fluctuations économiques.",
    pourquoi_investir: [
      "Taux de distribution : 11,18% annualisé (publié au 31/12/2024), parmi les plus élevés du marché",
      "Diversification européenne : Investissement réparti sur 4 pays majeurs de l'Union Européenne",
      "Label ISR : Engagement dans l'investissement socialement responsable",
      "Société de gestion reconnue : Alderan apporte son expertise et son réseau européen",
      "Secteurs porteurs : Exposition équilibrée sur 6 secteurs d'activité différents"
    ],
    points_attention: [
      "SCPI récente (2023) : Historique de performance limité",
      "Endettement de 30% : Levier financier qui amplifie les variations",
      "Exposition internationale : Risque de change et volatilité accrue"
    ],
    profil_investisseur: "Investisseurs recherchant un rendement élevé, acceptant une prise de risque modérée à élevée, avec une vision long terme (8-10 ans minimum). Adapté aux investisseurs souhaitant diversifier leur patrimoine à l'international."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Comete`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'transitions-europe': {
    nom: "Transitions Europe",
    slug: "transitions-europe",
    h1_question: "Guide Complet : Investir dans Transitions Europe en 2025 ?",
    societe_gestion: "Arkéa REIM",
    annee_creation: 2022,
    label_isr: true,
    capitalisation: "542 M€",
    prix_souscription: "200 €",
    rendement: "8,25%",
    tof: "100%",
    decote: "-2,84%",
    endettement: "0%",
    frais_souscription: "10%",
    geographie: {
      "Espagne": 34,
      "Pays-Bas": 27,
      "Allemagne": 20,
      "Irlande": 12,
      "Pologne": 7
    },
    secteurs: {
      "Bureaux": 38,
      "Commerces": 18,
      "Life Sciences": 13,
      "Hospitalité": 11,
      "Logistique": 13,
      "Éducation": 7
    },
    avantages: [
      "Excellent rendement de 8,25%",
      "Taux d'occupation parfait de 100%",
      "Aucun endettement - Sécurité maximale",
      "Diversification européenne sur 5 pays"
    ],
    description_courte: "SCPI européenne récente offrant un taux de distribution de 8,25% avec un taux d'occupation de 100% et aucun endettement.",
    description_longue: "Lancée en 2022 par Arkéa REIM, Transitions Europe s'impose rapidement avec un rendement de 8,25% et un taux d'occupation parfait de 100%. Sans aucun endettement, elle offre une sécurité financière optimale. Son portefeuille de 29 immeubles diversifiés sur 5 pays européens et 6 secteurs d'activité en fait une SCPI de nouvelle génération alliant performance et stabilité.",
    pourquoi_investir: [
      "Taux de distribution : 8,25% annualisé, parmi les plus performants du marché",
      "Taux d'occupation optimal : 100% des biens loués, permettant de percevoir des revenus réguliers*",
      "Zéro endettement : Sécurité financière maximale, pas d'effet de levier",
      "Diversification sectorielle : 6 secteurs d'activité pour limiter les risques",
      "Label ISR : Engagement environnemental et social fort"
    ],
    points_attention: [
      "SCPI très récente : Créée en 2022, historique limité",
      "Frais de souscription de 10% : Impact sur la rentabilité court terme",
      "Croissance rapide : Capitalisation en augmentation, à surveiller"
    ],
    profil_investisseur: "Investisseurs dynamiques recherchant un rendement élevé avec une sécurité renforcée (pas d'endettement). Convient aux profils équilibrés à dynamiques avec un horizon 10 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Transitions europe`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'remake-live': {
    nom: "Remake Live",
    slug: "remake-live",
    h1_question: "Verdict : La SCPI Remake Live est-elle un Bon Placement ?",
    societe_gestion: "Remake Asset Management",
    annee_creation: 2022,
    label_isr: true,
    capitalisation: "647 M€",
    prix_souscription: "204 €",
    rendement: "7,5%",
    tof: "99%",
    decote: "0%",
    endettement: "23,1%",
    frais_souscription: "0%",
    geographie: {
      "Royaume-Uni": 32.16,
      "France": 24.51,
      "Espagne": 12.67,
      "Pays-Bas": 10.4,
      "Pologne": 8.74,
      "Irlande": 7.2,
      "Allemagne": 3.26,
      "Portugal": 1.07
    },
    secteurs: {
      "Bureaux": 37.8,
      "Santé & éducation": 24,
      "Logistique & locaux d'activité": 15.4,
      "Commerces": 13.2,
      "Hôtels, tourisme, loisirs": 4.8,
      "Résidentiel": 3.7,
      "Alternatifs": 1.1
    },
    avantages: [
      "Excellent rendement de 7,5%",
      "Taux d'occupation de 99%",
      "Capitalisation solide de 647 M€",
      "Endettement modéré de 23%",
      "0% de frais de souscription"
    ],
    description_courte: "SCPI récente sans frais d'entrée offrant un taux de distribution de 7,5% avec un taux d'occupation quasi-parfait de 99%.",
    description_longue: "Remake Live est une SCPI européenne lancée en 2022 qui s'est rapidement imposée grâce à son modèle sans frais de souscription et son rendement élevé de 7,5%. Avec un taux d'occupation de 99% et un portefeuille diversifié sur 8 pays européens, elle combine performance et sécurité. Sa capitalisation de 647 millions d'euros témoigne du succès rapide de cette SCPI nouvelle génération.",
    pourquoi_investir: [
      "Taux de distribution : 7,5% annualisé, parmi les plus performants du marché",
      "Sans frais d'entrée : 0% de frais de souscription, votre capital est investi à 100%",
      "Taux d'occupation optimal : 99%, permettant de percevoir des revenus réguliers*",
      "Diversification maximale : 56 immeubles répartis sur 8 pays européens",
      "Secteur santé & éducation : 24% du patrimoine, secteurs résilients"
    ],
    points_attention: [
      "SCPI très récente : Créée en 2022, historique de 2 ans seulement",
      "Frais de gestion élevés : 15% pour compenser l'absence de frais d'entrée",
      "Forte exposition UK : 32% au Royaume-Uni, risque Brexit",
      "Croissance rapide : Capitalisation en forte hausse, à surveiller"
    ],
    profil_investisseur: "Investisseurs dynamiques recherchant un rendement élevé sans frais d'entrée, acceptant le risque lié à une SCPI récente. Convient aux profils équilibrés à dynamiques avec un horizon 10 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Remake live`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'epargne-pierre-europe': {
    nom: "Épargne Pierre Europe",
    slug: "epargne-pierre-europe",
    h1_question: "Zoom sur Épargne Pierre Europe : Faut-il Investir ?",
    societe_gestion: "Atland Voisin",
    annee_creation: 2022,
    label_isr: true,
    capitalisation: "268 M€",
    prix_souscription: "200 €",
    rendement: "6,75%",
    tof: "100%",
    decote: "-3,15%",
    endettement: "0%",
    frais_souscription: "10%",
    geographie: {
      "Espagne": 52.8,
      "Irlande": 27.34,
      "Pays-Bas": 19.86
    },
    secteurs: {
      "Bureaux": 38.5,
      "Commerces": 28.39,
      "Santé": 16.27,
      "Hôtellerie": 13,
      "Activités / Logistique": 3.84
    },
    avantages: [
      "Rendement attractif de 6,75%",
      "Taux d'occupation parfait de 100%",
      "Zéro endettement",
      "Groupe Atland Voisin reconnu"
    ],
    description_courte: "SCPI européenne créée par Atland Voisin offrant 6,75% de rendement avec un taux d'occupation de 100% et aucun endettement.",
    description_longue: "Épargne Pierre Europe, lancée en 2022 par le groupe Atland Voisin, se distingue par son approche prudente avec 0% d'endettement et un taux d'occupation de 100%. Avec un rendement de 6,75%, elle investit dans 16 immeubles de qualité en Espagne, Irlande et Pays-Bas, privilégiant les secteurs bureaux, commerces et santé.",
    pourquoi_investir: [
      "Rendement solide : 6,75% de taux de distribution dans le top 4 du marché",
      "Occupation totale : 100% des biens loués, revenus réguliers*",
      "Sécurité maximale : Aucun endettement, gestion prudente",
      "Groupe reconnu : Atland Voisin, acteur majeur de l'immobilier",
      "Secteur santé : 16% en santé, secteur résilient et porteur"
    ],
    points_attention: [
      "SCPI récente : Créée en 2022, historique de 2 ans",
      "Frais de souscription 10% : Impact sur rentabilité initiale",
      "Concentration géographique : Seulement 3 pays européens"
    ],
    profil_investisseur: "Investisseurs prudents recherchant un bon rendement sans prise de risque excessive. Idéal pour les profils équilibrés privilégiant la sécurité (pas d'endettement) avec un horizon 10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Epargne pierre europe`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'optimale': {
    nom: "Optimale",
    slug: "optimale",
    h1_question: "Décryptage : La SCPI Optimale est-elle Faite pour Vous ?",
    societe_gestion: "CONSULTIM Asset Management",
    annee_creation: 2020,
    label_isr: true,
    capitalisation: "76 M€",
    prix_souscription: "250 €",
    rendement: "6,51%",
    tof: "96%",
    decote: "-4,21%",
    endettement: "17,7%",
    frais_souscription: "10%",
    geographie: {
      "Métropoles françaises": 100
    },
    secteurs: {
      "Bureaux": 65,
      "Logistique et locaux d'activités": 15,
      "Commerces": 10,
      "Santé et éducation": 5,
      "Hôtellerie": 5
    },
    avantages: [
      "Rendement attractif de 6,51%",
      "100% France - Investissement de proximité",
      "Versements mensuels des loyers",
      "30 immeubles en métropoles françaises"
    ],
    description_courte: "SCPI 100% France offrant 6,51% de rendement avec des versements mensuels et un portefeuille de 30 immeubles en métropoles.",
    description_longue: "Optimale, créée en 2020 par CONSULTIM Asset Management, se concentre exclusivement sur les métropoles françaises. Avec un rendement de 6,51% et des versements mensuels, elle offre un flux de trésorerie régulier. Son portefeuille de 30 immeubles est majoritairement investi en bureaux (65%) dans les grandes villes de province.",
    pourquoi_investir: [
      "Rendement élevé : 6,51% dans le top 5 du marché",
      "Revenus mensuels : Versements tous les mois pour un flux régulier",
      "100% France : Pas de risque de change, marché connu",
      "Métropoles régionales : Zones dynamiques et attractives",
      "Taux d'occupation élevé : 96%, proche de l'optimal"
    ],
    points_attention: [
      "Concentration France : 100% France, pas de diversification internationale",
      "Secteur bureaux dominant : 65% en bureaux, impact télétravail",
      "Petite capitalisation : 76 M€, liquidité à surveiller"
    ],
    profil_investisseur: "Investisseurs recherchant un rendement élevé sur le marché français, privilégiant des revenus mensuels. Convient aux profils équilibrés acceptant une concentration géographique avec un horizon 10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Optimale`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'iroko-zen': {
    nom: "Iroko Zen",
    slug: "iroko-zen",
    h1_question: "Analyse : Faut-il Investir dans la SCPI Iroko Zen ?",
    societe_gestion: "Iroko",
    annee_creation: 2020,
    label_isr: true,
    capitalisation: "1 100 M€",
    prix_souscription: "202 €",
    rendement: "6,01%",
    tof: "97,7%",
    decote: "-5,76%",
    endettement: "26,18%",
    frais_souscription: "0%",
    geographie: {
      "France": 44,
      "Royaume-Uni": 16,
      "Irlande": 12,
      "Espagne": 10,
      "Pays-Bas": 10,
      "Allemagne": 8
    },
    secteurs: {
      "Commerces": 34,
      "Bureaux": 30,
      "Locaux d'activités": 21,
      "Entrepôts": 11,
      "Hôtels": 3,
      "Enseignement": 1
    },
    avantages: [
      "Rendement attractif de 6,01%",
      "Taux d'occupation élevé de 97,7%",
      "Capitalisation majeure de 1,1 Mds€",
      "Endettement modéré de 26%",
      "Sans frais de souscription (0%)"
    ],
    description_courte: "SCPI européenne sans frais d'entrée offrant 6,01% de rendement avec des versements mensuels.",
    description_longue: "Iroko Zen se distingue par son modèle économique innovant : 0% de frais de souscription. Lancée en 2020, cette SCPI européenne a su rapidement séduire avec 1,1 milliard d'euros de capitalisation. Son portefeuille diversifié sur 6 pays et sa politique de versements mensuels en font un placement de choix pour générer des revenus réguliers.",
    pourquoi_investir: [
      "Économie immédiate : 0% de frais de souscription, soit 100% de votre capital investi dès le départ",
      "Revenus mensuels : Versements tous les mois pour un flux de trésorerie régulier",
      "Rendement solide : 6,01% de taux de distribution annuel",
      "Capitalisation importante : 1,1 milliard d'euros, gage de solidité",
      "Label ISR : Engagement environnemental et social fort"
    ],
    points_attention: [
      "Frais de gestion plus élevés : 12,5% pour compenser l'absence de frais d'entrée",
      "SCPI récente : Créée en 2020, historique encore court",
      "Endettement de 26% : Levier financier à surveiller"
    ],
    profil_investisseur: "Investisseurs recherchant un placement sans frais d'entrée, privilégiant des revenus mensuels réguliers. Convient aux profils équilibrés acceptant une volatilité modérée avec un horizon long terme."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Iroko zen`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'novaxia-neo': {
    nom: "Novaxia NEO",
    slug: "novaxia-neo",
    h1_question: "Guide : Novaxia NEO, Bon ou Mauvais Placement ?",
    societe_gestion: "Novaxia Investissement",
    annee_creation: 2019,
    label_isr: true,
    capitalisation: "427,6 M€",
    prix_souscription: "187 €",
    rendement: "6,01%",
    tof: "97,7%",
    decote: "0%",
    endettement: "29%",
    frais_souscription: "0%",
    geographie: {
      "France": 85,
      "Europe hors zone Euro": 10,
      "Pays de l'OCDE": 5
    },
    secteurs: {
      "Bureaux": 93,
      "Hôtels": 3,
      "Activités": 3,
      "Enseignement": 1
    },
    avantages: [
      "0% de frais de souscription",
      "100% France - Proximité",
      "Label ISR Article 9 (le plus exigeant)",
      "Spécialiste de la rénovation urbaine"
    ],
    description_courte: "SCPI française sans frais d'entrée, spécialisée dans la rénovation urbaine durable avec le label ISR Article 9.",
    description_longue: "Novaxia NEO est une SCPI unique en son genre, 100% investie en France et spécialisée dans la transformation et la rénovation de bâtiments urbains. Avec 0% de frais de souscription et le label ISR Article 9 (le plus exigeant), elle s'adresse aux investisseurs soucieux de l'impact environnemental. Son expertise dans la réhabilitation de bureaux en déshérence lui confère un positionnement différenciant sur le marché.",
    pourquoi_investir: [
      "Impact environnemental maximal : Label ISR Article 9, le plus exigeant du marché",
      "Sans frais d'entrée : 0% de frais de souscription",
      "100% France : Investissement de proximité, pas de risque de change",
      "Expertise unique : Spécialiste de la transformation immobilière urbaine",
      "Rendement attractif : 6,01% avec des versements mensuels"
    ],
    points_attention: [
      "Concentration géographique : 100% France, pas de diversification internationale",
      "Secteur bureaux dominant : 93% en bureaux, exposition au télétravail",
      "Frais de gestion élevés : 15% pour compenser les frais d'entrée nuls",
      "Stratégie spécifique : Rénovation urbaine, risques de chantier"
    ],
    profil_investisseur: "Investisseurs engagés dans la transition écologique, recherchant un impact environnemental fort. Convient aux profils équilibrés privilégiant l'investissement responsable et acceptant une concentration sur le marché français."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Novaxia neo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
}
,
  'activimmo': {
    nom: "Activimmo",
    slug: "activimmo",
    societe_gestion: "Alderan",
    annee_creation: 2019,
    label_isr: true,
    capitalisation: "1310 M€",
    prix_souscription: "610 €",
    rendement: "5.5%",
    tof: "94.8%",
    decote: "0%",
    endettement: "0.6%",
    frais_souscription: "10.6%",
    geographie: {
    "Italie": 3,
    "Espagne": 14,
    "Irlande": 1,
    "Pays bas": 1,
    "Allemagne": 0.5,
    "France - Arc atlantique": 9,
    "France - Autres régions": 16,
    "France - Région parisienne": 10,
    "France - Dorsale logistique hors IDF": 45.5
},
    secteurs: {
    "Autres": 1,
    "Transports": 7,
    "Logistique urbaine": 9,
    "Locaux d'activités": 32,
    "Entrepôts logistiques": 51
},
    avantages: [
      "Rendement attractif de 5.5%",
      "Taux d'occupation élevé de 94,8%",
      "Capitalisation majeure de 1,3 Mds€",
      "Endettement faible de 0.6%",
      "Label ISR - Investissement responsable"
],
    description_courte: "SCPI Activimmo gérée par Alderan offrant 5.5% de rendement avec un taux d'occupation de 94.8%.",
    description_longue: "Activimmo, créée en 2019 par Alderan, se distingue par son rendement de 5.5% et un taux d'occupation de 94.8%. Avec une capitalisation de 1310 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.5% de taux de distribution",
      "Taux d'occupation : 94.8% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Alderan"
],
    points_attention: [
      "Frais de souscription de 10.6%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Activimmo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'aestiam-cap-hebergimmo': {
    nom: "Aestiam Cap'Hebergimmo",
    slug: "aestiam-cap-hebergimmo",
    societe_gestion: "Aestiam",
    annee_creation: 2013,
    label_isr: true,
    capitalisation: "82 M€",
    prix_souscription: "252 €",
    rendement: "3.18%",
    tof: "91.79%",
    decote: "-5.76%",
    endettement: "21%",
    frais_souscription: "10%",
    geographie: {
    "Régions": 35,
    "Étranger": 42,
    "Région Parisienne": 23
},
    secteurs: {
    "Hôtels": 71,
    "Loisirs": 2,
    "Séminaires": 27
},
    avantages: [
      "Label ISR - Investissement responsable",
      "Gérée par Aestiam"
],
    description_courte: "SCPI Aestiam Cap'Hebergimmo gérée par Aestiam offrant 3.18% de rendement avec un taux d'occupation de 91.79%.",
    description_longue: "Aestiam Cap'Hebergimmo, créée en 2013 par Aestiam, se distingue par son rendement de 3.18% et un taux d'occupation de 91.79%. Avec une capitalisation de 82 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 3.18% de taux de distribution",
      "Taux d'occupation : 91.79% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Aestiam"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Aestiam cap hebergimmo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'aestiam-pierre-rendement': {
    nom: "Aestiam Pierre Rendement",
    slug: "aestiam-pierre-rendement",
    societe_gestion: "Aestiam",
    annee_creation: 1990,
    label_isr: true,
    capitalisation: "401 M€",
    prix_souscription: "922 €",
    rendement: "4.49%",
    tof: "94.25%",
    decote: "-3.21%",
    endettement: "10.6%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 37,
    "Étranger": 6,
    "Région Parisienne": 30,
    "Métropoles Régionales": 27
},
    secteurs: {
    "Bureaux": 7,
    "Commerces": 69,
    "Enseignement": 3,
    "Hôtels Séminaires": 21
},
    avantages: [
      "Label ISR - Investissement responsable",
      "Gérée par Aestiam"
],
    description_courte: "SCPI Aestiam Pierre Rendement gérée par Aestiam offrant 4.49% de rendement avec un taux d'occupation de 94.25%.",
    description_longue: "Aestiam Pierre Rendement, créée en 1990 par Aestiam, se distingue par son rendement de 4.49% et un taux d'occupation de 94.25%. Avec une capitalisation de 401 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.49% de taux de distribution",
      "Taux d'occupation : 94.25% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Aestiam"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Aestiam pierre rendement`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'aestiam-horizon': {
    nom: "Aestiam Horizon",
    slug: "aestiam-horizon",
    societe_gestion: "Aestiam",
    annee_creation: 1986,
    label_isr: true,
    capitalisation: "380 M€",
    prix_souscription: "350 €",
    rendement: "5.4%",
    tof: "86.5%",
    decote: "11.1%",
    endettement: "12%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 20,
    "Etranger": 11,
    "Régions": 39,
    "Région Parisienne": 30
},
    secteurs: {
    "Bureaux": 76,
    "Commerces": 16,
    "Hôtels": 2,
    "Enseignement": 4,
    "Locaux d'activités": 2
},
    avantages: [
      "Rendement attractif de 5.4%",
      "Label ISR - Investissement responsable",
      "Gérée par Aestiam"
],
    description_courte: "SCPI Aestiam Horizon (anciennement Aestiam Placement Pierre) gérée par Aestiam offrant 5.4% de rendement avec un taux d'occupation de 86.5%.",
    description_longue: "Aestiam Horizon, créée en 1986 par Aestiam (anciennement Aestiam Placement Pierre), se distingue par son rendement de 5.4% et un taux d'occupation de 86.5%. Avec une capitalisation de 380 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers. Spécialisée dans les bureaux à taille humaine.",
    pourquoi_investir: [
      "Rendement attractif : 5.4% de taux de distribution",
      "Taux d'occupation : 86.5% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Aestiam"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Aestiam Horizon`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'altixia-commerces': {
    nom: "Altixia Commerces",
    slug: "altixia-commerces",
    societe_gestion: "ALTIXIA REIM",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "107.64 M€",
    prix_souscription: "203 €",
    rendement: "5.12%",
    tof: "90.77%",
    decote: "-2.66%",
    endettement: "5.1%",
    frais_souscription: "2.5%",
    geographie: {
    "Paris": 9,
    "Régions": 62,
    "Ile-de-France": 29
},
    secteurs: {
    "Bureaux et activités": 4,
    "Commerces en retail park": 58,
    "Commerces en pied d'immeuble": 38
},
    avantages: [
      "Rendement attractif de 5.12%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 5.1%",
      "Gérée par ALTIXIA REIM"
],
    description_courte: "SCPI Altixia Commerces gérée par ALTIXIA REIM offrant 5.12% de rendement avec un taux d'occupation de 90.77%.",
    description_longue: "Altixia Commerces, créée en 2018 par ALTIXIA REIM, se distingue par son rendement de 5.12% et un taux d'occupation de 90.77%. Avec une capitalisation de 107.64 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.12% de taux de distribution",
      "Taux d'occupation : 90.77% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : ALTIXIA REIM"
],
    points_attention: [
      "Liquidité limitée - Délai de retrait possible",
      "Frais de souscription à prendre en compte",
      "Risque de vacance locative",
      "Durée de placement recommandée : 8 à 10 ans minimum"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Altixia commerces`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'atream-hotel': {
    nom: "Atream Hotel",
    slug: "atream-hotel",
    societe_gestion: "Atream",
    annee_creation: 2016,
    label_isr: true,
    capitalisation: "299.34 M€",
    prix_souscription: "1000 €",
    rendement: "5.05%",
    tof: "100%",
    decote: "-6.42%",
    endettement: "24.87%",
    frais_souscription: "10%",
    geographie: {
    "France": 33,
    "Belgique": 23,
    "Pays-Bas": 14,
    "Allemagne": 30
},
    secteurs: {
    "Hôtels": 71,
    "Autres types d'hébergements touristiques": 29
},
    avantages: [
      "Rendement attractif de 5.05%",
      "Taux d'occupation élevé de 100%",
      "Label ISR - Investissement responsable",
      "Gérée par Atream"
],
    description_courte: "SCPI Atream Hotel gérée par Atream offrant 5.05% de rendement avec un taux d'occupation de 100%.",
    description_longue: "Atream Hotel, créée en 2016 par Atream, se distingue par son rendement de 5.05% et un taux d'occupation de 100%. Avec une capitalisation de 299.34 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.05% de taux de distribution",
      "Taux d'occupation : 100% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Atream"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Atream hotel`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'buroboutic-metropoles': {
    nom: "Buroboutic Métropoles",
    slug: "buroboutic-metropoles",
    societe_gestion: "FIDUCIAL Gérance",
    annee_creation: 1986,
    label_isr: true,
    capitalisation: "318.5 M€",
    prix_souscription: "230 €",
    rendement: "5.07%",
    tof: "97.17%",
    decote: "-2.44%",
    endettement: "23.1%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 14.8,
    "Régions": 53.3,
    "Ile-de-France": 31.9
},
    secteurs: {
    "Bureaux": 32.2,
    "Locaux commerciaux": 50.8,
    "Locaux d'activités": 17
},
    avantages: [
      "Rendement attractif de 5.07%",
      "Taux d'occupation élevé de 97.17%",
      "Label ISR - Investissement responsable",
      "Gérée par FIDUCIAL Gérance"
],
    description_courte: "SCPI Buroboutic Métropoles gérée par FIDUCIAL Gérance offrant 5.07% de rendement avec un taux d'occupation de 97.17%.",
    description_longue: "Buroboutic Métropoles, créée en 1986 par FIDUCIAL Gérance, se distingue par son rendement de 5.07% et un taux d'occupation de 97.17%. Avec une capitalisation de 318.5 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.07% de taux de distribution",
      "Taux d'occupation : 97.17% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : FIDUCIAL Gérance"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Buroboutic metropoles`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'coeur-d-europe': {
    nom: "Coeur d'Europe",
    slug: "coeur-d-europe",
    societe_gestion: "Sogenial Immobilier",
    annee_creation: 2021,
    label_isr: true,
    capitalisation: "170.32 M€",
    prix_souscription: "200 €",
    rendement: "6.02%",
    tof: "98.56%",
    decote: "-5.68%",
    endettement: "0.82%",
    frais_souscription: "10%",
    geographie: {
    "France": 20,
    "Italie": 12,
    "Espagne": 8,
    "Pays-Bas": 16,
    "Allemagne": 44
},
    secteurs: {
    "Espagne": 38.7,
    "Belgique": 30.4,
    "Portugal": 20.7,
    "Allemagne": 10.2
},
    avantages: [
      "Rendement attractif de 6.02%",
      "Taux d'occupation élevé de 98.56%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 0.82%"
],
    description_courte: "SCPI Coeur d'Europe gérée par Sogenial Immobilier offrant 6.02% de rendement avec un taux d'occupation de 98.56%.",
    description_longue: "Coeur d'Europe, créée en 2021 par Sogenial Immobilier, se distingue par son rendement de 6.02% et un taux d'occupation de 98.56%. Avec une capitalisation de 170.32 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 6.02% de taux de distribution",
      "Taux d'occupation : 98.56% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Sogenial Immobilier"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un rendement élevé avec une gestion prudente. Convient aux profils équilibrés à dynamiques avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Coeur d europe`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'coeur-de-region': {
    nom: "Coeur de Région",
    slug: "coeur-de-region",
    societe_gestion: "Sogenial Immobilier",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "385.28 M€",
    prix_souscription: "664 €",
    rendement: "6.2%",
    tof: "96.62%",
    decote: "-2.83%",
    endettement: "9.39%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 49.6,
    "Régions françaises": 50.4
},
    secteurs: {
    "Régions": 85.2,
    "Île-de-France": 14.8
},
    avantages: [
      "Rendement attractif de 6.2%",
      "Taux d'occupation élevé de 96.62%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 9.39%"
],
    description_courte: "SCPI Coeur de Région gérée par Sogenial Immobilier offrant 6.2% de rendement avec un taux d'occupation de 96.62%.",
    description_longue: "Coeur de Région, créée en 2018 par Sogenial Immobilier, se distingue par son rendement de 6.2% et un taux d'occupation de 96.62%. Avec une capitalisation de 385.28 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 6.2% de taux de distribution",
      "Taux d'occupation : 96.62% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Sogenial Immobilier"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un rendement élevé avec une gestion prudente. Convient aux profils équilibrés à dynamiques avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Coeur de region`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'coeur-de-ville': {
    nom: "Coeur de ville",
    slug: "coeur-de-ville",
    societe_gestion: "Sogenial Immobilier",
    annee_creation: 2013,
    label_isr: false,
    capitalisation: "27.02 M€",
    prix_souscription: "210 €",
    rendement: "5.3%",
    tof: "98.04%",
    decote: "-3.24%",
    endettement: "18.2%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 15.6,
    "Province": 84.4
},
    secteurs: {
    "Services": 21.43,
    "Commerce alimentaire": 46.12,
    "Santé et éducation": 3.22,
    "Commerce non alimentaire": 29.23
},
    avantages: [
      "Rendement attractif de 5.3%",
      "Taux d'occupation élevé de 98.04%",
      "Gérée par Sogenial Immobilier"
],
    description_courte: "SCPI Coeur de ville gérée par Sogenial Immobilier offrant 5.3% de rendement avec un taux d'occupation de 98.04%.",
    description_longue: "Coeur de ville, créée en 2013 par Sogenial Immobilier, se distingue par son rendement de 5.3% et un taux d'occupation de 98.04%. Avec une capitalisation de 27.02 M€, elle offre une solution d'investissement immobilier  adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.3% de taux de distribution",
      "Taux d'occupation : 98.04% des biens loués",
      "Gestion professionnelle",
      "Société de gestion reconnue : Sogenial Immobilier"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Coeur de ville`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'cristal-life': {
    nom: "Cristal Life",
    slug: "cristal-life",
    societe_gestion: "Inter Gestion REIM",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "290.4 M€",
    prix_souscription: "225 €",
    rendement: "5.2%",
    tof: "93.4%",
    decote: "0%",
    endettement: "20.4%",
    frais_souscription: "10%",
    geographie: {
    "Régions": 78,
    "Étranger": 8,
    "Île-de-France": 14
},
    secteurs: {
    "Santé": 14,
    "Bureaux": 22,
    "Commerce": 42,
    "Éducation": 10,
    "Résidentiel": 12
},
    avantages: [
      "Rendement attractif de 5.2%",
      "Label ISR - Investissement responsable",
      "Gérée par Inter Gestion REIM"
],
    description_courte: "SCPI Cristal Life gérée par Inter Gestion REIM offrant 5.2% de rendement avec un taux d'occupation de 93.4%.",
    description_longue: "Cristal Life, créée en 2018 par Inter Gestion REIM, se distingue par son rendement de 5.2% et un taux d'occupation de 93.4%. Avec une capitalisation de 290.4 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.2% de taux de distribution",
      "Taux d'occupation : 93.4% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Inter Gestion REIM"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Cristal life`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'edissimo': {
    nom: "Edissimo",
    slug: "edissimo",
    societe_gestion: "Amundi Immobilier",
    annee_creation: 1983,
    label_isr: true,
    capitalisation: "1639.5 M€",
    prix_souscription: "338 €",
    rendement: "4.45%",
    tof: "89.45%",
    decote: "-7.27%",
    endettement: "13.8%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 65,
    "Régions": 5,
    "Île-de-France": 30
},
    secteurs: {
    "Bureaux": 88,
    "Logistique": 3,
    "Hôtellerie": 9
},
    avantages: [
      "Label ISR - Investissement responsable",
      "Gérée par Amundi Immobilier"
],
    description_courte: "SCPI Edissimo gérée par Amundi Immobilier offrant 4.45% de rendement avec un taux d'occupation de 89.45%.",
    description_longue: "Edissimo, créée en 1983 par Amundi Immobilier, se distingue par son rendement de 4.45% et un taux d'occupation de 89.45%. Avec une capitalisation de 1639.5 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.45% de taux de distribution",
      "Taux d'occupation : 89.45% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Amundi Immobilier"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Edissimo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'epargne-fonciere': {
    nom: "Épargne Foncière",
    slug: "epargne-fonciere",
    societe_gestion: "La Française REM",
    annee_creation: 1968,
    label_isr: true,
    capitalisation: "5201.52 M€",
    prix_souscription: "670 €",
    rendement: "4.52%",
    tof: "89.2%",
    decote: "-9.83%",
    endettement: "23.08%",
    frais_souscription: "7.5%",
    geographie: {
    "Paris": 22.44,
    "Irlande": 0.41,
    "Pays-Bas": 1.47,
    "Régions": 31.82,
    "Allemagne": 5.37,
    "Royaume-Uni": 0.9,
    "Île-de-France": 37.59
},
    secteurs: {
    "Bureaux": 70.99,
    "Hôtels": 5.73,
    "Commerces": 19.36,
    "Santé et éducation": 3.4,
    "Logistique et locaux d'activités": 0.52
},
    avantages: [
      "Label ISR - Investissement responsable",
      "Gérée par La Française REM"
],
    description_courte: "SCPI Épargne Foncière gérée par La Française REM offrant 4.52% de rendement avec un taux d'occupation de 89.2%.",
    description_longue: "Épargne Foncière, créée en 1968 par La Française REM, se distingue par son rendement de 4.52% et un taux d'occupation de 89.2%. Avec une capitalisation de 5201.52 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.52% de taux de distribution",
      "Taux d'occupation : 89.2% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : La Française REM"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Epargne fonciere`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'epargne-pierre': {
    nom: "Épargne Pierre",
    slug: "epargne-pierre",
    societe_gestion: "Atland Voisin",
    annee_creation: 2013,
    label_isr: true,
    capitalisation: "2734 M€",
    prix_souscription: "208 €",
    rendement: "5.28%",
    tof: "95.72%",
    decote: "0%",
    endettement: "11.7%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 25.8,
    "Europe": 2.5,
    "Régions": 51.8,
    "Île-de-France": 19.9
},
    secteurs: {
    "Bureaux": 15.8,
    "Locaux commerciaux": 84.1,
    "Entrepôts et activités": 0.1
},
    avantages: [
      "Rendement attractif de 5.28%",
      "Taux d'occupation élevé de 95,72%",
      "Capitalisation majeure de 2,7 Mds€",
      "Endettement faible de 11,7%",
      "Label ISR - Investissement responsable"
],
    description_courte: "SCPI Épargne Pierre gérée par Atland Voisin offrant 5.28% de rendement avec un taux d'occupation de 95.72%.",
    description_longue: "Épargne Pierre, créée en 2013 par Atland Voisin, se distingue par son rendement de 5.28% et un taux d'occupation de 95.72%. Avec une capitalisation de 2734 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.28% de taux de distribution",
      "Taux d'occupation : 95.72% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Atland Voisin"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Epargne pierre`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'esg-pierre-capital': {
    nom: "ESG Pierre Capital",
    slug: "esg-pierre-capital",
    societe_gestion: "Swiss Life AM France",
    annee_creation: 2017,
    label_isr: true,
    capitalisation: "126.45 M€",
    prix_souscription: "188 €",
    rendement: "5.5%",
    tof: "98.4%",
    decote: "0%",
    endettement: "27.74%",
    frais_souscription: "8%",
    geographie: {
    "France": 51,
    "Allemagne": 49
},
    secteurs: {
    "Bureaux": 20,
    "Commerces": 12,
    "Logistique": 24,
    "Éducation": 11,
    "Hôtellerie Bien-Être": 33
},
    avantages: [
      "Rendement attractif de 5.5%",
      "Taux d'occupation élevé de 98.4%",
      "Label ISR - Investissement responsable",
      "Gérée par Swiss Life AM France"
],
    description_courte: "SCPI ESG Pierre Capital gérée par Swiss Life AM France offrant 5.5% de rendement avec un taux d'occupation de 98.4%.",
    description_longue: "ESG Pierre Capital, créée en 2017 par Swiss Life AM France, se distingue par son rendement de 5.5% et un taux d'occupation de 98.4%. Avec une capitalisation de 126.45 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.5% de taux de distribution",
      "Taux d'occupation : 98.4% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Swiss Life AM France"
],
    points_attention: [
      "Endettement élevé de 27.74%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Esg pierre capital`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'ficommerce-proximite': {
    nom: "Ficommerce Proximité",
    slug: "ficommerce-proximite",
    societe_gestion: "FIDUCIAL Gérance",
    annee_creation: 1986,
    label_isr: true,
    capitalisation: "599.8 M€",
    prix_souscription: "210 €",
    rendement: "5.07%",
    tof: "95.72%",
    decote: "0%",
    endettement: "1.79%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 25.8,
    "Europe": 2.5,
    "Régions": 51.8,
    "Île-de-France": 19.9
},
    secteurs: {
    "Bureaux": 15.8,
    "Locaux commerciaux": 84.1,
    "Entrepôts et activités": 0.1
},
    avantages: [
      "Rendement attractif de 5.07%",
      "Taux d'occupation élevé de 95.72%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 1.79%"
],
    description_courte: "SCPI Ficommerce Proximité gérée par FIDUCIAL Gérance offrant 5.07% de rendement avec un taux d'occupation de 95.72%.",
    description_longue: "Ficommerce Proximité, créée en 1986 par FIDUCIAL Gérance, se distingue par son rendement de 5.07% et un taux d'occupation de 95.72%. Avec une capitalisation de 599.8 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.07% de taux de distribution",
      "Taux d'occupation : 95.72% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : FIDUCIAL Gérance"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Ficommerce proximite`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'fonciere-des-praticiens': {
    nom: "Foncière des Praticiens",
    slug: "fonciere-des-praticiens",
    societe_gestion: "MAGELLIM REIM",
    annee_creation: 2017,
    label_isr: true,
    capitalisation: "164.9 M€",
    prix_souscription: "1100 €",
    rendement: "5.5%",
    tof: "97.69%",
    decote: "1.63%",
    endettement: "1.79%",
    frais_souscription: "8%",
    geographie: {
    "France": 51,
    "Allemagne": 49
},
    secteurs: {
    "Life Sciences": 18,
    "Locaux supports au secteur de la santé": 35,
    "Locaux d'accompagnement et de rééducation": 47
},
    avantages: [
      "Rendement attractif de 5.5%",
      "Taux d'occupation élevé de 97.69%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 1.79%"
],
    description_courte: "SCPI Foncière des Praticiens gérée par MAGELLIM REIM offrant 5.5% de rendement avec un taux d'occupation de 97.69%.",
    description_longue: "Foncière des Praticiens, créée en 2017 par MAGELLIM REIM, se distingue par son rendement de 5.5% et un taux d'occupation de 97.69%. Avec une capitalisation de 164.9 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.5% de taux de distribution",
      "Taux d'occupation : 97.69% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : MAGELLIM REIM"
],
    points_attention: [
      "Surcote de 1.63% - Prix de part supérieur à la valeur de retrait",
      "Liquidité limitée - Délai de retrait possible",
      "Frais de souscription à prendre en compte",
      "Durée de placement recommandée : 8 à 10 ans minimum"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Fonciere des praticiens`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'gma-essentialis': {
    nom: "GMA Essentialis",
    slug: "gma-essentialis",
    societe_gestion: "GREENMAN ARTH",
    annee_creation: 2021,
    label_isr: true,
    capitalisation: "42.32 M€",
    prix_souscription: "150 €",
    rendement: "0%",
    tof: "99.67%",
    decote: "-9.86%",
    endettement: "39.07%",
    frais_souscription: "10%",
    geographie: {
    "France": 51,
    "Allemagne": 49
},
    secteurs: {
    "Tertiaire": 10,
    "Alimentaire": 90
},
    avantages: [
      "Taux d'occupation élevé de 99.67%",
      "Label ISR - Investissement responsable",
      "Gérée par GREENMAN ARTH"
],
    description_courte: "SCPI GMA Essentialis gérée par GREENMAN ARTH offrant 0% de rendement avec un taux d'occupation de 99.67%.",
    description_longue: "GMA Essentialis, créée en 2021 par GREENMAN ARTH, se distingue par son rendement de 0% et un taux d'occupation de 99.67%. Avec une capitalisation de 42.32 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 0% de taux de distribution",
      "Taux d'occupation : 99.67% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : GREENMAN ARTH"
],
    points_attention: [
      "Endettement élevé de 39.07%",
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Gma essentialis`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'grand-paris-residentiel': {
    nom: "Grand Paris Résidentiel",
    slug: "grand-paris-residentiel",
    societe_gestion: "Inter Gestion REIM",
    annee_creation: 2018,
    label_isr: false,
    capitalisation: "12.21 M€",
    prix_souscription: "200 €",
    rendement: "0%",
    tof: "92.14%",
    decote: "-3.28%",
    endettement: "38.44%",
    frais_souscription: "10%",
    geographie: {
    "Régions": 13,
    "Ile-de-France": 87
},
    secteurs: {
    "Logement": 99.6,
    ", Commerces": 0.4
},
    avantages: [
      "Gérée par Inter Gestion REIM"
],
    description_courte: "SCPI Grand Paris Résidentiel gérée par Inter Gestion REIM offrant 0% de rendement avec un taux d'occupation de 92.14%.",
    description_longue: "Grand Paris Résidentiel, créée en 2018 par Inter Gestion REIM, se distingue par son rendement de 0% et un taux d'occupation de 92.14%. Avec une capitalisation de 12.21 M€, elle offre une solution d'investissement immobilier  adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 0% de taux de distribution",
      "Taux d'occupation : 92.14% des biens loués",
      "Gestion professionnelle",
      "Société de gestion reconnue : Inter Gestion REIM"
],
    points_attention: [
      "Endettement élevé de 38.44%",
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Grand paris residentiel`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'immorente': {
    nom: "Immorente",
    slug: "immorente",
    societe_gestion: "SOFIDY",
    annee_creation: 1988,
    label_isr: true,
    capitalisation: "4392 M€",
    prix_souscription: "340 €",
    rendement: "5.04%",
    tof: "92.61%",
    decote: "6.33%",
    endettement: "15.3%",
    frais_souscription: "10%",
    geographie: {
    "Irlande": 0.6,
    "Belgique": 3,
    "Pays-Bas": 7.9,
    "Allemagne": 4.5,
    "Grand Paris": 25,
    "Royaume-Uni": 2.9,
    "Paris Centre": 22.5,
    "Reste de l'Europe": 0.8,
    "Métropoles françaises": 32.8
},
    secteurs: {
    "Autres": 9.5,
    "Bureaux": 36.3,
    "Galeries commerciales": 13.7,
    "Commerces de centre-ville et milieu urbain": 24.1,
    "Moyennes surfaces commerciales de périphéries": 16.4
},
    avantages: [
      "Rendement attractif de 5.04%",
      "Label ISR - Investissement responsable",
      "Gérée par SOFIDY"
],
    description_courte: "SCPI Immorente gérée par SOFIDY offrant 5.04% de rendement avec un taux d'occupation de 92.61%.",
    description_longue: "Immorente, créée en 1988 par SOFIDY, se distingue par son rendement de 5.04% et un taux d'occupation de 92.61%. Avec une capitalisation de 4392 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.04% de taux de distribution",
      "Taux d'occupation : 92.61% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : SOFIDY"
],
    points_attention: [
      "Surcote importante de 6.33% - Prix de part nettement supérieur à la valeur de retrait",
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Immorente`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'kyaneos-pierre': {
    nom: "Kyaneos Pierre",
    slug: "kyaneos-pierre",
    societe_gestion: "KYANEOS ASSET MANAGEMENT",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "384.78 M€",
    prix_souscription: "224 €",
    rendement: "4.96%",
    tof: "90%",
    decote: "-3.66%",
    endettement: "0%",
    frais_souscription: "9.17%",
    geographie: {
    "France": 100
},
    secteurs: {
    "Tertiaire": 20,
    "Résidentiel": 80
},
    avantages: [
      "Label ISR - Investissement responsable",
      "Endettement faible de 0%",
      "Gérée par KYANEOS ASSET MANAGEMENT"
],
    description_courte: "SCPI Kyaneos Pierre gérée par KYANEOS ASSET MANAGEMENT offrant 4.96% de rendement avec un taux d'occupation de 90%.",
    description_longue: "Kyaneos Pierre, créée en 2018 par KYANEOS ASSET MANAGEMENT, se distingue par son rendement de 4.96% et un taux d'occupation de 90%. Avec une capitalisation de 384.78 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.96% de taux de distribution",
      "Taux d'occupation : 90% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : KYANEOS ASSET MANAGEMENT"
],
    points_attention: [
      "Liquidité limitée - Délai de retrait possible",
      "Frais de souscription à prendre en compte",
      "Risque de vacance locative",
      "Durée de placement recommandée : 8 à 10 ans minimum"
],
    profil_investisseur: "Investisseurs prudents privilégiant la sécurité. Convient aux profils prudents à équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Kyaneos pierre`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'lf-avenir-sante': {
    nom: "LF Avenir Santé",
    slug: "lf-avenir-sante",
    societe_gestion: "La Française REM",
    annee_creation: 2021,
    label_isr: true,
    capitalisation: "231.71 M€",
    prix_souscription: "300 €",
    rendement: "5.2%",
    tof: "100%",
    decote: "-2.34%",
    endettement: "23.75%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 32.75,
    "Irlande": 9.65,
    "Belgique": 11.93,
    "Régions": 40.09,
    "Ile-de-France": 5.58
},
    secteurs: {
    "Soins de ville": 43,
    "Établissements sanitaires": 41,
    "Solutions d'accueil générationnelles": 16
},
    avantages: [
      "Rendement attractif de 5.2%",
      "Taux d'occupation élevé de 100%",
      "Label ISR - Investissement responsable",
      "Gérée par La Française REM"
],
    description_courte: "SCPI LF Avenir Santé gérée par La Française REM offrant 5.2% de rendement avec un taux d'occupation de 100%.",
    description_longue: "LF Avenir Santé, créée en 2021 par La Française REM, se distingue par son rendement de 5.2% et un taux d'occupation de 100%. Avec une capitalisation de 231.71 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.2% de taux de distribution",
      "Taux d'occupation : 100% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : La Française REM"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Lf avenir sante`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'lf-europimmo': {
    nom: "LF Europimmo",
    slug: "lf-europimmo",
    societe_gestion: "La Française REM",
    annee_creation: 2014,
    label_isr: true,
    capitalisation: "873.86 M€",
    prix_souscription: "725 €",
    rendement: "4.3%",
    tof: "97.3%",
    decote: "-6.97%",
    endettement: "17.87%",
    frais_souscription: "8%",
    geographie: {
    "France": 16.3,
    "Espagne": 1.1,
    "Belgique": 2.2,
    "Pays-Bas": 8.8,
    "Allemagne": 71.6
},
    secteurs: {
    "Bureaux": 87,
    ", Commerces": 12,
    ", Résidences gérées": 1
},
    avantages: [
      "Taux d'occupation élevé de 97.3%",
      "Label ISR - Investissement responsable",
      "Gérée par La Française REM"
],
    description_courte: "SCPI LF Europimmo gérée par La Française REM offrant 4.3% de rendement avec un taux d'occupation de 97.3%.",
    description_longue: "LF Europimmo, créée en 2014 par La Française REM, se distingue par son rendement de 4.3% et un taux d'occupation de 97.3%. Avec une capitalisation de 873.86 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.3% de taux de distribution",
      "Taux d'occupation : 97.3% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : La Française REM"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Lf europimmo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'lf-grand-paris-patrimoine': {
    nom: "LF Grand Paris Patrimoine",
    slug: "lf-grand-paris-patrimoine",
    societe_gestion: "La Française REM",
    annee_creation: 1999,
    label_isr: true,
    capitalisation: "1251.45 M€",
    prix_souscription: "218 €",
    rendement: "4.4%",
    tof: "95.1%",
    decote: "-7.87%",
    endettement: "32.69%",
    frais_souscription: "8%",
    geographie: {
    "Régions": 15,
    "Ile-de-France": 85
},
    secteurs: {
    "Bureaux": 75,
    "Commerces": 25
},
    avantages: [
      "Taux d'occupation élevé de 95.1%",
      "Label ISR - Investissement responsable",
      "Gérée par La Française REM"
],
    description_courte: "SCPI LF Grand Paris Patrimoine gérée par La Française REM offrant 4.4% de rendement avec un taux d'occupation de 95.1%.",
    description_longue: "LF Grand Paris Patrimoine, créée en 1999 par La Française REM, se distingue par son rendement de 4.4% et un taux d'occupation de 95.1%. Avec une capitalisation de 1251.45 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.4% de taux de distribution",
      "Taux d'occupation : 95.1% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : La Française REM"
],
    points_attention: [
      "Endettement élevé de 32.69%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Lf grand paris patrimoine`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'log-in': {
    nom: "Log In",
    slug: "log-in",
    societe_gestion: "THEOREIM",
    annee_creation: 2022,
    label_isr: true,
    capitalisation: "192.1 M€",
    prix_souscription: "250 €",
    rendement: "6%",
    tof: "98.6%",
    decote: "-3.18%",
    endettement: "4.45%",
    frais_souscription: "10%",
    geographie: {
    "France": 40,
    "Belgique": 10,
    "Pays-Bas": 15,
    "Allemagne": 25,
    "Royaume-Uni": 10
},
    secteurs: {
    ", Bureaux": 3,
    "Logistique et locaux d'activités": 97
},
    avantages: [
      "Rendement attractif de 6%",
      "Taux d'occupation élevé de 98.6%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 4.45%"
],
    description_courte: "SCPI Log In gérée par THEOREIM offrant 6% de rendement avec un taux d'occupation de 98.6%.",
    description_longue: "Log In, créée en 2022 par THEOREIM, se distingue par son rendement de 6% et un taux d'occupation de 98.6%. Avec une capitalisation de 192.1 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 6% de taux de distribution",
      "Taux d'occupation : 98.6% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : THEOREIM"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un rendement élevé avec une gestion prudente. Convient aux profils équilibrés à dynamiques avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Log in`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'ncap-education-sante': {
    nom: "NCap Education Santé",
    slug: "ncap-education-sante",
    societe_gestion: "Norma Capital",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "110 M€",
    prix_souscription: "202 €",
    rendement: "4.85%",
    tof: "96.5%",
    decote: "0%",
    endettement: "0%",
    frais_souscription: "10%",
    geographie: {
    "France": 85,
    "Zone euro": 10,
    "Hors zone euro": 5
},
    secteurs: {
    "Bien-être": 16,
    "Éducation": 16,
    "Environnement": 2,
    "Santé / social": 66
},
    avantages: [
      "Taux d'occupation élevé de 96.5%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 0%",
      "Gérée par Norma Capital"
],
    description_courte: "SCPI NCap Education Santé gérée par Norma Capital offrant 4.85% de rendement avec un taux d'occupation de 96.5%.",
    description_longue: "NCap Education Santé, créée en 2018 par Norma Capital, se distingue par son rendement de 4.85% et un taux d'occupation de 96.5%. Avec une capitalisation de 110 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.85% de taux de distribution",
      "Taux d'occupation : 96.5% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Norma Capital"
],
    points_attention: [
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs prudents privilégiant la sécurité. Convient aux profils prudents à équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Ncap education sante`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'ncap-regions': {
    nom: "NCap Régions",
    slug: "ncap-regions",
    societe_gestion: "Norma Capital",
    annee_creation: 2015,
    label_isr: true,
    capitalisation: "972.8 M€",
    prix_souscription: "670 €",
    rendement: "5.72%",
    tof: "92.7%",
    decote: "-4.43%",
    endettement: "25.9%",
    frais_souscription: "10%",
    geographie: {
    "Ile-de-France": 35,
    "Grandes agglomérations de province": 65
},
    secteurs: {
    "Bureaux": 45,
    "Commerces": 20,
    "Activités": 35
},
    avantages: [
      "Rendement attractif de 5.72%",
      "Label ISR - Investissement responsable",
      "Gérée par Norma Capital"
],
    description_courte: "SCPI NCap Régions gérée par Norma Capital offrant 5.72% de rendement avec un taux d'occupation de 92.7%.",
    description_longue: "NCap Régions, créée en 2015 par Norma Capital, se distingue par son rendement de 5.72% et un taux d'occupation de 92.7%. Avec une capitalisation de 972.8 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.72% de taux de distribution",
      "Taux d'occupation : 92.7% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Norma Capital"
],
    points_attention: [
      "Endettement élevé de 25.9%",
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Ncap regions`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'novapierre-residentiel': {
    nom: "Novapierre Résidentiel",
    slug: "novapierre-residentiel",
    societe_gestion: "PAREF GESTION",
    annee_creation: 1996,
    label_isr: false,
    capitalisation: "347.9 M€",
    prix_souscription: "1664 €",
    rendement: "0%",
    tof: "90.7%",
    decote: "5.22%",
    endettement: "17.1%",
    frais_souscription: "8.29%",
    geographie: {
    "Nice": 2.3,
    "Paris": 77.8,
    "Région parisienne": 19.9
},
    secteurs: {
    "Résidentiel": 100
},
    avantages: [
      "Gérée par PAREF GESTION"
],
    description_courte: "SCPI Novapierre Résidentiel gérée par PAREF GESTION offrant 0% de rendement avec un taux d'occupation de 90.7%.",
    description_longue: "Novapierre Résidentiel, créée en 1996 par PAREF GESTION, se distingue par son rendement de 0% et un taux d'occupation de 90.7%. Avec une capitalisation de 347.9 M€, elle offre une solution d'investissement immobilier  adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Taux d'occupation : 90.7% des biens loués",
      "Gestion professionnelle",
      "Société de gestion reconnue : PAREF GESTION"
],
    points_attention: [
      "Surcote importante de 5.22% - Prix de part nettement supérieur à la valeur de retrait",
      "Rendement de 0% - Aucune distribution",
      "Liquidité limitée - Délai de retrait possible",
      "Frais de souscription à prendre en compte",
      "Durée de placement recommandée : 8 à 10 ans minimum"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Novapierre residentiel`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'opportunite-immo': {
    nom: "Opportunité Immo",
    slug: "opportunite-immo",
    societe_gestion: "La Française REM",
    annee_creation: 2012,
    label_isr: true,
    capitalisation: "313.02 M€",
    prix_souscription: "203 €",
    rendement: "5.62%",
    tof: "97.5%",
    decote: "-7.79%",
    endettement: "30%",
    frais_souscription: "9%",
    geographie: {
    "Europe": 30,
    "France": 70
},
    secteurs: {
    "Bureaux et commerces": 30,
    "Logistique et locaux d'activités": 70
},
    avantages: [
      "Décote de 7.79% - Opportunité d'achat 7.8% moins cher que le prix de souscription",
      "Rendement attractif de 5.62%",
      "Taux d'occupation élevé de 97.5%",
      "Label ISR - Investissement responsable",
      "Gérée par La Française REM"
],
    description_courte: "SCPI Opportunité Immo gérée par La Française REM offrant 5.62% de rendement avec un taux d'occupation de 97.5%.",
    description_longue: "Opportunité Immo, créée en 2012 par La Française REM, se distingue par son rendement de 5.62% et un taux d'occupation de 97.5%. Avec une capitalisation de 313.02 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Décote de 7.79% - Opportunité d'achat 7.8% moins cher",
      "Rendement attractif : 5.62% de taux de distribution",
      "Taux d'occupation : 97.5% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : La Française REM"
],
    points_attention: [
      "Endettement élevé de 30%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Opportunite immo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'paref-evo': {
    nom: "Paref Evo",
    slug: "paref-evo",
    societe_gestion: "PAREF GESTION",
    annee_creation: 2020,
    label_isr: true,
    capitalisation: "47 M€",
    prix_souscription: "250 €",
    rendement: "6%",
    tof: "97.2%",
    decote: "1.48%",
    endettement: "0%",
    frais_souscription: "10%",
    geographie: {
    "Pologne": 100
},
    secteurs: {
    "Bureaux": 89.7,
    "Locaux d'activité": 10.3
},
    avantages: [
      "Rendement attractif de 6%",
      "Taux d'occupation élevé de 97.2%",
      "Label ISR - Investissement responsable",
      "Endettement faible de 0%"
],
    description_courte: "SCPI Paref Evo gérée par PAREF GESTION offrant 6% de rendement avec un taux d'occupation de 97.2%.",
    description_longue: "Paref Evo, créée en 2020 par PAREF GESTION, se distingue par son rendement de 6% et un taux d'occupation de 97.2%. Avec une capitalisation de 47 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 6% de taux de distribution",
      "Taux d'occupation : 97.2% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : PAREF GESTION"
],
    points_attention: [
      "Surcote de 1.48% - Prix de part supérieur à la valeur de retrait",
      "Exposition 100% en Pologne - Risque de concentration géographique",
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs recherchant un rendement élevé avec une gestion prudente. Convient aux profils équilibrés à dynamiques avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Paref evo`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'paref-hexa': {
    nom: "Paref Hexa",
    slug: "paref-hexa",
    societe_gestion: "PAREF GESTION",
    annee_creation: 1991,
    label_isr: true,
    capitalisation: "267.6 M€",
    prix_souscription: "210 €",
    rendement: "6%",
    tof: "93.6%",
    decote: "5.25%",
    endettement: "25.8%",
    frais_souscription: "10%",
    geographie: {
    "Paris": 5.1,
    "Ile-de-France": 27.1,
    "Autres régions": 11.5,
    "12 métropoles régionales": 56.3
},
    secteurs: {
    "Autres": 3.5,
    "Bureaux": 66.3,
    "Locaux d'activité": 23.9,
    "Logistique et Messagerie": 6.3
},
    avantages: [
      "Rendement attractif de 6%",
      "Label ISR - Investissement responsable",
      "Gérée par PAREF GESTION"
],
    description_courte: "SCPI Paref Hexa gérée par PAREF GESTION offrant 6% de rendement avec un taux d'occupation de 93.6%.",
    description_longue: "Paref Hexa, créée en 1991 par PAREF GESTION, se distingue par son rendement de 6% et un taux d'occupation de 93.6%. Avec une capitalisation de 267.6 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 6% de taux de distribution",
      "Taux d'occupation : 93.6% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : PAREF GESTION"
],
    points_attention: [
      "Surcote importante de 5.25% - Prix de part nettement supérieur à la valeur de retrait",
      "Endettement élevé de 25.8%",
      "Frais de souscription de 10%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Paref hexa`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'patrimmo-croissance-impact': {
    nom: "Patrimmo Croissance Impact",
    slug: "patrimmo-croissance-impact",
    societe_gestion: "Præmia REIM France",
    annee_creation: 2025,
    label_isr: true,
    capitalisation: "189.7 M€",
    prix_souscription: "677 €",
    rendement: "0%",
    tof: "92.4%",
    decote: "0%",
    endettement: "6.21%",
    frais_souscription: "9.8%",
    geographie: {
    "Paris": 32.6,
    "Régions": 27.8,
    "Parts SCPI": 2.8,
    "Région parisienne": 36.8
},
    secteurs: {
    "Logement": 100
},
    avantages: [
      "Label ISR - Investissement responsable",
      "Endettement faible de 6.21%",
      "Gérée par Præmia REIM France"
],
    description_courte: "SCPI Patrimmo Croissance Impact gérée par Præmia REIM France offrant 0% de rendement avec un taux d'occupation de 92.4%.",
    description_longue: "Patrimmo Croissance Impact, créée en 2025 par Præmia REIM France, se distingue par son rendement de 0% et un taux d'occupation de 92.4%. Avec une capitalisation de 189.7 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 0% de taux de distribution",
      "Taux d'occupation : 92.4% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Præmia REIM France"
],
    points_attention: [
      "SCPI récente créée en 2025"
],
    profil_investisseur: "Investisseurs prudents privilégiant la sécurité. Convient aux profils prudents à équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Patrimmo croissance impact`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'perial-grand-paris': {
    nom: "Perial Grand Paris",
    slug: "perial-grand-paris",
    societe_gestion: "PERIAL Asset Management",
    annee_creation: 2017,
    label_isr: true,
    capitalisation: "1100 M€",
    prix_souscription: "458 €",
    rendement: "5.1%",
    tof: "89.4%",
    decote: "1.84%",
    endettement: "33.8%",
    frais_souscription: "9.5%",
    geographie: {
    "Paris": 20.3,
    "Régions": 4.3,
    "Région Parisienne": 75.4
},
    secteurs: {
    "Bureaux": 94.4,
    "Commerces": 2.2,
    "Hôtels, tourisme, loisirs": 1.6,
    "Logistique et locaux d'activités": 1.8
},
    avantages: [
      "Rendement attractif de 5.1%",
      "Label ISR - Investissement responsable",
      "Gérée par PERIAL Asset Management"
],
    description_courte: "SCPI Perial Grand Paris gérée par PERIAL Asset Management offrant 5.1% de rendement avec un taux d'occupation de 89.4%.",
    description_longue: "Perial Grand Paris, créée en 2017 par PERIAL Asset Management, se distingue par son rendement de 5.1% et un taux d'occupation de 89.4%. Avec une capitalisation de 1100 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.1% de taux de distribution",
      "Taux d'occupation : 89.4% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : PERIAL Asset Management"
],
    points_attention: [
      "Surcote de 1.84% - Prix de part supérieur à la valeur de retrait",
      "Endettement très élevé de 33.8%",
      "TOF de 89.4% en dessous de la moyenne"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Perial grand paris`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'perial-hospitalite-europe': {
    nom: "Perial Hospitalité Europe",
    slug: "perial-hospitalite-europe",
    societe_gestion: "PERIAL Asset Management",
    annee_creation: 2020,
    label_isr: true,
    capitalisation: "333.11 M€",
    prix_souscription: "181 €",
    rendement: "4.02%",
    tof: "98.1%",
    decote: "0%",
    endettement: "20.7%",
    frais_souscription: "8.5%",
    geographie: {
    "Italie": 11.4,
    "Espagne": 17.6,
    "Pays-Bas": 3.5,
    "Allemagne": 67.5
},
    secteurs: {
    "Santé et éducation": 61,
    "Hôtels, tourisme, loisirs": 37.9,
    "Alternatifs, résidences étudiantes": 1.1
},
    avantages: [
      "Taux d'occupation élevé de 98.1%",
      "Label ISR - Investissement responsable",
      "Gérée par PERIAL Asset Management"
],
    description_courte: "SCPI Perial Hospitalité Europe gérée par PERIAL Asset Management offrant 4.02% de rendement avec un taux d'occupation de 98.1%.",
    description_longue: "Perial Hospitalité Europe, créée en 2020 par PERIAL Asset Management, se distingue par son rendement de 4.02% et un taux d'occupation de 98.1%. Avec une capitalisation de 333.11 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 4.02% de taux de distribution",
      "Taux d'occupation : 98.1% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : PERIAL Asset Management"
],
    points_attention: [
      "Liquidité limitée - Délai de retrait possible",
      "Frais de souscription à prendre en compte",
      "Risque de vacance locative",
      "Durée de placement recommandée : 8 à 10 ans minimum"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Perial hospitalite europe`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'perial-opportunites-europe': {
    nom: "Perial Opportunités Europe",
    slug: "perial-opportunites-europe",
    societe_gestion: "PERIAL Asset Management",
    annee_creation: 1998,
    label_isr: true,
    capitalisation: "777.63 M€",
    prix_souscription: "880 €",
    rendement: "6.27%",
    tof: "93.6%",
    decote: "-3.45%",
    endettement: "30.6%",
    frais_souscription: "9.5%",
    geographie: {
    "Régions": 41,
    "Région parisienne": 19.2,
    "Europe (hors France)": 39.8
},
    secteurs: {
    "Bureaux": 49.5,
    "Commerces": 18.3,
    "Alternatifs": 0.1,
    "Santé & éducation": 4.9,
    "Hôtels, tourisme, loisirs": 26.3,
    "Logistique et locaux d'activités": 0.8
},
    avantages: [
      "Rendement attractif de 6.27%",
      "Label ISR - Investissement responsable",
      "Gérée par PERIAL Asset Management"
],
    description_courte: "SCPI Perial Opportunités Europe gérée par PERIAL Asset Management offrant 6.27% de rendement avec un taux d'occupation de 93.6%.",
    description_longue: "Perial Opportunités Europe, créée en 1998 par PERIAL Asset Management, se distingue par son rendement de 6.27% et un taux d'occupation de 93.6%. Avec une capitalisation de 777.63 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 6.27% de taux de distribution",
      "Taux d'occupation : 93.6% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : PERIAL Asset Management"
],
    points_attention: [
      "Endettement élevé de 30.6%"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Perial opportunites europe`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'sofiprime': {
    nom: "Sofiprime",
    slug: "sofiprime",
    societe_gestion: "Sofidy",
    annee_creation: 2016,
    label_isr: false,
    capitalisation: "44.9 M€",
    prix_souscription: "280 €",
    rendement: "0.54%",
    tof: "88.52%",
    decote: "-1.31%",
    endettement: "22.9%",
    frais_souscription: "9.67%",
    geographie: {
    "Paris": 41,
    "Régions françaises": 25,
    "Île-de-France hors Paris": 34
},
    secteurs: {
    "Bureaux": 98,
    ", Commerces": 2
},
    avantages: [
      "Gérée par Sofidy"
],
    description_courte: "SCPI Sofiprime gérée par Sofidy offrant 0.54% de rendement avec un taux d'occupation de 88.52%.",
    description_longue: "Sofiprime, créée en 2016 par Sofidy, se distingue par son rendement de 0.54% et un taux d'occupation de 88.52%. Avec une capitalisation de 44.9 M€, elle offre une solution d'investissement immobilier  adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 0.54% de taux de distribution",
      "Taux d'occupation : 88.52% des biens loués",
      "Gestion professionnelle",
      "Société de gestion reconnue : Sofidy"
],
    points_attention: [
      "Liquidité limitée - Délai de retrait possible",
      "Frais de souscription à prendre en compte",
      "Risque de vacance locative",
      "Durée de placement recommandée : 8 à 10 ans minimum"
],
    profil_investisseur: "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Sofiprime`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'urban-coeur-de-commerce': {
    nom: "Urban Coeur de Commerce",
    slug: "urban-coeur-de-commerce",
    societe_gestion: "Urban Premium",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "72.99 M€",
    prix_souscription: "300 €",
    rendement: "5.1%",
    tof: "92.3%",
    decote: "-5.52%",
    endettement: "30%",
    frais_souscription: "9.86%",
    geographie: {
    "Province": 83,
    "Île de France": 17
},
    secteurs: {
    "Commerces divers": 25,
    "Commerces de santé": 16,
    "Commerces de services": 30,
    "Commerces alimentaires, restauration": 29
},
    avantages: [
      "Rendement attractif de 5.1%",
      "Label ISR - Investissement responsable",
      "Gérée par Urban Premium"
],
    description_courte: "SCPI Urban Coeur de Commerce gérée par Urban Premium offrant 5.1% de rendement avec un taux d'occupation de 92.3%.",
    description_longue: "Urban Coeur de Commerce, créée en 2018 par Urban Premium, se distingue par son rendement de 5.1% et un taux d'occupation de 92.3%. Avec une capitalisation de 72.99 M€, elle offre une solution d'investissement immobilier labellisée ISR adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: [
      "Rendement attractif : 5.1% de taux de distribution",
      "Taux d'occupation : 92.3% des biens loués",
      "Label ISR - Investissement responsable",
      "Société de gestion reconnue : Urban Premium"
],
    points_attention: [
      "Endettement élevé de 30%"
],
    profil_investisseur: "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Urban coeur de commerce`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'altixia-cadence-12': {
    nom: "Altixia Cadence 12",
    slug: "altixia-cadence-12",
    h1_question: "Altixia Cadence 12 : Faut-il Investir dans cette SCPI ?",
    societe_gestion: "ALTIXIA REIM",
    annee_creation: 2018,
    label_isr: true,
    capitalisation: "186.78 M€",
    prix_souscription: "200 €",
    rendement: "5.73%",
    tof: "96.9%",
    decote: "0%",
    endettement: "11.35%",
    frais_souscription: "9%",
    frequence_versement: "Mensuel",
    geographie: {
      "Régions": 59,
      "Île-de-France": 23,
      "Espagne": 9,
      "Irlande": 6,
      "Paris": 3
    },
    secteurs: {
      "Commerces": 38,
      "Activités": 32,
      "Bureaux": 26,
      "Logistique": 4
    },
    avantages: [
      "Rendement solide de 5.73%",
      "Versements mensuels des loyers",
      "Excellent taux d'occupation de 96.9%",
      "Endettement maîtrisé à 11.35%"
    ],
    description_courte: "SCPI diversifiée créée en 2018 offrant 5.73% de rendement avec versements mensuels et un patrimoine majoritairement en régions.",
    description_longue: "Altixia Cadence 12, gérée par ALTIXIA REIM depuis 2018, propose une stratégie d'investissement diversifiée principalement en régions françaises (59%) avec une ouverture européenne. Le patrimoine de 29 immeubles se concentre sur les commerces (38%) et activités (32%), offrant une décote de 0% et un excellent TOF de 96.9%.",
    pourquoi_investir: [
      "Rendement attractif de 5.73% avec versements mensuels",
      "Taux d'occupation élevé de 96.9%, gage de revenus réguliers",
      "Diversification sectorielle équilibrée entre commerces, activités et bureaux",
      "Endettement modéré de 11.35%, limitant les risques financiers",
      "Label ISR - Investissement socialement responsable"
    ],
    points_attention: [
      "SCPI relativement récente créée en 2018",
      "Forte concentration en régions (59%) avec exposition limitée à Paris (3%)",
      "Frais de souscription de 9%"
    ],
    profil_investisseur: "Investisseurs recherchant des revenus mensuels réguliers avec une diversification géographique en faveur des régions. Convient aux profils équilibrés avec un horizon 9 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Altixia cadence 12`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'credit-mutuel-pierre-1': {
    nom: "Crédit Mutuel Pierre 1",
    slug: "credit-mutuel-pierre-1",
    h1_question: "Crédit Mutuel Pierre 1 : Valeur Sûre ou SCPI à Éviter ?",
    societe_gestion: "La Française REM",
    annee_creation: 1973,
    label_isr: true,
    capitalisation: "2154.2 M€",
    prix_souscription: "210 €",
    rendement: "4.52%",
    tof: "93.8%",
    decote: "-4.31%",
    endettement: "25.6%",
    frais_souscription: "8.5%",
    frequence_versement: "Trimestriel",
    geographie: {
      "Île-de-France": 53.2,
      "Paris": 26.9,
      "Régions": 16.8,
      "Allemagne": 3.1
    },
    secteurs: {
      "Bureaux": 80.1,
      "Locaux commerciaux": 19.9
    },
    avantages: [
      "SCPI historique créée en 1973 - Plus de 50 ans d'expérience",
      "Capitalisation importante de 2.15 milliards d'euros",
      "Forte présence en Île-de-France (80.1%)",
      "Gestion par La Française REM, leader du marché"
    ],
    description_courte: "SCPI historique créée en 1973 offrant 4.52% de rendement avec une capitalisation de 2.15 Mds€ et une forte concentration bureaux en Île-de-France.",
    description_longue: "Crédit Mutuel Pierre 1 est l'une des SCPI les plus anciennes du marché français, créée en 1973 et gérée par La Française REM. Avec une capitalisation de 2.15 milliards d'euros et un patrimoine de 132 immeubles, elle se concentre principalement sur les bureaux (80.1%) en Île-de-France. Son historique de plus de 50 ans et sa gestion prudente en font une valeur refuge pour les investisseurs patrimoniaux.",
    pourquoi_investir: [
      "SCPI historique avec 50+ ans de track record",
      "Capitalisation massive de 2.15 Mds€, gage de liquidité",
      "Exposition premium à l'immobilier tertiaire francilien",
      "Société de gestion La Française REM, leader historique",
      "Label ISR - Engagement responsable"
    ],
    points_attention: [
      "Rendement modéré de 4.52%, inférieur à la moyenne du marché",
      "Forte concentration sur les bureaux (80.1%)",
      "Endettement de 25.6%"
    ],
    profil_investisseur: "Investisseurs patrimoniaux recherchant la sécurité d'une SCPI historique et une exposition à l'immobilier de bureaux en Île-de-France. Convient aux profils prudents avec un horizon 10 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Credit mutuel pierre 1`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'efimmo-1': {
    nom: "Efimmo 1",
    slug: "efimmo-1",
    h1_question: "Efimmo 1 : Analyse de la Plus Grande SCPI de Bureaux en France",
    societe_gestion: "Sofidy",
    annee_creation: 1987,
    label_isr: true,
    capitalisation: "3749.9 M€",
    prix_souscription: "225 €",
    rendement: "5.5%",
    tof: "90.89%",
    decote: "-6.07%",
    endettement: "28.1%",
    frais_souscription: "10%",
    frequence_versement: "Trimestriel",
    geographie: {
      "Île-de-France": 54.5,
      "Régions": 36.1,
      "Paris": 7.2,
      "Allemagne": 2.2
    },
    secteurs: {
      "Bureaux": 78,
      "Commerces": 18,
      "Logistique": 4
    },
    avantages: [
      "Décote de 6.07% - Opportunité d'achat 6% moins cher que le prix de souscription",
      "Plus grande SCPI de bureaux avec 3.75 Mds€ de capitalisation",
      "Rendement attractif de 5.5%",
      "Patrimoine diversifié de 252 immeubles",
      "Expérience de plus de 35 ans sur le marché"
    ],
    description_courte: "La plus grande SCPI de bureaux en France avec 3.75 Mds€ de capitalisation, offrant 5.5% de rendement et 252 immeubles diversifiés.",
    description_longue: "Efimmo 1, créée en 1987 et gérée par Sofidy, est la plus importante SCPI de bureaux du marché français avec une capitalisation de 3.75 milliards d'euros. Son patrimoine exceptionnel de 252 immeubles se concentre principalement sur les bureaux (78%) avec une forte présence en Île-de-France (61.7%). Son expérience de plus de 35 ans et sa taille critique en font un acteur incontournable de l'immobilier tertiaire français.",
    pourquoi_investir: [
      "Décote de 6.07% - Opportunité d'achat 6% moins cher",
      "Leader incontesté des SCPI de bureaux avec 3.75 Mds€",
      "Rendement de 5.5%, supérieur à la moyenne des SCPI de bureaux",
      "Diversification maximale avec 252 immeubles",
      "Expertise Sofidy depuis 1987",
      "Label ISR - Investissement responsable"
    ],
    points_attention: [
      "TOF de 90.89%, légèrement en dessous de la moyenne",
      "Endettement de 28.1%",
      "Forte concentration sur les bureaux (78%)"
    ],
    profil_investisseur: "Investisseurs recherchant l'exposition à la plus grande SCPI de bureaux de France avec une diversification maximale. Convient aux profils équilibrés acceptant le risque de marché des bureaux avec un horizon 8 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Efimmo 1`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'novapierre-1': {
    nom: "Novapierre 1",
    slug: "novapierre-1",
    h1_question: "Novapierre 1 : La SCPI de Commerces de Proximité à la Loupe",
    societe_gestion: "PAREF GESTION",
    annee_creation: 1999,
    label_isr: true,
    capitalisation: "180.1 M€",
    prix_souscription: "442 €",
    rendement: "5%",
    tof: "89.7%",
    decote: "0%",
    endettement: "29.7%",
    frais_souscription: "10%",
    frequence_versement: "Trimestriel",
    geographie: {
      "Autres régions": 30.8,
      "Paris": 28.6,
      "12 métropoles régionales": 21.2,
      "Île-de-France hors Paris": 19.4
    },
    secteurs: {
      "Équipement de la maison": 30.3,
      "Restauration": 15.7,
      "Alimentaire": 15.2,
      "Services": 12.5,
      "Santé": 9.8,
      "Autres": 9.9,
      "Culture et loisirs": 6.6
    },
    avantages: [
      "Spécialiste des commerces de proximité depuis 1999",
      "Diversification sectorielle exceptionnelle (7 secteurs)",
      "Prix de part sans décote (0%)",
      "Répartition géographique équilibrée"
    ],
    description_courte: "SCPI spécialisée dans les commerces de proximité offrant 5% de rendement avec une diversification sectorielle exceptionnelle sur 122 immeubles.",
    description_longue: "Novapierre 1, créée en 1999 et gérée par PAREF GESTION, est une SCPI spécialisée dans les commerces de proximité. Avec 122 immeubles répartis dans toute la France, elle offre une diversification sectorielle unique avec 7 secteurs d'activité différents. Sa stratégie se concentre sur les commerces essentiels et de proximité, offrant une résilience face aux crises économiques.",
    pourquoi_investir: [
      "Expert des commerces de proximité depuis 25 ans",
      "Diversification sectorielle maximale sur 7 secteurs",
      "Répartition géographique équilibrée sur toute la France",
      "Secteurs résilients : alimentaire, santé, services",
      "Aucune décote sur le prix de part"
    ],
    points_attention: [
      "TOF de 89.7%, en dessous de la moyenne du marché",
      "Endettement élevé de 29.7%",
      "Prix de part élevé à 442€",
      "Rendement modéré de 5%"
    ],
    profil_investisseur: "Investisseurs recherchant une exposition aux commerces de proximité avec une diversification sectorielle maximale. Convient aux profils équilibrés recherchant la résilience avec un horizon 10 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Novapierre 1`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'perial-o2': {
    nom: "Périal O2",
    slug: "perial-o2",
    h1_question: "Périal O2 : Analyse Complète de cette SCPI de Bureaux",
    societe_gestion: "PERIAL Asset Management",
    annee_creation: 2009,
    label_isr: true,
    capitalisation: "2420 M€",
    prix_souscription: "164 €",
    rendement: "4.91%",
    tof: "91.3%",
    decote: "7.46%",
    endettement: "32.3%",
    frais_souscription: "8.5%",
    frequence_versement: "Trimestriel",
    geographie: {
      "Région parisienne": 36.6,
      "Régions": 38.4,
      "Europe hors France": 22.5,
      "Paris": 2.5
    },
    secteurs: {
      "Bureaux": 85.4,
      "Hôtels, tourisme, loisirs": 5.8,
      "Santé & éducation": 4.5,
      "Commerces": 3.6,
      "Logistique et locaux d'activités": 0.7
    },
    avantages: [
      "Capitalisation majeure de 2.42 Mds€",
      "Diversification européenne (22.5%)",
      "Expertise Périal Asset Management depuis 2009",
      "Label ISR"
    ],
    description_courte: "SCPI de bureaux de 2.42 Mds€ offrant 4.91% de rendement avec 198 immeubles diversifiés en France et Europe.",
    description_longue: "Périal O2, créée en 2009 et gérée par PERIAL Asset Management, est une SCPI majeure spécialisée dans les bureaux avec une capitalisation de 2.42 milliards d'euros. Son patrimoine de 198 immeubles se concentre à 85.4% sur les bureaux avec une répartition équilibrée entre régions françaises et une ouverture européenne significative.",
    pourquoi_investir: [
      "Capitalisation massive de 2.42 Mds€",
      "Diversification géographique France + Europe",
      "Société de gestion Périal reconnue",
      "Label ISR",
      "198 immeubles diversifiés"
    ],
    points_attention: [
      "Surcote de 7.46% - Prix de part supérieur à la valeur de retrait",
      "Endettement élevé de 32.3%",
      "Rendement modéré de 4.91%",
      "Forte concentration sur les bureaux (85.4%)",
      "TOF de 91.3%"
    ],
    profil_investisseur: "Investisseurs recherchant une exposition aux bureaux avec une SCPI de grande taille. Convient aux profils équilibrés acceptant le risque immobilier de bureaux avec un horizon 8 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Perial o2`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'selectinvest-1': {
    nom: "Selectinvest 1",
    slug: "selectinvest-1",
    h1_question: "Selectinvest 1 : La Plus Ancienne SCPI Vaut-elle Encore le Coup ?",
    societe_gestion: "La Française REM",
    annee_creation: 1968,
    label_isr: true,
    capitalisation: "1552.4 M€",
    prix_souscription: "530 €",
    rendement: "4.4%",
    tof: "89.8%",
    decote: "-9.46%",
    endettement: "33.8%",
    frais_souscription: "7.5%",
    frequence_versement: "Trimestriel",
    geographie: {
      "Île-de-France": 54.5,
      "Régions": 24.8,
      "Paris": 17.28,
      "Allemagne": 3.42
    },
    secteurs: {
      "Bureaux": 72.52,
      "Commerces": 21.41,
      "Logistique et locaux d'activités": 3.87,
      "Hôtels, tourisme et loisirs": 1.68,
      "Santé et éducation": 0.52
    },
    avantages: [
      "Plus ancienne SCPI de France créée en 1968 - 57 ans d'histoire",
      "Capitalisation majeure de 1.55 Mds€",
      "Patrimoine diversifié de 248 immeubles",
      "Gestion par La Française REM, leader historique"
    ],
    description_courte: "La plus ancienne SCPI de France créée en 1968 offrant 4.4% de rendement avec 1.55 Mds€ de capitalisation et 248 immeubles.",
    description_longue: "Selectinvest 1, créée en 1968 et gérée par La Française REM, est la doyenne des SCPI françaises avec 57 ans d'expérience. Avec une capitalisation de 1.55 milliard d'euros et 248 immeubles, elle se concentre principalement sur les bureaux en Île-de-France. Son historique exceptionnel et sa gestion prudente en font une référence pour les investisseurs patrimoniaux recherchant la stabilité sur le long terme.",
    pourquoi_investir: [
      "SCPI la plus ancienne avec 57 ans d'histoire",
      "Capitalisation importante de 1.55 Mds€",
      "Diversification maximale avec 248 immeubles",
      "Expertise La Française REM depuis 1968",
      "Frais de souscription réduits à 7.5%"
    ],
    points_attention: [
      "Rendement modeste de 4.4%",
      "TOF de 89.8%, en dessous de la moyenne",
      "Endettement élevé de 33.8%",
      "Prix de part élevé à 530€"
    ],
    profil_investisseur: "Investisseurs patrimoniaux recherchant la sécurité d'une SCPI historique avec 57 ans de track record. Convient aux profils prudents privilégiant la stabilité avec un horizon 9 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Selectinvest 1`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
},
  'selectipierre-2': {
    nom: "Selectipierre 2",
    slug: "selectipierre-2",
    h1_question: "Selectipierre 2 : SCPI Historique Parisienne à Analyser",
    societe_gestion: "FIDUCIAL Gérance",
    annee_creation: 1978,
    label_isr: true,
    capitalisation: "473.1 M€",
    prix_souscription: "773 €",
    rendement: "4.08%",
    tof: "95.35%",
    decote: "-2.95%",
    endettement: "24.57%",
    frais_souscription: "10%",
    frequence_versement: "Trimestriel",
    geographie: {
      "Paris": 71,
      "Île-de-France": 22.6,
      "Régions": 6.4
    },
    secteurs: {
      "Bureaux": 67.5,
      "Locaux commerciaux": 21.3,
      "Locaux d'habitation": 5.6,
      "Résidence hôtelières / étudiantes": 4.3,
      "Locaux d'activité": 1.3
    },
    avantages: [
      "SCPI historique créée en 1978",
      "Forte concentration parisienne (71%)",
      "Excellent taux d'occupation de 95.35%",
      "Gestion FIDUCIAL Gérance depuis 1978"
    ],
    description_courte: "SCPI historique créée en 1978 offrant 4.08% de rendement avec une forte concentration parisienne (71%) et un TOF de 95.35%.",
    description_longue: "Selectipierre 2, créée en 1978 et gérée par FIDUCIAL Gérance, est une SCPI historique concentrée sur l'immobilier parisien (71%). Son patrimoine de 70 immeubles se focalise principalement sur les bureaux (67.5%) et commerces (21.3%) dans les quartiers premium de Paris. Son excellent taux d'occupation de 95.35% témoigne de la qualité de ses actifs et de sa gestion rigoureuse.",
    pourquoi_investir: [
      "SCPI historique avec 47 ans d'expérience",
      "Exposition premium à Paris (71%)",
      "Excellent TOF de 95.35%",
      "Diversification sectorielle bureaux-commerces",
      "Label ISR"
    ],
    points_attention: [
      "Rendement faible de 4.08%",
      "Prix de part très élevé à 773€",
      "Forte concentration géographique sur Paris",
      "Ticket d'entrée élevé à 7730€"
    ],
    profil_investisseur: "Investisseurs patrimoniaux recherchant une exposition à l'immobilier parisien premium avec une SCPI historique. Convient aux profils prudents disposant d'un capital conséquent avec un horizon 8 ans minimum."
  ,
    simulator: {
      defaultInvestment: 50000,
      defaultYield: 5.5,
      title: `Simulez vos revenus Selectipierre 2`,
      subtitle: `Calculez vos revenus potentiels avec cette SCPI`,
      theme: 'blue'
    }
}
};
