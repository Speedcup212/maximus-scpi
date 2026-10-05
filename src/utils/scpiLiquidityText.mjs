// Legacy liquidity warnings have no dated provenance or regime. The certified
// Trajectoire block is the authoritative place for withdrawal/secondary metrics.
export const isLegacyLiquidityWarning = value => typeof value === 'string'
  && /liquidit|retraits?|rachats?|carnet|parts?\s+en\s+attente|march[eé]\s+(?:des\s+parts|secondaire)|variabilit|withdrawal|redemption|order\s+book/i.test(value);

export function filterDocumentedNonLiquidityWarnings(warnings) {
  return Array.isArray(warnings)
    ? warnings.filter(value => typeof value === 'string' && value.trim() && !isLegacyLiquidityWarning(value))
    : [];
}
