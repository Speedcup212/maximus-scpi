const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Charger les données JSON
const data = JSON.parse(fs.readFileSync('src/data/SCPI_complet_avec_SFDR_Profil.json', 'utf8'));

// Parser avancé universel pour toutes les répartitions
function parseAdvancedDistribution(input) {
  if (!input || input === 'null' || input.trim() === '') return null;

  const result = {};

  // Cas 1: Format JSON avec valeurs dans les clés (ex: {"Allemagne : 71": null, "6 %": null})
  if (input.startsWith('{')) {
    try {
      const obj = JSON.parse(input);
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Pattern: "Name : 71" suivi de "6 %" = 71.6%
        const match = key.match(/^(.+?)\s*[:：]\s*([0-9,\.]+)/);
        if (match) {
          const name = match[1].trim();
          const valueStr = match[2].replace(',', '.');

          if (i + 1 < keys.length) {
            const nextKey = keys[i + 1];
            if (nextKey.includes('%')) {
              const percentMatch = nextKey.match(/([0-9,\.]+)/);
              if (percentMatch) {
                const decimal = percentMatch[1].replace(',', '.');
                const fullValue = parseFloat(valueStr + '.' + decimal);
                if (!isNaN(fullValue)) {
                  result[name] = fullValue;
                  i++;
                  continue;
                }
              }
            }
          }

          const value = parseFloat(valueStr);
          if (!isNaN(value)) {
            result[name] = value;
          }
        }
        // Pattern: "Régions (38" suivi de "4%)"
        else if (key.match(/\(/)) {
          const nameMatch = key.match(/^(.+?)\s*\(([0-9,\.]+)/);
          if (nameMatch && i + 1 < keys.length) {
            const name = nameMatch[1].trim();
            const firstPart = nameMatch[2].replace(',', '.');
            const nextKey = keys[i + 1];
            const secondMatch = nextKey.match(/([0-9,\.]+)/);

            if (secondMatch) {
              const fullValue = parseFloat(firstPart + '.' + secondMatch[1].replace(',', '.'));
              if (!isNaN(fullValue)) {
                result[name] = fullValue;
                i++;
                continue;
              }
            }
          }
        }
      }

      if (Object.keys(result).length > 0) return result;

      // Parsing normal si valeurs correctes
      const hasValidValues = Object.values(obj).some(v => v !== null && !isNaN(parseFloat(v)));
      if (hasValidValues) {
        Object.entries(obj).forEach(([k, v]) => {
          if (v !== null) result[k] = parseFloat(v);
        });
        return Object.keys(result).length > 0 ? result : null;
      }
    } catch (e) {
      // Continue to text parsing
    }
  }

  // Cas 2: Format texte standard "Name (XX%)" ou "Name : XX %"
  const regex1 = /([^(]+)\s*\(([0-9,\.]+)%\)/g;
  const regex2 = /([^:：]+)\s*[:：]\s*([0-9,\.]+)\s*%/g;

  let match;
  while ((match = regex1.exec(input)) !== null) {
    const key = match[1].trim().replace(/^[,\s]+/, '').replace(/[,\s]+$/, '');
    const value = parseFloat(match[2].replace(',', '.'));
    if (!isNaN(value) && key) {
      result[key] = value;
    }
  }

  if (Object.keys(result).length === 0) {
    while ((match = regex2.exec(input)) !== null) {
      const key = match[1].trim();
      const value = parseFloat(match[2].replace(',', '.'));
      if (!isNaN(value) && key) {
        result[key] = value;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// Fonction pour nettoyer les valeurs numériques
function cleanNumericValue(value) {
  if (value === null || value === undefined || value === '' || value === 'NC' || value === 'N/A') {
    return null;
  }

  // Si c'est déjà un nombre, le retourner
  if (typeof value === 'number') return value;

  // Si c'est une chaîne, essayer de la convertir
  if (typeof value === 'string') {
    // Enlever les espaces et caractères non numériques sauf point et virgule
    const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

async function importData() {
  console.log('🚀 Début de l\'import des données SCPI...\n');

  // Préparer les données
  const scpiData = data.Sheet1.map(scpi => {
    const sectorText = scpi['Répartition Sectorielle'];
    const geoText = scpi['Répartition Géographique'];

    // Utiliser le parser avancé pour les deux types de répartitions
    const sectorObj = parseAdvancedDistribution(sectorText);
    const geoObj = parseAdvancedDistribution(geoText);

    return {
      nom: scpi['Nom SCPI'],
      societe_gestion: scpi['Société de gestion'],
      annee_creation: cleanNumericValue(scpi['Année de création']),
      label_isr: scpi['Label ISR'],
      sfdr: scpi['SFDR'],
      profil_cible: scpi['Profil cible'],
      capitalisation: cleanNumericValue(scpi['Capitalisation (M€)']),
      prix_souscription: cleanNumericValue(scpi['Prix de souscription (€)']),
      valeur_retrait: cleanNumericValue(scpi['Valeur de retrait (€)']),
      valeur_reconstitution: cleanNumericValue(scpi['Valeur de reconstitution (€)']),
      valeur_realisation: cleanNumericValue(scpi['Valeur de réalisation (€)']),
      surcote_decote: cleanNumericValue(scpi['Surcote/décote (%)']),
      minimum_souscription: cleanNumericValue(scpi['Minimum de souscription €']),
      rendement: cleanNumericValue(scpi['Taux de distribution (%)']),
      distribution: cleanNumericValue(scpi['Distribution (€/part)']),
      nb_immeubles: cleanNumericValue(scpi['Nombre d\'immeubles']),
      endettement: cleanNumericValue(scpi['Endettement (%)']),
      tof: cleanNumericValue(scpi['TOF (%)']),
      delai_jouissance: cleanNumericValue(scpi['Délai de jouissance (mois)']),
      duree_detention_recommandee: cleanNumericValue(scpi['Durée de détention recommandée (ans)']),
      versement_loyers: scpi['Versement des loyers'],
      frais_souscription: cleanNumericValue(scpi['Frais de souscription (HT/%)']),
      frais_gestion: cleanNumericValue(scpi['Frais de gestion (HT/%)']),
      repartition_sectorielle: sectorObj,
      repartition_geographique: geoObj
    };
  });

  console.log(`📊 ${scpiData.length} SCPI à importer`);

  // Insérer par batch de 10
  const batchSize = 10;
  let imported = 0;
  let withSector = 0;
  let withGeo = 0;
  let withBoth = 0;

  for (let i = 0; i < scpiData.length; i += batchSize) {
    const batch = scpiData.slice(i, i + batchSize);

    const { data: result, error } = await supabase
      .from('scpi')
      .insert(batch);

    if (error) {
      console.error(`❌ Erreur batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      imported += batch.length;

      // Compter les répartitions
      batch.forEach(scpi => {
        if (scpi.repartition_sectorielle) withSector++;
        if (scpi.repartition_geographique) withGeo++;
        if (scpi.repartition_sectorielle && scpi.repartition_geographique) withBoth++;
      });

      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} SCPI importées`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSULTAT DE L\'IMPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total importées            : ${imported} / ${scpiData.length}`);
  console.log(`Avec répartition sectorielle : ${withSector} (${Math.round(withSector * 100 / imported)}%)`);
  console.log(`Avec répartition géographique : ${withGeo} (${Math.round(withGeo * 100 / imported)}%)`);
  console.log(`Avec les DEUX répartitions   : ${withBoth} (${Math.round(withBoth * 100 / imported)}%)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Vérification finale
  const { count, error: countError } = await supabase
    .from('scpi')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Erreur de vérification:', countError.message);
  } else {
    console.log(`✅ Vérification: ${count} SCPI en base de données\n`);
  }
}

importData().catch(console.error);
