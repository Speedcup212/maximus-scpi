import { Scpi } from '../types/scpi';

/**
 * Construit l'objet Scpi utilisé pour générer les TEXTES d'analyse
 * (Lecture rapide, Analyse MaximusSCPI, points d'attention) dans la modale
 * Analyse détaillée.
 *
 * RÈGLE CRITIQUE : les champs liés à la décote/surcote (prix, valeur de
 * reconstitution, statut QA, snapshot) sont alignés sur les valeurs AFFICHÉES
 * par le bloc KPI (l'objet passé en entrée), afin que les textes recalculent
 * une décote/surcote strictement identique à celle du KPI.
 *
 * Sans cet alignement, le texte serait recalculé depuis une entrée `scpiData`
 * potentiellement différente (prix snapshot antérieur), provoquant une
 * divergence KPI / texte (ex. KPI -3,9 % vs Lecture rapide 8,5 %).
 *
 * Helper partagé entre le composant (AnalysisDetailModal) et l'audit, afin que
 * le test reproduise EXACTEMENT le rendu.
 */
export interface AnalysisDisplaySource {
  name: string;
  price?: number | null;
  reconstitutionValue?: number | null;
  valeurReconstitution?: number | null;
  discountQaStatus?: 'publishable' | 'manual_review' | 'excluded_non_scpi';
  discount?: number | null;
}

export function buildScpiForAnalysis(
  displayScpi: AnalysisDisplaySource,
  scpiData: Scpi[]
): Scpi | null {
  const allMatching = scpiData.filter(
    (s) => s.name.toLowerCase() === displayScpi.name.toLowerCase()
  );
  if (allMatching.length === 0) return null;

  // Prioriser l'entrée avec actualités trimestrielles (comme la modale).
  const base = allMatching.find((s) => s.actualitesTrimestrielles) ?? allMatching[0];

  const displayedVr =
    displayScpi.reconstitutionValue ??
    displayScpi.valeurReconstitution ??
    base.valeurReconstitution;

  return {
    ...base,
    price: displayScpi.price ?? base.price,
    valeurReconstitution: displayedVr ?? undefined,
    discountQaStatus: displayScpi.discountQaStatus ?? base.discountQaStatus,
    discount: displayScpi.discount ?? base.discount,
  };
}
