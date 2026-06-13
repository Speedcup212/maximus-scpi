/**
 * SCPI Investment News Watcher
 *
 * Agent de veille des acquisitions immobilières des SCPI.
 * Exécution : npx tsx scripts/scpi-investment-news-watcher.ts
 *
 * Récupère les actualités d'investissement depuis les sources configurées,
 * les classifie et génère :
 *   - data/news/scpi-investment-news-latest.json
 *   - data/news/scpi-investment-news-history.json
 *   - reports/SCPI_INVESTMENT_NEWS_REPORT_YYYY-MM-DD.md
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Types inline (évite dépendance au build Vite) ──────────────────────────
type OperationType = 'acquisition' | 'acquisition_portefeuille' | 'acquisition_vefa' | 'extension_patrimoine';
type AssetType = 'bureaux' | 'commerce' | 'logistique' | 'sante' | 'education' | 'hotellerie' | 'residentiel_gere' | 'locaux_activite' | 'mixte' | 'portefeuille_multi_actifs' | 'autre_immobilier';
type DataQuality = 'complete' | 'standard' | 'partial' | 'weak';
type EditorialPriority = 0 | 1 | 2 | 3;

interface InvestmentNewsItem {
  id?: string;
  scpi: string;
  managementCompany: string;
  operationType: OperationType;
  assetType: AssetType;
  country: string;
  city: string;
  area: string;
  address: string;
  tenant: string;
  amount: string;
  surface: string;
  leaseDuration: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceOfficial: boolean;
  date: string;
  detectedAt: string;
  investmentRelated: boolean;
  dataQuality: DataQuality;
  editorialPriority: EditorialPriority;
  confidence: number;
  disclaimer: string;
}

interface NewsSourceEntry {
  slug: string;
  name: string;
  managementCompany: string;
  officialUrl: string;
  newsUrl: string;
  rssUrl: string;
  enabled: boolean;
  notes: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────
const USER_AGENT = 'MaximusSCPI-InvestmentNewsWatcher/1.0';
const FETCH_TIMEOUT_MS = 15_000;
const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const SOURCES_PATH = path.join(ROOT_DIR, 'data', 'scpi-investment-news-sources.json');
const LATEST_PATH = path.join(ROOT_DIR, 'data', 'news', 'scpi-investment-news-latest.json');
const HISTORY_PATH = path.join(ROOT_DIR, 'data', 'news', 'scpi-investment-news-history.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const DISCLAIMER = 'Information factuelle issue d\'une source officielle. Ne constitue pas une recommandation d\'investissement.';

// ── Logging ────────────────────────────────────────────────────────────────
const errorsBySource: Record<string, string[]> = {};

function logError(source: string, msg: string) {
  if (!errorsBySource[source]) errorsBySource[source] = [];
  errorsBySource[source].push(msg);
  console.error(`[ERROR] ${source}: ${msg}`);
}

function logInfo(msg: string) {
  console.log(`[INFO] ${msg}`);
}

// ── Hash pour déduplication ────────────────────────────────────────────────
function hashTitle(title: string): string {
  // Hash simple pour dédupliquer
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ── Charge les sources ─────────────────────────────────────────────────────
function loadSources(): NewsSourceEntry[] {
  if (!fs.existsSync(SOURCES_PATH)) {
    logInfo('Aucun fichier de sources trouvé. Créez data/scpi-investment-news-sources.json');
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf-8'));
  if (!Array.isArray(raw)) {
    logError('sources', 'Le fichier de sources n\'est pas un tableau JSON valide.');
    return [];
  }
  return raw as NewsSourceEntry[];
}

// ── Fetch d'une URL avec timeout ───────────────────────────────────────────
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

// ── Traite une source ──────────────────────────────────────────────────────
async function processSource(source: NewsSourceEntry): Promise<InvestmentNewsItem[]> {
  const items: InvestmentNewsItem[] = [];
  const detectedAt = new Date().toISOString();

  // Détermine l'URL à utiliser : rss > newsUrl > officialUrl
  const targetUrl = source.rssUrl || source.newsUrl || source.officialUrl;

  if (!targetUrl) {
    logError(source.slug, 'source_incomplete : aucune URL (rssUrl, newsUrl, officialUrl) renseignée.');
    return items;
  }

  logInfo(`Traitement de "${source.name}" (${source.slug}) → ${targetUrl}`);

  try {
    const html = await fetchWithTimeout(targetUrl, FETCH_TIMEOUT_MS);
    logInfo(`  → ${source.slug}: ${html.length} caractères reçus`);

    // TODO: Implémenter le parsing RSS/HTML pour extraire les actualités
    // d'acquisition immobilière. Pour l'instant, le script détecte la
    // connectivité des sources et prépare la structure.
    //
    // Stratégie de parsing recommandée :
    // 1. Si rssUrl → parser XML (chercher <item> avec mots-clés : acquisition,
    //    achat, investissement, immeuble, actif, m²)
    // 2. Si newsUrl → scraper HTML (chercher sections "actualités", "news",
    //    "communiqués")
    // 3. Filtrer par mots-clés d'acquisition immobilière uniquement
    // 4. Extraire : titre, date, résumé, localisation, montant si présent

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(source.slug, `Échec fetch : ${msg}`);
  }

  return items;
}

// ── Classifie une actualité ────────────────────────────────────────────────
function classifyItem(item: InvestmentNewsItem): void {
  // Détermine dataQuality
  const hasLocation = !!(item.city || item.country || item.address);
  const hasAssetType = !!(item.assetType && item.assetType !== 'autre_immobilier');
  const hasSource = !!item.sourceUrl;
  let detailsCount = 0;
  if (item.amount !== 'Non communiqué') detailsCount++;
  if (item.surface !== 'Non communiqué') detailsCount++;
  if (item.tenant !== 'Non communiqué') detailsCount++;
  if (item.leaseDuration !== 'Non communiqué') detailsCount++;

  if (hasLocation && hasAssetType && hasSource && detailsCount >= 2) {
    item.dataQuality = 'complete';
    item.editorialPriority = 1;
  } else if (hasLocation && hasAssetType && hasSource) {
    item.dataQuality = 'standard';
    item.editorialPriority = 2;
  } else if (hasAssetType && hasSource) {
    item.dataQuality = 'partial';
    item.editorialPriority = 3;
  } else {
    item.dataQuality = 'weak';
    item.editorialPriority = 0;
  }

  // Ajoute le disclaimer s'il est absent
  if (!item.disclaimer) {
    item.disclaimer = DISCLAIMER;
  }
}

// ── Génère un ID unique ────────────────────────────────────────────────────
function generateId(item: InvestmentNewsItem): string {
  return `${hashTitle(item.title)}-${item.date || 'nodate'}`;
}

// ── Fusionne avec l'historique ─────────────────────────────────────────────
function mergeWithHistory(newItems: InvestmentNewsItem[]): InvestmentNewsItem[] {
  const existing: InvestmentNewsItem[] = fs.existsSync(HISTORY_PATH)
    ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'))
    : [];
  const existingIds = new Set(existing.map((i) => i.id));

  let added = 0;
  for (const item of newItems) {
    item.id = generateId(item);
    if (!existingIds.has(item.id)) {
      existing.push(item);
      existingIds.add(item.id);
      added++;
    }
  }
  logInfo(`${added} nouveaux investissements ajoutés à l'historique (total : ${existing.length}).`);
  return existing;
}

// ── Génère le rapport Markdown ─────────────────────────────────────────────
function generateReport(
  sources: NewsSourceEntry[],
  allItems: InvestmentNewsItem[],
  newCount: number,
) {
  const today = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(REPORTS_DIR, `SCPI_INVESTMENT_NEWS_REPORT_${today}.md`);

  const activeSources = sources.filter((s) => s.enabled);
  const incompleteSources = activeSources.filter((s) => !s.rssUrl && !s.newsUrl && !s.officialUrl);
  const erroredSources = Object.keys(errorsBySource).filter((k) => errorsBySource[k].length > 0);

  const priority1 = allItems.filter((i) => i.editorialPriority === 1);
  const priority2 = allItems.filter((i) => i.editorialPriority === 2);
  const priority3 = allItems.filter((i) => i.editorialPriority === 3);
  const ignored = allItems.filter((i) => i.editorialPriority === 0 || i.dataQuality === 'weak' || !i.investmentRelated);

  const lines: string[] = [
    `# Derniers investissements immobiliers des SCPI — ${today}`,
    '',
    '## Synthèse',
    `- Sources chargées : ${sources.length}`,
    `- Sources actives : ${activeSources.length}`,
    `- Sources incomplètes : ${incompleteSources.length}`,
    `- Sources en erreur : ${erroredSources.length}`,
    `- Investissements détectés : ${allItems.length}`,
    `- Nouveaux investissements ajoutés : ${newCount}`,
    '',
  ];

  if (erroredSources.length > 0) {
    lines.push('### Erreurs par source');
    for (const src of erroredSources) {
      lines.push(`- **${src}** : ${errorsBySource[src].join(' ; ')}`);
    }
    lines.push('');
  }

  if (priority1.length > 0) {
    lines.push('## Acquisitions priorité 1');
    lines.push('');
    for (const item of priority1) {
      lines.push(`### ${item.title}`);
      lines.push(`- **SCPI** : ${item.scpi} (${item.managementCompany})`);
      lines.push(`- **Type** : ${item.assetType} — ${item.city}, ${item.country}`);
      lines.push(`- **Date** : ${item.date}`);
      if (item.amount !== 'Non communiqué') lines.push(`- **Montant** : ${item.amount}`);
      if (item.surface !== 'Non communiqué') lines.push(`- **Surface** : ${item.surface}`);
      if (item.tenant !== 'Non communiqué') lines.push(`- **Locataire** : ${item.tenant}`);
      lines.push(`- ${item.summary}`);
      lines.push(`- [Source](${item.sourceUrl})`);
      lines.push('');
    }
  }

  if (priority2.length > 0) {
    lines.push('## Acquisitions priorité 2');
    lines.push('');
    for (const item of priority2) {
      lines.push(`- **${item.scpi}** — ${item.title} (${item.city}, ${item.country}) — [Source](${item.sourceUrl})`);
    }
    lines.push('');
  }

  if (priority3.length > 0) {
    lines.push('## Acquisitions priorité 3');
    lines.push('');
    for (const item of priority3) {
      lines.push(`- **${item.scpi}** — ${item.title} — [Source](${item.sourceUrl})`);
    }
    lines.push('');
  }

  if (ignored.length > 0) {
    lines.push('## Sources ignorées');
    lines.push('');
    lines.push('Actualités ignorées car elles ne concernent pas une acquisition immobilière réelle :');
    lines.push('');
    for (const item of ignored) {
      lines.push(`- ${item.scpi} : ${item.title || item.summary}`);
    }
    lines.push('');
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8');
  logInfo(`Rapport généré : ${reportPath}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  logInfo('=== SCPI Investment News Watcher ===');
  logInfo(`Démarrage : ${new Date().toISOString()}`);

  // 1. Charger les sources
  const sources = loadSources();
  logInfo(`${sources.length} sources chargées.`);

  if (sources.length === 0) {
    logInfo('Aucune source à traiter. Fin.');
    return;
  }

  const activeSources = sources.filter((s) => s.enabled);
  logInfo(`${activeSources.length} sources actives.`);

  // 2. Traiter chaque source
  const allItems: InvestmentNewsItem[] = [];
  for (const source of activeSources) {
    const items = await processSource(source);
    for (const item of items) {
      classifyItem(item);
    }
    allItems.push(...items);
  }

  logInfo(`${allItems.length} investissements détectés au total.`);

  // 3. Dédupliquer (par URL + hash titre)
  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    const key = item.sourceUrl || hashTitle(item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  logInfo(`${deduped.length} investissements après déduplication.`);

  // 4. Fusionner avec l'historique
  const previousHistory = fs.existsSync(HISTORY_PATH)
    ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'))
    : [];
  const history = mergeWithHistory(deduped);
  const newCount = history.length - (Array.isArray(previousHistory) ? previousHistory.length : 0);

  // 5. Écrire les fichiers de sortie
  const displayable = history.filter(
    (i: InvestmentNewsItem) => i.dataQuality !== 'weak' && i.editorialPriority > 0,
  );

  fs.writeFileSync(LATEST_PATH, JSON.stringify(displayable, null, 2), 'utf-8');
  logInfo(`Fichier latest écrit : ${displayable.length} investissements affichables.`);

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
  logInfo(`Fichier history écrit : ${history.length} investissements au total.`);

  // 6. Générer le rapport
  generateReport(sources, history, newCount);

  // 7. Résumé final
  logInfo('=== Résumé ===');
  logInfo(`Sources chargées : ${sources.length}`);
  logInfo(`Sources actives : ${activeSources.length}`);
  logInfo(`Sources incomplètes : ${activeSources.filter((s) => !s.rssUrl && !s.newsUrl && !s.officialUrl).length}`);
  logInfo(`Sources en erreur : ${Object.keys(errorsBySource).length}`);
  logInfo(`Investissements détectés : ${deduped.length}`);
  logInfo(`Nouveaux investissements ajoutés : ${newCount}`);
  logInfo('=== Fin ===');
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
