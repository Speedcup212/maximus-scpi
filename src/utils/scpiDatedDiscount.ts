import type { Scpi } from '../types/scpi';
import { calculateScpiDiscountPremium } from './scpiDiscountPremium';
import { formatScpiReferenceDate, isFeatureDisabled } from './scpiPublicationQuality';

export type DatedDiscount = {
  value: number;
  label: 'Décote indicative' | 'Surcote indicative' | 'Écart indicatif';
  formatted: string;
  comparisonLabel: string;
  priceDate: string;
  valuationDate: string;
};

/** A *dated factual calculation*, never a certified current discount nor a scoring signal. */
export function getScpiDatedDiscount(scpi: Scpi): DatedDiscount | null {
  if (!isFeatureDisabled(scpi, 'undated_valuation_comparison') ||
      scpi.discountQaStatus === 'publishable' || scpi.liquidityRegimeChanged) return null;
  const purchase = scpi.metricProvenance?.prix_souscription;
  const valuation = scpi.metricProvenance?.prix_reconstitution;
  const iso = /^20\d{2}-\d{2}-\d{2}$/;
  const sha = /^[0-9a-f]{64}$/;
  if (!purchase || !valuation ||
      !purchase.reference_date || !valuation.reference_date ||
      !iso.test(purchase.reference_date) || !iso.test(valuation.reference_date) ||
      !(valuation.reference_date < purchase.reference_date) ||
      !sha.test(purchase.pdf_sha256 || '') || !sha.test(valuation.pdf_sha256 || '') ||
      !/^https:\/\//.test(purchase.source_url || '') ||
      !/^https:\/\//.test(valuation.source_url || '') ||
      !(Number(purchase.source_page) >= 1) || !(Number(valuation.source_page) >= 1) ||
      !Number.isFinite(purchase.value_numeric) || !Number.isFinite(valuation.value_numeric) ||
      Math.abs(Number(purchase.value_numeric) - scpi.price) > 0.001 ||
      Math.abs(Number(valuation.value_numeric) - (scpi.valeurReconstitution ?? NaN)) > 0.001
  ) return null;
  const priceDate = formatScpiReferenceDate(purchase.reference_date);
  const valuationDate = formatScpiReferenceDate(valuation.reference_date);
  if (!priceDate || !valuationDate) return null;
  const value = calculateScpiDiscountPremium(scpi.price, scpi.valeurReconstitution);
  if (value == null) return null;
  return {
    value,
    label: value < -0.005 ? 'Décote indicative' : value > 0.005 ? 'Surcote indicative' : 'Écart indicatif',
    formatted: Math.abs(value).toFixed(2).replace('.', ',') + ' %',
    priceDate,
    valuationDate,
    comparisonLabel: 'Prix de souscription au ' + priceDate +
      ' / dernière valeur de reconstitution disponible au ' + valuationDate +
      '. Calcul historique indicatif, non utilisé pour une recommandation.'
  };
}
