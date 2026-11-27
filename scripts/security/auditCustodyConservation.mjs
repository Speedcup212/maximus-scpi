#!/usr/bin/env node
/**
 * Mesure la conservation d'une archive de custody et rend un verdict **sans qualificatif rassurant**.
 *
 * Usage :
 *   node scripts/security/auditCustodyConservation.mjs \
 *     --store-root <dir> --archive <chemin.tar.enc> --secret <chemin> \
 *     [--off-store-copy <chemin>]... [--json]
 *
 * Ne lit jamais le contenu du secret : `stat` seulement. Aucun réseau, aucune variable
 * d'environnement, aucun fichier écrit. Sortie 0 si `RESTRICTED_ACCESS`, 1 sinon — un
 * verdict non restreint n'est pas un incident, c'est un fait à rapporter.
 */
import { resolve } from 'node:path';
import {
  collectConservationFacts,
  evaluateConservation,
} from './custodyConservation.mjs';

const argv = process.argv.slice(2);
const valuesOf = (flag) =>
  argv.reduce((acc, arg, i) => (arg === flag && argv[i + 1] ? [...acc, argv[i + 1]] : acc), []);
const valueOf = (flag) => valuesOf(flag)[0];

const storeRoot = valueOf('--store-root');
const archivePath = valueOf('--archive');
const secretPath = valueOf('--secret');

if (!storeRoot || !archivePath || !secretPath) {
  console.error(
    'USAGE: auditCustodyConservation.mjs --store-root <dir> --archive <file> --secret <file> [--off-store-copy <file>]... [--json]'
  );
  process.exit(2);
}

let facts;
try {
  facts = collectConservationFacts({
    storeRoot: resolve(storeRoot),
    archivePath: resolve(archivePath),
    secretPath: resolve(secretPath),
    offStoreCopies: valuesOf('--off-store-copy'),
  });
} catch (error) {
  console.error(`ERREUR: ${error?.message ?? error}`);
  process.exit(2);
}

const report = evaluateConservation(facts);

if (argv.includes('--json')) {
  console.log(JSON.stringify({ facts: summarise(facts), report }, null, 2));
} else {
  console.log(`verdict              ${report.verdict}`);
  console.log(`store                ${facts.storeRoot}`);
  console.log(`archive              ${describe(facts.archivePath, facts.archiveMode, facts.archiveMount)}`);
  console.log(`secret               ${describe(facts.secretPath, facts.secretMode, facts.secretMount)}`);
  console.log(`application chmod    ${facts.modeEnforcement} (observé ${facts.modeEnforcementObserved ?? 'n/a'})`);
  console.log(`custodiens du secret ${(facts.secretFactorDomains ?? []).join(', ') || 'aucun'}`);
  console.log(`copies hors store    ${facts.offStoreCopiesDeclared.length}`);
  console.log(`durci                ${report.hardened ? 'oui' : 'non (aucun verdict ne l’affirme)'}`);
  for (const r of report.reasons) console.log(`REFUS ${r.code} — ${r.detail}`);
  for (const u of report.unknowns) console.log(`INCONNU ${u.code} — ${u.detail}`);
}

process.exit(report.verdict === 'RESTRICTED_ACCESS' ? 0 : 1);

function describe(path, mode, mount) {
  return `${path} (${mode === undefined ? '?' : `0o${mode.toString(8).padStart(3, '0')}`}, ${
    mount ? `${mount.fstype} sur ${mount.mountPoint}` : 'montage inconnu'
  })`;
}

function summarise(f) {
  return {
    storeRoot: f.storeRoot,
    archiveMode: f.archiveMode,
    secretMode: f.secretMode,
    archiveMount: f.archiveMount,
    secretMount: f.secretMount,
    modeEnforcement: f.modeEnforcement,
    modeEnforcementObserved: f.modeEnforcementObserved,
    offStoreCopiesDeclared: f.offStoreCopiesDeclared.length,
    secretFactorDomains: f.secretFactorDomains,
  };
}
