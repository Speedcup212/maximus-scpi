const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SCPI déjà créées manuellement
const existingScpi = ['comete', 'transitions-europe', 'remake-live', 'epargne-pierre-europe', 'optimale', 'iroko-zen', 'novaxia-neo'];

// Fonction pour normaliser les noms en slug
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Fonction pour générer les avantages basés sur les données
function generateAvantages(scpi) {
  const avantages = [];

  if (parseFloat(scpi.rendement) >= 5) {
    avantages.push(`Rendement attractif de ${scpi.rendement}%`);
  }

  if (parseFloat(scpi.tof) >= 95) {
    avantages.push(`Taux d'occupation élevé de ${scpi.tof}%`);
  }

  if (scpi.label_isr === 'Oui') {
    avantages.push('Label ISR - Investissement responsable');
  }

  if (parseFloat(scpi.frais_souscription) === 0) {
    avantages.push('0% de frais de souscription');
  }

  if (parseFloat(scpi.endettement) < 10) {
    avantages.push(`Endettement faible de ${scpi.endettement}%`);
  }

  // Ajouter un avantage sur la société de gestion
  avantages.push(`Gérée par ${scpi.societe_gestion}`);

  return avantages.slice(0, 4); // Maximum 4 avantages
}

// Fonction pour générer les points d'attention
function generatePointsAttention(scpi) {
  const points = [];

  if (parseFloat(scpi.surcote_decote) < -5) {
    points.push(`Décote importante de ${scpi.surcote_decote}%`);
  }

  if (parseFloat(scpi.endettement) > 25) {
    points.push(`Endettement élevé de ${scpi.endettement}%`);
  }

  if (parseFloat(scpi.frais_souscription) >= 10) {
    points.push(`Frais de souscription de ${scpi.frais_souscription}%`);
  }

  const currentYear = new Date().getFullYear();
  if (currentYear - scpi.annee_creation < 3) {
    points.push(`SCPI récente créée en ${scpi.annee_creation}`);
  }

  return points;
}

// Fonction pour générer le profil investisseur
function generateProfilInvestisseur(scpi) {
  const rendement = parseFloat(scpi.rendement);
  const endettement = parseFloat(scpi.endettement);

  if (rendement >= 6 && endettement < 15) {
    return "Investisseurs recherchant un rendement élevé avec une gestion prudente. Convient aux profils équilibrés à dynamiques avec un horizon 8-10 ans.";
  } else if (rendement >= 5 && rendement < 6) {
    return "Investisseurs recherchant un bon équilibre entre rendement et sécurité. Convient aux profils équilibrés avec un horizon 8-10 ans.";
  } else if (endettement < 10) {
    return "Investisseurs prudents privilégiant la sécurité. Convient aux profils prudents à équilibrés avec un horizon 8-10 ans.";
  } else {
    return "Investisseurs avertis acceptant un niveau de risque modéré pour un rendement attractif. Horizon recommandé 8-10 ans.";
  }
}

async function generateLandingPages() {
  console.log('🚀 Génération des landing pages SCPI...\n');

  // Récupérer toutes les SCPI
  const { data: scpiList, error } = await supabase
    .from('scpi')
    .select('*')
    .order('nom');

  if (error) {
    console.error('❌ Erreur lors de la récupération des SCPI:', error);
    process.exit(1);
  }

  console.log(`📊 ${scpiList.length} SCPI trouvées dans la base de données\n`);

  // Lire le fichier existant
  const landingPagesPath = path.join(__dirname, '../src/data/landingPagesData.ts');
  let fileContent = fs.readFileSync(landingPagesPath, 'utf8');

  // Trouver où insérer les nouvelles SCPI (avant le dernier })
  const lastBraceIndex = fileContent.lastIndexOf('};');
  const beforeLastBrace = fileContent.substring(0, lastBraceIndex);
  const afterLastBrace = fileContent.substring(lastBraceIndex);

  let newEntries = '';
  let count = 0;

  for (const scpi of scpiList) {
    const slug = slugify(scpi.nom);

    // Ignorer les SCPI déjà créées
    if (existingScpi.includes(slug)) {
      console.log(`⏭️  ${scpi.nom} - déjà créée`);
      continue;
    }

    // Vérifier qu'on a les données de répartition
    if (!scpi.repartition_sectorielle || !scpi.repartition_geographique) {
      console.log(`⚠️  ${scpi.nom} - pas de données de répartition`);
      continue;
    }

    const avantages = generateAvantages(scpi);
    const pointsAttention = generatePointsAttention(scpi);
    const profilInvestisseur = generateProfilInvestisseur(scpi);

    // Préparer les données de géographie et secteurs
    const geoData = JSON.stringify(scpi.repartition_geographique, null, 4).replace(/"/g, '"');
    const secteurData = JSON.stringify(scpi.repartition_sectorielle, null, 4).replace(/"/g, '"');

    const entry = `,
  '${slug}': {
    nom: "${scpi.nom}",
    slug: "${slug}",
    societe_gestion: "${scpi.societe_gestion}",
    annee_creation: ${scpi.annee_creation},
    label_isr: ${scpi.label_isr === 'Oui'},
    capitalisation: "${scpi.capitalisation} M€",
    prix_souscription: "${scpi.prix_souscription} €",
    rendement: "${scpi.rendement}%",
    tof: "${scpi.tof}%",
    decote: "${scpi.surcote_decote}%",
    endettement: "${scpi.endettement}%",
    frais_souscription: "${scpi.frais_souscription}%",
    geographie: ${geoData},
    secteurs: ${secteurData},
    avantages: ${JSON.stringify(avantages, null, 6)},
    description_courte: "SCPI ${scpi.nom} gérée par ${scpi.societe_gestion} offrant ${scpi.rendement}% de rendement avec un taux d'occupation de ${scpi.tof}%.",
    description_longue: "${scpi.nom}, créée en ${scpi.annee_creation} par ${scpi.societe_gestion}, se distingue par son rendement de ${scpi.rendement}% et un taux d'occupation de ${scpi.tof}%. Avec une capitalisation de ${scpi.capitalisation} M€, elle offre une solution d'investissement immobilier ${scpi.label_isr === 'Oui' ? 'labellisée ISR' : ''} adaptée aux investisseurs recherchant des revenus réguliers.",
    pourquoi_investir: ${JSON.stringify([
      `Rendement attractif : ${scpi.rendement}% de taux de distribution`,
      `Taux d'occupation : ${scpi.tof}% des biens loués`,
      scpi.label_isr === 'Oui' ? 'Label ISR - Investissement responsable' : 'Gestion professionnelle',
      `Société de gestion reconnue : ${scpi.societe_gestion}`
    ], null, 6)},
    points_attention: ${JSON.stringify(pointsAttention.length > 0 ? pointsAttention : [
      'Liquidité limitée - Délai de retrait possible',
      'Frais de souscription à prendre en compte',
      'Risque de vacance locative',
      'Durée de placement recommandée : 8 à 10 ans minimum'
    ], null, 6)},
    profil_investisseur: "${profilInvestisseur}"
  }`;

    newEntries += entry;
    count++;
    console.log(`✅ ${scpi.nom} - créée`);
  }

  // Reconstruire le fichier
  const newFileContent = beforeLastBrace + newEntries + afterLastBrace;

  // Écrire le fichier
  fs.writeFileSync(landingPagesPath, newFileContent, 'utf8');

  console.log(`\n✅ ${count} nouvelles landing pages générées !`);
  console.log(`📝 Fichier mis à jour: ${landingPagesPath}`);
}

generateLandingPages().catch(console.error);
