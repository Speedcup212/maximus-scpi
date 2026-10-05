import fs from 'node:fs';
import path from 'node:path';

const replaceInFile = (relativePath, replacements) => {
  const file = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(file)) {
    console.log(`[runtime-seo-patch] ${relativePath} absent — skip`);
    return;
  }

  const original = fs.readFileSync(file, 'utf8');
  let source = original;

  for (const [from, to] of replacements) {
    source = source.replace(from, to);
  }

  if (source !== original) {
    fs.writeFileSync(file, source);
    console.log(`[runtime-seo-patch] ${relativePath} neutralized`);
  } else {
    console.log(`[runtime-seo-patch] ${relativePath} already clean`);
  }
};

replaceInFile('src/components/ScpiDetailPage.tsx', [
  [
    'Le taux de distribution 2024 de la SCPI ${scpi.name} est de ${scpi.yield.toFixed(2)}%. Ce taux de distribution est calculé sur la base des dividendes distribués sur l\'année.',
    'Le taux de distribution affiché pour la SCPI ${scpi.name} est de ${scpi.yield.toFixed(2)}%. Vérifiez la période de référence et la source dans les dernières publications de la société de gestion.'
  ],
  [
    'La SCPI ${scpi.name} affiche une capitalisation de ${formatCurrency(scpi.capitalization)}, ce qui témoigne de sa taille et de sa solidité sur le marché.',
    'La SCPI ${scpi.name} affiche une capitalisation de ${formatCurrency(scpi.capitalization)}. La capitalisation mesure la taille du véhicule mais ne garantit ni sa solidité, ni sa liquidité, ni sa performance.'
  ],
  [
    'Oui, la SCPI ${scpi.name} bénéficie du label ISR (Investissement Socialement Responsable), garantissant une gestion durable et responsable du patrimoine immobilier.',
    'La SCPI ${scpi.name} est indiquée comme labellisée ISR dans les données MaximusSCPI. Vérifiez la validité et le périmètre du label dans les documents officiels les plus récents.'
  ],
  [
    'Non, la SCPI ${scpi.name} ne dispose pas actuellement du label ISR, mais respecte les normes en vigueur en matière de gestion immobilière.',
    'La SCPI ${scpi.name} n’est pas indiquée comme labellisée ISR dans les données MaximusSCPI. Vérifiez la situation actuelle dans les documents officiels de la société de gestion.'
  ],
  ['  const rating = qualityScore !== null ? qualityScore / 10 : 0;\n  const financialProductSchema = generateFinancialProductSchema(scpi, rating);', '  const financialProductSchema = generateFinancialProductSchema(scpi);'],
]);

replaceInFile('src/data/managementCompanyArticlesConfig.ts', [
  [
    "Un investisseur TMI 41% analyse si Transitions Europe est éligible en assurance-vie pour optimiser la fiscalité des revenus fonciers.",
    "Un investisseur compare les modes de détention de Transitions Europe en intégrant frais, fiscalité des flux, liquidité et règles du contrat d’assurance-vie lorsqu’il existe."
  ],
  ["'PS 0%'", "'fiscalité des revenus étrangers'"],
  [
    'Avantage fiscal des prélèvements sociaux réduits sur revenus étrangers',
    'Fiscalité des revenus étrangers à analyser selon les pays et conventions'
  ],
  [
    'Les SCPI européennes peuvent bénéficier de prélèvements sociaux à 0%',
    'Le traitement des prélèvements sociaux sur les revenus étrangers dépend du pays, de la nature du flux et de la situation du contribuable'
  ],
  [
    "Un investisseur TMI 41% analyse l'intérêt des SCPI européennes pour réduire l'impact des prélèvements sociaux. Il vérifie le crédit d'impôt et le taux effectif.",
    "Un investisseur analyse les revenus étrangers pays par pays et vérifie la convention applicable, le crédit d’impôt éventuel, le taux effectif et les autres conséquences fiscales."
  ],
  [
    "Les revenus de SCPI européennes peuvent bénéficier de prélèvements sociaux réduits ou nuls selon les pays, mais le rendement net dépend aussi du crédit d'impôt et du taux effectif. L'analyse doit être faite au cas par cas.",
    "La fiscalité des revenus de SCPI européennes varie selon les pays, les conventions et la situation du contribuable. Le rendement net doit être calculé au cas par cas à partir des flux réellement déclarés."
  ],
]);
