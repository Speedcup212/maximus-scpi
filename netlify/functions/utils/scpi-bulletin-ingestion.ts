import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';
import { extractFromText, toExtractedMetrics, type ExtractionResult } from '../../../scpi-ingestion/src/extractor';
import { runQa } from '../../../scpi-ingestion/src/qa';

type SourceRow = {
  scpi_slug: string;
  scpi_name: string;
  management_company: string;
  official_scpi_page_url: string | null;
  discovered_page_url: string | null;
  source_domain: string | null;
  bulletin_url: string | null;
  automation_enabled: boolean;
  last_checked_at: string | null;
  next_check_at: string | null;
  error_count: number | null;
};

type BulletinCandidate = {
  pageUrl: string;
  pdfUrl: string;
  linkText: string;
  period: string | null;
  periodKey: number;
  score: number;
};

type ProcessResult = {
  status: 'updated' | 'unchanged' | 'needs_review' | 'failed' | 'idle';
  scpi_slug?: string;
  period?: string | null;
  metrics_count?: number;
  message: string;
};

const HTML_TIMEOUT_MS = 5_000;
const PDF_TIMEOUT_MS = 18_000;
const MAX_PDF_BYTES = 35 * 1024 * 1024;
const MAX_SITEMAP_URLS = 4_000;

const USER_AGENT =
  'Mozilla/5.0 (compatible; MaximusSCPI-BulletinBot/1.0; +https://maximusscpi.com/)';

const BULLETIN_WORDS =
  /(bulletin|trimestriel|trimestrielle|information\s+trimestrielle|bulletin\s+d['’]?information|\bbt\b)/i;

const EXCLUDED_DOCUMENTS =
  /(dic|kiid|priips?|prospectus|statuts?|rapport\s+annuel|annual\s+report|sfdr|notice\s+d['’]?information|r[eè]glement|politique\s+esg|document\s+pr[eé]contractuel)/i;

const PAGE_HINTS =
  /(scpi|documentation|documents?|nos-scpi|produits?|fonds?|supports?|investissement|immobilier)/i;

const STOP_TOKENS = new Set([
  'scpi', 'de', 'du', 'des', 'd', 'la', 'le', 'les', 'et', 'en', 'au', 'aux',
  'europe', 'europeen', 'europeenne', 'pierre', 'paris', 'grand', 'avenir',
  'patrimoine', 'capital', 'immo', 'immobilier', 'region', 'regions',
]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value: string): string =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const squash = (value: string): string => normalize(value).replace(/\s+/g, '');

const nameTokens = (name: string): string[] => {
  const tokens = normalize(name)
    .split(' ')
    .filter((token) => token.length >= 3 && !STOP_TOKENS.has(token));
  if (tokens.length > 0) return tokens;
  return normalize(name).split(' ').filter((token) => token.length >= 3);
};

const relevanceScore = (haystack: string, scpiName: string): number => {
  const h = normalize(haystack);
  const hs = h.replace(/\s+/g, '');
  const ns = squash(scpiName);
  let score = ns.length >= 4 && hs.includes(ns) ? 100 : 0;
  const tokens = nameTokens(scpiName);
  for (const token of tokens) {
    if (h.includes(token)) score += Math.min(25, 8 + token.length * 2);
  }
  return score;
};

const decodeHtml = (value: string): string =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

async function fetchText(url: string, timeoutMs = HTML_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPdf(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PDF_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.5',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for PDF ${url}`);
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 1024) throw new Error('PDF trop petit');
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) throw new Error('PDF trop volumineux');
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.subarray(0, 4).toString('utf8') !== '%PDF') {
      throw new Error('La ressource téléchargée n’est pas un PDF');
    }
    return buffer;
  } finally {
    clearTimeout(timer);
  }
}

function parsePeriod(value: string): { period: string; key: number } | null {
  const s = normalize(value);

  let m = /\b(?:t|q)\s*([1-4])\s*(20\d{2})\b/i.exec(s);
  if (m) {
    const q = Number(m[1]);
    const y = Number(m[2]);
    return { period: `${y}-T${q}`, key: y * 10 + q };
  }

  m = /\b(20\d{2})\s*(?:t|q)\s*([1-4])\b/i.exec(s);
  if (m) {
    const y = Number(m[1]);
    const q = Number(m[2]);
    return { period: `${y}-T${q}`, key: y * 10 + q };
  }

  m = /\b([1-4])\s*t\s*(20\d{2})\b/i.exec(s);
  if (m) {
    const q = Number(m[1]);
    const y = Number(m[2]);
    return { period: `${y}-T${q}`, key: y * 10 + q };
  }

  m = /\b([1-4])(?:er|e|eme)?\s+trimestre\s+(20\d{2})\b/i.exec(s);
  if (m) {
    const q = Number(m[1]);
    const y = Number(m[2]);
    return { period: `${y}-T${q}`, key: y * 10 + q };
  }

  m = /\btrimestre\s+([1-4])\s+(20\d{2})\b/i.exec(s);
  if (m) {
    const q = Number(m[1]);
    const y = Number(m[2]);
    return { period: `${y}-T${q}`, key: y * 10 + q };
  }

  return null;
}

function safeUrl(raw: string, base: string): string | null {
  try {
    const url = new URL(decodeHtml(raw.trim()), base);
    if (!/^https?:$/.test(url.protocol)) return null;
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function extractAnchors(html: string, baseUrl: string): Array<{ url: string; text: string }> {
  const out: Array<{ url: string; text: string }> = [];
  const seen = new Set<string>();
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const attrs = match[1] || '';
    const hrefMatch = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(attrs);
    const href = hrefMatch?.[1] || hrefMatch?.[2];
    if (!href) continue;
    const url = safeUrl(href, baseUrl);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const text = decodeHtml((match[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    out.push({ url, text });
  }
  return out;
}

function extractPdfLinks(html: string, baseUrl: string): Array<{ url: string; text: string; index: number }> {
  const links: Array<{ url: string; text: string; index: number }> = [];
  const seen = new Set<string>();

  const add = (raw: string, text: string, index: number) => {
    const url = safeUrl(raw, baseUrl);
    if (!url || seen.has(url)) return;
    const combined = `${url} ${text}`;
    if (
      !/\.pdf(?:$|[?#])/i.test(url) &&
      !/\/(?:download|telecharger|telechargement)(?:\/|\?)/i.test(url)
    ) return;
    if (EXCLUDED_DOCUMENTS.test(combined)) return;
    seen.add(url);
    links.push({ url, text, index });
  };

  extractAnchors(html, baseUrl).forEach((link, index) => add(link.url, link.text, index));

  const scriptRe = /["']([^"'\s]{4,800}\.pdf(?:\?[^"']*)?)["']/gi;
  let scriptMatch: RegExpExecArray | null;
  let scriptIndex = links.length;
  while ((scriptMatch = scriptRe.exec(html)) !== null) {
    add(scriptMatch[1] || '', '', scriptIndex++);
  }

  return links;
}

function extractLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>([\s\S]*?)<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null && out.length < MAX_SITEMAP_URLS) {
    out.push(decodeHtml((match[1] || '').trim()));
  }
  return out;
}

async function collectSitemapUrls(origin: string): Promise<string[]> {
  const roots = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const pageUrls = new Set<string>();

  for (const root of roots) {
    try {
      const xml = await fetchText(root, 4_000);
      const locs = extractLocs(xml);
      const childMaps = locs.filter((url) => /\.xml(?:$|\?)/i.test(url)).slice(0, 5);
      for (const url of locs) {
        if (!/\.xml(?:$|\?)/i.test(url)) pageUrls.add(url);
      }

      const children = await Promise.allSettled(
        childMaps.map((child) => fetchText(child, 4_000))
      );
      for (const child of children) {
        if (child.status !== 'fulfilled') continue;
        for (const url of extractLocs(child.value)) {
          if (!/\.xml(?:$|\?)/i.test(url)) pageUrls.add(url);
          if (pageUrls.size >= MAX_SITEMAP_URLS) break;
        }
      }

      if (pageUrls.size > 0) break;
    } catch {
      // Essayer le prochain nom de sitemap.
    }
  }

  return [...pageUrls];
}

async function discoverCandidatePages(source: SourceRow): Promise<string[]> {
  const start = source.discovered_page_url || source.official_scpi_page_url || source.source_domain;
  if (!start) return [];

  let origin = source.source_domain;
  try {
    origin = origin || new URL(start).origin;
  } catch {
    return [start];
  }

  // Une URL déjà spécifique à la SCPI est prioritaire et évite un crawl
  // sitemap inutile. C'est le chemin rapide pour les sources déjà qualifiées.
  if (relevanceScore(start, source.scpi_name) >= 55) {
    return [start];
  }

  const scored = new Map<string, number>();
  const add = (url: string, bonus = 0) => {
    try {
      const parsed = new URL(url);
      const root = new URL(origin!);
      if (parsed.hostname !== root.hostname && !parsed.hostname.endsWith(`.${root.hostname}`)) return;
      const score =
        relevanceScore(url, source.scpi_name) +
        (PAGE_HINTS.test(url) ? 20 : 0) +
        bonus;
      const previous = scored.get(url);
      if (previous === undefined || score > previous) scored.set(url, score);
    } catch {
      // URL invalide
    }
  };

  add(start, source.discovered_page_url ? 90 : 20);

  const [homeResult, sitemapResult] = await Promise.allSettled([
    fetchText(start, 5_000),
    origin ? collectSitemapUrls(origin) : Promise.resolve([]),
  ]);

  if (homeResult.status === 'fulfilled') {
    for (const link of extractAnchors(homeResult.value, start)) {
      const score = relevanceScore(`${link.url} ${link.text}`, source.scpi_name);
      if (score >= 18 || (PAGE_HINTS.test(link.url) && score > 0)) add(link.url, Math.min(40, score));
    }
  }

  if (sitemapResult.status === 'fulfilled') {
    for (const url of sitemapResult.value) {
      const score = relevanceScore(url, source.scpi_name);
      if (score >= 18) add(url, 35);
    }
  }

  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([url]) => url);
}

async function findLatestBulletin(source: SourceRow): Promise<BulletinCandidate | null> {
  const pages = await discoverCandidatePages(source);
  const candidates: BulletinCandidate[] = [];

  const pageResults = await Promise.allSettled(
    pages.map(async (pageUrl) => ({ pageUrl, html: await fetchText(pageUrl, 5_000) }))
  );

  for (const pageResult of pageResults) {
    if (pageResult.status !== 'fulfilled') continue;
    const { pageUrl, html } = pageResult.value;

    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '';
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] || '';
    const pageRelevance = relevanceScore(
      `${pageUrl} ${title.replace(/<[^>]+>/g, ' ')} ${h1.replace(/<[^>]+>/g, ' ')}`,
      source.scpi_name
    );
    const pdfLinks = extractPdfLinks(html, pageUrl);

    for (const link of pdfLinks) {
      const combined = `${link.url} ${link.text}`;
      const pdfRelevance = relevanceScore(combined, source.scpi_name);
      const hasBulletinWord = BULLETIN_WORDS.test(combined);
      const parsedPeriod = parsePeriod(combined);

      // Sur une page générique, le document doit être explicitement rattachable
      // à la SCPI. Sur une page produit très pertinente, le contexte de page suffit.
      if (pageRelevance < 45 && pdfRelevance < 18) continue;
      if (!hasBulletinWord && !parsedPeriod && pdfRelevance < 50) continue;

      const periodKey = parsedPeriod?.key || 0;
      const score =
        periodKey * 10_000 +
        (hasBulletinWord ? 600 : 0) +
        Math.min(400, pdfRelevance * 2) +
        Math.min(250, pageRelevance) +
        Math.min(100, link.index);

      candidates.push({
        pageUrl,
        pdfUrl: link.url,
        linkText: link.text,
        period: parsedPeriod?.period || null,
        periodKey,
        score,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

const filenameFromUrl = (url: string): string => {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || 'bulletin.pdf');
  } catch {
    return 'bulletin.pdf';
  }
};

const pct = (value: number | undefined): number | undefined =>
  value === undefined ? undefined : value * 100;

const topLabel = (items: Array<{ secteur?: string; pays?: string; poids: number }>): string | undefined => {
  const best = [...items].sort((a, b) => b.poids - a.poids)[0];
  return best ? (best.secteur || best.pays) : undefined;
};

function buildIndicatorPatch(extraction: ExtractionResult) {
  const c = extraction.chiffres_cles;
  const fees = extraction.structure_frais;
  const loc = extraction.indicateurs_locatifs;
  const val = extraction.valorisation_risque;
  const m = extraction.maximus_indicators;

  const sector = Object.fromEntries(
    extraction.repartition_sectorielle.map((item) => [item.secteur, Number((item.poids * 100).toFixed(4))])
  );
  const geo = Object.fromEntries(
    extraction.repartition_geographique.map((item) => [item.pays, Number((item.poids * 100).toFixed(4))])
  );

  const patch: Record<string, unknown> = {
    annee_creation: c.annee_creation,
    td: pct(c.taux_distribution),
    tof: pct(c.taux_occupation_financier ?? loc.taux_occupation_financier),
    top: pct(c.taux_occupation_physique ?? loc.taux_occupation_physique),
    capitalisation: c.capitalisation === undefined ? undefined : c.capitalisation / 1_000_000,
    prix_souscription: c.prix_part,
    prix_reconstitution: val.prix_reconstitution,
    prix_retrait: m.prix_retrait,
    valeur_realisation: m.valeur_realisation,
    prime_decote: pct(val.prime_decote),
    frais_souscription: pct(fees.frais_souscription),
    frais_gestion: pct(fees.frais_gestion),
    commission_performance: pct(fees.commission_performance),
    frais_sortie: pct(fees.frais_sortie),
    srri: extraction.profil_risque.niveau,
    duree_detention_recommandee: c.journalisation,
    endettement: pct(m.endettement),
    delai_jouissance: c.delai_jouissance === undefined ? undefined : c.delai_jouissance / 30.44,
    walt: loc.walt,
    walb: loc.walb,
    nombre_locataires: m.nombre_locataires,
    nombre_immeubles: m.nombre_immeubles,
    nombre_parts: c.nombre_parts,
    nombre_associes: c.nombre_associes,
    repartition_sectorielle: Object.keys(sector).length ? sector : undefined,
    repartition_geographique: Object.keys(geo).length ? geo : undefined,
    secteur_principal: topLabel(extraction.repartition_sectorielle),
    geographie_principale: topLabel(extraction.repartition_geographique),
    collecte_nette: m.collecte_nette,
    nb_cessions_trimestre: m.nb_cessions_trimestre,
    distribution_par_part: m.distribution_par_part,
    versement_loyers: extraction.strategie_investissement.politique_dividende,
    parts_attente_retrait: m.parts_attente_retrait,
    retraits_executes_trimestre: m.retraits_executes_trimestre,
    capital_type: m.capital_type,
  };

  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
}

function validateIndicatorPatch(
  patch: Record<string, unknown>,
  current: Record<string, unknown> | null
): { accepted: Record<string, unknown>; rejected: string[] } {
  const accepted: Record<string, unknown> = {};
  const rejected: string[] = [];

  const numericRanges: Record<string, [number, number]> = {
    td: [0, 20],
    tof: [0, 100],
    top: [0, 100],
    capitalisation: [0.1, 100_000],
    prix_souscription: [1, 100_000],
    prix_reconstitution: [1, 100_000],
    prix_retrait: [0.01, 100_000],
    valeur_realisation: [0.01, 100_000],
    prime_decote: [-100, 100],
    frais_souscription: [0, 30],
    frais_gestion: [0, 40],
    commission_performance: [0, 50],
    frais_sortie: [0, 30],
    srri: [1, 7],
    duree_detention_recommandee: [1, 30],
    endettement: [0, 80],
    delai_jouissance: [0, 24],
    walt: [0, 40],
    walb: [0, 40],
    nombre_locataires: [0, 100_000],
    nombre_immeubles: [0, 100_000],
    nombre_parts: [0, 10_000_000_000],
    nombre_associes: [0, 10_000_000],
    nb_cessions_trimestre: [0, 100_000],
    distribution_par_part: [0, 100_000],
    parts_attente_retrait: [0, 10_000_000_000],
    retraits_executes_trimestre: [0, 10_000_000_000],
  };

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined) continue;

    if (numericRanges[key]) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        rejected.push(`${key}: non numérique`);
        continue;
      }
      const [min, max] = numericRanges[key];
      if (value < min || value > max) {
        rejected.push(`${key}: hors plage (${value})`);
        continue;
      }

      const old = current?.[key];
      if (typeof old === 'number' && old > 0) {
        if (['prix_souscription', 'prix_reconstitution', 'prix_retrait', 'valeur_realisation'].includes(key)) {
          const ratio = value / old;
          if (ratio < 0.4 || ratio > 2.5) {
            rejected.push(`${key}: variation extrême ${old} → ${value}`);
            continue;
          }
        }
        if (key === 'capitalisation') {
          const ratio = value / old;
          if (ratio < 0.2 || ratio > 5) {
            rejected.push(`${key}: variation extrême ${old} → ${value}`);
            continue;
          }
        }
        if (key === 'tof' && Math.abs(value - old) > 30) {
          rejected.push(`${key}: variation > 30 points`);
          continue;
        }
        if (key === 'endettement' && Math.abs(value - old) > 40) {
          rejected.push(`${key}: variation > 40 points`);
          continue;
        }
      }
    }

    if (key === 'repartition_sectorielle' || key === 'repartition_geographique') {
      if (typeof value !== 'object') {
        rejected.push(`${key}: format invalide`);
        continue;
      }
      const values = Object.values(value as Record<string, unknown>).filter(
        (v): v is number => typeof v === 'number' && Number.isFinite(v)
      );
      const total = values.reduce((sum, n) => sum + n, 0);
      if (values.length === 0 || total < 70 || total > 130) {
        rejected.push(`${key}: total suspect ${total.toFixed(2)} %`);
        continue;
      }
    }

    accepted[key] = value;
  }

  return { accepted, rejected };
}

async function createEvent(client: SupabaseClient, source: SourceRow): Promise<string | null> {
  const { data, error } = await client
    .from('scpi_ingestion_events')
    .insert({
      scpi_slug: source.scpi_slug,
      status: 'started',
      step: 'source_selected',
      source_page_url: source.discovered_page_url || source.official_scpi_page_url,
    })
    .select('id')
    .single();
  if (error) {
    console.warn('[SCPI ingest] event insert failed', error.message);
    return null;
  }
  return data?.id || null;
}

async function finishEvent(
  client: SupabaseClient,
  eventId: string | null,
  values: Record<string, unknown>
) {
  if (!eventId) return;
  const { error } = await client
    .from('scpi_ingestion_events')
    .update({ ...values, ended_at: new Date().toISOString() })
    .eq('id', eventId);
  if (error) console.warn('[SCPI ingest] event update failed', error.message);
}

async function selectNextSource(client: SupabaseClient): Promise<SourceRow | null> {
  const { data, error } = await client
    .from('scpi_source_registry')
    .select(
      'scpi_slug,scpi_name,management_company,official_scpi_page_url,discovered_page_url,source_domain,bulletin_url,automation_enabled,last_checked_at,next_check_at,error_count'
    )
    .eq('automation_enabled', true)
    .limit(200);

  if (error) throw new Error(`Source registry: ${error.message}`);
  const now = Date.now();

  const due = (data || [])
    .filter((row: any) => !row.next_check_at || new Date(row.next_check_at).getTime() <= now)
    .sort((a: any, b: any) => {
      const aTime = a.last_checked_at ? new Date(a.last_checked_at).getTime() : 0;
      const bTime = b.last_checked_at ? new Date(b.last_checked_at).getTime() : 0;
      return aTime - bTime;
    });

  return (due[0] as SourceRow | undefined) || null;
}

async function updateRegistry(
  client: SupabaseClient,
  slug: string,
  values: Record<string, unknown>
) {
  const { error } = await client
    .from('scpi_source_registry')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('scpi_slug', slug);
  if (error) throw new Error(`Registry update: ${error.message}`);
}

const futureIso = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

export async function processNextScpiBulletin(client: SupabaseClient): Promise<ProcessResult> {
  const source = await selectNextSource(client);
  if (!source) return { status: 'idle', message: 'Aucune SCPI à contrôler pour le moment.' };

  const eventId = await createEvent(client, source);

  // Verrou léger : l'entrée ne redevient éligible qu'après 2 heures même si une
  // seconde invocation arrive pendant le traitement.
  await updateRegistry(client, source.scpi_slug, {
    last_checked_at: new Date().toISOString(),
    next_check_at: futureIso(2),
  });

  try {
    const candidate = await findLatestBulletin(source);
    if (!candidate) {
      const count = (source.error_count || 0) + 1;
      await updateRegistry(client, source.scpi_slug, {
        verification_status: 'manual_review_required',
        confidence_level: 'low',
        last_error: 'Aucun bulletin trimestriel pertinent détecté automatiquement.',
        error_count: count,
        next_check_at: futureIso(Math.min(168, 12 + count * 12)),
      });
      await finishEvent(client, eventId, {
        status: 'needs_review',
        step: 'bulletin_discovery',
        message: 'Aucun bulletin pertinent détecté.',
      });
      return {
        status: 'needs_review',
        scpi_slug: source.scpi_slug,
        message: 'Aucun bulletin pertinent détecté automatiquement.',
      };
    }

    const buffer = await fetchPdf(candidate.pdfUrl);
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    const { data: existingByHash } = await client
      .from('scpi_bulletins')
      .select('id,period,pdf_sha256,extraction_json')
      .eq('pdf_sha256', sha256)
      .maybeSingle();

    if (existingByHash?.id && existingByHash.extraction_json) {
      await updateRegistry(client, source.scpi_slug, {
        discovered_page_url: candidate.pageUrl,
        bulletin_url: candidate.pdfUrl,
        last_document_period: existingByHash.period,
        last_verified_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        verification_status: 'verified',
        confidence_level: 'high',
        last_error: null,
        error_count: 0,
        next_check_at: futureIso(24),
      });
      await finishEvent(client, eventId, {
        status: 'unchanged',
        step: 'deduplication',
        bulletin_url: candidate.pdfUrl,
        source_period: existingByHash.period,
        message: 'Bulletin déjà traité (SHA-256 identique).',
      });
      return {
        status: 'unchanged',
        scpi_slug: source.scpi_slug,
        period: existingByHash.period,
        message: 'Bulletin déjà traité.',
      };
    }

    const parsed = await pdfParse(buffer);
    const text = parsed.text || '';
    if (text.trim().length < 200) {
      throw new Error('Texte PDF insuffisant pour une extraction fiable.');
    }

    const extraction = extractFromText(text);
    const qa = runQa(toExtractedMetrics(extraction));
    const periodFromPdf = parsePeriod(
      `${candidate.linkText} ${filenameFromUrl(candidate.pdfUrl)} ${text.slice(0, 6_000)}`
    );
    const period = candidate.period || periodFromPdf?.period || null;

    if (!period) {
      await updateRegistry(client, source.scpi_slug, {
        discovered_page_url: candidate.pageUrl,
        bulletin_url: candidate.pdfUrl,
        verification_status: 'manual_review_required',
        confidence_level: 'low',
        last_error: 'Période du bulletin impossible à déterminer.',
        error_count: (source.error_count || 0) + 1,
        next_check_at: futureIso(24),
      });
      await finishEvent(client, eventId, {
        status: 'needs_review',
        step: 'period_detection',
        bulletin_url: candidate.pdfUrl,
        extraction_confidence: extraction.confidence,
        message: 'Période du bulletin introuvable.',
      });
      return {
        status: 'needs_review',
        scpi_slug: source.scpi_slug,
        message: 'Période du bulletin introuvable.',
      };
    }

    const fileName = filenameFromUrl(candidate.pdfUrl);
    const storagePath = `${source.scpi_slug}/${period}/${sha256}.pdf`;

    const { error: uploadError } = await client.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'scpi-bulletins')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) {
      throw new Error(`Storage: ${uploadError.message}`);
    }

    const rawPatch = buildIndicatorPatch(extraction);
    const { data: current } = await client
      .from('scpi_indicators')
      .select('*')
      .eq('scpi_slug', source.scpi_slug)
      .maybeSingle();

    const { accepted, rejected } = validateIndicatorPatch(
      rawPatch,
      (current as Record<string, unknown> | null) || null
    );

    const metricsCount = Object.keys(accepted).filter(
      (key) => !['repartition_sectorielle', 'repartition_geographique'].includes(key)
    ).length;

    const qaStatus =
      rejected.length > 0 ? 'auto_partial_review' :
      qa.status === 'OK' ? 'auto_verified' :
      metricsCount >= 4 ? 'auto_partial' : 'needs_review';

    const { data: bulletin, error: bulletinError } = await client
      .from('scpi_bulletins')
      .upsert(
        {
          scpi_slug: source.scpi_slug,
          period,
          pdf_path: storagePath,
          pdf_sha256: sha256,
          source_url: candidate.pdfUrl,
          run_id: `netlify-${new Date().toISOString()}`,
          found_at: new Date().toISOString(),
          extraction_json: extraction,
          qa_status: qaStatus,
          extraction_confidence: extraction.confidence,
          processed_at: new Date().toISOString(),
        },
        { onConflict: 'scpi_slug,period' }
      )
      .select('id')
      .single();

    if (bulletinError) throw new Error(`Bulletin DB: ${bulletinError.message}`);

    if (metricsCount >= 2) {
      const merged = {
        ...(current || {}),
        ...accepted,
        scpi_slug: source.scpi_slug,
        nom: source.scpi_name,
        societe_gestion: source.management_company,
        source_period: period,
        source_confidence: extraction.confidence,
        source_type: 'bulletin_automated',
        bulletin_id: bulletin.id,
        source_document: fileName,
        source_url: candidate.pdfUrl,
        qa_status: qaStatus,
        updated_at: new Date().toISOString(),
      };

      const { error: indicatorError } = await client
        .from('scpi_indicators')
        .upsert(merged, { onConflict: 'scpi_slug' });

      if (indicatorError) throw new Error(`Indicators DB: ${indicatorError.message}`);
    }

    const confidenceLevel =
      extraction.confidence >= 0.7 && rejected.length === 0 ? 'high' :
      extraction.confidence >= 0.4 ? 'medium' : 'low';

    const sourceStatus =
      metricsCount >= 4 && rejected.length === 0 ? 'verified' :
      metricsCount >= 2 ? 'incomplete' : 'manual_review_required';

    await updateRegistry(client, source.scpi_slug, {
      discovered_page_url: candidate.pageUrl,
      bulletin_url: candidate.pdfUrl,
      last_document_period: period,
      last_verified_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      verification_status: sourceStatus,
      confidence_level: confidenceLevel,
      last_error: rejected.length ? rejected.join(' | ').slice(0, 2_000) : null,
      error_count: 0,
      next_check_at: futureIso(24),
    });

    await finishEvent(client, eventId, {
      status: sourceStatus === 'verified' ? 'updated' : 'needs_review',
      step: 'completed',
      source_page_url: candidate.pageUrl,
      bulletin_url: candidate.pdfUrl,
      source_period: period,
      extraction_confidence: extraction.confidence,
      metrics_count: metricsCount,
      message: rejected.length
        ? `Extraction partielle : ${rejected.join(' | ')}`
        : `${metricsCount} indicateurs validés et enregistrés.`,
    });

    return {
      status: sourceStatus === 'verified' ? 'updated' : 'needs_review',
      scpi_slug: source.scpi_slug,
      period,
      metrics_count: metricsCount,
      message: rejected.length
        ? `${metricsCount} indicateurs enregistrés, ${rejected.length} à vérifier.`
        : `${metricsCount} indicateurs enregistrés.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const count = (source.error_count || 0) + 1;

    await updateRegistry(client, source.scpi_slug, {
      verification_status: count >= 3 ? 'manual_review_required' : 'incomplete',
      confidence_level: 'low',
      last_error: message.slice(0, 2_000),
      error_count: count,
      next_check_at: futureIso(Math.min(168, 12 + count * 12)),
    }).catch(() => undefined);

    await finishEvent(client, eventId, {
      status: 'failed',
      step: 'exception',
      message: message.slice(0, 2_000),
    });

    return {
      status: 'failed',
      scpi_slug: source.scpi_slug,
      message,
    };
  }
}
