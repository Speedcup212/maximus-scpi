/**
 * SCPI Video Acquisition Candidates Builder
 *
 * Source prioritaire : data/news/scpi-investment-news-latest.json (watcher auto-validé)
 * Source de repli    : src/data/scpi_complet.json → champ "Actualités trimestrielles"
 *
 * Usage :
 *   npm run news:investments && npm run video:acquisitions
 *
 * Sortie : data/news/scpi-acquisitions-video-candidates.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================================================
//  CONSTANTES
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

const NEWS_LATEST_PATH = path.join(ROOT, 'data', 'news', 'scpi-investment-news-latest.json');
const SCPI_COMPLET_PATH = path.join(ROOT, 'src', 'data', 'scpi_complet.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'news', 'scpi-acquisitions-video-candidates.json');

const NC = 'Non communiqué';

// Mots-clés d'acquisition — bloc conservé si au moins un match
const INCLUDE_KEYWORDS = [
  'acquisition', 'acquis', 'acquise', 'acquiert',
  'a acheté', "vient d'acquérir", 'vient d\u2019acquérir',
];

// Mots-clés d'exclusion — bloc ignoré si au moins un match
const EXCLUDE_KEYWORDS = [
  'aucune acquisition', "pas d'acquisition", 'pas d\u2019acquisition',
  "projet d'acquisition", 'projet d\u2019acquisition',
  'acquisition prévue', 'sous promesse', 'pipeline',
  'cession', 'arbitrage',
];

// Mots-clés agrégés / synthèse (pas assez détaillés)
const AGGREGATE_INDICATORS = [
  'volume total', 'acquisitions représentant', 'nouvelles acquisitions représentant',
  'acquisitions finalisées pour', 'acquisitions pour un montant', 'nouvelles acquisitions pour',
  'nouvelles acquisitions en', 'acquisitions au cours du trimestre représentant',
  'collecte nette de',
];

// Mapping asset type → from keyword in text (lowercase, avec accents)
// ORDRE IMPORTANT : les types spécifiques en premier pour éviter les faux positifs
// (ex: "bâtiment industriel avec bureaux" = locaux_activite, PAS bureaux)
const ASSET_KEYWORDS: { keyword: string; type: string }[] = [
  // --- Types très spécifiques d'abord ---
  { keyword: 'parking', type: 'autre_immobilier' },
  { keyword: 'école', type: 'education' },
  { keyword: 'education', type: 'education' },
  { keyword: 'éducation', type: 'education' },
  { keyword: 'crèche', type: 'education' },
  { keyword: 'clinique', type: 'sante' },
  { keyword: 'ehpad', type: 'sante' },
  { keyword: 'santé', type: 'sante' },
  { keyword: 'life science', type: 'sante' },
  { keyword: 'hôtel', type: 'hotellerie' },
  { keyword: 'hôtellerie', type: 'hotellerie' },
  { keyword: 'tourisme', type: 'hotellerie' },
  { keyword: 'chambres', type: 'hotellerie' },
  // --- Types industriels / activités (avant logistique pour éviter override) ---
  { keyword: 'site industriel', type: 'locaux_activite' },
  { keyword: 'bâtiment industriel', type: 'locaux_activite' },
  { keyword: "locaux d'activités", type: 'locaux_activite' },
  { keyword: 'locaux d\u2019activités', type: 'locaux_activite' },
  { keyword: "d'activités", type: 'locaux_activite' },
  { keyword: 'industriel', type: 'locaux_activite' },
  { keyword: 'production', type: 'locaux_activite' },
  // --- Logistique après activités ---
  { keyword: 'entrepôt', type: 'logistique' },
  { keyword: 'logistique', type: 'logistique' },
  { keyword: 'warehouse', type: 'logistique' },
  { keyword: 'alimentaire', type: 'commerce' },
  { keyword: 'commercial', type: 'commerce' },
  { keyword: 'commerces', type: 'commerce' },
  { keyword: 'commerce', type: 'commerce' },
  { keyword: 'retail park', type: 'commerce' },
  { keyword: 'retail', type: 'commerce' },
  // --- Types industriels / activités (avant bureaux pour éviter override) ---
  { keyword: "locaux d'activités", type: 'locaux_activite' },
  { keyword: 'locaux d\u2019activités', type: 'locaux_activite' },
  { keyword: "d'activités", type: 'locaux_activite' },
  { keyword: 'industriel', type: 'locaux_activite' },
  { keyword: 'production', type: 'locaux_activite' },
  // --- Résidentiel ---
  { keyword: 'résidentiel', type: 'residentiel_gere' },
  { keyword: 'logement', type: 'residentiel_gere' },
  { keyword: 'maison', type: 'residentiel_gere' },
  // --- Bureaux en dernier (pour ne pas écraser les types ci-dessus) ---
  { keyword: 'bureaux', type: 'bureaux' },
  { keyword: 'bureau', type: 'bureaux' },
  { keyword: 'office', type: 'bureaux' },
];

// Pays connus pour la désambiguïsation
const KNOWN_COUNTRIES = [
  'france', 'espagne', 'italie', 'portugal', 'allemagne',
  'pologne', 'pays-bas', 'irlande', 'royaume-uni', 'belgique',
  'suisse', 'autriche',
];

// ============================================================================
//  TYPES
// ============================================================================

interface InvestmentNewsItem {
  id?: string;
  scpi: string;
  managementCompany: string;
  operationType: string;
  assetType: string;
  country: string;
  city: string;
  area?: string;
  address?: string;
  tenant: string;
  amount: string;
  surface: string;
  leaseDuration: string;
  title: string;
  summary?: string;
  sourceUrl: string;
  sourceOfficial?: boolean;
  sourceType: string;
  documentTitle?: string;
  date?: string;
  detectedAt?: string;
  investmentRelated?: boolean;
  dataQuality?: string;
  editorialPriority?: number;
  confidence: number;
  disclaimer?: string;
  sectionContext?: string;
  extractionMethod?: string;
}

// On utilise 'as any' pour accéder aux propriétés avec accents du JSON
type ScpiRawEntry = Record<string, unknown>;

interface VideoCandidate {
  id: string;
  scpi: string;
  managementCompany: string;
  operationType: string;
  assetType: string;
  city: string;
  country: string;
  amount: string;
  surface: string;
  tenant: string;
  leaseDuration: string;
  sourceUrl: string;
  sourceType: string;
  documentTitle: string;
  confidence: number;
  videoHook: string;
  videoAngle: string;
  clientBenefit: string;
  riskReminder: string;
  cta: string;
  status: 'a_valider';
  rawText: string;
  internalSource: string;
}

interface InternalAcqBlock {
  scpi: string;
  managementCompany: string;
  rawText: string;
  city: string;
  country: string;
  amount: string;
  surface: string;
  assetType: string;
  tenant: string;
  leaseDuration: string;
  periodBulletin: string;
}

// ============================================================================
//  HELPERS
// ============================================================================

function orNA(value: string | undefined | null): string {
  if (!value || value.trim() === '') return NC;
  return value.trim();
}

function safeOrNA(value: unknown): string {
  if (value === undefined || value === null) return NC;
  if (typeof value === 'string') return orNA(value);
  return String(value).trim() || NC;
}

function assetTypeLabel(assetType: string): string {
  const labels: Record<string, string> = {
    'bureaux': 'bureaux',
    'commerce': 'commerces',
    'logistique': 'logistique',
    'sante': 'santé',
    'education': 'éducation',
    'hotellerie': 'hôtellerie',
    'residentiel_gere': 'résidentiel géré',
    'locaux_activite': "locaux d'activité",
    'mixte': 'immobilier mixte',
    'portefeuille_multi_actifs': 'portefeuille multi-actifs',
    'autre_immobilier': 'immobilier',
  };
  return labels[assetType] || assetType;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Nettoie les artefacts d'encodage (mojibake) d'une chaîne UTF-8.
 * Corrige les séquences Windows-1252 mal interprétées.
 */
function cleanMojibakeText(input: string): string {
  if (!input) return input;
  return input
    .replace(/\u00e2\u201a\u00ac/g, '\u20ac')     // â,¬ → €
    .replace(/\u00c3\u00a2\u20ac\u017e/g, '\u20ac') // variante €
    .replace(/M\u00e2\u201a\u00ac/g, 'M\u20ac')
    .replace(/\u00c2\u00b2/g, '\u00b2')            // Â² → ²
    .replace(/m\u00c3\u201a\u00b2/g, 'm\u00b2')
    .replace(/m\u00e2\u201a\u00b2/g, 'm\u00b2')
    .replace(/m\u00c2\u00b2/g, 'm\u00b2')
    .replace(/communiqu\u00c3\u00a9/g, 'communiqu\u00e9')
    .replace(/communiqu\u00e2\u201a\u00ac\u0178/g, 'communiqu\u00e9')
    .replace(/\u00c3\u00a9/g, '\u00e9')              // Ã© → é
    .replace(/\u00c3\u00a8/g, '\u00e8')              // Ã¨ → è
    .replace(/\u00c3\u00a0/g, '\u00e0')              // Ã  → à
    .replace(/\u00c3\u00b4/g, '\u00f4')              // Ã´ → ô
    .replace(/\u00c3\u2030/g, '\u00c9')              // Ã‰ → É
    .replace(/\u00c3\u00a7/g, '\u00e7')              // Ã§ → ç
    .replace(/\u00c3\u00b9/g, '\u00f9')              // Ã¹ → ù
    .replace(/\u00c3\u00aa/g, '\u00ea')              // Ãª → ê
    .replace(/\u00c3\u00ab/g, '\u00eb')              // Ã« → ë
    .replace(/\u00c3\u00ae/g, '\u00ee')              // Ã® → î
    .replace(/\u00c3\u00af/g, '\u00ef')              // Ã¯ → ï
    .replace(/\u00c3\u00bb/g, '\u00fb')              // Ã» → û
    .replace(/\u00c3\u00bc/g, '\u00fc')              // Ã¼ → ü
    .replace(/\u00e2\u20ac\u201c/g, '\u2014')        // â€" → —
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')        // â€™ → '
    .replace(/\u00e2\u20ac\u02dc/g, '\u2019')        // autre variante '
    .replace(/\u00e2\u20ac\u0153/g, '\u0153')        // â€œ → œ
    .replace(/Ã´/g, '\u00f4')
    .replace(/Ã©/g, '\u00e9')
    .replace(/Ã¨/g, '\u00e8')
    .replace(/Ã /g, '\u00e0')
    .replace(/Ã‰/g, '\u00c9')
    .replace(/Ã§/g, '\u00e7')
    .replace(/Ã¹/g, '\u00f9')
    .replace(/Ãª/g, '\u00ea')
    .replace(/Ã«/g, '\u00eb')
    .replace(/Ã®/g, '\u00ee')
    .replace(/Ã¯/g, '\u00ef')
    .replace(/Ã»/g, '\u00fb')
    .replace(/Ã¼/g, '\u00fc');
}

/**
 * Applique cleanMojibakeText à un candidat entier (champs texte).
 */
function cleanCandidate(c: VideoCandidate): VideoCandidate {
  return {
    ...c,
    scpi: cleanMojibakeText(c.scpi),
    managementCompany: cleanMojibakeText(c.managementCompany),
    city: cleanMojibakeText(c.city),
    country: cleanMojibakeText(c.country),
    amount: cleanMojibakeText(c.amount),
    surface: cleanMojibakeText(c.surface),
    tenant: cleanMojibakeText(c.tenant),
    leaseDuration: cleanMojibakeText(c.leaseDuration),
    documentTitle: cleanMojibakeText(c.documentTitle),
    videoHook: cleanMojibakeText(c.videoHook),
    videoAngle: cleanMojibakeText(c.videoAngle),
    clientBenefit: cleanMojibakeText(c.clientBenefit),
    riskReminder: cleanMojibakeText(c.riskReminder),
    cta: cleanMojibakeText(c.cta),
    rawText: cleanMojibakeText(c.rawText),
  };
}

// ============================================================================
//  ACCÈS AUX DONNÉES SCPI (gère les accents dans les clés JSON)
// ============================================================================

function getScpiName(entry: Record<string, unknown>): string {
  return String(entry['Nom SCPI'] ?? entry['Nom SCPI (accent?)'] ?? '');
}

function getMgmt(entry: Record<string, unknown>): string {
  return String(entry['Société de gestion'] ?? entry['Societe de gestion'] ?? '');
}

function getActualites(entry: Record<string, unknown>): string {
  return String(entry['Actualités trimestrielles'] ?? entry['Actualites trimestrielles'] ?? '');
}

function getPeriod(entry: Record<string, unknown>): string {
  return String(entry['Période bulletin trimestriel'] ?? entry['Periode bulletin trimestriel'] ?? '');
}

function getYield(entry: Record<string, unknown>): string {
  return String(entry['Taux de distribution (%)'] ?? '');
}

function getIsr(entry: Record<string, unknown>): boolean {
  const v = entry['Label ISR'];
  return v === 'Oui' || v === 'oui';
}

// ============================================================================
//  EXTRACTION DEPUIS LE TEXTE DES ACTUALITÉS TRIMESTRIELLES
// ============================================================================

/**
 * Extrait le pays depuis le contenu des parenthèses.
 */
function extractCountryFromParens(parens: string): string {
  const parts = parens.split(',');
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].trim();
    // Dernier segment ≥ 4 lettres sans chiffre → pays probable
    if (last.length >= 4 && !/\d/.test(last)) {
      // Code département français ? (1-3 chiffres) → corriger
      if (/^\d{1,3}$/.test(last)) return 'France';
      return last;
    }
    // Chercher un pays connu
    for (const seg of parts) {
      const s = seg.trim().toLowerCase();
      if (KNOWN_COUNTRIES.includes(s)) return seg.trim();
    }
    // Dernier segment (fallback)
    if (/^\d{1,3}$/.test(last)) return 'France';
    return last;
  }
  // Un seul segment
  const single = parts[0].trim();
  if (/^\d{1,3}$/.test(single)) return 'France';
  return single;
}

// Construit les regex une fois (apostrophes courbes)
const APOS = "['\u2019]";  // ' ou '

/**
 * Extrait la ville et le pays.
 */
function extractCityCountry(block: string): { city: string; country: string } {
  // Pattern 1 : "Acquisition à X (Y)"
  const re1 = new RegExp(`[Aa]cquisition\\s+[a\u00e0]\\s+([^(]+?)\\s*\\(([^)]+)\\)`, 'u');
  const m1 = block.match(re1);
  if (m1) return { city: m1[1].trim() || NC, country: extractCountryFromParens(m1[2]) || NC };

  // Pattern 2 : "Acquisition d'un X à/dans Y (Z)"
  const re2 = new RegExp(
    `[Aa]cquisition\\s+(?:d${APOS}un\\s+|d${APOS}une\\s+|de\\s+|de\\s+l${APOS}\\s*)?` +
    `(?:[^(a\u00e0]*?)\\s+(?:[a\u00e0]|dans)\\s+([^(]+?)\\s*\\(([^)]+)\\)`,
    'u'
  );
  const m2 = block.match(re2);
  if (m2) return { city: m2[1].trim() || NC, country: extractCountryFromParens(m2[2]) || NC };

  // Pattern 3 : "Lancement d'un projet X à Y (Z)" ou "projet hôtelier à Y (Z)"
  const re3 = new RegExp(
    `(?:[Ll]ancement d${APOS}un\\s+)?(?:projet\\s+\\S+\\s+)?(?:[a\u00e0]|dans)\\s+([^(]+?)\\s*\\(([^)]+)\\)`,
    'u'
  );
  const m3 = block.match(re3);
  if (m3) return { city: m3[1].trim() || NC, country: extractCountryFromParens(m3[2]) || NC };

  return { city: NC, country: NC };
}

/**
 * Extrait le montant.
 */
function extractAmount(block: string): string {
  const prixMatch = block.match(/prix d['\u2019]acquisition\s+(?:AEM\s+)?([\d,\s]+)\s*M\s*\u20ac/i);
  if (prixMatch) return prixMatch[1].replace(/\s/g, '') + ' M\u20ac';

  const parensAmount = block.match(/\([^)]*?([\d,.]+)\s*M\s*\u20ac[^)]*\)/i);
  if (parensAmount) return parensAmount[1].replace(/\s/g, '') + 'M\u20ac';

  const freeAmount = block.match(/([\d,.]+)\s*M\s*\u20ac/i);
  if (freeAmount) return freeAmount[1].replace(/\s/g, '') + 'M\u20ac';

  return NC;
}

/**
 * Extrait la surface.
 */
function extractSurface(block: string): string {
  const parensSurface = block.match(/\([^)]*?([\d][\d\s]*)\s*m\u00b2[^)]*\)/i);
  if (parensSurface) return parensSurface[1].replace(/\s+/g, ' ').trim() + ' m\u00b2';

  const surfaceMatch = block.match(/surface\s*(?:totale\s*)?(?:de\s*)?([\d][\d\s]*)\s*m\u00b2/i);
  if (surfaceMatch) return surfaceMatch[1].replace(/\s/g, '') + ' m\u00b2';

  const freeSurface = block.match(/([\d][\d\s]*)\s*m\u00b2/i);
  if (freeSurface) return freeSurface[1].replace(/\s/g, '') + ' m\u00b2';

  return NC;
}

/**
 * Détecte le type d'actif.
 */
function extractAssetType(block: string): string {
  const lower = block.toLowerCase();
  for (const { keyword, type } of ASSET_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) return type;
  }
  return 'autre_immobilier';
}

/**
 * Extrait le locataire.
 */
function extractTenant(block: string): string {
  const patterns = [
    /lou[e\u00e9]\s+(?:pour\s+\d+\s+ans\s+)?(?:[a\u00e0]|aupr[e\u00e8]s de)\s+([^.(]+?)(?:\.|,|$|\()/i,
    /occup[e\u00e9]\s+par\s+([^.(]+?)(?:\.|,|$|\()/i,
    /locataire\s*:?\s*([^.(]+?)(?:\.|,|$|\()/i,
  ];

  for (const re of patterns) {
    const m = block.match(re);
    if (m) {
      const t = m[1].trim();
      if (t.length < 2) continue;
      if (/\bmultilocataire\b/i.test(t)) continue;
      if (/^certifi[e\u00e9][e\u00e9]?\s/i.test(t)) continue;
      return t.replace(
        /^(?:la\s+soci[e\u00e9]t[e\u00e9]\s+|le\s+groupe\s+|l'entreprise\s+)/i, ''
      ).trim();
    }
  }

  return NC;
}

/**
 * Extrait la durée du bail.
 */
function extractLeaseDuration(block: string): string {
  const dureeFerme = block.match(/dur[e\u00e9]e\s+ferme\s+(?:des\s+baux\s+)?de\s+([\d.,]+)\s*ans/i);
  if (dureeFerme) return dureeFerme[1].replace(',', '.') + ' ans fermes';

  const bailFerme = block.match(/bail\s+(?:commercial\s+)?(?:ferme|de)\s+(?:de\s+)?([\d.,]+)\s*ans/i);
  if (bailFerme) return bailFerme[1].replace(',', '.') + ' ans';

  const bailAns = block.match(/bail\s+([\d.,]+)\s*ans?\s*(?:\(([\d.,]+)\s*ans?\s*fermes?\))?/i);
  if (bailAns) {
    if (bailAns[2]) return bailAns[2].replace(',', '.') + ' ans fermes';
    return bailAns[1].replace(',', '.') + ' ans';
  }

  const loueDuree = block.match(/(?:lou[e\u00e9]|sign[e\u00e9])\s+.*?dur[e\u00e9]e\s+ferme\s+de\s+([\d.,]+)\s*ans/i);
  if (loueDuree) return loueDuree[1].replace(',', '.') + ' ans fermes';

  return NC;
}

// ============================================================================
//  FONCTIONS DE GÉNÉRATION ÉDITORIALE (fallback interne)
// ============================================================================

function buildVideoHookFromBlock(b: InternalAcqBlock): string {
  const label = assetTypeLabel(b.assetType);
  const cityName = b.city !== NC ? `à ${b.city}` : '';
  const countryName = b.country !== NC ? ` (${b.country})` : '';
  const amountStr = b.amount !== NC ? ` pour ${b.amount}` : '';
  return `La SCPI ${b.scpi} acquiert ${label} ${cityName}${countryName}${amountStr}`.trim();
}

function buildVideoAngleFromBlock(b: InternalAcqBlock): string {
  return 'Lecture factuelle de cette acquisition et de sa place dans la stratégie patrimoniale de la SCPI';
}

function buildClientBenefitFromBlock(b: InternalAcqBlock, _scpiData: Record<string, unknown> | undefined): string {
  return 'Cette acquisition peut contribuer à la diversification géographique ou sectorielle du patrimoine immobilier de la SCPI.';
}

// ============================================================================
//  FONCTIONS DE GÉNÉRATION ÉDITORIALE (watcher - compat)
// ============================================================================

function buildVideoHook(item: InvestmentNewsItem): string {
  const label = assetTypeLabel(item.assetType);
  const cityName = item.city && item.city !== NC ? `à ${item.city}` : '';
  const countryName = item.country && item.country !== NC ? ` (${item.country})` : '';
  const amountStr = item.amount && item.amount !== NC ? ` pour ${item.amount}` : '';
  return `La SCPI ${item.scpi} acquiert ${label} ${cityName}${countryName}${amountStr}`.trim();
}

function buildVideoAngle(item: InvestmentNewsItem): string {
  return 'Lecture factuelle de cette acquisition et de sa place dans la stratégie patrimoniale de la SCPI';
}

function buildClientBenefit(item: InvestmentNewsItem, _scpiData: Record<string, unknown> | undefined): string {
  return 'Cette acquisition peut contribuer à la diversification géographique ou sectorielle du patrimoine immobilier de la SCPI.';
}

// ============================================================================
//  LOGIQUE PRINCIPALE
// ============================================================================

function loadInvestmentNews(): InvestmentNewsItem[] {
  if (!fs.existsSync(NEWS_LATEST_PATH)) return [];
  const raw = fs.readFileSync(NEWS_LATEST_PATH, 'utf-8').trim();
  if (!raw || raw === '[]') return [];
  try { return JSON.parse(raw) as InvestmentNewsItem[]; }
  catch { return []; }
}

function loadFullScpiData(): Record<string, unknown>[] {
  if (!fs.existsSync(SCPI_COMPLET_PATH)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(SCPI_COMPLET_PATH, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function buildScpiEnrichmentMap(data: Record<string, unknown>[]): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const entry of data) {
    const key = getScpiName(entry).toLowerCase().trim();
    if (key) map.set(key, entry);
  }
  return map;
}

// ============================================================================
//  CANDIDATES DEPUIS LE WATCHER
// ============================================================================

const RISK_REMINDER = 'Information générale | Ne constitue pas une recommandation personnalisée | Les SCPI présentent un risque de perte en capital et une liquidité limitée';
const CTA = "Pour plus d'informations et un accompagnement personnalisé, prenez rendez-vous sur maximusscpi.com";

function buildCandidatesFromWatcher(
  items: InvestmentNewsItem[],
  enrichment: Map<string, Record<string, unknown>>,
): VideoCandidate[] {
  const candidates: VideoCandidate[] = [];
  const slugMap = new Map<string, number>();

  for (const item of items) {
    if (item.confidence < 0.5 && item.dataQuality === 'weak') continue;

    const slug = slugify(item.scpi);
    const count = (slugMap.get(slug) || 0) + 1;
    slugMap.set(slug, count);

    const scpiData = enrichment.get(item.scpi.toLowerCase().trim());

    candidates.push(cleanCandidate({
      id: `video-${slug}-${String(count).padStart(3, '0')}`,
      scpi: orNA(item.scpi),
      managementCompany: orNA(item.managementCompany),
      operationType: orNA(item.operationType),
      assetType: orNA(item.assetType),
      city: orNA(item.city),
      country: orNA(item.country),
      amount: orNA(item.amount),
      surface: orNA(item.surface),
      tenant: orNA(item.tenant),
      leaseDuration: orNA(item.leaseDuration),
      sourceUrl: orNA(item.sourceUrl),
      sourceType: orNA(item.sourceType),
      documentTitle: orNA(item.documentTitle),
      confidence: item.confidence,
      videoHook: buildVideoHook(item),
      videoAngle: buildVideoAngle(item),
      clientBenefit: buildClientBenefit(item, scpiData),
      riskReminder: RISK_REMINDER,
      cta: CTA,
      status: 'a_valider',
      rawText: orNA(item.summary),
      internalSource: 'investment_news_watcher',
    }));
  }

  return candidates;
}

// ============================================================================
//  CANDIDATES DEPUIS LES ACTUALITÉS TRIMESTRIELLES (fallback interne)
// ============================================================================

function hasIncludeKeyword(block: string): boolean {
  const lower = block.toLowerCase();
  return INCLUDE_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

function hasExcludeKeyword(block: string): boolean {
  const lower = block.toLowerCase();
  return EXCLUDE_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

function isAggregate(block: string): boolean {
  const lower = block.toLowerCase();
  return AGGREGATE_INDICATORS.some(k => lower.includes(k.toLowerCase()));
}

function extractBlocks(scpiEntry: Record<string, unknown>): InternalAcqBlock[] {
  const actualites = getActualites(scpiEntry);
  if (!actualites) return [];

  const blocs = actualites.split('|').map(b => b.trim()).filter(b => b.length > 20);
  const results: InternalAcqBlock[] = [];

  const period = safeOrNA(getPeriod(scpiEntry));
  const scpi = safeOrNA(getScpiName(scpiEntry));
  const mgmt = safeOrNA(getMgmt(scpiEntry));

  for (const bloc of blocs) {
    if (!hasIncludeKeyword(bloc)) continue;
    if (hasExcludeKeyword(bloc)) continue;
    if (isAggregate(bloc)) continue;

    const { city, country } = extractCityCountry(bloc);
    const amount = extractAmount(bloc);
    const surface = extractSurface(bloc);
    const assetType = extractAssetType(bloc);
    const tenant = extractTenant(bloc);
    const leaseDuration = extractLeaseDuration(bloc);

    results.push({
      scpi, managementCompany: mgmt, rawText: bloc,
      city, country, amount, surface, assetType, tenant, leaseDuration,
      periodBulletin: period,
    });
  }

  return results;
}

function computeInternalConfidence(b: InternalAcqBlock): number {
  const hasLocation = b.city !== NC && b.country !== NC;
  const hasAmountOrSurface = b.amount !== NC || b.surface !== NC;
  return (hasLocation && hasAmountOrSurface) ? 0.85 : 0.70;
}

function buildCandidatesFromInternal(
  blocks: InternalAcqBlock[],
  enrichment: Map<string, Record<string, unknown>>,
): VideoCandidate[] {
  const candidates: VideoCandidate[] = [];
  const slugMap = new Map<string, number>();

  for (const b of blocks) {
    const slug = slugify(b.scpi);
    const count = (slugMap.get(slug) || 0) + 1;
    slugMap.set(slug, count);

    const scpiData = enrichment.get(b.scpi.toLowerCase().trim());
    const confidence = computeInternalConfidence(b);
    const documentTitle = b.periodBulletin !== NC
      ? `Bulletin trimestriel ${b.periodBulletin} — ${b.scpi}`
      : `Actualités trimestrielles — ${b.scpi}`;

    candidates.push(cleanCandidate({
      id: `video-int-${slug}-${String(count).padStart(3, '0')}`,
      scpi: b.scpi,
      managementCompany: b.managementCompany,
      operationType: 'acquisition',
      assetType: b.assetType,
      city: b.city,
      country: b.country,
      amount: b.amount,
      surface: b.surface,
      tenant: b.tenant,
      leaseDuration: b.leaseDuration,
      sourceUrl: 'MaximusSCPI internal data',
      sourceType: 'internal_quarterly_news',
      documentTitle,
      confidence,
      videoHook: buildVideoHookFromBlock(b),
      videoAngle: buildVideoAngleFromBlock(b),
      clientBenefit: buildClientBenefitFromBlock(b, scpiData),
      riskReminder: RISK_REMINDER,
      cta: CTA,
      status: 'a_valider',
      rawText: b.rawText,
      internalSource: 'scpi_complet_actualites_trimestrielles',
    }));
  }

  return candidates;
}

// ============================================================================
//  I/O
// ============================================================================

function writeOutput(candidates: VideoCandidate[]): void {
  const dir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(candidates, null, 2), 'utf-8');
  console.log(`\n✅ ${candidates.length} candidate(s) vidéo générée(s)`);
  console.log(`   📄 ${OUTPUT_PATH}`);
}

// ============================================================================
//  MAIN
// ============================================================================

function main(): void {
  console.log('🎬 SCPI Video Acquisition Candidates Builder\n');

  const fullData = loadFullScpiData();
  const enrichment = buildScpiEnrichmentMap(fullData);
  console.log(`✅ ${fullData.length} SCPI chargées, ${enrichment.size} indexées pour enrichissement`);

  const watcherItems = loadInvestmentNews();
  let allCandidates: VideoCandidate[] = [];

  if (watcherItems.length > 0) {
    console.log(`📥 ${watcherItems.length} acquisition(s) depuis le watcher (latest.json)`);
    allCandidates = buildCandidatesFromWatcher(watcherItems, enrichment);
  } else {
    console.log("ℹ️  latest.json vide — bascule sur les actualités trimestrielles internes.\n");

    const allBlocks: InternalAcqBlock[] = [];
    for (const entry of fullData) {
      const blocs = extractBlocks(entry);
      if (blocs.length > 0) {
        console.log(`   📰 ${getScpiName(entry)} : ${blocs.length} bloc(s) acquisition`);
        allBlocks.push(...blocs);
      }
    }

    if (allBlocks.length === 0) {
      console.log("\n📭 Aucun bloc d'acquisition trouvé dans les actualités trimestrielles.");
      writeOutput([]);
      return;
    }

    console.log(`\n📥 ${allBlocks.length} bloc(s) extrait(s) depuis les actualités trimestrielles`);
    allCandidates = buildCandidatesFromInternal(allBlocks, enrichment);
  }

  writeOutput(allCandidates);
}

main();
