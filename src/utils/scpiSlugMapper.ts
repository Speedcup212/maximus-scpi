/**
 * Lightweight SCPI slug helpers.
 *
 * Keep this module dependency-free: it is imported by the public header,
 * comparator cards and multiple route components. Importing the full
 * landingPagesData catalog here would pull ~100KB of editorial data into
 * otherwise lightweight chunks.
 */

export const createSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const EDITORIAL_SCPI_SLUGS = new Set([
  "comete",
  "transitions-europe",
  "remake-live",
  "epargne-pierre-europe",
  "optimale",
  "iroko-zen",
  "novaxia-neo",
  "activimmo",
  "aestiam-cap-hebergimmo",
  "aestiam-pierre-rendement",
  "aestiam-horizon",
  "altixia-commerces",
  "atream-hotel",
  "buroboutic-metropoles",
  "coeur-d-europe",
  "coeur-de-region",
  "coeur-de-ville",
  "cristal-life",
  "edissimo",
  "epargne-fonciere",
  "epargne-pierre",
  "esg-pierre-capital",
  "ficommerce-proximite",
  "fonciere-des-praticiens",
  "grand-paris-residentiel",
  "immorente",
  "kyaneos-pierre",
  "lf-avenir-sante",
  "lf-europimmo",
  "lf-grand-paris-patrimoine",
  "log-in",
  "ncap-education-sante",
  "ncap-regions",
  "novapierre-residentiel",
  "opportunite-immo",
  "paref-evo",
  "paref-hexa",
  "patrimmo-croissance-impact",
  "perial-grand-paris",
  "perial-hospitalite-europe",
  "perial-opportunites-europe",
  "sofiprime",
  "urban-coeur-de-commerce",
  "altixia-cadence-12",
  "credit-mutuel-pierre-1",
  "efimmo-1",
  "novapierre-1",
  "perial-o2",
  "selectinvest-1",
  "selectipierre-2"
]);

const SLUG_ALIASES: Record<string, string> = {
  'aestiam-cap': 'aestiam-cap-hebergimmo'
};

/**
 * Returns the canonical editorial landing-page slug when one exists.
 */
export const findScpiSlug = (scpiName: string): string | null => {
  const derived = createSlugFromName(scpiName);
  const canonical = SLUG_ALIASES[derived] ?? derived;
  return EDITORIAL_SCPI_SLUGS.has(canonical) ? canonical : null;
};

/**
 * Checks whether a SCPI has a dedicated editorial landing page.
 */
export const hasLandingPage = (scpiName: string): boolean => {
  return findScpiSlug(scpiName) !== null;
};
