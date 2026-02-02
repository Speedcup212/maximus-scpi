/**
 * Script pour extraire toutes les actualités depuis un bulletin trimestriel PDF
 * 
 * Usage: npx tsx scripts/extractActualitesFromBulletin.ts <fichier.pdf> <nom-scpi>
 */

import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';

interface Actualite {
  titre: string;
  description: string;
}

/**
 * Extrait toutes les actualités depuis le texte du bulletin
 */
function extractActualites(text: string, scpiName: string): Actualite[] {
  const actualites: Actualite[] = [];
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // 1. Acquisitions du trimestre
  const acquisitionsMatch = text.match(/(\d+)\s+(\d+(?:[.,]\d+)?)\s*M€\s+acquisitions?\s+(?:du\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre/i);
  if (acquisitionsMatch) {
    const nbAcquisitions = acquisitionsMatch[1];
    const montant = acquisitionsMatch[2];
    actualites.push({
      titre: `${nbAcquisitions} nouvelles acquisitions`,
      description: `${nbAcquisitions} acquisitions représentant un montant total de ${montant}M€ hors droits au cours du trimestre.`
    });
  }

  // 2. Ouverture de nouveaux pays/régions
  if (text.match(/ouverture.*nouveau.*pays/i) || text.match(/première.*acquisition.*irlande/i)) {
    const paysMatch = text.match(/première.*acquisition.*(?:en|à)\s+([A-Z][a-z]+)/i);
    if (paysMatch) {
      actualites.push({
        titre: `Ouverture d'un nouveau pays : ${paysMatch[1]}`,
        description: `Première acquisition de ${scpiName} en ${paysMatch[1]}, marquant l'ouverture d'un nouveau pays.`
      });
    }
  }

  // 3. Nouvelles régions
  if (text.match(/nouvelle.*région/i) || text.match(/première.*acquisition.*écosse/i)) {
    const regionMatch = text.match(/première.*acquisition.*(?:en|à)\s+([A-Z][a-z]+)/i);
    if (regionMatch) {
      actualites.push({
        titre: `Nouvelle région : ${regionMatch[1]}`,
        description: `Première acquisition dans la région ${regionMatch[1]}, élargissant la couverture géographique.`
      });
    }
  }

  // 4. Commercialisation de surfaces vacantes
  if (text.match(/commercialisation.*surfaces?\s+vacantes/i) || text.match(/commercialisation.*lots?\s+vacants?/i)) {
    const surfaceMatch = text.match(/(\d+(?:\s+\d+)?)\s*m2.*vacantes?/i);
    actualites.push({
      titre: "Commercialisation de surfaces vacantes",
      description: surfaceMatch 
        ? `Début de la commercialisation des surfaces vacantes (${surfaceMatch[1]} m²) proposées en priorité aux locataires déjà en place.`
        : "Début de la commercialisation des surfaces vacantes proposées en priorité aux locataires déjà en place."
    });
  }

  // 5. Travaux de rénovation
  if (text.match(/travaux.*rénovation/i) || text.match(/travaux.*rafraîchissement/i)) {
    const travauxMatch = text.match(/travaux.*(?:de|des)\s+(?:rénovation|rafraîchissement).*?(?:à|sur)\s+([A-Z][a-z]+)/i);
    actualites.push({
      titre: "Travaux de rénovation en cours",
      description: travauxMatch
        ? `Travaux de rénovation des plateaux de bureaux à ${travauxMatch[1]} se poursuivent conformément au calendrier prévu, visant la création de valeur pour la SCPI.`
        : "Travaux de rénovation en cours conformément au calendrier prévu, visant la création de valeur pour la SCPI."
    });
  }

  // 6. Détails des acquisitions spécifiques
  const acquisitionsDetails = [
    { pattern: /dun\s+laoghaire.*irlande/i, ville: "Dun Laoghaire", pays: "Irlande", type: "Commerce" },
    { pattern: /cardiff.*royaume-uni/i, ville: "Cardiff", pays: "Royaume-Uni", type: "Commerce" },
    { pattern: /aberdeen.*royaume-uni/i, ville: "Aberdeen", pays: "Royaume-Uni", type: "Logistique" },
    { pattern: /brescia.*italie/i, ville: "Brescia", pays: "Italie", type: "Commerce" },
    { pattern: /portlethen.*royaume-uni/i, ville: "Portlethen", pays: "Royaume-Uni", type: "Bureau" },
    { pattern: /veenendaal.*pays-bas/i, ville: "Veenendaal", pays: "Pays-Bas", type: "Commerce" },
  ];

  for (const acq of acquisitionsDetails) {
    if (text.match(acq.pattern)) {
      const surfaceMatch = text.match(new RegExp(`${acq.ville}.*?(\\d+(?:\\s+\\d+)?)\\s*m2`, 'i'));
      const prixMatch = text.match(new RegExp(`${acq.ville}.*?(\\d+(?:[.,]\\d+)?)\\s*M€`, 'i'));
      
      actualites.push({
        titre: `Acquisition à ${acq.ville} (${acq.pays})`,
        description: `Acquisition d'un actif ${acq.type.toLowerCase()} à ${acq.ville}${surfaceMatch ? ` de ${surfaceMatch[1]} m²` : ''}${prixMatch ? ` pour ${prixMatch[1]}M€` : ''}.`
      });
    }
  }

  // 7. Collecte nette
  const collecteMatch = text.match(/(\d+(?:[.,]\d+)?)\s*M€\s+collecte\s+nette/i);
  if (collecteMatch) {
    actualites.push({
      titre: "Collecte nette du trimestre",
      description: `Collecte nette de ${collecteMatch[1]}M€ au cours du trimestre, témoignant de la confiance des investisseurs.`
    });
  }

  // 8. Cessions
  const cessionsMatch = text.match(/(\d+)\s+cessions?\s+(?:du\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre/i);
  if (cessionsMatch && cessionsMatch[1] === '0') {
    actualites.push({
      titre: "Aucune cession au trimestre",
      description: "Aucune cession d'actif n'a été réalisée au cours du trimestre, confirmant la stratégie de détention long terme."
    });
  }

  // 9. Mot de la société de gestion - extraire les points clés
  const motGestionMatch = text.match(/mot\s+de\s+la\s+société\s+de\s+gestion[\s\S]{0,2000}/i);
  if (motGestionMatch) {
    const motGestion = motGestionMatch[0];
    
    // Extraire les phrases importantes
    const phrases = motGestion.split(/[.!?]\s+/).filter(p => 
      p.length > 50 && (
        p.toLowerCase().includes('acquisition') ||
        p.toLowerCase().includes('stratégie') ||
        p.toLowerCase().includes('diversification') ||
        p.toLowerCase().includes('rentabilité') ||
        p.toLowerCase().includes('qualité')
      )
    );

    if (phrases.length > 0) {
      actualites.push({
        titre: "Point de vue de la société de gestion",
        description: phrases[0].substring(0, 300) + (phrases[0].length > 300 ? '...' : '')
      });
    }
  }

  return actualites;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/extractActualitesFromBulletin.ts <fichier.pdf> <nom-scpi>');
    process.exit(1);
  }

  const pdfPath = args[0];
  const scpiName = args[1];

  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    const actualites = extractActualites(text, scpiName);

    console.log(JSON.stringify({
      scpi: scpiName,
      periode: "T3 2025",
      actualites: actualites,
      nombre_actualites: actualites.length
    }, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
