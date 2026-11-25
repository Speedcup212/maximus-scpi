/**
 * Patch « clé uniquement » pour une Edge Function dont le bundle de production diverge du
 * dépôt (cas `scpi-certified-promote` : le dépôt porte des gardes financières absentes du
 * bundle prod v12).
 *
 * Principe : on ne part JAMAIS du fichier du dépôt. On part du bundle RÉELLEMENT déployé,
 * et on n'y applique que deux transformations, strictement identiques à celles de la
 * PR #457 :
 *   1. ajout de l'import `readServiceKey` depuis `../_shared/serviceKey.ts` ;
 *   2. remplacement de la résolution directe de la clé legacy par `readServiceKey(...)`.
 *
 * Toute autre différence est un refus. Le script échoue plutôt que de produire un bundle
 * approximatif, et il rend compte, ligne par ligne, de ce qu'il a changé.
 *
 * Usages :
 *   node scripts/security/applyKeyOnlyPatch.mjs --source prod-bundle.ts --out patched.ts \
 *        [--name scpi_agents] [--report report.json]
 *   node scripts/security/applyKeyOnlyPatch.mjs --source prod-bundle.ts --diff
 *       (n'écrit rien, affiche seulement le patch prévu)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SERVICE_KEY_IMPORT = 'import { readServiceKey } from "../_shared/serviceKey.ts";';

const LEGACY_RESOLUTION = /^(\s*(?:const|let|var)\s+)([A-Za-z_$][\w$]*)\s*=\s*Deno\.env\.get\(\s*["']SUPABASE_SERVICE_ROLE_KEY["']\s*\)\s*(\|\||\?\?)\s*["']{2}\s*;?\s*$/;

export class PatchError extends Error {
  constructor(code, detail) {
    super(`${code}: ${detail}`);
    this.code = code;
    this.detail = detail;
  }
}

/** Repère la première ligne d'import pour y accrocher le nouvel import. */
function importAnchorIndex(lines) {
  let last = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*import\s/.test(lines[i]) || /^\s*import\s*\{/.test(lines[i])) last = i;
    else if (last >= 0 && lines[i].trim() !== '' && !/^\s*(import|\/\/|\/\*|\*)/.test(lines[i])) break;
  }
  return last;
}

/**
 * Applique le patch clé sur une source de bundle de production.
 * @param {string} source Contenu textuel du bundle déployé.
 * @param {{name?: string}} [options]
 */
export function applyKeyOnlyPatch(source, options = {}) {
  const name = options.name ?? 'scpi_agents';
  if (typeof source !== 'string' || source.length === 0) {
    throw new PatchError('EMPTY_SOURCE', 'bundle source vide');
  }
  const lines = source.split('\n');
  const changes = [];

  const alreadyPatched = lines.some((l) => /readServiceKey\s*\(/.test(l));
  if (alreadyPatched) {
    throw new PatchError('ALREADY_PATCHED', 'le bundle source utilise déjà readServiceKey');
  }

  const legacyIndices = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (LEGACY_RESOLUTION.test(lines[i])) legacyIndices.push(i);
  }
  if (legacyIndices.length === 0) {
    throw new PatchError(
      'LEGACY_RESOLUTION_NOT_FOUND',
      'aucune ligne de résolution directe SUPABASE_SERVICE_ROLE_KEY reconnue',
    );
  }
  if (legacyIndices.length > 1) {
    throw new PatchError(
      'AMBIGUOUS_LEGACY_RESOLUTION',
      `${legacyIndices.length} résolutions directes trouvées (lignes ${legacyIndices.map((i) => i + 1).join(', ')})`,
    );
  }

  const target = legacyIndices[0];
  const match = lines[target].match(LEGACY_RESOLUTION);
  const patchedLine = `${match[1]}${match[2]} = readServiceKey((k) => Deno.env.get(k), "${name}");`;
  changes.push({ kind: 'KEY_RESOLUTION_REPLACED', line: target + 1, before: lines[target].trim(), after: patchedLine.trim() });
  lines[target] = patchedLine;

  const hasSharedImport = lines.some((l) => /from\s+["']\.\.\/_shared\/serviceKey(\.ts)?["']/.test(l));
  if (!hasSharedImport) {
    const anchor = importAnchorIndex(lines);
    const insertAt = anchor >= 0 ? anchor + 1 : 0;
    lines.splice(insertAt, 0, SERVICE_KEY_IMPORT);
    changes.push({ kind: 'SERVICE_KEY_IMPORT_ADDED', line: insertAt + 1, after: SERVICE_KEY_IMPORT });
  }

  return { patched: lines.join('\n'), changes, name };
}

/** Vérifie que le patch n'a modifié que les deux points autorisés. */
export function assertOnlyKeyChanges(source, patched) {
  const before = source.split('\n');
  const after = patched.split('\n');
  if (after.length - before.length !== 1) {
    throw new PatchError('UNEXPECTED_LINE_DELTA', `écart de lignes inattendu : ${after.length - before.length}`);
  }
  // Retirer l'unique import ajouté pour réaligner les deux textes.
  const importPositions = after
    .map((l, i) => (l === SERVICE_KEY_IMPORT ? i : -1))
    .filter((i) => i >= 0);
  if (importPositions.length !== 1) {
    throw new PatchError('UNEXPECTED_IMPORT_COUNT', `${importPositions.length} import(s) readServiceKey inséré(s)`);
  }
  const importAt = importPositions[0];
  const realigned = after.filter((_, i) => i !== importAt);

  const touched = [{ line: importAt + 1, kind: 'INSERTED_IMPORT' }];
  for (let i = 0; i < before.length; i += 1) {
    if (before[i] === realigned[i]) continue;
    const isKeyLine = LEGACY_RESOLUTION.test(before[i]) && /readServiceKey\s*\(/.test(realigned[i]);
    if (!isKeyLine) {
      throw new PatchError('UNAUTHORIZED_EDIT', `ligne ${i + 1} modifiée hors patch clé`);
    }
    touched.push({ line: i + 1, kind: 'KEY_LINE' });
  }
  return touched;
}

function parseArgs(argv) {
  const out = { diff: false, name: 'scpi_agents' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--diff') out.diff = true;
    else if (a === '--source') out.source = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--name') out.name = argv[++i];
    else if (a === '--report') out.report = argv[++i];
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source) {
    console.error('Usage : --source <bundle prod> [--out <fichier patché>] [--diff] [--report <json>]');
    process.exit(2);
  }
  try {
    const source = readFileSync(args.source, 'utf8');
    const { patched, changes } = applyKeyOnlyPatch(source, { name: args.name });
    assertOnlyKeyChanges(source, patched);
    const report = { source: args.source, name: args.name, changes };
    if (args.report) writeFileSync(args.report, `${JSON.stringify(report, null, 2)}\n`);
    if (args.diff) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      if (!args.out) {
        console.error('--out requis hors mode --diff');
        process.exit(2);
      }
      writeFileSync(args.out, patched);
      console.log(`patch appliqué : ${changes.length} changement(s) -> ${args.out}`);
      for (const c of changes) console.log(` - ${c.kind} ligne ${c.line}`);
    }
  } catch (e) {
    console.error(e instanceof PatchError ? `refus (${e.code}) : ${e.detail}` : String(e));
    process.exit(1);
  }
}
