// RECOVERY-200 — contrôle post-publication de maximusscpi.com (lecture seule).
// 1. Preuve de publication : le bundle JavaScript servi en production contient les marqueurs
//    du catalogue réconcilié (provenances RECOVERY-200, non-applicabilité des souscriptions).
// 2. Rendu réel des fiches (Chromium) : extraits autour des frais, dividendes et parts en attente.
import {chromium} from 'playwright';
import fs from 'node:fs';

const BASE = 'https://maximusscpi.com';
const PAGES = ['perial-o2', 'primovie', 'epargne-fonciere', 'iroko-zen', 'ficommerce-proximite', 'perial-opportunites-europe', 'transitions-europe'];
const MARKERS = [
  'Variabilité du capital suspendue : pas de souscription au marché primaire.',
  'review_pass_2026-11-10',
  'Valeur héritée égale au coût PRIIPs du DIC',
];
const report = {checked_at: new Date().toISOString(), base: BASE, bundle: {}, pages: {}, failures: []};

const home = await (await fetch(BASE + '/', {headers: {'user-agent': 'MaximusSCPI-PostRelease/1.0'}})).text();
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
}
await browser.close();
fs.mkdirSync('postrelease', {recursive: true});
fs.writeFileSync('postrelease/REPORT.json', JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
if (report.failures.length) process.exitCode = 1;
