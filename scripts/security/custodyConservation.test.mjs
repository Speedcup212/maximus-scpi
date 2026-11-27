/**
 * Conservation à accès restreint — ces tests fixent des **faits mesurés**, pas des intentions.
 *
 * Le défaut corrigé est concret : sur le store persistant monté en FUSE, `chmod 600` sort en
 * succès et le fichier reste `0666`, lisible par tout autre uid du pod. Un contrôle qui se
 * contenterait de lire `stat().mode` après un `chmod` conclurait « restreint » à tort. Les
 * tests ci-dessous vérifient donc que :
 *
 *  1. une restriction **affichée mais non appliquée** produit `UNRESTRICTED`, jamais `RESTRICTED` ;
 *  2. la frontière de répertoire est comparée correctement (`/a/bc` n'est pas dans `/a/b`) ;
 *  3. la colocation secret/archive sur un même montage est refusée ;
 *  4. un secret à custodian unique est refusé, et la paire de parts est exigée par le AEAD réel ;
 *  5. l'absence d'information ne produit jamais un succès (`UNDETERMINED`, pas `RESTRICTED`) ;
 *  6. aucune sortie ne contient la phrase secrète.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync, chmodSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CONSERVATION_REFUSAL,
  MIN_SECRET_PART_BYTES,
  buildCustodiedPassphrase,
  conservationPlan,
  generateSecretPart,
  isInsideRoot,
  mountForPath,
  probeModeEnforcement,
  collectConservationFacts,
  evaluateConservation,
  inventoryConservationDirectory,
} from './custodyConservation.mjs';
import { sealArchive, openArchive } from './custodyArchive.mjs';

const HERE = new URL('.', import.meta.url).pathname;

const sandbox = () => mkdtempSync(join(tmpdir(), 'custody-conservation-'));

/** Faits sains, surchargés test par test : toute déviation doit apparaître. */
const healthyFacts = (over = {}) => ({
  storeRoot: '/store',
  archivePath: '/store/archive/a.tar.enc',
  secretPath: '/store/secret/OWNER.txt',
  archiveMode: 0o600,
  secretMode: 0o600,
  secretKind: 'file',
  archiveMount: { mountPoint: '/store', fstype: 'fuse.agent-store' },
  secretMount: { mountPoint: '/store/secret', fstype: 'tmpfs' },
  modeEnforcement: 'ENFORCED',
  modeEnforcementObserved: 0o600,
  offStoreCopiesDeclared: ['/off-store/a.tar.enc'],
  secretFactorDomains: ['pod', 'owner'],
  ...over,
});

test('faits sains → RESTRICTED_ACCESS, mais jamais qualifié de durci', () => {
  const report = evaluateConservation(healthyFacts());
  assert.equal(report.verdict, 'RESTRICTED_ACCESS');
  assert.deepEqual(report.reasons, []);
  assert.deepEqual(report.unknowns, []);
  assert.equal(report.hardened, false, 'aucun verdict ne doit affirmer un coffre durci');
});

test('chmod sans effet → UNRESTRICTED même si le mode lu est 0600', () => {
  // C'est le défaut réel du store FUSE : le mode affiché peut être 0600 alors que la
  // restriction n'est pas appliquée. Seul l'effet mesuré compte.
  const report = evaluateConservation(
    healthyFacts({ modeEnforcement: 'IGNORED', modeEnforcementObserved: 0o666 })
  );
  assert.equal(report.verdict, 'UNRESTRICTED');
  assert.ok(
    report.reasons.some((r) => r.code === CONSERVATION_REFUSAL.MODE_ENFORCEMENT_ABSENT),
    'le refus doit être nommé'
  );
});

test('un mode 0666 sur le secret est refusé même si chmod fonctionne', () => {
  const report = evaluateConservation(healthyFacts({ secretMode: 0o666 }));
  assert.equal(report.verdict, 'UNRESTRICTED');
  assert.ok(report.reasons.some((r) => r.code === CONSERVATION_REFUSAL.SECRET_READABLE_BY_OTHER_USERS));
});

test('secret et archive sur le même montage → colocation refusée', () => {
  const report = evaluateConservation(
    healthyFacts({
      secretMount: { mountPoint: '/store', fstype: 'fuse.agent-store' },
      secretPath: '/store/secret/OWNER.txt',
    })
  );
  assert.equal(report.verdict, 'UNRESTRICTED');
  assert.ok(report.reasons.some((r) => r.code === CONSERVATION_REFUSAL.SECRET_COLOCATED_WITH_ARCHIVE));
});

test('un secret à custodian unique est refusé', () => {
  const report = evaluateConservation(healthyFacts({ secretFactorDomains: ['pod'] }));
  assert.equal(report.verdict, 'UNRESTRICTED');
  assert.ok(report.reasons.some((r) => r.code === CONSERVATION_REFUSAL.SINGLE_FACTOR_SECRET));
});

test('aucune copie hors store → refus, une copie déclarée suffit à lever ce refus seul', () => {
  const none = evaluateConservation(healthyFacts({ offStoreCopiesDeclared: [] }));
  assert.ok(none.reasons.some((r) => r.code === CONSERVATION_REFUSAL.NO_OFF_STORE_COPY));

  const one = evaluateConservation(healthyFacts());
  assert.equal(one.reasons.some((r) => r.code === CONSERVATION_REFUSAL.NO_OFF_STORE_COPY), false);
});

test("l'incertitude ne devient jamais un succès", () => {
  const report = evaluateConservation(
    healthyFacts({ modeEnforcement: 'DENIED', modeEnforcementObserved: null })
  );
  assert.equal(report.verdict, 'UNDETERMINED');
  assert.ok(report.unknowns.some((u) => u.code === CONSERVATION_REFUSAL.MODE_ENFORCEMENT_UNDETERMINED));
  // Un refus explicite prime : secret 0666 + chmod inconnu reste UNRESTRICTED, il ne
  // « remonte » pas en UNDETERMINED sous prétexte qu'un fait manque.
  const refused = evaluateConservation(
    healthyFacts({ modeEnforcement: 'DENIED', secretMode: 0o666 })
  );
  assert.equal(refused.verdict, 'UNRESTRICTED');
  assert.deepEqual(refused.unknowns.length > 0, true, 'l’incertitude est conservée dans le rapport');
});

test('un montage non identifié produit UNDETERMINED, pas RESTRICTED', () => {
  const report = evaluateConservation(healthyFacts({ archiveMount: null }));
  assert.notEqual(report.verdict, 'RESTRICTED_ACCESS');
  assert.equal(report.verdict, 'UNDETERMINED');
});

test('la frontière de répertoire est comparée, pas préfixée naïvement', () => {
  assert.equal(isInsideRoot('/tmp/vault', '/tmp/vault'), true);
  assert.equal(isInsideRoot('/tmp/vault/a', '/tmp/vault'), true);
  assert.equal(isInsideRoot('/tmp/vault-out', '/tmp/vault'), false, '/tmp/vault-out n’est pas dans /tmp/vault');
  assert.equal(isInsideRoot('/tmp/vaultx/a', '/tmp/vault'), false);
  assert.equal(isInsideRoot('/other', '/tmp/vault'), false);

  const report = evaluateConservation(
    healthyFacts({ secretPath: '/store-evil/OWNER.txt', storeRoot: '/store' })
  );
  assert.equal(report.verdict, 'UNRESTRICTED');
  assert.ok(report.reasons.some((r) => r.code === CONSERVATION_REFUSAL.PATH_OUTSIDE_DECLARED_ROOT));
});

test('mountForPath retient le montage le plus long (le plus spécifique)', () => {
  const mountInfo = [
    '1 0 8:1 / / rw,relatime - ext4 /dev/sda1 rw',
    '2 1 0:50 / /cursor/stores rw,nosuid,nodev - fuse.agent-store agent-store rw,user_id=1000',
    '3 1 8:2 / /cursor rw,relatime - ext4 /dev/sdb1 rw',
  ].join('\n');

  assert.deepEqual(mountForPath(mountInfo, '/cursor/stores/automation'), {
    mountPoint: '/cursor/stores',
    fstype: 'fuse.agent-store',
  });
  assert.deepEqual(mountForPath(mountInfo, '/home/ubuntu'), { mountPoint: '/', fstype: 'ext4' });
  // Frontière : /cursor-stores n'est PAS sous /cursor ni sous /cursor/stores.
  assert.deepEqual(mountForPath(mountInfo, '/cursor-stores/x'), { mountPoint: '/', fstype: 'ext4' });
  assert.equal(mountForPath('', '/x'), null);
});

test('probeModeEnforcement mesure un effet réel sur ext4, et laisse le répertoire propre', () => {
  const dir = sandbox();
  try {
    const probe = probeModeEnforcement(dir);
    assert.equal(probe.status, 'ENFORCED');
    assert.equal(probe.observedMode, 0o600);
    // Aucun fichier sonde ne doit rester : un probe oublié est une fuite de bruit.
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('collectConservationFacts ne lit jamais le contenu du secret (FIFO non bloquant)', () => {
  const dir = sandbox();
  try {
    const archive = join(dir, 'a.tar.enc');
    const secret = join(dir, 'secret.txt');
    writeFileSync(archive, 'x');
    writeFileSync(secret, 'ne-pas-lire-ceci\n');
    chmodSync(secret, 0o600);

    const facts = collectConservationFacts({
      storeRoot: dir,
      archivePath: archive,
      secretPath: secret,
      offStoreCopies: [],
    });
    assert.equal(facts.secretMode, 0o600);
    assert.equal(facts.secretKind, 'file');
    assert.equal(JSON.stringify(facts).includes('ne-pas-lire-ceci'), false, 'aucun contenu ne doit fuir');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('la phrase à deux custodiens exige deux parts distinctes de 256 bits', () => {
  const pod = generateSecretPart();
  const owner = generateSecretPart();
  assert.equal(pod.length, MIN_SECRET_PART_BYTES);

  const passphrase = buildCustodiedPassphrase({ podPart: pod, ownerPart: owner });
  assert.equal(passphrase.includes(pod.toString('hex')), true);
  assert.equal(passphrase.includes(owner.toString('hex')), true);

  assert.throws(() => buildCustodiedPassphrase({ podPart: pod, ownerPart: pod }), /CUSTODY_PARTS_IDENTICAL/);
  assert.throws(
    () => buildCustodiedPassphrase({ podPart: pod.subarray(0, 16), ownerPart: owner }),
    /CUSTODY_PART_TOO_SHORT/
  );
  assert.throws(() => generateSecretPart(16), /CUSTODY_PART_TOO_SHORT/);
});

test('AEAD réel : pod seul et owner seul échouent, la paire réussit', () => {
  // Ce n'est pas une simulation : c'est le chiffrement que `recoverCustody` utilise.
  // La propriété « compromission du pod insuffisante » est ainsi prouvée, pas espérée.
  const pod = generateSecretPart();
  const owner = generateSecretPart();
  const plaintext = Buffer.from('archive-de-test-non-sensible', 'utf8');
  const passphrase = buildCustodiedPassphrase({ podPart: pod, ownerPart: owner });

  const { container } = sealArchive({
    plaintext,
    passphrase,
    header: { purpose: 'test-conservation', bundleCount: 1 },
    iterations: 210000,
  });

  const onlyPod = buildCustodiedPassphrase({ podPart: pod, ownerPart: generateSecretPart() });
  const onlyOwner = buildCustodiedPassphrase({ podPart: generateSecretPart(), ownerPart: owner });

  assert.throws(() => openArchive({ container, passphrase: onlyPod }), /CUSTODY_AUTHENTICATION_FAILED/);
  assert.throws(() => openArchive({ container, passphrase: onlyOwner }), /CUSTODY_AUTHENTICATION_FAILED/);
  assert.ok(openArchive({ container, passphrase }).plaintext.equals(plaintext));
});

test('le plan de conservation n’exécute rien et nomme le propriétaire pour toute part hors pod', () => {
  const plan = conservationPlan();
  assert.ok(plan.length >= 5);
  const ownerSteps = plan.filter((s) => s.owner === 'propriétaire');
  assert.ok(ownerSteps.length >= 2, 'la part hors pod et la copie hors store appartiennent au propriétaire');
  for (const step of plan) {
    assert.ok(step.proof, `l’étape ${step.step} doit nommer sa preuve`);
    assert.equal(typeof step.action, 'string');
  }
});

test('la CLI rend un verdict et ne divulgue jamais le secret', () => {
  const dir = sandbox();
  try {
    const archive = join(dir, 'a.tar.enc');
    const secret = join(dir, 'p.txt');
    const marker = 'marqueur-secret-a-ne-jamais-afficher';
    writeFileSync(archive, 'x');
    writeFileSync(secret, marker);
    chmodSync(secret, 0o600);

    let out = '';
    let code = 0;
    try {
      out = execFileSync(
        'node',
        [join(HERE, 'auditCustodyConservation.mjs'), '--store-root', dir, '--archive', archive, '--secret', secret, '--json'],
        { encoding: 'utf8' }
      );
    } catch (error) {
      out = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      code = error.status;
    }
    assert.equal(code, 1, 'un store non restreint doit sortir en 1');
    const report = JSON.parse(out);
    assert.equal(report.report.verdict, 'UNRESTRICTED');
    assert.equal(out.includes(marker), false, 'la CLI ne doit jamais imprimer le secret');
    assert.equal(out.includes(dir), true, 'les chemins mesurés restent cités');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('la CLI refuse de s’exécuter sans chemins plutôt que de deviner', () => {
  assert.throws(
    () => execFileSync('node', [join(HERE, 'auditCustodyConservation.mjs')], { encoding: 'utf8', stdio: 'pipe' }),
    (error) => error.status === 2
  );
});

test('inventoryConservationDirectory distingue « absent » de « non restreint »', () => {
  const dir = sandbox();
  try {
    const empty = inventoryConservationDirectory(dir);
    assert.equal(empty.readable, true);
    assert.equal(empty.looksLikeVaultRoot, false);

    const missing = inventoryConservationDirectory(join(dir, 'inexistant'));
    assert.equal(missing.readable, false);
    assert.equal(missing.code, 'ENOENT');

    // Un répertoire qui ressemble à la racine d'un coffre est reconnu comme tel.
    mkdirSync(join(dir, 'archive'));
    writeFileSync(join(dir, 'manifest.json'), '{}');
    const vaultLike = inventoryConservationDirectory(dir);
    assert.equal(vaultLike.looksLikeVaultRoot, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('aucun test ne contient de phrase secrète réelle du coffre', () => {
  const source = readFileSync(new URL(import.meta.url), 'utf8');
  // La chaîne recherchée est assemblée pour que ce test ne se détecte pas lui-même.
  const passphraseFileName = ['OWNER', 'PASSPHRASE'].join('_');
  assert.equal(source.includes(`custody/${passphraseFileName}`), false);
  assert.equal(/[0-9a-f]{64}/.test(source), false, 'aucune empreinte de 64 caractères ne doit être figée ici');
});
