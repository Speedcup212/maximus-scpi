import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const catalogPath = path.join(__dirname, '../src/data/scpi_complet.json');

const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const catalog = Array.isArray(raw) ? raw : (raw.Sheet1 || []);

const slugify = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const esc = (value='') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const managerTargets = {
  'fiducial-gerance-scpi': ['fiducial gerance'],
  'inter-gestion-reim-scpi': ['inter gestion reim', 'inter gestion'],
  'iroko-scpi': ['iroko'],
  'magellim-reim-scpi': ['magellim reim', 'magellim'],
  'norma-capital-scpi': ['norma capital'],
  'novaxia-investissement-scpi': ['novaxia investissement', 'novaxia'],
  'perial-asset-management-scpi': ['perial asset management', 'perial'],
  'remake-asset-management-scpi': ['remake asset management', 'remake'],
  'sofidy-scpi': ['sofidy']
};

const europeSlugs = new Set([
  'comete','transitions-europe','iroko-zen','iroko-atlas','remake-live',
  'epargne-pierre-europe','perial-opportunites-europe','perial-hospitalite-europe',
  'coeur-d-europe','log-in','ncap-continent','cristal-life'
]);

const targets = new Map();
for (const [pageSlug, aliases] of Object.entries(managerTargets)) {
  const matches = catalog.filter((row) => {
    const manager = normalize(row['Société de gestion']);
    return aliases.some((alias) => manager.includes(normalize(alias)));
  });
  targets.set(pageSlug, matches);
}
targets.set('scpi-europeennes', catalog.filter((row) => europeSlugs.has(slugify(row['Nom SCPI']))));

const buildSection = (pageSlug, rows) => {
  const sorted = [...rows]
    .sort((a,b) => Number(b['Capitalisation (M€)'] || 0) - Number(a['Capitalisation (M€)'] || 0))
    .slice(0, 12);

  const cards = sorted.map((row) => {
    const slug = slugify(row['Nom SCPI']);
    const td = Number(row['Taux de distribution (%)']);
    const tof = Number(row['TOF (%)']);
    const cap = Number(row['Capitalisation (M€)']);
    const metrics = [
      Number.isFinite(td) ? `<span>TD <strong>${esc(td.toFixed(2).replace(/\.00$/,''))}%</strong></span>` : '',
      Number.isFinite(tof) ? `<span>TOF <strong>${esc(tof.toFixed(2).replace(/\.00$/,''))}%</strong></span>` : '',
      Number.isFinite(cap) ? `<span>Capitalisation <strong>${esc(Math.round(cap))} M€</strong></span>` : ''
    ].filter(Boolean).join('');
    return `<article class="maximus-related-card"><h3><a href="/${slug}/">${esc(row['Nom SCPI'])}</a></h3><p>${esc(row['Société de gestion'] || '')}</p><div>${metrics}</div><a class="maximus-related-link" href="/${slug}/">Voir la fiche, le radar et la trajectoire →</a></article>`;
  }).join('');

  const heading = pageSlug === 'scpi-europeennes'
    ? 'SCPI européennes à comparer'
    : 'SCPI du gestionnaire présentes dans MaximusSCPI';
  const intro = pageSlug === 'scpi-europeennes'
    ? 'Accédez directement aux fiches détaillées pour confronter rendement, TOF, valorisation, endettement, liquidité et trajectoire.'
    : 'Ces fiches relient la société de gestion aux données opérationnelles de chaque SCPI suivie par MaximusSCPI.';

  return `<section id="maximus-related-scpi" class="maximus-related"><div class="maximus-related-inner"><p class="maximus-related-kicker">Maillage MaximusSCPI</p><h2>${heading}</h2><p class="maximus-related-intro">${intro}</p><div class="maximus-related-grid">${cards}</div></div></section><style>.maximus-related{background:#0D1117;color:#e2e8f0;padding:48px 24px;border-top:1px solid #263244}.maximus-related-inner{max-width:1180px;margin:0 auto}.maximus-related-kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800;margin:0}.maximus-related h2{color:#fff;font-size:30px;margin:8px 0 10px}.maximus-related-intro{max-width:800px;color:#aebbd0;line-height:1.65;margin:0 0 24px}.maximus-related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.maximus-related-card{border:1px solid #263244;border-radius:12px;background:#121a25;padding:17px}.maximus-related-card h3{font-size:17px;margin:0 0 5px}.maximus-related-card h3 a,.maximus-related-link{color:#6ee7b7;text-decoration:none}.maximus-related-card p{color:#94a3b8;font-size:13px;margin:0 0 11px}.maximus-related-card>div{display:flex;gap:10px;flex-wrap:wrap;color:#94a3b8;font-size:12px;margin-bottom:12px}.maximus-related-card strong{color:#fff}.maximus-related-link{font-size:13px;font-weight:700}@media(max-width:800px){.maximus-related-grid{grid-template-columns:1fr}}</style>`;
};

let enriched = 0;
let noMatch = 0;
for (const [pageSlug, rows] of targets) {
  const filePath = path.join(distDir, pageSlug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ ${pageSlug}: HTML absent, enrichissement ignoré.`);
    continue;
  }
  if (!rows.length) {
    console.warn(`⚠️ ${pageSlug}: aucune SCPI correspondante dans le catalogue actuel.`);
    noMatch++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  if (html.includes('id="maximus-related-scpi"')) continue;
  const section = buildSection(pageSlug, rows);
  const footerIndex = html.search(/<footer\b/i);
  if (footerIndex >= 0) html = html.slice(0, footerIndex) + section + html.slice(footerIndex);
  else html = html.replace('</body>', `${section}\n</body>`);
  fs.writeFileSync(filePath, html, 'utf-8');
  enriched++;
  console.log(`✅ ${pageSlug}: ${Math.min(rows.length,12)} SCPI maillées.`);
}

console.log(`✅ Maillage thématique enrichi : ${enriched} pages ; ${noMatch} sans SCPI du catalogue actuel.`);
