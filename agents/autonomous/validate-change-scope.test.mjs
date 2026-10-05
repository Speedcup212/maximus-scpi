import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateChangeScope } from './validate-change-scope.mjs';

const branch = 'agents/autonomous-control-20261005';
const file = 'src/components/ScpiDetailPage.tsx';
const run = paths => validateChangeScope({ branch, scope: { files: [file] }, paths });

test('Exact approved product paths and bounded support docs pass on candidate branches', () => {
  assert.equal(run([file, 'tasks/in-progress.md', 'agents/autonomous/reports/execution-seo.md']).ok, true);
  assert.equal(validateChangeScope({ branch: 'agents/execution/seo', scope: { files: [file] }, paths: [file] }).ok, true);
  assert.equal(run([file, file]).checked_paths, 1);
});

test('Directory prefixes and glob scopes do not authorize adjacent or nested files', () => {
  assert.equal(run(['src/components/ScpiDetailPage.test.tsx']).ok, false);
  assert.equal(run(['agents/autonomous/bootstrap.sql']).ok, false);
  for (const wildcard of ['src/components/*', 'src/**', 'src/{one,two}.ts']) assert.equal(validateChangeScope({ branch, scope: { files: [wildcard] }, paths: [file] }).ok, false);
});

test('Traversal, absolute paths, disguised paths and unsafe control characters fail even if scoped', () => {
  for (const unsafe of ['/etc/passwd', '../src/file.ts', './src/file.ts', 'src/../file.ts', 'src//file.ts', 'C:\\secret.key', 'src\\file.ts', 'src/%2e%2e/file.ts', ' src/file.ts', 'src/file.ts\n', 'src/\u202efile.ts', '']) {
    assert.equal(validateChangeScope({ branch, scope: { files: [unsafe] }, paths: [unsafe] }).ok, false, unsafe);
  }
});

test('Secrets, infrastructure, payment code and generated artifacts cannot be approved through issue scope', () => {
  for (const protectedPath of ['.env', '.env.production', '.npmrc', '.netrc', '.aws/credentials', '.openai/hosting.json', 'src/service_role.json', 'private-key.pem', 'src/keys.json', 'package.json', 'package-lock.json', 'netlify.toml', 'vite.config.ts', '.github/workflows/deploy.yml', 'infra/main.tf', 'src/payments/charge.ts', 'netlify/functions/create-checkout.ts', 'src/api-key.ts', 'dist/index.html', 'public/sitemap.xml', 'src/data/scpiIndicatorHistory.json', 'src/file.generated.ts']) {
    assert.equal(validateChangeScope({ branch, scope: { files: [protectedPath] }, paths: [protectedPath] }).ok, false, protectedPath);
  }
});

test('Missing inputs, production branches and malicious ref names fail closed', () => {
  for (const forbidden of [undefined, 'main', 'production', 'feature/seo', 'agents/autonomous/../main', 'agents/execution/.secret', 'agents/execution/foo.lock', 'agents/execution/foo:bar']) assert.equal(validateChangeScope({ branch: forbidden, scope: { files: [file] }, paths: [file] }).ok, false);
  assert.equal(validateChangeScope({ branch, scope: {}, paths: [file] }).ok, false);
  assert.equal(validateChangeScope({ branch, scope: { files: [file] }, paths: [] }).ok, false);
  assert.equal(validateChangeScope({ branch, scope: { files: [] }, paths: [file] }).ok, false);
});

test('CLI validates file-backed JSON and exits nonzero on rejected paths or malformed inputs', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'maximus-scope-'));
  const cli = fileURLToPath(new URL('./validate-change-scope.mjs', import.meta.url));
  try {
    const scope = path.join(folder, 'scope.json');
    const paths = path.join(folder, 'paths.json');
    fs.writeFileSync(scope, JSON.stringify({ files: [file] }));
    fs.writeFileSync(paths, JSON.stringify([file]));
    const args = ['--scope', scope, '--paths', paths, '--branch', branch];
    const accepted = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.equal(accepted.status, 0);
    assert.equal(JSON.parse(accepted.stdout).ok, true);
    fs.writeFileSync(paths, JSON.stringify(['src/not-approved.ts']));
    const rejected = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.equal(rejected.status, 1);
    assert.equal(JSON.parse(rejected.stdout).violations[0].code, 'out_of_scope');
    fs.writeFileSync(paths, '{malformed');
    const malformed = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.equal(malformed.status, 1);
    assert.equal(JSON.parse(malformed.stdout).violations[0].code, 'invalid_input');
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});
