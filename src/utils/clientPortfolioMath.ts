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

/** Capitalisation issue de scpi_indicators : valeurs stockées en millions d'euros. */
export const formatCapitalizationMillions = (millions: number | null): string => {
  if (millions === null || !Number.isFinite(millions) || millions < 0) return '—';
  if (millions >= 1000) {
    return millions / 1000 < 10
      ? (millions / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' Md€'
      : (millions / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' Md€';
  }
  return millions.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M€';
};
