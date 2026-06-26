/**
 * Normalisation des étiquettes géographiques SCPI.
 * Toutes les régions françaises (métropole + DOM-TOM) sont ramenées à "France".
 *
 * Retourne `{ key, label }` pour une région/département français,
 * ou `null` si l'étiquette n'est pas une sous-entité française.
 *
 * Utilisé par le comparateur public ET le comparateur pro
 * pour garantir une lecture géographique internationale cohérente.
 */

const FRENCH_REGION_KEYS = new Set([
  // Régions métropolitaines
  'auvergne rhone alpes',
  'bourgogne franche comte',
  'bretagne',
  'centre val de loire',
  'corse',
  'grand est',
  'hauts de france',
  'ile de france',
  'idf',
  'normandie',
  'nouvelle aquitaine',
  'occitanie',
  'paca',
  'provence alpes cote d azur',
  'pays de la loire',

  // Départements d'outre-mer
  'guadeloupe',
  'martinique',
  'guyane',
  'la reunion',
  'reunion',
  'mayotte',

  // Variantes
  'paris',
  'region',
  'regions',
]);

function toNormalizedKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeGeoLabel(label: string): { key: string; label: string } | null {
  const normalized = toNormalizedKey(label);
  if (!normalized) return null;

  if (FRENCH_REGION_KEYS.has(normalized)) {
    return { key: 'france', label: 'France' };
  }

  return null;
}
