#!/usr/bin/env node
/**
 * Isolated production publish for PR #468 (home agents IA badge).
 * Publishes ONLY tree SHA 9317fb0 without deploying main tip.
 *
 * Preferred circuit when preview is READY:
 *   POST /sites/{site_id}/deploys/{deploy_id}/restore
 * Fallback: local build of exact SHA + netlify deploy --prod --dir=dist
 * with scpi-release-manifest.json preserved/rewritten for the new deploy.
 *
 * Requires NETLIFY_AUTH_TOKEN (env) or an authenticated Netlify CLI session.
 */
import { execFileSync, execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const SITE_ID = process.env.NETLIFY_SITE_ID || 'e4f16f87-663d-4965-8de8-00f6840f1aa7';
const TARGET_SHA = process.env.TARGET_SHA || '9317fb0dce9119f9fe91672819a4e73d5123df9a';
const PARENT_SHA = process.env.PARENT_SHA || '2f60880e0737d619d357c4b2941f6a463696f08e';
const PREVIEW_DEPLOY_ID = process.env.PREVIEW_DEPLOY_ID || '6b099179864a5b75dd01616e';
const ROLLBACK_DEPLOY_ID = process.env.ROLLBACK_DEPLOY_ID || '6b093fce31a2c5175aa3378a';
const MODE = process.env.PUBLISH_MODE || 'restore-preview'; // restore-preview | cli-prod
const REPO = 'Speedcup212/maximus-scpi';
const DRY = process.env.DRY_RUN === '1';

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

function authHeaders() {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error('NETLIFY_AUTH_TOKEN missing');
  return { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' };
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://api.netlify.com/api/v1${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 500) }; }
  if (!res.ok) throw new Error(`Netlify API ${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

function assertIsolation() {
  const head = sh('git rev-parse HEAD');
  if (head !== TARGET_SHA) throw new Error(`HEAD ${head} ≠ TARGET_SHA ${TARGET_SHA}`);
  const stat = sh(`git diff --stat ${PARENT_SHA}..${TARGET_SHA}`);
  if (!/index\.html/.test(stat) || !/src\/HomeApp\.tsx/.test(stat)) {
    throw new Error('Diff does not include expected files:\n' + stat);
  }
  const files = sh(`git diff --name-only ${PARENT_SHA}..${TARGET_SHA}`).split('\n').filter(Boolean);
  if (files.length !== 2 || !files.includes('index.html') || !files.includes('src/HomeApp.tsx')) {
    throw new Error('Isolation breach — unexpected files: ' + files.join(', '));
  }
  console.log('[ok] isolation', { head, files, stat: stat.replace(/\n/g, ' | ') });
}

async function restorePreview() {
  console.log('[publish] restoring preview deploy to production', PREVIEW_DEPLOY_ID);
  if (DRY) return { mode: 'restore-preview', dry: true, deploy_id: PREVIEW_DEPLOY_ID };
  const restored = await api(`/sites/${SITE_ID}/deploys/${PREVIEW_DEPLOY_ID}/restore`, { method: 'POST' });
  return { mode: 'restore-preview', deploy: restored };
}

async function cliProdPublish() {
  console.log('[publish] building local tree and deploying --prod');
  sh('npm run build', { stdio: 'inherit' });
  // Preserve attestation surface: write release manifest for this SHA.
  // Deploy ID is unknown pre-upload; Netlify CLI prints it — we rewrite after first draft if needed.
  const distManifest = join(process.cwd(), 'dist', 'scpi-release-manifest.json');
  const provisional = {
    sha: TARGET_SHA,
    deploy_id: 'pending',
    issuer: REPO,
    context: 'production',
    isolated_from: PARENT_SHA,
    note: 'Isolated CLI publish of PR #468; not a main tip deploy',
  };
  writeFileSync(distManifest, JSON.stringify(provisional));
  if (DRY) return { mode: 'cli-prod', dry: true };
  const out = sh(`npx --yes netlify-cli deploy --prod --dir=dist --site=${SITE_ID} --message="isolated PR#468 ${TARGET_SHA}"`, { stdio: 'pipe' });
  console.log(out);
  const m = out.match(/Unique Deploy URL:.*\n|Deploy ID:\s*([a-f0-9]+)|https:\/\/([a-f0-9]+)--maximusscpi/i);
  return { mode: 'cli-prod', output: out.slice(0, 2000), match: m && m[0] };
}

async function verifyLive(deployIdHint) {
  const bust = `?v=${Date.now()}`;
  const html = await (await fetch('https://maximusscpi.com/' + bust, { headers: { 'Cache-Control': 'no-cache' } })).text();
  const badge = html.includes('Données contrôlées par nos agents IA');
  const sub = html.includes('Sources officielles') && html.includes('Vérification') && html.includes('Traçabilité');
  const site = await api(`/sites/${SITE_ID}`);
  const published = site.published_deploy || {};
  console.log('[verify]', {
    badge, sub,
    published_deploy_id: published.id,
    published_commit: published.commit_ref,
    hint: deployIdHint,
    rollback: ROLLBACK_DEPLOY_ID,
  });
  if (!badge || !sub) throw new Error('Production HTML missing badge texts');
  return { badge, sub, published };
}

async function main() {
  assertIsolation();
  let result;
  if (MODE === 'restore-preview') result = await restorePreview();
  else if (MODE === 'cli-prod') result = await cliProdPublish();
  else throw new Error('Unknown PUBLISH_MODE ' + MODE);
  if (!DRY) {
    // brief CDN settle
    await new Promise(r => setTimeout(r, 5000));
    const verification = await verifyLive(result.deploy?.id || PREVIEW_DEPLOY_ID);
    result.verification = verification;
  }
  console.log(JSON.stringify({ ok: true, target_sha: TARGET_SHA, rollback: ROLLBACK_DEPLOY_ID, result }, null, 2));
}

main().catch((e) => {
  console.error('[FAIL]', e.message || e);
  process.exit(1);
});
