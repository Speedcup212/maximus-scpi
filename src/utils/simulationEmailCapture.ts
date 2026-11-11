/**
 * RECOVERY-201 — Capture email après simulation (logique pure, testable).
 * Cadrage de référence : docs/cadrage/RECOVERY-201-capture-simulation.md
 *
 * Règles non négociables :
 * - l'envoi de la simulation ne dépend jamais de la case de consentement ;
 * - aucune valeur absente n'est remplacée par un chiffre (null reste null) ;
 * - aucun email ni prénom ne part dans les métadonnées de suivi.
 */

import type { LeadPayload } from './leadSubmitter';

export type Tranche = 'moins-20k' | '20-50k' | '50-100k' | '100-300k' | 'plus-300k';

export type SimulationSource = 'simulateur-scpi' | 'simulateur-revenus-nets-scpi';

// v2 (11/11/2026) : la case couvre aussi les propositions de rendez-vous.
export const CONSENT_TEXT_VERSION = 'sim-email-v2';

export const TRANCHE_OPTIONS: ReadonlyArray<{ value: Tranche; label: string }> = [
  { value: 'moins-20k', label: 'Moins de 20 000 €' },
  { value: '20-50k', label: '20 000 à 50 000 €' },
  { value: '50-100k', label: '50 000 à 100 000 €' },
  { value: '100-300k', label: '100 000 à 300 000 €' },
  { value: 'plus-300k', label: 'Plus de 300 000 €' },
];

export interface SimulationSnapshot {
  montantSimule: number;
  tauxHypothese: number;
  delaiJouissanceMois: number;
  origine: 'france' | 'international';
  tmi: number;
  horizonAns: number;
  revenuBrutAnnuel: number;
  revenuNetAnnuel: number | null;
  revenuNetMensuel: number | null;
  revenuPremiereAnnee: number | null;
  cumulHorizon: number | null;
}

export interface CaptureInput {
  email: string;
  prenom?: string;
  tranche: Tranche;
  consentMarketing: boolean;
  source: SimulationSource;
  snapshot: SimulationSnapshot;
}

export function trancheFromAmount(amount: number): Tranche {
  if (!Number.isFinite(amount) || amount < 20000) return 'moins-20k';
  if (amount < 50000) return '20-50k';
  if (amount < 100000) return '50-100k';
  if (amount < 300000) return '100-300k';
  return 'plus-300k';
}

export function isAtLeast50k(tranche: Tranche): boolean {
  return tranche === '50-100k' || tranche === '100-300k' || tranche === 'plus-300k';
}

export function isTranche(value: unknown): value is Tranche {
  return TRANCHE_OPTIONS.some(option => option.value === value);
}

export function sourceFromPath(pathname: string): SimulationSource {
  return pathname.startsWith('/simulateur-revenus-nets-scpi')
    ? 'simulateur-revenus-nets-scpi'
    : 'simulateur-scpi';
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const roundEuro = (value: number | null): number | null =>
  value === null || !Number.isFinite(value) ? null : Math.round(value);

export function buildLeadPayload(input: CaptureInput): LeadPayload {
  const { snapshot } = input;
  const prenom = input.prenom?.trim() || null;

  return {
    channel: 'simulateur',
    form_type: 'lead_simulation_email',
    context_type: 'simulateur',
    context_slug: input.source,
    identity: { email: input.email.trim(), prenom },
    answers: {
      tranche_montant: input.tranche,
      montant_simule: Math.round(snapshot.montantSimule),
      taux_hypothese: snapshot.tauxHypothese,
      delai_jouissance_mois: snapshot.delaiJouissanceMois,
      origine: snapshot.origine,
      tmi: snapshot.tmi,
      horizon_ans: snapshot.horizonAns,
      revenu_brut_annuel: roundEuro(snapshot.revenuBrutAnnuel),
      revenu_net_annuel: roundEuro(snapshot.revenuNetAnnuel),
      revenu_net_mensuel: roundEuro(snapshot.revenuNetMensuel),
      revenu_premiere_annee: roundEuro(snapshot.revenuPremiereAnnee),
      cumul_horizon: roundEuro(snapshot.cumulHorizon),
      action: 'email_simulation',
    },
    consent: { marketing: input.consentMarketing, textVersion: CONSENT_TEXT_VERSION },
  };
}

export function buildSubmittedMetadata(params: {
  source: SimulationSource;
  tranche: Tranche;
  consentMarketing: boolean;
  requestId: string;
}) {
  return {
    source: params.source,
    tranche_montant: params.tranche,
    consent_marketing: params.consentMarketing,
    lead_request_id: params.requestId,
  };
}
