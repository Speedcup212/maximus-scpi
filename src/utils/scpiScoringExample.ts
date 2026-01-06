/**
 * EXEMPLES D'UTILISATION DU SYSTÈME DE SCORING SCPI
 *
 * Ce fichier contient des exemples pratiques d'utilisation du système de scoring
 */

import { Scpi } from '../types/scpi';
import { calculateScpiScores, calculateAndSaveScpiScores, getLatestScpiScores } from './scpiScoringService';
import { scoreScpiBatch, defaultParams, ScpiInput } from './scpiScoring';

// ============================================================================
// EXEMPLE 1 : Calcul de scores sur des données locales (JSON)
// ============================================================================

export async function exemple1_CalculerScoresLocaux() {
  // Importer vos SCPI depuis scpiData.ts
  const { scpiData } = await import('../data/scpiData');

  console.log('📊 Calcul des scores pour', scpiData.length, 'SCPI...');

  const scores = await calculateScpiScores(scpiData);

  // Afficher les 5 meilleures SCPI
  const top5 = scores
    .sort((a, b) => b.score_total - a.score_total)
    .slice(0, 5);

  console.log('\n🏆 TOP 5 SCPI par score total:');
  top5.forEach((s, i) => {
    console.log(`${i + 1}. ${s.nom} - Score: ${s.score_total}/100`);
    console.log(`   Détail: Rendement=${s.score_rendement} Secteur=${s.score_secteur} Géo=${s.score_geo} Qualité=${s.score_qualite} Taille=${s.score_taille}`);
  });

  return scores;
}

// ============================================================================
// EXEMPLE 2 : Calcul et sauvegarde en base de données
// ============================================================================

export async function exemple2_CalculerEtSauvegarder() {
  const { scpiData } = await import('../data/scpiData');

  console.log('💾 Calcul et sauvegarde des scores en base...');

  const result = await calculateAndSaveScpiScores(scpiData);

  if (result.success) {
    console.log('✅ Scores sauvegardés avec succès!');
    console.log(`   ${result.scores.length} SCPI scorées`);
  } else {
    console.error('❌ Erreur:', result.error);
  }

  return result;
}

// ============================================================================
// EXEMPLE 3 : Récupérer les derniers scores depuis la DB
// ============================================================================

export async function exemple3_RecupererScoresBDD() {
  console.log('🔍 Récupération des scores depuis la base...');

  const result = await getLatestScpiScores();

  if (result.success) {
    const scpiIds = Object.keys(result.scores);
    console.log(`✅ ${scpiIds.length} SCPI trouvées avec scores`);

    // Afficher un exemple
    const firstScore = result.scores[Number(scpiIds[0])];
    console.log('\n📋 Exemple de score:');
    console.log(`   SCPI: ${firstScore.nom}`);
    console.log(`   Score total: ${firstScore.score_total}/100`);
    console.log(`   Date: ${new Date(firstScore.created_at).toLocaleDateString()}`);
  } else {
    console.error('❌ Erreur:', result.error);
  }

  return result;
}

// ============================================================================
// EXEMPLE 4 : Scoring personnalisé avec paramètres modifiés
// ============================================================================

export async function exemple4_ScoringPersonnalise() {
  // Créer des paramètres personnalisés
  const customParams = {
    ...defaultParams,
    barèmes: {
      ...defaultParams.barèmes,
      secteur: {
        ...defaultParams.barèmes.secteur,
        // Surpondérer la santé
        "sant": 1.00,
        "health": 1.00,
        // Sous-pondérer l'hôtellerie
        "hôtel": 0.40,
        "hotel": 0.40,
      }
    }
  };

  const { scpiData } = await import('../data/scpiData');
  const { transformScpiArrayToScoringInput } = await import('./scpiDataTransformer');

  const scoringInput = transformScpiArrayToScoringInput(scpiData);
  const scores = scoreScpiBatch(scoringInput, customParams);

  console.log('🎯 Scoring personnalisé (santé favorisée):');
  const top3 = scores
    .sort((a, b) => b.score_total - a.score_total)
    .slice(0, 3);

  top3.forEach((s, i) => {
    console.log(`${i + 1}. ${s.nom} - Score: ${s.score_total}/100`);
  });

  return scores;
}

// ============================================================================
// EXEMPLE 5 : Analyse détaillée d'une SCPI avec audit trail
// ============================================================================

export async function exemple5_AnalyseDetailleeScpi(scpiNom: string) {
  const { scpiData } = await import('../data/scpiData');

  const scpiCible = scpiData.find(s => s.name === scpiNom);
  if (!scpiCible) {
    console.error(`❌ SCPI "${scpiNom}" introuvable`);
    return null;
  }

  const scores = await calculateScpiScores([scpiCible]);
  const score = scores[0];

  console.log(`\n📊 ANALYSE DÉTAILLÉE: ${score.nom}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Score Total: ${score.score_total}/100`);
  console.log('\n🔍 Décomposition:');
  console.log(`  • Rendement: ${score.score_rendement}/40`);
  console.log(`  • Secteur: ${score.score_secteur}/20`);
  console.log(`  • Géographie: ${score.score_geo}/15`);
  console.log(`  • Qualité: ${score.score_qualite}/15`);
  console.log(`  • Taille: ${score.score_taille}/10`);
  console.log('\n📝 Audit Trail:');
  score.audit_trail.forEach(line => console.log(`  ${line}`));

  return score;
}

// ============================================================================
// EXEMPLE 6 : Comparaison de 2 SCPI
// ============================================================================

export async function exemple6_ComparerDeuxScpi(nom1: string, nom2: string) {
  const { scpiData } = await import('../data/scpiData');

  const scpi1 = scpiData.find(s => s.name === nom1);
  const scpi2 = scpiData.find(s => s.name === nom2);

  if (!scpi1 || !scpi2) {
    console.error('❌ Une ou plusieurs SCPI introuvables');
    return null;
  }

  const scores = await calculateScpiScores([scpi1, scpi2]);

  console.log(`\n⚖️  COMPARAISON: ${nom1} vs ${nom2}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const categories = [
    { key: 'score_total', label: 'Score Total', max: 100 },
    { key: 'score_rendement', label: 'Rendement', max: 40 },
    { key: 'score_secteur', label: 'Secteur', max: 20 },
    { key: 'score_geo', label: 'Géographie', max: 15 },
    { key: 'score_qualite', label: 'Qualité', max: 15 },
    { key: 'score_taille', label: 'Taille', max: 10 },
  ];

  categories.forEach(cat => {
    const s1 = scores[0][cat.key as keyof typeof scores[0]];
    const s2 = scores[1][cat.key as keyof typeof scores[1]];
    const diff = Number(s1) - Number(s2);
    const winner = diff > 0 ? nom1 : diff < 0 ? nom2 : 'égalité';
    console.log(`${cat.label.padEnd(15)} ${String(s1).padStart(5)}/${cat.max}  vs  ${String(s2).padStart(5)}/${cat.max}  → ${winner}`);
  });

  return scores;
}

// ============================================================================
// TESTS D'ACCEPTATION (TA1-TA5)
// ============================================================================

export async function runAcceptanceTests() {
  console.log('\n🧪 TESTS D\'ACCEPTATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // TA1: Percentile de rendement
  console.log('TA1: Vérification percentile rendement');
  const testScpi: ScpiInput[] = [
    { nom: 'SCPI A', rendement: 4.5 },
    { nom: 'SCPI B', rendement: 5.0 },
    { nom: 'SCPI C', rendement: 5.5 },
    { nom: 'SCPI D', rendement: 6.0 },
    { nom: 'SCPI E', rendement: 6.5 },
  ];
  const ta1Scores = scoreScpiBatch(testScpi);
  const maxRendement = Math.max(...ta1Scores.map(s => s.score_rendement));
  console.log(`   Max score rendement: ${maxRendement}/40 ${maxRendement >= 39 ? '✅' : '❌'}`);

  // TA2: Secteur manquant
  console.log('\nTA2: Vérification fallback secteur');
  const testScpi2: ScpiInput[] = [{ nom: 'SCPI Test', rendement: 5.0 }];
  const ta2Scores = scoreScpiBatch(testScpi2);
  const scoreSecta2 = ta2Scores[0].score_secteur;
  console.log(`   Score secteur (fallback): ${scoreSecta2}/20 ${scoreSecta2 === 14 ? '✅' : '❌'}`);

  // TA3: Géo manquante
  console.log('\nTA3: Vérification fallback géo');
  const scoreGeota3 = ta2Scores[0].score_geo;
  console.log(`   Score géo (fallback France): ${scoreGeota3}/15 ${scoreGeota3 === 15 ? '✅' : '❌'}`);

  // TA4: Capitalisation null
  console.log('\nTA4: Vérification capitalisation null');
  const scoreTailleta4 = ta2Scores[0].score_taille;
  console.log(`   Score taille (capi=null): ${scoreTailleta4}/10 ${scoreTailleta4 === 3 ? '✅' : '❌'}`);

  // TA5: Prix/reconstitution manquants
  console.log('\nTA5: Vérification qualité avec données manquantes');
  const ta5Scores = scoreScpiBatch([{ nom: 'SCPI Test', rendement: 5.0 }]);
  const hasEcartFallback = ta5Scores[0].audit_trail.some(t => t.includes('Écart') && t.includes('fallback'));
  console.log(`   Fallback écart prix appliqué: ${hasEcartFallback ? '✅' : '❌'}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// ============================================================================
// Fonction d'aide pour exécuter tous les exemples
// ============================================================================

export async function runAllExamples() {
  console.log('🚀 EXÉCUTION DE TOUS LES EXEMPLES\n');

  try {
    await exemple1_CalculerScoresLocaux();
    console.log('\n' + '─'.repeat(60) + '\n');

    // Décommenter si vous voulez sauvegarder en DB
    // await exemple2_CalculerEtSauvegarder();
    // console.log('\n' + '─'.repeat(60) + '\n');

    // await exemple3_RecupererScoresBDD();
    // console.log('\n' + '─'.repeat(60) + '\n');

    await exemple4_ScoringPersonnalise();
    console.log('\n' + '─'.repeat(60) + '\n');

    await exemple5_AnalyseDetailleeScpi('Comète');
    console.log('\n' + '─'.repeat(60) + '\n');

    await exemple6_ComparerDeuxScpi('Comète', 'Transitions Europe');
    console.log('\n' + '─'.repeat(60) + '\n');

    await runAcceptanceTests();

    console.log('\n✅ Tous les exemples exécutés avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des exemples:', error);
  }
}
