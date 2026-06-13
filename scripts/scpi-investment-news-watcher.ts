/**
 * SCPI Investment News Watcher
 *
 * Agent de veille des acquisitions immobilières des SCPI.
 * Exécution : npm run news:investments
 *
 * Stratégie v3 — Filtrage strict :
 * 1. 3 conditions obligatoires : SCPI identifiée + verbe d'acquisition + actif immobilier
 * 2. Liste de rejet corporate noise (market analysis, ESG, rapports, etc.)
 * 3. Scoring de confiance avec seuil minimum (80)
 * 4. Tracking des faux positifs rejetés
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Types inline ───────────────────────────────────────────────────────────
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
  // ── Détection flags v3 ──
  acquisitionVerbDetected: boolean;
  realEstateAssetDetected: boolean;
  scpiDetected: boolean;
  rejectedByCorporateNoise: boolean;
  rejectionReason: string;
}

interface RejectedNewsItem {
  title: string;
  scpi: string;
  sourceUrl: string;
  rejectionReason: string;
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

interface ScpiEntry {
  name: string;
  managementCompany: string;
  slug: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────
const USER_AGENT = 'MaximusSCPI-InvestmentNewsWatcher/1.0';
const FETCH_TIMEOUT_MS = 20_000;
const MAX_INTERNAL_LINKS = 10;
const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const SOURCES_PATH = path.join(ROOT_DIR, 'data', 'scpi-investment-news-sources.json');
const SCPI_COMPLET_PATH = path.join(ROOT_DIR, 'src', 'data', 'scpi_complet.json');
const LATEST_PATH = path.join(ROOT_DIR, 'data', 'news', 'scpi-investment-news-latest.json');
const HISTORY_PATH = path.join(ROOT_DIR, 'data', 'news', 'scpi-investment-news-history.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const DISCLAIMER = 'Information factuelle issue d\'une source officielle. Ne constitue pas une recommandation d\'investissement.';

// ── Logging & stats ────────────────────────────────────────────────────────
const errorsBySource: Record<string, string[]> = {};
let totalPagesScanned = 0;
const scannedUrls: string[] = [];

function logError(source: string, msg: string) {
  if (!errorsBySource[source]) errorsBySource[source] = [];
  errorsBySource[source].push(msg);
  console.error(`[ERROR] ${source}: ${msg}`);
}

function logInfo(msg: string) {
  console.log(`[INFO] ${msg}`);
}

// ── Mots-clés STRONGS d'acquisition (doit contenir au moins 1) ─────────────
const STRONG_ACQUISITION_KEYWORDS = [
  'acquisition', "l'acquisition", 'acquiert', 'a acquis', 'a fait l\'acquisition',
  'vient d\'acquérir', 'a réalisé l\'acquisition', 'a signé l\'acquisition',
  'a finalisé l\'acquisition', 'a conclu l\'acquisition', 'a procédé à l\'acquisition',
  'achat', "l'achat", 'a acheté', 'a fait l\'achat',
  'acheté', 'vient d\'acheter',
  'acquired', 'has acquired', 'acquisition of', 'purchase of',
];

// Mots-clés SECONDAIRES (indices d'acquisition, mais pas suffisants seuls)
const SECONDARY_ACQUISITION_KEYWORDS = [
  'investissement', 'investit', 'investi dans',
  'nouvel actif', 'nouvel immeuble', 'nouveau patrimoine',
  'portefeuille d\'actifs', 'portefeuille immobilier',
  'immeuble de', 'immeubles de',
  'extension de patrimoine', 'extension du patrimoine',
  'prise à bail', 'signature d\'un bail',
  'investment', 'invested in', 'property acquisition',
  'forward funding', 'sale and leaseback', 'asset purchase',
];

// Mots-clés de BRUIT à ignorer (pages éducatives, guides, etc.)
const NOISE_KEYWORDS = [
  'guide de la scpi', 'comment investir', 'tout savoir',
  'simuler', 'souscrire', 'devenir partenaire',
  'pourquoi iroko', 'pourquoi investir', 'est-ce que',
  'qu\'est-ce que', 'comment fonctionne', 'avantages',
  'inconvénients', 'frais de', 'rendement', 'taux de',
  'danger', 'risque', 'prémunir',
];

// ── v3 : Verbes d'acquisition STRICTS (condition 2 obligatoire) ────────────
const ACQUISITION_VERBS = [
  'acquisition', "l'acquisition",
  'acquiert', 'acquièrent',
  'a acquis', 'ont acquis',
  'acquisition de', 'acquisition d\'un', 'acquisition d\'une',
  "l'acquisition de", "l'acquisition d'un", "l'acquisition d'une",
  'annonce l\'acquisition', 'vient d\'acquérir', 'vient d\'acheter',
  'achète', 'a acheté', 'ont acheté', 'acheté',
  'achat de', "l'achat de", "l'achat d'un",
  'investit dans un immeuble', 'investit dans un actif',
  'investissement dans un actif immobilier',
  'acquisition of', 'acquisition du', 'acquisition des',
  'purchase of', 'purchased', 'has acquired', 'have acquired',
  'acquires', 'buys', 'bought',
  'réalise l\'acquisition', 'réalise sa première acquisition',
  'a réalisé l\'acquisition', 'a signé l\'acquisition',
  'a finalisé l\'acquisition', 'a procédé à l\'acquisition',
  'signature de l\'acquisition',
];

// ── v3 : Actifs immobiliers CONCRETS (condition 3 obligatoire) ─────────────
const REAL_ESTATE_ASSETS = [
  'immeuble', 'immeubles',
  'actif immobilier', 'actifs immobiliers',
  'bureaux', 'bureau', 'commerce', 'commerces',
  'retail park', 'centre commercial',
  'logistique', 'entrepôt', 'entrepôts', 'entrepot', 'entrepots',
  'locaux d\'activité', 'locaux d\'activités', 'locaux dactivite', 'locaux dactivites',
  'clinique', 'cliniques', 'ehpad', 'EHPAD', 'maison de retraite', 'hôpital',
  'crèche', 'crèches', 'école', 'écoles', 'campus',
  'hôtel', 'hôtels', 'hotel', 'hotels',
  'résidence', 'coliving', 'co-living',
  'portefeuille immobilier', 'ensemble immobilier',
  'office building', 'retail asset', 'logistics asset', 'warehouse',
  'healthcare asset', 'hotel property', 'residential property',
  'real estate asset', 'property acquisition',
];

// ── v3 : Expressions de REJET AUTOMATIQUE (corporate noise) ────────────────
const CORPORATE_REJECTION_KEYWORDS = [
  'market analysis', 'inflation risks', 'inflation risk',
  'central banks', 'central bank',
  'engagement and voting', 'voting policy', 'stewardship report',
  'esg document', 'social capital policy', 'esg report',
  'our publications', 'all our publications', 'all publications',
  'annual report', 'annual financial report',
  'rapport annuel', 'rapport financier annuel',
  'bulletin trimestriel', 'quarterly report', 'quarterly bulletin',
  'document d\'information clé', 'dic', 'note d\'information',
  'note d\'information', 'document d\'information',
  'société de gestion', 'management company', 'asset management division',
  'access the site', 'home page', 'back to business',
  'listed securities', 'securities', 'private debt',
  'fonds', 'fund', 'opci', 'opcvm',
  'communiqué corporate', 'corporate communication',
  'nomination', 'interview', 'webinaire', 'webinar',
  'salon', 'prix', 'récompense', 'award', 'trophy',
  'market trends', 'market outlook', 'macroeconomic',
  'credit rating', 'bond', 'maturity',
];

// ── v3 : Traqueur de faux positifs rejetés ─────────────────────────────────
const rejectedItems: RejectedNewsItem[] = [];

// ── Types d'actif → AssetType mapping ──────────────────────────────────────
const ASSET_TYPE_KEYWORDS: [AssetType, string[]][] = [
  ['bureaux', ['bureau', 'bureaux', 'office', 'tertiaire', 'siège social', 'siège', 'immeuble de bureaux']],
  ['commerce', ['commerce', 'commerces', 'retail', 'magasin', 'magasins', 'boutique', 'boutiques', 'centre commercial', 'galerie marchande', 'supermarché', 'supermarchés', 'retail park']],
  ['logistique', ['logistique', 'entrepôt', 'entrepôts', 'logistics', 'warehouse', 'plateforme logistique', 'messagerie', 'entrepot', 'entrepots']],
  ['sante', ['santé', 'clinique', 'cliniques', 'ehpad', 'EHPAD', 'maison de retraite', 'soins', 'médical', 'hospitalier', 'healthcare', 'hôpital', 'hospital', 'pharmacie', 'sante']],
  ['education', ['éducation', 'école', 'écoles', 'crèche', 'crèches', 'université', 'campus', 'education', 'school', 'nursery', 'etablissement scolaire']],
  ['hotellerie', ['hôtel', 'hôtels', 'hôtellerie', 'hotellerie', 'tourisme', 'hotel', 'hotels', 'resort', 'hébergement touristique']],
  ['residentiel_gere', ['résidentiel géré', 'résidentiel', 'logement', 'logements', 'résidence', 'residential', 'coliving', 'co-living', 'résidence services', 'résidence étudiante', 'résidence seniors', 'residence services']],
  ['locaux_activite', ['locaux d\'activité', 'locaux d\'activités', 'activité', 'atelier', 'ateliers', 'local industriel', 'locaux d\'activites', 'locaux dactivites']],
  ['mixte', ['mixte', 'usage mixte', 'mixed-use']],
  ['portefeuille_multi_actifs', ['portefeuille', 'portefeuille d\'actifs', 'multi-actifs', 'plusieurs actifs', 'ensemble immobilier', 'portfolio']],
];

// ── Villes pour extraction ─────────────────────────────────────────────────
const FRENCH_CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
  'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon',
  'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence',
  'Brest', 'Limoges', 'Tours', 'Amiens', 'Perpignan', 'Metz', 'Besançon', 'Orléans',
  'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Avignon', 'Poitiers', 'Dunkerque', 'Versailles',
  'Courbevoie', 'Boulogne-Billancourt', 'Nanterre', 'Créteil',
  'Asnières-sur-Seine', 'Colombes', 'La Rochelle', 'Pau', 'Cannes', 'Antibes',
  'Calais', 'Saint-Nazaire', 'Colmar', 'Valence', 'Bourg-en-Bresse',
  'Chambéry', 'Annecy', 'Levallois-Perret', 'Issy-les-Moulineaux',
  'Neuilly-sur-Seine', 'Clichy', 'Montrouge', 'Montreuil', 'Pantin',
  'Vélizy-Villacoublay', 'Meudon', 'Sèvres', 'Chartres', 'Troyes',
  'Bourges', 'Auxerre', 'Rodez', 'Albi', 'Tarbes', 'Montauban', 'Agen',
  'Périgueux', 'Niort', 'Châteauroux', 'Bourg-lès-Valence',
  'Vernon', 'Saint-Égrève', 'Pontarlier', 'Villefranche-sur-Saône', 'Mâcon',
  'Maizières-lès-Metz', 'Massy', 'Palaiseau', 'Les Ulis', 'Orsay',
  'Saint-Quentin-en-Yvelines', 'Guyancourt', 'Trappes', 'Montigny-le-Bretonneux',
];

const EUROPEAN_CITIES: [string, string][] = [
  ['Londres', 'Royaume-Uni'], ['London', 'Royaume-Uni'],
  ['Manchester', 'Royaume-Uni'], ['Birmingham', 'Royaume-Uni'],
  ['Liverpool', 'Royaume-Uni'], ['Leeds', 'Royaume-Uni'],
  ['Sheffield', 'Royaume-Uni'], ['Bristol', 'Royaume-Uni'],
  ['Newcastle', 'Royaume-Uni'], ['Cardiff', 'Royaume-Uni'],
  ['Belfast', 'Royaume-Uni'], ['Glasgow', 'Royaume-Uni'],
  ['Edinburgh', 'Royaume-Uni'], ['Édimbourg', 'Royaume-Uni'],
  ['Norwich', 'Royaume-Uni'], ['Peterborough', 'Royaume-Uni'],
  ['Cwmbrân', 'Royaume-Uni'],
  ['Berlin', 'Allemagne'], ['Francfort', 'Allemagne'], ['Frankfurt', 'Allemagne'],
  ['Munich', 'Allemagne'], ['München', 'Allemagne'],
  ['Hamburg', 'Allemagne'], ['Hambourg', 'Allemagne'],
  ['Cologne', 'Allemagne'], ['Köln', 'Allemagne'],
  ['Düsseldorf', 'Allemagne'], ['Stuttgart', 'Allemagne'],
  ['Hanover', 'Allemagne'], ['Hannover', 'Allemagne'],
  ['Nuremberg', 'Allemagne'], ['Nürnberg', 'Allemagne'],
  ['Leipzig', 'Allemagne'], ['Dresden', 'Allemagne'],
  ['Brême', 'Allemagne'], ['Bremen', 'Allemagne'],
  ['Eschborn', 'Allemagne'], ['Neu-Isenburg', 'Allemagne'],
  ['Bad Homburg', 'Allemagne'], ['Halberstadt', 'Allemagne'],
  ['Markdorf', 'Allemagne'], ['Ratingen', 'Allemagne'],
  ['Madrid', 'Espagne'], ['Barcelone', 'Espagne'], ['Barcelona', 'Espagne'],
  ['Valence', 'Espagne'], ['Valencia', 'Espagne'],
  ['Séville', 'Espagne'], ['Sevilla', 'Espagne'],
  ['Bilbao', 'Espagne'], ['Malaga', 'Espagne'],
  ['Martos', 'Espagne'],
  ['Rome', 'Italie'], ['Roma', 'Italie'],
  ['Milan', 'Italie'], ['Milano', 'Italie'],
  ['Turin', 'Italie'], ['Torino', 'Italie'],
  ['Naples', 'Italie'], ['Napoli', 'Italie'],
  ['Florence', 'Italie'], ['Firenze', 'Italie'],
  ['Bologne', 'Italie'], ['Bologna', 'Italie'],
  ['Vérone', 'Italie'], ['Verona', 'Italie'],
  ['Venise', 'Italie'], ['Venezia', 'Italie'],
  ['Gênes', 'Italie'], ['Genova', 'Italie'],
  ['Palerme', 'Italie'], ['Palermo', 'Italie'],
  ['Catane', 'Italie'], ['Catania', 'Italie'],
  ['Amsterdam', 'Pays-Bas'], ['Rotterdam', 'Pays-Bas'],
  ['La Haye', 'Pays-Bas'], ['The Hague', 'Pays-Bas'], ['Den Haag', 'Pays-Bas'],
  ['Utrecht', 'Pays-Bas'], ['Eindhoven', 'Pays-Bas'],
  ['Groningen', 'Pays-Bas'], ['Maastricht', 'Pays-Bas'],
  ['Tilburg', 'Pays-Bas'], ['Nimègue', 'Pays-Bas'], ['Nijmegen', 'Pays-Bas'],
  ['Soesterberg', 'Pays-Bas'], ['Assen', 'Pays-Bas'],
  ['Apeldoorn', 'Pays-Bas'], ['Hoofddorp', 'Pays-Bas'],
  ['Almere', 'Pays-Bas'], ['Zoetermeer', 'Pays-Bas'],
  ['Bruxelles', 'Belgique'], ['Brussels', 'Belgique'],
  ['Anvers', 'Belgique'], ['Antwerp', 'Belgique'], ['Antwerpen', 'Belgique'],
  ['Gand', 'Belgique'], ['Gent', 'Belgique'],
  ['Liège', 'Belgique'], ['Luik', 'Belgique'],
  ['Charleroi', 'Belgique'], ['Namur', 'Belgique'],
  ['Mechelen', 'Belgique'], ['Hasselt', 'Belgique'],
  ['Lisbonne', 'Portugal'], ['Lisboa', 'Portugal'], ['Lisbon', 'Portugal'],
  ['Porto', 'Portugal'], ['Braga', 'Portugal'], ['Coimbra', 'Portugal'],
  ['Dublin', 'Irlande'],
  ['Varsovie', 'Pologne'], ['Warsaw', 'Pologne'], ['Warszawa', 'Pologne'],
  ['Cracovie', 'Pologne'], ['Krakow', 'Pologne'], ['Kraków', 'Pologne'],
  ['Prague', 'République tchèque'], ['Praha', 'République tchèque'],
  ['Budapest', 'Hongrie'], ['Bucarest', 'Roumanie'], ['Bucharest', 'Roumanie'],
  ['Copenhague', 'Danemark'], ['Copenhagen', 'Danemark'],
  ['Stockholm', 'Suède'], ['Oslo', 'Norvège'], ['Helsinki', 'Finlande'],
  ['Luxembourg', 'Luxembourg'], ['Luxemburg', 'Luxembourg'],
  ['Genève', 'Suisse'], ['Geneva', 'Suisse'], ['Zürich', 'Suisse'],
  ['Zurich', 'Suisse'], ['Bâle', 'Suisse'], ['Basel', 'Suisse'],
  ['Lausanne', 'Suisse'],
  ['Vienne', 'Autriche'], ['Vienna', 'Autriche'],
  ['Sofia', 'Bulgarie'], ['Zagreb', 'Croatie'],
  ['Ljubljana', 'Slovénie'], ['Bratislava', 'Slovaquie'],
  ['Tallinn', 'Estonie'], ['Riga', 'Lettonie'], ['Vilnius', 'Lituanie'],
  ['Montréal', 'Canada'],
];

// Construire un tableau trié par longueur décroissante (pour éviter les matchs partiels)
const ALL_CITY_ENTRIES: { city: string; country: string }[] = [
  ...FRENCH_CITIES.map(c => ({ city: c, country: 'France' })),
  ...EUROPEAN_CITIES.map(([city, country]) => ({ city, country })),
].sort((a, b) => b.city.length - a.city.length);

// ── Hash pour déduplication ────────────────────────────────────────────────
function hashTitle(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ── Charge les sources ─────────────────────────────────────────────────────
function loadSources(): NewsSourceEntry[] {
  if (!fs.existsSync(SOURCES_PATH)) {
    logInfo('Aucun fichier de sources trouvé.');
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf-8'));
  if (!Array.isArray(raw)) {
    logError('sources', 'Fichier de sources invalide (pas un tableau JSON).');
    return [];
  }
  return raw as NewsSourceEntry[];
}

// ── Charge la liste complète des SCPI ──────────────────────────────────────
function loadScpiList(): ScpiEntry[] {
  if (!fs.existsSync(SCPI_COMPLET_PATH)) {
    logInfo('scpi_complet.json introuvable.');
    return [];
  }
  try {
    const raw = JSON.parse(fs.readFileSync(SCPI_COMPLET_PATH, 'utf-8')) as Array<Record<string, unknown>>;
    const seen = new Set<string>();
    const list: ScpiEntry[] = [];
    for (const entry of raw) {
      const name = (entry['Nom SCPI'] as string) || '';
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      list.push({
        name,
        managementCompany: (entry['Société de gestion'] as string) || '',
        slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      });
    }
    return list;
  } catch {
    return [];
  }
}

// ── Déduplication des URLs entre sources ───────────────────────────────────
interface UrlGroup {
  targetUrl: string;
  sources: NewsSourceEntry[];
}

function groupSourcesByUrl(sources: NewsSourceEntry[]): UrlGroup[] {
  const map = new Map<string, UrlGroup>();
  for (const source of sources) {
    const targetUrl = source.rssUrl || source.newsUrl || source.officialUrl;
    if (!targetUrl) continue;
    const normalized = targetUrl.replace(/\/+$/, '');
    if (!map.has(normalized)) {
      map.set(normalized, { targetUrl: normalized, sources: [] });
    }
    map.get(normalized)!.sources.push(source);
  }
  return Array.from(map.values());
}

// ── Fetch avec timeout ─────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      throw new Error('Fichier binaire (PDF), ignoré.');
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

// ── Nettoie le HTML ────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  // Supprimer les éléments non-content uniquement
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, ' ')
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, ' ');

  // Remplacer les balises restantes par des espaces/sauts de ligne
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/g, '/')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

// ── Vérifie si le texte est du bruit (page éducative/guide) ────────────────
function isNoiseContent(text: string): boolean {
  const lower = text.substring(0, 2000).toLowerCase(); // Vérifier le début de la page
  const noiseScore = NOISE_KEYWORDS.filter(kw => lower.includes(kw)).length;
  // Si trop de mots-clés de bruit en début de page, c'est probablement une page guide
  return noiseScore >= 3;
}

// ── Extrait les liens internes pertinents ──────────────────────────────────
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const links: string[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1].trim();
    const text = (match[2] || '').toLowerCase();

    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    try {
      href = new URL(href, baseUrl).href;
    } catch { continue; }

    // Même domaine uniquement
    const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');
    const linkHost = new URL(href).hostname.replace(/^www\./, '');
    const baseDomain = baseHost.split('.').slice(-2).join('.');
    if (!linkHost.endsWith(baseDomain)) continue;

    if (seen.has(href)) continue;

    const combined = (href + ' ' + text).toLowerCase();
    const relevantWords = ['actualite', 'actualité', 'news', 'presse', 'communique', 'investissement', 'acquisition', 'achat', 'actif', 'asset', 'blog', 'article', 'publication', 'magazine', 'evenement', 'event', 'operation', 'réalisation', 'realisation'];
    const isRelevant = relevantWords.some(w => combined.includes(w));

    if (isRelevant && !href.includes('/tag/') && !href.includes('/category/') && !href.includes('/author/')) {
      seen.add(href);
      links.push(href);
    }
  }

  return links.slice(0, MAX_INTERNAL_LINKS);
}

// ── Détecte les blocs pertinents contenant des mots-clés d'acquisition ─────
function findAcquisitionBlocks(text: string): string[] {
  const lower = text.toLowerCase();

  // Vérifier les mots-clés forts
  const hasStrongKeyword = STRONG_ACQUISITION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
  const hasSecondaryKeyword = SECONDARY_ACQUISITION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));

  if (!hasStrongKeyword && !hasSecondaryKeyword) return [];

  // Découper en blocs
  const rawBlocks = text.split(/\n{2,}/).filter(b => {
    const trimmed = b.trim();
    return trimmed.length > 60 && trimmed.length < 15000;
  });

  const blocks: string[] = [];
  for (const block of rawBlocks) {
    const blockLower = block.toLowerCase();
    const strongMatches = STRONG_ACQUISITION_KEYWORDS.filter(kw => blockLower.includes(kw.toLowerCase())).length;
    const secondaryMatches = SECONDARY_ACQUISITION_KEYWORDS.filter(kw => blockLower.includes(kw.toLowerCase())).length;

    if (strongMatches >= 1 || secondaryMatches >= 2) {
      blocks.push(block.trim());
    }
  }

  return blocks;
}

// ── Extrait une date ───────────────────────────────────────────────────────
function extractDate(text: string): string {
  const months: Record<string, number> = {
    janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };

  // Format "22/5/2026" ou "22/05/2026"
  const slashDate = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (slashDate) {
    return `${slashDate[3]}-${String(parseInt(slashDate[2])).padStart(2, '0')}-${String(parseInt(slashDate[1])).padStart(2, '0')}`;
  }

  // Format "2026-05-22"
  const isoDate = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoDate) return isoDate[0];

  // Format "22 mai 2026" ou "22 May 2026"
  const namedDay = text.match(/\b(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
  if (namedDay) {
    const month = months[namedDay[2].toLowerCase()];
    if (month) return `${namedDay[3]}-${String(month).padStart(2, '0')}-${String(parseInt(namedDay[1])).padStart(2, '0')}`;
  }

  // Format "mai 2026" (approximatif)
  const namedMonth = text.match(/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
  if (namedMonth) {
    const month = months[namedMonth[1].toLowerCase()];
    if (month) return `${namedMonth[2]}-${String(month).padStart(2, '0')}-01`;
  }

  // Fallback : juste une année récente
  const yearMatch = text.match(/\b(20[2-9]\d)\b/);
  if (yearMatch) return `${yearMatch[1]}-01-01`;

  return '';
}

// ── Extrait une ville connue (la plus proche d'un mot-clé d'acquisition) ──
function extractCity(text: string): { city: string; country: string } {
  // Trouver la position du premier mot-clé d'acquisition fort
  let keywordPos = text.length;
  for (const kw of STRONG_ACQUISITION_KEYWORDS) {
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx >= 0 && idx < keywordPos) keywordPos = idx;
  }
  if (keywordPos === text.length) {
    for (const kw of SECONDARY_ACQUISITION_KEYWORDS) {
      const idx = text.toLowerCase().indexOf(kw.toLowerCase());
      if (idx >= 0 && idx < keywordPos) keywordPos = idx;
    }
  }

  let bestCity = '';
  let bestCountry = '';
  let bestDist = text.length;

  for (const { city, country } of ALL_CITY_ENTRIES) {
    const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const dist = Math.abs(match.index - keywordPos);
      // Pénalité pour les villes en début de page (navigation)
      const penalty = match.index < 300 ? 500 : 0;
      const effectiveDist = dist + penalty;
      if (effectiveDist < bestDist) {
        bestDist = effectiveDist;
        bestCity = city;
        bestCountry = country;
      }
    }
  }

  return { city: bestCity, country: bestCountry };
}

// ── Extrait un montant avec validation ─────────────────────────────────────
function extractAmount(text: string): string {
  // Chercher "XX M€" ou "XX millions d'euros"
  const mEuroPatterns = [
    /(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:million|M)\s*[€d]['´]?/i,
    /(\d{1,3}(?:[.,]\d{1,2})?)\s*millions?\s*d['´]?\s*euros?/i,
    /(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:million|M)\s*(?:EUR|€)/i,
  ];

  for (const pattern of mEuroPatterns) {
    const m = text.match(pattern);
    if (m) {
      const val = parseFloat(m[1].replace(/\s/g, '').replace(',', '.'));
      // Valider : pas > 2000 M€ pour une acquisition unique
      if (val < 1 || val > 2000) continue;
      return `${val} M€`;
    }
  }

  // Chercher "XX Md€" ou "XX milliards"
  const bEuroPatterns = [
    /(\d{1,3}(?:[.,]\d)?)\s*(?:milliard|Md|Bn)\s*d['´]?\s*€/i,
    /(\d{1,3}(?:[.,]\d{1,2})?)\s*milliards?\s*d['´]?\s*euros?/i,
  ];
  for (const pattern of bEuroPatterns) {
    const m = text.match(pattern);
    if (m) {
      const val = parseFloat(m[1].replace(/\s/g, '').replace(',', '.'));
      if (val < 0.1 || val > 100) continue;
      return `${val * 1000} M€`;
    }
  }

  // Chercher "XXX XXX €" ou "XXX.XXX €" (format brut)
  const rawEuro = text.match(/(\d[\d\s]*(?:[.,]\d{1,2})?)\s*€\b/);
  if (rawEuro) {
    const numStr = rawEuro[1].replace(/\s/g, '').replace(',', '.');
    const val = parseFloat(numStr);
    if (val < 1000 || val > 500_000_000) return 'Non communiqué';
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} M€`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} K€`;
    return `${val} €`;
  }

  return 'Non communiqué';
}

// ── Extrait une surface ────────────────────────────────────────────────────
function extractSurface(text: string): string {
  const patterns = [
    /(\d[\d\s]*(?:[.,]\d)?)\s*m[²2]\b/i,
    /(\d[\d\s]*(?:[.,]\d)?)\s*mètres?\s*carrés?\b/i,
    /(\d[\d\s]*(?:[.,]\d)?)\s*sq\s*m\b/i,
    /(\d[\d\s]*(?:[.,]\d)?)\s*sqm\b/i,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) {
      const val = parseInt(m[1].replace(/\s/g, ''), 10);
      if (val > 10 && val < 500_000) return `${m[1].replace(/\s/g, '')} m²`;
    }
  }
  return 'Non communiqué';
}

// ── Détecte le type d'actif ────────────────────────────────────────────────
function detectAssetType(text: string): AssetType {
  const lower = text.toLowerCase();
  for (const [assetType, keywords] of ASSET_TYPE_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return assetType;
    }
  }
  return 'autre_immobilier';
}

// ── Trouve la SCPI mentionnée dans le texte ────────────────────────────────
function findScpiName(text: string, allScpis: ScpiEntry[], sourceSources: NewsSourceEntry[]): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  // Chercher chaque SCPI de la source
  for (const source of sourceSources) {
    const scpiLower = source.name.toLowerCase();
    if (scpiLower.length > 3) {
      // Vérifier correspondance exacte
      if (lower.includes(scpiLower)) {
        found.add(source.name);
        continue;
      }
      // Vérifier correspondance partielle (premier mot significatif)
      const firstWord = scpiLower.split(/[\s-]/)[0];
      if (firstWord.length > 3 && lower.includes(firstWord)) {
        found.add(source.name);
        continue;
      }
    }
    // Chercher la société de gestion
    const mgmtLower = source.managementCompany.toLowerCase();
    if (mgmtLower.length > 3 && lower.includes(mgmtLower)) {
      found.add(source.name);
    }
  }

  // Si rien trouvé, chercher dans toutes les SCPI
  if (found.size === 0) {
    // Priorité : chercher le nom complet
    for (const scpi of allScpis) {
      const scpiLower = scpi.name.toLowerCase();
      if (scpiLower.length > 4 && lower.includes(scpiLower)) {
        found.add(scpi.name);
        break; // Prendre le premier match
      }
    }
  }

  return Array.from(found);
}

// ── Détermine operationType ────────────────────────────────────────────────
function detectOperationType(text: string): OperationType {
  const lower = text.toLowerCase();
  if (lower.includes('portefeuille') || lower.includes('portfolio') || lower.includes('ensemble immobilier') || lower.includes('plusieurs actifs')) return 'acquisition_portefeuille';
  if (lower.includes('VEFA') || lower.includes('vefa') || lower.includes('en l\'état futur d\'achèvement') || lower.includes('off-plan')) return 'acquisition_vefa';
  if (lower.includes('extension') || lower.includes('agrandissement')) return 'extension_patrimoine';
  return 'acquisition';
}

// ── Extrait titre et résumé ────────────────────────────────────────────────
function extractTitleAndSummary(block: string): { title: string; summary: string } {
  const cleaned = block.replace(/\s+/g, ' ').trim();

  // Essayer d'extraire un vrai titre (chercher des patterns d'acquisition)
  const titlePatterns = [
    /(?:Découvrez\s+notre\s+)?[Aa]cquisition\s+n[°º]\s*\d+\s*(?:à|:)?\s*.{10,80}/,
    /([^.]*(?:acquisition|acquiert|a acquis|achat|acheté)[^.]*\.)/i,
    /([^.]*(?:acquiert|a acquis|a acheté|vient d'acquérir)[^.]*\.)/i,
  ];

  let title = '';
  for (const pattern of titlePatterns) {
    const m = cleaned.match(pattern);
    if (m) {
      title = m[0].trim();
      if (title.length < 200) break;
      title = title.substring(0, 140);
      const lastSpaceTitle = title.lastIndexOf(' ');
      if (lastSpaceTitle > 60) title = title.substring(0, lastSpaceTitle) + '…';
      break;
    }
  }

  // Fallback : premiers 140 caractères, mais après les 100 premiers (skip nav)
  if (!title) {
    const startIdx = cleaned.length > 100 ? 100 : 0;
    title = cleaned.substring(startIdx, startIdx + Math.min(140, cleaned.length - startIdx));
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 60) title = title.substring(0, lastSpace) + '…';
  }

  const summary = cleaned.substring(0, Math.min(450, cleaned.length));

  return { title, summary };
}

// ── v3 : Validation stricte d'un bloc ──────────────────────────────────────
function validateBlock(
  block: string,
  scpiName: string,
  pageUrl: string,
): { valid: boolean; confidence: number; rejectionReason: string; flags: { acquisitionVerbDetected: boolean; realEstateAssetDetected: boolean; scpiDetected: boolean; rejectedByCorporateNoise: boolean } } {
  const lower = block.toLowerCase();

  // Condition 1 : SCPI identifiée
  const scpiDetected = scpiName && scpiName.length > 3;
  if (!scpiDetected) {
    return { valid: false, confidence: 0, rejectionReason: 'Aucune SCPI identifiée', flags: { acquisitionVerbDetected: false, realEstateAssetDetected: false, scpiDetected: false, rejectedByCorporateNoise: false } };
  }

  // Condition 2 : Verbe d'acquisition fort
  const acquisitionVerbDetected = ACQUISITION_VERBS.some(kw => lower.includes(kw.toLowerCase()));
  if (!acquisitionVerbDetected) {
    // Vérifier aussi les mots-clés forts originaux (compatibilité)
    const strongAcq = STRONG_ACQUISITION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
    if (!strongAcq) {
      return { valid: false, confidence: 0, rejectionReason: 'Aucun verbe d\'acquisition détecté', flags: { acquisitionVerbDetected: false, realEstateAssetDetected: false, scpiDetected: true, rejectedByCorporateNoise: false } };
    }
    // Si le mot-clé fort matche mais pas un verbe strict, on continue quand même (ex: "acquisition" dans le titre de la page)
  }

  // Condition 3 : Actif immobilier concret
  const realEstateAssetDetected = REAL_ESTATE_ASSETS.some(kw => lower.includes(kw.toLowerCase()));
  if (!realEstateAssetDetected) {
    return { valid: false, confidence: 0, rejectionReason: 'Aucun actif immobilier identifiable', flags: { acquisitionVerbDetected: acquisitionVerbDetected, realEstateAssetDetected: false, scpiDetected: true, rejectedByCorporateNoise: false } };
  }

  // ── Scoring ──
  let confidence = 0;

  // +40 si verbe d'acquisition fort
  if (acquisitionVerbDetected) confidence += 40;

  // +30 si actif immobilier identifiable
  if (realEstateAssetDetected) confidence += 30;

  // +20 si nom de SCPI détecté
  if (scpiDetected) confidence += 20;

  // +10 si ville ou pays détecté
  const { city, country } = extractCity(block);
  if (city || country) confidence += 10;

  // ── Vérification bruit corporate ──
  const rejectedByCorporateNoise = CORPORATE_REJECTION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));

  // -50 si expression de rejet détectée
  if (rejectedByCorporateNoise) {
    confidence -= 50;
  }

  // -30 si le contenu ressemble à une page institutionnelle (trop de mots corporate en proportion)
  const corporateIndicatorWords = ['management', 'fund', 'fonds', 'investor', 'investisseur', 'asset management', 'securities', 'bond', 'shareholder', 'actionnaire', 'regulated', 'regulation', 'compliance', 'risk management'];
  const corporateIndicatorCount = corporateIndicatorWords.filter(kw => lower.includes(kw)).length;
  if (corporateIndicatorCount >= 4) confidence -= 30;

  // Trouver la raison de rejet si applicable
  let rejectionReason = '';
  if (rejectedByCorporateNoise) {
    const matchedRejections = CORPORATE_REJECTION_KEYWORDS.filter(kw => lower.includes(kw.toLowerCase()));
    rejectionReason = `Bruit corporate : ${matchedRejections.slice(0, 3).join(', ')}`;
  }

  const valid = confidence >= 80 && acquisitionVerbDetected && realEstateAssetDetected && scpiDetected && !rejectedByCorporateNoise;
  if (!valid && !rejectionReason) {
    if (confidence < 80) rejectionReason = `Score de confiance insuffisant (${confidence}/100)`;
    else if (rejectedByCorporateNoise) rejectionReason = 'Rejeté par bruit corporate';
  }

  return {
    valid,
    confidence,
    rejectionReason,
    flags: { acquisitionVerbDetected, realEstateAssetDetected, scpiDetected, rejectedByCorporateNoise },
  };
}

// ── Traite une page HTML ───────────────────────────────────────────────────
function processPage(
  html: string,
  pageUrl: string,
  urlSources: NewsSourceEntry[],
  allScpis: ScpiEntry[],
  detectedAt: string,
): InvestmentNewsItem[] {
  const items: InvestmentNewsItem[] = [];
  const text = stripHtml(html);

  if (text.length < 100) return items;

  const blocks = findAcquisitionBlocks(text);
  if (blocks.length === 0) return items;

  for (const block of blocks) {
    const { title, summary } = extractTitleAndSummary(block);
    const date = extractDate(block);
    const { city, country } = extractCity(block);
    const amount = extractAmount(block);
    const surface = extractSurface(block);
    const assetType = detectAssetType(block);
    const operationType = detectOperationType(block);
    const scpiNames = findScpiName(block, allScpis, urlSources);

    // Si aucune SCPI identifiée dans le bloc, utiliser le nom de la première source
    const effectiveScpis = scpiNames.length > 0 ? scpiNames : urlSources.map(s => s.name);

    // Validation stricte v3
    for (const scpiName of effectiveScpis) {
      const validation = validateBlock(block, scpiName, pageUrl);

      if (!validation.valid) {
        rejectedItems.push({
          title: title || block.substring(0, 80),
          scpi: scpiName,
          sourceUrl: pageUrl,
          rejectionReason: validation.rejectionReason || 'Score insuffisant',
        });
        continue;
      }

      const source = urlSources.find(s => s.name === scpiName) || urlSources[0];

      const item: InvestmentNewsItem = {
        scpi: scpiName,
        managementCompany: source.managementCompany,
        operationType,
        assetType,
        country: country || 'Non communiqué',
        city: city || 'Non communiqué',
        area: '',
        address: '',
        tenant: 'Non communiqué',
        amount,
        surface,
        leaseDuration: 'Non communiqué',
        title: title || `${scpiName} : acquisition immobilière`,
        summary: summary || '',
        sourceUrl: pageUrl,
        sourceOfficial: true,
        date: date || '',
        detectedAt,
        investmentRelated: true,
        dataQuality: 'weak',
        editorialPriority: 0,
        confidence: validation.confidence / 100,
        disclaimer: DISCLAIMER,
        acquisitionVerbDetected: validation.flags.acquisitionVerbDetected,
        realEstateAssetDetected: validation.flags.realEstateAssetDetected,
        scpiDetected: validation.flags.scpiDetected,
        rejectedByCorporateNoise: validation.flags.rejectedByCorporateNoise,
        rejectionReason: '',
      };

      classifyItem(item);
      if (item.dataQuality !== 'weak' && item.editorialPriority > 0) {
        items.push(item);
      }
    }
  }

  return items;
}

// ── Traite une URL (page principale + liens internes) ──────────────────────
async function processUrl(
  targetUrl: string,
  urlSources: NewsSourceEntry[],
  allScpis: ScpiEntry[],
): Promise<InvestmentNewsItem[]> {
  const allItems: InvestmentNewsItem[] = [];
  const detectedAt = new Date().toISOString();

  // Utiliser le slug de la première source pour les logs
  const logSlug = urlSources[0].slug;

  // 1. Page principale
  let mainHtml: string | null = null;
  try {
    mainHtml = await fetchWithTimeout(targetUrl, FETCH_TIMEOUT_MS);
    if (!mainHtml) throw new Error('Réponse vide');
    totalPagesScanned++;
    scannedUrls.push(targetUrl);

    const mainItems = processPage(mainHtml, targetUrl, urlSources, allScpis, detectedAt);
    allItems.push(...mainItems);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    for (const src of urlSources) {
      logError(src.slug, `Échec fetch ${targetUrl} : ${msg}`);
    }
    return allItems;
  }

  // 2. Liens internes
  if (mainHtml) {
    const internalLinks = extractInternalLinks(mainHtml, targetUrl);
    for (let i = 0; i < internalLinks.length; i++) {
      const link = internalLinks[i];
      try {
        const subHtml = await fetchWithTimeout(link, FETCH_TIMEOUT_MS);
        if (!subHtml) continue;
        totalPagesScanned++;
        scannedUrls.push(link);
        const subItems = processPage(subHtml, link, urlSources, allScpis, detectedAt);
        allItems.push(...subItems);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Logguer seulement si ce n'est pas une erreur triviale
        if (!msg.includes('HTTP 404') && !msg.includes('HTTP 403') && !msg.includes('HTTP 401')) {
          logError(logSlug, `Échec lien ${link} : ${msg}`);
        }
      }
    }
  }

  return allItems;
}

// ── Classifie une actualité ────────────────────────────────────────────────
function classifyItem(item: InvestmentNewsItem): void {
  const hasLocation = !!(item.city && item.city !== 'Non communiqué');
  const hasCountry = !!(item.country && item.country !== 'Non communiqué');
  const hasAssetType = !!(item.assetType && item.assetType !== 'autre_immobilier');
  const hasSource = !!item.sourceUrl;
  let detailsCount = 0;
  if (item.amount !== 'Non communiqué') detailsCount++;
  if (item.surface !== 'Non communiqué') detailsCount++;
  if (item.tenant !== 'Non communiqué') detailsCount++;
  if (item.leaseDuration !== 'Non communiqué') detailsCount++;

  if (hasLocation && hasCountry && hasAssetType && hasSource && detailsCount >= 2) {
    item.dataQuality = 'complete';
    item.editorialPriority = 1;
    item.confidence = 0.9;
  } else if (hasLocation && hasAssetType && hasSource) {
    item.dataQuality = 'standard';
    item.editorialPriority = 2;
    item.confidence = 0.7;
  } else if (hasAssetType && hasSource && (hasLocation || detailsCount >= 1)) {
    item.dataQuality = 'partial';
    item.editorialPriority = 3;
    item.confidence = 0.5;
  } else {
    item.dataQuality = 'weak';
    item.editorialPriority = 0;
    item.confidence = 0.2;
  }

  if (!item.disclaimer) item.disclaimer = DISCLAIMER;
}

// ── Génère un ID unique ────────────────────────────────────────────────────
function generateId(item: InvestmentNewsItem): string {
  const raw = `${item.scpi}-${item.title}-${item.city || ''}-${item.date || ''}`;
  return hashTitle(raw);
}

// ── Fusionne avec l'historique ─────────────────────────────────────────────
function mergeWithHistory(newItems: InvestmentNewsItem[]): InvestmentNewsItem[] {
  const existing: InvestmentNewsItem[] = fs.existsSync(HISTORY_PATH)
    ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'))
    : [];
  const existingIds = new Set(existing.map(i => i.id));

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

// ── Génère le rapport ──────────────────────────────────────────────────────
function generateReport(sources: NewsSourceEntry[], allItems: InvestmentNewsItem[], newCount: number) {
  const today = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(REPORTS_DIR, `SCPI_INVESTMENT_NEWS_REPORT_${today}.md`);
  const activeSources = sources.filter(s => s.enabled);
  const incompleteSources = activeSources.filter(s => !s.rssUrl && !s.newsUrl && !s.officialUrl);
  const erroredSources = Object.keys(errorsBySource).filter(k => errorsBySource[k].length > 0);
  const successSources = activeSources.filter(s => !erroredSources.includes(s.slug) && !incompleteSources.includes(s) && (s.rssUrl || s.newsUrl || s.officialUrl));
  const priority1 = allItems.filter(i => i.editorialPriority === 1);
  const priority2 = allItems.filter(i => i.editorialPriority === 2);
  const priority3 = allItems.filter(i => i.editorialPriority === 3);

  const lines: string[] = [
    `# Derniers investissements immobiliers des SCPI — ${today}`,
    '',
    '## Synthèse',
    `- Sources chargées : ${sources.length}`,
    `- Sources actives : ${activeSources.length}`,
    `- Sources en erreur : ${erroredSources.length}`,
    `- Sources incomplètes : ${incompleteSources.length}`,
    `- Sources avec succès : ${successSources.length}`,
    `- Pages scannées : ${totalPagesScanned}`,
    `- Investissements détectés : ${allItems.length}`,
    `- Investissements conservés : ${priority1.length + priority2.length + priority3.length}`,
    `- Faux positifs rejetés : ${rejectedItems.length}`,
    `- Nouveaux investissements ajoutés : ${newCount}`,
    '',
  ];

  if (erroredSources.length > 0) {
    lines.push('## Sources en erreur');
    for (const src of erroredSources) {
      lines.push(`- **${src}** : ${errorsBySource[src].join(' ; ')}`);
    }
    lines.push('');
  }

  if (priority1.length + priority2.length + priority3.length === 0) {
    lines.push('## Sources sans acquisition réelle détectée');
    for (const src of successSources) {
      if (!erroredSources.includes(src.slug)) {
        lines.push(`- ${src.name} (${src.slug}) — ${src.notes || 'Aucune note'}`);
      }
    }
    lines.push('');
  }

  if (priority1.length > 0) {
    lines.push('## Investissements priorité 1');
    for (const item of priority1) {
      lines.push(`### ${item.title}`);
      lines.push(`- **SCPI** : ${item.scpi} (${item.managementCompany})`);
      lines.push(`- **Type d'actif** : ${item.assetType}`);
      lines.push(`- **Ville / Pays** : ${item.city}, ${item.country}`);
      lines.push(`- **Date** : ${item.date || 'Non communiquée'}`);
      if (item.amount !== 'Non communiqué') lines.push(`- **Montant** : ${item.amount}`);
      if (item.surface !== 'Non communiqué') lines.push(`- **Surface** : ${item.surface}`);
      if (item.tenant !== 'Non communiqué') lines.push(`- **Locataire** : ${item.tenant}`);
      lines.push(`- **Qualité de donnée** : ${item.dataQuality}`);
      lines.push(`- **Confiance** : ${Math.round(item.confidence * 100)}%`);
      lines.push(`- **Flags** : verbe=${item.acquisitionVerbDetected}, actif=${item.realEstateAssetDetected}, scpi=${item.scpiDetected}, rejeté=${item.rejectedByCorporateNoise}`);
      lines.push(`- ${item.summary}`);
      lines.push(`- [Source](${item.sourceUrl})`);
      lines.push('');
    }
  }

  if (priority2.length > 0) {
    lines.push('## Investissements priorité 2');
    for (const item of priority2) {
      lines.push(`- **${item.scpi}** — ${item.title}`);
      lines.push(`  - ${item.city || '?'}, ${item.country || '?'} — ${item.assetType}`);
      lines.push(`  - Date : ${item.date || '?'} | Qualité : ${item.dataQuality} | Confiance : ${Math.round(item.confidence * 100)}%`);
      lines.push(`  - Flags : verbe=${item.acquisitionVerbDetected}, actif=${item.realEstateAssetDetected}, scpi=${item.scpiDetected}`);
      lines.push(`  - [Source](${item.sourceUrl})`);
      lines.push('');
    }
  }

  if (priority3.length > 0) {
    lines.push('## Investissements priorité 3');
    for (const item of priority3) {
      lines.push(`- **${item.scpi}** — ${item.title} — [Source](${item.sourceUrl})`);
    }
    lines.push('');
  }

  // ── Faux positifs rejetés ──
  if (rejectedItems.length > 0) {
    lines.push('## Faux positifs rejetés');
    lines.push('');
    // Dédupliquer les rejets
    const seenRejects = new Set<string>();
    for (const item of rejectedItems) {
      const key = `${item.scpi}|${item.title}|${item.rejectionReason}`;
      if (seenRejects.has(key)) continue;
      seenRejects.add(key);
      lines.push(`- **${item.scpi}** : ${item.title}`);
      lines.push(`  - Raison : ${item.rejectionReason}`);
      lines.push(`  - [Source](${item.sourceUrl})`);
      lines.push('');
    }
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8');
  logInfo(`Rapport généré : ${reportPath}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  logInfo('=== SCPI Investment News Watcher v3 ===');
  logInfo(`Démarrage : ${new Date().toISOString()}`);
  console.log('');

  const allScpis = loadScpiList();
  logInfo(`${allScpis.length} SCPI chargées.`);

  const sources = loadSources();
  logInfo(`${sources.length} sources chargées.`);

  if (sources.length === 0) {
    logInfo('Aucune source. Fin.');
    return;
  }

  const activeSources = sources.filter(s => s.enabled);
  logInfo(`${activeSources.length} sources actives.`);

  // Grouper par URL pour éviter les doublons (même société de gestion)
  const urlGroups = groupSourcesByUrl(activeSources);
  logInfo(`${urlGroups.length} URLs uniques à traiter.`);
  console.log('');

  const allItems: InvestmentNewsItem[] = [];

  for (let i = 0; i < urlGroups.length; i++) {
    const group = urlGroups[i];
    const srcNames = group.sources.map(s => s.name).join(', ');
    const count = group.sources.length;
    logInfo(`[${i + 1}/${urlGroups.length}] ${srcNames} (${count} SCPI) → ${group.targetUrl}`);

    const items = await processUrl(group.targetUrl, group.sources, allScpis);
    if (items.length > 0) {
      logInfo(`  → ${items.length} acquisition(s) détectée(s)`);
    }
    allItems.push(...items);
    console.log('');
  }

  logInfo(`=== ${allItems.length} investissements détectés au total ===`);
  console.log('');

  // Dédupliquer
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    const key = `${item.sourceUrl}|${item.title}`;
    const hash = hashTitle(key);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
  logInfo(`${deduped.length} après déduplication.`);

  // Fusionner avec l'historique
  const previousHistory = fs.existsSync(HISTORY_PATH)
    ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'))
    : [];
  const history = mergeWithHistory(deduped);
  const newCount = history.length - (Array.isArray(previousHistory) ? previousHistory.length : 0);

  // Écrire les fichiers
  const displayable = history.filter(
    (i: InvestmentNewsItem) => i.dataQuality !== 'weak' && i.editorialPriority > 0,
  );

  fs.mkdirSync(path.dirname(LATEST_PATH), { recursive: true });
  fs.writeFileSync(LATEST_PATH, JSON.stringify(displayable, null, 2), 'utf-8');
  logInfo(`latest.json : ${displayable.length} investissements affichables.`);

  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
  logInfo(`history.json : ${history.length} investissements au total.`);

  generateReport(sources, history, newCount);

  console.log('');
  logInfo('═══════════════════════════════════════');
  logInfo('           RÉSUMÉ FINAL');
  logInfo('═══════════════════════════════════════');
  logInfo(`Sources chargées          : ${sources.length}`);
  logInfo(`Sources actives           : ${activeSources.length}`);
  logInfo(`URLs uniques traitées     : ${urlGroups.length}`);
  logInfo(`Sources incomplètes       : ${activeSources.filter(s => !s.rssUrl && !s.newsUrl && !s.officialUrl).length}`);
  logInfo(`Sources en erreur         : ${Object.keys(errorsBySource).length}`);
  logInfo(`Pages scannées            : ${totalPagesScanned}`);
  logInfo(`Investissements détectés  : ${deduped.length}`);
  logInfo(`Investissements conservés : ${displayable.length}`);
  logInfo(`  → Priorité 1 : ${displayable.filter(i => i.editorialPriority === 1).length}`);
  logInfo(`  → Priorité 2 : ${displayable.filter(i => i.editorialPriority === 2).length}`);
  logInfo(`  → Priorité 3 : ${displayable.filter(i => i.editorialPriority === 3).length}`);
  logInfo(`Faux positifs rejetés     : ${rejectedItems.length}`);
  logInfo(`Nouveaux ajouts           : ${newCount}`);
  logInfo('═══════════════════════════════════════');
  console.log('');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
