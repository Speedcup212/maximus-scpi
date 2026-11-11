/**
 * Gate éditorial partagé pour le flux d'acquisitions SCPI.
 * Ne rejette que des contaminations documentaires manifestes.
 */
const normalize = (value) => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ').trim().toLowerCase();

const NOT_ACQUISITION_HEADLINES = [
  /^inter\s*gestion$/,
  /^actualites? de fiducial gerance$/,
  /^epsicap nano\s*:\s*resultats? du \d(?:er|e|eme)? trimestre 2026$/,
  /^epsicap reim franchit les \d+\s*m(?:illion)?s?\s*€?\s*sous gestion$/,
];
const PRIMARY_NAV_SIGNATURES = [
  /votre profil cgp/i,
  /relations associes/i,
  /relations partenaires/i,
  /simulateur scpi gerees/i,
  /jeune actif celibataire ou en couple/i,
];
const BOILERPLATE_TERMS = [
  /votre profil/i,
  /relations associes/i,
  /relations partenaires/i,
  /\b(?:souscrire|contactez[- ]nous)\b/i,
  /\bsimulateur\b/i,
  /\b(?:lexique|faq)\b/i,
  /\b(?:jeune actif|senior actif|retraite)\b/i,
  /-->/,
];

/** Renvoie le motif d'exclusion, ou null si aucune contamination manifeste. */
export function newsEditorialReviewReason(item) {
  const headline = normalize(item?.title);
  const text = normalize(item?.summary);
  const rawUrl = String(item?.sourceUrl ?? item?.source_url ?? '').trim();
  if (!headline || headline.length < 12) return 'Titre générique ou insuffisant pour une actualité immobilière';
  if (NOT_ACQUISITION_HEADLINES.some((pattern) => pattern.test(headline))) {
    return 'Titre de navigation, page générique ou information hors acquisitions';
  }
  if (/%60(?:$|[?#])|\x60/i.test(rawUrl)) {
    return 'Lien source avec caractère parasite';
  }
  if (/^rte en capital et un risque de liquidite\b/i.test(text)) {
    return 'Texte légal tronqué, non une description de l’opération';
  }
  const first = text.slice(0, 570);
  const distinctive = PRIMARY_NAV_SIGNATURES.filter((re) => re.test(first)).length;
  const navCount = BOILERPLATE_TERMS.filter((re) => re.test(first)).length;
  if (distinctive >= 2 || (distinctive >= 1 && navCount >= 4)) {
    return 'Résumé contaminé par des menus ou coordonnées de contact';
  }
  if (/^\s*actualites? de (?:fiducial|inter ?gestion)/i.test(text) && /logipierre|autres scpi/i.test(text)) {
    return 'Index d’actualités multimarques sans opération spécifique';
  }
  return null;
}
export const isNewsEditoriallyValid = (item) => newsEditorialReviewReason(item) === null;
