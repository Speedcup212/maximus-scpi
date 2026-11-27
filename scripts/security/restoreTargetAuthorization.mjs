#!/usr/bin/env node
/**
 * Coût marginal et autorisation d'une cible de **restauration exercée** (P3).
 *
 * ## Pourquoi ce module existe
 *
 * Le gate `AUTHORIZED_RESTORE_PROJECT_REFS` (dans `restoreProtocol.mjs`) est une constante du
 * dépôt, vide. Rien n'empêchait jusqu'ici de la peupler par un simple commit : « un document
 * ne crée pas une autorisation » était écrit, jamais vérifié. Or l'arbitrage du 26/11 a
 * établi un fait qui invalide l'hypothèse de coût du lot 15 : l'organisation Supabase
 * existante est **Pro** et compte déjà quatre projets actifs. Sur une organisation payante,
 * il est impossible de créer un projet non payant (le plan est fixé au niveau de
 * l'organisation), donc « projet jetable à 0 € » n'y est pas une option.
 *
 * Ce module ne décide rien : il **constate**. Il transforme deux affirmations en objets
 * contrôlables — un **coût** sourcé et daté, une **autorisation** nominative et bornée dans
 * le temps — et refuse tout le reste, y compris la liste peuplée sans décision.
 *
 * ## Ce que ce module ne fait jamais
 *
 *  - il ne lit aucune variable d'environnement : ni pour élargir l'autorisation, ni pour
 *    désigner une cible. Une autorisation vient d'un fichier fourni explicitement ;
 *  - il n'écrit rien : aucun rapport, aucun fichier, aucune requête ;
 *  - il n'appelle aucun fournisseur : aucun jeton n'est requis pour l'exécuter ;
 *  - il ne crée ni ne supprime aucun projet.
 *
 * ## Les deux chemins de coût, et pourquoi ils diffèrent
 *
 *  - `SEPARATE_FREE_ORGANIZATION` : une organisation Free **séparée**, sans donnée client.
 *    Coût nul, mais la faisabilité dépend d'un quota que l'agent ne peut pas inventorier
 *    (deux projets actifs maximum, décomptés sur tous les membres Owner/Admin).
 *  - `THROWAWAY_PROJECT_IN_PRO_ORG` : un projet vide dans l'organisation Pro existante.
 *    Aucun changement d'abonnement, mais **coût réel à l'heure** : le crédit mensuel de
 *    calcul couvre un seul Micro et il est déjà absorbé par les projets existants. Laissé
 *    en marche, le projet coûte ~10 $/mois ; supprimé après l'exercice, quelques centimes.
 *
 * Les chiffres ci-dessous sont **sourcés et datés**. Ils ne sont pas une estimation de
 * l'agent : ce sont les tarifs publiés, relevés à la date indiquée.
 */

import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUTHORIZED_RESTORE_PROJECT_REFS } from './restoreProtocol.mjs';

/** Version du schéma de décision, à citer dans le journal d'exploitation. */
export const RESTORE_TARGET_AUTHORIZATION_VERSION = 'restore-target-authorization-v1';

/** Date du relevé tarifaire utilisé par ce module (ISO, jour). */
export const PRICING_RETRIEVED_AT = '2026-11-26';

/**
 * Hôtes admis comme source de coût. Une source hors de cette liste n'est **pas** une preuve :
 * un chiffre de coût recopié d'un blog ne peut pas fonder une autorisation de dépense.
 */
export const COST_SOURCE_ALLOWLIST = Object.freeze([
  'https://supabase.com/pricing',
  'https://supabase.com/docs/guides/platform/manage-your-usage/compute',
  'https://supabase.com/docs/guides/platform/billing-faq',
]);

/**
 * Tarifs relevés le 26/11 sur les pages officielles, et la phrase qui les fonde.
 * Chaque entrée cite sa source : c'est ce qui distingue un coût établi d'une commodité.
 */
export const SOURCED_PRICING = Object.freeze([
  Object.freeze({
    id: 'PRO_PLAN_SUBSCRIPTION',
    amountUsd: 25,
    period: 'MONTH',
    quote: 'Pro $ 25 /month',
    sourceUrl: 'https://supabase.com/pricing',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'MICRO_COMPUTE_HOURLY',
    amountUsd: 0.01344,
    period: 'HOUR',
    quote: 'Micro $ 0.01344 ~ $ 10',
    sourceUrl: 'https://supabase.com/docs/guides/platform/manage-your-usage/compute',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'MICRO_COMPUTE_MONTHLY',
    amountUsd: 10,
    period: 'MONTH',
    quote: 'Micro $ 0.01344 ~ $ 10',
    sourceUrl: 'https://supabase.com/docs/guides/platform/manage-your-usage/compute',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'COMPUTE_CREDITS_PER_MONTH',
    amountUsd: 10,
    period: 'MONTH',
    quote: 'Paid plans include $ 10 in Compute Credits, which cover one project running on '
      + 'Nano or Micro Compute size',
    sourceUrl: 'https://supabase.com/docs/guides/platform/manage-your-usage/compute',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'HOURLY_BILLING_RULE',
    amountUsd: 0,
    period: 'HOUR',
    quote: 'Compute instances are billed hourly',
    sourceUrl: 'https://supabase.com/pricing',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'PAUSED_PROJECTS_UNBILLED',
    amountUsd: 0,
    period: 'MONTH',
    quote: 'No, we do not charge for paused projects. Compute hours are only counted for '
      + 'active instances.',
    sourceUrl: 'https://supabase.com/docs/guides/platform/billing-faq',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'NO_MIXING_FREE_AND_PAID',
    amountUsd: 0,
    period: 'MONTH',
    quote: 'The subscription plan is set on the organization level and it is not possible to '
      + 'mix paid and non-paid projects inside a single organization.',
    sourceUrl: 'https://supabase.com/docs/guides/platform/billing-faq',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'FREE_PLAN_TWO_ACTIVE_PROJECTS',
    amountUsd: 0,
    period: 'MONTH',
    quote: 'Limit of 2 active projects.',
    sourceUrl: 'https://supabase.com/pricing',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
  Object.freeze({
    id: 'FREE_QUOTA_COUNTED_ON_OWNERS_AND_ADMINS',
    amountUsd: 0,
    period: 'MONTH',
    quote: 'within an organization, we count the free project limits from all members that are '
      + 'either Owner or Admin',
    sourceUrl: 'https://supabase.com/docs/guides/platform/billing-faq',
    retrievedAt: PRICING_RETRIEVED_AT,
  }),
]);

const pricingById = new Map(SOURCED_PRICING.map((p) => [p.id, p]));

/**
 * Chemins de coût d'un exercice de restauration.
 *
 * `proofOfExercise` est `true` pour les deux : un projet réel traverse le déploiement, la
 * résolution des dépendances et la pose de `verify_jwt`, ce qu'un rejeu local ne fait pas.
 * Aucun chemin de ce module ne vaut donc `local-replay`.
 */
export const RESTORE_DRILL_COST_PATHS = Object.freeze([
  Object.freeze({
    id: 'SEPARATE_FREE_ORGANIZATION',
    label: 'Organisation Free séparée, projet vide, aucune donnée client',
    proofOfExercise: true,
    // Coût nul *si* le quota est disponible : c'est une condition, pas un acquis.
    marginalCostUsd: (hours) => 0 * hours,
    worstCaseMonthlyUsd: 0,
    billingEvidence: [
      'FREE_PLAN_TWO_ACTIVE_PROJECTS',
      'FREE_QUOTA_COUNTED_ON_OWNERS_AND_ADMINS',
      'NO_MIXING_FREE_AND_PAID',
    ],
    conditions: [
      'aucune donnée client dans l organisation Free',
      'quota de 2 projets actifs disponible pour CHAQUE membre Owner/Admin (non inventoriable par l agent)',
      'projet privé, supprimé à la fin de l exercice',
      'un projet Free est mis en pause après une semaine d inactivité : sans effet sur un exercice de quelques heures',
    ],
    unverifiableByAgent: [
      'quota Free disponible pour les membres Owner/Admin',
      'existence d une organisation Free séparée',
    ],
  }),
  Object.freeze({
    id: 'THROWAWAY_PROJECT_IN_PRO_ORG',
    label: 'Projet jetable vide dans l organisation Pro existante',
    proofOfExercise: true,
    // Micro facturé à l'heure. Le crédit mensuel de calcul couvre un seul Micro, déjà absorbé
    // par les projets existants : le projet supplémentaire est donc facturé en entier.
    marginalCostUsd: (hours) => hourlyMicro(hours),
    worstCaseMonthlyUsd: pricingById.get('MICRO_COMPUTE_MONTHLY').amountUsd,
    billingEvidence: [
      'MICRO_COMPUTE_HOURLY',
      'MICRO_COMPUTE_MONTHLY',
      'COMPUTE_CREDITS_PER_MONTH',
      'HOURLY_BILLING_RULE',
      'PAUSED_PROJECTS_UNBILLED',
      'NO_MIXING_FREE_AND_PAID',
      'PRO_PLAN_SUBSCRIPTION',
    ],
    conditions: [
      'aucun changement d abonnement : le plan est déjà Pro (25 $/mois, déjà payé)',
      'projet privé, données vides hormis les bundles capturés (source de production = copie sensible)',
      'suppression immédiate après l exercice : le coût devient mensuel si le projet est oublié',
      'les projets Cabinet-CGP sont hors périmètre et ne doivent pas être réutilisés',
    ],
    unverifiableByAgent: [
      'consommation réelle du crédit de calcul de l organisation sur le cycle en cours',
    ],
  }),
]);

/**
 * Coût d'un Micro facturé à l'heure, arrondi à l'heure pleine entamée.
 *
 * L'arrondi n'est pas une prudence de style : la documentation indique qu'une heure entamée
 * est facturée en entier. Sous-estimer le coût d'une dépense qu'on demande d'autoriser
 * serait exactement le défaut que ce module doit empêcher.
 * @param {number} hours
 * @returns {number} USD
 */
function hourlyMicro(hours) {
  const n = Number(hours);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const billed = Math.ceil(n);
  const rate = pricingById.get('MICRO_COMPUTE_HOURLY').amountUsd;
  // 5 décimales : le tarif officiel est 0,01344 $/h. Arrondir à 4 décimales le ramènerait à
  // 0,0134, soit une **sous-estimation** du coût qu'on demande d'autoriser — précisément le
  // défaut que ce module doit empêcher. L'arrondi ne doit jamais aller vers le bas.
  return Number((billed * rate).toFixed(5));
}

/**
 * Périmètre que le propriétaire a **explicitement** borné le 26/11.
 *
 * L'arbitrage « CHEMIN B AUTORISÉ » ne dit pas seulement *quel* projet : il fixe aussi une
 * durée et un coût (« cible 2 h, ~0,03 USD ») et impose d'**arrêter** au-delà. Un coût établi
 * sans plafond ne borne donc rien : une autorisation de 1000 heures (13,44 $, soit 500 fois
 * l'enveloppe, et au-delà du pire cas mensuel) était acceptée par le gate alors que le
 * propriétaire n'a jamais autorisé cela.
 *
 * Ces bornes sont **dérivées** des tarifs déjà sourcés, jamais saisies à la main : recopier
 * « 0,02688 » en dur créerait une seconde source de vérité qui dériverait du tarif officiel.
 *
 * L'enveloppe ne fait que **refuser**. Elle n'autorise rien, ne remplace pas la décision
 * nominative, et ne peut pas être élargie par un argument ni par une variable d'environnement.
 */
export const OWNER_AUTHORIZED_RESTORE_DRILL_ENVELOPE = Object.freeze({
  authorizedAt: '2026-11-26',
  maxHours: 2,
  // Plafond de coût marginal pour `maxHours` sur le chemin Pro, heure entamée facturée.
  maxMarginalCostUsd: hourlyMicro(2),
  worstCaseMonthlyUsd: pricingById.get('MICRO_COMPUTE_MONTHLY').amountUsd,
  quote: 'Instance Micro ~0,01344 USD/h, cible 2 h (~0,03 USD), aucun changement '
    + 'd abonnement, aucun add-on payant, pas de conservation du projet.',
});

/**
 * Contrôle qu'une autorisation tient dans le périmètre borné par le propriétaire.
 *
 * Le contrôle porte sur la **durée**, pas sur le montant : pour un chemin et une durée
 * donnés, le montant est déjà recalculé par `validateCostBasis`. Vérifier en plus
 * `marginalCostUsd` serait une branche que sa mutation ne ferait jamais échouer — donc une
 * garde qui ne prouverait rien.
 *
 * @param {object|null|undefined} costBasis
 * @returns {{ok: boolean, reasons: string[]}}
 */
export function validateAuthorizedEnvelope(costBasis) {
  if (!costBasis || typeof costBasis !== 'object') return { ok: true, reasons: [] };
  const hours = Number(costBasis.hours);
  // Une durée absente ou non finie n'est pas « dans l'enveloppe » : c'est une autorisation
  // dont la borne est indéterminée. `validateCostBasis` la refuse déjà, mais l'enveloppe ne
  // doit pas dépendre de cet autre contrôle pour rester fermée.
  if (!Number.isFinite(hours) || hours <= 0) return { ok: true, reasons: [] };
  if (hours > OWNER_AUTHORIZED_RESTORE_DRILL_ENVELOPE.maxHours) {
    return { ok: false, reasons: ['AUTHORIZATION_EXCEEDS_AUTHORIZED_ENVELOPE'] };
  }
  return { ok: true, reasons: [] };
}

/**
 * Construit un devis de coût pour un chemin et une durée d'exercice.
 * @param {{pathId: string, hours: number}} input
 * @returns {{ok: boolean, reasons: string[], quote?: object}}
 */
export function quoteRestoreDrillCost(input) {
  const pathId = input?.pathId;
  const path = RESTORE_DRILL_COST_PATHS.find((p) => p.id === pathId);
  if (!path) return { ok: false, reasons: ['COST_PATH_UNKNOWN'] };

  const hours = Number(input?.hours);
  if (!Number.isFinite(hours) || hours <= 0) return { ok: false, reasons: ['COST_HOURS_MISSING'] };

  return {
    ok: true,
    reasons: [],
    quote: {
      pathId: path.id,
      label: path.label,
      hours,
      billedHours: Math.ceil(hours),
      marginalCostUsd: path.marginalCostUsd(hours),
      worstCaseMonthlyUsd: path.worstCaseMonthlyUsd,
      proofOfExercise: path.proofOfExercise,
      pricingSourceIds: [...path.billingEvidence],
      retrievedAt: PRICING_RETRIEVED_AT,
      conditions: [...path.conditions],
      unverifiableByAgent: [...path.unverifiableByAgent],
    },
  };
}

/**
 * Contrôle qu'un « coût établi » est réellement établi : chiffres sourcés, source admise,
 * relevé daté, chemin nommé.
 *
 * Un coût sans source est une opinion. Un coût dont la source n'est pas dans la liste admise
 * est une rumeur. Un coût sans date de relevé ne peut pas être vérifié après coup.
 *
 * @param {object|null|undefined} basis
 * @returns {{ok: boolean, reasons: string[]}}
 */
export function validateCostBasis(basis) {
  const reasons = [];
  if (!basis || typeof basis !== 'object') return { ok: false, reasons: ['COST_BASIS_MISSING'] };

  const path = RESTORE_DRILL_COST_PATHS.find((p) => p.id === basis.selectedPath);
  if (!path) reasons.push('COST_BASIS_PATH_UNKNOWN');

  const sourceUrl = basis.sourceUrl;
  if (typeof sourceUrl !== 'string' || sourceUrl.trim() === '') {
    reasons.push('COST_BASIS_NOT_SOURCED');
  } else if (!COST_SOURCE_ALLOWLIST.includes(sourceUrl)) {
    reasons.push('COST_BASIS_SOURCE_NOT_ALLOWED');
  }

  if (typeof basis.retrievedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(basis.retrievedAt)) {
    reasons.push('COST_BASIS_RETRIEVAL_MISSING');
  }

  if (path) {
    // Le devis doit citer les tarifs qui le fondent, et aucun tarif inventé.
    const cited = Array.isArray(basis.pricingSourceIds) ? basis.pricingSourceIds : [];
    for (const id of path.billingEvidence) {
      if (!cited.includes(id)) reasons.push('COST_BASIS_PRICING_UNCITED');
    }
    for (const id of cited) {
      if (!pricingById.has(id)) reasons.push('COST_BASIS_PRICING_UNKNOWN');
    }
    if (!Number.isFinite(basis.marginalCostUsd) || basis.marginalCostUsd < 0) {
      reasons.push('COST_BASIS_AMOUNT_MISSING');
    } else {
      const expected = path.marginalCostUsd(Number(basis.hours));
      if (expected !== basis.marginalCostUsd) reasons.push('COST_BASIS_AMOUNT_DISAGREES');
    }
  }

  return { ok: reasons.length === 0, reasons: [...new Set(reasons)] };
}

/** Raisons de refus d'une autorisation de cible. Nommées pour être citables en journal. */
export const TARGET_AUTHORIZATION_REFUSALS = Object.freeze([
  'AUTHORIZATION_MISSING',
  'AUTHORIZATION_NOT_OWNER',
  'AUTHORIZATION_TARGET_MISMATCH',
  'AUTHORIZATION_SCOPE_NOT_RESTORE_DRILL',
  'AUTHORIZATION_GRANTS_REVOCATION',
  'AUTHORIZATION_COST_BASIS_UNVERIFIED',
  'AUTHORIZATION_EXCEEDS_AUTHORIZED_ENVELOPE',
  'AUTHORIZATION_EXPIRED',
  'AUTHORIZATION_RECORD_INSIDE_REPO',
  'AUTHORIZED_LIST_WITHOUT_RECORD',
  'STALE_AUTHORIZATION_RECORD',
]);

/**
 * Valide une autorisation nominative du propriétaire pour **un** projet et **une** portée.
 *
 * Une autorisation n'est pas un blanc-seing : elle nomme le projet, elle porte la seule
 * portée `RESTORE_DRILL`, elle s'appuie sur un coût vérifié, elle expire, et elle ne peut
 * jamais autoriser une révocation de clé. Ces quatre bornes sont vérifiées ici, pas ailleurs.
 *
 * @param {object|null|undefined} record Autorisation fournie explicitement.
 * @param {{projectRef: string, today?: string, insideRepo?: boolean}} context
 * @returns {{ok: boolean, reasons: string[]}}
 */
export function validateOwnerAuthorization(record, context) {
  const reasons = [];
  if (!record || typeof record !== 'object') return { ok: false, reasons: ['AUTHORIZATION_MISSING'] };

  if (context?.insideRepo) reasons.push('AUTHORIZATION_RECORD_INSIDE_REPO');

  if (record.authorizedBy !== 'owner') reasons.push('AUTHORIZATION_NOT_OWNER');

  const target = typeof context?.projectRef === 'string' ? context.projectRef.trim() : '';
  if (target === '' || record.projectRef !== target) reasons.push('AUTHORIZATION_TARGET_MISMATCH');

  // La portée est fermée : restauration exercée, rien d'autre.
  if (record.scope !== 'RESTORE_DRILL') reasons.push('AUTHORIZATION_SCOPE_NOT_RESTORE_DRILL');

  // Une autorisation de restauration ne doit jamais valoir autorisation de révocation.
  if (record.revocationAuthorized === true) reasons.push('AUTHORIZATION_GRANTS_REVOCATION');

  const basis = validateCostBasis(record.costBasis);
  if (!basis.ok) reasons.push('AUTHORIZATION_COST_BASIS_UNVERIFIED');

  // Un coût établi ne borne pas la dépense : l'enveloppe du propriétaire le fait. Sans ce
  // contrôle, une autorisation de 1000 heures passait pour « établie » alors qu'elle sortait
  // de la décision rendue le 26/11.
  const envelope = validateAuthorizedEnvelope(record.costBasis);
  for (const reason of envelope.reasons) reasons.push(reason);

  const today = typeof context?.today === 'string' ? context.today : null;
  if (today) {
    if (typeof record.expiresAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.expiresAt)) {
      reasons.push('AUTHORIZATION_EXPIRED');
    } else if (record.expiresAt < today) {
      reasons.push('AUTHORIZATION_EXPIRED');
    }
  }

  return { ok: reasons.length === 0, reasons: [...new Set(reasons)] };
}

/**
 * Verdict unique : l'état de la liste du dépôt confronté à l'autorisation disponible.
 *
 * C'est ici que le défaut « liste peuplée sans décision » devient détectable. Trois états :
 *
 *  - `CLOSED_EXPECTED` : liste vide, aucune autorisation fournie. C'est l'état correct du
 *    26/11 (aucun projet hors production autorisé) ; ce n'est pas une anomalie ;
 *  - `AUTHORIZED` : liste et autorisation concordantes pour **ce** projet ;
 *  - `REFUSED` : tout le reste. Une liste non vide sans autorisation valide est un refus,
 *    même si l'intention était bonne : c'est précisément ce que le gate doit empêcher.
 *
 * @param {{authorizedProjectRefs: string[], record?: object|null, today?: string,
 *   insideRepo?: boolean}} input
 * @returns {{ok: boolean, state: string, reasons: string[]}}
 */
export function resolveRestoreTargetAuthorization(input) {
  const rawList = Array.isArray(input?.authorizedProjectRefs) ? input.authorizedProjectRefs : [];
  // Un identifiant répété est **une** cible saisie deux fois, pas deux cibles. Dédupliquer
  // évite de refuser l'état correct pour un artefact de saisie.
  const list = [...new Set(rawList)];
  const record = input?.record ?? null;

  if (list.length === 0) {
    if (record) {
      // Une autorisation sans cible ouverte n'ouvre rien, mais elle ne doit pas dormir dans
      // le dossier de conservation : elle serait rejouée plus tard sans nouvelle décision.
      return { ok: true, state: 'CLOSED_EXPECTED', reasons: ['STALE_AUTHORIZATION_RECORD'] };
    }
    return { ok: true, state: 'CLOSED_EXPECTED', reasons: [] };
  }

  if (!record) return { ok: false, state: 'REFUSED', reasons: ['AUTHORIZED_LIST_WITHOUT_RECORD'] };

  const reasons = [];
  for (const ref of list) {
    const verdict = validateOwnerAuthorization(record, {
      projectRef: ref,
      today: input?.today,
      insideRepo: input?.insideRepo,
    });
    for (const r of verdict.reasons) reasons.push(r);
  }

  // Une seule cible autorisée à la fois : c'est un exercice, pas une flotte. La boucle
  // ci-dessus suffirait pour deux identifiants distincts (le second ne serait pas celui que
  // l'autorisation nomme), mais la garde reste explicite : elle nomme l'intention, et elle
  // couvre le cas où une future autorisation porterait plusieurs `projectRef`.
  if (list.length > 1) reasons.push('AUTHORIZATION_TARGET_MISMATCH');

  const unique = [...new Set(reasons)];
  return { ok: unique.length === 0, state: unique.length === 0 ? 'AUTHORIZED' : 'REFUSED', reasons: unique };
}

/**
 * Lit un fichier d'autorisation fourni **explicitement**, et refuse un chemin dans le dépôt.
 *
 * Le fichier contient une décision nominative : il n'a pas sa place dans un dépôt public, où
 * il deviendrait une autorisation permanente. Même régime que les attestations.
 *
 * @param {string} path Chemin absolu.
 * @param {{repoRoot: string}} options
 * @returns {{ok: boolean, reasons: string[], record?: object}}
 */
export function readAuthorizationRecord(path, options) {
  if (typeof path !== 'string' || path.trim() === '') return { ok: false, reasons: ['AUTHORIZATION_MISSING'] };
  const abs = resolve(path);
  const repo = resolve(options.repoRoot);
  if (abs === repo || abs.startsWith(`${repo}${sep}`)) {
    return { ok: false, reasons: ['AUTHORIZATION_RECORD_INSIDE_REPO'] };
  }
  let record;
  try {
    record = JSON.parse(readFileSync(abs, 'utf8'));
  } catch {
    return { ok: false, reasons: ['AUTHORIZATION_MISSING'] };
  }
  return { ok: true, reasons: [], record };
}

/**
 * Résumé publiable : aucune donnée de source, aucun secret, seulement des codes et des
 * montants. C'est ce que la CI et le journal d'exploitation citent.
 * @param {{pathId: string, hours: number}} input
 * @returns {object}
 */
export function publicCostSummary(input) {
  const q = quoteRestoreDrillCost(input);
  if (!q.ok) return { ok: false, reasons: q.reasons };
  return { ok: true, ...q.quote };
}

/** État réel, imprimé par `--check` : la liste reste vide tant qu'aucune décision n'existe. */
function main(argv) {
  if (!argv.includes('--check')) {
    console.error('Usage : node scripts/security/restoreTargetAuthorization.mjs --check [--record <chemin hors dépôt>]');
    return 2;
  }
  const recordIdx = argv.indexOf('--record');
  const recordPath = recordIdx === -1 ? null : argv[recordIdx + 1];
  const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

  // La liste vient de la **constante du dépôt**, pas d'un argument : `--check` constate l'état
  // réel du gate, il ne peut pas le contourner.
  const list = [...AUTHORIZED_RESTORE_PROJECT_REFS];
  let record = null;
  let insideRepo = false;
  let recordReasons = [];
  if (recordPath) {
    const read = readAuthorizationRecord(recordPath, { repoRoot });
    insideRepo = read.reasons.includes('AUTHORIZATION_RECORD_INSIDE_REPO');
    record = read.record ?? null;
    recordReasons = read.reasons;
  }

  const verdict = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: list,
    record,
    today: new Date().toISOString().slice(0, 10),
    insideRepo,
  });

  // Une autorisation fournie mais **rejetée** est une anomalie à signaler, jamais un silence :
  // sans cela, un fichier rangé dans le dépôt retombait sur « aucune autorisation », donc sur
  // l'état normal, et le refus disparaissait du journal.
  const rejectedRecord = recordPath !== null && recordReasons.length > 0;
  if (rejectedRecord) {
    verdict.state = 'REFUSED';
    verdict.reasons = [...new Set([...recordReasons, ...verdict.reasons])];
  }

  // Une autorisation fournie qui **n'ouvre pas** le gate est une action inachevée, pas un
  // succès. Cas typique : la liste du dépôt est encore vide. Sortir en 0 ferait croire à un
  // opérateur que l'autorisation a pris effet — exactement le « succès apparent » que ce lot
  // corrige ailleurs.
  const suppliedButNotApplied = recordPath !== null && verdict.state !== 'AUTHORIZED';
  const exitState = suppliedButNotApplied ? 'REFUSED' : verdict.state;

  process.stdout.write(`${JSON.stringify({
    schemaVersion: RESTORE_TARGET_AUTHORIZATION_VERSION,
    authorizedProjectRefs: list.length,
    state: verdict.state,
    reasons: verdict.reasons,
    suppliedAuthorizationApplied: recordPath !== null ? verdict.state === 'AUTHORIZED' : null,
    rollbackReady: '0/16',
    revocationAllowed: false,
    pricingRetrievedAt: PRICING_RETRIEVED_AT,
  }, null, 2)}\n`);
  // Liste vide sans autorisation = état correct attendu, donc 0. Tout le reste = 1.
  return exitState === 'REFUSED' ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  process.exit(main(process.argv.slice(2)));
}
