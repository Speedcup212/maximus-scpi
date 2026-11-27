#!/usr/bin/env node
/**
 * Récupération autonome du coffre de custody — ne dépend d'aucun fichier ailleurs que ce dépôt.
 *
 * Usage :
 *   node recover.mjs --check                     # vérifie le chiffré + le manifeste, sans clé
 *   node recover.mjs --verify --passphrase-file <chemin>   # déchiffre et contrôle les 11 SHA
 *
 * La phrase secrète est lue depuis un FICHIER, jamais depuis un argument (elle apparaîtrait
 * dans `ps` et l'historique du shell). Elle n'est jamais imprimée.
 *
 * Codes de sortie : 0 succès, 1 échec de vérification, 2 usage invalide.
 */
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  digestOf,
  openArchive,
  openManifest,
  parseContainer,
  verifyBundleDigests,
} from './custodyArchive.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// Les artefacts vivent à la RACINE du coffre, pas à côté du script : résoudre depuis le
// parent de `tooling/`, sinon la récupération casse dès qu'elle s'exécute ailleurs qu'à
// l'endroit où le script a été écrit.
const ROOT = argv0IsToolingDir() ? resolve(HERE, '..') : HERE;
const ARCHIVE = join(ROOT, 'archive', 'maximus-rollback-evidence.tar.enc');
const MANIFEST_SEALED = join(ROOT, 'manifest.sealed.json');
const MANIFEST = join(ROOT, 'manifest.json');

function argv0IsToolingDir() {
  return basename(HERE) === 'tooling';
}

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : undefined;
};

if (!has('--check') && !has('--verify')) {
  console.error('USAGE: recover.mjs --check | --verify --passphrase-file <path>');
  process.exit(2);
}

const container = readFileSync(ARCHIVE);
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const sealed = JSON.parse(readFileSync(MANIFEST_SEALED, 'utf8'));
const results = [];
const record = (name, ok, info) => {
  results.push({ name, ok, info });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? ` — ${info}` : ''}`);
};

// Contrôles sans clé : identité de l'artefact et cohérence de forme.
const containerSha = digestOf(container);
record(
  'ciphertext-sha256',
  containerSha === manifest.container.sha256,
  `${containerSha} (${container.length} o)`
);
const parsed = parseContainer(container);
record(
  'container-parameters',
  parsed.header.cipher === 'aes-256-gcm' && parsed.header.kdf.iterations >= 210000,
  `${parsed.header.cipher}, ${parsed.header.kdf.iterations} itérations`
);
record(
  'manifest-declared-counts',
  manifest.counts.bundles === manifest.bundles.length && manifest.counts.bundles === 11,
  `${manifest.counts.bundles} bundles, ${manifest.counts.totalPlaintextBytes} o utiles`
);
record(
  'restore-not-claimed',
  manifest.restoreExercised === false,
  'restoreExercised=false (aucune restauration exercée) — attendu'
);

if (has('--check')) {
  const failed = results.filter((r) => !r.ok && r.name !== 'restore-not-claimed').length;
  console.log(`\nCHECK ${failed === 0 ? 'PASS' : 'FAIL'} (${results.length} contrôles)`);
  process.exit(failed === 0 ? 0 : 1);
}

// Voie complète : nécessite la phrase secrète.
const passphraseFile = valueOf('--passphrase-file');
if (!passphraseFile) {
  console.error('USAGE: --verify exige --passphrase-file <chemin>');
  process.exit(2);
}
const passphrase = readFileSync(passphraseFile, 'utf8').replace(/\r?\n$/, '');

const openedManifest = openManifest({ sealed, passphrase });
record(
  'manifest-seal-valid',
  openedManifest.container.sha256 === containerSha,
  `${openedManifest.counts.bundles} bundles scellés`
);

const opened = openArchive({ container, passphrase });
const work = mkdtempSync('/tmp/custody-recover-');
try {
  const tarPath = join(work, 'bundles.tar');
  writeFileSync(tarPath, opened.plaintext);
  execFileSync('tar', ['-xf', tarPath, '-C', work]);

  const observed = {};
  let total = 0;
  for (const f of readdirSync(work).filter((x) => x.endsWith('.multipart.bin'))) {
    const bytes = readFileSync(join(work, f));
    observed[f.replace(/\.multipart\.bin$/, '')] = digestOf(bytes);
    total += bytes.length;
  }
  const expected = Object.fromEntries(manifest.bundles.map((b) => [b.slug, b.sha256]));
  const verdict = verifyBundleDigests(observed, expected);
  record(
    'bundles-sha256',
    verdict.ok && verdict.matched === 11 && total === manifest.counts.totalPlaintextBytes,
    `${verdict.matched}/${verdict.expectedCount}, ${total} o, ${verdict.problems.length} problème(s)`
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\nRECOVER ${failed === 0 ? 'PASS' : 'FAIL'} (${results.length} contrôles)`);
process.exit(failed === 0 ? 0 : 1);
