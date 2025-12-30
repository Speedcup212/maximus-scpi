import { LandingPageContent } from './landingPagesContent';
import scpiCompleteJson from '../data/SCPI_complet_avec_SFDR_Profil.json';

interface ScpiCompleteData {
  'Nom SCPI': string;
  'Société de gestion': string;
  'Année de création': number;
  'Label ISR': string;
  'Capitalisation (M€)': number;
  'Prix de souscription (€)': number;
  'Taux de distribution (%)': number;
  'TOF (%)': number;
  'Surcote/décote (%)': number;
  'Endettement (%)': number;
  'Répartition Sectorielle': string;
  'Répartition Géographique': string;
}

const parseGeoDistribution = (geoStr: string): Record<string, number> => {
  try {
    return JSON.parse(geoStr);
  } catch {
    return {};
  }
};

const isEuropeanScpi = (geoStr: string): boolean => {
  const geo = parseGeoDistribution(geoStr);
  const europeanCountries = [
    'Allemagne', 'Espagne', 'Italie', 'Pays-Bas', 'Pays bas', 'Belgique', 'Portugal',
    'Irlande', 'Autriche', 'Suisse', 'Luxembourg', 'Pologne', 'Roumanie',
    'République tchèque', 'Hongrie', 'Grèce', 'Suède', 'Norvège', 'Danemark',
    'Finlande', 'Étranger', 'Europe'
  ];

  return Object.keys(geo).some(country =>
    europeanCountries.some(europeanCountry =>
      country.toLowerCase().includes(europeanCountry.toLowerCase())
    )
  );
};

const getSectorFromScpi = (sectorStr: string): string => {
  const lowerStr = sectorStr.toLowerCase();

  if (lowerStr.includes('bureau')) return 'bureaux';
  if (lowerStr.includes('commerce') || lowerStr.includes('retail') || lowerStr.includes('alimentaire')) return 'commerces';
  if (lowerStr.includes('hôtel') || lowerStr.includes('hospitalité') || lowerStr.includes('loisir') || lowerStr.includes('tourisme')) return 'hotellerie';
  if (lowerStr.includes('santé') || lowerStr.includes('sanitaire') || lowerStr.includes('social')) return 'sante';
  if (lowerStr.includes('logistique') || lowerStr.includes('entrepôt') || lowerStr.includes('activité')) return 'logistique';
  if (lowerStr.includes('résidentiel') || lowerStr.includes('logement') || lowerStr.includes('habitation')) return 'residentiel';

  return 'diversifie';
};

const createScpiDescription = (scpi: ScpiCompleteData): string => {
  const sector = getSectorFromScpi(scpi['Répartition Sectorielle']);
  const sectorLabels: Record<string, string> = {
    'bureaux': 'l\'immobilier de bureaux',
    'commerces': 'l\'immobilier commercial',
    'hotellerie': 'l\'hôtellerie et le tourisme',
    'sante': 'l\'immobilier de santé',
    'logistique': 'l\'immobilier logistique',
    'residentiel': 'l\'immobilier résidentiel',
    'diversifie': 'l\'immobilier diversifié'
  };

  const isISR = scpi['Label ISR'] === 'Oui';

  return `${scpi['Nom SCPI']} est une SCPI ${isISR ? 'labellisée ISR ' : ''}gérée par ${scpi['Société de gestion']}, créée en ${scpi['Année de création']}. Spécialisée dans ${sectorLabels[sector] || 'l\'immobilier'}, elle offre un rendement de ${scpi['Taux de distribution (%)']}% avec une capitalisation de ${scpi['Capitalisation (M€)'].toFixed(0)} M€. Son taux d\'occupation financier de ${scpi['TOF (%)']}% témoigne de la qualité de sa gestion et de son patrimoine.`;
};

// Helper function to determine if SCPI is recommended by MaximusSCPI
// Critères : TOF ≥ 90%, Décote ≤ 0, Capitalisation ≥ 100M€, Rendement ≥ 5%, Endettement < 30%
const isRecommendedScpi = (scpi: ScpiCompleteData): boolean => {
  const hasTofAbove90 = scpi['TOF (%)'] >= 90;
  const hasDiscountOrPar = scpi['Surcote/décote (%)'] <= 0;
  const hasCapitalizationAbove100M = scpi['Capitalisation (M€)'] >= 100;
  const hasYieldAbove5 = scpi['Taux de distribution (%)'] >= 5;
  const hasDebtBelow30 = scpi['Endettement (%)'] < 30;

  return hasTofAbove90 && hasDiscountOrPar && hasCapitalizationAbove100M && hasYieldAbove5 && hasDebtBelow30;
};

export const generateScpiPages = (): LandingPageContent[] => {
  const scpiData = scpiCompleteJson.Sheet1 as ScpiCompleteData[];

  return scpiData.map((scpi) => {
    const slug = `scpi-${scpi['Nom SCPI'].toLowerCase()
      .replace(/['\s]+/g, '-')
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ç]/g, 'c')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[^a-z0-9-]/g, '')}`;

    const sector = getSectorFromScpi(scpi['Répartition Sectorielle']);
    const isEuropean = isEuropeanScpi(scpi['Répartition Géographique']);
    const isRecommended = isRecommendedScpi(scpi);
    const isISR = scpi['Label ISR'] === 'Oui';

    const sectorAdvantages: Record<string, string[]> = {
      'bureaux': ['Baux commerciaux longue durée', 'Locataires professionnels de qualité', 'Emplacements stratégiques'],
      'commerces': ['Rendements attractifs', 'Diversification des enseignes', 'Commerce de proximité résilient'],
      'hotellerie': ['Secteur dynamique', 'Croissance du tourisme', 'Revenus indexés sur l\'activité'],
      'sante': ['Secteur défensif', 'Demande structurelle forte', 'Indépendant des cycles économiques'],
      'logistique': ['Croissance du e-commerce', 'Secteur en forte demande', 'Baux longue durée'],
      'residentiel': ['Marché stable', 'Demande locative forte', 'Fiscalité avantageuse'],
      'diversifie': ['Diversification sectorielle', 'Réduction du risque', 'Opportunités multiples']
    };

    // Optimisation SEO : mots-clés selon performance
    const performanceLevel = scpi['Taux de distribution (%)'] >= 7 ? 'Excellent' : scpi['Taux de distribution (%)'] >= 5.5 ? 'Attractif' : 'Solide';
    const tofQuality = scpi['TOF (%)'] >= 95 ? 'Taux d\'occupation optimal' : 'Bien occupée';
    const sectorKeyword = sector === 'bureaux' ? 'Bureaux Premium' :
                         sector === 'commerces' ? 'Commerce & Retail' :
                         sector === 'sante' ? 'Santé & Médical' :
                         sector === 'logistique' ? 'Logistique & Entrepôts' :
                         sector === 'residentiel' ? 'Résidentiel' :
                         sector === 'hotellerie' ? 'Hôtellerie & Tourisme' : 'Diversifié';

    return {
      slug,
      type: 'scpi',
      scpiName: scpi['Nom SCPI'],
      title: `SCPI ${scpi['Nom SCPI']} : ${scpi['Taux de distribution (%)']}% Rendement 2025 ✓ ${scpi['Société de gestion']} | Analyse & Avis`,
      metaDescription: `✓ SCPI ${scpi['Nom SCPI']} (${scpi['Société de gestion']}) : ${performanceLevel} rendement ${scpi['Taux de distribution (%)']}% ✓ ${tofQuality} ${scpi['TOF (%)']}% ✓ Capitalisation ${scpi['Capitalisation (M€)'].toFixed(0)}M€ ✓ ${sectorKeyword}${isISR ? ' ✓ Label ISR' : ''} ✓ Prix ${scpi['Prix de souscription (€)']}€ ✓ Analyse complète & conseils expert gratuits`,
      h1: `SCPI ${scpi['Nom SCPI']} : ${isISR ? 'Investissement Responsable ISR' : 'Analyse & Avis 2025'}`,
      subtitle: `${performanceLevel} rendement ${scpi['Taux de distribution (%)']}% avec ${scpi['Société de gestion']} | ${sectorKeyword}`,
      introduction: createScpiDescription(scpi),
      advantages: [
        `Rendement ${scpi['Taux de distribution (%)']}% en 2024`,
        `Capitalisation de ${scpi['Capitalisation (M€)'].toFixed(0)} M€`,
        `TOF de ${scpi['TOF (%)']}%`,
        `Gestion par ${scpi['Société de gestion']}`,
        isISR ? 'Label ISR (Investissement Socialement Responsable)' : 'Gestion professionnelle et transparente',
        ...(sectorAdvantages[sector] || sectorAdvantages['diversifie'])
      ],
      targetProfile: `Investisseurs recherchant un rendement de ${scpi['Taux de distribution (%)']}% avec une exposition ${sector === 'diversifie' ? 'diversifiée' : 'au secteur ' + sector}, gérée par ${scpi['Société de gestion']}, avec un horizon moyen à long terme.`,
      statistics: [
        { label: 'Rendement 2024', value: `${scpi['Taux de distribution (%)']}%` },
        { label: 'Capitalisation', value: `${scpi['Capitalisation (M€)'].toFixed(0)} M€` },
        { label: 'TOF', value: `${scpi['TOF (%)']}%` },
        { label: 'Prix', value: `${scpi['Prix de souscription (€)']}€` },
        { label: 'Décote/Surcote', value: `${scpi['Surcote/décote (%)'] > 0 ? '+' : ''}${scpi['Surcote/décote (%)']}%` },
        { label: 'Endettement', value: `${scpi['Endettement (%)']}%` },
        { label: 'Année création', value: scpi['Année de création'].toString() },
        { label: 'Label ISR', value: isISR ? 'Oui' : 'Non' }
      ],
      urlFilter: {
        sector,
        scpi: scpi['Nom SCPI'],
        geo: isEuropean ? 'europe' : undefined
      },
      rating: isRecommended ? 5 : (scpi['Surcote/décote (%)'] === 0 ? 4 : undefined),
      isRecommended
    };
  });
};
