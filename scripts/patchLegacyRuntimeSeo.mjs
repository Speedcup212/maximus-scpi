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

replaceInFile('src/data/articleTemplatesConfig.ts', [
  [
    "metaDescription: '100 000€ sur fonds euros à 2% vs SCPI 5% sur 15 ans : +63 000€ de différence. Calculs détaillés avec inflation.',",
    "metaDescription: 'Comparer fonds euros et SCPI : rendement observé, risque, liquidité, frais, inflation et horizon. Les hypothèses doivent être actualisées avant toute décision.',"
  ],
  [
    "metaDescription: '200 000€ en SCPI : portefeuille diversifié 5-6 SCPI, revenus 10 000€/an, fiscalité couple, horizon 15 ans.',",
    "metaDescription: 'Investir 200 000 € en SCPI : méthode de diversification, concentration, liquidité, fiscalité, frais et scénarios de revenus sans rendement garanti.',"
  ],
  [
    "metaDescription: 'PER et SCPI : déduction fiscale + revenus locatifs. Stratégie optimale pour TMI 30-41%, simulation 15-20 ans.',",
    "metaDescription: 'PER et SCPI : déduction éventuelle des versements, frais, supports disponibles, horizon retraite, liquidité et fiscalité de sortie à comparer.',"
  ],
  [
    "metaDescription: 'Diversification SCPI : 4-6 SCPI minimum pour limiter les risques. Stratégie allocation secteurs, zones géographiques.',",
    "metaDescription: 'Diversification SCPI : nombre de lignes, gestionnaires, secteurs, zones, liquidité et concentrations. Il n’existe pas de nombre minimum universel.',"
  ],
  [
    "metaDescription: 'SCPI avec TMI 11% : rendement net 5,3%, privilégier SCPI européennes PS 0%. Stratégie fiscale optimale.',",
    "metaDescription: 'SCPI avec TMI 11 % : analyser la fiscalité réelle, les revenus français et étrangers, les frais, le mode de détention et les risques sans allocation automatique.',"
  ],
  [
    "metaDescription: 'SCPI TMI 30% : arbitrage direct vs AV. Rendement net 4,3% AV vs 3,9% direct. Stratégie optimale selon horizon.',",
    "metaDescription: 'SCPI avec TMI 30 % : comparer direct et assurance-vie selon frais, fiscalité des flux, liquidité, horizon et conditions du contrat.',"
  ],
  [
    "title: 'TMI 41% et plus : pourquoi les SCPI en assurance-vie sont incontournables',",
    "title: 'TMI 41 % et SCPI : direct, assurance-vie et autres modes de détention',"
  ],
  [
    "metaDescription: 'SCPI TMI 41%+ : assurance-vie obligatoire. Rendement net 4,1% vs 2,6% direct. Optimisation fiscale maximale.',",
    "metaDescription: 'SCPI avec TMI 41 % : comparer direct, assurance-vie, démembrement et autres modes de détention selon frais, fiscalité, liquidité et horizon.',"
  ],
  [
    "title: 'IFI et SCPI : comment réduire l\\'Impôt sur la Fortune Immobilière',",
    "title: 'IFI et SCPI : déclaration, valorisation et points de vigilance',"
  ],
  [
    "metaDescription: 'SCPI et IFI : intégration patrimoine taxable, stratégies pour limiter l\\'impact. SCPI en AV exonérées IFI.',",
    "metaDescription: 'SCPI et IFI : valeur à déclarer, détention directe, assurance-vie, démembrement et société. Le traitement dépend de la structure et des règles applicables.',"
  ],
  [
    "metaDescription: 'SCPI européennes : rendement 6-6,5%, PS 0%, diversification Allemagne/Pays-Bas. Optimisation fiscale TMI 30-41%.',",
    "metaDescription: 'SCPI européennes : diversification, revenus étrangers, conventions fiscales, frais, liquidité et risques à analyser pays par pays.',"
  ],
  ["keywords: ['SCPI européennes', 'PS 0%', 'Allemagne', 'Pays-Bas', 'rendement 6,5%']", "keywords: ['SCPI européennes', 'revenus étrangers', 'conventions fiscales', 'diversification', 'risques SCPI']"],
]);
