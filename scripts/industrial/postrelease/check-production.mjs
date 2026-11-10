// RECOVERY-200 — contrôle post-publication de maximusscpi.com (lecture seule).
// 1. Preuve de publication : le bundle JavaScript servi en production contient les marqueurs
//    du catalogue réconcilié (provenances RECOVERY-200, non-applicabilité des souscriptions).
// 2. Rendu réel des fiches (Chromium) : extraits autour des frais, dividendes et parts en attente.
import {chromium} from 'playwright';
import fs from 'node:fs';

// BASE_URL : production par défaut, ou aperçu Netlify d'une PR (deploy-preview-<n>--maximusscpi.netlify.app).
const BASE = (process.env.BASE_URL || 'https://maximusscpi.com').replace(/\/+$/, '');
const PAGES = ['perial-o2', 'primovie', 'epargne-fonciere', 'iroko-zen', 'ficommerce-proximite', 'perial-opportunites-europe', 'transitions-europe', 'selectinvest-1', 'perial-grand-paris'];
const MARKERS = [
  'Variabilité du capital suspendue : pas de souscription au marché primaire.',
  'Valeur héritée égale au coût PRIIPs du DIC',
];
// Attendus rendus sur les fiches (catalogue réconcilié RECOVERY-200, 10/11/2026).
const EXPECT = {
  'epargne-fonciere': {souscription: /9[.,]00 ?%/},
  'iroko-zen': {souscription: /0[.,]00 ?%|Sans frais de souscription/},
  'perial-opportunites-europe': {souscription: /11[.,]40 ?%/},
  'transitions-europe': {souscription: /12[.,]00 ?%/},
};
// Souscription au marché primaire fermée : aucun taux ne doit être affiché.
const NO_SUBSCRIPTION_RATE = ['perial-o2', 'primovie', 'selectinvest-1', 'perial-grand-paris'];
const report = {checked_at: new Date().toISOString(), base: BASE, bundle: {}, pages: {}, failures: []};

const homeResponse = await fetch(BASE + '/', {headers: {'user-agent': 'MaximusSCPI-PostRelease/1.0'}});
report.bundle.home_status = homeResponse.status;
if (!homeResponse.ok) {
  // Un aperçu Netlify ignoré (pas de jeton [preview]) répond 404 : ce n'est jamais un succès.
  report.failures.push(`site non servi (${homeResponse.status}) : ${BASE}/`);
  fs.mkdirSync('postrelease', {recursive: true});
  fs.writeFileSync('postrelease/REPORT.json', JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  process.exit(1);
}
const home = await homeResponse.text();
const scripts = [...home.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(m => new URL(m[1], BASE).href);
report.bundle.entry_scripts = scripts;
const found = Object.fromEntries(MARKERS.map(m => [m, false]));
const seen = new Set();
const queue = [...scripts];
while (queue.length && seen.size < 400) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  const res = await fetch(url);
  if (!res.ok) continue;
  const js = await res.text();
  for (const marker of MARKERS) if (js.includes(marker)) found[marker] = true;
  for (const m of js.matchAll(/["'`](\/?assets\/[^"'`]+?\.js)["'`]/g)) queue.push(new URL(m[1].startsWith('/') ? m[1] : '/' + m[1], BASE).href);
}
report.bundle.scripts_scanned = seen.size;
report.bundle.markers = found;
for (const [marker, ok] of Object.entries(found)) if (!ok) report.failures.push(`marqueur absent du bundle : ${marker}`);

const browser = await chromium.launch();
const page = await browser.newPage();
for (const slug of PAGES) {
  const url = `${BASE}/${slug}/`;
  const entry = {url};
  try {
    const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
    entry.status = response?.status();
    await page.waitForTimeout(2500);
    const text = (await page.innerText('body')).replace(/\s+/g, ' ');
    const grab = re => [...text.matchAll(re)].slice(0, 6).map(m => text.slice(Math.max(0, m.index - 90), m.index + 140));
    entry.souscription = grab(/frais de souscription|commission de souscription/gi);
    entry.gestion = grab(/frais de gestion|commission de gestion/gi);
    entry.parts_attente = grab(/parts? en attente/gi);
    entry.dividende = grab(/dividende|distribution par part/gi);
  } catch (error) {
    entry.error = String(error);
    report.failures.push(`${slug}: ${entry.error}`);
  }
  report.pages[slug] = entry;
  for (const [field, re] of Object.entries(EXPECT[slug] || {})) {
    if (!(entry[field] || []).some(snippet => re.test(snippet))) report.failures.push(`${slug}: ${field} attendu ${re} absent du rendu`);
  }
  if (NO_SUBSCRIPTION_RATE.includes(slug)) {
    const snippets = entry.souscription || [];
    if (snippets.some(snippet => /souscription(?:(?!gestion|retrait|cession|arbitrage)[^%]){0,40}\d+(?:[.,]\d+)? ?%|\d+(?:[.,]\d+)? ?%(?:(?!gestion|retrait|cession|arbitrage)[^%]){0,40}souscription/i.test(snippet))) {
      report.failures.push(`${slug}: un taux de souscription est affiché alors que la souscription est fermée`);
    }
    // Faux zéro rassurant : « Sans frais » / « Aucun frais » sur une souscription fermée ou non prouvée.
    if (snippets.some(snippet => /(sans|aucun) frais de souscription/i.test(snippet))) {
      report.failures.push(`${slug}: « sans frais de souscription » affiché alors que la souscription est fermée`);
    }
  }
}
await browser.close();
fs.mkdirSync('postrelease', {recursive: true});
fs.writeFileSync('postrelease/REPORT.json', JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
if (report.failures.length) process.exitCode = 1;
