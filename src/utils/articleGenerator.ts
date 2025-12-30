/**
 * Générateur automatique d'articles SEO pour MaximusSCPI
 * Basé sur les templates définis dans articleTemplatesConfig.ts
 */

import { ArticleTemplate } from '../data/articleTemplatesConfig';

export interface GeneratedArticleContent {
  html: string;
  wordCount: number;
  readTime: number;
}

/**
 * Génère le contenu HTML complet d'un article basé sur son template
 */
export function generateArticleContent(template: ArticleTemplate): GeneratedArticleContent {
  const sections = generateArticleSections(template);
  const html = sections.join('\n\n');
  const wordCount = estimateWordCount(html);
  const readTime = Math.ceil(wordCount / 200); // 200 mots/minute

  return {
    html,
    wordCount,
    readTime
  };
}

/**
 * Génère toutes les sections de l'article
 */
function generateArticleSections(template: ArticleTemplate): string[] {
  const sections: string[] = [];

  // Introduction
  sections.push(generateIntroduction(template));

  // Sections principales selon le type d'article
  if (template.category === 'comparatifs') {
    sections.push(...generateComparativeSections(template));
  } else if (template.category === 'fiscalite') {
    sections.push(...generateFiscalitySections(template));
  } else if (template.category === 'strategies') {
    sections.push(...generateStrategySections(template));
  } else if (template.category === 'marche') {
    sections.push(...generateMarketSections(template));
  } else if (template.category === 'guides') {
    sections.push(...generateGuideSections(template));
  }

  // Sections communes
  sections.push(generateFiguresSection(template));
  sections.push(generateRisksSection());
  sections.push(generateFAQ(template));
  sections.push(generateCTA());

  return sections;
}

/**
 * Génère l'introduction de l'article
 */
function generateIntroduction(template: ArticleTemplate): string {
  return `
<div class="prose prose-lg max-w-none mb-12">
  <p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
    ${getIntroductionText(template)}
  </p>
  <p class="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
    Dans cet article, nous analysons en détail ${template.mainKeyword} pour vous aider à prendre la meilleure décision selon votre situation patrimoniale, votre TMI et vos objectifs d'investissement.
  </p>
</div>
`;
}

function getIntroductionText(template: ArticleTemplate): string {
  const intros: Record<number, string> = {
    1: 'Vous détenez une assurance-vie avec un capital conséquent sur un fonds euros et vous vous demandez s\'il est temps de diversifier vers les SCPI ? Avec des rendements du fonds euros qui stagnent autour de 2 % tandis que l\'inflation reste à 2 %, votre épargne peine à progresser réellement. Les SCPI, qui affichent des performances moyennes de 5 % en France et jusqu\'à 6,5 % pour les SCPI européennes, représentent-elles une alternative pertinente ?',
    2: 'Vous envisagez d\'investir en SCPI et vous hésitez entre la souscription en direct ou via votre contrat d\'assurance-vie ? Cette question est fondamentale car elle impacte directement votre fiscalité, vos frais, votre capacité de transmission et la liquidité de votre investissement. Comprendre ces différences concrètes est essentiel pour optimiser votre patrimoine.',
    3: 'Avec des taux de crédit immobilier autour de 3-4 % en 2025, est-il encore judicieux d\'investir en SCPI à crédit pour bénéficier de l\'effet de levier ? L\'équation rentabilité SCPI (5-6,5 %) moins coût du crédit (3,5-4 %) reste-t-elle favorable, surtout après prise en compte de la déductibilité des intérêts d\'emprunt pour les TMI élevés ?',
    // Ajoutez les autres intros personnalisées...
  };

  return intros[template.id] || `${template.searchIntent}. Ce guide complet vous apporte toutes les clés pour comprendre et décider en toute connaissance de cause.`;
}

/**
 * Génère les sections comparatives
 */
function generateComparativeSections(template: ArticleTemplate): string[] {
  return [
    `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
    Vue d'ensemble : les deux solutions en présence
  </h2>

  <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
    <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
      ${getComparisonIntro(template)}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${generateComparisonCards(template)}
    </div>
  </div>
</section>
`,
    generateComparisonTable(template),
    generateConcreteCaseStudy(template)
  ];
}

function getComparisonIntro(template: ArticleTemplate): string {
  return `Pour bien comprendre ${template.mainKeyword}, il est essentiel de comparer objectivement les caractéristiques, avantages et inconvénients de chaque solution. Voici une analyse détaillée basée sur des critères concrets.`;
}

function generateComparisonCards(template: ArticleTemplate): string {
  return `
    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <h3 class="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Option 1</h3>
      <ul class="space-y-3 text-blue-800 dark:text-blue-300">
        <li class="flex items-start gap-2">
          <span class="text-blue-600 dark:text-blue-400">✓</span>
          <span>Avantage clé 1</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 dark:text-blue-400">✓</span>
          <span>Avantage clé 2</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 dark:text-blue-400">✓</span>
          <span>Avantage clé 3</span>
        </li>
      </ul>
    </div>

    <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <h3 class="text-xl font-bold text-green-900 dark:text-green-200 mb-4">Option 2</h3>
      <ul class="space-y-3 text-green-800 dark:text-green-300">
        <li class="flex items-start gap-2">
          <span class="text-green-600 dark:text-green-400">✓</span>
          <span>Avantage clé 1</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 dark:text-green-400">✓</span>
          <span>Avantage clé 2</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 dark:text-green-400">✓</span>
          <span>Avantage clé 3</span>
        </li>
      </ul>
    </div>
  `;
}

function generateComparisonTable(template: ArticleTemplate): string {
  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Tableau comparatif détaillé
  </h2>

  <div class="overflow-x-auto">
    <table class="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <thead>
        <tr class="border-b-2 border-gray-300 dark:border-gray-600">
          <th class="py-4 px-4 font-bold text-gray-900 dark:text-white">Critère</th>
          <th class="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">Option 1</th>
          <th class="py-4 px-4 font-bold text-green-600 dark:text-green-400">Option 2</th>
        </tr>
      </thead>
      <tbody class="text-gray-700 dark:text-gray-300">
        ${generateComparisonRows(template)}
      </tbody>
    </table>
  </div>
</section>
`;
}

function generateComparisonRows(template: ArticleTemplate): string {
  const criteria = [
    { name: 'Rendement moyen', col1: '2%', col2: '5-6,5%' },
    { name: 'Garantie capital', col1: '✅ Oui', col2: '❌ Non' },
    { name: 'Liquidité', col1: '✅ Immédiate', col2: '⚠️ Différée' },
    { name: 'Fiscalité', col1: '17,2% minimum', col2: 'Variable selon enveloppe' },
    { name: 'Frais d\'entrée', col1: '0%', col2: '8-12% (direct)' }
  ];

  return criteria.map(c => `
    <tr class="border-b border-gray-200 dark:border-gray-700">
      <td class="py-4 px-4 font-semibold">${c.name}</td>
      <td class="py-4 px-4">${c.col1}</td>
      <td class="py-4 px-4">${c.col2}</td>
    </tr>
  `).join('');
}

function generateConcreteCaseStudy(template: ArticleTemplate): string {
  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
    </svg>
    Exemple chiffré concret
  </h2>

  <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold text-orange-900 dark:text-orange-200 mb-4">
      Simulation sur 15 ans
    </h3>

    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
      <h4 class="font-bold text-gray-900 dark:text-white mb-3">Hypothèses</h4>
      <ul class="space-y-2 text-gray-700 dark:text-gray-300">
        <li>• Capital initial : 100 000 €</li>
        <li>• Durée : 15 ans</li>
        <li>• TMI : 30%</li>
        <li>• Inflation : 2% par an</li>
      </ul>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">Scénario 1</h4>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• Revenus bruts cumulés : 30 000 €</li>
          <li>• Revenus nets après fiscalité : 24 900 €</li>
          <li>• Capital final : 124 900 €</li>
        </ul>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-3">Scénario 2</h4>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• Revenus bruts cumulés : 75 000 €</li>
          <li>• Revenus nets après fiscalité : 53 600 €</li>
          <li>• Capital final : 153 600 €</li>
        </ul>
      </div>
    </div>

    <div class="mt-6 p-6 bg-orange-100 dark:bg-orange-900/30 rounded-xl border-2 border-orange-300 dark:border-orange-700">
      <p class="text-lg font-bold text-orange-900 dark:text-orange-200">
        💡 Différence : +28 700 € sur 15 ans, soit +23% de performance
      </p>
    </div>
  </div>
</section>
`;
}

/**
 * Génère les sections fiscalité
 */
function generateFiscalitySections(template: ArticleTemplate): string[] {
  return [
    `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    Comprendre la fiscalité : calculs détaillés
  </h2>

  <div class="space-y-6">
    ${generateFiscalityCalculations(template)}
  </div>
</section>
`,
    generateOptimizationStrategies(template)
  ];
}

function generateFiscalityCalculations(template: ArticleTemplate): string {
  return `
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Calcul de l'imposition selon votre TMI
      </h3>

      <div class="space-y-6">
        <div class="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 class="font-bold text-blue-900 dark:text-blue-200 mb-3">TMI 11%</h4>
          <ul class="space-y-2 text-blue-800 dark:text-blue-300">
            <li>• Revenus bruts SCPI : 5 000 €</li>
            <li>• IR (11%) : 550 €</li>
            <li>• Prélèvements sociaux (17,2%) : 860 €</li>
            <li><strong>• Revenus nets : 3 590 € (71,8%)</strong></li>
          </ul>
        </div>

        <div class="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <h4 class="font-bold text-green-900 dark:text-green-200 mb-3">TMI 30%</h4>
          <ul class="space-y-2 text-green-800 dark:text-green-300">
            <li>• Revenus bruts SCPI : 5 000 €</li>
            <li>• IR (30%) : 1 500 €</li>
            <li>• Prélèvements sociaux (17,2%) : 860 €</li>
            <li><strong>• Revenus nets : 2 640 € (52,8%)</strong></li>
          </ul>
        </div>

        <div class="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <h4 class="font-bold text-orange-900 dark:text-orange-200 mb-3">TMI 41%</h4>
          <ul class="space-y-2 text-orange-800 dark:text-orange-300">
            <li>• Revenus bruts SCPI : 5 000 €</li>
            <li>• IR (41%) : 2 050 €</li>
            <li>• Prélèvements sociaux (17,2%) : 860 €</li>
            <li><strong>• Revenus nets : 2 090 € (41,8%)</strong></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function generateOptimizationStrategies(template: ArticleTemplate): string {
  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Stratégies d'optimisation fiscale
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <h3 class="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Stratégie 1 : Assurance-vie</h3>
      <p class="text-blue-800 dark:text-blue-300 mb-4">
        Logez vos SCPI dans une assurance-vie pour bénéficier de l'abattement après 8 ans (4 600 € / 9 200 € pour un couple).
      </p>
      <p class="font-bold text-blue-900 dark:text-blue-200">
        → Économie fiscale : jusqu'à 2 700 €/an
      </p>
    </div>

    <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <h3 class="text-xl font-bold text-green-900 dark:text-green-200 mb-4">Stratégie 2 : SCPI européennes</h3>
      <p class="text-green-800 dark:text-green-300 mb-4">
        Privilégiez les SCPI investies en Europe pour limiter l'imposition (pas de micro-foncier, fiscalité spécifique).
      </p>
      <p class="font-bold text-green-900 dark:text-green-200">
        → Rendement net optimisé pour TMI élevés
      </p>
    </div>

    <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
      <h3 class="text-xl font-bold text-orange-900 dark:text-orange-200 mb-4">Stratégie 3 : Crédit déductible</h3>
      <p class="text-orange-800 dark:text-orange-300 mb-4">
        Investissez à crédit pour déduire les intérêts d'emprunt de vos revenus fonciers et réduire votre assiette taxable.
      </p>
      <p class="font-bold text-orange-900 dark:text-orange-200">
        → Effet levier fiscal + patrimonial
      </p>
    </div>
  </div>
</section>
`;
}

/**
 * Génère les sections stratégies
 */
function generateStrategySections(template: ArticleTemplate): string[] {
  return [
    `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Quelle stratégie adopter selon votre profil ?
  </h2>

  <div class="space-y-6">
    ${generateProfileStrategies(template)}
  </div>
</section>
`,
    generateActionPlan(template)
  ];
}

function generateProfileStrategies(template: ArticleTemplate): string {
  const profiles = [
    {
      name: 'Profil prudent (aversion au risque forte)',
      color: 'blue',
      recommendation: 'Conservez 70-80% sur fonds euros, testez les SCPI avec 20-30% de votre capital',
      allocation: '70% fonds euros / 30% SCPI',
      expectedReturn: '2,8% net'
    },
    {
      name: 'Profil équilibré (acceptation risque modéré)',
      color: 'green',
      recommendation: 'Répartissez équitablement : 50% fonds euros pour la sécurité, 50% SCPI pour le rendement',
      allocation: '50% fonds euros / 50% SCPI',
      expectedReturn: '3,7% net'
    },
    {
      name: 'Profil dynamique (recherche de performance)',
      color: 'orange',
      recommendation: 'Privilégiez les SCPI (70-80%) avec une poche de sécurité minimale (20-30%) en fonds euros',
      allocation: '30% fonds euros / 70% SCPI',
      expectedReturn: '4,4% net'
    }
  ];

  return profiles.map(profile => `
    <div class="bg-${profile.color}-50 dark:bg-${profile.color}-900/20 rounded-2xl p-8 border-2 border-${profile.color}-200 dark:border-${profile.color}-800">
      <h3 class="text-2xl font-bold text-${profile.color}-900 dark:text-${profile.color}-200 mb-4 flex items-center gap-2">
        <span>👤</span>
        ${profile.name}
      </h3>
      <p class="text-${profile.color}-800 dark:text-${profile.color}-300 mb-4 font-semibold">
        ${profile.recommendation}
      </p>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Allocation recommandée</div>
            <div class="text-lg font-bold text-${profile.color}-600 dark:text-${profile.color}-400">${profile.allocation}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Rendement espéré</div>
            <div class="text-lg font-bold text-${profile.color}-600 dark:text-${profile.color}-400">${profile.expectedReturn}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('\n');
}

function generateActionPlan(template: ArticleTemplate): string {
  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Plan d'action en 5 étapes
  </h2>

  <div class="space-y-4">
    ${[1, 2, 3, 4, 5].map(step => `
      <div class="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          ${step}
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Étape ${step}</h3>
          <p class="text-gray-700 dark:text-gray-300">
            Description de l'étape ${step} pour mettre en œuvre votre stratégie ${template.mainKeyword}.
          </p>
        </div>
      </div>
    `).join('\n')}
  </div>
</section>
`;
}

/**
 * Génère les sections marché
 */
function generateMarketSections(template: ArticleTemplate): string[] {
  return [
    `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    État du marché en 2025
  </h2>

  <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
    <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
      Analyse détaillée du marché pour ${template.mainKeyword} avec les dernières tendances et perspectives.
    </p>
  </div>
</section>
`
  ];
}

/**
 * Génère les sections guides
 */
function generateGuideSections(template: ArticleTemplate): string[] {
  return [
    `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Guide pratique étape par étape
  </h2>

  <div class="space-y-6">
    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
      Suivez ce guide complet pour ${template.mainKeyword} de manière optimale.
    </p>
  </div>
</section>
`
  ];
}

/**
 * Génère la section figures/graphiques
 */
function generateFiguresSection(template: ArticleTemplate): string {
  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Visualisation des données
  </h2>

  <div class="space-y-8">
    <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div class="text-center">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          [FIGURE 1 – Camembert : Répartition d'allocation recommandée]
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Ce graphique illustre la répartition optimale entre fonds euros et SCPI selon votre profil de risque.
        </p>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div class="text-center">
        <div class="text-6xl mb-4">📈</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          [FIGURE 2 – Histogramme : Évolution du capital sur 15 ans]
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Comparaison de l'évolution du capital selon la stratégie choisie, illustrant le coût d'opportunité.
        </p>
      </div>
    </div>
  </div>
</section>
`;
}

/**
 * Génère la section risques
 */
function generateRisksSection(): string {
  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
    Points de vigilance et risques
  </h2>

  <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Capital non garanti</h3>
        <p class="text-red-800 dark:text-red-300 leading-relaxed">
          Contrairement au fonds euros, le capital investi en SCPI n'est pas garanti. La valeur de vos parts peut fluctuer à la baisse selon l'évolution du marché immobilier.
        </p>
      </div>

      <div>
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Liquidité limitée</h3>
        <p class="text-red-800 dark:text-red-300 leading-relaxed">
          Les SCPI ne se revendent pas instantanément. Comptez plusieurs semaines, voire quelques mois en période de tension. Horizon de placement recommandé : 8-10 ans minimum.
        </p>
      </div>

      <div>
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Risques locatifs</h3>
        <p class="text-red-800 dark:text-red-300 leading-relaxed">
          Vacance locative, défaillance locataires, baisse des loyers : ces risques peuvent impacter négativement les dividendes distribués.
        </p>
      </div>
    </div>
  </div>
</section>
`;
}

/**
 * Génère la FAQ
 */
function generateFAQ(template: ArticleTemplate): string {
  const faqItems = [
    {
      question: `Quel est le rendement moyen des SCPI en 2025 ?`,
      answer: `Le rendement moyen des SCPI françaises s'établit autour de 5% en 2025, tandis que les SCPI européennes affichent des performances de 6 à 6,5%. Ces rendements sont nets de frais de gestion mais bruts de fiscalité.`
    },
    {
      question: `Quelle est la fiscalité applicable aux revenus de SCPI ?`,
      answer: `Les revenus de SCPI sont imposés à l'impôt sur le revenu selon votre TMI (11%, 30%, 41% ou 45%) plus les prélèvements sociaux de 17,2%. En assurance-vie, la fiscalité est différente avec possibilité d'abattement après 8 ans.`
    },
    {
      question: `Peut-on perdre de l'argent avec les SCPI ?`,
      answer: `Oui, le capital investi en SCPI n'est pas garanti. La valeur des parts peut baisser en cas de crise immobilière, et les dividendes peuvent diminuer si le taux d'occupation baisse. C'est pourquoi un horizon de placement long (8-10 ans minimum) est recommandé.`
    }
  ];

  return `
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
    FAQ : vos questions sur ${template.mainKeyword}
  </h2>

  <div class="space-y-6">
    ${faqItems.map(item => `
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
          ${item.question}
        </h3>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
          ${item.answer}
        </p>
      </div>
    `).join('\n')}
  </div>
</section>
`;
}

/**
 * Génère le CTA final
 */
function generateCTA(): string {
  return `
<section class="mb-12">
  <div class="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
    <h2 class="text-3xl font-bold mb-6 text-center">
      Passez à l'action : utilisez nos outils gratuits
    </h2>
    <p class="text-xl text-center mb-8 text-blue-100 max-w-3xl mx-auto">
      Vous avez maintenant toutes les clés pour faire les bons choix. Nos outils vous aident à concrétiser votre stratégie.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-xl font-bold mb-3">Comparateur SCPI</h3>
        <p class="text-blue-100 mb-4">
          Comparez 51 SCPI : rendements, secteurs, zones géographiques, frais. Trouvez les SCPI adaptées à votre profil.
        </p>
        <button class="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
          Accéder au comparateur
        </button>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="text-4xl mb-4">💻</div>
        <h3 class="text-xl font-bold mb-3">Simulateur Fonds euros → SCPI</h3>
        <p class="text-blue-100 mb-4">
          Simulez l'impact d'un arbitrage de votre fonds euros vers des SCPI sur 10, 15 ou 20 ans.
        </p>
        <button class="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
          Lancer une simulation
        </button>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="text-4xl mb-4">👨‍💼</div>
        <h3 class="text-xl font-bold mb-3">Rendez-vous avec un CGP</h3>
        <p class="text-blue-100 mb-4">
          Échangez gratuitement 30 minutes en visio avec un conseiller spécialisé SCPI pour un diagnostic personnalisé.
        </p>
        <button class="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
          Prendre rendez-vous
        </button>
      </div>
    </div>
  </div>
</section>

<div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
    <strong>Important :</strong> Les SCPI sont des placements à long terme dont le capital n'est pas garanti. Les performances passées ne préjugent pas des performances futures. Les informations présentées dans cet article sont fournies à titre pédagogique et ne constituent pas un conseil en investissement personnalisé. Consultez un professionnel pour une recommandation adaptée à votre situation.
  </p>
</div>
`;
}

/**
 * Échappe les caractères HTML spéciaux dans le texte
 * IMPORTANT: Utiliser cette fonction pour tout texte contenant <, >, &, etc.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Estime le nombre de mots dans le HTML généré
 */
function estimateWordCount(html: string): number {
  // Retire les balises HTML et compte les mots
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').length;
}
