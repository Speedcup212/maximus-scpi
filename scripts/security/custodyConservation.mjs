#!/usr/bin/env node
/**
 * Conservation à accès restreint des archives de custody — ce qui est **mesuré**, pas déclaré.
 *
 * ## Le fait qui impose ce module
 *
 * L'arbitrage du 27/11 19:33Z est explicite : le store persistant (`/cursor/stores/...`,
 * montage FUSE `fuse.agent-store`) force `0666` sur les fichiers et `0777` sur les
 * répertoires, et `chmod` y est **silencieusement ignoré** (exit 0, mode inchangé). Un
 * fichier `0600` posé sur ext4 refuse la lecture à un autre uid ; le même `chmod 600`
 * sur ce store ne refuse **rien**. Conséquence : y déposer la phrase secrète à côté de
 * l'archive chiffrée ne protège pas plus que de ne pas chiffrer. La durabilité du store
 * est acquise, sa **restriction d'accès** ne l'est pas.
 *
 * Ce module ne prétend donc pas durcir des droits qu'il ne peut pas obtenir. Il rend la
 * situation **mesurable** et refuse de la nommer autrement :
 *
 *  - il interroge le système (mode réel, application effective de `chmod`, montage,
 *    emplacement des copies) et rend un verdict nommé ;
 *  - il **refuse** `RESTRICTED_ACCESS` dès qu'un fait contredit la restriction — jamais
 *    il ne « corrige » un fait gênant ni ne le tait ;
 *  - il fournit le seul levier réellement disponible : un secret à **deux custodiens**
 *    (une part reste sur le pod, l'autre est détenue hors du pod). La compromission du
 *    pod seule ne permet alors plus de déchiffrer l'archive — propriété testée, pas
 *    espérée.
 *
 * ## Ce que ce module ne fait JAMAIS
 *
 *  - il ne lit jamais le contenu du fichier de phrase secrète : il n'en prend que
 *    `stat`, taille et mode. Un FIFO à sa place ne le bloque donc pas ;
 *  - il n'imprime, ne journalise et ne conserve aucune phrase ni part de secret ;
 *  - il n'écrit aucun fichier hors du fichier sonde temporaire qu'il crée puis retire ;
 *  - il ne contacte aucun réseau et ne lit aucune variable d'environnement ;
 *  - il ne supprime ou ne déplace aucune archive ni aucun secret : la migration d'un
 *    secret vers deux custodiens est une action **du propriétaire**, décrite par
 *    `conservationPlan()`, jamais exécutée ici ;
 *  - il n'affirme aucune restauration : une archive vérifiée reste une archive.
 */

import {
  chmodSync,
  closeSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeSync,
} from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { randomBytes } from 'node:crypto';

/** Verdicts possibles. Il n'existe volontairement aucun verdict « durci ». */
export const CONSERVATION_VERDICT = Object.freeze({
  RESTRICTED: 'RESTRICTED_ACCESS',
  UNRESTRICTED: 'UNRESTRICTED',
  UNDETERMINED: 'UNDETERMINED',
});

/** Codes de refus, nommés pour être citables dans un rapport sans ambiguïté. */
export const CONSERVATION_REFUSAL = Object.freeze({
  PATH_OUTSIDE_DECLARED_ROOT: 'PATH_OUTSIDE_DECLARED_ROOT',
  MODE_ENFORCEMENT_ABSENT: 'MODE_ENFORCEMENT_ABSENT',
  MODE_ENFORCEMENT_UNDETERMINED: 'MODE_ENFORCEMENT_UNDETERMINED',
  SECRET_READABLE_BY_OTHER_USERS: 'SECRET_READABLE_BY_OTHER_USERS',
  SECRET_COLOCATED_WITH_ARCHIVE: 'SECRET_COLOCATED_WITH_ARCHIVE',
  SINGLE_FACTOR_SECRET: 'SINGLE_FACTOR_SECRET',
  NO_OFF_STORE_COPY: 'NO_OFF_STORE_COPY',
  MOUNT_TYPE_UNDETERMINED: 'MOUNT_TYPE_UNDETERMINED',
});

/** Taille minimale, en octets, d'une part de secret à deux custodiens (256 bits). */
export const MIN_SECRET_PART_BYTES = 32;

/**
 * Compare deux chemins sur une **frontière** de répertoire.
 *
 * `startsWith('/tmp/vault')` accepte `/tmp/vault-out` : ce faux positif a déjà été commis
 * une fois dans ce dépôt. On compare donc la racine, ou la racine suivie du séparateur.
 */
export function isInsideRoot(candidate, root) {
  const c = resolve(candidate);
  const r = resolve(root);
  if (c === r) return true;
  return c.startsWith(r.endsWith(sep) ? r : r + sep);
}

/** Extrait le montage qui couvre un chemin, depuis `mountinfo`. Rend `null` si absent. */
export function mountForPath(mountInfoText, path) {
  let best = null;
  for (const line of mountInfoText.split('\n')) {
    if (!line.trim()) continue;
    // mountinfo : id parent major:minor root mountpoint options … - fstype source superopts
    const fields = line.split(' ');
    const dash = fields.indexOf('-');
    if (dash < 0 || fields.length < dash + 2) continue;
    const mountPoint = fields[4];
    const fstype = fields[dash + 1];
    if (!mountPoint || !isInsideRoot(path, mountPoint)) continue;
    if (!best || mountPoint.length > best.mountPoint.length) {
      best = { mountPoint, fstype };
    }
  }
  return best;
}

/**
 * Mesure si `chmod` produit réellement un effet dans un répertoire.
 *
 * C'est le seul contrôle qui distingue « droits restreints » de « droits affichés ».
 * Sur un montage qui ignore les modes, le fichier sonde reste lisible par tous alors que
 * `chmod` sort en succès. Le fichier est créé puis retiré ici, jamais ailleurs.
 */
export function probeModeEnforcement(directory) {
  const probe = join(directory, `.custody-mode-probe-${randomBytes(6).toString('hex')}`);
  let fd;
  try {
    fd = openSync(probe, 'wx', 0o600);
    writeSync(fd, 'probe');
    closeSync(fd);
    fd = undefined;
    chmodSync(probe, 0o600);
    const mode = statSync(probe).mode & 0o777;
    return mode === 0o600 ? { status: 'ENFORCED', observedMode: mode } : { status: 'IGNORED', observedMode: mode };
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EACCES') {
      return { status: 'DENIED', observedMode: null };
    }
    throw error;
  } finally {
    if (fd !== undefined) {
      try {
        closeSync(fd);
      } catch {
        /* fermeture déjà faite ou descripteur invalide : rien à rattraper */
      }
    }
    rmSync(probe, { force: true });
  }
}

/**
 * Rassemble les faits observables. Aucune lecture du contenu du secret.
 *
 * `offStoreCopies` est déclaré par l'appelant : le module ne peut pas inventer une copie
 * qu'il n'a pas vue, et une copie déclarée mais absente est tout de même signalée par
 * l'appelant lui-même, pas par une supposition d'ici.
 */
export function collectConservationFacts({
  storeRoot,
  archivePath,
  secretPath,
  offStoreCopies = [],
  mountInfoText = null,
  modeProbe = null,
}) {
  const archive = statSync(archivePath);
  const secret = statSync(secretPath);
  const probe = modeProbe ?? probeModeEnforcement(storeRoot);
  const mountInfo = mountInfoText ?? readMountInfo();

  return {
    storeRoot: resolve(storeRoot),
    archivePath: resolve(archivePath),
    secretPath: resolve(secretPath),
    archiveMode: archive.mode & 0o777,
    secretMode: secret.mode & 0o777,
    secretKind: secret.isFile() ? 'file' : 'other',
    archiveMount: mountInfo ? mountForPath(mountInfo, archivePath) : null,
    secretMount: mountInfo ? mountForPath(mountInfo, secretPath) : null,
    modeEnforcement: probe.status,
    modeEnforcementObserved: probe.observedMode,
    offStoreCopiesDeclared: offStoreCopies.filter(Boolean),
    secretFactorDomains: ['pod'],
  };
}

function readMountInfo() {
  try {
    return readFileSync('/proc/self/mountinfo', 'utf8');
  } catch {
    return null;
  }
}

/**
 * Rend le verdict à partir des faits. Fonction pure : mêmes faits, même verdict.
 *
 * Toute contradiction produit un code nommé. L'absence d'information ne vaut jamais
 * succès : elle produit `UNDETERMINED`, jamais `RESTRICTED_ACCESS`.
 */
export function evaluateConservation(facts) {
  const reasons = [];
  const unknowns = [];
  const add = (code, detail) => reasons.push({ code, detail });

  for (const [label, path] of [
    ['archivePath', facts.archivePath],
    ['secretPath', facts.secretPath],
  ]) {
    if (!isInsideRoot(path, facts.storeRoot)) {
      add(
        CONSERVATION_REFUSAL.PATH_OUTSIDE_DECLARED_ROOT,
        `${label} hors de storeRoot (frontière de répertoire évaluée)`
      );
    }
  }

  if (facts.modeEnforcement === 'IGNORED') {
    add(
      CONSERVATION_REFUSAL.MODE_ENFORCEMENT_ABSENT,
      `chmod appliqué sans effet : mode observé ${formatMode(facts.modeEnforcementObserved)}`
    );
  } else if (facts.modeEnforcement !== 'ENFORCED') {
    unknowns.push({
      code: CONSERVATION_REFUSAL.MODE_ENFORCEMENT_UNDETERMINED,
      detail: `sonde de mode : ${facts.modeEnforcement}`,
    });
  }

  if ((facts.secretMode & 0o077) !== 0) {
    add(
      CONSERVATION_REFUSAL.SECRET_READABLE_BY_OTHER_USERS,
      `secret en ${formatMode(facts.secretMode)} : groupe et autres ont des droits`
    );
  }

  const archiveMountPoint = facts.archiveMount?.mountPoint ?? null;
  const secretMountPoint = facts.secretMount?.mountPoint ?? null;
  if (!facts.archiveMount || !facts.secretMount) {
    unknowns.push({
      code: CONSERVATION_REFUSAL.MOUNT_TYPE_UNDETERMINED,
      detail: 'montage de l’archive ou du secret non identifié',
    });
  } else if (archiveMountPoint === secretMountPoint) {
    add(
      CONSERVATION_REFUSAL.SECRET_COLOCATED_WITH_ARCHIVE,
      `secret et archive sur le même montage ${archiveMountPoint} : une seule compromission suffit`
    );
  }

  const domains = new Set(facts.secretFactorDomains ?? []);
  if (domains.size < 2) {
    add(
      CONSERVATION_REFUSAL.SINGLE_FACTOR_SECRET,
      `custodiens distincts : ${domains.size} (${[...domains].join(', ') || 'aucun'})`
    );
  }

  if ((facts.offStoreCopiesDeclared ?? []).length === 0) {
    add(
      CONSERVATION_REFUSAL.NO_OFF_STORE_COPY,
      'aucune copie de l’archive hors du store déclarée'
    );
  }

  let verdict;
  if (reasons.length > 0) verdict = CONSERVATION_VERDICT.UNRESTRICTED;
  else if (unknowns.length > 0) verdict = CONSERVATION_VERDICT.UNDETERMINED;
  else verdict = CONSERVATION_VERDICT.RESTRICTED;

  return {
    verdict,
    reasons,
    unknowns,
    // Un verdict n'est jamais « durci » : le meilleur résultat possible reste
    // « accès restreint pour les faits mesurés », révocable par un fait nouveau.
    hardened: false,
    checkedFactCount: 6,
  };
}

function formatMode(mode) {
  return mode === null || mode === undefined ? 'inconnu' : `0o${mode.toString(8).padStart(3, '0')}`;
}

/**
 * Construit une phrase secrète à deux custodiens.
 *
 * La part `pod` peut vivre sur le pod ; la part `owner` doit être détenue hors du pod
 * (gestionnaire de mots de passe du propriétaire). Les deux sont exigées : la
 * compromission du pod seule ne déchiffre plus l'archive. Ce n'est pas une nouvelle
 * crypto — c'est la phrase d'entrée du AEAD existant, rendue insuffisante à un seul tenant.
 */
export function buildCustodiedPassphrase({ podPart, ownerPart }) {
  assertSecretPart('podPart', podPart);
  assertSecretPart('ownerPart', ownerPart);
  if (podPart.equals(ownerPart)) {
    throw new Error('CUSTODY_PARTS_IDENTICAL');
  }
  return `${podPart.toString('hex')}:${ownerPart.toString('hex')}`;
}

function assertSecretPart(label, part) {
  if (!Buffer.isBuffer(part)) throw new Error('CUSTODY_PART_NOT_BUFFER');
  if (part.length < MIN_SECRET_PART_BYTES) {
    throw new Error(`CUSTODY_PART_TOO_SHORT:${label}`);
  }
}

/** Génère une part de secret de 256 bits, à remettre à son custodian. */
export function generateSecretPart(bytes = MIN_SECRET_PART_BYTES) {
  if (!Number.isInteger(bytes) || bytes < MIN_SECRET_PART_BYTES) {
    throw new Error('CUSTODY_PART_TOO_SHORT:bytes');
  }
  return randomBytes(bytes);
}

/**
 * Procédure de conservation restreinte, dans l'ordre, avec son détenteur.
 *
 * Aucune étape n'est exécutable par l'agent sur des données réelles : la part `owner` et
 * la copie hors store supposent un humain hors du pod.
 */
export function conservationPlan() {
  return [
    {
      step: 1,
      owner: 'agent',
      action: 'Mesurer la posture réelle (mode, effet de chmod, montage, colocation).',
      proof: 'evaluateConservation rend des codes nommés, jamais un « durci » implicite.',
    },
    {
      step: 2,
      owner: 'propriétaire',
      action: 'Créer une part owner de 256 bits hors du pod et la conserver dans son gestionnaire de mots de passe.',
      proof: 'generateSecretPart(32) exécuté hors pod ; l’empreinte de la part reste hors dépôt.',
    },
    {
      step: 3,
      owner: 'propriétaire',
      action: 'Resceller l’archive avec buildCustodiedPassphrase(podPart, ownerPart) et publier le nouveau conteneur dans le coffre privé.',
      proof: 'recoverCustody --verify sur le nouveau conteneur, depuis un clone neuf.',
    },
    {
      step: 4,
      owner: 'agent',
      action: 'Vérifier que la part pod seule échoue (CUSTODY_AUTHENTICATION_FAILED).',
      proof: 'exercice sur fixture : pod seul et owner seul refusés, paire acceptée.',
    },
    {
      step: 5,
      owner: 'propriétaire',
      action: 'Déclarer une copie de l’archive hors du store (coffre privé, support hors ligne) avant toute suppression du secret local.',
      proof: 'offStoreCopiesDeclared non vide ; NO_OFF_STORE_COPY sinon.',
    },
    {
      step: 6,
      owner: 'agent',
      action: 'Rejouer la mesure et publier le verdict avec ses codes, sans jamais qualifier le store de durci.',
      proof: 'verdict UNRESTRICTED attendu tant que le store force 0666 : c’est le résultat honnête.',
    },
  ];
}

/** Liste les fichiers d'un répertoire sans jamais en lire le contenu. */
export function listEntries(directory) {
  return readdirSync(directory, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
  }));
}

/**
 * Inventaire d'un répertoire de conservation : ce qui est présent, et ce qui manque pour
 * que la mesure soit exploitable. Sert à distinguer « archive absente du pod » (fait) de
 * « archive non restreinte » (autre fait) — les confondre ferait croire à une mesure.
 */
export function inventoryConservationDirectory(directory) {
  let entries;
  try {
    entries = listEntries(directory);
  } catch (error) {
    return { readable: false, code: error?.code ?? 'UNREADABLE', entries: [] };
  }
  return {
    readable: true,
    entries,
    looksLikeVaultRoot: entries.some((e) => e.name === 'archive' && e.kind === 'directory'),
  };
}
