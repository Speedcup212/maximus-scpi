const fs = require('fs');
const path = require('path');

// Vérifier si pdf-parse est installé
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.error('❌ pdf-parse n\'est pas installé. Installez-le avec: npm install pdf-parse');
  process.exit(1);
}

const pdfPath = 'c:/Users/ericb/Desktop/BTI-T3-2025-Comete.pdf';
const jsonPath = path.join(__dirname, '../src/data/scpi_complet.json');

async function extractAcquisitionsAndCessions() {
  try {
    console.log('📄 Lecture du PDF: BTI-T3-2025-Comete.pdf\n');
    
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ Fichier PDF non trouvé: ${pdfPath}`);
      process.exit(1);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Sauvegarder le texte pour analyse
    const textPath = path.join(__dirname, 'comete_t3_2025_text.txt');
    fs.writeFileSync(textPath, text, 'utf8');
    console.log('✅ Texte extrait et sauvegardé\n');

    // Extraire les acquisitions
    const acquisitions = [];
    const cessions = [];
    
    // Patterns pour les acquisitions
    const acqPatterns = [
      // Format: "Acquisition à [Ville] ([Pays]) : [description]"
      /acquisition\s+à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)\)\s*:\s*([^\n]+)/gi,
      // Format: "Nouvelle acquisition à [Ville] ([Pays]) : [description]"
      /nouvelle\s+acquisition\s+à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)\)\s*:\s*([^\n]+)/gi,
      // Format: "X acquisitions" avec détails
      /(\d+)\s+(?:nouvelles?\s+)?acquisitions?\s+(?:représentant|pour)\s+un\s+montant\s+(?:total\s+de\s+)?(\d+[.,]\d+)\s*(?:millions?\s+d'?euros?|M€)/gi,
      // Format: "Acquisition de [description] à [Ville]"
      /acquisition\s+de\s+([^\n]+?)\s+à\s+([A-Z][a-zàéèêëïîôùûüÿç]+)/gi,
    ];

    // Patterns pour les cessions
    const cesPatterns = [
      /(\d+)\s+cessions?/gi,
      /cession\s+(?:d'?un|de)\s+([^\n]+)/gi,
      /aucune\s+cession/gi,
    ];

    // Chercher les acquisitions
    acqPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2]) {
          // Format avec ville et pays
          const ville = match[1];
          const pays = match[2];
          const description = match[3] || '';
          acquisitions.push(`Acquisition à ${ville} (${pays}): ${description.trim()}`);
        } else if (match[1] && match[2] && !match[3]) {
          // Format avec nombre et montant
          const nb = match[1];
          const montant = match[2];
          acquisitions.push(`${nb} acquisitions pour ${montant} millions d'euros`);
        } else if (match[0]) {
          acquisitions.push(match[0]);
        }
      }
    });

    // Chercher les cessions
    cesPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0].toLowerCase().includes('aucune')) {
          cessions.push('Aucune cession au trimestre');
        } else if (match[1]) {
          cessions.push(match[0]);
        }
      }
    });

    // Dédupliquer
    const uniqueAcquisitions = [...new Set(acquisitions)];
    const uniqueCessions = [...new Set(cessions)];

    console.log(`📊 Acquisitions trouvées: ${uniqueAcquisitions.length}`);
    uniqueAcquisitions.forEach((acq, i) => {
      console.log(`   ${i + 1}. ${acq.substring(0, 100)}${acq.length > 100 ? '...' : ''}`);
    });

    console.log(`\n📊 Cessions trouvées: ${uniqueCessions.length}`);
    uniqueCessions.forEach((ces, i) => {
      console.log(`   ${i + 1}. ${ces.substring(0, 100)}${ces.length > 100 ? '...' : ''}`);
    });

    // Lire le JSON
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const cometeIndex = data.findIndex(s => s['Nom SCPI'] === 'Comète');

    if (cometeIndex === -1) {
      console.error('❌ Comète non trouvée dans scpi_complet.json');
      process.exit(1);
    }

    const comete = data[cometeIndex];
    
    // Obtenir les actualités actuelles
    let currentActualites = comete['Actualités trimestrielles'] || '';
    const actualitesArray = currentActualites ? currentActualites.split(' | ') : [];

    // Créer un Set pour éviter les doublons
    const seenActualites = new Set(actualitesArray.map(a => a.toLowerCase().trim()));

    // Ajouter les nouvelles acquisitions et cessions
    const newActualites = [...actualitesArray];
    let addedCount = 0;

    [...uniqueAcquisitions, ...uniqueCessions].forEach(actu => {
      const normalized = actu.toLowerCase().trim();
      if (!seenActualites.has(normalized)) {
        newActualites.push(actu);
        seenActualites.add(normalized);
        addedCount++;
      }
    });

    // Mettre à jour
    comete['Actualités trimestrielles'] = newActualites.join(' | ');
    
    // Sauvegarder
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`\n✅ ${addedCount} nouvelles actualités ajoutées (${newActualites.length} au total)`);
    console.log('✅ Fichier JSON mis à jour!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

extractAcquisitionsAndCessions();
