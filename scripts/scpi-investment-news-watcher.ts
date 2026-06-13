/**
 * SCPI Investment News Watcher v6.1 — Validation finale & anti-mojibake
 *
 * Modules :
 *   1.  Types & interfaces
 *   2.  Constantes & configuration
 *   3.  Source registry (chargement SCPI + sources)
 *   4.  HTML fetcher (fetch avec timeout)
 *   5.  Document discovery (liens PDF, pages doc, pages news)
 *   6.  PDF fetcher avec validation content-type (rejette HTML reçu comme PDF)
 *   7.  Text extraction & cleaning
 *   8.  Section extractor (fenêtres autour des sections positives)
 *   9.  Candidate builder (construction des items candidats)
 *  10.  Acquisition classifier (4 conditions + scoring >= 85)
 *  11.  False positive filter
 *  12.  Deduplicator
 *  13.  JSON writer (latest + history)
 *  14.  Markdown report writer (debug complet)
 *  15.  Internal tests
 *  16.  Main orchestrator
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// pdf-parse en dynamic import (compatibilité ESM)
let pdfParse: ((buf: Buffer) => Promise<{ text: string }>) | null = null;
async function getPdfParser() {
  if (!pdfParse) {
    try { pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse')); }
    catch { return null; }
  }
  return pdfParse;
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

type OperationType = 'acquisition' | 'acquisition_portefeuille' | 'acquisition_vefa' | 'extension_patrimoine' | 'livraison_actif';
type AssetType = 'bureaux' | 'commerce' | 'logistique' | 'sante' | 'education' | 'hotellerie' | 'residentiel_gere' | 'locaux_activite' | 'mixte' | 'portefeuille_multi_actifs' | 'autre_immobilier';
type DataQuality = 'complete' | 'standard' | 'partial' | 'weak';
type EditorialPriority = 0 | 1 | 2 | 3;
type SourceType = 'pdf_bulletin' | 'pdf_reporting' | 'pdf_semestriel' | 'pdf_annuel' | 'web_page' | 'press_release';
type PdfDocType = 'trimestriel' | 'semestriel' | 'annuel' | 'autre';
type ExtractionMethod = 'section_window' | 'full_text' | 'html_paragraph';
type RejectionReason =
  | 'SCPI absente'
  | 'actif immobilier absent'
  | 'signal acquisition absent'
  | 'bruit corporate'
  | 'section interdite'
  | 'texte trop générique'
  | 'HTML/navigation'
  | 'score insuffisant'
  | 'titre vide/court'
  | 'document exclu'
  | 'objet social'
  | 'ESG'
  | 'investissement historique'
  | 'document générique non rattaché à une SCPI'
  | 'encodage invalide'
  | 'OPPCI/fonds non SCPI'
  | 'multi-SCPI automatique';

interface FinalRejectionItem {
  scpi: string;
  title: string;
  sourceUrl: string;
  reason: string;
  documentTitle: string;
}

interface InvestmentNewsItem {
  id?: string;
  scpi: string; managementCompany: string;
  operationType: OperationType; assetType: AssetType;
  country: string; city: string; area: string; address: string;
  tenant: string; amount: string; surface: string; leaseDuration: string;
  title: string; summary: string;
  sourceUrl: string; sourceOfficial: boolean;
  sourceType: SourceType; documentTitle: string;
  date: string; detectedAt: string; investmentRelated: boolean;
  dataQuality: DataQuality; editorialPriority: EditorialPriority;
  confidence: number; disclaimer: string;
  // Flags v6
  scpiDetected: boolean;
  realEstateAssetDetected: boolean;
  acquisitionSignalDetected: boolean;
  heritageEntrySignalDetected: boolean;
  rejectedByCorporateNoise: boolean;
  sectionContext: string;
  extractionMethod: ExtractionMethod;
  rejectionReason: string;
}

interface RejectedBlockItem {
  extract: string;
  sourceUrl: string;
  reason: RejectionReason | string;
  detail?: string;
}

interface PdfAnalysisResult {
  company: string;
  pdfUrl: string;
  docType: PdfDocType;
  documentTitle: string;
  sectionsFound: number;
  candidateBlocks: number;
  decision: 'conservé' | 'rejeté' | 'pas_de_bloc' | 'html_recu_comme_pdf';
}

interface PdfRejectedAsHtml {
  url: string;
  company: string;
  reason: string;
}

interface NewsSourceEntry {
  slug: string; name: string; managementCompany: string;
  officialUrl: string; newsUrl: string; documentsUrl: string; rssUrl: string;
  enabled: boolean; notes: string;
}

interface ScpiEntry { name: string; managementCompany: string; slug: string; }

// ═══════════════════════════════════════════════════════════════════════════
//  2. CONSTANTES & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const USER_AGENT = 'MaximusSCPI-InvestmentNewsWatcher/2.0';
const FETCH_TIMEOUT_MS = 25_000;
const PDF_TIMEOUT_MS = 50_000;
const MAX_PAGES_PER_COMPANY = 25;
const MAX_PDFS_DETECTED = 20;
const MAX_PDFS_ANALYZED = 8;
const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const SOURCES_PATH = path.join(ROOT_DIR, 'data', 'scpi-investment-news-sources.json');
const SCPI_COMPLET_PATH = path.join(ROOT_DIR, 'src', 'data', 'scpi_complet.json');
const LATEST_PATH = path.join(ROOT_DIR, 'data', 'news', 'scpi-investment-news-latest.json');
const HISTORY_PATH = path.join(ROOT_DIR, 'data', 'news', 'scpi-investment-news-history.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const DISCLAIMER = 'Information factuelle issue d\'une source officielle. Ne constitue pas une recommandation d\'investissement.';

// ── Stats globales ────────────────────────────────────────────────────────
const errorsBySource: Record<string, string[]> = {};
let totalPagesScanned = 0;
let totalDocumentPagesScanned = 0;
let totalPdfsDetected = 0;
let totalPdfsReallyPdf = 0;
let totalPdfsRejectedAsHtml = 0;
let totalPdfsAnalyzed = 0;
let totalSectionsFound = 0;
let totalCandidateBlocks = 0;

const pdfAnalysisResults: PdfAnalysisResult[] = [];
const pdfsRejectedAsHtml: PdfRejectedAsHtml[] = [];
const rejectedBlockItems: RejectedBlockItem[] = [];
const finalRejectionItems: FinalRejectionItem[] = [];

function logError(src: string, msg: string) { if (!errorsBySource[src]) errorsBySource[src] = []; errorsBySource[src].push(msg); console.error(`[ERROR] ${src}: ${msg}`); }
function logInfo(msg: string) { console.log(`[INFO] ${msg}`); }

// ── Mots-clés — signaux d'acquisition ─────────────────────────────────────
const ACQUISITION_SIGNALS = [
  'acquisition', "l'acquisition", 'acquiert', 'acquièrent', 'a acquis', 'ont acquis',
  'acquisition de', 'acquisition d\'un', 'acquisition d\'une',
  "l'acquisition de", "l'acquisition d'un", "l'acquisition d'une",
  'acquisition du', 'acquisition des',
  'annonce l\'acquisition', 'vient d\'acquérir', 'vient d\'acheter',
  'a réalisé l\'acquisition', 'a signé l\'acquisition', 'a finalisé l\'acquisition',
  'a procédé à l\'acquisition',
  'achète', 'a acheté', 'ont acheté', 'acheté', 'achat de', "l'achat de",
  'investissement réalisé', 'investissement du trimestre',
  'acquired', 'acquisition of', 'purchase of', 'purchased',
  'has acquired', 'have acquired', 'acquires', 'buys', 'bought',
];

const HERITAGE_ENTRY_SIGNALS = [
  'entrée au patrimoine', 'entrées au patrimoine', 'entree au patrimoine',
  'intégré au patrimoine', 'a intégré le patrimoine', 'ont intégré le patrimoine',
  'patrimoine s\'est enrichi', 'patrimoine s\'est enrichi de',
  'actif entré en portefeuille', 'actifs entrés en portefeuille',
  'livraison d\'un actif', 'actif livré', 'actif livré en',
  'acquis en VEFA', 'acquis en vefa',
  'mise en exploitation', 'mis en exploitation',
  'nouvel actif', 'nouveaux actifs', 'nouvel immeuble',
  'nouveau bien', 'nouveau patrimoine',
  'entered the portfolio', 'new asset', 'new property',
];

// ── Actifs immobiliers concrets ────────────────────────────────────────────
const REAL_ESTATE_ASSETS = [
  'immeuble', 'immeubles', 'actif immobilier', 'actifs immobiliers',
  'bureaux', 'commerce', 'commerces', 'murs commerciaux',
  'retail park', 'centre commercial',
  'logistique', 'entrepôt', 'entrepôts', 'entrepot', 'entrepots', 'plateforme logistique',
  'locaux d\'activité', 'locaux d\'activités', 'locaux dactivite', 'locaux dactivites',
  'clinique', 'cliniques', 'laboratoire', 'maison médicale', 'maison de retraite',
  'ehpad', 'EHPAD', 'hôpital', 'hospital',
  'crèche', 'crèches', 'école', 'écoles', 'campus',
  'hôtel', 'hôtels', 'hotel', 'hotels',
  'résidence', 'résidentiel', 'residential', 'coliving', 'co-living',
  'portefeuille immobilier', 'ensemble immobilier',
  'office building', 'retail asset', 'logistics asset', 'warehouse',
  'healthcare asset', 'hotel property', 'residential property',
  'real estate asset', 'property',
];

// ── Bruit corporate / rejet automatique ────────────────────────────────────
const CORPORATE_NOISE = [
  'market analysis', 'inflation risks', 'central banks',
  'engagement and voting', 'voting policy', 'stewardship report',
  'esg document', 'esg report', 'rapport esg', 'social capital policy',
  'politique de vote', 'publication générale',
  'annual report', 'annual financial report', 'rapport annuel', 'rapport financier annuel',
  'dic', 'note d\'information', 'document d\'information clé',
  'management company', 'asset management division',
  'access the site', 'home page', 'menu', 'fermer',
  'en savoir plus', 'il est recommandé d\'investir',
  'meilleure scpi', 'rendement', 'taux de distribution',
  'performance', 'fiscalité', 'risques',
  'fonds', 'fund', 'opci', 'opcvm', 'securities', 'private debt',
  'nomination', 'interview', 'webinaire', 'webinar',
  'salon', 'prix', 'récompense', 'award', 'trophy',
  'collecte', 'souscription', 'capitalisation',
];

// ── Sections POSITIVES (bulletin / rapport) ────────────────────────────────
const POSITIVE_SECTIONS = [
  'faits marquants', 'faits marquants du trimestre', 'faits marquants du',
  'patrimoine', 'vie du patrimoine', 'évolution du patrimoine',
  'investissements', 'investissements réalisés', 'investissements du',
  'acquisitions', 'acquisitions du trimestre', 'acquisitions du',
  'activité immobilière', 'activite immobiliere', 'gestion immobilière',
  'nouveaux actifs', 'nouvel actif', 'entrées au patrimoine',
  'portefeuille immobilier', 'arbitrages', 'livraison', 'vefa',
  'stratégie immobilière', 'allocation immobilière',
  'événements du trimestre', 'evenements du trimestre',
  'opérations', 'operations', 'transactions',
];

// ── Sections NÉGATIVES (à ignorer) ─────────────────────────────────────────
const NEGATIVE_SECTIONS = [
  'performance', 'rendement', 'taux de distribution',
  'collecte', 'capitalisation', 'risques', 'fiscalité', 'frais',
  'gouvernance', 'esg', 'sfdr', 'vote', 'politique de vote', 'engagement',
  'dic', 'note d\'information', 'avertissement',
  'marché secondaire', 'souscription', 'retrait', 'liquidité',
  'rapport de gestion', 'commissaire aux comptes', 'glossaire',
];

// ── Rejet DOCUMENT (documentTitle / sourceUrl) ────────────────────────────
const DOCUMENT_REJECT_KEYWORDS = [
  'note d\'information', 'note d’information', 'note dinformation', 'note d&rsquo;information',
  'politique d\'engagement', 'politique d’engagement', 'politique engagement', 'politique esg',
  'esg', 'sfdr', 'dic', 'document d\'information clé', 'document d’information clé',
  'plaquette commerciale', 'présentation commerciale', 'présentation', 'presentation',
  'exemples d\'investissements passés', 'ne préjugeant pas',
  'ne préjugent pas',
  'objet social', 'registre du commerce', 'rcs', 'durée de la société',
  'exercice social', 'immatriculation',
  'oppci', 'venture real estate fund', 'fro',
  'fonds professionnel', 'fund',
  'politique de vote', 'engagement and voting', 'stewardship',
  'politique d\'engagement esg', 'politique d’engagement esg', 'politique d&rsquo;engagement',
  'politique de vote et d\'engagement',
];
const BLOCK_OBJET_SOCIAL = [
  'objet social', 'registre du commerce', 'rcs paris', 'rcs ',
  'durée de la société', 'immatriculation au registre', 'exercice social',
];
const BLOCK_HISTORICAL = [
  'exemple d\'investissement passé', 'exemples d\'investissements passés',
  'investissements passés', 'exemples d\'investissements',
  'ne préjugeant pas des investissements futurs',
  'ne préjugent pas des investissements futurs',
  'situation du patrimoine immobilier au 31/12',
  'situation du patrimoine au 31/12',
  'investissements passés ne préjugent',
];
const BLOCK_ESG_POLICY = [
  'grilles de notation esg', 'politique d\'engagement', 'label isr',
  'gouvernance', 'sfdr', 'politique de vote',
  'engagement and voting', 'stewardship report',
];
const BLOCK_OPPCI_FUND = [
  'oppci', 'venture real estate fund', 'fonds professionnel',
  'plaquette commerciale', 'fro',
];
const BLOCK_OLD_ACQUISITION = [
  'acquis au 3e trimestre 2022', 'acquis au 3 e trimestre 2022',
  'date d\'acquisition 2019', 'date d\'acquisition 2020',
  'date d\'acquisition 2021', 'date d\'acquisition 2022',
  'acquis au 4e trimestre 2019', 'acquis au 4e trimestre 2020',
  'acquis au 4e trimestre 2021', 'acquis au 4e trimestre 2022',
  'acquis en 2019', 'acquis en 2020', 'acquis en 2021', 'acquis en 2022',
];

// ── Encodage — patterns mojibake ──────────────────────────────────────────
const MOJIBAKE_PATTERNS = [
  'Ã©', 'Ã¨', 'Ã', 'Â', 'â€™', 'â€"', 'â€œ', 'â€',
  '&rsquo;', '&#8211;', '&#8212;', '&ndash;', '&mdash;',
  'CÅ"', 'CÅ', 'RÃ©', 'Mâ‚¬',
  'communiquÃ©', 'communiquÃ', 'dâ€™', 'lâ€™', 'nâ€™',
  'sâ€™', 'quâ€™',
];

// ── Nettoyage titres ───────────────────────────────────────────────────────
const TITLE_REJECT_PATTERNS = [
  /Il est recommandé d['´]investir/i,
  /En savoir plus/i, /Menu\s+Fermer/i,
  /^\s*Home\s*$/i, /Access the site/i,
];

const TITLE_CLEANUP_PATTERNS: [RegExp, string][] = [
  [/\s*Menu\s+Fermer\s*/gi, ' '], [/\s*-->\s*/g, ' '],
  [/\s*Aller au contenu\s*/gi, ' '],
  [/\s*Il est recommandé d['´]investir\s*\[?&hellip;\]?\s*/gi, ' '],
  [/\s*En savoir plus\s*/gi, ' '],
  [/\s*Partager l['´]article\s*:?\s*/gi, ' '],
  [/\s*LIRE L['´]ARTICLE\s*/gi, ' '],
  [/\s*VOIR LE\s*(?:COMMUNIQUÉ|BULLETIN)\s*(?:\(PDF\))?\s*/gi, ' '],
  [/\s*Mon espace\s+Souscrire\s*/gi, ' '],
  [/\s*Se connecter\s*/gi, ' '],
  [/\s*Devenir partenaire\s*/gi, ' '],
  [/\s*Pourquoi\s+\w+\s*\?\s*/gi, ' '],
  [/\s*01\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}\s*/g, ' '],
  [/\s*&[a-z]+;\s*/gi, ' '], [/\s{2,}/g, ' '],
];

// ── Asset type mapping ─────────────────────────────────────────────────────
const ASSET_TYPE_KEYWORDS: [AssetType, string[]][] = [
  ['bureaux', ['bureau', 'bureaux', 'office', 'tertiaire', 'siège social', 'siège', 'immeuble de bureaux']],
  ['commerce', ['commerce', 'commerces', 'retail', 'magasin', 'magasins', 'boutique', 'boutiques', 'centre commercial', 'galerie marchande', 'supermarché', 'supermarchés', 'retail park']],
  ['logistique', ['logistique', 'entrepôt', 'entrepôts', 'logistics', 'warehouse', 'plateforme logistique', 'messagerie', 'entrepot', 'entrepots']],
  ['sante', ['santé', 'clinique', 'cliniques', 'ehpad', 'EHPAD', 'maison de retraite', 'soins', 'médical', 'hospitalier', 'healthcare', 'hôpital', 'hospital', 'pharmacie', 'sante', 'laboratoire', 'maison médicale']],
  ['education', ['éducation', 'école', 'écoles', 'crèche', 'crèches', 'université', 'campus', 'education', 'school', 'nursery', 'etablissement scolaire']],
  ['hotellerie', ['hôtel', 'hôtels', 'hôtellerie', 'hotellerie', 'tourisme', 'hotel', 'hotels', 'resort', 'hébergement touristique']],
  ['residentiel_gere', ['résidentiel géré', 'résidentiel', 'logement', 'logements', 'résidence', 'residential', 'coliving', 'co-living', 'résidence services', 'résidence étudiante', 'résidence seniors', 'residence services']],
  ['locaux_activite', ['locaux d\'activité', 'locaux d\'activités', 'activité', 'atelier', 'ateliers', 'local industriel', 'locaux d\'activites', 'locaux dactivites']],
  ['mixte', ['mixte', 'usage mixte', 'mixed-use']],
  ['portefeuille_multi_actifs', ['portefeuille', 'portefeuille d\'actifs', 'multi-actifs', 'plusieurs actifs', 'ensemble immobilier', 'portfolio']],
];

// ── Villes ─────────────────────────────────────────────────────────────────
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
  ['Londres', 'Royaume-Uni'], ['London', 'Royaume-Uni'], ['Manchester', 'Royaume-Uni'], ['Birmingham', 'Royaume-Uni'],
  ['Liverpool', 'Royaume-Uni'], ['Leeds', 'Royaume-Uni'], ['Sheffield', 'Royaume-Uni'], ['Bristol', 'Royaume-Uni'],
  ['Newcastle', 'Royaume-Uni'], ['Cardiff', 'Royaume-Uni'], ['Belfast', 'Royaume-Uni'],
  ['Glasgow', 'Royaume-Uni'], ['Edinburgh', 'Royaume-Uni'], ['Édimbourg', 'Royaume-Uni'],
  ['Norwich', 'Royaume-Uni'], ['Peterborough', 'Royaume-Uni'], ['Cwmbrân', 'Royaume-Uni'],
  ['Berlin', 'Allemagne'], ['Francfort', 'Allemagne'], ['Frankfurt', 'Allemagne'],
  ['Munich', 'Allemagne'], ['München', 'Allemagne'], ['Hamburg', 'Allemagne'], ['Hambourg', 'Allemagne'],
  ['Cologne', 'Allemagne'], ['Köln', 'Allemagne'], ['Düsseldorf', 'Allemagne'], ['Stuttgart', 'Allemagne'],
  ['Hanover', 'Allemagne'], ['Hannover', 'Allemagne'], ['Nuremberg', 'Allemagne'], ['Nürnberg', 'Allemagne'],
  ['Leipzig', 'Allemagne'], ['Dresden', 'Allemagne'], ['Brême', 'Allemagne'], ['Bremen', 'Allemagne'],
  ['Eschborn', 'Allemagne'], ['Neu-Isenburg', 'Allemagne'], ['Bad Homburg', 'Allemagne'],
  ['Halberstadt', 'Allemagne'], ['Markdorf', 'Allemagne'], ['Ratingen', 'Allemagne'],
  ['Madrid', 'Espagne'], ['Barcelone', 'Espagne'], ['Barcelona', 'Espagne'], ['Valence', 'Espagne'],
  ['Valencia', 'Espagne'], ['Séville', 'Espagne'], ['Sevilla', 'Espagne'], ['Bilbao', 'Espagne'],
  ['Malaga', 'Espagne'], ['Martos', 'Espagne'],
  ['Rome', 'Italie'], ['Roma', 'Italie'], ['Milan', 'Italie'], ['Milano', 'Italie'],
  ['Turin', 'Italie'], ['Torino', 'Italie'], ['Naples', 'Italie'], ['Napoli', 'Italie'],
  ['Florence', 'Italie'], ['Firenze', 'Italie'], ['Bologne', 'Italie'], ['Bologna', 'Italie'],
  ['Vérone', 'Italie'], ['Verona', 'Italie'], ['Venise', 'Italie'], ['Venezia', 'Italie'],
  ['Gênes', 'Italie'], ['Genova', 'Italie'], ['Palerme', 'Italie'], ['Palermo', 'Italie'],
  ['Catane', 'Italie'], ['Catania', 'Italie'],
  ['Amsterdam', 'Pays-Bas'], ['Rotterdam', 'Pays-Bas'], ['La Haye', 'Pays-Bas'], ['The Hague', 'Pays-Bas'],
  ['Den Haag', 'Pays-Bas'], ['Utrecht', 'Pays-Bas'], ['Eindhoven', 'Pays-Bas'],
  ['Groningen', 'Pays-Bas'], ['Maastricht', 'Pays-Bas'], ['Tilburg', 'Pays-Bas'],
  ['Nimègue', 'Pays-Bas'], ['Nijmegen', 'Pays-Bas'], ['Soesterberg', 'Pays-Bas'],
  ['Assen', 'Pays-Bas'], ['Apeldoorn', 'Pays-Bas'], ['Hoofddorp', 'Pays-Bas'],
  ['Almere', 'Pays-Bas'], ['Zoetermeer', 'Pays-Bas'],
  ['Bruxelles', 'Belgique'], ['Brussels', 'Belgique'], ['Anvers', 'Belgique'], ['Antwerp', 'Belgique'],
  ['Antwerpen', 'Belgique'], ['Gand', 'Belgique'], ['Gent', 'Belgique'], ['Liège', 'Belgique'],
  ['Luik', 'Belgique'], ['Charleroi', 'Belgique'], ['Namur', 'Belgique'],
  ['Mechelen', 'Belgique'], ['Hasselt', 'Belgique'],
  ['Lisbonne', 'Portugal'], ['Lisboa', 'Portugal'], ['Lisbon', 'Portugal'],
  ['Porto', 'Portugal'], ['Braga', 'Portugal'], ['Coimbra', 'Portugal'],
  ['Dublin', 'Irlande'], ['Varsovie', 'Pologne'], ['Warsaw', 'Pologne'], ['Warszawa', 'Pologne'],
  ['Cracovie', 'Pologne'], ['Krakow', 'Pologne'], ['Kraków', 'Pologne'],
  ['Prague', 'Rép.tchèque'], ['Praha', 'Rép.tchèque'],
  ['Budapest', 'Hongrie'], ['Bucarest', 'Roumanie'], ['Bucharest', 'Roumanie'],
  ['Copenhague', 'Danemark'], ['Copenhagen', 'Danemark'],
  ['Stockholm', 'Suède'], ['Oslo', 'Norvège'], ['Helsinki', 'Finlande'],
  ['Luxembourg', 'Luxembourg'], ['Luxemburg', 'Luxembourg'],
  ['Genève', 'Suisse'], ['Geneva', 'Suisse'], ['Zürich', 'Suisse'], ['Zurich', 'Suisse'],
  ['Bâle', 'Suisse'], ['Basel', 'Suisse'], ['Lausanne', 'Suisse'],
  ['Vienne', 'Autriche'], ['Vienna', 'Autriche'],
  ['Sofia', 'Bulgarie'], ['Zagreb', 'Croatie'], ['Ljubljana', 'Slovénie'],
  ['Bratislava', 'Slovaquie'], ['Tallinn', 'Estonie'], ['Riga', 'Lettonie'],
  ['Vilnius', 'Lituanie'], ['Montréal', 'Canada'],
];
const ALL_CITY_ENTRIES: { city: string; country: string }[] = [
  ...FRENCH_CITIES.map(c => ({ city: c, country: 'France' })),
  ...EUROPEAN_CITIES.map(([city, country]) => ({ city, country })),
].sort((a, b) => b.city.length - a.city.length);

// ═══════════════════════════════════════════════════════════════════════════
//  3. SOURCE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

function hashTitle(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  return h.toString(36);
}

function loadSources(): NewsSourceEntry[] {
  if (!fs.existsSync(SOURCES_PATH)) { logInfo('Aucun fichier de sources trouvé.'); return []; }
  const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf-8'));
  if (!Array.isArray(raw)) { logError('sources', 'Fichier de sources invalide.'); return []; }
  return raw as NewsSourceEntry[];
}

function loadScpiList(): ScpiEntry[] {
  if (!fs.existsSync(SCPI_COMPLET_PATH)) { logInfo('scpi_complet.json introuvable.'); return []; }
  try {
    const raw = JSON.parse(fs.readFileSync(SCPI_COMPLET_PATH, 'utf-8')) as Array<Record<string, unknown>>;
    const seen = new Set<string>(); const list: ScpiEntry[] = [];
    for (const entry of raw) {
      const name = (entry['Nom SCPI'] as string) || '';
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      list.push({ name, managementCompany: (entry['Société de gestion'] as string) || '',
        slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') });
    }
    return list;
  } catch { return []; }
}

/** Priorité : documentsUrl > rssUrl > newsUrl > officialUrl */
function getPriorityUrl(s: NewsSourceEntry): string {
  return s.documentsUrl || s.rssUrl || s.newsUrl || s.officialUrl;
}

function groupByPriorityUrl(sources: NewsSourceEntry[]): Map<string, NewsSourceEntry[]> {
  const map = new Map<string, NewsSourceEntry[]>();
  for (const s of sources) {
    const url = getPriorityUrl(s);
    if (!url) continue;
    const norm = url.replace(/\/+$/, '');
    if (!map.has(norm)) map.set(norm, []);
    map.get(norm)!.push(s);
  }
  return map;
}

// ═══════════════════════════════════════════════════════════════════════════
//  4. HTML FETCHER
// ═══════════════════════════════════════════════════════════════════════════

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: ctrl.signal });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/pdf')) return null; // PDF — traité séparément
    return await r.text();
  } catch {
    return null;
  } finally { clearTimeout(t); }
}

// ═══════════════════════════════════════════════════════════════════════════
//  5. DOCUMENT DISCOVERY
// ═══════════════════════════════════════════════════════════════════════════

function extractAllLinks(html: string, baseUrl: string, max: number): { url: string; text: string }[] {
  const re = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const links: { url: string; text: string }[] = []; const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let href = m[1].trim(); const text = (m[2] || '').toLowerCase().replace(/<[^>]+>/g, ' ').trim();
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    try { href = new URL(href, baseUrl).href; } catch { continue; }
    const host = new URL(baseUrl).hostname.replace(/^www\./, '');
    const lh = new URL(href).hostname.replace(/^www\./, '');
    if (!lh.endsWith(host.split('.').slice(-2).join('.'))) continue;
    if (seen.has(href)) continue;
    seen.add(href); links.push({ url: href, text });
  }
  return links.slice(0, max);
}

function isDocumentPageLink(href: string, text: string): boolean {
  const kw = [
    'document', 'documentation', 'publication', 'ressource', 'reporting', 'reportings',
    'bulletin', 'bulletins', 'bulletin trimestriel', 'bulletin d\'information',
    'lettre trimestrielle', 'reporting trimestriel', 'rapport trimestriel',
    'quarterly', 'quarter', 't1', 't2', 't3', 't4', '1t', '2t', '3t', '4t',
    's1', 's2', '1s', '2s', 'h1', 'h2',
    'semestre', 'semestriel', 'semestrielle', 'rapport semestriel',
    'reporting semestriel', 'lettre semestrielle',
    'premier semestre', 'second semestre', 'deuxième semestre',
    'half-year', 'half yearly', 'half-yearly', 'semi-annual', 'semiannual',
    'rapport annuel', 'annual report', 'rapport de gestion',
    'rapports', 'télécharger', 'download', 'espace documentaire',
    'informations réglementaires', 'espace presse', 'centre de documentation',
    'informations légales', 'documents réglementaires',
    'espace investisseur', 'médiathèque', 'mediatheque',
  ];
  return kw.some(k => (href + ' ' + text).toLowerCase().includes(k));
}

function isPdfCandidate(href: string, text: string): boolean {
  const c = (href + ' ' + text).toLowerCase();
  if (href.toLowerCase().endsWith('.pdf')) return true;
  const kw = [
    'bulletin', 'reporting', 'rapport', 'trimestriel',
    't1-', 't2-', 't3-', 't4-', '1t', '2t', '3t', '4t',
    'quarterly', 'report', 'newsletter', 'lettre',
    's1-', 's2-', 's1 ', 's2 ', '1s', '2s', 'h1-', 'h2-', 'h1 ', 'h2 ',
    'semestre', 'semestriel', 'semestrielle',
    'half-year', 'half yearly', 'half-yearly', 'semi-annual', 'semiannual',
  ];
  return kw.some(k => c.includes(k));
}

function pdfRecencyScore(url: string, text: string): number {
  const c = (url + ' ' + text).toLowerCase();
  if (c.includes('s1 2026') || c.includes('s1-2026') || c.includes('1s2026') || c.includes('h1 2026') || c.includes('h1-2026')) return 100;
  if (c.includes('t1 2026') || c.includes('t1-2026') || c.includes('1t2026')) return 99;
  if (c.includes('2026')) return 95;
  if (c.includes('s2 2025') || c.includes('s2-2025') || c.includes('2s2025') || c.includes('h2 2025') || c.includes('h2-2025')) return 90;
  if (c.includes('t4 2025') || c.includes('t4-2025') || c.includes('4t2025')) return 85;
  if (c.includes('t3 2025') || c.includes('t3-2025') || c.includes('3t2025')) return 80;
  if (c.includes('s1 2025') || c.includes('s1-2025') || c.includes('1s2025') || c.includes('h1 2025') || c.includes('h1-2025')) return 75;
  if (c.includes('2025')) return 70;
  if (c.includes('trimestriel') || c.includes('trimestrielle')) return 50;
  if (c.includes('semestriel') || c.includes('semestrielle')) return 45;
  return 30;
}

function detectPdfDocType(url: string, text: string): PdfDocType {
  const c = (url + ' ' + text).toLowerCase();
  if (/s[12]|h[12]|semestr|half.year|semi.annual/i.test(c)) return 'semestriel';
  if (/t[1-4]|[1-4]t|trimestr|quarter/i.test(c)) return 'trimestriel';
  if (/annuel|annual|rapport.de.gestion/i.test(c)) return 'annuel';
  return 'autre';
}

function extractDocumentTitle(pdfUrl: string, linkText: string): string {
  if (linkText && linkText.length > 5 && linkText.length < 150) return linkText;
  const fn = pdfUrl.split('/').pop()?.replace(/\.pdf$/i, '') || '';
  return fn.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ═══════════════════════════════════════════════════════════════════════════
//  6. PDF FETCHER AVEC VALIDATION CONTENT-TYPE
// ═══════════════════════════════════════════════════════════════════════════

function isPdfBuffer(buf: Buffer): boolean {
  // Vérifie les magic bytes PDF : %PDF-
  if (buf.length < 5) return false;
  const head = buf.subarray(0, 5).toString('utf-8');
  return head === '%PDF-';
}

function isHtmlLikeBuffer(buf: Buffer): boolean {
  if (buf.length < 15) return false;
  const head = buf.subarray(0, 100).toString('utf-8').trim().toLowerCase();
  return head.includes('<!doctype html') || head.includes('<html') || head.includes('<script');
}

async function fetchPdfBuffer(url: string): Promise<Buffer | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PDF_TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  } catch { return null; }
}

async function extractPdfText(buf: Buffer): Promise<string> {
  try {
    const parser = await getPdfParser();
    if (!parser) return '';
    const data = await parser(buf);
    return (data.text || '').replace(/\s+/g, ' ').trim();
  } catch { return ''; }
}

// ═══════════════════════════════════════════════════════════════════════════
//  7. TEXT EXTRACTION & CLEANING
// ═══════════════════════════════════════════════════════════════════════════

function stripHtml(html: string): string {
  let c = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, ' ')
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n').replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n').replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&#x2F;/g, '/')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, '-').replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, ' ').trim();
  return c;
}

function cleanTitle(raw: string): string {
  let t = raw;
  for (const [p, r] of TITLE_CLEANUP_PATTERNS) t = t.replace(p, r);
  return t.replace(/\s{2,}/g, ' ').trim();
}

function shouldRejectTitle(title: string): boolean {
  return TITLE_REJECT_PATTERNS.some(p => p.test(title));
}

function hasHtmlFragments(text: string): boolean {
  const frags = ['Menu', 'Fermer', '-->', '&hellip;', '&rsquo;', '&ndash;',
    'En savoir plus', 'Il est recommandé', 'Presse', 'Aller au contenu',
    'Mon espace', 'Souscrire', 'Se connecter', 'Devenir partenaire'];
  const hasFrag = frags.some(f => text.includes(f));
  const nav = [/\bMenu\s+Fermer\b/, /-->\s*Presse/, /En savoir plus\s*-->/,
    /Mon espace\s+Souscrire/, /Se connecter/, /Devenir partenaire/];
  return hasFrag || nav.some(p => p.test(text));
}

// ═══════════════════════════════════════════════════════════════════════════
//  8. SECTION EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════

function extractSectionsFromPdf(text: string): { section: string; content: string }[] {
  const results: { section: string; content: string }[] = [];
  const lower = text.toLowerCase();

  for (const secKw of POSITIVE_SECTIONS) {
    let idx = 0;
    while (idx < lower.length) {
      const pos = lower.indexOf(secKw, idx);
      if (pos === -1) break;
      const start = Math.max(0, pos - 100);
      const end = Math.min(text.length, pos + 2500);
      const window = text.substring(start, end);
      results.push({ section: secKw, content: window.trim() });
      idx = pos + 100;
    }
  }

  totalSectionsFound += results.length;
  if (results.length === 0 && text.length > 200) {
    results.push({ section: 'texte_complet', content: text.substring(0, 10000) });
  }
  return results;
}

function filterNegativeSections(sections: { section: string; content: string }[]): { section: string; content: string }[] {
  return sections.filter(s => {
    if (s.section === 'texte_complet') return true;
    const l = s.section.toLowerCase();
    const hasNeg = NEGATIVE_SECTIONS.some(ns => l.includes(ns));
    if (hasNeg) {
      const hasPosNearby = POSITIVE_SECTIONS.some(ps => s.content.toLowerCase().includes(ps));
      return hasPosNearby;
    }
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  9. CANDIDATE BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function splitIntoBlocks(text: string): string[] {
  return text.split(/\n{2,}/).filter(b => { const t = b.trim(); return t.length >= 80 && t.length < 15000; });
}

function hasAcquisitionSignal(text: string): boolean {
  const t = text.toLowerCase();
  return ACQUISITION_SIGNALS.some(kw => {
    const k = kw.toLowerCase();
    return t.includes(k) || t.includes(k.replace(/'/g, "’"));
  });
}

function hasHeritageEntrySignal(text: string): boolean {
  const t = text.toLowerCase();
  return HERITAGE_ENTRY_SIGNALS.some(kw => {
    const k = kw.toLowerCase();
    if (t.includes(k)) return true;
    // Variante avec apostrophe typographique
    return t.includes(k.replace(/'/g, "’"));
  });
}

function findCandidateBlocks(text: string): { block: string; sectionContext: string }[] {
  const blocks = splitIntoBlocks(text);
  return blocks
    .filter(b => hasAcquisitionSignal(b) || hasHeritageEntrySignal(b))
    .map(b => ({ block: b.trim(), sectionContext: '' }));
}

function findCandidateBlocksWithContext(
  text: string, sectionName: string,
): { block: string; sectionContext: string }[] {
  const candidates = findCandidateBlocks(text);
  return candidates.map(c => ({ ...c, sectionContext: sectionName }));
}

// ── Extraction de données ──────────────────────────────────────────────────
const months: Record<string, number> = { janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12, january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };

function extractDate(t: string): string {
  const sd = t.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (sd) return `${sd[3]}-${String(parseInt(sd[2])).padStart(2, '0')}-${String(parseInt(sd[1])).padStart(2, '0')}`;
  const iso = t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];
  const nd = t.match(/\b(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
  if (nd) { const mo = months[nd[2].toLowerCase()]; if (mo) return `${nd[3]}-${String(mo).padStart(2, '0')}-${String(parseInt(nd[1])).padStart(2, '0')}`; }
  const nm = t.match(/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
  if (nm) { const mo = months[nm[1].toLowerCase()]; if (mo) return `${nm[2]}-${String(mo).padStart(2, '0')}-01`; }
  const ym = t.match(/\b(20[2-9]\d)\b/);
  if (ym) return `${ym[1]}-01-01`;
  return '';
}

function extractCity(t: string): { city: string; country: string } {
  let kwPos = t.length;
  for (const kw of ACQUISITION_SIGNALS) { const idx = t.toLowerCase().indexOf(kw.toLowerCase()); if (idx >= 0 && idx < kwPos) kwPos = idx; }
  let bc = '', bCtry = '', bd = t.length;
  for (const { city, country } of ALL_CITY_ENTRIES) {
    const esc = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${esc}\\b`, 'gi'); let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      const d = Math.abs(m.index - kwPos); const p = m.index < 300 ? 500 : 0;
      if (d + p < bd) { bd = d + p; bc = city; bCtry = country; }
    }
  }
  return { city: bc, country: bCtry };
}

function extractAmount(t: string): string {
  const mep = [/(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:million|M)\s*[€d]['´]?/i, /(\d{1,3}(?:[.,]\d{1,2})?)\s*millions?\s*d['´]?\s*euros?/i];
  for (const p of mep) { const m = t.match(p); if (m) { const v = parseFloat(m[1].replace(/\s/g, '').replace(',', '.')); if (v >= 1 && v <= 2000) return `${v} M€`; } }
  const re = t.match(/(\d[\d\s]*(?:[.,]\d{1,2})?)\s*€\b/);
  if (re) { const v = parseFloat(re[1].replace(/\s/g, '').replace(',', '.')); if (v >= 1000 && v <= 500000000) { if (v >= 1000000) return `${(v / 1000000).toFixed(1)} M€`; if (v >= 1000) return `${(v / 1000).toFixed(0)} K€`; return `${v} €`; } }
  return 'Non communiqué';
}

function extractSurface(t: string): string {
  // Regex sans \b après m² (le caractère Unicode ² casse le \b en JS)
  const ps = [/(\d[\d\s]*(?:[.,]\d)?)\s*m[²2]/i, /(\d[\d\s]*(?:[.,]\d)?)\s*mètres?\s*carrés?\b/i, /(\d[\d\s]*(?:[.,]\d)?)\s*sq\s*m\b/i, /(\d[\d\s]*(?:[.,]\d)?)\s*sqm\b/i];
  for (const p of ps) { const m = t.match(p); if (m) { const v = parseInt(m[1].replace(/\s/g, ''), 10); if (v > 10 && v < 500000) return `${m[1].replace(/\s/g, '')} m²`; } }
  return 'Non communiqué';
}

function detectAssetTypeFn(t: string): AssetType {
  const l = t.toLowerCase();
  for (const [at, kws] of ASSET_TYPE_KEYWORDS) for (const kw of kws) if (l.includes(kw)) return at;
  return 'autre_immobilier';
}

function findScpiName(t: string, all: ScpiEntry[], srcs: NewsSourceEntry[]): string[] {
  const l = t.toLowerCase(); const f = new Set<string>();
  for (const s of srcs) {
    const sl = s.name.toLowerCase();
    if (sl.length > 4 && l.includes(sl)) { f.add(s.name); }
  }
  if (f.size === 0) for (const scpi of all) { const sl = scpi.name.toLowerCase(); if (sl.length > 4 && l.includes(sl)) { f.add(scpi.name); break; } }
  return Array.from(f);
}

function detectOperationTypeFn(t: string): OperationType {
  const l = t.toLowerCase();
  if (l.includes('portefeuille') || l.includes('portfolio') || l.includes('ensemble immobilier') || l.includes('plusieurs actifs')) return 'acquisition_portefeuille';
  if (l.includes('VEFA') || l.includes('vefa') || l.includes('en l\'état futur d\'achèvement') || l.includes('off-plan')) return 'acquisition_vefa';
  if (l.includes('extension') || l.includes('agrandissement')) return 'extension_patrimoine';
  if (l.includes('livraison') && (l.includes('actif') || l.includes('immeuble'))) return 'livraison_actif';
  return 'acquisition';
}

function extractTitleAndSummary(block: string): { title: string; summary: string } {
  const c = block.replace(/\s+/g, ' ').trim();
  const tps = [
    /(?:Découvrez\s+notre\s+)?[Aa]cquisition\s+n[°º]\s*\d+\s*(?:à|:)?\s*.{10,80}/,
    /([^.]*(?:acquisition|acquiert|a acquis|achat|acheté)[^.]*\.)/i,
    /([^.]*(?:acquiert|a acquis|a acheté|vient d'acquérir)[^.]*\.)/i,
  ];
  let t = '';
  for (const p of tps) { const m = c.match(p); if (m) { t = m[0].trim(); if (t.length < 200) break; } }
  if (!t) { const si = c.length > 100 ? 100 : 0; t = c.substring(si, si + Math.min(140, c.length - si)); const ls = t.lastIndexOf(' '); if (ls > 60) t = t.substring(0, ls) + '…'; }
  return { title: t, summary: c.substring(0, Math.min(450, c.length)) };
}

// ═══════════════════════════════════════════════════════════════════════════
//  10. ACQUISITION CLASSIFIER (4 conditions + scoring >= 85)
// ═══════════════════════════════════════════════════════════════════════════

interface ClassificationResult {
  valid: boolean;
  confidence: number;
  reason: string;
  flags: {
    scpiDetected: boolean;
    realEstateAssetDetected: boolean;
    acquisitionSignalDetected: boolean;
    heritageEntrySignalDetected: boolean;
    rejectedByCorporateNoise: boolean;
  };
}

function classify(input: {
  block: string;
  scpiName: string;
  sourceType: SourceType;
  sectionContext: string;
}): ClassificationResult {
  const l = input.block.toLowerCase();

  const scpiDetected = input.scpiName && input.scpiName.length > 3;
  if (!scpiDetected) return { valid: false, confidence: 0, reason: 'SCPI absente', flags: { scpiDetected: false, realEstateAssetDetected: false, acquisitionSignalDetected: false, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false } };

  const acqSignal = hasAcquisitionSignal(input.block);
  const heritageSignal = hasHeritageEntrySignal(input.block);
  if (!acqSignal && !heritageSignal) return { valid: false, confidence: 0, reason: 'signal acquisition absent', flags: { scpiDetected: true, realEstateAssetDetected: false, acquisitionSignalDetected: false, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false } };

  const realEst = REAL_ESTATE_ASSETS.some(kw => l.includes(kw.toLowerCase()));
  if (!realEst) return { valid: false, confidence: 0, reason: 'actif immobilier absent', flags: { scpiDetected: true, realEstateAssetDetected: false, acquisitionSignalDetected: acqSignal, heritageEntrySignalDetected: heritageSignal, rejectedByCorporateNoise: false } };

  // Scoring
  let conf = 0;
  if (scpiDetected) conf += 30;
  if (realEst) conf += 30;
  if (acqSignal) conf += 30;
  if (heritageSignal) conf += 20;

  const { city, country } = extractCity(input.block);
  if (city || country) conf += 10;

  const st = input.sourceType;
  if (st === 'pdf_bulletin' || st === 'pdf_reporting' || st === 'pdf_semestriel' || st === 'press_release') conf += 10;

  if (input.sectionContext && POSITIVE_SECTIONS.some(s => input.sectionContext.includes(s))) conf += 10;

  // Malus
  if (hasHtmlFragments(input.block)) conf -= 60;

  const corpNoise = CORPORATE_NOISE.some(kw => l.includes(kw.toLowerCase()));
  if (corpNoise) conf -= 50;

  // Section négative
  if (NEGATIVE_SECTIONS.some(ns => l.includes(ns)) && !POSITIVE_SECTIONS.some(ps => l.includes(ps))) {
    conf -= 40;
  }

  // Trop générique
  const genericWords = ['asset', 'investment', 'portfolio', 'management', 'market', 'fund', 'securities'];
  const genericCount = genericWords.filter(kw => l.includes(kw)).length;
  const concreteWords = ['immeuble', 'bureaux', 'commerce', 'logistique', 'santé', 'hôtel', 'entrepôt', 'clinique', 'acquisition de', 'a acquis', 'a acheté'];
  const concreteCount = concreteWords.filter(kw => l.includes(kw)).length;
  if (genericCount >= 4 && concreteCount <= 1) conf -= 30;

  // Absence de localisation ET absence de détail concret
  if (!city && !country && extractAmount(input.block) === 'Non communiqué' && extractSurface(input.block) === 'Non communiqué') {
    conf -= 30;
  }

  let reason = '';
  if (corpNoise) { const m = CORPORATE_NOISE.filter(kw => l.includes(kw.toLowerCase())); reason = `bruit corporate: ${m.slice(0, 3).join(', ')}`; }
  else if (hasHtmlFragments(input.block)) reason = 'HTML/navigation';

  const valid = conf >= 85 && scpiDetected && realEst && (acqSignal || heritageSignal) && !corpNoise;
  if (!valid && !reason) { if (conf < 85) reason = `score insuffisant (${conf}/100 < 85)`; }

  return { valid, confidence: conf, reason, flags: { scpiDetected, realEstateAssetDetected: realEst, acquisitionSignalDetected: acqSignal, heritageEntrySignalDetected: heritageSignal, rejectedByCorporateNoise: corpNoise } };
}

// ═══════════════════════════════════════════════════════════════════════════
//  11. FALSE POSITIVE FILTER
// ═══════════════════════════════════════════════════════════════════════════

function buildRejectionDetail(res: ClassificationResult): RejectionReason {
  if (!res.flags.scpiDetected) return 'SCPI absente';
  if (!res.flags.realEstateAssetDetected) return 'actif immobilier absent';
  if (!res.flags.acquisitionSignalDetected && !res.flags.heritageEntrySignalDetected) return 'signal acquisition absent';
  if (res.flags.rejectedByCorporateNoise) return 'bruit corporate';
  if (res.confidence < 85) return 'score insuffisant';
  if (res.reason.includes('HTML')) return 'HTML/navigation';
  if (res.reason.includes('section')) return 'section interdite';
  return 'texte trop générique';
}

// ═══════════════════════════════════════════════════════════════════════════
//  12. DEDUPLICATOR
// ═══════════════════════════════════════════════════════════════════════════

function deduplicateItems(items: InvestmentNewsItem[]): InvestmentNewsItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = `${item.sourceUrl}|${item.scpi}|${item.city}|${item.assetType}|${hashTitle(item.title)}`;
    if (seen.has(key)) return false; seen.add(key); return true;
  });
}

// ── Classification de qualité ──────────────────────────────────────────────
function classifyQuality(item: InvestmentNewsItem): void {
  const hl = !!(item.city && item.city !== 'Non communiqué');
  const hc = !!(item.country && item.country !== 'Non communiqué');
  const ha = item.assetType !== 'autre_immobilier';
  let det = 0;
  if (item.amount !== 'Non communiqué') det++;
  if (item.surface !== 'Non communiqué') det++;
  if (item.tenant !== 'Non communiqué') det++;

  if (hl && hc && ha && det >= 2) { item.dataQuality = 'complete'; item.editorialPriority = 1; }
  else if (hl && ha) { item.dataQuality = 'standard'; item.editorialPriority = 2; }
  else if (ha && (hl || det >= 1)) { item.dataQuality = 'partial'; item.editorialPriority = 3; }
  else { item.dataQuality = 'weak'; item.editorialPriority = 0; }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PROCESS CANDIDATES → ITEMS
// ═══════════════════════════════════════════════════════════════════════════

function cleanEncodingText(text: string): { cleaned: string; hasMojibake: boolean } {
  let t = text;
  let hasMojibake = false;
  for (const p of MOJIBAKE_PATTERNS) {
    if (t.includes(p)) { hasMojibake = true; break; }
  }
  // Tentative de nettoyage des HTML entities résiduelles
  t = t.replace(/&rsquo;/g, "'")
       .replace(/&lsquo;/g, "'")
       .replace(/&ndash;/g, '-')
       .replace(/&mdash;/g, '—')
       .replace(/&#8211;/g, '-')
       .replace(/&#8212;/g, '—')
       .replace(/&#8217;/g, "'");
  return { cleaned: t, hasMojibake };
}

function isDocumentExcluded(documentTitle: string, sourceUrl: string, blockText: string): { excluded: boolean; reason: string } {
  const combined = (documentTitle + ' ' + blockText + ' ' + sourceUrl).toLowerCase();
  for (const kw of DOCUMENT_REJECT_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) {
      if (kw.includes('esg') || kw.includes('engagement') || kw.includes('vote') || kw.includes('stewardship'))
        return { excluded: true, reason: 'ESG' };
      if (kw.includes('objet social') || kw.includes('registre') || kw.includes('rcs') || kw.includes('durée') || kw.includes('immatriculation') || kw.includes('exercice social'))
        return { excluded: true, reason: 'objet social' };
      if (kw.includes('oppci') || kw.includes('venture real estate') || kw.includes('fro') || kw.includes('fonds professionnel') || kw.includes('fund'))
        return { excluded: true, reason: 'OPPCI/fonds non SCPI' };
      if (kw.includes('plaquette') || kw.includes('présentation') || kw.includes('presentation'))
        return { excluded: true, reason: 'document exclu' };
      return { excluded: true, reason: 'document exclu' };
    }
  }
  return { excluded: false, reason: '' };
}

function isObjetSocial(block: string): boolean {
  const l = block.toLowerCase();
  return BLOCK_OBJET_SOCIAL.some(kw => l.includes(kw.toLowerCase()));
}

function isHistoricalExample(block: string): boolean {
  const l = block.toLowerCase();
  return BLOCK_HISTORICAL.some(kw => l.includes(kw.toLowerCase()))
    || BLOCK_OLD_ACQUISITION.some(kw => l.includes(kw.toLowerCase()));
}

function isEsgContent(block: string): boolean {
  const l = block.toLowerCase();
  return BLOCK_ESG_POLICY.some(kw => l.includes(kw.toLowerCase()));
}

function isOppciFund(block: string): boolean {
  const l = block.toLowerCase();
  return BLOCK_OPPCI_FUND.some(kw => l.includes(kw.toLowerCase()));
}

function finalValidateAcquisition(
  item: InvestmentNewsItem,
  block: string,
): { valid: boolean; reason: string } {
  const blockLower = block.toLowerCase();
  const docTitle = (item.documentTitle || '').toLowerCase();
  const srcUrl = (item.sourceUrl || '').toLowerCase();

  // Vérifier d'abord les blocs — priorité sur le document-level
  // car un bloc peut être générique même si le document est valide

  // 1. Objet social
  if (isObjetSocial(block)) return { valid: false, reason: 'objet social' };

  // 2. Exemples historiques
  if (isHistoricalExample(block)) return { valid: false, reason: 'investissement historique' };

  // 3. ESG / politique
  if (isEsgContent(block)) return { valid: false, reason: 'ESG' };

  // 4. OPPCI / fonds non SCPI
  if (isOppciFund(block)) return { valid: false, reason: 'OPPCI/fonds non SCPI' };

  // 5. Document exclu (note d'info, ESG, plaquette commerciale, OPPCI, objet social...)
  const docCheck = isDocumentExcluded(item.documentTitle, item.sourceUrl, block);
  if (docCheck.excluded) return { valid: false, reason: docCheck.reason };

  // 6. Encodage — vérifier le title, summary, documentTitle
  const titleCheck = cleanEncodingText(item.title);
  const summaryCheck = cleanEncodingText(item.summary);
  const dtitleCheck = cleanEncodingText(item.documentTitle);
  if (titleCheck.hasMojibake || summaryCheck.hasMojibake || dtitleCheck.hasMojibake) {
    return { valid: false, reason: 'encodage invalide' };
  }

  // 7. SCPI explicitement rattachée : le nom doit être dans le bloc
  const scpiInBlock = blockLower.includes(item.scpi.toLowerCase()) ||
    blockLower.includes(item.scpi.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâ]/g, 'a'));
  if (!scpiInBlock) {
    return { valid: false, reason: 'document générique non rattaché à une SCPI' };
  }

  return { valid: true, reason: '' };
}

function processCandidates(
  candidates: { block: string; sectionContext: string }[],
  pageUrl: string, urlSources: NewsSourceEntry[],
  allScpis: ScpiEntry[], detectedAt: string,
  sourceType: SourceType, documentTitle: string, method: ExtractionMethod,
): { items: InvestmentNewsItem[] } {
  const items: InvestmentNewsItem[] = [];

  for (const { block, sectionContext } of candidates) {
    const raw = extractTitleAndSummary(block);
    const title = cleanTitle(raw.title);
    if (shouldRejectTitle(title)) {
      rejectedBlockItems.push({ extract: title || block.substring(0, 80), sourceUrl: pageUrl, reason: 'HTML/navigation', detail: 'titre rejeté (nav/fragments)' });
      continue;
    }
    const summary = cleanTitle(raw.summary);
    const date = extractDate(block);
    const { city, country } = extractCity(block);
    const amount = extractAmount(block);
    const surface = extractSurface(block);
    const assetType = detectAssetTypeFn(block);
    const opType = detectOperationTypeFn(block);
    const scpiNames = findScpiName(block, allScpis, urlSources);
    const effective = scpiNames.length > 0 ? scpiNames : urlSources.map(s => s.name);

    for (const scpiName of effective) {
      const res = classify({ block, scpiName, sourceType, sectionContext });
      if (!res.valid) {
        rejectedBlockItems.push({ extract: title || block.substring(0, 80), sourceUrl: pageUrl, reason: buildRejectionDetail(res), detail: res.reason });
        continue;
      }
      if (!title || title.length < 15) {
        rejectedBlockItems.push({ extract: title || '(vide)', sourceUrl: pageUrl, reason: 'titre vide/court' });
        continue;
      }

      const src = urlSources.find(s => s.name === scpiName) || urlSources[0];
      const item: InvestmentNewsItem = {
        scpi: scpiName, managementCompany: src.managementCompany,
        operationType: opType, assetType,
        country: country || 'Non communiqué', city: city || 'Non communiqué',
        area: '', address: '', tenant: 'Non communiqué',
        amount, surface, leaseDuration: 'Non communiqué',
        title, summary: summary || title, sourceUrl: pageUrl, sourceOfficial: true,
        sourceType, documentTitle, date: date || '', detectedAt, investmentRelated: true,
        dataQuality: 'weak', editorialPriority: 0,
        confidence: res.confidence / 100, disclaimer: DISCLAIMER,
        scpiDetected: res.flags.scpiDetected,
        realEstateAssetDetected: res.flags.realEstateAssetDetected,
        acquisitionSignalDetected: res.flags.acquisitionSignalDetected,
        heritageEntrySignalDetected: res.flags.heritageEntrySignalDetected,
        rejectedByCorporateNoise: res.flags.rejectedByCorporateNoise,
        sectionContext, extractionMethod: method, rejectionReason: '',
      };
      classifyQuality(item);
      if (item.dataQuality !== 'weak' && item.editorialPriority > 0) {
        const finalCheck = finalValidateAcquisition(item, block);
        if (finalCheck.valid) {
          items.push(item);
        } else {
          finalRejectionItems.push({
            scpi: scpiName,
            title: item.title || block.substring(0, 80),
            sourceUrl: pageUrl,
            reason: finalCheck.reason,
            documentTitle: documentTitle,
          });
        }
      }
    }
  }
  return { items };
}

// ═══════════════════════════════════════════════════════════════════════════
//  ORCHESTRATEUR PAR PAGE
// ═══════════════════════════════════════════════════════════════════════════

interface PageProcessResult {
  items: InvestmentNewsItem[];
  nextDocLinks: string[];
  nextNewsLinks: string[];
}

async function processPage(
  pageUrl: string, urlSources: NewsSourceEntry[],
  allScpis: ScpiEntry[], detectedAt: string,
  companyName: string, isDocumentPage: boolean,
): Promise<PageProcessResult> {
  const items: InvestmentNewsItem[] = [];

  const html = await fetchHtml(pageUrl);
  if (!html) return { items, nextDocLinks: [], nextNewsLinks: [] };

  totalPagesScanned++;
  if (isDocumentPage) totalDocumentPagesScanned++;

  // 1. Extraction HTML standard
  const text = stripHtml(html);
  const htmlCandidates = findCandidateBlocksWithContext(text, 'page_html');
  totalCandidateBlocks += htmlCandidates.length;
  if (htmlCandidates.length > 0) {
    const result = processCandidates(htmlCandidates, pageUrl, urlSources, allScpis, detectedAt, 'web_page', '', 'html_paragraph');
    items.push(...result.items);
  }

  // 2. Découverte de liens
  const allLinks = extractAllLinks(html, pageUrl, MAX_PAGES_PER_COMPANY);
  const docLinks: string[] = [];
  const newsLinks: string[] = [];
  const pdfCandidates: { url: string; text: string }[] = [];

  for (const { url, text: lt } of allLinks) {
    if (isPdfCandidate(url, lt)) {
      pdfCandidates.push({ url, text: lt });
    } else if (isDocumentPageLink(url, lt)) {
      docLinks.push(url);
    } else if (!isDocumentPage) {
      newsLinks.push(url);
    }
  }

  // Trier PDFs par recency
  pdfCandidates.sort((a, b) => pdfRecencyScore(b.url, b.text) - pdfRecencyScore(a.url, a.text));
  const pdfCandidatesLimited = pdfCandidates.slice(0, MAX_PDFS_DETECTED);
  totalPdfsDetected += pdfCandidatesLimited.length;

  // 3. PDFs
  let pdfsAnalyzedForCompany = 0;

  for (const { url: pdfUrl, text: pdfLinkText } of pdfCandidatesLimited) {
    if (pdfsAnalyzedForCompany >= MAX_PDFS_ANALYZED) break;

    const docTitle = extractDocumentTitle(pdfUrl, pdfLinkText);
    const docType = detectPdfDocType(pdfUrl, pdfLinkText);
    const sourceType: SourceType = docType === 'semestriel' ? 'pdf_semestriel'
      : docType === 'trimestriel' ? 'pdf_bulletin'
      : docType === 'annuel' ? 'pdf_annuel' : 'pdf_reporting';

    const pdfBuf = await fetchPdfBuffer(pdfUrl);
    if (!pdfBuf) {
      pdfAnalysisResults.push({ company: companyName, pdfUrl, docType, documentTitle: docTitle, sectionsFound: 0, candidateBlocks: 0, decision: 'rejeté' });
      continue;
    }

    // Validation CRITIQUE : vérifier que c'est bien un PDF
    if (!isPdfBuffer(pdfBuf)) {
      totalPdfsRejectedAsHtml++;
      pdfsRejectedAsHtml.push({ url: pdfUrl, company: companyName, reason: isHtmlLikeBuffer(pdfBuf) ? 'not_pdf_html_response' : 'format_pdf_invalide' });
      pdfAnalysisResults.push({ company: companyName, pdfUrl, docType, documentTitle: docTitle, sectionsFound: 0, candidateBlocks: 0, decision: 'html_recu_comme_pdf' });
      continue;
    }

    totalPdfsReallyPdf++;

    const fullText = await extractPdfText(pdfBuf);
    if (!fullText || fullText.length < 200) {
      pdfAnalysisResults.push({ company: companyName, pdfUrl, docType, documentTitle: docTitle, sectionsFound: 0, candidateBlocks: 0, decision: 'rejeté' });
      continue;
    }

    totalPdfsAnalyzed++;
    pdfsAnalyzedForCompany++;

    // Extraction par sections
    const sections = extractSectionsFromPdf(fullText);
    const filteredSections = filterNegativeSections(sections);
    let pdfItemsCount = 0;
    let sectionsFound = filteredSections.length;
    let candidateBlocksTotal = 0;

    for (const sec of filteredSections) {
      const candidates = findCandidateBlocksWithContext(sec.content, sec.section);
      candidateBlocksTotal += candidates.length;
      if (candidates.length > 0) {
        const result = processCandidates(candidates, pdfUrl, urlSources, allScpis, detectedAt, sourceType, docTitle, 'section_window');
        pdfItemsCount += result.items.length;
        items.push(...result.items);
      }
    }

    pdfAnalysisResults.push({
      company: companyName, pdfUrl, docType, documentTitle: docTitle,
      sectionsFound, candidateBlocks: candidateBlocksTotal,
      decision: pdfItemsCount > 0 ? 'conservé' : 'pas_de_bloc',
    });
  }

  return { items, nextDocLinks: docLinks, nextNewsLinks: newsLinks };
}

// ═══════════════════════════════════════════════════════════════════════════
//  ORCHESTRATEUR PAR ENTREPRISE
// ═══════════════════════════════════════════════════════════════════════════

async function processCompany(
  primaryUrl: string, urlSources: NewsSourceEntry[],
  allScpis: ScpiEntry[],
): Promise<InvestmentNewsItem[]> {
  const allItems: InvestmentNewsItem[] = [];
  const detectedAt = new Date().toISOString();
  const companyName = urlSources[0].managementCompany || urlSources[0].name;
  const visited = new Set<string>();

  // Phase 1 : page prioritaire
  const main = await processPage(primaryUrl, urlSources, allScpis, detectedAt, companyName, false);
  allItems.push(...main.items);
  visited.add(primaryUrl);

  // Phase 2 : pages documentaires (priorité)
  for (const docUrl of main.nextDocLinks) {
    if (visited.has(docUrl)) continue;
    if (visited.size > MAX_PAGES_PER_COMPANY) break;
    visited.add(docUrl);
    totalDocumentPagesScanned++;
    try {
      const docResult = await processPage(docUrl, urlSources, allScpis, detectedAt, companyName, true);
      allItems.push(...docResult.items);
    } catch { /* skip */ }
  }

  // Phase 3 : pages news secondaires
  for (const newsUrl of main.nextNewsLinks) {
    if (visited.has(newsUrl)) continue;
    if (visited.size > MAX_PAGES_PER_COMPANY) break;
    visited.add(newsUrl);
    try {
      const newsResult = await processPage(newsUrl, urlSources, allScpis, detectedAt, companyName, false);
      allItems.push(...newsResult.items);
    } catch { /* skip */ }
  }

  return allItems;
}

// ═══════════════════════════════════════════════════════════════════════════
//  13. JSON WRITER
// ═══════════════════════════════════════════════════════════════════════════

function generateId(item: InvestmentNewsItem): string {
  return hashTitle(`${item.scpi}-${item.title}-${item.city || ''}-${item.date || ''}`);
}

function writeJsonOutputs(items: InvestmentNewsItem[]): { displayable: InvestmentNewsItem[]; history: InvestmentNewsItem[]; newCount: number } {
  const prev = fs.existsSync(HISTORY_PATH) ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8')) as InvestmentNewsItem[] : [];
  const existingIds = new Set(prev.map(i => i.id));
  const history = [...prev];
  let added = 0;
  for (const item of items) { item.id = generateId(item); if (!existingIds.has(item.id)) { history.push(item); existingIds.add(item.id); added++; } }
  const displayable = history.filter(i => i.dataQuality !== 'weak' && i.editorialPriority > 0);

  fs.mkdirSync(path.dirname(LATEST_PATH), { recursive: true });
  fs.writeFileSync(LATEST_PATH, JSON.stringify(displayable, null, 2), 'utf-8');

  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');

  logInfo(`latest.json : ${displayable.length} affichables | history.json : ${history.length} total`);
  return { displayable, history, newCount: added };
}

// ═══════════════════════════════════════════════════════════════════════════
//  14. MARKDOWN REPORT WRITER
// ═══════════════════════════════════════════════════════════════════════════

function writeReport(
  sources: NewsSourceEntry[], items: InvestmentNewsItem[], newCount: number,
) {
  const today = new Date().toISOString().slice(0, 10);
  const rp = path.join(REPORTS_DIR, `SCPI_INVESTMENT_NEWS_REPORT_${today}.md`);
  const active = sources.filter(s => s.enabled);
  const errored = Object.keys(errorsBySource).filter(k => errorsBySource[k].length > 0);
  const p1 = items.filter(i => i.editorialPriority === 1);
  const p2 = items.filter(i => i.editorialPriority === 2);
  const p3 = items.filter(i => i.editorialPriority === 3);

  const L: string[] = [
    `# Derniers investissements immobiliers des SCPI — ${today}`,
    '', '## Synthèse',
    `- SCPI chargées : —`,
    `- Sources chargées : ${sources.length}`,
    `- Sources actives : ${active.length}`,
    `- Pages HTML scannées : ${totalPagesScanned}`,
    `- Pages documentaires scannées : ${totalDocumentPagesScanned}`,
    `- PDFs détectés : ${totalPdfsDetected}`,
    `- PDFs réellement PDF : ${totalPdfsReallyPdf}`,
    `- PDFs rejetés car HTML : ${totalPdfsRejectedAsHtml}`,
    `- PDFs analysés : ${totalPdfsAnalyzed}`,
    `- Sections utiles détectées : ${totalSectionsFound}`,
    `- Blocs candidats : ${totalCandidateBlocks}`,
    `- Investissements conservés : ${p1.length + p2.length + p3.length}`,
    `  → Priorité 1 : ${p1.length} | P2 : ${p2.length} | P3 : ${p3.length}`,
    `- Faux positifs rejetés : ${rejectedBlockItems.length}`,
    `- Nouveaux ajouts : ${newCount}`,
    `- Erreurs : ${errored.length}`,
    '',
  ];

  // Erreurs
  if (errored.length > 0) {
    L.push('## Sources en erreur');
    for (const s of errored) L.push(`- **${s}** : ${errorsBySource[s].join(' ; ')}`);
    L.push('');
  }

  // Investissements conservés
  for (const item of [...p1, ...p2, ...p3]) {
    const prio = item.editorialPriority === 1 ? 'P1' : item.editorialPriority === 2 ? 'P2' : 'P3';
    L.push(`### ${item.title} (${prio})`);
    L.push(`- **SCPI** : ${item.scpi} (${item.managementCompany})`);
    L.push(`- **Type** : ${item.assetType} | **Lieu** : ${item.city}, ${item.country}`);
    L.push(`- **Source** : ${item.sourceUrl} (${item.sourceType}${item.documentTitle ? ` — ${item.documentTitle}` : ''})`);
    L.push(`- **Section** : ${item.sectionContext || '—'}`);
    if (item.amount !== 'Non communiqué') L.push(`- **Montant** : ${item.amount}`);
    L.push(`- **Confiance** : ${Math.round(item.confidence * 100)}% | **Date** : ${item.date || '?'}`);
    L.push(`- ${item.summary.substring(0, 200)}`);
    L.push('');
  }

  // PDFs analysés
  if (pdfAnalysisResults.length > 0) {
    L.push('## PDFs analysés');
    const seenA = new Set<string>();
    for (const a of pdfAnalysisResults) {
      const k = `${a.company}|${a.pdfUrl}`;
      if (seenA.has(k)) continue; seenA.add(k);
      L.push(`- **${a.company}** : ${a.documentTitle || a.pdfUrl.split('/').pop()}`);
      L.push(`  - URL : ${a.pdfUrl}`);
      L.push(`  - Type : ${a.docType} | Sections : ${a.sectionsFound} | Blocs : ${a.candidateBlocks}`);
      L.push(`  - Décision : ${a.decision}`);
      L.push('');
    }
  }

  // PDFs rejetés car HTML
  if (pdfsRejectedAsHtml.length > 0) {
    L.push('## PDFs rejetés car HTML ou contenu invalide');
    for (const r of pdfsRejectedAsHtml) {
      L.push(`- ${r.url} (${r.company}) — ${r.reason}`);
    }
    L.push('');
  }

  // Blocs candidats rejetés
  if (rejectedBlockItems.length > 0) {
    L.push('## Blocs candidats rejetés');
    const seenB = new Set<string>();
    for (const b of rejectedBlockItems) {
      const k = `${b.extract}|${b.reason}`;
      if (seenB.has(k)) continue; seenB.add(k);
      L.push(`- ${b.extract.substring(0, 100)}`);
      L.push(`  - Source : ${b.sourceUrl}`);
      L.push(`  - Raison : ${b.reason}${b.detail ? ` (${b.detail})` : ''}`);
      L.push('');
    }
  }

  // Rejets par validation finale
  if (finalRejectionItems.length > 0) {
    L.push('## Rejets par validation finale');
    const seenF = new Set<string>();
    for (const f of finalRejectionItems) {
      const k = `${f.scpi}|${f.title}|${f.reason}`;
      if (seenF.has(k)) continue; seenF.add(k);
      L.push(`- **${f.scpi}** : ${f.title.substring(0, 100)}`);
      L.push(`  - Source : ${f.sourceUrl}${f.documentTitle ? ` (${f.documentTitle})` : ''}`);
      L.push(`  - Raison : ${f.reason}`);
      L.push('');
    }
  }

  // Sources sans acquisition
  if (p1.length + p2.length + p3.length === 0) {
    L.push('## Sources sans acquisition détectée');
    for (const s of active) {
      if (!errored.includes(s.slug) && (s.documentsUrl || s.newsUrl || s.officialUrl)) {
        L.push(`- ${s.name} (${s.slug})`);
      }
    }
    L.push('');
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(rp, L.join('\n'), 'utf-8');
  logInfo(`Rapport généré : ${rp}`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  15. INTERNAL TESTS
// ═══════════════════════════════════════════════════════════════════════════

let testPass = 0, testFail = 0;
function runTest(name: string, condition: boolean) {
  if (condition) { console.log(`[TEST PASS] ${name}`); testPass++; }
  else { console.error(`[TEST FAIL] ${name}`); testFail++; }
}

function runInternalTests() {
  console.log('');
  console.log('=== INTERNAL TESTS ===');

  // Fake sources pour tests
  const testSources: NewsSourceEntry[] = [{ slug: 'test', name: 'Test SCPI', managementCompany: 'TestCo', officialUrl: '', newsUrl: '', documentsUrl: '', rssUrl: '', enabled: true, notes: '' }];
  const testScpis: ScpiEntry[] = [{ name: 'Test SCPI', managementCompany: 'TestCo', slug: 'test-scpi' }];

  // A. Faux positif rejeté (HTML / recommandé)
  {
    const block = 'Il est recommandé d\'investir dans les SCPI pour obtenir un bon rendement. En savoir plus sur nos offres.';
    const res = classify({ block, scpiName: 'Test SCPI', sourceType: 'web_page', sectionContext: '' });
    runTest('A: Faux positif HTML rejeté', !res.valid);
  }

  // B. Faux positif ESG rejeté
  {
    const block = 'Engagement and voting stewardship report 2026 — our ESG policy ensures responsible investment. governance and sustainability.';
    const res = classify({ block, scpiName: 'Test SCPI', sourceType: 'web_page', sectionContext: '' });
    runTest('B: Faux positif ESG rejeté', !res.valid);
  }

  // C. Acquisition acceptée
  {
    const block = 'La SCPI Iroko Zen a acquis un immeuble de bureaux à Madrid pour 12 millions d\'euros. L\'acquisition a été finalisée en juin 2025.';
    const res = classify({ block, scpiName: 'Iroko Zen', sourceType: 'web_page', sectionContext: '' });
    runTest('C: Acquisition acceptée (bureaux Madrid)', res.valid && res.flags.acquisitionSignalDetected);
  }

  // D. Entrée au patrimoine acceptée (via "a intégré le patrimoine")
  {
    const block = "La SCPI Test SCPI a intégré le patrimoine d'un entrepôt logistique de 12000 m² situé en Allemagne. Cette entrée au patrimoine renforce le portefeuille.";
    const res = classify({ block, scpiName: 'Test SCPI', sourceType: 'pdf_bulletin', sectionContext: 'investissements' });
    runTest('D: Entrée au patrimoine acceptée', res.valid && res.flags.heritageEntrySignalDetected);
  }

  // E. Texte trop vague rejeté
  {
    const block = 'Le portefeuille poursuit son développement en Europe. Les perspectives de marché restent favorables.';
    const res = classify({ block, scpiName: 'Test SCPI', sourceType: 'web_page', sectionContext: '' });
    runTest('E: Texte vague rejeté', !res.valid);
  }

  // F. Acquisition sans actif concret rejetée
  {
    const block = 'La SCPI a acquis un nouveau fund en private debt sur le marché secondaire. Une excellente opportunity.';
    const res = classify({ block, scpiName: 'Test SCPI', sourceType: 'web_page', sectionContext: '' });
    runTest('F: Acquisition sans actif concret rejetée', !res.valid);
  }

  // G. Rejeter objet social
  {
    const block = 'Objet social : Acquisition et gestion d\'un patrimoine immobilier locatif. RCS Paris.';
    const item: InvestmentNewsItem = { scpi: 'Cœur de Région', managementCompany: 'Sogenial', operationType: 'acquisition', assetType: 'bureaux', country: 'France', city: 'Paris', area: '', address: '', tenant: 'Non communiqué', amount: 'Non communiqué', surface: 'Non communiqué', leaseDuration: 'Non communiqué', title: 'Objet social', summary: 'Objet social RCS', sourceUrl: 'https://example.com/note-info.pdf', sourceOfficial: true, sourceType: 'pdf_reporting', documentTitle: 'note d\'information – cœur de région', date: '', detectedAt: '', investmentRelated: true, dataQuality: 'standard', editorialPriority: 2, confidence: 0.95, disclaimer: DISCLAIMER, scpiDetected: true, realEstateAssetDetected: true, acquisitionSignalDetected: true, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false, sectionContext: '', extractionMethod: 'section_window', rejectionReason: '' };
    const vr = finalValidateAcquisition(item, block);
    runTest('G: Rejeter objet social', !vr.valid && vr.reason === 'objet social');
  }

  // H. Rejeter ESG
  {
    const block = 'Les grilles de notation ESG s\'appliquent aux SCPI à l\'acquisition et en gestion.';
    const item: InvestmentNewsItem = { scpi: 'Pierval Santé', managementCompany: 'Euryale', operationType: 'acquisition', assetType: 'sante', country: 'France', city: 'Toulouse', area: '', address: '', tenant: 'Non communiqué', amount: 'Non communiqué', surface: 'Non communiqué', leaseDuration: 'Non communiqué', title: 'Grilles ESG', summary: 'ESG', sourceUrl: 'https://example.com/esg.pdf', sourceOfficial: true, sourceType: 'pdf_reporting', documentTitle: 'politique d\'engagement ESG', date: '', detectedAt: '', investmentRelated: true, dataQuality: 'standard', editorialPriority: 2, confidence: 0.95, disclaimer: DISCLAIMER, scpiDetected: true, realEstateAssetDetected: true, acquisitionSignalDetected: true, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false, sectionContext: '', extractionMethod: 'section_window', rejectionReason: '' };
    const vr = finalValidateAcquisition(item, block);
    runTest('H: Rejeter ESG', !vr.valid && vr.reason === 'ESG');
  }

  // I. Rejeter exemples passés
  {
    const block = 'Exemples d\'investissements passés ne préjugeant pas des investissements futurs. Madrid acquis au 3e trimestre 2022.';
    const item: InvestmentNewsItem = { scpi: 'Cœur de Région', managementCompany: 'Sogenial', operationType: 'acquisition', assetType: 'bureaux', country: 'Espagne', city: 'Madrid', area: '', address: '', tenant: 'Non communiqué', amount: 'Non communiqué', surface: 'Non communiqué', leaseDuration: 'Non communiqué', title: 'Exemples passés', summary: 'Exemples d\'investissements passés', sourceUrl: 'https://example.com/presentation.pdf', sourceOfficial: true, sourceType: 'pdf_bulletin', documentTitle: 'presentation t2 2025', date: '', detectedAt: '', investmentRelated: true, dataQuality: 'standard', editorialPriority: 2, confidence: 0.95, disclaimer: DISCLAIMER, scpiDetected: true, realEstateAssetDetected: true, acquisitionSignalDetected: true, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false, sectionContext: '', extractionMethod: 'section_window', rejectionReason: '' };
    const vr = finalValidateAcquisition(item, block);
    runTest('I: Rejeter exemples passés', !vr.valid && vr.reason === 'investissement historique');
  }

  // J. Rejeter OPPCI / Venture Real Estate Fund
  {
    const block = 'Venture Real Estate Fund - Presentation T2 2025. Bureaux à Metz.';
    const item: InvestmentNewsItem = { scpi: 'Cœur de Région', managementCompany: 'Sogenial', operationType: 'acquisition', assetType: 'bureaux', country: 'France', city: 'Metz', area: '', address: '', tenant: 'Non communiqué', amount: 'Non communiqué', surface: 'Non communiqué', leaseDuration: 'Non communiqué', title: 'Venture Real Estate Fund', summary: 'Venture Real Estate Fund', sourceUrl: 'https://example.com/venture-fund.pdf', sourceOfficial: true, sourceType: 'pdf_bulletin', documentTitle: 'venture real estate fund – présentation t2 2025', date: '', detectedAt: '', investmentRelated: true, dataQuality: 'standard', editorialPriority: 2, confidence: 0.95, disclaimer: DISCLAIMER, scpiDetected: true, realEstateAssetDetected: true, acquisitionSignalDetected: true, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false, sectionContext: '', extractionMethod: 'section_window', rejectionReason: '' };
    const vr = finalValidateAcquisition(item, block);
    runTest('J: Rejeter OPPCI/Venture RE Fund', !vr.valid && vr.reason === 'OPPCI/fonds non SCPI');
  }

  // K. Rejeter document générique sans preuve textuelle
  {
    const block = 'Un immeuble de bureaux a été acquis à Lyon. Le patrimoine continue de croître.';
    const item: InvestmentNewsItem = { scpi: 'Cœur de Région', managementCompany: 'Sogenial', operationType: 'acquisition', assetType: 'bureaux', country: 'France', city: 'Lyon', area: '', address: '', tenant: 'Non communiqué', amount: 'Non communiqué', surface: 'Non communiqué', leaseDuration: 'Non communiqué', title: 'Acquisition Lyon', summary: 'Immeuble acquis à Lyon', sourceUrl: 'https://example.com/doc.pdf', sourceOfficial: true, sourceType: 'pdf_bulletin', documentTitle: 'bulletin t1 2026', date: '', detectedAt: '', investmentRelated: true, dataQuality: 'standard', editorialPriority: 2, confidence: 0.95, disclaimer: DISCLAIMER, scpiDetected: true, realEstateAssetDetected: true, acquisitionSignalDetected: true, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false, sectionContext: '', extractionMethod: 'section_window', rejectionReason: '' };
    const vr = finalValidateAcquisition(item, block);
    runTest('K: Rejeter doc générique sans SCPI textuelle', !vr.valid && vr.reason === 'document générique non rattaché à une SCPI');
  }

  // L. Accepter acquisition propre (SCPI explicitement nommée)
  {
    const block = 'La SCPI Cœur d\'Europe annonce l\'acquisition d\'un immeuble de bureaux à Madrid au T1 2026. Cette opération renforce le patrimoine.';
    const item: InvestmentNewsItem = { scpi: 'Cœur d\'Europe', managementCompany: 'Sogenial', operationType: 'acquisition', assetType: 'bureaux', country: 'Espagne', city: 'Madrid', area: '', address: '', tenant: 'Non communiqué', amount: '12 M€', surface: 'Non communiqué', leaseDuration: 'Non communiqué', title: 'Cœur d\'Europe acquiert bureaux Madrid', summary: 'La SCPI Cœur d\'Europe annonce l\'acquisition d\'un immeuble de bureaux à Madrid.', sourceUrl: 'https://example.com/actu.pdf', sourceOfficial: true, sourceType: 'pdf_bulletin', documentTitle: 'bulletin t1 2026', date: '2026-03-15', detectedAt: '', investmentRelated: true, dataQuality: 'standard', editorialPriority: 2, confidence: 0.95, disclaimer: DISCLAIMER, scpiDetected: true, realEstateAssetDetected: true, acquisitionSignalDetected: true, heritageEntrySignalDetected: false, rejectedByCorporateNoise: false, sectionContext: 'acquisitions', extractionMethod: 'section_window', rejectionReason: '' };
    const vr = finalValidateAcquisition(item, block);
    runTest('L: Accepter acquisition propre (SCPI nommée)', vr.valid);
  }

  console.log(`=== ${testPass + testFail} tests, ${testPass} PASS, ${testFail} FAIL ===`);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  16. MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  logInfo('=== SCPI Investment News Watcher v6.1 ===');

  // Tests internes
  if (process.env.SCPI_NEWS_RUN_TESTS === 'true') {
    runInternalTests();
    if (testFail > 0) {
      logInfo(`${testFail} test(s) en échec — arrêt en mode test.`);
      process.exit(1);
    }
    logInfo('Tous les tests passent — suite du run normal.');
  }

  logInfo(`Démarrage : ${new Date().toISOString()}`);
  console.log('');

  const allScpis = loadScpiList();
  logInfo(`${allScpis.length} SCPI chargées.`);

  const sources = loadSources();
  logInfo(`${sources.length} sources chargées.`);
  if (sources.length === 0) { logInfo('Aucune source. Fin.'); return; }

  const active = sources.filter(s => s.enabled);
  logInfo(`${active.length} sources actives.`);

  const byUrl = groupByPriorityUrl(active);
  logInfo(`${byUrl.size} URLs uniques à traiter.`);
  console.log('');

  const allItems: InvestmentNewsItem[] = [];
  let idx = 0;
  for (const [url, srcs] of byUrl) {
    idx++;
    logInfo(`[${idx}/${byUrl.size}] ${srcs.map(s => s.name).join(', ')} → ${url}`);
    const items = await processCompany(url, srcs, allScpis);
    if (items.length > 0) logInfo(`  → ${items.length} acquisition(s) conservée(s)`);
    allItems.push(...items);
    console.log('');
  }

  logInfo(`=== ${allItems.length} items détectés ===`);
  console.log('');

  const deduped = deduplicateItems(allItems);
  logInfo(`${deduped.length} après déduplication.`);

  const { displayable, history, newCount } = writeJsonOutputs(deduped);

  writeReport(sources, history, newCount);

  console.log('');
  logInfo('═══════════════════════════════════════');
  logInfo('           RÉSUMÉ FINAL v6');
  logInfo('═══════════════════════════════════════');
  logInfo(`Sources chargées          : ${sources.length}`);
  logInfo(`Sources actives           : ${active.length}`);
  logInfo(`Pages HTML scannées       : ${totalPagesScanned}`);
  logInfo(`Pages documentaires       : ${totalDocumentPagesScanned}`);
  logInfo(`PDFs détectés             : ${totalPdfsDetected}`);
  logInfo(`PDFs réellement PDF       : ${totalPdfsReallyPdf}`);
  logInfo(`PDFs rejetés car HTML     : ${totalPdfsRejectedAsHtml}`);
  logInfo(`PDFs analysés             : ${totalPdfsAnalyzed}`);
  logInfo(`Sections utiles           : ${totalSectionsFound}`);
  logInfo(`Blocs candidats           : ${totalCandidateBlocks}`);
  logInfo(`Conservés                 : ${displayable.length} (P1:${displayable.filter(i => i.editorialPriority === 1).length} P2:${displayable.filter(i => i.editorialPriority === 2).length} P3:${displayable.filter(i => i.editorialPriority === 3).length})`);
  logInfo(`Faux positifs rejetés     : ${rejectedBlockItems.length}`);
  logInfo(`Rejets validation finale  : ${finalRejectionItems.length}`);
  logInfo(`Nouveaux ajouts           : ${newCount}`);
  logInfo(`Erreurs                   : ${Object.keys(errorsBySource).length}`);
  logInfo('═══════════════════════════════════════');
  console.log('');
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
