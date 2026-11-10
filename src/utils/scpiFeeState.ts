// RECOVERY-200 — état du frais de souscription : un 0 n'est un « sans frais » que s'il est prouvé.
// Le catalogue convertit historiquement un frais absent en 0 (`|| 0`) ; sans ce garde-fou, une SCPI
// dont la souscription est fermée (variabilité suspendue) ou dont le frais est inconnu s'affichait
// « Sans frais de souscription » et recevait le bonus « 0 frais » des classements.
export type SubscriptionFeeState = 'value' | 'zero' | 'unknown' | 'not_applicable';

type FeeProof = { value_state?: unknown; verification_status?: unknown } | null | undefined;

export function subscriptionFeeState(fees: unknown, proof: FeeProof): SubscriptionFeeState {
  if (proof?.value_state === 'not_applicable') return 'not_applicable';
  if (typeof fees !== 'number' || !Number.isFinite(fees)) return 'unknown';
  if (fees > 0) return 'value';
  const proven = proof?.verification_status === 'verified' || proof?.value_state === 'zero';
  return proven ? 'zero' : 'unknown';
}

type FeeCarrier = {
  fees?: number | null;
  feesState?: SubscriptionFeeState;
  metricProvenance?: { frais_souscription?: FeeProof } | Record<string, unknown> | null;
};

export function feeStateOf(scpi: FeeCarrier | null | undefined): SubscriptionFeeState {
  if (!scpi) return 'unknown';
  if (scpi.feesState) return scpi.feesState;
  const proof = (scpi.metricProvenance as { frais_souscription?: FeeProof } | null | undefined)?.frais_souscription;
  return subscriptionFeeState(scpi.fees, proof);
}

/** Vrai seulement pour un 0 % documenté (jamais pour un frais inconnu ou non applicable). */
export function isProvenZeroFee(scpi: FeeCarrier | null | undefined): boolean {
  return feeStateOf(scpi) === 'zero';
}

/** Libellé public du frais de souscription, sans jamais transformer l'absence en 0 %. */
export function subscriptionFeeLabel(scpi: FeeCarrier | null | undefined, formatValue: (value: number) => string): string {
  const state = feeStateOf(scpi);
  if (state === 'not_applicable') return 'Non applicable (souscription fermée)';
  if (state === 'unknown') return 'Non communiqué';
  if (state === 'zero') return '0%';
  return formatValue(scpi?.fees as number);
}
