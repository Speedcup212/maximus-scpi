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
    sourceUrl: 'https://offre-booster.alderan.fr/scpi-activimmo',
    sourceLabel: 'Alderan, performances 2025',
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
};
