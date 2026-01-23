import { Scpi } from '../types/scpi';
import scpiCompleteJson from './SCPI_complet_avec_SFDR_Profil.json';
import scpiCompletJson from './scpi_complet.json';

// Helper function to parse sectorial distribution from string or JSON
const parseSectorDistribution = (sectorStr: string): Record<string, number> => {
  const result: Record<string, number> = {};
  if (!sectorStr) return result;

  // Try to parse as JSON first (new format)
  try {
    const parsed = JSON.parse(sectorStr);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch {
    // Not JSON, continue with text parsing
  }

  // Parse as text format (old format): "Bureaux (37,76%), Santé & éducation (24,04%)..."
  const matches = sectorStr.match(/([^(,]+)\((\d+(?:\.\d+)?%?)\)/g);
  if (!matches) return result;

  matches.forEach(match => {
    const parts = match.match(/([^(,]+)\((\d+(?:\.\d+)?%?)\)/);
    if (parts) {
      const name = parts[1].trim().replace(/^,\s*/, '');
      const value = parseFloat(parts[2].replace('%', ''));
      result[name] = value;
    }
  });

  return result;
};

// Helper function to parse geographical distribution from JSON string
const parseGeoDistribution = (geoStr: string): Record<string, number> => {
  try {
    return JSON.parse(geoStr);
  } catch {
    return {};
  }
};

// Helper function to determine sector from sectorial distribution
const determineSector = (repartitionStr: string, sectorDistribution: Record<string, number>): 'bureaux' | 'commerces' | 'residentiel' | 'sante' | 'logistique' | 'hotellerie' | 'diversifie' => {
  if (!repartitionStr) return 'diversifie';

  const lowerStr = repartitionStr.toLowerCase();

  // Calculer les scores par catégorie en analysant la répartition
  const scores = {
    bureaux: 0,
    commerces: 0,
    residentiel: 0,
    sante: 0,
    logistique: 0,
    hotellerie: 0
  };

  // Analyser chaque secteur de la répartition
  Object.entries(sectorDistribution).forEach(([name, value]) => {
    const lowerName = name.toLowerCase();

    // Bureaux
    if (lowerName.includes('bureau') || lowerName.includes('tertiaire')) {
      scores.bureaux += value;
    }

    // Commerces
    if (lowerName.includes('commerce') || lowerName.includes('retail') ||
        lowerName.includes('alimentaire') || lowerName.includes('galerie') ||
        lowerName.includes('centre-ville') || lowerName.includes('pied d\'immeuble')) {
      scores.commerces += value;
    }

    // Résidentiel
    if (lowerName.includes('résidentiel') || lowerName.includes('logement') ||
        lowerName.includes('habitation') || lowerName.includes('résidence')) {
      scores.residentiel += value;
    }

    // Santé
    if (lowerName.includes('santé') || lowerName.includes('sanitaire') ||
        lowerName.includes('social') || lowerName.includes('éducation') ||
        lowerName.includes('life science')) {
      scores.sante += value;
    }

    // Logistique
    if (lowerName.includes('logistique') || lowerName.includes('entrepôt') ||
        lowerName.includes('activité') || lowerName.includes('messagerie')) {
      scores.logistique += value;
    }

    // Hôtellerie
    if (lowerName.includes('hôtel') || lowerName.includes('hospitalité') ||
        lowerName.includes('loisir') || lowerName.includes('tourisme') ||
        lowerName.includes('séminaire') || lowerName.includes('hébergement')) {
      scores.hotellerie += value;
    }
  });

  // Trouver le secteur dominant
  const maxScore = Math.max(...Object.values(scores));

  // Si aucun score, c'est diversifié
  if (maxScore === 0) {
    return 'diversifie';
  }

  // Compter combien de secteurs ont un score significatif (> 20%)
  const significantSectors = Object.values(scores).filter(score => score > 20).length;

  // Si plusieurs secteurs significatifs (3 ou plus), c'est diversifié
  if (significantSectors >= 3) {
    return 'diversifie';
  }

  // Si le secteur dominant représente moins de 40% ET qu'il y a au moins 2 secteurs > 20%, c'est diversifié
  if (maxScore < 40 && significantSectors >= 2) {
    return 'diversifie';
  }

  // Sinon, retourner le secteur avec le score le plus élevé
  const dominantSector = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  return (dominantSector as any) || 'diversifie';
};

// Helper function to determine geography from geographical distribution
const determineGeography = (geoData: Record<string, number>): 'france' | 'europe' | 'international' => {
  const geoEntries = Object.keys(geoData).map(k => k.toLowerCase());

  const hasInternational = geoEntries.some(key =>
    key.includes('royaume-uni') ||
    key.includes('états-unis') ||
    key.includes('international') ||
    key.includes('ocde')
  );

  const hasEurope = geoEntries.some(key =>
    key.includes('allemagne') ||
    key.includes('espagne') ||
    key.includes('italie') ||
    key.includes('pays-bas') ||
    key.includes('belgique') ||
    key.includes('pologne') ||
    key.includes('irlande') ||
    key.includes('portugal') ||
    key.includes('europe')
  );

  if (hasInternational) return 'international';
  if (hasEurope) return 'europe';
  return 'france';
};

// Helper function to determine if SCPI is European
const isEuropean = (geography: string, geoData: Record<string, number>): boolean => {
  if (geography === 'europe' || geography === 'international') return true;

  const europeanCountries = Object.entries(geoData).filter(([key]) =>
    key.toLowerCase().includes('allemagne') ||
    key.toLowerCase().includes('espagne') ||
    key.toLowerCase().includes('italie') ||
    key.toLowerCase().includes('pays-bas') ||
    key.toLowerCase().includes('belgique') ||
    key.toLowerCase().includes('pologne') ||
    key.toLowerCase().includes('irlande') ||
    key.toLowerCase().includes('portugal')
  );

  const totalEuropean = europeanCountries.reduce((sum, [_, value]) => sum + (value || 0), 0);
  return totalEuropean > 30;
};

// Helper function to clean and convert repartition data
const cleanRepartition = (repartition: Record<string, number>) => {
  return Object.entries(repartition)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.replace(/\([^)]*\)/g, '').trim(),
      value: value
    }));
};

// Helper function to determine if SCPI is recommended by MaximusSCPI
// Critères : TOF ≥ 90%, Décote ≤ 0, Capitalisation ≥ 100M€, Rendement ≥ 5%, Endettement < 30%
const isRecommended = (scpi: any): boolean => {
  const hasTofAbove90 = scpi['TOF (%)'] >= 90;
  const hasDiscountOrPar = scpi['Surcote/décote (%)'] <= 0;
  const hasCapitalizationAbove100M = scpi['Capitalisation (M€)'] >= 100;
  const hasYieldAbove5 = scpi['Taux de distribution (%)'] >= 5;
  const hasDebtBelow30 = scpi['Endettement (%)'] < 30;

  return hasTofAbove90 && hasDiscountOrPar && hasCapitalizationAbove100M && hasYieldAbove5 && hasDebtBelow30;
};

// Helper function to clean numeric values from Excel (handles "NC", null, undefined, strings)
const cleanNumericValue = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '' || value === 'NC' || value === 'N/A') {
    return undefined;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? undefined : value;
  }
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point and minus sign
    const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
};

// Convert JSON data to Scpi format
// Utiliser le nouveau fichier scpi_complet.json s'il est disponible, sinon utiliser l'ancien
const sourceData = Array.isArray(scpiCompletJson) ? scpiCompletJson : (scpiCompleteJson.Sheet1 || scpiCompleteJson);

export const scpiData: Scpi[] = sourceData.map((scpi: any, index: number) => {
  // Utiliser les champs JSON structurés s'ils existent (nouveau format), sinon parser les chaînes
  let sectorDistribution: Record<string, number> = {};
  let geoDistribution: Record<string, number> = {};
  
  if (scpi['Répartition Sectorielle JSON']) {
    // Nouveau format : déjà un objet JSON
    sectorDistribution = scpi['Répartition Sectorielle JSON'];
  } else {
    // Ancien format : parser la chaîne
    sectorDistribution = parseSectorDistribution(scpi['Répartition Sectorielle'] || '');
  }
  
  if (scpi['Répartition Géographique JSON']) {
    // Nouveau format : déjà un objet JSON
    geoDistribution = scpi['Répartition Géographique JSON'];
  } else {
    // Ancien format : parser la chaîne JSON
    geoDistribution = parseGeoDistribution(scpi['Répartition Géographique'] || '{}');
  }

  const sector = determineSector(scpi['Répartition Sectorielle'] || '', sectorDistribution);
  const geography = determineGeography(geoDistribution);
  const recommended = isRecommended(scpi);
  const isAtPar = scpi['Surcote/décote (%)'] === 0;

  return {
    id: index + 1,
    name: scpi['Nom SCPI'],
    sector: sector,
    geography: geography,
    yield: scpi['Taux de distribution (%)'] || 0,
    capitalization: (scpi['Capitalisation (M€)'] || 0) * 1000000,
    tof: scpi['TOF (%)'] || 0,
    price: scpi['Prix de souscription (€)'] || 0,
    discount: scpi['Surcote/décote (%)'] !== undefined ? scpi['Surcote/décote (%)'] : 0,
    fees: scpi['Frais de souscription (HT/%)'] || 0,
    isr: scpi['Label ISR'] === 'Oui',
    european: isEuropean(geography, geoDistribution),
    company: scpi['Société de gestion'],
    creation: scpi['Année de création'],
    minInvest: scpi['Minimum de souscription €'] || 1000,
    repartitionSector: cleanRepartition(sectorDistribution),
    repartitionGeo: cleanRepartition(geoDistribution),
    rating: recommended ? 5 : (isAtPar ? 4 : undefined),
    isRecommended: recommended,
    debt: scpi['Endettement (%)'] !== undefined ? scpi['Endettement (%)'] : undefined,
    // Champs supplémentaires depuis le fichier Excel
    delaiJouissance: cleanNumericValue(scpi['Délai de jouissance (mois)']),
    versementLoyers: scpi['Versement des loyers'] || undefined,
    dureeDetentionRecommandee: cleanNumericValue(scpi['Durée de détention recommandée (ans)']),
    fraisGestion: cleanNumericValue(scpi['Frais de gestion (HT/%)']),
    valeurRetrait: cleanNumericValue(scpi['Valeur de retrait (€)']),
    valeurReconstitution: cleanNumericValue(scpi['Valeur de reconstitution (€)']),
    valeurRealisation: cleanNumericValue(scpi['Valeur de réalisation (€)']),
    distribution: cleanNumericValue(scpi['Distribution (€/part)']),
    nbImmeubles: cleanNumericValue(scpi['Nombre d\'immeubles']),
    sfdr: scpi['SFDR'] || undefined,
    profilCible: scpi['Profil cible'] || undefined,
    // Profil de risque : chercher dans le nouveau format structuré ou l'ancien format
    profilRisque: scpi['Profil_de_risque']?.SRRI !== null && scpi['Profil_de_risque']?.SRRI !== undefined
      ? scpi['Profil_de_risque'].SRRI
      : (cleanNumericValue(scpi['Profil de risque']) || 
         cleanNumericValue(scpi['Profil risque']) ||
         cleanNumericValue(scpi['Profil de risque (1-7)']) ||
         cleanNumericValue(scpi['Risque (1-7)']))
  };
});
