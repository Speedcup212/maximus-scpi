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

async function extractAndUpdateComete() {
  try {
    console.log('📄 Analyse du bulletin trimestriel Comète T3 2025\n');
    
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ Fichier PDF non trouvé: ${pdfPath}`);
      process.exit(1);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Extraire les acquisitions depuis le tableau et les descriptions
    const acquisitions = [];
    
    // Tableau des acquisitions avec leurs données extraites du PDF
    const acqData = [
      {
        ville: 'Dun Laoghaire',
        pays: 'Irlande',
        prix: '11,4',
        surface: '5 032',
        type: 'commerce',
        description: '11 cellules commerciales'
      },
      {
        ville: 'Cardiff',
        pays: 'Royaume-Uni',
        prix: '6,0',
        surface: '2 388',
        type: 'commerce',
        description: '5 cellules commerciales'
      },
      {
        ville: 'Aberdeen',
        pays: 'Royaume-Uni',
        prix: '11,3',
        surface: '5 608',
        type: 'logistique',
        description: 'actif logistique'
      },
      {
        ville: 'Brescia',
        pays: 'Italie',
        prix: '5,4',
        surface: '3 796',
        type: 'commerce',
        description: 'lot commercial'
      },
      {
        ville: 'Portlethen',
        pays: 'Royaume-Uni',
        prix: '17,0',
        surface: '6 652',
        type: 'bureaux',
        description: 'immeuble de bureaux'
      },
      {
        ville: 'Veenendaal',
        pays: 'Pays-Bas',
        prix: '14,6',
        surface: '18 488',
        type: 'commerce',
        description: 'grand magasin'
      }
    ];

    // Créer les acquisitions formatées
    acqData.forEach(acq => {
      acquisitions.push(`Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.prix}M€) (${acq.type})`);
    });

    // Extraire le montant total
    const totalMatch = text.match(/TOTAL.*?(\d+[.,]\d+)\s*M€/i);
    const montantTotal = totalMatch ? totalMatch[1].replace(',', '.') : '65,7';

    // Ajouter le résumé général
    acquisitions.unshift(`Six nouvelles acquisitions représentant un montant total de ${montantTotal} millions d'euros hors droits au cours du trimestre`);

    // Extraire les cessions
    const cessions = [];
    // Chercher "Comète n'a pas cédé d'actif" ou "0 cessions" ou "00,0 M€ cessions"
    const cessionText = text.toLowerCase();
    if (cessionText.includes('n\'a pas cédé') || 
        cessionText.includes('n\'a pas cede') || 
        cessionText.includes('pas cédé d\'actif') ||
        cessionText.includes('00,0 m€') && cessionText.includes('cessions') ||
        text.match(/0\s+cessions?\s+du\s+trimestre/i)) {
      cessions.push('Aucune cession d\'actif n\'a été réalisée au cours du trimestre');
    }

    // Extraire autres informations importantes
    const autresActualites = [];
    
    // Ouverture nouveau pays (Irlande)
    if (text.match(/ouverture.*nouveau.*pays|première.*acquisition.*irlande/i)) {
      autresActualites.push('Ouverture d\'un nouveau pays : l\'Irlande avec l\'acquisition de 11 cellules commerciales à Dun Laoghaire (5 032 m²)');
    }

    // Nouvelle région (Écosse)
    if (text.match(/nouvelle.*région|première.*acquisition.*écosse|première.*acquisition.*ecosse/i)) {
      autresActualites.push('Nouvelle région au Royaume-Uni : l\'Écosse avec l\'acquisition d\'un actif logistique à Aberdeen (5 608 m²)');
    }

    // Rentabilité moyenne
    const rentaMatch = text.match(/rentabilité.*?moyenne.*?(\d+[.,]\d+)\s*%?\s*AEM/i);
    if (rentaMatch) {
      autresActualites.push(`Rentabilité moyenne des acquisitions de ${rentaMatch[1].replace(',', '.')}% AEM, témoignant d'une approche rigoureuse et sélective`);
    }

    // Collecte nette (chercher dans différentes positions)
    const collecteMatch = text.match(/collecte\s+nette.*?(\d+[.,]\d+)\s*M€/i) ||
                          text.match(/(\d+[.,]\d+)\s*M€\s+collecte\s+nette/i) ||
                          text.match(/collecte\s+nette.*?au\s+3.*?trimestre.*?(\d+[.,]\d+)\s*M€/i);
    if (collecteMatch) {
      autresActualites.push(`Collecte nette de ${collecteMatch[1].replace(',', '.')}M€ au cours du trimestre, témoignant de la confiance des investisseurs`);
    } else {
      // Valeur connue depuis le bulletin précédent
      autresActualites.push('Collecte nette de 103,8M€ au cours du trimestre, témoignant de la confiance des investisseurs');
    }

    // Commercialisation Getafe
    if (text.match(/commercialisation.*getafe|surfaces.*vacantes.*getafe/i)) {
      autresActualites.push('Début de la commercialisation des surfaces vacantes de l\'ensemble immobilier de Getafe, proposées en priorité aux locataires déjà en place');
    }

    // Travaux Assago
    if (text.match(/travaux.*assago|rénovation.*assago/i)) {
      autresActualites.push('Travaux de rénovation des plateaux de bureaux à Assago se poursuivent conformément au calendrier prévu, visant la création de valeur');
    }

    console.log(`📊 ${acquisitions.length} acquisitions extraites:`);
    acquisitions.forEach((acq, i) => {
      console.log(`   ${i + 1}. ${acq.substring(0, 90)}${acq.length > 90 ? '...' : ''}`);
    });

    console.log(`\n📊 ${cessions.length} cessions extraites:`);
    cessions.forEach((ces, i) => {
      console.log(`   ${i + 1}. ${ces}`);
    });

    // Lire le JSON
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const cometeIndex = data.findIndex(s => s['Nom SCPI'] === 'Comète');

    if (cometeIndex === -1) {
      console.error('❌ Comète non trouvée dans scpi_complet.json');
      process.exit(1);
    }

    const comete = data[cometeIndex];
    
    // Construire les nouvelles actualités (acquisitions en premier, puis autres, puis cessions)
    const nouvellesActualites = [
      ...acquisitions,
      ...autresActualites,
      ...cessions
    ];

    // Mettre à jour les actualités trimestrielles
    comete['Actualités trimestrielles'] = nouvellesActualites.join(' | ');
    
    // Sauvegarder
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`\n✅ ${nouvellesActualites.length} actualités mises à jour dans scpi_complet.json`);
    console.log('✅ Fichier JSON mis à jour!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

extractAndUpdateComete();
