#!/usr/bin/env node
/**
 * Guards of `.github/workflows/isolated-netlify-restore.yml`.
 *
 * The workflow publishes an existing Netlify deploy as production. Its guards are
 * the only thing standing between a mis-typed input and a wrong publication, so
 * they are exercised here on the exact shell text taken from the YAML, with the
 * two network calls replaced by fixture reads. Nothing is deployed.
 *
 * A guard that passes on an ambiguous input is worse than no guard: the run then
 * reports success while publishing an artifact nobody identified. Hence every
 * case below asserts a *refusal* code, and the single acceptance case asserts the
 * full expected sequence.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {describe, it as test} from 'vitest';

const WORKFLOW = resolve(
  process.cwd(),
  '.github/workflows/isolated-netlify-restore.yml',
);
const SITE = 'e4f16f87-663d-4965-8de8-00f6840f1aa7';
const GOOD_SHA = '9317fb0dce9119f9fe91672819a4e73d5123df9a';
const OTHER_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const DEPLOY = '6b099179864a5b75dd01616e';

const deployMeta = (over = {}) => ({
  id: DEPLOY,
  state: 'ready',
  context: 'deploy-preview',
  branch: 'fix/home-agents-ia-20261127',
  commit_ref: GOOD_SHA,
  site_id: SITE,
  ssl_url: 'https://example.invalid',
  ...over,
});

const siteMeta = (over = {}) => ({
  id: SITE,
  name: 'maximusscpi',
  deploy_id: '6b093fce31a2c5175aa3378a',
  published_deploy: {id: '6b093fce31a2c5175aa3378a', commit_ref: '2f60880e0737d619d357c4b2941f6a463696f08e'},
  ...over,
});

/**
 * Extract the single `run:` script so the test never drifts from the YAML.
 * The block ends at the first non-blank line indented less than its body.
 */
function workflowScript() {
  const lines = readFileSync(WORKFLOW, 'utf8').split('\n');
  const start = lines.findIndex((line) => /^ {8}run: \|\s*$/.test(line));
  assert.notEqual(start, -1, 'run block not found in workflow YAML');
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '') {
      body.push('');
      continue;
    }
    const indent = line.match(/^ */)[0].length;
    if (indent < 10) break;
    body.push(line.slice(10));
  }
  assert.ok(body.length > 0, 'run block is empty');
  return body.join('\n');
}

/**
 * Rewrite every provider call to read fixtures, keyed on the `-o` target the
 * workflow writes. Matching on the output path keeps the test tied to the guard
 * sequence rather than to line wrapping, and any provider call without a known
 * target fails the test instead of quietly hitting the network.
 */
const FIXTURES = new Map([
  ['/tmp/site_before.json', 'SITE_BEFORE_FILE'],
  ['/tmp/meta.json', 'META_FILE'],
  ['/tmp/artifact_manifest.json', 'ARTIFACT_MANIFEST_FILE'],
  ['/tmp/restore.json', 'RESTORE_FILE'],
  ['/tmp/site_after.json', 'SITE_AFTER_FILE'],
  ['/tmp/live_manifest.json', 'LIVE_MANIFEST_FILE'],
]);

/**
 * The artifact manifest the production plugin writes into every production
 * build. A deploy carrying this is promotable; a preview never carries it.
 */
const artifactManifest = (over = {}) => ({
  sha: GOOD_SHA,
  deploy_id: DEPLOY,
  issuer: 'Speedcup212/maximus-scpi',
  context: 'production',
  ...over,
});

/** Exactly what the SPA fallback answers for a manifest that does not exist. */
const SPA_FALLBACK_HTML = '<!doctype html><html lang="fr"><head><title>MaximusSCPI</title></head></html>';

function localisedScript() {
  const script = workflowScript();
  const lines = script.split('\n');
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].includes('curl -fsS')) {
      index += 1;
      continue;
    }
    let end = index;
    while (end < lines.length && !/-o \/tmp\/[\w.]+\.json/.test(lines[end])) {
      if (!lines[end].endsWith('\\')) {
        assert.fail(`provider call without an -o target: ${lines[index]}`);
      }
      end += 1;
    }
    const target = lines[end].match(/-o (\/tmp\/[\w.]+\.json)/);
    assert.ok(target, `provider call without an -o target: ${lines[index]}`);
    const envName = FIXTURES.get(target[1]);
    assert.ok(envName, `unexpected provider target ${target[1]}`);
    lines.splice(index, end - index + 1, `cat "$${envName}" > ${target[1]}`);
    index += 1;
  }
  const out = lines.join('\n');
  assert.doesNotMatch(out, /api\.netlify\.com/, 'a provider call escaped localisation');
  return out;
}

function runGuards({meta, siteBefore, siteAfter, expected = GOOD_SHA, deployId = DEPLOY, manifest = artifactManifest(), liveManifest = artifactManifest()}) {
  const dir = mkdtempSync(join(tmpdir(), 'restore-guards-'));
  try {
    const write = (name, value) => {
      const file = join(dir, name);
      writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
      return file;
    };
    const scriptFile = join(dir, 'run.sh');
    writeFileSync(scriptFile, localisedScript());
    const env = {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NETLIFY_AUTH_TOKEN: 'fixture-token',
      SITE_ID: SITE,
      DEPLOY_ID: deployId,
      EXPECTED_COMMIT: expected,
      META_FILE: write('meta.json', meta),
      SITE_BEFORE_FILE: write('site_before.json', siteBefore),
      ARTIFACT_MANIFEST_FILE: write('artifact_manifest.json', manifest),
      RESTORE_FILE: write('restore.json', deployMeta()),
      SITE_AFTER_FILE: write('site_after.json', siteAfter),
      LIVE_MANIFEST_FILE: write('live_manifest.json', liveManifest),
    };
    try {
      const stdout = execFileSync('bash', [scriptFile], {env, encoding: 'utf8'});
      return {ok: true, stdout};
    } catch (error) {
      return {ok: false, stdout: `${error.stdout ?? ''}${error.stderr ?? ''}`};
    }
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
}

const expectRefusal = (result, code) => {
  assert.equal(result.ok, false, `guard accepted an input it must refuse (${code})`);
  assert.match(result.stdout, new RegExp(code), `expected ${code} in output`);
};

describe('isolated Netlify restore guards', () => {
test('accepts the real candidate 9317fb0 and reports before/after production state', () => {
  const result = runGuards({
    meta: deployMeta(),
    siteBefore: siteMeta(),
    siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
  });
  assert.equal(result.ok, true, result.stdout);
  assert.match(result.stdout, /published_deploy_before= 6b093fce31a2c5175aa3378a/);
  assert.match(result.stdout, new RegExp(`published_deploy_after= ${DEPLOY}`));
  assert.match(result.stdout, new RegExp(`published_commit_after= ${GOOD_SHA}`));
});

test('refuses a deploy whose commit_ref is absent', () => {
  for (const commitRef of [null, '', undefined]) {
    expectRefusal(
      runGuards({meta: deployMeta({commit_ref: commitRef}), siteBefore: siteMeta(), siteAfter: siteMeta({deploy_id: DEPLOY})}),
      'DEPLOY_COMMIT_ABSENT_OR_MALFORMED',
    );
  }
});

test('refuses expected_commit that is not a 40-hex SHA', () => {
  for (const expected of ['abc', '9317fb0', 'ZZZZfb0dce9119f9fe91672819a4e73d5123df9a']) {
    expectRefusal(
      runGuards({meta: deployMeta(), siteBefore: siteMeta(), siteAfter: siteMeta({deploy_id: DEPLOY}), expected}),
      'EXPECTED_COMMIT_MALFORMED',
    );
  }
});

test('refuses a deploy that belongs to another site', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta({site_id: '00000000-0000-0000-0000-000000000000'}),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
    }),
    'DEPLOY_SITE_MISMATCH',
  );
});

test('refuses when the site readback names another site', () => {
  expectRefusal(
    runGuards({meta: deployMeta(), siteBefore: siteMeta({id: 'some-other-site'}), siteAfter: siteMeta({deploy_id: DEPLOY})}),
    'SITE_ID_MISMATCH',
  );
});

test('refuses a deploy that is not ready', () => {
  for (const state of ['error', 'building', 'enqueued', 'processing']) {
    expectRefusal(
      runGuards({meta: deployMeta({state}), siteBefore: siteMeta(), siteAfter: siteMeta({deploy_id: DEPLOY})}),
      'DEPLOY_NOT_READY',
    );
  }
});

test('refuses a commit that differs from the expected one', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta({commit_ref: OTHER_SHA}),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      expected: GOOD_SHA,
    }),
    'COMMIT_MISMATCH',
  );
});

test('refuses a deploy id that is not 24 hex characters', () => {
  for (const deployId of ['not-a-deploy', '6b099179864a5b75dd01616']) {
    expectRefusal(
      runGuards({meta: deployMeta(), siteBefore: siteMeta(), siteAfter: siteMeta({deploy_id: deployId}), deployId}),
      'DEPLOY_ID_MALFORMED',
    );
  }
});

test('refuses to republish the deploy production already serves', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta({deploy_id: DEPLOY}),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
    }),
    'ALREADY_PUBLISHED',
  );
});

test('fails when production does not land on the required deploy', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: '6b093fce31a2c5175aa3378a'}),
    }),
    'PRODUCTION_NOT_ON_REQUIRED_DEPLOY',
  );
});

/**
 * The decisive case: preview #468 is a healthy, ready, correctly-committed
 * artifact that must never be promoted, because a preview build carries no
 * release manifest. These cases assert the refusal, not a tolerance.
 */
test('refuses the real preview artifact, whose manifest is the SPA fallback', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      manifest: SPA_FALLBACK_HTML,
    }),
    'ARTIFACT_MANIFEST_NOT_JSON',
  );
});

test('refuses an artifact whose manifest is absent', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      manifest: '',
    }),
    'ARTIFACT_MANIFEST_NOT_JSON',
  );
});

test('refuses a manifest that attests another commit', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      manifest: artifactManifest({sha: OTHER_SHA}),
    }),
    'ARTIFACT_MANIFEST_SHA_MISMATCH',
  );
});

test('refuses a manifest that attests another deploy', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      manifest: artifactManifest({deploy_id: '6b093fce31a2c5175aa3378a'}),
    }),
    'ARTIFACT_MANIFEST_DEPLOY_MISMATCH',
  );
});

test('refuses a manifest from another issuer', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      manifest: artifactManifest({issuer: 'someone/else'}),
    }),
    'ARTIFACT_MANIFEST_ISSUER_MISMATCH',
  );
});

test('refuses a manifest whose context is not production', () => {
  for (const context of ['deploy-preview', 'branch-deploy', 'production ']) {
    expectRefusal(
      runGuards({
        meta: deployMeta(),
        siteBefore: siteMeta(),
        siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
        manifest: artifactManifest({context}),
      }),
      'ARTIFACT_MANIFEST_CONTEXT_NOT_PRODUCTION',
    );
  }
});

test('refuses a manifest carrying no context at all', () => {
  const manifest = artifactManifest();
  delete manifest.context;
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      manifest,
    }),
    'ARTIFACT_MANIFEST_CONTEXT_NOT_PRODUCTION',
  );
});

/**
 * Publication is not done when the API says so: it is done when the public host
 * serves the manifest of the deploy just published. A live site that cannot
 * attest itself would break the next production build.
 */
test('fails when the public host serves a manifest naming another commit', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      liveManifest: artifactManifest({sha: OTHER_SHA}),
    }),
    'LIVE_MANIFEST_SHA_MISMATCH',
  );
});

test('fails when the public host serves a manifest naming another deploy', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      liveManifest: artifactManifest({deploy_id: '6b093fce31a2c5175aa3378a'}),
    }),
    'LIVE_MANIFEST_DEPLOY_MISMATCH',
  );
});

test('fails when the live manifest is the SPA fallback instead of JSON', () => {
  expectRefusal(
    runGuards({
      meta: deployMeta(),
      siteBefore: siteMeta(),
      siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
      liveManifest: SPA_FALLBACK_HTML,
    }),
    'LIVE_MANIFEST_NOT_JSON',
  );
});

test('prints the exact rollback target before touching production', () => {
  const result = runGuards({
    meta: deployMeta(),
    siteBefore: siteMeta(),
    siteAfter: siteMeta({deploy_id: DEPLOY, published_deploy: {id: DEPLOY, commit_ref: GOOD_SHA}}),
  });
  assert.equal(result.ok, true, result.stdout);
  // The deploy production served before is the only valid way back.
  assert.match(result.stdout, /ROLLBACK_TARGET= 6b093fce31a2c5175aa3378a 2f60880e0737d619d357c4b2941f6a463696f08e/);
  assert.match(result.stdout, /live_manifest_sha= 9317fb0dce9119f9fe91672819a4e73d5123df9a/);
  assert.match(result.stdout, /live_manifest_context= production/);
});
});
