// RECOVERY-201 — Logique pure de send-simulation-email (sans API Deno ni réseau),
// partagée par index.ts et testée par src/tests/simulationEmailCapture.test.ts.

export const FRESHNESS_MS = 15 * 60 * 1000;
export const MAX_SENDS_PER_24H = 3;

const TMI_VALUES = new Set([0, 11, 30, 41, 45]);
const HORIZON_VALUES = new Set([10, 15, 20]);

export const TRANCHE_LABELS: Record<string, string> = {
  'moins-20k': 'Moins de 20 000 €',
  '20-50k': '20 000 à 50 000 €',
  '50-100k': '50 000 à 100 000 €',
  '100-300k': '100 000 à 300 000 €',
  'plus-300k': 'Plus de 300 000 €',
};

const AT_LEAST_50K = new Set(['50-100k', '100-300k', 'plus-300k']);
const SOURCES = new Set(['simulateur-scpi', 'simulateur-revenus-nets-scpi']);

export interface SimulationAnswers {
  tranche_montant: string;
  montant_simule: number;
  taux_hypothese: number;
  delai_jouissance_mois: number;
  origine: 'france' | 'international';
  tmi: number;
  horizon_ans: number;
  revenu_brut_annuel: number | null;
  revenu_net_annuel: number | null;
  revenu_net_mensuel: number | null;
  revenu_premiere_annee: number | null;
  cumul_horizon: number | null;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isMoneyOrNull = (value: unknown): value is number | null =>
  value === null || (isFiniteNumber(value) && Math.abs(value) <= 100_000_000);

/** Valide les réponses enregistrées ; null si une seule valeur est hors bornes. */
export function validateAnswers(raw: unknown): SimulationAnswers | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const a = raw as Record<string, unknown>;

  if (typeof a.tranche_montant !== 'string' || !(a.tranche_montant in TRANCHE_LABELS)) return null;
  if (!isFiniteNumber(a.montant_simule) || a.montant_simule < 1000 || a.montant_simule > 5_000_000) return null;
  if (!isFiniteNumber(a.taux_hypothese) || a.taux_hypothese < 2 || a.taux_hypothese > 10) return null;
  if (!isFiniteNumber(a.delai_jouissance_mois) || a.delai_jouissance_mois < 0 || a.delai_jouissance_mois > 12) return null;
  if (a.origine !== 'france' && a.origine !== 'international') return null;
  if (!isFiniteNumber(a.tmi) || !TMI_VALUES.has(a.tmi)) return null;
  if (!isFiniteNumber(a.horizon_ans) || !HORIZON_VALUES.has(a.horizon_ans)) return null;

  const money = [
    a.revenu_brut_annuel,
    a.revenu_net_annuel,
    a.revenu_net_mensuel,
    a.revenu_premiere_annee,
    a.cumul_horizon,
  ];
  if (!money.every(isMoneyOrNull)) return null;

  return {
    tranche_montant: a.tranche_montant,
    montant_simule: a.montant_simule,
    taux_hypothese: a.taux_hypothese,
    delai_jouissance_mois: a.delai_jouissance_mois,
    origine: a.origine,
    tmi: a.tmi,
    horizon_ans: a.horizon_ans,
    revenu_brut_annuel: a.revenu_brut_annuel as number | null,
    revenu_net_annuel: a.revenu_net_annuel as number | null,
    revenu_net_mensuel: a.revenu_net_mensuel as number | null,
    revenu_premiere_annee: a.revenu_premiere_annee as number | null,
    cumul_horizon: a.cumul_horizon as number | null,
  };
}

export function isFresh(createdAt: string, now: number = Date.now()): boolean {
  const created = Date.parse(createdAt);
  return Number.isFinite(created) && now - created >= 0 && now - created <= FRESHNESS_MS;
}

export function cleanPrenom(value: unknown): string {
  return String(value ?? '')
    .replace(/[^\p{L}\s'’-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
}

export function normalizeSource(value: unknown): string {
  return typeof value === 'string' && SOURCES.has(value) ? value : 'simulateur-scpi';
}

const euro = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/** Montant formaté, ou « non calculé » : une valeur absente n'est jamais remplacée par un chiffre. */
export const formatMoney = (value: number | null): string => (value === null ? 'non calculé' : euro(value));

const percent = (value: number) =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} %`;

/** Paramètres du modèle Brevo de l'email 1 (« Votre simulation SCPI »). */
export function buildEmailParams(answers: SimulationAnswers, prenom: string, source: string) {
  return {
    PRENOM: prenom,
    TRANCHE: TRANCHE_LABELS[answers.tranche_montant],
    MONTANT: euro(answers.montant_simule),
    TAUX: percent(answers.taux_hypothese),
    DELAI: `${answers.delai_jouissance_mois} mois`,
    ORIGINE: answers.origine === 'france' ? 'France' : 'Europe / international',
    TMI: `${answers.tmi} %`,
    HORIZON: `${answers.horizon_ans} ans`,
    BRUT_ANNUEL: formatMoney(answers.revenu_brut_annuel),
    NET_ANNUEL: formatMoney(answers.revenu_net_annuel),
    NET_MENSUEL: formatMoney(answers.revenu_net_mensuel),
    PREMIERE_ANNEE: formatMoney(answers.revenu_premiere_annee),
    CUMUL: formatMoney(answers.cumul_horizon),
    LIEN_SIMULATION: `https://www.maximusscpi.com/${normalizeSource(source)}/`,
  };
}

/** Attributs du contact Brevo de la séquence (uniquement avec consentement). */
export function buildContactAttributes(
  answers: SimulationAnswers,
  prenom: string,
  source: string,
  consentDate: string | null,
) {
  return {
    PRENOM: prenom,
    TRANCHE_MONTANT: answers.tranche_montant,
    MONTANT_50K: AT_LEAST_50K.has(answers.tranche_montant),
    SOURCE_PAGE: normalizeSource(source),
    CONSENT_DATE: consentDate ? consentDate.slice(0, 10) : '',
    RDV_PRIS: false,
  };
}
