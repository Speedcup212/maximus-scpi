/**
 * Script pour mettre à jour les données SCPI depuis un bulletin trimestriel
 * Usage: node scripts/updateScpiFromBulletin.cjs <fichier.pdf> <nom-scpi>
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Fonction pour extraire l'endettement depuis le texte
function extractEndettement(text) {
  // Patterns pour trouver l'endettement
  const patterns = [
    /endettement\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/i,
    /(\d+(?:[.,]\d+)?)\s*%\s*endettement/i,
    /endettement\s*\([^)]*\)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value)) {
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

// Fonction pour extraire la collecte nette
function extractCollecteNette(text) {
  const patterns = [
    /collecte\s+nette\s+(?:au\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*M€/i,
    /(\d+(?:[.,]\d+)?)\s*M€\s+collecte\s+nette/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numValue = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(numValue)) {
        return { value: numValue * 1000000, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

// Fonction pour extraire le nombre de cessions
function extractNbCessions(text) {
  const patterns = [
    /(\d+)\s+cessions?\s+(?:du\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre/i,
    /cessions?\s*[:=]\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!isNaN(value)) {
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

// Fonction pour extraire le nombre de locataires
function extractNombreLocataires(text) {
  const patterns = [
    /nombre\s+de\s+locataires\s*[:=]\s*(\d+)/i,
    /(\d+)\s+locataires/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!isNaN(value)) {
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

// Fonction pour extraire WALT
function extractWALT(text) {
  const patterns = [
    /WALT\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*(?:ans|années)/i,
    /WALT\s+(\d+(?:[.,]\d+)?)\s*(?:ans|années)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value)) {
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

// Fonction pour extraire WALB
function extractWALB(text) {
  const patterns = [
    /WALB\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*(?:ans|années)/i,
    /WALB\s+(\d+(?:[.,]\d+)?)\s*(?:ans|années)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value)) {
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

async function updateScpiFromBulletin(pdfPath, scpiName) {
  try {
    // Lire le PDF
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      console.error('❌ pdf-parse n\'est pas installé. Installez-le avec: npm install pdf-parse');
      process.exit(1);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Lire le JSON
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

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

    // Extraire les données
    const endettement = extractEndettement(text);
    const collecteNette = extractCollecteNette(text);
    const nbCessions = extractNbCessions(text);
    const nombreLocataires = extractNombreLocataires(text);
    const walt = extractWALT(text);
    const walb = extractWALB(text);

    // Mettre à jour les données
    let updated = false;

    if (endettement.value !== null) {
      const ancien = scpi['Endettement (%)'];
      scpi['Endettement (%)'] = endettement.value;
      console.log(`✅ Endettement: ${ancien}% → ${endettement.value}%`);
      updated = true;
    } else {
      console.log('⚠️  Endettement: Non trouvé dans le bulletin');
    }

    if (collecteNette.value !== null) {
      scpi['Collecte nette trimestre'] = collecteNette.value;
      console.log(`✅ Collecte nette trimestre: ${(collecteNette.value / 1000000).toFixed(1)}M€`);
      updated = true;
    } else {
      scpi['Collecte nette trimestre'] = null;
      console.log('⚠️  Collecte nette trimestre: Non trouvée → N/A');
    }

    if (nbCessions.value !== null) {
      scpi['Nombre de cessions trimestre'] = nbCessions.value;
      console.log(`✅ Nombre de cessions trimestre: ${nbCessions.value}`);
      updated = true;
    } else {
      scpi['Nombre de cessions trimestre'] = null;
      console.log('⚠️  Nombre de cessions trimestre: Non trouvé → N/A');
    }

    if (nombreLocataires.value !== null) {
      scpi['Nombre de locataires'] = nombreLocataires.value;
      console.log(`✅ Nombre de locataires: ${nombreLocataires.value}`);
      updated = true;
    } else {
      console.log('⚠️  Nombre de locataires: Non trouvé');
    }

    if (walt.value !== null) {
      scpi['WALT'] = walt.value;
      console.log(`✅ WALT: ${walt.value} ans`);
      updated = true;
    } else {
      console.log('⚠️  WALT: Non trouvé');
    }

    if (walb.value !== null) {
      scpi['WALB'] = walb.value;
      console.log(`✅ WALB: ${walb.value} ans`);
      updated = true;
    } else {
      console.log('⚠️  WALB: Non trouvé');
    }

    if (updated) {
      // Sauvegarder
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log('\n✅ Fichier JSON mis à jour avec succès!');
    } else {
      console.log('\n⚠️  Aucune donnée trouvée dans le bulletin');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/updateScpiFromBulletin.cjs <fichier.pdf> <nom-scpi>');
  console.log('Exemple: node scripts/updateScpiFromBulletin.cjs BTI-T3-2025-Comete-1.pdf "Comète"');
  process.exit(1);
}

updateScpiFromBulletin(args[0], args[1]);
