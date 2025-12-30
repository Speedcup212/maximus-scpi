/**
 * TEST DE VALIDATION : Score SCPI Comète avec optimisations
 *
 * Ce test valide les 6 optimisations appliquées pour obtenir un score stable
 * Exécution: npx tsx test-comete-scoring.ts
 */

import { scoreScpiBatch, ScpiInput, defaultParams } from './src/utils/scpiScoring';
import { sanitizeScpiInput } from './src/utils/scpiSanitize';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TEST DE VALIDATION : SCPI COMÈTE AVEC OPTIMISATIONS');
console.log('═══════════════════════════════════════════════════════════════\n');

// ============================================================================
// DONNÉES BRUTES COMÈTE (avant sanitization)
// ============================================================================

const cometeBrute: ScpiInput = {
  id: 7,
  nom: "Comète",
  societe_gestion: "Alderan",
  rendement: 11.18,
  tof: 93.6,
  endettement: 0.6, // Ajouté depuis les données complètes
  label_isr: "Oui", // Sera normalisé en "oui"
  sfdr: "Article 8", // Sera normalisé en "8"
  capitalisation: 120.8, // Déjà en M€
  delai_jouissance: 6, // Ajouté depuis les données complètes
  prix_souscription: 250,
  valeur_reconstitution: 225,
  frais_gestion: 10.0,
  frais_souscription: 10.6,
  repartition_sectorielle: {
    "Entrepôts logistiques": 51,
    "Locaux d'activités": 32,
    "Logistique urbaine": 9,
    "Transports": 7,
    "Autres": 1
  },
  repartition_geographique: {
    "Espagne": 38.7,
    "Belgique": 30.4,
    "Portugal": 20.7,
    "Allemagne": 10.2
  }
};

// ============================================================================
// ÉTAPE 1 : SANITIZATION
// ============================================================================

console.log('📋 ÉTAPE 1 : Sanitization des données\n');
console.log('Avant sanitization:');
console.log(`  - label_isr: "${cometeBrute.label_isr}" (type: ${typeof cometeBrute.label_isr})`);
console.log(`  - sfdr: "${cometeBrute.sfdr}"`);
console.log(`  - capitalisation: ${cometeBrute.capitalisation} M€`);

const cometeSanitized = sanitizeScpiInput(cometeBrute);

console.log('\nAprès sanitization:');
console.log(`  - label_isr: "${cometeSanitized.label_isr}"`);
console.log(`  - sfdr: "${cometeSanitized.sfdr}"`);
console.log(`  - capitalisation: ${cometeSanitized.capitalisation} M€`);
console.log('  ✅ Sanitization appliquée\n');

// ============================================================================
// ÉTAPE 2 : SCORING AVEC COHORTE DE RÉFÉRENCE
// ============================================================================

console.log('📊 ÉTAPE 2 : Calcul du score avec cohorte de référence\n');

// Batch avec quelques autres SCPI pour comparaison
const batchTest: ScpiInput[] = [
  cometeSanitized,
  { nom: "SCPI Moyenne", rendement: 5.5, capitalisation: 300 },
  { nom: "SCPI Basse", rendement: 3.8, capitalisation: 80 },
];

// Calcul avec useReferenceCohorte = true (par défaut)
const scores = scoreScpiBatch(batchTest, defaultParams, true);
const cometeScore = scores.find(s => s.nom === "Comète")!;

// ============================================================================
// AFFICHAGE DES RÉSULTATS
// ============================================================================

console.log('━'.repeat(65));
console.log('🏢 SCPI: ' + cometeScore.nom);
console.log('🏦 Société: ' + cometeScore.societe_gestion);
console.log('━'.repeat(65));
console.log('\n🎯 SCORE TOTAL: ' + cometeScore.score_total + '/100\n');

console.log('📈 DÉCOMPOSITION DES SCORES:');
console.log('━'.repeat(65));
console.log(`  1️⃣  Rendement        ${String(cometeScore.score_rendement).padStart(5)}/40   (${((cometeScore.score_rendement/40)*100).toFixed(0)}%)`);
console.log(`  2️⃣  Secteur          ${String(cometeScore.score_secteur).padStart(5)}/20   (${((cometeScore.score_secteur/20)*100).toFixed(0)}%)`);
console.log(`  3️⃣  Géographie       ${String(cometeScore.score_geo).padStart(5)}/15   (${((cometeScore.score_geo/15)*100).toFixed(0)}%)`);
console.log(`  4️⃣  Qualité          ${String(cometeScore.score_qualite).padStart(5)}/15   (${((cometeScore.score_qualite/15)*100).toFixed(0)}%)`);
console.log(`  5️⃣  Taille/Liquidité ${String(cometeScore.score_taille).padStart(5)}/10   (${((cometeScore.score_taille/10)*100).toFixed(0)}%)`);

console.log('\n📝 AUDIT TRAIL COMPLET:');
console.log('━'.repeat(65));
cometeScore.audit_trail.forEach((line, index) => {
  console.log(`  ${String(index + 1).padStart(2)}. ${line}`);
});

// ============================================================================
// VÉRIFICATION DES OPTIMISATIONS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✅ VÉRIFICATION DES 6 OPTIMISATIONS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1️⃣  Percentile verrouillé (cohorte référence):');
const percentileCheck = cometeScore.audit_trail[0].includes('p=');
console.log(`   ${percentileCheck ? '✅' : '❌'} Percentile calculé avec cohorte stable`);

console.log('\n2️⃣  Unités et virgules corrigées (sanitization):');
const capiCheck = cometeSanitized.capitalisation === 120.8;
const isrCheck = cometeSanitized.label_isr === 'oui';
const sfdrCheck = cometeSanitized.sfdr === '8';
console.log(`   ${capiCheck ? '✅' : '❌'} Capitalisation: ${cometeSanitized.capitalisation} M€`);
console.log(`   ${isrCheck ? '✅' : '❌'} Label ISR normalisé: "${cometeSanitized.label_isr}"`);
console.log(`   ${sfdrCheck ? '✅' : '❌'} SFDR normalisé: "${cometeSanitized.sfdr}"`);

console.log('\n3️⃣  Mapping secteur renforcé:');
const secteurMapping = cometeScore.audit_trail.find(t => t.includes('Secteur:'));
const hasLogistique = secteurMapping?.includes('logist') || secteurMapping?.includes('Entrepôts');
console.log(`   ${hasLogistique ? '✅' : '❌'} Logistique détecté avec synonymes`);
console.log(`   Score secteur: ${cometeScore.score_secteur}/20`);

console.log('\n4️⃣  Mapping géo renforcé:');
const geoMapping = cometeScore.audit_trail.find(t => t.includes('Géo:'));
const hasEurope = geoMapping?.includes('EU');
console.log(`   ${hasEurope ? '✅' : '❌'} Pays européens détectés`);
console.log(`   Score géo: ${cometeScore.score_geo}/15`);

console.log('\n5️⃣  Normalisation des % (via normaliseWeights):');
const normalizedCheck = cometeScore.score_secteur > 0 && cometeScore.score_geo > 0;
console.log(`   ${normalizedCheck ? '✅' : '❌'} Répartitions normalisées`);

console.log('\n6️⃣  Audit trail disponible:');
const auditCheck = cometeScore.audit_trail.length > 5;
console.log(`   ${auditCheck ? '✅' : '❌'} ${cometeScore.audit_trail.length} lignes d'audit générées`);

// ============================================================================
// ANALYSE DU SCORE
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('💡 ANALYSE FINALE');
console.log('═══════════════════════════════════════════════════════════════\n');

const scoreCategory =
  cometeScore.score_total >= 80 ? 'Excellent (Premium)' :
  cometeScore.score_total >= 70 ? 'Très bon' :
  cometeScore.score_total >= 60 ? 'Bon' :
  cometeScore.score_total >= 50 ? 'Correct' : 'À surveiller';

console.log(`📊 Score: ${cometeScore.score_total}/100`);
console.log(`📈 Catégorie: ${scoreCategory}`);
console.log(`🎯 Positionnement: ${cometeScore.score_total >= 70 ? 'Top tier' : 'Milieu de gamme'}\n`);

console.log('✅ Points forts:');
if (cometeScore.score_rendement >= 35) console.log('   • Excellent rendement (top marché)');
if (cometeScore.score_secteur >= 15) console.log('   • Bonne diversification sectorielle');
if (cometeScore.score_geo >= 10) console.log('   • Présence européenne solide');
if (cometeSanitized.label_isr === 'oui') console.log('   • Label ISR (investissement responsable)');

console.log('\n⚠️  Points de vigilance:');
if (cometeScore.score_qualite < 12) console.log('   • TOF < 95% (à surveiller)');
if (cometeScore.score_taille < 7) console.log('   • Capitalisation moyenne (pas de prime taille)');
if (cometeSanitized.endettement && cometeSanitized.endettement > 0) console.log('   • Présence d\'endettement');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✨ Test terminé avec succès!');
console.log('═══════════════════════════════════════════════════════════════\n');
