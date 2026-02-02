/**
 * Script pour mettre à jour automatiquement les données SCPI depuis un bulletin trimestriel
 * 
 * Ce script :
 * 1. Extrait les données depuis le PDF via extractScpiQuarterlyData.ts
 * 2. Met à jour le fichier JSON avec les nouvelles données
 * 3. Met à jour l'endettement si trouvé dans le bulletin
 * 
 * Usage: node scripts/updateScpiFromBulletinAuto.cjs <fichier.pdf> <nom-scpi>
 * Exemple: node scripts/updateScpiFromBulletinAuto.cjs "BTI-T3-2025-Comete-1.pdf" "Comète"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/updateScpiFromBulletinAuto.cjs <fichier.pdf> <nom-scpi>');
  console.log('Exemple: node scripts/updateScpiFromBulletinAuto.cjs "BTI-T3-2025-Comete-1.pdf" "Comète"');
  process.exit(1);
}

const pdfPath = path.resolve(args[0]);
const scpiName = args[1];
const jsonPath = path.join(__dirname, '../src/data/scpi_complet.json');

// Fonction pour extraire l'endettement depuis le texte du PDF
function extractEndettementFromText(text) {
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*%\s*endettement/i,
    /endettement\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*%/i,
    /endettement\s*\([^)]*\)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value)) {
        return value;
      }
    }
  }
  return null;
}

// Fonction pour extraire la collecte nette
function extractCollecteNetteFromText(text) {
  const patterns = [
    /collecte\s+nette\s+(?:au\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*M€/i,
    /(\d+(?:[.,]\d+)?)\s*M€\s+collecte\s+nette/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numValue = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(numValue)) {
        return numValue * 1000000; // Convertir M€ en €
      }
    }
  }
  return null;
}

// Fonction pour extraire le nombre de cessions
function extractNbCessionsFromText(text) {
  const patterns = [
    /(\d+)\s+cessions?\s+(?:du\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre/i,
    /cessions?\s*[:=]\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!isNaN(value)) {
        return value;
      }
    }
  }
  return null;
}

async function updateScpiFromBulletin() {
  try {
    // Lire le PDF
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      console.error('❌ pdf-parse n\'est pas installé. Installez-le avec: npm install pdf-parse');
      process.exit(1);
    }

    console.log(`📄 Lecture du PDF: ${pdfPath}\n`);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Extraire les données
    const endettement = extractEndettementFromText(text);
    const collecteNette = extractCollecteNetteFromText(text);
    const nbCessions = extractNbCessionsFromText(text);

    // Lire le JSON
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Trouver la SCPI
    const scpi = data.find(s => {
      const nom = s['Nom SCPI'];
      return nom && (nom === scpiName || nom.toLowerCase() === scpiName.toLowerCase());
    });

    if (!scpi) {
      console.error(`❌ SCPI "${scpiName}" non trouvée dans le fichier JSON`);
      process.exit(1);
    }

    console.log(`✅ SCPI trouvée: ${scpi['Nom SCPI']}\n`);

    let updated = false;

    // Mettre à jour l'endettement si trouvé
    if (endettement !== null) {
      const ancien = scpi['Endettement (%)'];
      scpi['Endettement (%)'] = endettement;
      console.log(`✅ Endettement: ${ancien}% → ${endettement}%`);
      updated = true;
    } else {
      console.log('⚠️  Endettement: Non trouvé dans le bulletin (conservation de la valeur existante)');
    }

    // Mettre à jour la collecte nette
    if (collecteNette !== null) {
      scpi['Collecte nette trimestre'] = collecteNette;
      console.log(`✅ Collecte nette trimestre: ${(collecteNette / 1000000).toFixed(1)}M€`);
      updated = true;
    } else {
      scpi['Collecte nette trimestre'] = null;
      console.log('⚠️  Collecte nette trimestre: Non trouvée → N/A');
    }

    // Mettre à jour le nombre de cessions
    if (nbCessions !== null) {
      scpi['Nombre de cessions trimestre'] = nbCessions;
      console.log(`✅ Nombre de cessions trimestre: ${nbCessions}`);
      updated = true;
    } else {
      scpi['Nombre de cessions trimestre'] = null;
      console.log('⚠️  Nombre de cessions trimestre: Non trouvé → N/A');
    }

    if (updated) {
      // Sauvegarder
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      console.log('\n✅ Fichier JSON mis à jour avec succès!');
    } else {
      console.log('\n⚠️  Aucune donnée trouvée dans le bulletin');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateScpiFromBulletin();
