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
};
