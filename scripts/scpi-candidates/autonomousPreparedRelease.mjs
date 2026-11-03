// RECOVERY-073: generic fail-closed publication. No candidate is certified by this script.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const HEX40 = /^[0-9a-f]{40}$/;
const HEX24 = /^[0-9a-f]{24}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const fail = msg => { throw new Error('FAIL_CLOSED_AUTONOMOUS_RELEASE: ' + msg); };
const env = name => process.env[name] || fail('MISSING_' + name);
const slug = name => String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function validateCandidateSet(slugs, cohort, catalog) {
  if (!Array.isArray(slugs) || slugs.length < 1 || slugs.length > 5 ||
      new Set(slugs).size !== slugs.length || slugs.some(s => typeof s !== 'string' || !SLUG.test(s))) fail('INVALID_PREPARED_BATCH');
  if (!Array.isArray(cohort?.slugs) || cohort.count !== cohort.slugs.length ||
      cohort.slugs.length !== new Set(cohort.slugs).size || !Array.isArray(catalog)) fail('INVALID_PUBLIC_SOURCE_COHORT');
  for (const id of slugs) {
    if (!cohort.slugs.includes(id) || catalog.filter(row => slug(row['Nom SCPI']) === id).length !== 1) {
      fail('PREPARED_CANDIDATE_NOT_IN_EXACT_DEPLOYED_SOURCE:' + id);
    }
  }
  return true;
}

export function verifyNetlifyState(site, deploy, siteId, expectedSha) {
  if (!HEX40.test(expectedSha) || !deploy?.id || deploy.site_id !== siteId ||
      deploy.state !== 'ready' || !deploy.published_at ||
      (site?.published_deploy?.id !== deploy.id && site?.published_deploy_id !== deploy.id) ||
      !String(deploy.commit_message || '').includes(expectedSha)) fail('NETLIFY_LIVE_DEPLOY_SHA_NOT_PROVEN');
  return deploy.id;
}

async function jsonRequest(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) fail('REMOTE_REQUEST_DENIED:' + response.status + ':' + url.split('?')[0]);
  return response.json();
}

async function verifyLiveRoute(id, sha) {
  const canonical = 'https://maximusscpi.com/' + id + '/';
  const response = await fetch(canonical + '?release_sha=' + sha, {headers:{'Cache-Control':'no-cache'}, signal:AbortSignal.timeout(20000)});
  if (!response.ok) fail('PRODUCT_ROUTE_NOT_LIVE:' + id);
  const html = await response.text();
  if (!html.includes(canonical) || !/<title[ >]/i.test(html) || /<meta[^>]+noindex/i.test(html)) {
    fail('PRODUCT_ROUTE_SEO_INVALID:' + id);
  }
}

export async function run() {
  const sha = env('EXPECTED_RELEASE_SHA');
  if (!HEX40.test(sha)) fail('INVALID_RELEASE_SHA');
  const localSha = execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim();
  if (sha !== localSha) fail('CHECKOUT_SHA_MISMATCH');
  const supabaseUrl = env('SUPABASE_URL').replace(/\/$/, '');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  const headers = {apikey:serviceKey, Authorization:'Bearer ' + serviceKey, 'Content-Type':'application/json'};
  const prepared = await jsonRequest(supabaseUrl + '/rest/v1/rpc/maximus_prepared_release_slugs', {
    method:'POST', headers, body:JSON.stringify({p_sha:sha})
  });
  if (!Array.isArray(prepared)) fail('UNEXPECTED_PREPARED_RELEASE_RESPONSE');
  if (!prepared.length) { console.log('NO_CERTIFIED_PREPARED_BATCH_FOR_SHA',sha); return {status:'NO_PREPARED_BATCH'}; }
  const ids = prepared.map(x => x.scpi_slug);
  validateCandidateSet(ids,
    JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/certified_scpi_cohort.json'),'utf8')),
    JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/scpi_complet.json'),'utf8'))
  );
  const siteId = env('NETLIFY_SITE_ID');
  const netlifyAuth = {Authorization:'Bearer ' + env('NETLIFY_AUTH_TOKEN'), Accept:'application/json'};
  let liveId;
  for (let attempt=0; attempt<25; attempt++) {
    const site = await jsonRequest('https://api.netlify.com/api/v1/sites/' + encodeURIComponent(siteId), {headers:netlifyAuth});
    const id = site.published_deploy?.id || site.published_deploy_id;
    if (HEX24.test(id || '')) {
      const deploy = await jsonRequest('https://api.netlify.com/api/v1/deploys/' + id, {headers:netlifyAuth});
      if (deploy.state === 'ready' && deploy.published_at && String(deploy.commit_message || '').includes(sha)) {
        liveId = verifyNetlifyState(site, deploy, siteId, sha);
        break;
      }
    }
    if (attempt<24) await sleep(12000);
  }
  if (!liveId) fail('NO_MATCHING_NETLIFY_READY_DEPLOY');
  const sitemapResponse = await fetch('https://maximusscpi.com/sitemap.xml?release_sha=' + sha,
    {headers:{'Cache-Control':'no-cache'}, signal:AbortSignal.timeout(20000)});
  if (!sitemapResponse.ok) fail('LIVE_SITEMAP_UNAVAILABLE');
  const sitemap = await sitemapResponse.text();
  for (const id of ids) {
    if (!sitemap.includes('<loc>https://maximusscpi.com/' + id + '/</loc>')) fail('MISSING_CANONICAL_SITEMAP:' + id);
    await verifyLiveRoute(id, sha);
  }
  // DB re-checks independent QA, exact release SHA, and commits as one transaction.
  const result = await jsonRequest(supabaseUrl + '/rest/v1/rpc/maximus_publish_verified_prepared_release', {
    method:'POST', headers, body:JSON.stringify({p_release_sha:sha,p_netlify_deploy_id:liveId})
  });
  if (result?.published !== true || result.after !== result.before + ids.length ||
      ids.some(id => !result.candidate_slugs?.includes(id))) fail('ATOMIC_RELEASE_READBACK_INVALID');
  const anon = env('SUPABASE_ANON_KEY');
  const publicResponse = await jsonRequest(supabaseUrl + '/rest/v1/scpi_indicators?select=scpi_slug&scpi_slug=in.(' + ids.join(',') + ')', {
    headers:{apikey:anon,Authorization:'Bearer '+anon}
  });
  if (!Array.isArray(publicResponse) || ids.some(id => !publicResponse.some(x => x.scpi_slug === id))) {
    fail('POST_PUBLICATION_ANON_READBACK_FAILED');
  }
  console.log('AUTONOMOUS_CERTIFIED_RELEASE_VERIFIED', JSON.stringify({sha,netlify_deploy:liveId,before:result.before,after:result.after,candidates:ids}));
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch(error => { console.error(error); process.exitCode=1; });
}
