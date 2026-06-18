/**
 * Audit d'indexation MaximusSCPI
 * 
 * Télécharge le sitemap live, teste chaque URL, et génère des rapports d'indexation.
 * Zéro dépendance externe — utilise les APIs natives Node.js 18+.
 * 
 * Usage : node scripts/seo/audit-indexation.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const REPORTS_DIR = resolve(ROOT, 'reports', 'seo');

const SITEMAP_URL = 'https://maximusscpi.com/sitemap.xml';
const CONCURRENCY = 5;
const TIMEOUT_MS = 20_000;
const USER_AGENT = 'MaximusSCPI-AuditBot/1.0 (+https://maximusscpi.com)';

// ─── Utilitaires ────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function slug(text) {
  return (text || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,*/*',
        ...(opts.headers || {}),
      },
    });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`Timeout après ${TIMEOUT_MS}ms`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRedirects(url, maxRedirects = 10) {
  const chain = [];
  let currentUrl = url;
  let finalStatus = null;
  let finalUrl = null;
  let finalBody = null;
  let redirectCount = 0;

  while (redirectCount < maxRedirects) {
    chain.push(currentUrl);
    const res = await fetchWithTimeout(currentUrl);
    const status = res.status;
    const location = res.headers.get('location');

    if (status >= 300 && status < 400 && location) {
      redirectCount++;
      // Résoudre les URL relatives
      try {
        currentUrl = new URL(location, currentUrl).href;
      } catch {
        currentUrl = location;
      }
      finalStatus = status;
      finalUrl = currentUrl;
    } else {
      finalStatus = status;
      finalUrl = currentUrl;
      try {
        finalBody = await res.text();
      } catch {
        finalBody = '';
      }
      break;
    }
  }

  if (redirectCount >= maxRedirects) {
    finalStatus = -1;
    finalBody = 'TOO_MANY_REDIRECTS';
  }

  return { chain, redirectCount, finalStatus, finalUrl, finalBody };
}

function extractMeta(body) {
  const result = {};

  // Canonical
  const canonicalMatch = body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || body.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  result.canonical = canonicalMatch ? canonicalMatch[1] : null;

  // Meta robots
  const robotsMatch = body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)
    || body.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  result.metaRobots = robotsMatch ? robotsMatch[1] : null;

  // Title
  const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
  result.title = titleMatch ? titleMatch[1].trim() : null;

  // Meta description
  const descMatch = body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || body.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  result.description = descMatch ? descMatch[1] : null;

  // H1
  const h1Match = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    result.h1 = h1Match[1].replace(/<[^>]+>/g, '').trim();
  } else {
    result.h1 = null;
  }

  // Noindex dans body (parfois mis par du JS / balise meta)
  result.hasNoindexInBody = /noindex/i.test(body.slice(0, 2000));

  // X-Robots-Tag (non récupérable côté client ici, à vérifier via headers plus tard si besoin)
  result.xRobotsTag = null;

  // Taille HTML
  result.htmlSize = body.length;

  return result;
}

function isSoft404(meta, status) {
  if (status !== 200) return false;
  const size = meta.htmlSize || 0;
  const title = (meta.title || '').toLowerCase();
  const h1 = (meta.h1 || '').toLowerCase();

  // Pages très petites (< 2KB) sans contenu substantiel
  if (size < 2000 && !meta.h1) return true;

  // Pages avec title contenant "404" ou "not found"
  if (title.includes('404') || title.includes('not found') || title.includes('page introuvable')) return true;
  if (h1.includes('404') || h1.includes('not found') || h1.includes('page introuvable')) return true;

  // Pages avec taille très faible et pas de H1
  if (size < 800 && !meta.h1) return true;

  return false;
}

async function crawlOne(url) {
  const result = {
    url_sitemap: url,
    url_finale: null,
    status: null,
    chain: [],
    redirect_count: 0,
    error: null,
    content_type: null,
    canonical: null,
    meta_robots: null,
    title: null,
    description: null,
    h1: null,
    html_size: 0,
    is_noindex: false,
    is_blocked: false,
    is_soft404: false,
    is_redirect: false,
    is_error: false,
    canonical_differs: false,
  };

  try {
    const { chain, redirectCount, finalStatus, finalUrl, finalBody } = await fetchWithRedirects(url);
    result.chain = chain;
    result.redirect_count = redirectCount;
    result.status = finalStatus;
    result.url_finale = finalUrl;

    if (finalStatus >= 200 && finalStatus < 300 && finalBody) {
      result.content_type = 'text/html';
      const meta = extractMeta(finalBody);
      result.canonical = meta.canonical;
      result.meta_robots = meta.metaRobots;
      result.title = meta.title;
      result.description = meta.description;
      result.h1 = meta.h1;
      result.html_size = meta.htmlSize;

      // Détections
      if (meta.metaRobots && /noindex/i.test(meta.metaRobots)) {
        result.is_noindex = true;
      }
      if (meta.hasNoindexInBody) {
        result.is_noindex = true;
      }
      result.is_soft404 = isSoft404(meta, finalStatus);

      // Canonical différente de l'URL finale ?
      if (meta.canonical) {
        const canonNorm = meta.canonical.replace(/\/$/, '').toLowerCase();
        const finalNorm = finalUrl.replace(/\/$/, '').toLowerCase();
        if (canonNorm !== finalNorm) {
          result.canonical_differs = true;
        }
      }

      // Redirection ?
      if (redirectCount > 0) {
        result.is_redirect = true;
      }
    } else if (finalStatus >= 400) {
      result.is_error = true;
    } else if (finalStatus >= 300 && finalStatus < 400) {
      result.is_redirect = true;
    }
  } catch (err) {
    result.status = -1;
    result.error = err.message;
    result.is_error = true;
  }

  return result;
}

async function crawlAll(urls) {
  const results = [];
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(url => crawlOne(url)));
    results.push(...batchResults);
    // Petit délai pour ne pas surcharger le serveur
    if (i + CONCURRENCY < urls.length) {
      await sleep(200);
    }
    const done = Math.min(i + CONCURRENCY, urls.length);
    process.stderr.write(`\r  Crawl: ${done}/${urls.length} URL testées...`);
  }
  process.stderr.write('\n');
  return results;
}

// ─── Rapports ────────────────────────────────────────────────────────

function detectDuplicates(results, field) {
  const map = new Map();
  for (const r of results) {
    const val = (r[field] || '').trim().toLowerCase();
    if (!val) continue;
    if (!map.has(val)) map.set(val, []);
    map.get(val).push(r.url_sitemap);
  }
  const dups = [];
  for (const [val, urls] of map) {
    if (urls.length > 1) {
      dups.push({ value: val, urls });
    }
  }
  return dups;
}

function detectSlashes(results) {
  // Détecte les URLs où le sitemap et l'URL finale diffèrent uniquement par le slash final
  const issues = [];
  for (const r of results) {
    if (!r.url_finale || r.url_finale === r.url_sitemap) continue;
    const a = r.url_sitemap.replace(/\/$/, '');
    const b = r.url_finale.replace(/\/$/, '');
    if (a === b) {
      issues.push({ url_sitemap: r.url_sitemap, url_finale: r.url_finale });
    }
  }
  return issues;
}

function generateMarkdownReport(counts, results, dups) {
  const total = results.length;
  const ok = results.filter(r => r.status === 200 && !r.is_redirect && !r.is_error && !r.is_noindex && !r.is_soft404 && !r.canonical_differs);
  const redirects = results.filter(r => r.is_redirect || (r.status >= 300 && r.status < 400));
  const errors = results.filter(r => r.is_error || r.status === -1 || r.status >= 400);
  const noindex = results.filter(r => r.is_noindex);
  const soft404s = results.filter(r => r.is_soft404);
  const canonicalIssues = results.filter(r => r.canonical_differs);
  const weak = results.filter(r => r.status === 200 && !r.is_redirect && !r.is_noindex && !r.is_soft404 && !r.canonical_differs && !r.is_error && r.html_size > 0 && r.html_size < 5000);

  // URLs probablement non stratégiques (test, brouillon, technique)
  const nonStrategicPatterns = [/\/articles\/$/, /^https:\/\/maximusscpi.com\/$/];
  const nonStrategic = results.filter(r => nonStrategicPatterns.some(p => p.test(r.url_sitemap)));

  let md = '';

  md += '# Audit d\'indexation — MaximusSCPI\n\n';
  md += `**Date** : ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Sitemap** : ${SITEMAP_URL}\n`;
  md += `**URLs totales testées** : ${total}\n\n`;

  md += '---\n\n';

  // A. Résumé exécutif
  md += '## A. Résumé exécutif\n\n';
  md += `| Métrique | Nombre | Pourcentage |\n`;
  md += `|---|---|---|\n`;
  md += `| URLs totales dans le sitemap | ${total} | 100% |\n`;
  md += `| URLs OK (indexables) | ${ok.length} | ${((ok.length/total)*100).toFixed(1)}% |\n`;
  md += `| URLs en redirection | ${redirects.length} | ${((redirects.length/total)*100).toFixed(1)}% |\n`;
  md += `| URLs en erreur (4xx/5xx/timeout) | ${errors.length} | ${((errors.length/total)*100).toFixed(1)}% |\n`;
  md += `| URLs avec canonical incohérente | ${canonicalIssues.length} | ${((canonicalIssues.length/total)*100).toFixed(1)}% |\n`;
  md += `| URLs noindex | ${noindex.length} | ${((noindex.length/total)*100).toFixed(1)}% |\n`;
  md += `| URLs suspectes soft 404 | ${soft404s.length} | ${((soft404s.length/total)*100).toFixed(1)}% |\n`;
  md += `| Pages faibles (< 5 KB) | ${weak.length} | ${((weak.length/total)*100).toFixed(1)}% |\n`;
  md += `| Titles dupliqués | ${dups.title.length} groupes | — |\n`;
  md += `| H1 dupliqués | ${dups.h1.length} groupes | — |\n`;
  md += `| Canonicals dupliquées | ${dups.canonical.length} groupes | — |\n`;
  md += `| Incohérences slash/no-slash | ${dups.slashes.length} | — |\n\n`;

  if (counts.errors_5xx > 0) {
    md += `> **⚠️ ${counts.errors_5xx} erreur(s) 5xx détectée(s)** — urgence maximale\n\n`;
  }
  if (counts.blocked > 0) {
    md += `> **⚠️ ${counts.blocked} page(s) potentiellement bloquée(s)** par robots.txt ou noindex\n\n`;
  }

  // B-D. URLs par catégorie
  md += '## B. URLs OK indexables\n\n';
  if (ok.length > 0) {
    md += `| URL | Title | H1 | Taille HTML |\n`;
    md += `|---|---|---|---|\n`;
    for (const r of ok.slice(0, 30)) {
      md += `| ${r.url_sitemap} | ${(r.title || '-').replace(/\|/g, '\\|')} | ${(r.h1 || '-').replace(/\|/g, '\\|')} | ${r.html_size} o |\n`;
    }
    if (ok.length > 30) md += `| ... | ... | ... | ... |\n`;
    md += `\n`;
  } else {
    md += 'Aucune URL OK.\n\n';
  }

  md += '## C. URLs en redirection (à retirer/corriger du sitemap)\n\n';
  if (redirects.length > 0) {
    md += `| URL sitemap | URL finale | Status | Nombre de redirects |\n`;
    md += `|---|---|---|---|\n`;
    for (const r of redirects) {
      md += `| ${r.url_sitemap} | ${r.url_finale || '-'} | ${r.status} | ${r.redirect_count} |\n`;
    }
    md += `\n`;
  } else {
    md += 'Aucune redirection détectée.\n\n';
  }

  md += '## D. URLs en erreur (4xx/5xx/timeout)\n\n';
  if (errors.length > 0) {
    md += `| URL sitemap | Status | Erreur |\n`;
    md += `|---|---|---|\n`;
    for (const r of errors) {
      md += `| ${r.url_sitemap} | ${r.status} | ${r.error || '-'} |\n`;
    }
    md += `\n`;
  } else {
    md += 'Aucune erreur détectée.\n\n';
  }

  md += '## E. URLs avec canonical incohérente\n\n';
  if (canonicalIssues.length > 0) {
    md += `| URL sitemap | Canonical déclarée | URL finale |\n`;
    md += `|---|---|---|\n`;
    for (const r of canonicalIssues) {
      md += `| ${r.url_sitemap} | ${r.canonical || '-'} | ${r.url_finale || '-'} |\n`;
    }
    md += `\n`;
  } else {
    md += 'Aucune canonical incohérente.\n\n';
  }

  md += '## F. URLs noindex ou bloquées\n\n';
  if (noindex.length > 0) {
    md += `| URL sitemap | Meta robots |\n`;
    md += `|---|---|\n`;
    for (const r of noindex) {
      md += `| ${r.url_sitemap} | ${r.meta_robots || 'noindex détecté'} |\n`;
    }
    md += `\n`;
  } else {
    md += 'Aucune URL noindex.\n\n';
  }

  md += '## G. URLs suspectes soft 404\n\n';
  if (soft404s.length > 0) {
    md += `| URL sitemap | Status | Title | H1 | Taille |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const r of soft404s) {
      md += `| ${r.url_sitemap} | ${r.status} | ${(r.title || '-').replace(/\|/g, '\\|')} | ${(r.h1 || '-').replace(/\|/g, '\\|')} | ${r.html_size} o |\n`;
    }
    md += `\n`;
  } else {
    md += 'Aucune soft 404 suspecte.\n\n';
  }

  md += '## H. Titles dupliqués\n\n';
  if (dups.title.length > 0) {
    for (const d of dups.title.slice(0, 20)) {
      md += `### Title : "${d.value}"\n\n`;
      for (const u of d.urls) {
        md += `- ${u}\n`;
      }
      md += '\n';
    }
    if (dups.title.length > 20) md += `... et ${dups.title.length - 20} autres groupes.\n\n`;
  } else {
    md += 'Aucun title dupliqué.\n\n';
  }

  md += '## I. H1 dupliqués\n\n';
  if (dups.h1.length > 0) {
    for (const d of dups.h1.slice(0, 20)) {
      md += `### H1 : "${d.value}"\n\n`;
      for (const u of d.urls) {
        md += `- ${u}\n`;
      }
      md += '\n';
    }
    if (dups.h1.length > 20) md += `... et ${dups.h1.length - 20} autres groupes.\n\n`;
  } else {
    md += 'Aucun H1 dupliqué.\n\n';
  }

  md += '## J. Pages faibles (< 5 KB HTML)\n\n';
  if (weak.length > 0) {
    md += 'Ces pages ont très peu de contenu HTML et risquent d\'être considérées comme "thin content" par Google.\n\n';
    md += `| URL | Title | H1 | Taille |\n`;
    md += `|---|---|---|---|\n`;
    for (const r of weak.slice(0, 30)) {
      md += `| ${r.url_sitemap} | ${(r.title || '-').replace(/\|/g, '\\|')} | ${(r.h1 || '-').replace(/\|/g, '\\|')} | ${r.html_size} o |\n`;
    }
    if (weak.length > 30) md += `| ... | ... | ... | ... |\n`;
    md += '\n';
  } else {
    md += 'Aucune page faible.\n\n';
  }

  md += '## K. Incohérences slash / no-slash\n\n';
  if (dups.slashes.length > 0) {
    md += `| URL sitemap | URL finale (slash différent) |\n`;
    md += `|---|---|\n`;
    for (const d of dups.slashes) {
      md += `| ${d.url_sitemap} | ${d.url_finale} |\n`;
    }
    md += '\n';
  } else {
    md += 'Aucune incohérence slash détectée.\n\n';
  }

  // Actions recommandées
  md += '---\n\n';
  md += '## L. Actions recommandées (priorisées)\n\n';
  md += '### Priorité 1 : Erreurs 5xx\n';
  const err5xx = errors.filter(r => r.status >= 500);
  if (err5xx.length > 0) {
    for (const r of err5xx) {
      md += `- [ ] Corriger l'erreur serveur sur \`${r.url_sitemap}\` (status ${r.status})\n`;
    }
  } else {
    md += 'Aucune erreur 5xx détectée.\n';
  }

  md += '\n### Priorité 2 : Pages noindex/bloquées\n';
  if (noindex.length > 0) {
    for (const r of noindex) {
      md += `- [ ] Vérifier noindex sur \`${r.url_sitemap}\` — intentionnel ?\n`;
    }
  } else {
    md += 'Aucune.\n';
  }

  md += '\n### Priorité 3 : Redirections dans le sitemap\n';
  if (redirects.length > 0) {
    md += `- [ ] Remplacer les ${redirects.length} URLs redirigées par leurs URLs finales dans le sitemap\n`;
  } else {
    md += 'Aucune.\n';
  }

  md += '\n### Priorité 4 : Canonical incohérentes\n';
  if (canonicalIssues.length > 0) {
    for (const r of canonicalIssues) {
      md += `- [ ] Corriger la canonical de \`${r.url_sitemap}\` (actuellement ${r.canonical}, devrait être ${r.url_finale})\n`;
    }
  } else {
    md += 'Aucune.\n';
  }

  md += '\n### Priorité 5 : Soft 404\n';
  if (soft404s.length > 0) {
    for (const r of soft404s) {
      md += `- [ ] Investiguer soft 404 sur \`${r.url_sitemap}\` — contenu insuffisant ?\n`;
    }
  } else {
    md += 'Aucune.\n';
  }

  md += '\n### Priorité 6 : Titles / H1 dupliqués\n';
  if (dups.title.length > 0) {
    md += `- [ ] ${dups.title.length} groupe(s) de titles dupliqués — différencier le contenu\n`;
  }
  if (dups.h1.length > 0) {
    md += `- [ ] ${dups.h1.length} groupe(s) de H1 dupliqués — différencier le contenu\n`;
  }
  if (dups.title.length === 0 && dups.h1.length === 0) md += 'Aucun.\n';

  md += '\n### Priorité 7 : Pages faibles / thin content\n';
  if (weak.length > 0) {
    md += `- [ ] ${weak.length} pages avec moins de 5 KB HTML — enrichir ou consolider\n`;
  } else {
    md += 'Aucune.\n';
  }

  return md;
}

function generateCSV(results) {
  const header = 'url_sitemap,url_finale,status,redirect_count,error,canonical,meta_robots,title,description,h1,html_size,is_noindex,is_soft404,is_redirect,is_error,canonical_differs';
  const rows = results.map(r => [
    r.url_sitemap,
    r.url_finale || '',
    r.status,
    r.redirect_count,
    (r.error || '').replace(/"/g, '""'),
    (r.canonical || '').replace(/"/g, '""'),
    (r.meta_robots || '').replace(/"/g, '""'),
    (r.title || '').replace(/"/g, '""'),
    (r.description || '').replace(/"/g, '""'),
    (r.h1 || '').replace(/"/g, '""'),
    r.html_size,
    r.is_noindex,
    r.is_soft404,
    r.is_redirect,
    r.is_error,
    r.canonical_differs,
  ].join(','));
  return [header, ...rows].join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Audit d\'indexation MaximusSCPI ===\n');

  // 1. Télécharger le sitemap
  console.log(`Téléchargement du sitemap : ${SITEMAP_URL}`);
  const sitemapRes = await fetchWithTimeout(SITEMAP_URL);
  const sitemapXml = await sitemapRes.text();

  // 2. Extraire les URLs
  const urlMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  const urls = urlMatches.map(m => m[1]);
  console.log(`URLs trouvées dans le sitemap : ${urls.length}\n`);

  // 3. Rien ici — les slash issues seront détectées après le crawl

  // 4. Crawler toutes les URLs
  console.log('Test de chaque URL (GET avec suivi de redirections)...');
  const results = await crawlAll(urls);

  // 5. Compiler les statistiques
  const counts = {
    total: results.length,
    ok: results.filter(r => r.status === 200 && !r.is_redirect && !r.is_error && !r.is_noindex && !r.is_soft404).length,
    redirects: results.filter(r => r.is_redirect).length,
    errors_4xx: results.filter(r => r.status >= 400 && r.status < 500).length,
    errors_5xx: results.filter(r => r.status >= 500).length,
    errors_timeout: results.filter(r => r.status === -1).length,
    noindex: results.filter(r => r.is_noindex).length,
    soft404: results.filter(r => r.is_soft404).length,
    canonical_diff: results.filter(r => r.canonical_differs).length,
    blocked: results.filter(r => r.is_noindex).length,
  };

  // Détecter les incohérences slash après crawl
  const slashIssues = detectSlashes(results);

  // 6. Détecter les duplications
  const dups = {
    title: detectDuplicates(results, 'title'),
    h1: detectDuplicates(results, 'h1'),
    canonical: detectDuplicates(results, 'canonical'),
    slashes: slashIssues,
  };

  // 7. Générer les rapports
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // JSON
  const jsonReport = {
    audit_date: new Date().toISOString(),
    sitemap_url: SITEMAP_URL,
    counts,
    results,
    duplicates: {
      titles: dups.title.map(d => ({ value: d.value, count: d.urls.length, urls: d.urls })),
      h1s: dups.h1.map(d => ({ value: d.value, count: d.urls.length, urls: d.urls })),
      canonicals: dups.canonical.map(d => ({ value: d.value, count: d.urls.length, urls: d.urls })),
    },
  };
  writeFileSync(resolve(REPORTS_DIR, 'indexation-audit.json'), JSON.stringify(jsonReport, null, 2));
  console.log(`Fichier généré : reports/seo/indexation-audit.json`);

  // CSV
  const csv = generateCSV(results);
  writeFileSync(resolve(REPORTS_DIR, 'indexation-audit.csv'), csv);
  console.log(`Fichier généré : reports/seo/indexation-audit.csv`);

  // Markdown
  const md = generateMarkdownReport(counts, results, dups);
  writeFileSync(resolve(REPORTS_DIR, 'indexation-audit.md'), md);
  console.log(`Fichier généré : reports/seo/indexation-audit.md`);

  // 8. Résumé console
  console.log('\n=== Résumé ===');
  console.log(`  Total URLs testées       : ${counts.total}`);
  console.log(`  OK indexables            : ${counts.ok} (${((counts.ok/counts.total)*100).toFixed(1)}%)`);
  console.log(`  Redirections             : ${counts.redirects}`);
  console.log(`  Erreurs 4xx              : ${counts.errors_4xx}`);
  console.log(`  Erreurs 5xx              : ${counts.errors_5xx}`);
  console.log(`  Timeouts/échecs          : ${counts.errors_timeout}`);
  console.log(`  Noindex                  : ${counts.noindex}`);
  console.log(`  Soft 404 suspects        : ${counts.soft404}`);
  console.log(`  Canonical incohérentes   : ${counts.canonical_diff}`);
  console.log(`  Titles dupliqués         : ${dups.title.length} groupes`);
  console.log(`  H1 dupliqués             : ${dups.h1.length} groupes`);
  console.log('\nRapports disponibles dans reports/seo/');
}

main().catch(err => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
