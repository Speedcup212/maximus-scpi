const fs = require('fs');
const path = require('path');

const SCPI_DATA_PATH = path.join(__dirname, '../src/data/scpi_complet.json');
const BULLETINS_DIR = path.join(__dirname, '.');

// Mapping des noms de SCPI entre les bulletins et scpi_complet.json
const scpiNameMapping = {
  "Coeur d'Europe": "Coeur d'Europe",
  "Transitions Europe": "Transitions Europe",
  "PERIAL Opportunités Europe": "Perial Opportunités Europe",
  "Iroko Zen": "Iroko Zen",
  "Novaxia NEO": "Novaxia NEO",
  "Optimale": "Optimale",
  "Remake Live": "Remake Live",
  "Coeur de Région": "Coeur de Région",
  "Épargne Pierre Europe": "Épargne Pierre Europe",
  "Comète": "Comète"
};

// Fonction pour extraire les acquisitions et cessions depuis les actualités
function extractAcquisitionsAndCessions(actualites) {
  const acquisitions = [];
  const cessions = [];
  
  actualites.forEach(actu => {
    // Acquisitions
    if (actu.includes('acquisition') || actu.includes('Acquisition')) {
      acquisitions.push(actu);
    }
    // Cessions
    if (actu.includes('cession') || actu.includes('Cession')) {
      cessions.push(actu);
    }
  });
  
  return { acquisitions, cessions };
}

// Fonction pour formater les acquisitions et cessions
function formatAcquisitionsCessions(acquisitions, cessions) {
  const formatted = [];
  
  // Ajouter les acquisitions
  acquisitions.forEach(acq => {
    formatted.push(acq);
  });
  
  // Ajouter les cessions
  cessions.forEach(ces => {
    formatted.push(ces);
  });
  
  return formatted;
}

// Charger les données SCPI
const scpiData = JSON.parse(fs.readFileSync(SCPI_DATA_PATH, 'utf8'));

// Traiter chaque bulletin
const bulletins = [
  'bulletin_coeur_deurope_t3_2025.json',
  'bulletin_transitions_europe_t3_2025.json',
  'bulletin_perial_opportunites_europe_t3_2025.json',
  'bulletin_iroko_zen_t3_2025.json',
  'bulletin_novaxia_neo_t3_2025.json',
  'bulletin_optimale_t3_2025.json',
  'bulletin_remake_live_t3_2025.json',
  'bulletin_coeur_de_regions_t3_2025.json',
  'bulletin_epargne_pierre_europe_t3_2025.json',
  'bulletin_comete_t3_2025.json'
];

let updatedCount = 0;

bulletins.forEach(bulletinFile => {
  const bulletinPath = path.join(BULLETINS_DIR, bulletinFile);
  
  if (!fs.existsSync(bulletinPath)) {
    console.log(`⚠️  Bulletin non trouvé: ${bulletinFile}`);
    return;
  }
  
  const bulletin = JSON.parse(fs.readFileSync(bulletinPath, 'utf8'));
  let scpiName = bulletin.nomScpi;
  
  // Utiliser le mapping si disponible
  if (scpiNameMapping[scpiName]) {
    scpiName = scpiNameMapping[scpiName];
  }
  
  console.log(`\n📋 Traitement de ${scpiName}...`);
  
  // Trouver la SCPI dans scpi_complet.json
  const scpiIndex = scpiData.findIndex(s => s['Nom SCPI'] === scpiName);
  
  if (scpiIndex === -1) {
    console.log(`❌ SCPI "${scpiName}" non trouvée dans scpi_complet.json`);
    return;
  }
  
  const scpi = scpiData[scpiIndex];
  
  // Extraire les acquisitions et cessions
  const { acquisitions, cessions } = extractAcquisitionsAndCessions(bulletin.actualitesTrimestrielles || []);
  
  console.log(`   Acquisitions trouvées: ${acquisitions.length}`);
  console.log(`   Cessions trouvées: ${cessions.length}`);
  
  // Obtenir les actualités actuelles
  let currentActualites = scpi['Actualités trimestrielles'] || '';
  const actualitesArray = currentActualites ? currentActualites.split(' | ') : [];
  
  // Filtrer les acquisitions et cessions existantes pour éviter les doublons
  const existingAcquisitions = actualitesArray.filter(a => 
    a.includes('acquisition') || a.includes('Acquisition')
  );
  const existingCessions = actualitesArray.filter(a => 
    a.includes('cession') || a.includes('Cession')
  );
  
  // Créer un Set pour éviter les doublons
  const seenAcquisitions = new Set(existingAcquisitions.map(a => a.toLowerCase().trim()));
  const seenCessions = new Set(existingCessions.map(a => a.toLowerCase().trim()));
  
  // Ajouter les nouvelles acquisitions et cessions
  const newActualites = [...actualitesArray];
  
  acquisitions.forEach(acq => {
    const normalized = acq.toLowerCase().trim();
    if (!seenAcquisitions.has(normalized)) {
      newActualites.push(acq);
      seenAcquisitions.add(normalized);
      console.log(`   ✅ Ajout acquisition: ${acq.substring(0, 60)}...`);
    }
  });
  
  cessions.forEach(ces => {
    const normalized = ces.toLowerCase().trim();
    if (!seenCessions.has(normalized)) {
      newActualites.push(ces);
      seenCessions.add(normalized);
      console.log(`   ✅ Ajout cession: ${ces.substring(0, 60)}...`);
    }
  });
  
  // Mettre à jour les actualités trimestrielles
  scpiData[scpiIndex]['Actualités trimestrielles'] = newActualites.join(' | ');
  
  updatedCount++;
  console.log(`   ✅ ${scpiName} mise à jour`);
});

// Sauvegarder les modifications
fs.writeFileSync(SCPI_DATA_PATH, JSON.stringify(scpiData, null, 2), 'utf8');

console.log(`\n✅ ${updatedCount} SCPI mises à jour avec succès !`);
