import { scpiLandingPages } from '../data/landingPagesData';

/**
 * Converts a SCPI name to a slug format
 */
export const createSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Normalize a string by removing accents and special characters
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Finds the landing page slug for a given SCPI name
 * Returns the slug if found, null otherwise
 */
export const findScpiSlug = (scpiName: string): string | null => {
  const normalizedSearchName = normalizeString(scpiName);

  // Search in landing pages data
  for (const [key, data] of Object.entries(scpiLandingPages)) {
    const normalizedLandingName = normalizeString(data.nom);

    // Exact match
    if (normalizedLandingName === normalizedSearchName) {
      return data.slug;
    }

    // Match without special characters
    const cleanSearchName = normalizedSearchName.replace(/[^a-z0-9]/g, '');
    const cleanLandingName = normalizedLandingName.replace(/[^a-z0-9]/g, '');

    if (cleanLandingName === cleanSearchName) {
      return data.slug;
    }

    // Partial match: check if landing name starts with search name
    if (cleanLandingName.startsWith(cleanSearchName) && cleanSearchName.length >= 5) {
      return data.slug;
    }

    // Partial match: check if search name starts with landing name
    if (cleanSearchName.startsWith(cleanLandingName) && cleanLandingName.length >= 5) {
      return data.slug;
    }

    // Check if the main words match (first 2-3 significant words)
    const searchWords = normalizedSearchName.split(/[\s'-]+/).filter(w => w.length > 2);
    const landingWords = normalizedLandingName.split(/[\s'-]+/).filter(w => w.length > 2);

    if (searchWords.length >= 2 && landingWords.length >= 2) {
      // Match first 2 words
      if (searchWords[0] === landingWords[0] && searchWords[1] === landingWords[1]) {
        return data.slug;
      }
    }
  }

  // No landing page found, return null
  return null;
};

/**
 * Checks if a SCPI has a landing page
 */
export const hasLandingPage = (scpiName: string): boolean => {
  const normalizedSearchName = scpiName.toLowerCase().trim();

  return Object.values(scpiLandingPages).some(data => {
    const normalizedLandingName = data.nom.toLowerCase().trim();
    return normalizedLandingName === normalizedSearchName ||
           normalizedLandingName.replace(/[^a-z0-9]/g, '') === normalizedSearchName.replace(/[^a-z0-9]/g, '');
  });
};
