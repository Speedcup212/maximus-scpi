/**
 * Utilitaires pour l'affichage du taux de distribution SCPI
 * 
 * Règles d'affichage :
 * - SCPI France → Afficher le taux BRUT avec mention fiscale
 * - SCPI Europe → Afficher le taux NET par défaut, brut en second niveau
 * - Comparaisons avec avertissements pédagogiques
 */

import { Scpi } from '../types/scpi';
import { SCPIExtended } from '../data/scpiDataExtended';

export interface YieldDisplayInfo {
  primaryValue: number;
  primaryLabel: string;
  secondaryValue?: number;
  secondaryLabel?: string;
  legalNotice: string;
  isNet: boolean;
  isEuropean: boolean;
  netNotAvailable?: boolean;
}

/**
 * Détermine si une SCPI est principalement européenne (hors France)
 */
export function isEuropeanScpi(scpi: Scpi | SCPIExtended): boolean {
  // Vérifier la propriété geography
  if ('geography' in scpi) {
    return scpi.geography === 'europe' || scpi.geography === 'international';
  }
  
  // Vérifier la propriété european
  if ('european' in scpi && scpi.european) {
    return true;
  }
  
  // Vérifier la répartition géographique
  if ('repartitionGeo' in scpi && scpi.repartitionGeo && scpi.repartitionGeo.length > 0) {
    const franceEntry = scpi.repartitionGeo.find(g => 
      g.name.toLowerCase().includes('france') || 
      g.name.toLowerCase().includes('français')
    );
    const francePercentage = franceEntry?.value || 0;
    
    // Si moins de 50% en France, considérer comme européenne
    return francePercentage < 50;
  }
  
  // Par défaut, considérer comme française
  return false;
}

/**
 * Extrait le taux de distribution net depuis les données
 */
function extractNetYield(scpi: Scpi | SCPIExtended): number | null {
  // Chercher dans les actualités trimestrielles
  if ('actualitesTrimestrielles' in scpi && scpi.actualitesTrimestrielles) {
    const actu = scpi.actualitesTrimestrielles;
    
    // Pattern 1: "X,XX% brut / Y,YY% net" ou "X.XX% brut / Y.YY% net"
    const brutNetPattern1 = actu.match(/(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i);
    if (brutNetPattern1) {
      return parseFloat(brutNetPattern1[2].replace(',', '.'));
    }
    
    // Pattern 2: "Taux de distribution 2024: X,XX% brut / Y,YY% net" ou "Taux de distribution 2024: X.XX% brut / Y.YY% net"
    const brutNetPattern2 = actu.match(/taux\s+de\s+distribution[^:]*:\s*(\d+[.,]\d+)%\s*brut[^/]*\/\s*(\d+[.,]\d+)%\s*net/i);
    if (brutNetPattern2) {
      return parseFloat(brutNetPattern2[2].replace(',', '.'));
    }
    
    // Pattern 2b: "X,XX% brut / Y,YY% net" (sans "Taux de distribution" avant)
    const brutNetPattern2b = actu.match(/(\d+[.,]\d+)%\s*brut\s*\/\s*(\d+[.,]\d+)%\s*net/i);
    if (brutNetPattern2b) {
      return parseFloat(brutNetPattern2b[2].replace(',', '.'));
    }
    
    // Pattern 3: "X,XX% net" ou "net: X,XX%"
    const netPattern1 = actu.match(/(\d+[.,]\d+)%\s*net[^%]/i);
    if (netPattern1) {
      return parseFloat(netPattern1[1].replace(',', '.'));
    }
    
    const netPattern2 = actu.match(/net[:\s]+(\d+[.,]\d+)/i);
    if (netPattern2) {
      return parseFloat(netPattern2[1].replace(',', '.'));
    }
    
    // Pattern 4: "X,XX% (soit Y,YY% net)" ou "X,XX% net de fiscalité étrangère"
    const netPattern3 = actu.match(/(\d+[.,]\d+)%\s*net\s+de\s+fiscalité/i);
    if (netPattern3) {
      return parseFloat(netPattern3[1].replace(',', '.'));
    }
  }
  
  // Chercher dans les données structurées (si disponible)
  // TODO: Ajouter un champ tauxDistributionNet dans les types si nécessaire
  
  return null;
}

/**
 * Extrait le taux de distribution brut depuis les données
 */
function extractBrutYield(scpi: Scpi | SCPIExtended): number {
  return scpi.yield;
}

/**
 * Génère les informations d'affichage du taux de distribution selon les règles MaximusSCPI
 */
export function getYieldDisplayInfo(scpi: Scpi | SCPIExtended): YieldDisplayInfo {
  const isEuropean = isEuropeanScpi(scpi);
  const brutYield = extractBrutYield(scpi);
  const netYield = extractNetYield(scpi);
  
  if (isEuropean) {
    // SCPI européenne : afficher NET par défaut
    if (netYield !== null) {
      return {
        primaryValue: netYield,
        primaryLabel: 'Taux de distribution net',
        secondaryValue: brutYield,
        secondaryLabel: 'Taux de distribution brut',
        legalNotice: 'Le net correspond au revenu réellement perçu. La fiscalité étrangère est prélevée à la source. Les revenus ne supportent pas les prélèvements sociaux français.',
        isNet: true,
        isEuropean: true,
        netNotAvailable: false
      };
    } else {
      // Net non disponible : afficher brut avec avertissement
      return {
        primaryValue: brutYield,
        primaryLabel: 'Taux de distribution brut',
        legalNotice: 'Taux net non communiqué – rendement réel potentiellement inférieur. La fiscalité étrangère est prélevée à la source.',
        isNet: false,
        isEuropean: true,
        netNotAvailable: true
      };
    }
  } else {
    // SCPI française : afficher BRUT
    return {
      primaryValue: brutYield,
      primaryLabel: 'Taux de distribution brut',
      legalNotice: 'Taux brut avant fiscalité – la fiscalité dépend de la situation personnelle de l\'investisseur.',
      isNet: false,
      isEuropean: false,
      netNotAvailable: false
    };
  }
}

/**
 * Génère un avertissement pédagogique pour les comparaisons France ↔ Europe
 */
export function getComparisonWarning(scpi1: Scpi | SCPIExtended, scpi2: Scpi | SCPIExtended): string | null {
  const isEuropean1 = isEuropeanScpi(scpi1);
  const isEuropean2 = isEuropeanScpi(scpi2);
  
  // Si une est française et l'autre européenne
  if (isEuropean1 !== isEuropean2) {
    return '⚠️ Comparaison entre SCPI française et européenne : les taux ne sont pas directement comparables. La SCPI européenne affiche un taux net (après fiscalité étrangère), tandis que la SCPI française affiche un taux brut (avant fiscalité française).';
  }
  
  return null;
}

/**
 * Vérifie si une comparaison nécessite un avertissement
 */
export function needsComparisonWarning(scpi1: Scpi | SCPIExtended, scpi2: Scpi | SCPIExtended): boolean {
  const isEuropean1 = isEuropeanScpi(scpi1);
  const isEuropean2 = isEuropeanScpi(scpi2);
  return isEuropean1 !== isEuropean2;
}
