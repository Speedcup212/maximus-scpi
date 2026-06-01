/**
 * integrate-scpi-71-enriched.ts
 * Intègre les données SCPI extraites (T1 2026) dans src/data/scpi_complet.json
 * Exécuter avec : npx tsx scripts/integrate-scpi-71-enriched.ts
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ─── Types ──────────────────────────────────────────────────────────────────

interface MasterDossier {
  source_folder: string;
  canonical_name: string;
  societe_gestion: string;
  status_initial: string;
  status_final: string;
  traite_extraction_47: boolean;
  lot_extraction?: number;
  confidence_score?: number;
  extraction_status_detail?: string;
  source_document?: string;
  source_periode?: string;
  prix_souscription?: string;
  prix_retrait?: string;
  valeur_realisation?: string;
  valeur_reconstitution?: string;
  capitalisation?: string;
  nb_associes?: string;
  nb_parts?: string;
  nb_actifs?: string;
  tof?: string;
  taux_distribution_2025?: string;
  dividende_brut_t1_2026?: string;
  endettement?: string;
  parts_en_attente?: string;
  frequence_distribution?: string;
  type_capital?: string;
  repartition_sectorielle?: string | Record<string, string>;
  repartition_geo?: string;
  objectif_td?: string;
  commentaire?: string;
}

interface ScpiRecord {
  'Nom SCPI': string;
  'Société de gestion'?: string;
  'Année de création'?: number;
  'Label ISR'?: string;
  'Capitalisation (M€)'?: number;
  'Prix de souscription (€)'?: number;
  'Valeur de retrait (€)'?: number;
  'Surcote/décote (%)'?: number;
  'Valeur de reconstitution (€)'?: number;
  'Valeur de réalisation (€)'?: number;
  'Taux de distribution (%)'?: number;
  'Distribution (€/part)'?: number;
  'Endettement (%)'?: number;
  'TOF (%)'?: number;
  "Nombre d'immeubles"?: number;
  'Minimum de souscription €'?: number;
  'Délai de jouissance (mois)'?: number;
  'Versement des loyers'?: string;
  'Durée de détention recommandée (ans)'?: number;
  'Frais de gestion (HT/%)'?: number;
  'Répartition Géographique'?: string;
  'Répartition Sectorielle'?: string;
  'Répartition Géographique JSON'?: Record<string, number>;
  'Répartition Sectorielle JSON'?: Record<string, number>;
  'Profil_de_risque'?: { SRRI?: number; [key: string]: unknown };
  'Frais de souscription (TTC/%)'?: number;
  "Nombre d'associés"?: number;
  'Nombre de parts'?: number;
  'WALT'?: number;
  'WALB'?: number;
  'Nombre de locataires'?: number;
  'Nombre de baux'?: number;
  'Surface gérée (m²)'?: number;
  'Loyers annuels en place (M€)'?: number;
  'Loyers encaissés trimestre (M€)'?: number;
  'Collecte nette trimestre (M€)'?: number;
  'Actualités trimestrielles'?: string;
  'Période bulletin trimestriel'?: string;
  'Nombre de cessions trimestre'?: number;
  "Nombre d'acquisitions trimestre"?: number;
  'Distribution trimestrielle T1 2026 (€/part)'?: number;
  maximus_warnings?: string[];
  maximus_data_status?: string;
  maximus_source_document?: string;
  maximus_source_periode?: string;
  maximus_confidence_score?: number;
  [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeNameForMatching(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[æ]/g, 'ae')
    .replace(/[ç]/g, 'c')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[ñ]/g, 'n')
    .replace(/[òóôõöø]/g, 'o')
    .replace(/[œ]/g, 'oe')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ý]/g, 'y')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\bscpi\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Manual mapping: canonical_name (from master) → Nom SCPI (in scpi_complet.json)
 * Used when automatic normalization doesn't resolve the match
 */
const MANUAL_NAME_MAP: Record<string, string> = {
  'Cœur Europe': "Coeur d'Europe",
  'Cœur de Ville': 'Coeur de ville',
  'Altixia Cadence XII': 'Altixia Cadence 12',
  'Urban Cœur Commerce': 'Urban Coeur de Commerce',
  'Atream Hôtels': 'Atream Hotel',
  'LF Opportunité Immo': 'Opportunité Immo',
  'Selectipierre 2 Paris': 'Selectipierre 2',
  'PAREF Hexa': 'Paref Hexa',
  'PERIAL O2': 'Perial O2',
  'PERIAL Grand Paris': 'Perial Grand Paris',
  'PERIAL Opportunités Europe': 'Perial Opportunités Europe',
  'Novaxia Néo': 'Novaxia NEO',
};

/**
 * SCPIs to mark as manual_review — données partielles ou SCPI atypique
 */
const MANUAL_REVIEW_SCPIS = new Set(['Remake UK 2025']);

/**
 * Warnings par SCPI canonique
 */
const MAXIMUS_WARNINGS: Record<string, string[]> = {
  'LF Grand Paris Patrimoine': [
    'Marché des parts suspendu depuis le 12/02/2026',
    '10,2 % de parts en attente de retrait',
    'Dividende T1 2026 en forte baisse (-65 % vs trimestres précédents)',
  ],
  'LF Europimmo': [
    'Prix de part -23,28 % en 2025',
    'Collecte à l\'arrêt',
  ],
  'PAREF Hexa': [
    'PGA 2025 : -12,10 %',
    'TRI 5 ans : 0,41 %',
    'Plan de cession en cours',
  ],
  'Primovie': [
    '1 438 276 parts en attente de retrait',
    'PGA 2025 : -7,31 %',
    'Fonds de remboursement actif (15 M€)',
  ],
  'Patrimmo Commerce': [
    '765 342 parts en attente de retrait',
    'PGA 2025 : -5,71 %',
    'Fonds de remboursement actif',
  ],
  'Patrimmo Croissance Impact': [
    'PGA 2025 : -7,68 %',
    'Aucune distribution courante (nue-propriété)',
    '38 277 parts en attente de retrait',
  ],
  'Épargne Foncière': [
    'TRI 5 ans : -0,80 %',
    'Retraits élevés',
  ],
  'PERIAL O2': [
    'Variabilité du capital suspendue depuis février 2026',
    'Marché secondaire ouvert en avril 2026',
    'TOF : 86,2 %',
  ],
  'PERIAL Grand Paris': [
    'Variabilité du capital suspendue depuis février 2026',
    'Marché secondaire ouvert en avril 2026',
    'Bureaux IDF difficile — distribution en baisse',
  ],
  'Sofiprime': [
    'TOF : 79,47 % — faible taux d\'occupation',
    'Taux de distribution annuel : 0,54 %',
  ],
  'Rivoli Avenir Patrimoine': [
    'Distribution T1 2026 en baisse',
    'Taux d\'endettement élevé (~38,6 %)',
    'Bureaux IDF difficile',
  ],
  'Remake UK 2025': [
    'Données partielles — prix de souscription non extrait',
    'SCPI à durée de vie limitée (7 ans, jusqu\'en 2032)',
    'Risque de change EUR/GBP',
  ],
  'PERIAL Opportunités Europe': [
    'Division du prix de part par 20 au 01/01/2026 (avant : ~880 €, après : ~44 €)',
    'Distribution mensuelle depuis janvier 2026',
  ],
  'Praemia Hôtels Europe': [
    'Pivot stratégique vers l\'hôtellerie — anciennement Primofamily (résidentiel)',
    'Visa AMF du 10/02/2026',
    '120 187 parts en attente de retrait',
  ],
  'Ficommerce Proximité': [
    'Division du nominal par 3 au 01/01/2026 (ancienne part 210 € → 3 parts à 70 €)',
  ],
  'Wemo One': [
    'SCPI jeune (2024) — taux de distribution élevé non représentatif d\'un TD récurrent',
    'Revalorisation du prix à 210 € en avril 2026',
  ],
};

/** Parse un nombre depuis une chaîne du type "255 €", "93 M€", "94,25 %", "3,84 €" */
function parseNumericStr(s: string | undefined | null): number | undefined {
  if (!s || s.startsWith('non ') || s.startsWith('En attente') || s === '-') return undefined;
  // Remove all non-numeric except comma, dot, minus
  const clean = s
    .replace(/\s/g, '')
    .replace('M€', '')
    .replace('€', '')
    .replace('%', '')
    .replace(/[^\d,.\-]/g, '')
    .replace(',', '.');
  const v = parseFloat(clean);
  return isNaN(v) ? undefined : v;
}

/** Parse la fréquence de distribution en label normalisé */
function parseFrequence(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const l = s.toLowerCase();
  if (l.includes('mensuel')) return 'Mensuel';
  if (l.includes('trimestriel') || l.includes('trim')) return 'Trimestriel';
  if (l.includes('semestriel')) return 'Semestriel';
  if (l.includes('annuel')) return 'Annuel';
  return undefined;
}

/** Parse la répartition sectorielle depuis la valeur master */
function parseSectorRepartition(val: string | Record<string, string> | undefined): Record<string, number> | undefined {
  if (!val) return undefined;
  if (typeof val === 'object') {
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(val)) {
      const num = parseNumericStr(v as string);
      if (num !== undefined && num > 0) result[k] = num;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  // String like "Bureaux 40,2% / Commerces 28,3%"
  if (typeof val === 'string' && val.includes('%')) {
    const result: Record<string, number> = {};
    const parts = val.split('/');
    for (const part of parts) {
      const m = part.trim().match(/^(.+?)\s+([\d,]+)\s*%/);
      if (m) {
        const num = parseFloat(m[2].replace(',', '.'));
        if (!isNaN(num)) result[m[1].trim()] = num;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  return undefined;
}

/** Calcule la surcote/décote */
function computeDiscount(prixSouscription: number | undefined, valeurReconstitution: number | undefined): number | undefined {
  if (!prixSouscription || !valeurReconstitution || valeurReconstitution === 0) return undefined;
  return Math.round(((prixSouscription - valeurReconstitution) / valeurReconstitution) * 10000) / 100;
}

/** Parse nombre d'associés : "1 626" ou "1\u202f626" → 1626 */
function parseCount(s: string | undefined): number | undefined {
  if (!s || s.startsWith('non ')) return undefined;
  const clean = s.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  const v = parseFloat(clean);
  return isNaN(v) ? undefined : Math.round(v);
}

// ─── Chargement des données ───────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  MaximusSCPI — Intégration SCPI T1 2026');
console.log('═══════════════════════════════════════════════════════════\n');

const masterPath = join(ROOT, 'data-import', 'master_scpi_71_enriched.json');
const scpiPath = join(ROOT, 'src', 'data', 'scpi_complet.json');
const backupPath = join(ROOT, 'src', 'data', `scpi_complet.backup.${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

const masterRaw = JSON.parse(readFileSync(masterPath, 'utf-8'));
const scpiRaw: ScpiRecord[] = JSON.parse(readFileSync(scpiPath, 'utf-8'));

console.log(`✓ Master chargé : ${masterRaw.dossiers.length} dossiers`);
console.log(`✓ scpi_complet.json chargé : ${scpiRaw.length} entrées`);

// ─── Sauvegarde ───────────────────────────────────────────────────────────────

copyFileSync(scpiPath, backupPath);
const backupName = backupPath.split(/[/\\]/).pop() ?? backupPath;
console.log(`✓ Sauvegarde créée : src/data/${backupName}`);

// ─── Déduplications ───────────────────────────────────────────────────────────

const deduped: ScpiRecord[] = [];
const seenNames = new Map<string, number>(); // normalized → index in deduped

for (const entry of scpiRaw) {
  const nom = entry['Nom SCPI'];
  if (!nom) continue;
  const nKey = normalizeNameForMatching(nom);
  if (!seenNames.has(nKey)) {
    seenNames.set(nKey, deduped.length);
    deduped.push({ ...entry });
  } else {
    // Merge: keep entry with bulletin period if available
    const idx = seenNames.get(nKey)!;
    const existing = deduped[idx];
    if (entry['Période bulletin trimestriel'] && !existing['Période bulletin trimestriel']) {
      deduped[idx]['Période bulletin trimestriel'] = entry['Période bulletin trimestriel'];
      if (entry['Actualités trimestrielles']) deduped[idx]['Actualités trimestrielles'] = entry['Actualités trimestrielles'];
    }
  }
}
console.log(`✓ Déduplification : ${scpiRaw.length} entrées → ${deduped.length} SCPIs uniques`);

// ─── Indexation ───────────────────────────────────────────────────────────────

const nameIndex = new Map<string, number>(); // normalized name → index in deduped
for (let i = 0; i < deduped.length; i++) {
  const nom = deduped[i]['Nom SCPI'];
  nameIndex.set(normalizeNameForMatching(nom), i);
}

function findExistingIndex(canonicalName: string): number | undefined {
  // Try manual map first
  const mapped = MANUAL_NAME_MAP[canonicalName];
  if (mapped) {
    const idx = nameIndex.get(normalizeNameForMatching(mapped));
    if (idx !== undefined) return idx;
  }
  // Try direct normalization
  const normalized = normalizeNameForMatching(canonicalName);
  return nameIndex.get(normalized);
}

// ─── Filtrer les dossiers à intégrer ─────────────────────────────────────────

const dossiers: MasterDossier[] = masterRaw.dossiers.filter(
  (d: MasterDossier) =>
    d.status_final.startsWith('extracted') &&
    d.canonical_name !== 'Kyaneos Denormandie 4'
);

console.log(`\n→ ${dossiers.length} dossiers extraits à intégrer (hors non-SCPI)\n`);

// ─── Intégration ─────────────────────────────────────────────────────────────

const report = {
  added: [] as string[],
  updated: [] as string[],
  partial_review: [] as string[],
  manual_review: [] as string[],
  skipped: [] as { name: string; reason: string }[],
  warnings_added: [] as string[],
  mapping_errors: [] as string[],
};

for (const d of dossiers) {
  const cn = d.canonical_name;

  // Skip Kyaneos Denormandie 4 (non-SCPI)
  if (cn === 'Kyaneos Denormandie 4') {
    report.skipped.push({ name: cn, reason: 'Non-SCPI (Denormandie)' });
    continue;
  }

  // Parse numeric values
  const prixSouscription = parseNumericStr(d.prix_souscription);
  const prixRetrait = parseNumericStr(d.prix_retrait);
  const valeurRealisation = parseNumericStr(d.valeur_realisation);
  const valeurReconstitution = parseNumericStr(d.valeur_reconstitution);
  const capitalisation = parseNumericStr(d.capitalisation); // M€
  const tof = parseNumericStr(d.tof);
  const td2025 = parseNumericStr(d.taux_distribution_2025);
  const endettement = parseNumericStr(d.endettement);
  const dividendeT1 = parseNumericStr(d.dividende_brut_t1_2026);
  const nbActifs = d.nb_actifs ? parseCount(d.nb_actifs) : undefined;
  const nbAssocies = d.nb_associes ? parseCount(d.nb_associes) : undefined;
  const nbParts = d.nb_parts ? parseCount(d.nb_parts) : undefined;
  const partsAttente = d.parts_en_attente ? parseCount(d.parts_en_attente) : undefined;
  const surcoteDecote = computeDiscount(prixSouscription, valeurReconstitution);
  const frequence = parseFrequence(d.frequence_distribution);
  const sectorRep = parseSectorRepartition(d.repartition_sectorielle);

  // Annual distribution estimate (quarterly × 4)
  const distributionAnnuelle = dividendeT1 !== undefined ? Math.round(dividendeT1 * 4 * 100) / 100 : undefined;

  // Warnings
  const warnings = MAXIMUS_WARNINGS[cn] || [];

  // Data status
  const dataStatus = MANUAL_REVIEW_SCPIS.has(cn) ? 'partial_review'
    : d.extraction_status_detail?.includes('partial') ? 'partial_review'
    : 'extracted_t1_2026';

  const existingIdx = findExistingIndex(cn);

  // Build the fields to inject (only non-empty, no "N/D" strings)
  const fieldsToInject: Partial<ScpiRecord> = {};

  if (td2025 !== undefined) fieldsToInject['Taux de distribution (%)'] = td2025;
  if (prixSouscription !== undefined) fieldsToInject['Prix de souscription (€)'] = prixSouscription;
  if (prixRetrait !== undefined) fieldsToInject['Valeur de retrait (€)'] = prixRetrait;
  if (valeurRealisation !== undefined) fieldsToInject['Valeur de réalisation (€)'] = valeurRealisation;
  if (valeurReconstitution !== undefined) fieldsToInject['Valeur de reconstitution (€)'] = valeurReconstitution;
  if (capitalisation !== undefined) fieldsToInject['Capitalisation (M€)'] = capitalisation;
  if (tof !== undefined) fieldsToInject['TOF (%)'] = tof;
  if (endettement !== undefined) fieldsToInject['Endettement (%)'] = endettement;
  if (nbActifs !== undefined) fieldsToInject["Nombre d'immeubles"] = nbActifs;
  if (nbAssocies !== undefined) fieldsToInject["Nombre d'associés"] = nbAssocies;
  if (nbParts !== undefined) fieldsToInject['Nombre de parts'] = nbParts;
  if (surcoteDecote !== undefined) fieldsToInject['Surcote/décote (%)'] = surcoteDecote;
  if (frequence) fieldsToInject['Versement des loyers'] = frequence;
  if (dividendeT1 !== undefined) fieldsToInject['Distribution trimestrielle T1 2026 (€/part)'] = dividendeT1;
  if (distributionAnnuelle !== undefined) fieldsToInject['Distribution (€/part)'] = distributionAnnuelle;
  if (d.source_periode) fieldsToInject['Période bulletin trimestriel'] = d.source_periode;
  if (sectorRep) fieldsToInject['Répartition Sectorielle JSON'] = sectorRep;

  // Maximus metadata
  if (warnings.length > 0) fieldsToInject['maximus_warnings'] = warnings;
  fieldsToInject['maximus_data_status'] = dataStatus;
  if (d.source_document) fieldsToInject['maximus_source_document'] = d.source_document;
  if (d.source_periode) fieldsToInject['maximus_source_periode'] = d.source_periode;
  if (d.confidence_score !== undefined) fieldsToInject['maximus_confidence_score'] = d.confidence_score;

  if (existingIdx !== undefined) {
    // UPDATE existing SCPI
    const existing = deduped[existingIdx];
    for (const [key, value] of Object.entries(fieldsToInject)) {
      // Do not overwrite non-empty useful fields with empty/undefined
      const currentVal = existing[key];
      if (value !== undefined && value !== null && value !== '') {
        if (currentVal === undefined || currentVal === null || currentVal === '' ||
            key.startsWith('maximus') || key.includes('T1 2026')) {
          (existing as Record<string, unknown>)[key] = value;
        } else {
          // Overwrite only if we're updating financial data (T1 2026 is more recent)
          const financialKeys = [
            'Taux de distribution (%)', 'TOF (%)', 'Capitalisation (M€)',
            'Prix de souscription (€)', 'Valeur de retrait (€)',
            'Valeur de réalisation (€)', 'Valeur de reconstitution (€)',
            'Endettement (%)', 'Surcote/décote (%)', 'Distribution (€/part)',
            "Nombre d'immeubles", "Nombre d'associés", 'Nombre de parts',
            'Versement des loyers', 'Période bulletin trimestriel',
            'Répartition Sectorielle JSON',
          ];
          if (financialKeys.includes(key)) {
            (existing as Record<string, unknown>)[key] = value;
          }
        }
      }
    }
    if (warnings.length > 0) report.warnings_added.push(cn);
    if (MANUAL_REVIEW_SCPIS.has(cn)) {
      report.manual_review.push(cn);
    } else if (dataStatus === 'partial_review') {
      report.partial_review.push(cn);
    } else {
      report.updated.push(cn);
    }
  } else {
    // ADD new SCPI
    const newEntry: ScpiRecord = {
      'Nom SCPI': cn,
      'Société de gestion': d.societe_gestion || '',
      ...fieldsToInject,
    };
    deduped.push(newEntry);
    nameIndex.set(normalizeNameForMatching(cn), deduped.length - 1);

    if (warnings.length > 0) report.warnings_added.push(cn);
    if (MANUAL_REVIEW_SCPIS.has(cn)) {
      report.manual_review.push(cn);
    } else if (dataStatus === 'partial_review') {
      report.partial_review.push(cn);
    } else {
      report.added.push(cn);
    }
  }
}

// ─── Écriture du fichier ──────────────────────────────────────────────────────

writeFileSync(scpiPath, JSON.stringify(deduped, null, 2), 'utf-8');
console.log(`✓ src/data/scpi_complet.json mis à jour : ${deduped.length} SCPIs`);

// ─── Rapport Markdown ────────────────────────────────────────────────────────

const reportsDir = join(ROOT, 'reports', 'scpi-2026');
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

const reportMd = `# Rapport d'intégration — SCPI T1 2026 → MaximusSCPI

**Date :** ${now}
**Script :** scripts/integrate-scpi-71-enriched.ts
**Branche :** data/scpi-47-extraction

---

## Résumé

| Indicateur | Valeur |
|---|---|
| SCPIs ajoutées (nouvelles) | **${report.added.length}** |
| SCPIs mises à jour | **${report.updated.length}** |
| SCPIs en partial_review | ${report.partial_review.length} |
| SCPIs en manual_review | ${report.manual_review.length} |
| SCPIs avec maximus_warnings | ${report.warnings_added.length} |
| SCPIs ignorées | ${report.skipped.length} |
| Erreurs de mapping | ${report.mapping_errors.length} |
| Total SCPIs dans scpi_complet.json après intégration | ${deduped.length} |
| Doublons supprimés | ${scpiRaw.length - (deduped.length - report.added.length)} |

---

## SCPIs ajoutées (${report.added.length} nouvelles)

${report.added.map(n => `- ✅ ${n}`).join('\n') || '_Aucune_'}

## SCPIs mises à jour (${report.updated.length})

${report.updated.map(n => `- 🔄 ${n}`).join('\n') || '_Aucune_'}

## SCPIs en partial_review (${report.partial_review.length})

${report.partial_review.map(n => `- ⚠️ ${n}`).join('\n') || '_Aucune_'}

## SCPIs en manual_review (${report.manual_review.length})

${report.manual_review.map(n => `- 🔴 ${n}`).join('\n') || '_Aucune_'}

## SCPIs avec maximus_warnings (${report.warnings_added.length})

${report.warnings_added.map(n => {
  const w = MAXIMUS_WARNINGS[n] || [];
  return `### ${n}\n${w.map(ww => `- ${ww}`).join('\n')}`;
}).join('\n\n') || '_Aucune_'}

## SCPIs ignorées (${report.skipped.length})

${report.skipped.map(s => `- ${s.name} : ${s.reason}`).join('\n') || '_Aucune_'}

## Erreurs de mapping (${report.mapping_errors.length})

${report.mapping_errors.join('\n') || '_Aucune_'}

---

## Détails techniques

- **Fichier source :** data-import/master_scpi_71_enriched.json
- **Fichier mis à jour :** src/data/scpi_complet.json
- **Sauvegarde :** ${backupPath.split(/[/\\]src[/\\]data[/\\]/)[1] ?? backupPath}
- **Champs mis à jour :** Taux de distribution, Prix de souscription, TOF, Capitalisation, Endettement, Valeur de réalisation/reconstitution/retrait, Nb immeubles, Distribution T1 2026, Répartition sectorielle JSON
- **Nouveaux champs ajoutés :** maximus_warnings, maximus_data_status, maximus_source_document, maximus_source_periode, maximus_confidence_score, Distribution trimestrielle T1 2026 (€/part)
- **Règles appliquées :** Pas d'écrasement des champs existants utiles par des valeurs vides / Jamais de "N/D" / Déduplification automatique / Kyaneos Denormandie 4 exclu

---

*Rapport généré automatiquement par scripts/integrate-scpi-71-enriched.ts — Agent 03 Data SCPI — MaximusSCPI*
`;

const reportPath = join(reportsDir, 'rapport_integration_scpi_71.md');
writeFileSync(reportPath, reportMd, 'utf-8');
console.log(`✓ Rapport généré : reports/scpi-2026/rapport_integration_scpi_71.md`);

// ─── Résumé console ──────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  RÉSULTATS');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  ✅ Ajoutées          : ${report.added.length}`);
console.log(`  🔄 Mises à jour      : ${report.updated.length}`);
console.log(`  ⚠️  Partial review    : ${report.partial_review.length}`);
console.log(`  🔴 Manual review     : ${report.manual_review.length}`);
console.log(`  ⚡ Warnings          : ${report.warnings_added.length}`);
console.log(`  ⏭  Ignorées          : ${report.skipped.length}`);
console.log(`  ❌ Erreurs mapping   : ${report.mapping_errors.length}`);
console.log(`  📊 Total JSON final  : ${deduped.length} SCPIs`);
console.log('═══════════════════════════════════════════════════════════\n');
