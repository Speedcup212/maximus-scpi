/**
 * SCRIPT DE MISE À JOUR : Calcul et mise à jour des scores des 51 SCPI
 *
 * Ce script :
 * 1. Charge les 51 SCPI depuis la table scpi_final_51
 * 2. Applique les optimisations (sanitization + cohorte référence)
 * 3. Calcule les scores avec le moteur déterministe
 * 4. Met à jour/insère dans la table scores_scpi
 *
 * Exécution: npx tsx update-all-scores.ts
 */

import { createClient } from '@supabase/supabase-js';
import { scoreScpiBatch, defaultParams } from './src/utils/scpiScoring';
import { transformSupabaseScpiToScoringInput } from './src/utils/scpiDataTransformer';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔄 MISE À JOUR DES SCORES : 51 SCPI');
console.log('═══════════════════════════════════════════════════════════════\n');

async function updateAllScores() {
  try {
    // ========================================================================
    // ÉTAPE 1 : Charger les 51 SCPI depuis le fichier JSON
    // ========================================================================
    console.log('📥 ÉTAPE 1 : Chargement des SCPI depuis le fichier JSON\n');

    // Importer le fichier JSON avec les données complètes
    const fs = await import('fs/promises');
    const path = await import('path');

    const jsonPath = './src/data/SCPI_complet_avec_SFDR_Profil.json';
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);

    // Extraire les SCPI du format Sheet1
    const scpiData = jsonData.Sheet1 || jsonData;

    if (!scpiData || scpiData.length === 0) {
      console.error('❌ Aucune SCPI trouvée dans le fichier JSON');
      return;
    }

    console.log(`✅ ${scpiData.length} SCPI chargées depuis le fichier\n`);

    // ========================================================================
    // ÉTAPE 2 : Transformer les données vers le format scoring
    // ========================================================================
    console.log('🔄 ÉTAPE 2 : Transformation des données\n');

    // Fonction de transformation depuis le format JSON
    const { sanitizeScpiInput } = await import('./src/utils/scpiSanitize');

    const scpiInputs = scpiData.map((scpi: any, index: number) => {
      // Parser les répartitions JSON si nécessaire
      let repartitionSector: any = {};
      let repartitionGeo: any = {};

      try {
        if (typeof scpi['Répartition Sectorielle'] === 'string') {
          // Format: "Entrepôts logistiques (51%), Locaux d'activités (32%)..."
          const sectorParts = scpi['Répartition Sectorielle'].split(',');
          sectorParts.forEach((part: string) => {
            const match = part.match(/(.+?)\s*\((\d+(?:\.\d+)?)\s*%\)/);
            if (match) {
              repartitionSector[match[1].trim()] = parseFloat(match[2]);
            }
          });
        }

        if (typeof scpi['Répartition Géographique'] === 'string') {
          repartitionGeo = JSON.parse(scpi['Répartition Géographique']);
        }
      } catch (e) {
        console.warn(`⚠️  Erreur parsing répartitions pour ${scpi['Nom SCPI']}:`, e);
      }

      const raw = {
        id: index + 1,
        nom: scpi['Nom SCPI'],
        societe_gestion: scpi['Société de gestion'],
        rendement: scpi['Taux de distribution (%)'],
        tof: scpi['TOF (%)'],
        endettement: scpi['Endettement (%)'],
        label_isr: scpi['Label ISR'],
        sfdr: scpi['SFDR'],
        capitalisation: scpi['Capitalisation (M€)'],
        delai_jouissance: scpi['Délai de jouissance (mois)'],
        prix_souscription: scpi['Prix de souscription (€)'],
        valeur_reconstitution: scpi['Valeur de reconstitution (€)'],
        frais_gestion: scpi['Frais de gestion (HT/%)'],
        frais_souscription: scpi['Frais de souscription (HT/%)'],
        repartition_sectorielle: repartitionSector,
        repartition_geographique: repartitionGeo,
      };

      return sanitizeScpiInput(raw);
    });

    console.log(`✅ ${scpiInputs.length} SCPI transformées (avec sanitization)\n`);

    // ========================================================================
    // ÉTAPE 3 : Calculer les scores avec optimisations
    // ========================================================================
    console.log('🧮 ÉTAPE 3 : Calcul des scores avec cohorte de référence\n');

    const scores = scoreScpiBatch(scpiInputs, defaultParams, true);
    console.log(`✅ ${scores.length} scores calculés\n`);

    // Afficher quelques statistiques
    const avgScore = scores.reduce((sum, s) => sum + s.score_total, 0) / scores.length;
    const maxScore = Math.max(...scores.map(s => s.score_total));
    const minScore = Math.min(...scores.map(s => s.score_total));

    console.log('📊 Statistiques des scores:');
    console.log(`   Score moyen:  ${avgScore.toFixed(2)}/100`);
    console.log(`   Score max:    ${maxScore.toFixed(2)}/100`);
    console.log(`   Score min:    ${minScore.toFixed(2)}/100\n`);

    // Top 5
    const top5 = [...scores]
      .sort((a, b) => b.score_total - a.score_total)
      .slice(0, 5);

    console.log('🏆 TOP 5 des SCPI:');
    top5.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.nom.padEnd(25)} ${s.score_total.toFixed(2)}/100`);
    });
    console.log('');

    // ========================================================================
    // ÉTAPE 4 : Mettre à jour la table scores_scpi
    // ========================================================================
    console.log('💾 ÉTAPE 4 : Mise à jour de la base de données\n');

    let successCount = 0;
    let errorCount = 0;

    for (const score of scores) {
      // Vérifier si un score existe déjà pour cette SCPI
      const { data: existing } = await supabase
        .from('scores_scpi')
        .select('id')
        .eq('scpi_id', score.id)
        .maybeSingle();

      const scoreData = {
        scpi_id: score.id,
        nom: score.nom,
        societe_gestion: score.societe_gestion,
        score_rendement: score.score_rendement,
        score_secteur: score.score_secteur,
        score_geo: score.score_geo,
        score_qualite: score.score_qualite,
        score_taille: score.score_taille,
        score_total: score.score_total,
        audit_trail: score.audit_trail,
        params_version: 'v1.1-optimized', // Version avec optimisations
      };

      if (existing) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('scores_scpi')
          .update(scoreData)
          .eq('id', existing.id);

        if (updateError) {
          console.error(`❌ Erreur MAJ ${score.nom}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        // Insertion
        const { error: insertError } = await supabase
          .from('scores_scpi')
          .insert(scoreData);

        if (insertError) {
          console.error(`❌ Erreur INSERT ${score.nom}:`, insertError.message);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    console.log(`✅ ${successCount} scores mis à jour avec succès`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} erreurs rencontrées\n`);
    } else {
      console.log('');
    }

    // ========================================================================
    // ÉTAPE 5 : Vérification
    // ========================================================================
    console.log('🔍 ÉTAPE 5 : Vérification des scores en base\n');

    const { data: verifyData, count } = await supabase
      .from('scores_scpi')
      .select('*', { count: 'exact' })
      .order('score_total', { ascending: false })
      .limit(10);

    console.log(`✅ ${count} scores présents dans la table scores_scpi\n`);

    if (verifyData && verifyData.length > 0) {
      console.log('🏆 TOP 10 vérifiés en base:');
      verifyData.forEach((s, i) => {
        console.log(`   ${String(i + 1).padStart(2)}. ${s.nom.padEnd(25)} ${s.score_total}/100`);
      });
      console.log('');
    }

    // Vérifier Comète spécifiquement
    const { data: cometeScore } = await supabase
      .from('scores_scpi')
      .select('*')
      .eq('nom', 'Comète')
      .maybeSingle();

    if (cometeScore) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔍 VÉRIFICATION SPÉCIALE : SCPI COMÈTE');
      console.log('═══════════════════════════════════════════════════════════════\n');
      console.log(`Score total:   ${cometeScore.score_total}/100`);
      console.log(`Rendement:     ${cometeScore.score_rendement}/40`);
      console.log(`Secteur:       ${cometeScore.score_secteur}/20`);
      console.log(`Géographie:    ${cometeScore.score_geo}/15`);
      console.log(`Qualité:       ${cometeScore.score_qualite}/15`);
      console.log(`Taille:        ${cometeScore.score_taille}/10`);
      console.log(`Version:       ${cometeScore.params_version}`);
      console.log('');

      if (cometeScore.score_total >= 78 && cometeScore.score_total <= 82) {
        console.log('✅ Score Comète dans la plage attendue (~80/100)');
      } else {
        console.log(`⚠️  Score Comète: ${cometeScore.score_total}/100 (attendu: ~80/100)`);
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ Mise à jour terminée avec succès!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    throw error;
  }
}

// Exécuter le script
updateAllScores()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script échoué:', error);
    process.exit(1);
  });
