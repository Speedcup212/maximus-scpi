import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const forbiddenSegments = new Set(['.git', '.github', '.netlify', '.next', '.ssh', '.aws', '.codex', '.openai', 'node_modules', 'dist', 'build', 'coverage', 'output', 'infra', 'infrastructure', 'terraform']);
const generatedFiles = new Set(['public/sitemap.xml', 'public/robots.txt', 'public/_redirects', 'src/data/scpi_complet.json', 'src/data/scpiIndicatorHistory.json']);

function inspectPath(value) {
  if (typeof value !== 'string' || !value || value !== value.trim()) return 'invalid_path';
  if (/[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(value) || /[\\:]/.test(value) || /%(?:2e|2f|5c)/i.test(value)) return 'unsafe_path';
  if (path.posix.isAbsolute(value)) return 'absolute_path';
  const segments = value.split('/');
  if (segments.some(segment => !segment || segment === '.' || segment === '..')) return 'path_traversal';
  const lower = value.toLowerCase();
  const basename = segments.at(-1).toLowerCase();
  if (segments.some(segment => forbiddenSegments.has(segment.toLowerCase()))) return 'protected_directory';
  if (['.npmrc', '.pypirc', '.netrc', '.mcp.json'].includes(basename) || /^\.env(?:\.|$)/.test(basename) || /(?:^|[._-])(?:secrets?|credentials?|private[-_]?keys?|service[-_]?role)(?:[._-]|$)/.test(basename) || /\.(?:pem|key|p12|pfx|keystore)$/.test(basename)) return 'secret_file';
  if (generatedFiles.has(value) || /(?:\.generated\.|\.min\.(?:js|css)$|\.map$)/.test(basename)) return 'generated_artifact';
  if (/^(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|netlify\.toml|vite\.config\..+|wrangler\..+|dockerfile(?:\..+)?|docker-compose\..+)$/.test(basename) || /\.(?:tf|tfvars)$/.test(basename)) return 'infrastructure_config';
  if (/(?:^|\/|[._-])(?:payments?|billing|stripe|checkout|api[-_]?keys?)(?:\/|[._-]|$)/.test(lower) || /^keys?(?:[._-]|$)/.test(basename)) return 'payment_or_key_file';
  return null;
}

function isCandidateBranch(branch) {
  return typeof branch === 'string'
    && /^agents\/(?:autonomous|execution)(?:[-/][A-Za-z0-9._-]+)*$/.test(branch)
    && !/\.\.|\/\.|\.lock(?:\/|$)|\/$/.test(branch);
}

const isSupportDocument = file => /^(?:agents\/autonomous\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9._-]+\.md|tasks\/[A-Za-z0-9._-]+\.md)$/.test(file);

/** Exact allowlists only. Forbidden paths cannot be unblocked by an issue scope. */
export function validateChangeScope({ scope, paths, branch } = {}) {
  const violations = [];
  if (!isCandidateBranch(branch)) violations.push({ code: 'candidate_branch_required', branch: typeof branch === 'string' ? branch : null });
  const files = scope?.files;
  if (!Array.isArray(files) || files.length === 0) violations.push({ code: 'nonempty_scope_files_required' });
  if (!Array.isArray(paths) || paths.length === 0) violations.push({ code: 'nonempty_changed_paths_required' });
  const allowed = new Set();
  if (Array.isArray(files)) {
    for (const file of files) {
      const reason = inspectPath(file);
      if (reason) violations.push({ code: reason, path: file, origin: 'scope' });
      else if (/[?*\[\]{}]/.test(file)) violations.push({ code: 'exact_paths_required', path: file, origin: 'scope' });
      else allowed.add(file);
    }
  }
  if (Array.isArray(paths)) {
    for (const file of [...new Set(paths)]) {
      const reason = inspectPath(file);
      if (reason) violations.push({ code: reason, path: file, origin: 'changes' });
      else if (!allowed.has(file) && !isSupportDocument(file)) violations.push({ code: 'out_of_scope', path: file, origin: 'changes' });
    }
  }
  return { ok: violations.length === 0, branch: typeof branch === 'string' ? branch : null, checked_paths: Array.isArray(paths) ? [...new Set(paths)].length : 0, violations };
}

function parseCli(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index];
    if (!['--scope', '--paths', '--scope-json', '--paths-json', '--branch'].includes(option) || !argv[index + 1] || args[option]) throw new Error('Usage: --scope issue.json --paths changed-paths.json --branch agents/execution-name (or --scope-json / --paths-json).');
    args[option] = argv[index + 1];
  }
  if (!!args['--scope'] === !!args['--scope-json'] || !!args['--paths'] === !!args['--paths-json']) throw new Error('Provide exactly one scope input and one paths input.');
  const scope = JSON.parse(args['--scope-json'] || fs.readFileSync(args['--scope'], 'utf8'));
  const paths = JSON.parse(args['--paths-json'] || fs.readFileSync(args['--paths'], 'utf8'));
  return { scope, paths, branch: args['--branch'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = validateChangeScope(parseCli(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ ok: false, violations: [{ code: 'invalid_input', message: error.message }] })}\n`);
    process.exitCode = 1;
  }
}
