/**
 * Premier lot de PGA 2025 : valeurs publiées par les sociétés de gestion.
 * Ne jamais extrapoler la PGA à partir du TD courant ou du prix courant.
 * Le reliquat du catalogue reste explicitement « non vérifié ».
 */
export interface OfficialPga2025 {
  year: 2025;
  pgaPct: number;
  distributionPct: number;
  sourceUrl: string;
  sourceLabel: string;
  note?: string;
}

export const OFFICIAL_PGA_2025: Readonly<Record<string, Readonly<OfficialPga2025>>> = {
  'activimmo': {
    year: 2025, pgaPct: 5.49, distributionPct: 5.49,
    sourceUrl: 'https://alderan.fr/wp-content/uploads/2026/04/20260410-Rapport-Annuel-ActivImmo-2025.pdf',
    sourceLabel: 'Alderan, rapport annuel 2025, p. 4',
  },
  'corum-origin': {
    year: 2025, pgaPct: 6.50, distributionPct: 6.50,
    sourceUrl: 'https://www.corum.fr/actus/scpi-corum-performances-2025-et-strategie-dinvestissement',
    sourceLabel: 'CORUM, performances 2025',
  },
  'corum-xl': {
    year: 2025, pgaPct: 5.30, distributionPct: 5.30,
    sourceUrl: 'https://www.corum.fr/actus/scpi-corum-performances-2025-et-strategie-dinvestissement',
    sourceLabel: 'CORUM, performances 2025',
  },
  'corum-eurion': {
    year: 2025, pgaPct: 5.73, distributionPct: 5.73,
    sourceUrl: 'https://www.corum.fr/actus/scpi-corum-performances-2025-et-strategie-dinvestissement',
    sourceLabel: 'CORUM, performances 2025',
  },
  'corum-usa': {
    year: 2025, pgaPct: 7.70, distributionPct: 7.70,
    sourceUrl: 'https://www.corum.fr/actus/scpi-corum-performances-2025-et-strategie-dinvestissement',
    sourceLabel: 'CORUM, performances 2025',
    note: 'Première année complète d’exploitation : performance non représentative d’une période stabilisée.',
  },
  'iroko-zen': {
    year: 2025, pgaPct: 8.13, distributionPct: 7.14,
    sourceUrl: 'https://www.iroko.eu/performance',
    sourceLabel: 'Iroko, performances 2025',
  },
  'iroko-atlas': {
    year: 2025, pgaPct: 9.41, distributionPct: 9.41,
    sourceUrl: 'https://www.iroko.eu/performance',
    sourceLabel: 'Iroko, performances 2025',
    note: 'SCPI lancée en 2025 : la performance initiale peut être non représentative d’une année stabilisée.',
  },
  'comete': {
    year: 2025, pgaPct: 9.00, distributionPct: 9.00,
    sourceUrl: 'https://alderan.fr/scpi-comete/',
    sourceLabel: 'Alderan, Comète, performances 2025',
  },
  'transitions-europe': {
    year: 2025, pgaPct: 8.60, distributionPct: 7.60,
    sourceUrl: 'https://www.arkea-reim.com/upload/docs/application/pdf/2026-05/arkea-reim-transition-europe-ra-2025_2026-05-18_18-57-3_193.pdf',
    sourceLabel: 'Arkéa REIM, rapport annuel Transitions Europe 2025',
  },
  'wemo-one': {
    year: 2025, pgaPct: 15.27, distributionPct: 15.27,
    sourceUrl: 'https://wemo-reim.fr/blog/scpi-wemo-one-resultats-4eme-trimestre-2025/',
    sourceLabel: 'Wemo REIM, bilan 2025',
    note: "Le taux de distribution 2025 peut ne pas être représentatif d'une performance stabilisée.",
  },
  'epargne-pierre': {
    year: 2025, pgaPct: 5.28, distributionPct: 5.28,
    sourceUrl: 'https://atland-voisin.com/actualites/resultat-2025-scpi-atland-voisin-annee-maitrisee-collecte-progression/',
    sourceLabel: 'ATLAND Voisin, résultats 2025',
  },
  'epargne-pierre-europe': {
    year: 2025, pgaPct: 6.75, distributionPct: 6.75,
    sourceUrl: 'https://atland-voisin.com/actualites/resultat-2025-scpi-atland-voisin-annee-maitrisee-collecte-progression/',
    sourceLabel: 'ATLAND Voisin, résultats 2025',
  },
  'coeur-d-europe': {
    year: 2025, pgaPct: 8.25, distributionPct: 6.25,
    sourceUrl: 'https://www.sogenial.fr/actualites/les-echos-investir-palmares-des-scpi-une-annee-exceptionnelle-par-olivier-cheillan/',
    sourceLabel: 'Sogenial, performances 2025',
  },
  'sofidynamic': {
    year: 2025, pgaPct: 14.04, distributionPct: 9.04,
    sourceUrl: 'https://www.sofidy.com/actualites/sofidy-accelere-avec-plus-de-1-1-milliard-deuros-investis-2024-2025/',
    sourceLabel: 'Sofidy, bilan annuel 2025',
    note: "Le taux 2025 peut ne pas être représentatif d'une performance stabilisée.",
  },
  'altixia-cadence-12': {
    year: 2025, pgaPct: 5.15, distributionPct: 5.15,
    sourceUrl: 'https://www.altixia.fr/scpi-cadence.php',
    sourceLabel: 'Altixia REIM, Cadence XII 2025',
  },
  'altixia-commerces': {
    year: 2025, pgaPct: 5.00, distributionPct: 5.00,
    sourceUrl: 'https://www.altixia.fr/scpi-altixia-commerces.php',
    sourceLabel: 'Altixia REIM, Commerces 2025',
  },
  'cristal-life': {
    year: 2025, pgaPct: 7.51, distributionPct: 6.54,
    sourceUrl: 'https://pages.inter-gestion.com/cristal-life',
    sourceLabel: 'Inter Gestion REIM, Cristal Life 2025',
  },
  'cristal-rente': {
    year: 2025, pgaPct: 5.00, distributionPct: 5.00,
    sourceUrl: 'https://pages.inter-gestion.com/cristal-rente',
    sourceLabel: 'Inter Gestion REIM, Cristal Rente 2025',
  },
  'efimmo-1': {
    year: 2025, pgaPct: 4.44, distributionPct: 4.44,
    sourceUrl: 'https://www.sofidy.com/solutions/efimmo1/',
    sourceLabel: 'Sofidy, Efimmo 1, performances 2025',
  },
  'immorente': {
    year: 2025, pgaPct: 5.00, distributionPct: 5.00,
    sourceUrl: 'https://www.sofidy.com/actualites/sofidy-accelere-avec-plus-de-1-1-milliard-deuros-investis-2024-2025/',
    sourceLabel: 'Sofidy, bilan annuel 2025',
  },
  'remake-live': {
    year: 2025, pgaPct: 7.05, distributionPct: 7.05,
    sourceUrl: 'https://www.remake.fr/remake-live',
    sourceLabel: 'Remake, Remake Live 2025',
  },
  'epsicap-nano': {
    year: 2025, pgaPct: 8.27, distributionPct: 7.01,
    sourceUrl: 'https://epsicap.fr/document/bulletin-trimestriel-4t-2025-epsicap-nano/',
    sourceLabel: 'Epsicap REIM, bulletin T4 2025',
  },
  'aestiam-agora': {
    year: 2025, pgaPct: 4.50, distributionPct: 4.50,
    sourceUrl: 'https://www.aestiam.com/doc/agora/periodique/2025-4t-bti-aestiam-agora.pdf',
    sourceLabel: 'Aestiam Agora, bulletin T4 2025',
  },
  'aestiam-horizon': {
    year: 2025, pgaPct: 5.10, distributionPct: 5.10,
    sourceUrl: 'https://www.aestiam.com/doc/horizon/periodique/2025-4t-bti-aestiam-horizon.pdf',
    sourceLabel: 'Aestiam Horizon, bulletin T4 2025',
  },
  'paref-hexa': {
    year: 2025, pgaPct: -12.10, distributionPct: 6.00,
    sourceUrl: 'https://paref-gestion.com/nos-scpi/paref-hexa/',
    sourceLabel: 'Paref Gestion, Paref Hexa 2025',
    note: "La baisse du prix de part dépasse le taux de distribution annuel.",
  },
  'paref-evo': {
    year: 2025, pgaPct: 4.72, distributionPct: 4.72,
    sourceUrl: 'https://paref-gestion.com/nos-scpi/paref-evo/',
    sourceLabel: 'Paref Gestion, Paref Evo 2025',
  },
  'novapierre-1': {
    year: 2025, pgaPct: 5.00, distributionPct: 5.00,
    sourceUrl: 'https://paref-gestion.com/nos-scpi/novapierre-1/',
    sourceLabel: 'Paref Gestion, Novapierre 1 2025',
  },
  'novapierre-residentiel': {
    year: 2025, pgaPct: -41.53, distributionPct: 1.50,
    sourceUrl: 'https://paref-gestion.com/wp-content/uploads/2026/02/9e26dc14-bb90-414e-8010-8a1a5e11cd03-BTI-T4-2025-Novapierre-Residentiel.pdf',
    sourceLabel: 'Paref Gestion, Novapierre Résidentiel, bulletin T4 2025',
    note: "PGA fortement affectée par le passage au marché secondaire, après suspension de la variabilité du capital.",
  },
  'perial-opportunites-europe': {
    year: 2025, pgaPct: 6.10, distributionPct: 6.10,
    sourceUrl: 'https://www.perial.com/scpi/perial-opportunites-europe',
    sourceLabel: 'PERIAL AM, Opportunités Europe 2025',
  },
  'perial-hospitalite-europe': {
    year: 2025, pgaPct: 4.11, distributionPct: 4.11,
    sourceUrl: 'https://www.perial.com/scpi/perial-hospitalite-europe',
    sourceLabel: 'PERIAL AM, Hospitalité Europe 2025',
  },
  'perial-grand-paris': {
    year: 2025, pgaPct: 4.80, distributionPct: 4.80,
    sourceUrl: 'https://www.perial.com/scpi/perial-grand-paris',
    sourceLabel: 'PERIAL AM, Grand Paris 2025',
  },
  'perial-o2': {
    year: 2025, pgaPct: 4.65, distributionPct: 4.65,
    sourceUrl: 'https://www.perial.com/scpi/perial-o2',
    sourceLabel: 'PERIAL AM, O₂ 2025',
  },
  'praemia-hotels-europe': {
    year: 2025, pgaPct: 3.90, distributionPct: 3.90,
    sourceUrl: 'https://www.praemia-healthcare.fr/fr/web/preim-fr/scpi-praemia-hotels-europe',
    sourceLabel: 'Praemia REIM, Hotels Europe 2025',
  },
  'primovie': {
    year: 2025, pgaPct: -7.31, distributionPct: 4.04,
    sourceUrl: 'https://www.praemia-healthcare.fr/fr/web/preim-fr/scpi-primovie',
    sourceLabel: 'Praemia REIM, Primovie 2025',
    note: "La PGA négative traduit une dépréciation du prix de part malgré la distribution; la SCPI a changé de régime de liquidité en 2026.",
  },
  'patrimmo-commerce': {
    year: 2025, pgaPct: -5.71, distributionPct: 3.38,
    sourceUrl: 'https://www.praemia-healthcare.fr/fr/web/preim-fr/scpi-patrimmo-commerce',
    sourceLabel: 'Praemia REIM, Patrimmo Commerce 2025',
    note: "La PGA est négative malgré la distribution; suspension de variabilité du capital en 2026.",
  },
  'coeur-de-region': {
    year: 2025, pgaPct: 6.20, distributionPct: 6.20,
    sourceUrl: 'https://www.sogenial.fr/societe/scpi-coeur-des-regions/',
    sourceLabel: 'Sogenial, Cœur de Régions, résultats 2025',
  },
  'coeur-de-ville': {
    year: 2025, pgaPct: 6.20, distributionPct: 6.20,
    sourceUrl: 'https://www.sogenial.fr/societe/scpi-coeur-de-ville/',
    sourceLabel: 'Sogenial, Cœur de Ville, résultats 2025',
  },
  'atream-hotel': {
    year: 2025, pgaPct: 5.05, distributionPct: 5.05,
    sourceUrl: 'https://atream.com/solutions/fonds-ouverts/scpi-atream-hotels/',
    sourceLabel: 'Atream, Atream Hôtels, résultats 2025',
  },
  'edr-europa': {
    year: 2025, pgaPct: 8.75, distributionPct: 8.75,
    sourceUrl: 'https://edr-europa.com/wp-content/uploads/2026/02/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-S2-2025.pdf',
    sourceLabel: 'Edmond de Rothschild REIM, bulletin S2 2025',
    note: "Performance initiale susceptible de ne pas être représentative des exercices futurs.",
  },
  'pierval-sante': {
    year: 2025, pgaPct: 4.06, distributionPct: 4.06,
    sourceUrl: 'https://www.euryale-am.fr/wp-content/uploads/2026/01/BT_PIERVAL_SANTE_2025_T4_2026.pdf',
    sourceLabel: 'Euryale AM, Pierval Santé, bulletin T4 2025',
  },
  'acces-valeur-pierre': {
    year: 2025, pgaPct: 3.85, distributionPct: 3.85,
    sourceUrl: 'https://reim.bnpparibas-am.com/fr-fr/produits/scpi/acces-valeur-pierre',
    sourceLabel: 'BNP Paribas REIM, Accès Valeur Pierre 2025',
  },
  'accimmo-pierre': {
    year: 2025, pgaPct: 4.77, distributionPct: 4.77,
    sourceUrl: 'https://reim.bnpparibas-am.com/fr-fr/produits/scpi/accimmo-pierre',
    sourceLabel: 'BNP Paribas REIM, Accimmo Pierre 2025',
  },
  'selectinvest-1': {
    year: 2025, pgaPct: 4.44, distributionPct: 4.44,
    sourceUrl: 'https://www.la-francaise.com/fr-fr/nos-solutions-pour-vous/nos-produits/product/Scpi/i9-selectinvest-1/',
    sourceLabel: 'La Française, Sélectinvest 1 2025',
  },
  'lf-avenir-sante': {
    year: 2025, pgaPct: 5.08, distributionPct: 5.08,
    sourceUrl: 'https://www.la-francaise.com/fr-fr/investisseur/nos-fonds/actifs-non-cotes/immobilier/scpi.aspx?Scpi=LF-Avenir-Sante&amcScpi=18149&code=Q1',
    sourceLabel: 'La Française, LF Avenir Santé 2025',
  },
  'lf-europimmo': {
    year: 2025, pgaPct: 4.63, distributionPct: 4.63,
    sourceUrl: 'https://www.la-francaise.com/fr-fr/investisseur/nos-fonds/actifs-non-cotes/immobilier/scpi.aspx?Scpi=LF-Europimmo&amcScpi=16849&code=D1',
    sourceLabel: 'La Française, LF Europimmo 2025',
  },
  'epargne-fonciere': {
    year: 2025, pgaPct: 4.86, distributionPct: 4.86,
    sourceUrl: 'https://www.la-francaise.com/fr-ch/investisseur/nos-fonds/actifs-non-cotes/immobilier/scpi.aspx?Scpi=Epargne-Fonciere&amcScpi=16969&code=EE',
    sourceLabel: 'La Française, Épargne Foncière 2025',
  },
  'lf-grand-paris-patrimoine': {
    year: 2025, pgaPct: 4.66, distributionPct: 4.66,
    sourceUrl: 'https://www.la-francaise.com/fr-fr/investisseur/nos-fonds/actifs-non-cotes/immobilier.aspx',
    sourceLabel: 'La Française, LF Grand Paris Patrimoine 2025',
  },
  'opportunite-immo': {
    year: 2025, pgaPct: 5.68, distributionPct: 5.68,
    sourceUrl: 'https://www.la-francaise.com/fr-fr/investisseur/nos-fonds/actifs-non-cotes/immobilier.aspx',
    sourceLabel: 'La Française, LF Opportunité Immo 2025',
  },
  'alta-convictions': {
    year: 2025, pgaPct: 7.55, distributionPct: 6.57,
    sourceUrl: 'https://www.altarea-im.com/wp-content/uploads/2026/02/260112_ALTA_BUL_TRIMESTRIEL_T4_25_PPP_WEB.pdf',
    sourceLabel: 'Altarea IM, Alta Convictions bulletin T4 2025',
  },
  'buroboutic-metropoles': {
    year: 2025, pgaPct: 5.10, distributionPct: 5.10,
    sourceUrl: 'https://www.fiducial-gerance.fr/content/download/1886/file/Buroboutic%20M%C3%A9tropoles%20-%20Rapport%20annuel%202025.pdf?version=3',
    sourceLabel: 'Fiducial Gérance, Buroboutic Métropoles rapport annuel 2025',
  },
  'ficommerce-proximite': {
    year: 2025, pgaPct: 5.10, distributionPct: 5.10,
    sourceUrl: 'https://www.fiducial-gerance.fr/investir-en-scpi/nos-scpi/ficommerce-proximite',
    sourceLabel: 'Fiducial Gérance, Ficommerce Proximité 2025',
  },
  'selectipierre-2': {
    year: 2025, pgaPct: 4.14, distributionPct: 4.14,
    sourceUrl: 'https://www.fiducial-gerance.fr/investir-en-scpi/nos-scpi/selectipierre-2-paris',
    sourceLabel: 'Fiducial Gérance, Sélectipierre 2 Paris 2025',
  },
  'ncap-regions': {
    year: 2025, pgaPct: 7.51, distributionPct: 5.72,
    sourceUrl: 'https://www.normacapital.fr/documentation/rapport-annuel-2025/',
    sourceLabel: 'Norma Capital, rapport annuel NCap Régions 2025, p. 22',
    note: "La PGA inclut une hausse du prix de part, contrairement au seul taux de distribution.",
  },
  'ncap-education-sante': {
    year: 2025, pgaPct: 4.52, distributionPct: 4.52,
    sourceUrl: 'https://www.normacapital.fr/nos-engagements/',
    sourceLabel: 'Norma Capital, NCap Éducation Santé 2025',
  },
  'ncap-continent': {
    year: 2025, pgaPct: 7.10, distributionPct: 7.10,
    sourceUrl: 'https://www.normacapital.fr/documentation/rapport-annuel-2025-2/',
    sourceLabel: 'Norma Capital, rapport annuel NCap Continent 2025',
  },
};
