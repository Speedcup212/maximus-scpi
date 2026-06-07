/**
 * AUDIT SEO — Cohérence canonique des pages SCPI
 * ----------------------------------------------
 * Garantit, pour TOUTE SCPI visible (catalogue `scpiDataExtended`), l'alignement
 * sur l'URL canonique SANS préfixe (`/wemo-one`, `/epsicap-nano`), conformément
 * à la décision validée :
 *   - liens internes  → URL canonique sans préfixe
 *   - canonical tag    → URL canonique sans préfixe
 *   - sitemap          → URL canonique sans préfixe uniquement (jamais /scpi-*)
 *   - ancienne URL /scpi-{slug} → redirection 301 vers /{slug}
 *
 * Contrôles (par SCPI visible) :
 *   1. lien interne : slug de navigation (logique Header) ≠ /scpi-* et = canonique
 *   2. canonical    : URL canonique = sans préfixe (slug de la fiche résolue)
 *   3. sitemap      : ne contient PAS /scpi-{slug} (URL non canonique)
 *   4. redirect 301 : public/_redirects contient /scpi-{slug} → /{slug} 301
 *
 * Lecture des artefacts générés (jamais de modification) :
 *   - public/_redirects   (généré par scripts/generateRedirectsSSG.js)
 *   - public/sitemap.xml  (généré par scripts/generateSitemapFromDB.ts)
 *
 * Sorties :
 *   data-import/scpi-agent/audit_scpi_seo_canonical_consistency.json
 *   reports/scpi-2026/rapport_audit_scpi_seo_canonical_consistency.md
 *
 * Exit code 1 si CRITICAL > 0.
 *
 * Usage: npx tsx scripts/scpi-agents/audit-scpi-seo-canonical-consistency.ts
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { scpiDataExtended } from '../../src/data/scpiDataExtended';
import { buildScpiLandingData } from '../../src/utils/buildScpiLandingData';
import { createSlugFromName, findScpiSlug } from '../../src/utils/scpiSlugMapper';

type Severity = 'OK' | 'WARNING' | 'CRITICAL';

interface CheckResult {
  check: string;
  severity: Severity;
  detail: string;
}

interface ScpiSeoAudit {
  name: string;
  canonicalSlug: string;
  linkSlug: string;
  status: Severity;
  checks: CheckResult[];
}

function worst(a: Severity, b: Severity): Severity {
  const order: Severity[] = ['OK', 'WARNING', 'CRITICAL'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

const SITE = 'https://maximusscpi.com';
const REDIRECTS_PATH = resolve(process.cwd(), 'public/_redirects');
const SITEMAP_PATH = resolve(process.cwd(), 'public/sitemap.xml');

const redirectsContent = existsSync(REDIRECTS_PATH) ? readFileSync(REDIRECTS_PATH, 'utf-8') : null;
const sitemapContent = existsSync(SITEMAP_PATH) ? readFileSync(SITEMAP_PATH, 'utf-8') : null;

/** Vérifie la présence d'une 301 /scpi-{slug} → /{slug} (avec et sans slash final). */
function hasPrefixRedirect(noPrefix: string): boolean {
  if (!redirectsContent) return false;
  const norm = redirectsContent.replace(/\s+/g, ' ');
  const a = `/scpi-${noPrefix} /${noPrefix} 301`;
  const b = `/scpi-${noPrefix}/ /${noPrefix} 301`;
  return norm.includes(a) && norm.includes(b);
}

/** Détecte une URL SCPI préfixée /scpi-{slug} dans le sitemap (non canonique). */
function sitemapHasPrefixedUrl(noPrefix: string): boolean {
  if (!sitemapContent) return false;
  return (
    sitemapContent.includes(`${SITE}/scpi-${noPrefix}<`) ||
    sitemapContent.includes(`${SITE}/scpi-${noPrefix}/<`)
  );
}

function auditScpi(name: string): ScpiSeoAudit {
  const noPrefix = createSlugFromName(name);
  const checks: CheckResult[] = [];

  const built = buildScpiLandingData(findScpiSlug(name) ?? noPrefix) ?? buildScpiLandingData(noPrefix);
  const canonicalSlug = built?.data.slug ?? noPrefix;

  // Slug RÉELLEMENT utilisé par les liens de l'app (identique à Header.tsx).
  const linkSlug = findScpiSlug(name) ?? noPrefix;

  // 1. Lien interne sans préfixe + aligné sur la canonique
  if (linkSlug.startsWith('scpi-')) {
    checks.push({ check: 'lien-interne', severity: 'CRITICAL', detail: `Lien interne préfixé "/${linkSlug}" alors que la canonique sans préfixe "/${canonicalSlug}" existe.` });
  } else if (linkSlug !== canonicalSlug) {
    checks.push({ check: 'lien-interne', severity: 'CRITICAL', detail: `Lien interne "/${linkSlug}" ≠ URL canonique "/${canonicalSlug}".` });
  } else {
    checks.push({ check: 'lien-interne', severity: 'OK', detail: `Lien interne = canonique "/${canonicalSlug}".` });
  }

  // 2. Canonical tag (SPA) = URL sans préfixe
  if (!built) {
    checks.push({ check: 'canonical', severity: 'CRITICAL', detail: `Fiche non résolue → canonical non garanti pour "${name}".` });
  } else if (canonicalSlug.startsWith('scpi-')) {
    checks.push({ check: 'canonical', severity: 'CRITICAL', detail: `URL canonique "/${canonicalSlug}" contient le préfixe "scpi-".` });
  } else {
    checks.push({ check: 'canonical', severity: 'OK', detail: `Canonical = ${SITE}/${canonicalSlug}/ (sans préfixe).` });
  }

  // 3. Sitemap : aucune URL préfixée /scpi-{slug}
  if (sitemapContent === null) {
    checks.push({ check: 'sitemap', severity: 'WARNING', detail: 'public/sitemap.xml absent → vérification reportée au build.' });
  } else if (sitemapHasPrefixedUrl(noPrefix)) {
    checks.push({ check: 'sitemap', severity: 'CRITICAL', detail: `Sitemap contient l'URL non canonique ${SITE}/scpi-${noPrefix}.` });
  } else {
    checks.push({ check: 'sitemap', severity: 'OK', detail: `Aucune URL préfixée /scpi-${noPrefix} dans le sitemap.` });
  }

  // 4. Redirection 301 de l'ancienne URL préfixée
  if (redirectsContent === null) {
    checks.push({ check: 'redirect-301', severity: 'CRITICAL', detail: 'public/_redirects absent → impossible de garantir la 301.' });
  } else if (!hasPrefixRedirect(noPrefix)) {
    checks.push({ check: 'redirect-301', severity: 'CRITICAL', detail: `Redirection 301 manquante : /scpi-${noPrefix} → /${noPrefix}.` });
  } else {
    checks.push({ check: 'redirect-301', severity: 'OK', detail: `301 présente : /scpi-${noPrefix} → /${noPrefix}.` });
  }

  const status = checks.reduce<Severity>((acc, c) => worst(acc, c.severity), 'OK');
  return { name, canonicalSlug, linkSlug, status, checks };
}

function main() {
  const visibleNames = scpiDataExtended.map((s) => s.name);
  const audits = visibleNames.map(auditScpi);

  const counts = {
    total: audits.length,
    ok: audits.filter((a) => a.status === 'OK').length,
    warning: audits.filter((a) => a.status === 'WARNING').length,
    critical: audits.filter((a) => a.status === 'CRITICAL').length,
  };

  const jsonPath = resolve(process.cwd(), 'data-import/scpi-agent/audit_scpi_seo_canonical_consistency.json');
  const mdPath = resolve(process.cwd(), 'reports/scpi-2026/rapport_audit_scpi_seo_canonical_consistency.md');

  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        artefacts: {
          redirects: redirectsContent !== null ? 'public/_redirects' : 'ABSENT',
          sitemap: sitemapContent !== null ? 'public/sitemap.xml' : 'ABSENT',
        },
        counts,
        audits,
      },
      null,
      2,
    ),
    'utf-8',
  );

  const lines: string[] = [];
  lines.push('# Audit SEO — Cohérence canonique des pages SCPI');
  lines.push('');
  lines.push(`Généré le ${new Date().toLocaleString('fr-FR')}`);
  lines.push('');
  lines.push('## Décision appliquée');
  lines.push('');
  lines.push('- URL canonique = **sans préfixe** (`/wemo-one`, `/epsicap-nano`).');
  lines.push('- Ancienne URL `/scpi-{slug}` → **301** vers `/{slug}`.');
  lines.push('- Liens internes, canonical et sitemap = URL canonique sans préfixe.');
  lines.push('');
  lines.push('## Synthèse');
  lines.push('');
  lines.push(`- SCPI visibles contrôlées : **${counts.total}**`);
  lines.push(`- OK : **${counts.ok}** · WARNING : **${counts.warning}** · CRITICAL : **${counts.critical}**`);
  lines.push(`- Artefacts lus : _redirects=${redirectsContent !== null ? 'présent' : 'ABSENT'}, sitemap.xml=${sitemapContent !== null ? 'présent' : 'ABSENT'}`);
  lines.push('');

  if (counts.critical > 0) {
    lines.push('## ⛔ Anomalies CRITICAL');
    lines.push('');
    for (const a of audits.filter((x) => x.status === 'CRITICAL')) {
      lines.push(`### ${a.name} (canonique \`/${a.canonicalSlug}\`)`);
      for (const c of a.checks.filter((c) => c.severity === 'CRITICAL')) {
        lines.push(`- **${c.check}** : ${c.detail}`);
      }
      lines.push('');
    }
  }

  lines.push('## WARNING (non bloquant)');
  lines.push('');
  const warnings = audits.filter((x) => x.status === 'WARNING');
  if (warnings.length === 0) {
    lines.push('_Aucun._');
  } else {
    for (const a of warnings) {
      const w = a.checks.filter((c) => c.severity === 'WARNING').map((c) => `${c.check} (${c.detail})`).join(' ; ');
      lines.push(`- **${a.name}** : ${w}`);
    }
  }
  lines.push('');
  lines.push('## Détail par SCPI');
  lines.push('');
  lines.push('| SCPI | Canonique | Lien interne | Statut |');
  lines.push('|------|-----------|--------------|--------|');
  for (const a of audits) {
    lines.push(`| ${a.name} | \`/${a.canonicalSlug}\` | \`/${a.linkSlug}\` | ${a.status} |`);
  }
  lines.push('');

  writeFileSync(mdPath, lines.join('\n'), 'utf-8');

  console.log('=== Audit SEO cohérence canonique des pages SCPI ===');
  console.log(`SCPI visibles : ${counts.total}`);
  console.log(`OK: ${counts.ok} | WARNING: ${counts.warning} | CRITICAL: ${counts.critical}`);
  console.log(`Artefacts : _redirects=${redirectsContent !== null ? 'OK' : 'ABSENT'}, sitemap.xml=${sitemapContent !== null ? 'OK' : 'ABSENT'}`);
  console.log(`JSON : ${jsonPath}`);
  console.log(`Rapport : ${mdPath}`);

  if (counts.critical > 0) {
    console.error(`\n⛔ ${counts.critical} SCPI avec incohérence SEO canonique (CRITICAL).`);
    process.exit(1);
  }
  console.log('\n✅ CRITICAL = 0 → liens internes, canonical, sitemap et 301 alignés sur la canonique sans préfixe.');
}

main();
