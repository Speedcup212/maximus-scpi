/**
 * AUDIT QA/COMPLIANCE - MULTI-PAGES
 * Analyse automatisée de toutes les landing pages MaximusSCPI
 */

const fs = require('fs');
const path = require('path');

// Import des données
const landingPagesDataPath = './src/data/landingPagesData.ts';
const thematicPagesDataPath = './src/data/thematicLandingPages.ts';

// Lecture des fichiers
const landingPagesContent = fs.readFileSync(landingPagesDataPath, 'utf8');
const thematicPagesContent = fs.readFileSync(thematicPagesDataPath, 'utf8');

// Patterns à détecter
const problematicPatterns = {
  P0: {
    'exceptionnel': /exceptionnel(le)?/gi,
    'garanti': /garanti(e|s|ssant|sses)?/gi,
    'sans_risque': /sans\s+risque/gi,
    'assure': /assur(é|ée|és|ées)/gi
  },
  P1: {
    'rendement_superieur': /rendement\s+(supérieur|très\s+élevé|extraordinaire)/gi,
    'meilleur_du_marche': /(meilleur|top)\s+(du|sur\s+le)\s+marché/gi
  }
};

// Fonction d'analyse
function analyzeContent(content, pageName, pageType) {
  const issues = {
    P0: [],
    P1: [],
    P2: []
  };

  // Détection P0
  Object.entries(problematicPatterns.P0).forEach(([key, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.P0.push({
        type: key,
        count: matches.length,
        examples: matches.slice(0, 3)
      });
    }
  });

  // Détection P1
  Object.entries(problematicPatterns.P1).forEach(([key, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.P1.push({
        type: key,
        count: matches.length,
        examples: matches.slice(0, 3)
      });
    }
  });

  // Vérifier les disclaimers
  const hasDisclaimer = /performances passées.*ne.*préjugent|risque.*perte.*capital|placement.*long terme/i.test(content);
  if (!hasDisclaimer) {
    issues.P1.push({
      type: 'missing_disclaimer',
      count: 1,
      examples: ['Disclaimers AMF absents ou incomplets']
    });
  }

  return {
    page: pageName,
    type: pageType,
    issues,
    hasIssues: issues.P0.length > 0 || issues.P1.length > 0,
    severity: issues.P0.length > 0 ? 'BLOQUANT' : (issues.P1.length > 0 ? 'IMPORTANT' : 'OK')
  };
}

// Analyse des SCPI individuelles
console.log('🔍 Analyse des fiches SCPI individuelles...\n');
const scpiPages = ['comete', 'transitions-europe', 'remake-live', 'epargne-pierre-europe', 'optimale', 'iroko-zen', 'novaxia-neo'];
const scpiResults = [];

scpiPages.forEach(scpiKey => {
  const regex = new RegExp(`'${scpiKey}':\\s*{([\\s\\S]*?)}(?=,\\s*'[^']+':)`);
  const match = landingPagesContent.match(regex);
  if (match) {
    const result = analyzeContent(match[1], scpiKey, 'fiche_scpi');
    scpiResults.push(result);

    const emoji = result.severity === 'BLOQUANT' ? '🔴' : (result.severity === 'IMPORTANT' ? '🟠' : '✅');
    console.log(`${emoji} ${scpiKey}: ${result.severity} (P0: ${result.issues.P0.length}, P1: ${result.issues.P1.length})`);
  }
});

// Analyse des pages thématiques
console.log('\n🔍 Analyse des pages thématiques/catégories...\n');
const thematicPages = ['meilleures-scpi-rendement', 'scpi-europeennes', 'scpi-fiscales', 'preparer-retraite-scpi', 'revenu-complementaire-scpi', 'comparateur-scpi', 'scpi-bureaux-investissement', 'scpi-commerces-investissement', 'scpi-sante-investissement', 'scpi-france-investissement'];
const thematicResults = [];

thematicPages.forEach(pageKey => {
  const regex = new RegExp(`'${pageKey}':\\s*{([\\s\\S]*?)}(?=,\\s*'[^']+':)`);
  const match = thematicPagesContent.match(regex);
  if (match) {
    const result = analyzeContent(match[1], pageKey, 'page_thematique');
    thematicResults.push(result);

    const emoji = result.severity === 'BLOQUANT' ? '🔴' : (result.severity === 'IMPORTANT' ? '🟠' : '✅');
    console.log(`${emoji} ${pageKey}: ${result.severity} (P0: ${result.issues.P0.length}, P1: ${result.issues.P1.length})`);
  }
});

// Génération du rapport JSON
const report = {
  date_audit: new Date().toISOString().split('T')[0],
  total_pages: scpiResults.length + thematicResults.length,
  summary: {
    bloquants: [...scpiResults, ...thematicResults].filter(r => r.severity === 'BLOQUANT').length,
    importants: [...scpiResults, ...thematicResults].filter(r => r.severity === 'IMPORTANT').length,
    ok: [...scpiResults, ...thematicResults].filter(r => r.severity === 'OK').length
  },
  scpi_pages: scpiResults,
  thematic_pages: thematicResults
};

// Sauvegarde
fs.writeFileSync('./AUDIT_MULTI_PAGES_RESULT.json', JSON.stringify(report, null, 2));

console.log('\n📊 RÉSUMÉ GLOBAL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Total pages analysées: ${report.total_pages}`);
console.log(`🔴 Bloquants (P0):     ${report.summary.bloquants}`);
console.log(`🟠 Importants (P1):    ${report.summary.importants}`);
console.log(`✅ OK:                 ${report.summary.ok}`);
console.log('\n✅ Rapport sauvegardé: AUDIT_MULTI_PAGES_RESULT.json\n');
