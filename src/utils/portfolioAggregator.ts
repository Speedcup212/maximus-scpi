import { PortfolioLine, ScpiDataForPortfolio } from '../components/ScpiPortfolioBuilder';

/**
 * Agrégats d'un portefeuille SCPI utilisés pour alimenter le moteur d'enveloppe
 */
export interface PortfolioAggregates {
  montantTotal: number;
  rendementBrutMoyen: number;   // en %
  revaloMoyenne: number;         // en %
  partFrance: number;            // en % (0-100)
  partEtranger: number;          // en % (0-100)
}

/**
 * Calcule les agrégats d'un portefeuille SCPI à partir des lignes et de la base SCPI
 */
export function computePortfolioAggregates(
  portfolio: PortfolioLine[],
  scpis: ScpiDataForPortfolio[],
  montantTotal: number
): PortfolioAggregates {
  // Si portfolio vide, retourner des valeurs par défaut
  if (portfolio.length === 0 || montantTotal === 0) {
    return {
      montantTotal: 0,
      rendementBrutMoyen: 0,
      revaloMoyenne: 0,
      partFrance: 100,
      partEtranger: 0
    };
  }

  // Normaliser les poids pour qu'ils totalisent 100%
  const totalWeight = portfolio.reduce((sum, line) => sum + line.weightPercent, 0);

  if (totalWeight === 0) {
    return {
      montantTotal,
      rendementBrutMoyen: 0,
      revaloMoyenne: 0,
      partFrance: 100,
      partEtranger: 0
    };
  }

  // Calcul des agrégats pondérés
  let rendementMoyen = 0;
  let revaloMoyenne = 0;
  let partFrance = 0;
  let partEtranger = 0;

  portfolio.forEach(line => {
    const scpi = scpis.find(s => s.id === line.scpiId);
    if (!scpi) return;

    // Poids normalisé
    const normalizedWeight = line.weightPercent / totalWeight;

    // Pondération des métriques
    rendementMoyen += normalizedWeight * scpi.rendementBrut;
    revaloMoyenne += normalizedWeight * scpi.revaloMoyenne;
    partFrance += normalizedWeight * scpi.partFrance;
    partEtranger += normalizedWeight * scpi.partEtranger;
  });

  // S'assurer que partFrance + partEtranger = 100%
  const totalGeo = partFrance + partEtranger;
  if (totalGeo > 0) {
    partFrance = (partFrance / totalGeo) * 100;
    partEtranger = (partEtranger / totalGeo) * 100;
  } else {
    // Par défaut si pas de données géo : 100% France
    partFrance = 100;
    partEtranger = 0;
  }

  return {
    montantTotal,
    rendementBrutMoyen: rendementMoyen,
    revaloMoyenne,
    partFrance,
    partEtranger
  };
}

/**
 * Crée des agrégats à partir de paramètres manuels
 */
export function createManualAggregates(
  montantTotal: number,
  rendementBrut: number,
  revaloPrixPart: number,
  partFrance: number = 100
): PortfolioAggregates {
  return {
    montantTotal,
    rendementBrutMoyen: rendementBrut,
    revaloMoyenne: revaloPrixPart,
    partFrance,
    partEtranger: 100 - partFrance
  };
}
