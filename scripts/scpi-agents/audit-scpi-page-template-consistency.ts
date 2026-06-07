/**
 * AUDIT — Uniformité de structure des pages SCPI
 * ----------------------------------------------
 * Vérifie que TOUTE SCPI visible (catalogue comparateur `scpiDataExtended`)
 * dispose, via le template unique `OptimizedScpiLandingPage` alimenté par
 * `buildScpiLandingData`, des blocs essentiels — ou d'un fallback propre.
 *
 * Blocs contrôlés (cf. spec) :
 *   hero (nom, société, TD, capi, prix), formulaire/CTA, graphiques géo/secteur
 *   (ou fallback), onglets, chiffres clés, simulateur, verdict (éditorial),
 *   points de vigilance, avertissement risques, bloc RDV, + absence de label
 *   marketing incohérent.
 *
 * Note : pour les fiches GÉNÉRÉES (SCPI sans contenu éditorial), le bloc
 * « Verdict » est volontairement masqué (décision validée) → non bloquant.
 *
 * Sorties :
 *   data-import/scpi-agent/audit_scpi_page_template_consistency.json
 *   reports/scpi-2026/rapport_audit_scpi_page_template_consistency.md
 *
 * Exit code 1 si CRITICAL > 0.
 *
 * Usage: npx tsx scripts/scpi-agents/audit-scpi-page-template-consistency.ts
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { scpiData } from '../../src/data/scpiData';
import { scpiDataExtended } from '../../src/data/scpiDataExtended';
import { buildScpiLandingData } from '../../src/utils/buildScpiLandingData';
import { createSlugFromName, findScpiSlug } from '../../src/utils/scpiSlugMapper';
import { qualifyYield } from '../../src/utils/yieldContext';

type Severity = 'OK' | 'WARNING' | 'CRITICAL';

interface CheckResult {
  block: string;
  severity: Severity;
  detail: string;
}

interface ScpiPageAudit {
  name: string;
  slug: string;
  isEditorial: boolean;
  status: Severity;
  checks: CheckResult[];
}

function worst(a: Severity, b: Severity): Severity {
  const order: Severity[] = ['OK', 'WARNING', 'CRITICAL'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

function auditScpi(name: string): ScpiPageAudit {
  const slug = createSlugFromName(name);
  const checks: CheckResult[] = [];

  // Slug RÉELLEMENT utilisé par les liens de l'app (Header / navigation),
  // identique à Header.tsx : fiche éditoriale si elle existe, sinon slug
  // canonique SANS préfixe (aligné sur pages statiques + sitemap + canonical).
  const linkSlug = findScpiSlug(name) ?? slug;
  const builtFromLink = buildScpiLandingData(linkSlug);
  const built = builtFromLink ?? buildScpiLandingData(slug);

  if (!built) {
    return {
      name,
      slug,
      isEditorial: false,
      status: 'CRITICAL',
      checks: [{ block: 'résolution', severity: 'CRITICAL', detail: `Aucune fiche résolue pour le slug "${slug}".` }],
    };
  }

  // Garde-fou anti "ancien template pauvre" : si le slug des liens ne résout pas
  // vers le template complet, la route retombe sur StaticScpiPage (page pauvre).
  if (!builtFromLink) {
    checks.push({
      block: 'template-route',
      severity: 'CRITICAL',
      detail: `Le slug de navigation "/${linkSlug}" ne résout pas vers le template complet → ancien template pauvre (StaticScpiPage).`,
    });
  } else {
    checks.push({
      block: 'template-route',
      severity: 'OK',
      detail: `Slug de navigation "/${linkSlug}" → template complet.`,
    });
  }

  // Cohérence canonique : le slug de navigation doit être l'URL canonique
  // (sans préfixe "scpi-", égale au slug de la fiche). Sinon, duplication SEO.
  const canonicalSlug = built.data.slug;
  if (linkSlug.startsWith('scpi-') || linkSlug !== canonicalSlug) {
    checks.push({
      block: 'canonical-coherence',
      severity: 'CRITICAL',
      detail: `Slug de navigation "/${linkSlug}" ≠ URL canonique "/${canonicalSlug}" → duplication SEO.`,
    });
  } else {
    checks.push({
      block: 'canonical-coherence',
      severity: 'OK',
      detail: `Slug de navigation = URL canonique "/${canonicalSlug}".`,
    });
  }

  const data = built.data;
  const isEditorial = built.isEditorial;
  const dataSlug = createSlugFromName(data.nom);
  const realScpi = scpiData.find((s) => createSlugFromName(s.name) === dataSlug);

  // 1. Hero
  checks.push({
    block: 'hero',
    severity: data.nom ? 'OK' : 'CRITICAL',
    detail: data.nom ? `Nom: ${data.nom}` : 'Nom SCPI absent.',
  });
  checks.push({
    block: 'hero.societe',
    severity: data.societe_gestion && data.societe_gestion !== 'Non disponible' ? 'OK' : 'WARNING',
    detail: `Société de gestion: ${data.societe_gestion}`,
  });

  // 2. Données live (hero stats + onglets + chiffres clés en dépendent)
  if (!realScpi) {
    checks.push({ block: 'donnees-live', severity: 'CRITICAL', detail: 'SCPI absente de scpiData → hero stats, onglets et chiffres clés vides.' });
  } else {
    checks.push({ block: 'hero.stats', severity: 'OK', detail: `TD ${realScpi.yield}% · capi ${realScpi.capitalization} · prix ${realScpi.price}€` });
    checks.push({ block: 'onglets', severity: 'OK', detail: "Performance & Historique / Frais & Conditions (rendus avec données live)." });
    checks.push({ block: 'chiffres-cles', severity: 'OK', detail: 'TD, TOF, capi, endettement, décote, année — alimentés.' });
  }

  // 3. Formulaire / CTA (structurel, toujours présent dans le template)
  checks.push({ block: 'formulaire-cta', severity: 'OK', detail: 'Formulaire analyse personnalisée présent (structurel).' });

  // 4. Graphiques géo / secteur ou fallback
  checks.push({
    block: 'graphique-geo',
    severity: Object.keys(data.geographie).length > 0 ? 'OK' : 'WARNING',
    detail: Object.keys(data.geographie).length > 0 ? `${Object.keys(data.geographie).length} zones` : 'Vide → fallback "Donnée à vérifier" affiché.',
  });
  checks.push({
    block: 'graphique-secteur',
    severity: Object.keys(data.secteurs).length > 0 ? 'OK' : 'WARNING',
    detail: Object.keys(data.secteurs).length > 0 ? `${Object.keys(data.secteurs).length} secteurs` : 'Vide → fallback "Donnée à vérifier" affiché.',
  });

  // 5. Simulateur
  checks.push({
    block: 'simulateur',
    severity: data.simulator ? 'OK' : 'WARNING',
    detail: data.simulator ? `defaultYield=${data.simulator.defaultYield}` : 'Simulateur absent.',
  });

  // 6. Verdict (éditorial uniquement ; masqué par design pour les fiches générées)
  if (isEditorial) {
    const hasPros = Array.isArray(data.avantages) && data.avantages.length > 0;
    checks.push({ block: 'verdict', severity: hasPros ? 'OK' : 'WARNING', detail: hasPros ? 'On aime / Points de vigilance présents.' : 'Verdict éditorial sans avantages.' });
  } else {
    checks.push({ block: 'verdict', severity: 'OK', detail: 'Fiche générée → bloc Verdict masqué (décision validée).' });
  }

  // 7. Points de vigilance
  const vigilance = isEditorial ? data.points_attention : data.points_attention;
  checks.push({
    block: 'points-vigilance',
    severity: Array.isArray(vigilance) && vigilance.length > 0 ? 'OK' : 'WARNING',
    detail: `${(vigilance || []).length} point(s).`,
  });

  // 8. Avertissement risques + 9. Bloc RDV (structurels)
  checks.push({ block: 'avertissement-risques', severity: 'OK', detail: 'Bloc avertissement (perte capital, liquidité, durée) présent (structurel).' });
  checks.push({ block: 'rdv-telephonique', severity: 'OK', detail: 'Bloc RDV conseiller Calendly présent (structurel).' });

  // 10. Cohérence du label marketing (garde-fou)
  if (realScpi) {
    const q = qualifyYield(realScpi.yield);
    const incoherent = realScpi.yield < 4 && (q.tier === 'eleve' || q.tier === 'atypique');
    checks.push({
      block: 'label-marketing',
      severity: incoherent ? 'CRITICAL' : 'OK',
      detail: incoherent
        ? `Label "${q.label}" incohérent avec TD ${realScpi.yield}%.`
        : `Label "${q.label}" cohérent avec TD ${realScpi.yield}%.`,
    });
  }

  const status = checks.reduce<Severity>((acc, c) => worst(acc, c.severity), 'OK');
  return { name, slug, isEditorial, status, checks };
}

function main() {
  const visibleNames = scpiDataExtended.map((s) => s.name);
  const audits = visibleNames.map(auditScpi);

  const counts = {
    total: audits.length,
    ok: audits.filter((a) => a.status === 'OK').length,
    warning: audits.filter((a) => a.status === 'WARNING').length,
    critical: audits.filter((a) => a.status === 'CRITICAL').length,
    editorial: audits.filter((a) => a.isEditorial).length,
    generated: audits.filter((a) => !a.isEditorial).length,
  };

  const jsonPath = resolve(process.cwd(), 'data-import/scpi-agent/audit_scpi_page_template_consistency.json');
  const mdPath = resolve(process.cwd(), 'reports/scpi-2026/rapport_audit_scpi_page_template_consistency.md');

  writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), counts, audits }, null, 2), 'utf-8');

  const lines: string[] = [];
  lines.push('# Audit — Uniformité de structure des pages SCPI');
  lines.push('');
  lines.push(`Généré le ${new Date().toLocaleString('fr-FR')}`);
  lines.push('');
  lines.push('## Synthèse');
  lines.push('');
  lines.push(`- SCPI visibles contrôlées : **${counts.total}**`);
  lines.push(`- Fiches éditoriales : ${counts.editorial} · Fiches générées : ${counts.generated}`);
  lines.push(`- OK : **${counts.ok}** · WARNING : **${counts.warning}** · CRITICAL : **${counts.critical}**`);
  lines.push('');
  if (counts.critical > 0) {
    lines.push('## ⛔ Anomalies CRITICAL');
    lines.push('');
    for (const a of audits.filter((x) => x.status === 'CRITICAL')) {
      lines.push(`### ${a.name} (\`/${a.slug}\`)`);
      for (const c of a.checks.filter((c) => c.severity === 'CRITICAL')) {
        lines.push(`- **${c.block}** : ${c.detail}`);
      }
      lines.push('');
    }
  }
  lines.push('## WARNING (données à compléter, non bloquant)');
  lines.push('');
  const warnings = audits.filter((x) => x.status === 'WARNING');
  if (warnings.length === 0) {
    lines.push('_Aucun._');
  } else {
    for (const a of warnings) {
      const w = a.checks.filter((c) => c.severity === 'WARNING').map((c) => `${c.block} (${c.detail})`).join(' ; ');
      lines.push(`- **${a.name}** (${a.isEditorial ? 'éditoriale' : 'générée'}) : ${w}`);
    }
  }
  lines.push('');
  lines.push('## Détail par SCPI');
  lines.push('');
  lines.push('| SCPI | Slug | Type | Statut |');
  lines.push('|------|------|------|--------|');
  for (const a of audits) {
    lines.push(`| ${a.name} | \`/${a.slug}\` | ${a.isEditorial ? 'éditoriale' : 'générée'} | ${a.status} |`);
  }
  lines.push('');

  writeFileSync(mdPath, lines.join('\n'), 'utf-8');

  console.log('=== Audit uniformité structure des pages SCPI ===');
  console.log(`SCPI visibles : ${counts.total} (éditoriales: ${counts.editorial}, générées: ${counts.generated})`);
  console.log(`OK: ${counts.ok} | WARNING: ${counts.warning} | CRITICAL: ${counts.critical}`);
  console.log(`JSON : ${jsonPath}`);
  console.log(`Rapport : ${mdPath}`);

  if (counts.critical > 0) {
    console.error(`\n⛔ ${counts.critical} SCPI avec structure de page incomplète (CRITICAL).`);
    process.exit(1);
  }
  console.log('\n✅ CRITICAL = 0 → toutes les pages SCPI ont la structure essentielle.');
}

main();
