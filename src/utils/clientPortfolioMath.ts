/**
 * Annualisation indicative à partir du taux de distribution (TD) publié.
 *
 * `distribution_par_part` peut représenter une échéance trimestrielle :
 * ne jamais l'utiliser comme montant annuel sans période certifiée.
 * Le TD se rapporte au prix de souscription de référence, pas au prix de retrait.
 */
export const estimateAnnualizedScpiIncome = (
  units: number,
  publishedSubscriptionPrice: number | null,
  annualDistributionRate: number | null,
): number | null => {
  if (!Number.isFinite(units) || units <= 0) return null;
  if (
    publishedSubscriptionPrice === null ||
    !Number.isFinite(publishedSubscriptionPrice) ||
    publishedSubscriptionPrice <= 0
  ) return null;
  if (
    annualDistributionRate === null ||
    !Number.isFinite(annualDistributionRate) ||
    annualDistributionRate < 0 ||
    annualDistributionRate > 100
  ) return null;
  return units * publishedSubscriptionPrice * annualDistributionRate / 100;
};
