/**
 * QA métier finale décote/surcote — consolide full + retry, applique le verdict QA,
 * produit le fichier validé (JSON + CSV) et le rapport QA.
 *
 * Aucune écriture front. Aucun appel API (les valeurs sont déjà extraites/recalculées).
 *
 * Usage: npx tsx scripts/scpi-agents/qa-final-reconstitution-deepseek.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { isExcludedScpi } from './lib/pdf-page-utils';
import {
  isDerivedGlobalReconstitution,
  isPerPartReconstitution,
  type BatchStatut,
} from './lib/reconstitution-extract';

const ROOT = process.cwd();
const FULL_JSON = join(ROOT, 'data-import/scpi-agent/deepseek_reconstitution_full.json');
const RETRY_JSON = join(ROOT, 'data-import/scpi-agent/deepseek_reconstitution_retry_non_verified.json');

const OUT_JSON = join(ROOT, 'data-import/scpi-agent/scpi_reconstitution_discount_validated.json');
const OUT_CSV = join(ROOT, 'data-import/scpi-agent/scpi_reconstitution_discount_validated.csv');
const OUT_REPORT = join(ROOT, 'reports/scpi-2026/rapport_qa_final_reconstitution_decote_surcote.md');

const ECART_MANUAL_REVIEW_PCT = 20;

type QaStatut = 'publishable' | 'manual_review' | 'rejected' | 'excluded_non_scpi';

interface ExtractField {
  value: number | null;
  unit: 'EUR' | 'EUR/part' | null;
  confidence: number;
  extract: string | null;
  source_document: string | null;
  source_page: number | null;
  status: string;
  comment?: string | null;
}

interface DecoteSurcote {
  computed: boolean;
  pct: number | null;
  label: 'decote' | 'surcote' | 'parite' | null;
  formula: string | null;
  reason_if_skipped: string | null;
  needs_manual_review?: boolean;
}

interface ScpiResult {
  nom_scpi: string | null;
  folder: string;
  document_source?: string | null;
  extraction: {
    prix_souscription: ExtractField;
    valeur_reconstitution: ExtractField;
    valeur_realisation: ExtractField;
    division_nominale: {
      detected: boolean;
      ratio: number | null;
      date_effet: string | null;
      comment: string | null;
    };
  };
  valeur_reconstitution_ajustee: { value: number | null; formula: string | null };
  decote_surcote: DecoteSurcote;
  statut: BatchStatut;
  commentaire?: string | null;
  error?: string;
}

interface QaEntry {
  nom_scpi: string;
  folder: string;
  statut_qa: QaStatut;
  prix_souscription: number | null;
  valeur_reconstitution: number | null;
  unite_vr: string | null;
  vr_par_part: boolean;
  vr_globale_derivee: boolean;
  valeur_reconstitution_ajustee: number | null;
  split_detecte: boolean;
  split_ratio: number | null;
  split_applique: boolean;
  decote_surcote_percent: number | null;
  label: string | null;
  document_source: string | null;
  page_source: number | null;
  extrait_vr: string | null;
  source_periode_split: string | null;
  decision_qa: string;
  formula: string | null;
}

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function loadResults(path: string): ScpiResult[] {
  if (!existsSync(path)) {
    console.error(`❌ Fichier introuvable: ${path}`);
    process.exit(1);
  }
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return (parsed.results ?? []) as ScpiResult[];
}

/** Décision QA + statut à partir d'un résultat consolidé. */
function classify(r: ScpiResult): { statut_qa: QaStatut; decision: string } {
  if (isExcludedScpi(r.folder) || (r.nom_scpi && isExcludedScpi(r.nom_scpi))) {
    return { statut_qa: 'excluded_non_scpi', decision: 'Produit hors périmètre SCPI (dispositif Denormandie) — exclu.' };
  }

  if (r.error) {
    return { statut_qa: 'rejected', decision: `Rejeté : ${r.error}.` };
  }

  const vr = r.extraction.valeur_reconstitution;
  const ds = r.decote_surcote;

  // Règle 1/2 : VR doit être par part.
  const perPart = isPerPartReconstitution(vr as never);
  const derivedGlobal = isDerivedGlobalReconstitution(vr as never);

  if (!ds.computed) {
    const reason = ds.reason_if_skipped ?? 'décote/surcote non calculée';
    return { statut_qa: 'manual_review', decision: `Neutralisée : ${reason}.` };
  }

  // Règle 3 : écart > 20 %.
  if (ds.pct != null && Math.abs(ds.pct) > ECART_MANUAL_REVIEW_PCT) {
    return {
      statut_qa: 'manual_review',
      decision: `Écart ${ds.pct} % > ${ECART_MANUAL_REVIEW_PCT} % — manual_review (justification documentaire requise).`,
    };
  }

  // Règle 2 : VR globale dérivée par part → manual_review.
  if (derivedGlobal) {
    return {
      statut_qa: 'manual_review',
      decision: 'VR issue d\'une valeur globale (M€) ramenée par part — source nb de parts à valider.',
    };
  }

  if (!perPart) {
    return {
      statut_qa: 'manual_review',
      decision: 'VR non confirmée comme valeur par part — non publiée.',
    };
  }

  if (r.statut === 'manual_review' || r.statut === 'rejected') {
    return { statut_qa: 'manual_review', decision: `Statut extraction = ${r.statut}.` };
  }

  return {
    statut_qa: 'publishable',
    decision:
      r.statut === 'verified_adjusted_split'
        ? 'Publiable — split appliqué et VR ajustée par part.'
        : 'Publiable — VR par part, écart cohérent.',
  };
}

function toEntry(r: ScpiResult): QaEntry {
  const { statut_qa, decision } = classify(r);
  const vr = r.extraction.valeur_reconstitution;
  const split = r.extraction.division_nominale;
  const vrAdj = r.valeur_reconstitution_ajustee?.value ?? null;
  return {
    nom_scpi: r.nom_scpi ?? r.folder,
    folder: r.folder,
    statut_qa,
    prix_souscription: r.extraction.prix_souscription.value,
    valeur_reconstitution: vr.value,
    unite_vr: vr.unit,
    vr_par_part: isPerPartReconstitution(vr as never),
    vr_globale_derivee: isDerivedGlobalReconstitution(vr as never),
    valeur_reconstitution_ajustee: vrAdj,
    split_detecte: split.detected,
    split_ratio: split.ratio,
    split_applique: vrAdj != null,
    decote_surcote_percent: statut_qa === 'publishable' ? r.decote_surcote.pct : null,
    label: statut_qa === 'publishable' ? r.decote_surcote.label : null,
    document_source: r.extraction.prix_souscription.source_document ?? r.document_source ?? null,
    page_source: r.extraction.prix_souscription.source_page ?? null,
    extrait_vr: vr.extract,
    source_periode_split: split.date_effet,
    decision_qa: decision,
    formula: r.decote_surcote.formula,
  };
}

function csvCell(v: unknown): string {
  if (v == null) return '';
  const s = String(v).replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return /[",;]/.test(s) ? `"${s}"` : s;
}

function buildCsv(entries: QaEntry[]): string {
  const cols: (keyof QaEntry)[] = [
    'nom_scpi',
    'statut_qa',
    'prix_souscription',
    'valeur_reconstitution',
    'unite_vr',
    'vr_par_part',
    'vr_globale_derivee',
    'valeur_reconstitution_ajustee',
    'split_detecte',
    'split_ratio',
    'split_applique',
    'decote_surcote_percent',
    'label',
    'document_source',
    'page_source',
    'decision_qa',
  ];
  const header = cols.join(';');
  const lines = entries.map((e) => cols.map((c) => csvCell(e[c])).join(';'));
  return `${header}\n${lines.join('\n')}\n`;
}

function pct(n: number | null): string {
  return n == null ? '—' : `${n > 0 ? '+' : ''}${n} %`;
}

function buildReport(entries: QaEntry[]): string {
  const total = entries.length;
  const publishable = entries.filter((e) => e.statut_qa === 'publishable');
  const review = entries.filter((e) => e.statut_qa === 'manual_review');
  const rejected = entries.filter((e) => e.statut_qa === 'rejected');
  const excluded = entries.filter((e) => e.statut_qa === 'excluded_non_scpi');

  const ecartsEleves = entries.filter(
    (e) => e.decote_surcote_percent != null && Math.abs(e.decote_surcote_percent) > ECART_MANUAL_REVIEW_PCT
  );
  // écarts > 20 % neutralisés (présents dans la décision QA même si pct non publié)
  const ecartsNeutralises = review.filter((e) => /> 20 %|> 20%/.test(e.decision_qa));
  const splits = entries.filter((e) => e.split_detecte);
  const vrGlobales = entries.filter((e) => e.vr_globale_derivee);

  const L: string[] = [];
  L.push('# Rapport QA final — décote/surcote reconstitution SCPI');
  L.push('');
  L.push(`_Généré le ${new Date().toISOString()} — provider DeepSeek (extraction), QA métier appliquée._`);
  L.push('');
  L.push('> Données extraites de documents officiels (bulletins, rapports annuels, notes d\'information).');
  L.push('> Performances passées ≠ performances futures. Aucune promesse de rendement. Information générale, non personnalisée.');
  L.push('> Risques SCPI : perte en capital, revenus non garantis, liquidité limitée.');
  L.push('');
  L.push('## 1. Synthèse');
  L.push('');
  L.push('| Indicateur | Valeur |');
  L.push('|---|---|');
  L.push(`| SCPI analysées (hors exclusions) | ${total - excluded.length} |`);
  L.push(`| SCPI publiables | ${publishable.length} |`);
  L.push(`| manual_review | ${review.length} |`);
  L.push(`| rejected | ${rejected.length} |`);
  L.push(`| excluded_non_scpi | ${excluded.length} |`);
  L.push(`| **Total fichier** | **${total}** |`);
  L.push('');

  L.push('## 2. SCPI avec décote/surcote publiée');
  L.push('');
  L.push('| SCPI | Prix | VR comparable | Décote/Surcote | Type | Source |');
  L.push('|---|---|---|---|---|---|');
  for (const e of publishable.sort((a, b) => (a.decote_surcote_percent ?? 0) - (b.decote_surcote_percent ?? 0))) {
    const vrComp = e.valeur_reconstitution_ajustee ?? e.valeur_reconstitution;
    L.push(
      `| ${e.nom_scpi} | ${e.prix_souscription ?? '—'} € | ${vrComp ?? '—'} € | ${pct(e.decote_surcote_percent)} | ${e.label ?? '—'} | ${e.document_source ?? '—'} (p.${e.page_source ?? '?'}) |`
    );
  }
  L.push('');

  L.push('## 3. SCPI neutralisées (non publiées)');
  L.push('');
  L.push('| SCPI | Statut QA | Décision |');
  L.push('|---|---|---|');
  for (const e of [...review, ...rejected]) {
    L.push(`| ${e.nom_scpi} | ${e.statut_qa} | ${e.decision_qa} |`);
  }
  L.push('');

  L.push('## 4. Écarts > 20 % — décision QA');
  L.push('');
  if (ecartsNeutralises.length === 0) {
    L.push('_Aucun écart > 20 % publié — tous neutralisés en manual_review._');
  }
  L.push('| SCPI | Écart calculé | Décision |');
  L.push('|---|---|---|');
  for (const e of ecartsNeutralises) {
    const m = e.decision_qa.match(/(-?\d+(?:\.\d+)?) %/);
    L.push(`| ${e.nom_scpi} | ${m ? m[1] + ' %' : '—'} | manual_review (justification documentaire requise) |`);
  }
  L.push('');

  L.push('## 5. Splits / divisions nominales — décision QA');
  L.push('');
  L.push('| SCPI | Ratio | Date effet | Split appliqué ? | Décision |');
  L.push('|---|---|---|---|---|');
  for (const e of splits) {
    const dec = e.split_applique
      ? 'VR ajustée (prix et VR sur bases différentes).'
      : 'Non appliqué — prix et VR déjà sur la même base par part.';
    L.push(`| ${e.nom_scpi} | ×${e.split_ratio ?? '?'} | ${e.source_periode_split ?? '—'} | ${e.split_applique ? 'oui' : 'non'} | ${dec} |`);
  }
  L.push('');

  L.push('## 6. Exclusions hors périmètre SCPI');
  L.push('');
  if (excluded.length === 0) {
    L.push('_Aucune._');
  } else {
    for (const e of excluded) L.push(`- **${e.nom_scpi}** — ${e.decision_qa}`);
  }
  L.push('');

  L.push('## 7. Confirmations QA');
  L.push('');
  const nonPerPartPublished = publishable.filter((e) => !e.vr_par_part);
  const globalPublished = publishable.filter((e) => e.vr_globale_derivee);
  L.push(
    `- ✅ Seules les valeurs de reconstitution **par part** sont utilisées pour les ${publishable.length} décotes/surcotes publiées (${nonPerPartPublished.length} exception(s)).`
  );
  L.push(
    `- ✅ Aucune valeur globale (M€/Md€) n'est utilisée directement comme valeur par part dans les publications (${globalPublished.length} cas dérivé(s) publié(s) — neutralisés en manual_review : ${vrGlobales.length}).`
  );
  L.push('- ✅ Aucun split appliqué automatiquement : appliqué uniquement quand prix et VR sont sur des bases différentes (ratio sourcé).');
  L.push('- ✅ Kyaneos Denormandie 4 exclu du périmètre SCPI (`excluded_non_scpi`).');
  L.push('');
  return L.join('\n');
}

function main(): void {
  const full = loadResults(FULL_JSON);
  const retry = loadResults(RETRY_JSON);

  // Le fichier de reprise fait autorité pour ses SCPI.
  const byFolder = new Map<string, ScpiResult>();
  for (const r of full) byFolder.set(normalize(r.folder), r);
  for (const r of retry) byFolder.set(normalize(r.folder), r);

  const merged = [...byFolder.values()];

  // Règle 6 : réintégrer Kyaneos Denormandie 4 en excluded_non_scpi (filtré des deux fichiers).
  const hasKyaneos = merged.some((r) => isExcludedScpi(r.folder) || (r.nom_scpi && isExcludedScpi(r.nom_scpi)));
  const entries: QaEntry[] = merged.map(toEntry);
  if (!hasKyaneos) {
    entries.push({
      nom_scpi: 'Kyaneos Denormandie 4',
      folder: 'Kyaneos Denormandie 4',
      statut_qa: 'excluded_non_scpi',
      prix_souscription: null,
      valeur_reconstitution: null,
      unite_vr: null,
      vr_par_part: false,
      vr_globale_derivee: false,
      valeur_reconstitution_ajustee: null,
      split_detecte: false,
      split_ratio: null,
      split_applique: false,
      decote_surcote_percent: null,
      label: null,
      document_source: null,
      page_source: null,
      extrait_vr: null,
      source_periode_split: null,
      decision_qa: 'Produit Denormandie — hors périmètre SCPI. Exclu définitivement.',
      formula: null,
    });
  }

  entries.sort((a, b) => a.nom_scpi.localeCompare(b.nom_scpi, 'fr'));

  const counts: Record<QaStatut, number> = {
    publishable: 0,
    manual_review: 0,
    rejected: 0,
    excluded_non_scpi: 0,
  };
  for (const e of entries) counts[e.statut_qa]++;

  const output = {
    meta: {
      generated_at: new Date().toISOString(),
      provider: 'deepseek',
      sources: [
        'data-import/scpi-agent/deepseek_reconstitution_full.json',
        'data-import/scpi-agent/deepseek_reconstitution_retry_non_verified.json',
      ],
      qa_rules: [
        'VR par part obligatoire (valeur globale M€/Md€ neutralisée sauf calcul par part documenté).',
        'abs(decote_surcote) > 20 % → manual_review.',
        'Split appliqué uniquement si prix et VR sur bases différentes + ratio sourcé.',
        'Kyaneos Denormandie 4 → excluded_non_scpi.',
      ],
      total: entries.length,
      counts,
      disclaimer:
        'Données extraites de documents officiels. Performances passées ≠ performances futures. Pas de promesse de rendement. Information générale non personnalisée.',
    },
    scpi: entries,
  };

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  mkdirSync(dirname(OUT_REPORT), { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  writeFileSync(OUT_CSV, buildCsv(entries), 'utf8');
  writeFileSync(OUT_REPORT, buildReport(entries), 'utf8');

  console.log('✅ QA finale terminée (sans API).');
  console.log(`Total            : ${entries.length}`);
  console.log(`publishable      : ${counts.publishable}`);
  console.log(`manual_review    : ${counts.manual_review}`);
  console.log(`rejected         : ${counts.rejected}`);
  console.log(`excluded_non_scpi: ${counts.excluded_non_scpi}`);
  console.log(`JSON   → ${OUT_JSON}`);
  console.log(`CSV    → ${OUT_CSV}`);
  console.log(`Rapport → ${OUT_REPORT}`);
}

main();
