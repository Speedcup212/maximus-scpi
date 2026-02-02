/**
 * EXTRACTION SCPI (LOCATAIRES / WALT / WALB)
 * 
 * Agent d'extraction de données financières strict.
 * N'invente aucune donnée, n'estime aucune valeur manquante.
 * Si une information n'est pas explicitement écrite → null
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractionResult {
  scpi: string;
  periode: string;
  nombre_locataires: number | null;
  walt: number | null;
  walb: number | null;
  collecte_nette_trimestre: number | null; // en €
  nb_cessions_trimestre: number | null;
  endettement: number | null; // en %
  sources: {
    nombre_locataires: string | null;
    walt: string | null;
    walb: string | null;
    collecte_nette_trimestre: string | null;
    nb_cessions_trimestre: string | null;
    endettement: string | null;
  };
}

/**
 * Convertit les mois en années
 */
function convertMonthsToYears(months: number): number {
  return months / 12;
}

/**
 * Extrait un nombre entier depuis le texte
 */
function extractInteger(text: string, patterns: RegExp[]): { value: number | null; source: string | null } {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1].replace(/\s/g, ''), 10);
      if (!isNaN(value)) {
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

/**
 * Extrait WALT ou WALB (en années ou mois)
 */
function extractWaltOrWalb(text: string, term: 'WALT' | 'WALB'): { value: number | null; source: string | null } {
  // Patterns pour chercher explicitement WALT ou WALB
  const patterns = [
    // Format: "WALT: 6 ans" ou "WALT : 6 ans"
    new RegExp(`${term}\\s*[:=]\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:ans|années|année|year|years)`, 'i'),
    // Format: "WALT de 6 ans"
    new RegExp(`${term}\\s+de\\s+(\\d+(?:[.,]\\d+)?)\\s*(?:ans|années|année|year|years)`, 'i'),
    // Format: "WALT 6 ans"
    new RegExp(`${term}\\s+(\\d+(?:[.,]\\d+)?)\\s*(?:ans|années|année|year|years)`, 'i'),
    // Format: "WALT: 72 mois" ou "WALT : 72 mois"
    new RegExp(`${term}\\s*[:=]\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:mois|month|months)`, 'i'),
    // Format: "WALT de 72 mois"
    new RegExp(`${term}\\s+de\\s+(\\d+(?:[.,]\\d+)?)\\s*(?:mois|month|months)`, 'i'),
    // Format: "WALT 72 mois"
    new RegExp(`${term}\\s+(\\d+(?:[.,]\\d+)?)\\s*(?:mois|month|months)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numValue = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(numValue)) {
        // Si c'est en mois, convertir en années
        const isMonths = /mois|month/i.test(match[0]);
        const value = isMonths ? convertMonthsToYears(numValue) : numValue;
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

/**
 * Extrait le nombre de locataires
 */
function extractNombreLocataires(text: string): { value: number | null; source: string | null } {
  const patterns = [
    // "Nombre de locataires: 150" ou "Nombre de locataires : 150"
    /nombre\s+de\s+locataires\s*[:=]\s*(\d+)/i,
    // "Locataires: 150" ou "Locataires : 150"
    /locataires\s*[:=]\s*(\d+)/i,
    // "150 locataires"
    /(\d+)\s+locataires/i,
    // "Total locataires: 150"
    /total\s+locataires\s*[:=]\s*(\d+)/i,
  ];

  return extractInteger(text, patterns);
}

/**
 * Extrait la collecte nette du trimestre (en €)
 */
function extractCollecteNetteTrimestre(text: string): { value: number | null; source: string | null } {
  const patterns = [
    // "103,8M€ collecte nette au 3ème trimestre"
    /collecte\s+nette\s+(?:au\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*M€/i,
    // "Collecte nette: 103,8M€"
    /collecte\s+nette\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*M€/i,
    // "103,8M€ collecte nette"
    /(\d+(?:[.,]\d+)?)\s*M€\s+collecte\s+nette/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numValue = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(numValue)) {
        // Convertir M€ en €
        const value = numValue * 1000000;
        return { value, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

/**
 * Extrait le nombre de cessions du trimestre
 */
function extractNbCessionsTrimestre(text: string): { value: number | null; source: string | null } {
  const patterns = [
    // "0 cessions du trimestre"
    /(\d+)\s+cessions?\s+(?:du\s+)?(?:[0-9]+(?:ème|er)?\s+)?trimestre/i,
    // "Cessions: 0" ou "Cessions : 0"
    /cessions?\s*[:=]\s*(\d+)/i,
    // "0 cessions"
    /(\d+)\s+cessions?/i,
  ];

  return extractInteger(text, patterns);
}

/**
 * Extrait l'endettement (en %)
 */
function extractEndettement(text: string): { value: number | null; source: string | null } {
  const patterns = [
    // "0,1% endettement(3)"
    /(\d+(?:[.,]\d+)?)\s*%\s*endettement/i,
    // "endettement: 0,1%" ou "endettement : 0,1%"
    /endettement\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*%/i,
    // "endettement(3) 0,1%"
    /endettement\s*\([^)]*\)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numValue = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(numValue)) {
        return { value: numValue, source: match[0] };
      }
    }
  }
  return { value: null, source: null };
}

/**
 * Extrait le nom de la SCPI depuis le texte
 */
function extractScpiName(text: string): string {
  // Chercher des patterns communs pour le nom de SCPI
  const patterns = [
    /SCPI\s+([A-Z][A-Za-z\s-]+)/,
    /([A-Z][A-Za-z\s-]+)\s+SCPI/,
    /Bulletin\s+trimestriel\s+([A-Z][A-Za-z\s-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'SCPI Inconnue';
}

/**
 * Extrait la période (trimestre) depuis le texte
 */
function extractPeriode(text: string): string {
  // Chercher des patterns comme "2025-Q4", "T4 2025", "4ème trimestre 2025"
  const patterns = [
    /(\d{4})\s*[-/]\s*Q(\d)/i,
    /T(\d)\s+(\d{4})/i,
    /(\d)(?:ème|er)?\s+trimestre\s+(\d{4})/i,
    /(\d{4})\s*[-/]\s*T(\d)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern === patterns[0] || pattern === patterns[3]) {
        // Format: 2025-Q4 ou 2025-T4
        return `${match[1]}-Q${match[2]}`;
      } else if (pattern === patterns[1]) {
        // Format: T4 2025
        return `${match[2]}-Q${match[1]}`;
      } else if (pattern === patterns[2]) {
        // Format: 4ème trimestre 2025
        return `${match[2]}-Q${match[1]}`;
      }
    }
  }

  // Par défaut, utiliser la date actuelle
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

/**
 * Extrait les données depuis un texte (PDF converti en texte)
 */
export function extractScpiDataFromText(text: string, scpiName?: string): ExtractionResult {
  // Normaliser le texte (supprimer les espaces multiples, normaliser les retours à la ligne)
  const normalizedText = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  // Extraire le nom de la SCPI
  const scpi = scpiName || extractScpiName(normalizedText);

  // Extraire la période
  const periode = extractPeriode(normalizedText);

  // Extraire le nombre de locataires
  const locataires = extractNombreLocataires(normalizedText);

  // Extraire WALT (doit être explicitement nommé "WALT")
  const walt = extractWaltOrWalb(normalizedText, 'WALT');

  // Extraire WALB (doit être explicitement nommé "WALB")
  const walb = extractWaltOrWalb(normalizedText, 'WALB');

  // Extraire la collecte nette du trimestre
  const collecteNette = extractCollecteNetteTrimestre(normalizedText);

  // Extraire le nombre de cessions du trimestre
  const nbCessions = extractNbCessionsTrimestre(normalizedText);

  // Extraire l'endettement
  const endettement = extractEndettement(normalizedText);

  return {
    scpi,
    periode,
    nombre_locataires: locataires.value,
    walt: walt.value,
    walb: walb.value,
    collecte_nette_trimestre: collecteNette.value,
    nb_cessions_trimestre: nbCessions.value,
    endettement: endettement.value,
    sources: {
      nombre_locataires: locataires.source,
      walt: walt.source,
      walb: walb.source,
      collecte_nette_trimestre: collecteNette.source,
      nb_cessions_trimestre: nbCessions.source,
      endettement: endettement.source,
    },
  };
}

/**
 * Extrait les données depuis un fichier PDF
 * Nécessite: npm install pdf-parse @types/pdf-parse
 */
export async function extractScpiDataFromPdf(
  pdfPath: string,
  scpiName?: string
): Promise<ExtractionResult> {
  try {
    // Vérifier si pdf-parse est disponible
    const pdfParse = await import('pdf-parse').catch(() => null);
    
    if (!pdfParse) {
      throw new Error(
        'pdf-parse n\'est pas installé. Installez-le avec: npm install pdf-parse @types/pdf-parse'
      );
    }

    // Lire le fichier PDF
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse.default(pdfBuffer);

    // Extraire le texte
    const text = pdfData.text;

    // Extraire les données
    return extractScpiDataFromText(text, scpiName);
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Fonction principale pour l'extraction depuis la ligne de commande
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: npx tsx scripts/extractScpiQuarterlyData.ts <fichier.pdf|fichier.txt> [nom-scpi]

Exemples:
  npx tsx scripts/extractScpiQuarterlyData.ts bulletin-comete-2025-q4.pdf
  npx tsx scripts/extractScpiQuarterlyData.ts bulletin-comete-2025-q4.pdf "Comète"
  npx tsx scripts/extractScpiQuarterlyData.ts texte.txt "Iroko Zen"
    `);
    process.exit(1);
  }

  const filePath = args[0];
  const scpiName = args[1];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier non trouvé: ${filePath}`);
    process.exit(1);
  }

  try {
    let result: ExtractionResult;

    if (filePath.endsWith('.pdf')) {
      result = await extractScpiDataFromPdf(filePath, scpiName);
    } else {
      // Fichier texte
      const text = fs.readFileSync(filePath, 'utf-8');
      result = extractScpiDataFromText(text, scpiName);
    }

    // Afficher le résultat en JSON
    console.log(JSON.stringify(result, null, 2));

    // Afficher un résumé
    console.error('\n📊 Résumé de l\'extraction:');
    console.error(`   SCPI: ${result.scpi}`);
    console.error(`   Période: ${result.periode}`);
    console.error(`   Nombre de locataires: ${result.nombre_locataires ?? '❌ Non trouvé'}`);
    console.error(`   WALT: ${result.walt !== null ? `${result.walt.toFixed(1)} ans` : '❌ Non trouvé'}`);
    console.error(`   WALB: ${result.walb !== null ? `${result.walb.toFixed(1)} ans` : '❌ Non trouvé'}`);
    console.error(`   Collecte nette trimestre: ${result.collecte_nette_trimestre !== null ? `${(result.collecte_nette_trimestre / 1000000).toFixed(1)}M€` : '❌ Non trouvé'}`);
    console.error(`   Nombre de cessions trimestre: ${result.nb_cessions_trimestre !== null ? result.nb_cessions_trimestre : '❌ Non trouvé'}`);
    console.error(`   Endettement: ${result.endettement !== null ? `${result.endettement}%` : '❌ Non trouvé'}`);

    if (result.sources.nombre_locataires) {
      console.error(`   Source locataires: "${result.sources.nombre_locataires}"`);
    }
    if (result.sources.walt) {
      console.error(`   Source WALT: "${result.sources.walt}"`);
    }
    if (result.sources.walb) {
      console.error(`   Source WALB: "${result.sources.walb}"`);
    }
    if (result.sources.collecte_nette_trimestre) {
      console.error(`   Source collecte nette: "${result.sources.collecte_nette_trimestre}"`);
    }
    if (result.sources.nb_cessions_trimestre) {
      console.error(`   Source cessions: "${result.sources.nb_cessions_trimestre}"`);
    }
    if (result.sources.endettement) {
      console.error(`   Source endettement: "${result.sources.endettement}"`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
