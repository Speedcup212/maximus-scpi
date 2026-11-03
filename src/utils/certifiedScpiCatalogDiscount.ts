/**
 * The comparative discount used by certification/scoring must remain absent
 * until price and valuation are semantically certified and comparable.
 * A dated, indicative display is computed separately from documentary proofs.
 */
export function certifiedScpiCatalogDiscount(
  price: number,
  reconstitution: number,
  semanticsCertified: boolean,
): number | null {
  if (!semanticsCertified || !Number.isFinite(price) || price <= 0 ||
      !Number.isFinite(reconstitution) || reconstitution <= 0) {
    return null;
  }
  return ((price - reconstitution) / reconstitution) * 100;
}
