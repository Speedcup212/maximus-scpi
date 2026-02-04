export const normalizeGeoLabel = (name: string): { key: string; label: string } => {
  const cleaned = name.trim();
  const normalized = cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (
    normalized === 'idf' ||
    normalized === 'ile de france' ||
    normalized === 'iledefrance' ||
    normalized === 'paris' ||
    normalized === 'regions' ||
    normalized === 'region' ||
    normalized === 'nord' ||
    normalized === 'nord est' ||
    normalized === 'nord ouest' ||
    normalized === 'sud' ||
    normalized === 'sud est' ||
    normalized === 'sud ouest' ||
    normalized === 'est' ||
    normalized === 'ouest' ||
    normalized === 'centre' ||
    normalized === 'sud ouest' ||
    normalized === 'sud est' ||
    normalized === 'nord est' ||
    normalized === 'nord ouest'
  ) {
    return { key: 'france', label: 'France' };
  }

  return {
    key: normalized.replace(/\s+/g, ''),
    label: cleaned
  };
};

export const normalizeSectorLabel = (name: string): { key: string; label: string } => {
  const cleaned = name.trim();
  const normalized = cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (
    normalized.includes('sante') ||
    normalized.includes('santé') ||
    normalized.includes('education') ||
    normalized.includes('éducation') ||
    normalized.includes('enseignement') ||
    normalized.includes('soins de ville') ||
    normalized.includes('soin de ville') ||
    normalized.includes('clinique') ||
    normalized.includes('ehpad')
  ) {
    return { key: 'sante-education', label: 'Santé & éducation' };
  }

  if (
    normalized.includes('hotel') ||
    normalized.includes('hotellerie') ||
    normalized.includes('hôtellerie') ||
    normalized.includes('tourisme') ||
    normalized.includes('loisir') ||
    normalized.includes('seminaire') ||
    normalized.includes('séminaire')
  ) {
    return { key: 'hotellerie-loisirs', label: 'Hôtellerie & loisirs' };
  }

  if (
    normalized.includes('logistique') ||
    normalized.includes('entrepot') ||
    normalized.includes('entrepôt') ||
    normalized.includes('activite') ||
    normalized.includes('activité') ||
    normalized.includes('transport')
  ) {
    return { key: 'logistique', label: 'Logistique' };
  }

  if (normalized.includes('commerce') || normalized.includes('retail')) {
    return { key: 'commerces', label: 'Commerces' };
  }

  if (normalized.includes('bureau') || normalized.includes('tertiaire')) {
    return { key: 'bureaux', label: 'Bureaux' };
  }

  if (
    normalized.includes('residentiel') ||
    normalized.includes('résidentiel') ||
    normalized.includes('logement') ||
    normalized.includes('habitation')
  ) {
    return { key: 'residentiel', label: 'Résidentiel' };
  }

  return {
    key: normalized.replace(/\s+/g, ''),
    label: cleaned
  };
};
