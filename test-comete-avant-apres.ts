/**
 * COMPARAISON AVANT/APRÈS : Impact des optimisations sur le score Comète
 *
 * Ce test montre comment les 6 optimisations font passer Comète de ~60/100 à ~80/100
 * Exécution: npx tsx test-comete-avant-apres.ts
 */

import { scoreScpiBatch, ScpiInput, defaultParams } from './src/utils/scpiScoring';
import { sanitizeScpiInput } from './src/utils/scpiSanitize';

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 AVANT/APRÈS : Impact des Optimisations sur SCPI Comète');
console.log('═══════════════════════════════════════════════════════════════\n');

// ============================================================================
// DONNÉES COMÈTE COMPLÈTES (depuis SCPI_complet_avec_SFDR_Profil.json)
// ============================================================================

const cometeComplete: ScpiInput = {
  id: 7,
  nom: "Comète",
  societe_gestion: "Alderan",

  // Financier
  rendement: 11.18,                     // Top marché
  tof: 93.6,                            // < 95% (pénalité qualité)
  endettement: 0.6,                     // Très faible

  // Labels
  label_isr: "Oui",                     // Sera normalisé
  sfdr: "Article 8",                    // Sera normalisé

  // Taille
  capitalisation: 120.8,                // M€
  delai_jouissance: 6,                  // mois

  // Valorisation
  prix_souscription: 250,
  valeur_reconstitution: 225,           // -10% décote

  // Frais
  frais_gestion: 10.0,                  // Standard
  frais_souscription: 10.6,             // Standard

  // Répartition sectorielle (vraies données depuis JSON)
  repartition_sectorielle: {
    "Commerce alimentaire": 28.9,       // → "commerce" 0.85
    "Bureaux": 24.4,                    // → "bureau" 0.70
    "Hôtellerie": 17.1,                 // → "hôtel" 0.60
    "Retail diversifié": 11.9,          // → "retail" 0.85
    "Santé": 9.6,                       // → "sant" 1.00
    "Logistique": 8.1                   // → "logist" 0.80
  },

  // Répartition géographique (100% Europe)
  repartition_geographique: {
    "Espagne": 38.7,                    // → Europe
    "Belgique": 30.4,                   // → Europe
    "Portugal": 20.7,                   // → Europe
    "Allemagne": 10.2                   // → Europe
  }
};

// ============================================================================
// SCÉNARIO AVANT : Sans optimisations
// ============================================================================

console.log('❌ AVANT LES OPTIMISATIONS\n');
console.log('Problèmes simulés:');
console.log('  1. Percentile calculé sur échantillon réduit (3 SCPI)');
console.log('  2. Label ISR = "Oui" (non normalisé, pas reconnu)');
console.log('  3. SFDR = "Article 8" (non normalisé, pas reconnu)');
console.log('  4. Secteur "Commerce alimentaire" → fallback 0.70 (non détecté)');
console.log('  5. Répartitions non normalisées (totaux ≠ 100%)\n');

// Simuler l'AVANT en utilisant un échantillon réduit + données non sanitized
const batchAvant: ScpiInput[] = [
  { ...cometeComplete, label_isr: "Oui", sfdr: "Article 8" }, // Non normalisé
  { nom: "SCPI A", rendement: 5.0 },
  { nom: "SCPI B", rendement: 6.0 }
];

const scoresAvant = scoreScpiBatch(batchAvant, defaultParams, false); // Sans référence
const cometeAvant = scoresAvant.find(s => s.nom === "Comète")!;

console.log('━'.repeat(65));
console.log('📉 SCORE AVANT: ' + cometeAvant.score_total + '/100');
console.log('━'.repeat(65));
console.log(`  Rendement:        ${cometeAvant.score_rendement.toFixed(2)}/40`);
console.log(`  Secteur:          ${cometeAvant.score_secteur.toFixed(2)}/20`);
console.log(`  Géographie:       ${cometeAvant.score_geo.toFixed(2)}/15`);
console.log(`  Qualité:          ${cometeAvant.score_qualite.toFixed(2)}/15`);
console.log(`  Taille:           ${cometeAvant.score_taille.toFixed(2)}/10`);
console.log('━'.repeat(65) + '\n');

// ============================================================================
// SCÉNARIO APRÈS : Avec toutes les optimisations
// ============================================================================

console.log('✅ APRÈS LES OPTIMISATIONS\n');
console.log('Corrections appliquées:');
console.log('  1. ✓ Percentile calculé sur cohorte référence (51 SCPI)');
console.log('  2. ✓ Label ISR normalisé: "Oui" → "oui" (+1 pt qualité)');
console.log('  3. ✓ SFDR normalisé: "Article 8" → "8" (+0.5 pt qualité)');
console.log('  4. ✓ "Commerce alimentaire" → détecté comme commerce (0.85)');
console.log('  5. ✓ Répartitions normalisées automatiquement');
console.log('  6. ✓ Mapping géo étendu (Espagne, Belgique, etc.)\n');

// Appliquer sanitization + cohorte référence
const cometeSanitized = sanitizeScpiInput(cometeComplete);
const batchApres: ScpiInput[] = [cometeSanitized];

const scoresApres = scoreScpiBatch(batchApres, defaultParams, true); // Avec référence
const cometeApres = scoresApres.find(s => s.nom === "Comète")!;

console.log('━'.repeat(65));
console.log('📈 SCORE APRÈS: ' + cometeApres.score_total + '/100');
console.log('━'.repeat(65));
console.log(`  Rendement:        ${cometeApres.score_rendement.toFixed(2)}/40  (+${(cometeApres.score_rendement - cometeAvant.score_rendement).toFixed(1)})`);
console.log(`  Secteur:          ${cometeApres.score_secteur.toFixed(2)}/20  (+${(cometeApres.score_secteur - cometeAvant.score_secteur).toFixed(1)})`);
console.log(`  Géographie:       ${cometeApres.score_geo.toFixed(2)}/15  (+${(cometeApres.score_geo - cometeAvant.score_geo).toFixed(1)})`);
console.log(`  Qualité:          ${cometeApres.score_qualite.toFixed(2)}/15  (+${(cometeApres.score_qualite - cometeAvant.score_qualite).toFixed(1)})`);
console.log(`  Taille:           ${cometeApres.score_taille.toFixed(2)}/10  (+${(cometeApres.score_taille - cometeAvant.score_taille).toFixed(1)})`);
console.log('━'.repeat(65) + '\n');

// ============================================================================
// COMPARAISON DÉTAILLÉE
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 ANALYSE DÉTAILLÉE DES GAINS');
console.log('═══════════════════════════════════════════════════════════════\n');

const gain = cometeApres.score_total - cometeAvant.score_total;

console.log(`📊 GAIN TOTAL: +${gain.toFixed(1)} points (${((gain/cometeAvant.score_total)*100).toFixed(1)}% d'amélioration)\n`);

console.log('1️⃣  RENDEMENT:');
console.log(`   Avant: ${cometeAvant.score_rendement.toFixed(2)}/40 (percentile sur 3 SCPI)`);
console.log(`   Après: ${cometeApres.score_rendement.toFixed(2)}/40 (percentile sur 51 SCPI)`);
console.log(`   Gain:  +${(cometeApres.score_rendement - cometeAvant.score_rendement).toFixed(1)} pts\n`);

console.log('2️⃣  SECTEUR:');
console.log(`   Avant: ${cometeAvant.score_secteur.toFixed(2)}/20 (mappings limités)`);
console.log(`   Après: ${cometeApres.score_secteur.toFixed(2)}/20 (synonymes étendus)`);
console.log(`   Détail après:`);
const secteurAudit = cometeApres.audit_trail.find(t => t.includes('Secteur:'));
if (secteurAudit) console.log(`   ${secteurAudit}`);
console.log(`   Gain:  +${(cometeApres.score_secteur - cometeAvant.score_secteur).toFixed(1)} pts\n`);

console.log('3️⃣  GÉOGRAPHIE:');
console.log(`   Avant: ${cometeAvant.score_geo.toFixed(2)}/15`);
console.log(`   Après: ${cometeApres.score_geo.toFixed(2)}/15 (100% Europe détecté)`);
const geoAudit = cometeApres.audit_trail.find(t => t.includes('Géo:'));
if (geoAudit) console.log(`   ${geoAudit}`);
console.log(`   Gain:  +${(cometeApres.score_geo - cometeAvant.score_geo).toFixed(1)} pts\n`);

console.log('4️⃣  QUALITÉ:');
console.log(`   Avant: ${cometeAvant.score_qualite.toFixed(2)}/15 (ISR/SFDR non reconnus)`);
console.log(`   Après: ${cometeApres.score_qualite.toFixed(2)}/15`);
console.log(`   Détail:`);
const qualiteAudits = cometeApres.audit_trail.filter(t => t.includes('Qualité'));
qualiteAudits.forEach(a => console.log(`     ${a}`));
console.log(`   Gain:  +${(cometeApres.score_qualite - cometeAvant.score_qualite).toFixed(1)} pts\n`);

console.log('5️⃣  TAILLE:');
console.log(`   Avant: ${cometeAvant.score_taille.toFixed(2)}/10`);
console.log(`   Après: ${cometeApres.score_taille.toFixed(2)}/10`);
console.log(`   Gain:  +${(cometeApres.score_taille - cometeAvant.score_taille).toFixed(1)} pts\n`);

// ============================================================================
// VALIDATION THÉORIQUE
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ VALIDATION VS CALCUL THÉORIQUE');
console.log('═══════════════════════════════════════════════════════════════\n');

const theorique = {
  rendement: 39,
  secteur: 15,
  geo: 12,
  qualite: 9.5,
  taille: 5,
  total: 80.5
};

console.log('Comparaison avec le calcul théorique attendu:\n');
console.log(`  Rendement:   ${cometeApres.score_rendement.toFixed(2)}/40  vs ${theorique.rendement}/40  ${Math.abs(cometeApres.score_rendement - theorique.rendement) < 1 ? '✅' : '⚠️'}`);
console.log(`  Secteur:     ${cometeApres.score_secteur.toFixed(2)}/20  vs ${theorique.secteur}/20  ${Math.abs(cometeApres.score_secteur - theorique.secteur) < 1 ? '✅' : '⚠️'}`);
console.log(`  Géographie:  ${cometeApres.score_geo.toFixed(2)}/15  vs ${theorique.geo}/15  ${Math.abs(cometeApres.score_geo - theorique.geo) < 1 ? '✅' : '⚠️'}`);
console.log(`  Qualité:     ${cometeApres.score_qualite.toFixed(2)}/15  vs ${theorique.qualite}/15  ${Math.abs(cometeApres.score_qualite - theorique.qualite) < 1 ? '✅' : '⚠️'}`);
console.log(`  Taille:      ${cometeApres.score_taille.toFixed(2)}/10  vs ${theorique.taille}/10  ${Math.abs(cometeApres.score_taille - theorique.taille) < 1 ? '✅' : '⚠️'}`);
console.log(`  ─────────────────────────────────────────────────────────────`);
console.log(`  TOTAL:       ${cometeApres.score_total.toFixed(2)}/100 vs ${theorique.total}/100 ${Math.abs(cometeApres.score_total - theorique.total) < 2 ? '✅' : '⚠️'}`);

const ecart = Math.abs(cometeApres.score_total - theorique.total);
console.log(`\n  Écart avec théorique: ${ecart.toFixed(2)} points ${ecart < 2 ? '(excellent ✅)' : '(à vérifier ⚠️)'}\n`);

// ============================================================================
// CONCLUSION
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('🎯 CONCLUSION');
console.log('═══════════════════════════════════════════════════════════════\n');

if (cometeApres.score_total >= 78 && cometeApres.score_total <= 82) {
  console.log('✅ SUCCÈS COMPLET!');
  console.log(`   Score obtenu: ${cometeApres.score_total.toFixed(2)}/100`);
  console.log('   Score attendu: ~80/100 (±2 pts)');
  console.log('   → Les 6 optimisations ont corrigé tous les écarts!\n');

  console.log('📈 Catégorie finale: EXCELLENT (Premium)');
  console.log('🎯 Comète se positionne maintenant dans le TOP TIER des SCPI');
} else {
  console.log(`⚠️  Score obtenu: ${cometeApres.score_total.toFixed(2)}/100`);
  console.log('   Score attendu: ~80/100');
  console.log(`   Écart: ${Math.abs(cometeApres.score_total - 80).toFixed(1)} points\n`);
  console.log('📋 Audit trail complet disponible pour investigation:');
  cometeApres.audit_trail.forEach(line => console.log(`   ${line}`));
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✨ Test terminé');
console.log('═══════════════════════════════════════════════════════════════\n');
