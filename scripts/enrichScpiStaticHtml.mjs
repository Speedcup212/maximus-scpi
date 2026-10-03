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

const esc = (value='') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const firstValue = (row, keys) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return null;
};
const firstNumber = (row, keys) => {
  const value = firstValue(row, keys);
  if (value === null) return null;
  const number = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(number) ? number : null;
};
const fmt = (number, digits=2) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(number);
const truncate = (value, max=650) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
};

let enriched = 0;
let withWarnings = 0;
let withHistorySignals = 0;

for (const row of catalog) {
  const name = String(row['Nom SCPI'] || '').trim();
  if (!name) continue;
  const slug = slugify(name);
  const filePath = path.join(distDir, slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fiche SCPI statique absente : ${slug}`);
    process.exit(1);
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  if (html.includes('id="scpi-static-dashboard"')) continue;

  const tof = firstNumber(row, ['TOF (%)', "Taux d'occupation financier (%)", 'Taux_d_occupation_financier (%)']);
  const walt = firstNumber(row, ['WALT', 'WALT (ans)']);
  const walb = firstNumber(row, ['WALB', 'WALB (ans)']);
  const debt = firstNumber(row, ['Endettement (%)', "Taux d'endettement (%)", 'Endettement']);
  const discount = firstNumber(row, ['Surcote/décote (%)', 'Décote/surcote (%)']);
  const reconstitution = firstNumber(row, ['Valeur de reconstitution (€)', 'Valeur de reconstitution par part (€)']);
  const withdrawal = firstNumber(row, ['Valeur de retrait (€)', 'Prix de retrait (€)']);
  const waiting = firstNumber(row, ['Parts en attente de retrait', 'Nombre de parts en attente de retrait']);
  const fees = firstNumber(row, ['Frais de souscription (TTC/%)', 'Frais de souscription (%)']);
  const delay = firstNumber(row, ['Délai de jouissance (mois)', 'Delai de jouissance (mois)']);
  const buildings = firstNumber(row, ["Nombre d'immeubles", 'Nombre_d_actifs', "Nombre d'actifs"]);
  const tenants = firstNumber(row, ['Nombre de locataires', 'Nombre_de_locataires', 'nb_locataires']);
  const period = firstValue(row, ['Période bulletin trimestriel', 'maximus_source_periode']);
  const bulletinDate = firstValue(row, ['Date bulletin', 'maximus_source_date']);
  const confidence = firstNumber(row, ['maximus_confidence_score']);
  const actuality = firstValue(row, ['Actualités trimestrielles']);
  const warnings = Array.isArray(row.maximus_warnings)
    ? row.maximus_warnings.map((warning) => String(warning || '').trim()).filter(Boolean).slice(0, 4)
    : [];

  const cards = [
    tof !== null ? ['TOF', `${fmt(tof)} %`, 'Occupation financière publiée'] : null,
    walt !== null ? ['WALT', `${fmt(walt)} ans`, 'Durée résiduelle moyenne des baux'] : null,
    walb !== null ? ['WALB', `${fmt(walb)} ans`, 'Durée moyenne avant prochaine rupture'] : null,
    debt !== null ? ['Endettement', `${fmt(debt)} %`, 'Levier financier publié'] : null,
    discount !== null ? [discount < 0 ? 'Décote' : 'Surcote', `${fmt(Math.abs(discount))} %`, 'Écart prix / valeur de reconstitution'] : null,
    reconstitution !== null ? ['Valeur de reconstitution', `${fmt(reconstitution)} €`, 'Par part'] : null,
    withdrawal !== null ? ['Valeur / prix de retrait', `${fmt(withdrawal)} €`, 'Repère de sortie si applicable'] : null,
    waiting !== null ? ['Parts en attente', fmt(waiting, 0), 'Demandes de retrait déclarées'] : null,
    fees !== null ? ['Frais de souscription', `${fmt(fees)} %`, 'Taux publié'] : null,
    delay !== null ? ['Délai de jouissance', `${fmt(delay)} mois`, 'Avant première distribution'] : null,
    buildings !== null ? ['Actifs immobiliers', fmt(buildings, 0), 'Nombre publié'] : null,
    tenants !== null ? ['Locataires', fmt(tenants, 0), 'Diversification locative'] : null
  ].filter(Boolean).slice(0, 9);

  const cardsHtml = cards.map(([label, value, note]) => `<article class="static-tech-card"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`).join('');
  const warningHtml = warnings.length
    ? `<section class="static-vigilance"><h3>Vigilances documentées</h3><ul>${warnings.map((warning) => `<li>${esc(warning)}</li>`).join('')}</ul></section>`
    : `<section class="static-vigilance static-vigilance-neutral"><h3>Lecture des vigilances</h3><p>Aucune alerte structurée n’est exposée dans ce snapshot. Cela ne signifie pas absence de risque : la trajectoire et les documents récents restent déterminants.</p></section>`;

  if (warnings.length) withWarnings++;
  if (waiting !== null || tof !== null || debt !== null || discount !== null) withHistorySignals++;

  const sourceBits = [
    period ? `Période : ${period}` : null,
    bulletinDate ? `Document daté : ${bulletinDate}` : null,
    confidence !== null ? `Confiance donnée : ${Math.round(confidence * 100)} %` : null
  ].filter(Boolean);

  const section = `<section id="scpi-static-dashboard" class="static-tech" aria-label="Tableau de bord technique SCPI"><div class="static-tech-inner"><p class="static-tech-kicker">Tableau de bord technique</p><h2>Indicateurs à lire sur ${esc(name)}</h2><p class="static-tech-intro">Ces données complètent le rendement affiché. Elles permettent de lire occupation, durée des baux, valorisation, dette et liquidité avant d’interpréter la trajectoire.</p><div class="static-tech-grid">${cardsHtml}</div>${warningHtml}${actuality ? `<section class="static-quarterly"><h3>Actualité trimestrielle documentée</h3><p>${esc(truncate(actuality))}</p></section>` : ''}<div class="static-tech-footer">${sourceBits.length ? `<p>${sourceBits.map(esc).join(' · ')}</p>` : ''}<p><a href="/methodologie-donnees-scpi/">Méthodologie des données</a> · <a href="/comparateur-scpi/">Comparer cette SCPI</a></p></div></div></section><style>.static-tech{background:#0f172a;color:#e2e8f0;padding:44px 24px;border-top:1px solid #263244;border-bottom:1px solid #263244}.static-tech-inner{max-width:1180px;margin:0 auto}.static-tech-kicker{margin:0;color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.static-tech h2{margin:8px 0 8px;color:#fff;font-size:30px;line-height:1.15}.static-tech-intro{max-width:820px;margin:0 0 24px;color:#aebbd0;line-height:1.65}.static-tech-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.static-tech-card{background:#121a25;border:1px solid #263244;border-radius:12px;padding:15px}.static-tech-card span,.static-tech-card small{display:block;color:#94a3b8}.static-tech-card span{font-size:12px;font-weight:700;margin-bottom:6px}.static-tech-card strong{display:block;color:#fff;font-size:21px;margin-bottom:4px}.static-tech-card small{font-size:11px;line-height:1.4}.static-vigilance,.static-quarterly{margin-top:20px;border:1px solid #334155;border-radius:12px;padding:18px;background:#111827}.static-vigilance h3,.static-quarterly h3{margin:0 0 10px;color:#fff;font-size:18px}.static-vigilance ul{margin:0;padding-left:20px;color:#cbd5e1}.static-vigilance li{margin:6px 0;line-height:1.55}.static-vigilance p,.static-quarterly p{margin:0;color:#cbd5e1;line-height:1.65}.static-vigilance-neutral{border-color:#263244}.static-tech-footer{margin-top:18px;color:#94a3b8;font-size:12px;line-height:1.6}.static-tech-footer p{margin:4px 0}.static-tech-footer a{color:#6ee7b7;text-decoration:none;font-weight:700}@media(max-width:800px){.static-tech-grid{grid-template-columns:1fr}.static-tech h2{font-size:26px}}</style>`;

  const rootStart = html.indexOf('<div id="root">');
  const mainEnd = html.indexOf('</main>', rootStart);
  if (rootStart === -1 || mainEnd === -1) {
    console.error(`❌ Structure fiche SCPI inattendue : ${slug}`);
    process.exit(1);
  }
  const insertAt = mainEnd + '</main>'.length;
  html = html.slice(0, insertAt) + section + html.slice(insertAt);
  fs.writeFileSync(filePath, html, 'utf-8');
  enriched++;
}

const expected = catalog.filter((row) => String(row['Nom SCPI'] || '').trim()).length;
if (enriched !== expected) {
  console.error(`❌ Enrichissement SCPI incomplet : ${enriched}/${expected}`);
  process.exit(1);
}
console.log(`✅ Fiches SCPI statiques enrichies : ${enriched}/${expected} ; ${withWarnings} avec vigilances documentées ; ${withHistorySignals} avec indicateurs de trajectoire/liquidité.`);
