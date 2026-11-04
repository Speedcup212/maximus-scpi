/**
 * Générateur d'articles enrichis SEO TOP 1
 * Chaque article : 1800-4000 mots, graphiques, camemberts, tableaux
 * Structure identique aux pages gestionnaires
 */

import { TrendingUp, CheckCircle, Euro, ArrowRight, Award, BarChart3, Target, PieChart, AlertTriangle, FileText, Zap } from 'lucide-react';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';
import PieChart3DInteractive from '../components/PieChart3DInteractive';

export interface EnrichedArticleContent {
  sections: ArticleSection[];
  faq: FAQItem[];
  charts: ChartData[];
  stats: StatBlock[];
  wordCount: number;
}

export interface ArticleSection {
  id: string;
  title: string;
  content: JSX.Element;
  hasChart?: boolean;
  hasPieChart?: boolean;
  hasTable?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChartData {
  type: 'growth' | 'pie' | 'comparison';
  title: string;
  data: any;
}

export interface StatBlock {
  label: string;
  value: string;
  change?: string;
  icon: any;
  color: string;
}

type DetailedIntro = { paragraph1: string; paragraph2: string; paragraph3: string; keyPoints: string[] };
type ComparisonData = {
  optionA: { name: string }; optionB: { name: string };
  rows: { criterion: string; valueA: string; valueB: string }[]; explanation: string;
};
type PieSectionData = {
  title: string; subtitle: string;
  data: { name: string; value: number; color: string }[];
  insights: string[];
};
type DeepAnalysisData = {
  title: string; subsections: {
    title: string; paragraphs: string[]; bulletPoints?: string[]; example?: string;
  }[];
};
type FiscalityData = {
  tmiExamples: { tmi: number; netReturn: string; annualNet: number }[];
  explanations: { title: string; content: string; calculation?: string }[];
};
type ArticleStrategy = { profile: string; description: string; action: string; example?: string };
type ArticleProsCons = { pros: string[]; cons: string[] };
type ExpertRecommendations = { mainAdvice: string; keyPoints: string[] };
type ArticleMistake = { title: string; description: string; solution: string };
type ArticleConclusion = { summary: string; finalThought: string; keyTakeaways: string[] };

/**
 * Génère un article enrichi complet avec graphiques et contenu long-form
 */
export function generateEnrichedArticle(template: ArticleTemplate): EnrichedArticleContent {
  const sections: ArticleSection[] = [];
  const faq: FAQItem[] = [];
  const charts: ChartData[] = [];
  const stats: StatBlock[] = [];

  // Section 1: Hero Stats (comme pages gestionnaires)
  sections.push(generateHeroStatsSection(template));

  // Section 2: Introduction détaillée (300-400 mots)
  sections.push(generateIntroductionSection(template));

  // Section 3: Graphique principal (rendement ou comparaison)
  sections.push(generateMainChartSection(template));

  // Section 4: Tableau comparatif détaillé
  sections.push(generateComparisonTableSection(template));

  // Section 5: Camembert répartition
  sections.push(generatePieChartSection(template));

  // Section 6: Analyse approfondie (500-700 mots)
  sections.push(generateDeepAnalysisSection(template));

  // Section 7: Fiscalité détaillée avec exemples chiffrés
  sections.push(generateFiscalitySection(template));

  // Section 8: Stratégies concrètes selon profil
  sections.push(generateStrategiesSection(template));

  // Section 9: Avantages & Inconvénients
  sections.push(generateProsConsSection(template));

  // Section 10: Recommandations d'expert
  sections.push(generateExpertRecommendationsSection(template));

  // Section 11: Erreurs à éviter
  sections.push(generateMistakesSection(template));

  // Section 12: Conclusion avec call-to-action
  sections.push(generateConclusionSection(template));

  // FAQ (10-15 questions)
  faq.push(...generateComprehensiveFAQ(template));

  const wordCount = estimateWordCount(sections);

  return { sections, faq, charts, stats, wordCount };
}

/**
 * Section Hero avec statistiques clés
 */
function generateHeroStatsSection(template: ArticleTemplate): ArticleSection {
  const stats = getKeyStatsForTemplate(template);

  return {
    id: 'hero-stats',
    title: '',
    content: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className={`inline-flex p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 mb-3`}>
                <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
              {stat.change && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  };
}

/**
 * Introduction détaillée (300-400 mots)
 */
function generateIntroductionSection(template: ArticleTemplate): ArticleSection {
  const intro = getDetailedIntro(template);

  return {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 mb-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
            {intro.paragraph1}
          </p>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
            {intro.paragraph2}
          </p>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {intro.paragraph3}
          </p>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Ce que vous allez découvrir dans ce guide
            </h3>
            <ul className="space-y-3">
              {intro.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  };
}

/**
 * Section graphique principal (Growth Chart)
 */
function generateMainChartSection(_template: ArticleTemplate): ArticleSection {
  // The article configuration provides no authenticated historical financial
  // series. Never show a synthetic 2015–2025 growth chart as issuer evidence.
  return {
    id: 'main-chart',
    title: 'Historique des rendements',
    hasChart: false,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Historique des rendements
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Aucune série historique financière vérifiée n'est disponible pour cet article.
          Les performances ne sont pas estimées ou reconstituées sans source officielle.
        </p>
      </div>
    )
  };
}

/**
 * Tableau comparatif détaillé
 */
function generateComparisonTableSection(template: ArticleTemplate): ArticleSection {
  const comparison = getComparisonData(template);

  return {
    id: 'comparison-table',
    title: 'Tableau comparatif détaillé',
    hasTable: true,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-600" />
          Comparaison critère par critère
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">
                  Critère
                </th>
                <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                  {comparison.optionA.name}
                </th>
                <th className="text-center p-4 font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30">
                  {comparison.optionB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">
                    {row.criterion}
                  </td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                    {row.valueA}
                  </td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                    {row.valueB}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 Lecture du tableau :</strong> {comparison.explanation}
          </p>
        </div>
      </div>
    )
  };
}

/**
 * Section Camembert répartition
 */
function generatePieChartSection(template: ArticleTemplate): ArticleSection {
  const pieData = getPieChartData(template);

  return {
    id: 'pie-chart',
    title: pieData.title,
    hasPieChart: true,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <PieChart className="w-8 h-8 text-green-600" />
          {pieData.title}
        </h2>
        {pieData.data.length > 0 ? (
          <PieChart3DInteractive data={pieData.data} />
        ) : (
          <p className="text-sm text-gray-500">
            Aucune donnée de répartition officielle vérifiée disponible.
          </p>
        )}
        {pieData.subtitle && <p className="text-sm text-gray-500">{pieData.subtitle}</p>}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pieData.insights.map((insight, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };
}

/**
 * Analyse approfondie (500-700 mots)
 */
function generateDeepAnalysisSection(template: ArticleTemplate): ArticleSection {
  const analysis = getDeepAnalysis(template);

  return {
    id: 'deep-analysis',
    title: 'Analyse approfondie',
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Analyse détaillée : {analysis.title}
        </h2>

        {analysis.subsections.map((subsection, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowRight className="w-6 h-6 text-blue-600" />
              {subsection.title}
            </h3>

            {subsection.paragraphs.map((paragraph, pIdx) => (
              <p key={pIdx} className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                {paragraph}
              </p>
            ))}

            {subsection.bulletPoints && (
              <ul className="space-y-2 ml-6 mb-4">
                {subsection.bulletPoints.map((point, bIdx) => (
                  <li key={bIdx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {subsection.example && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mt-4 border-l-4 border-blue-500">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  📊 Exemple concret :
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {subsection.example}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  };
}

/**
 * Section fiscalité avec exemples chiffrés
 */
function generateFiscalitySection(template: ArticleTemplate): ArticleSection {
  const fiscalData = getFiscalityData(template);

  return {
    id: 'fiscality',
    title: 'Fiscalité détaillée avec exemples',
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Euro className="w-8 h-8 text-green-600" />
          Fiscalité : combien allez-vous payer ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {fiscalData.tmiExamples.map((example, idx) => (
            <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                TMI {example.tmi}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {example.netReturn}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Rendement net après impôts
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 text-xs text-gray-600 dark:text-gray-400">
                Sur 10 000€ investis : <strong>{example.annualNet}€/an</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {fiscalData.explanations.map((explanation, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-6">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">
                {explanation.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                {explanation.content}
              </p>
              {explanation.calculation && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 font-mono text-sm">
                  {explanation.calculation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  };
}

/**
 * Stratégies concrètes selon profil
 */
function generateStrategiesSection(template: ArticleTemplate): ArticleSection {
  const strategies = getStrategiesForTemplate(template);

  return {
    id: 'strategies',
    title: 'Stratégies recommandées selon votre profil',
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-600" />
          Quelle stratégie adopter ?
        </h2>

        <div className="space-y-6">
          {strategies.map((strategy, idx) => (
            <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {strategy.profile}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {strategy.description}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      💡 Action recommandée :
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {strategy.action}
                    </p>
                  </div>
                  {strategy.example && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                      Exemple : {strategy.example}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };
}

/**
 * Avantages & Inconvénients
 */
function generateProsConsSection(template: ArticleTemplate): ArticleSection {
  const prosCons = getProsConsForTemplate(template);

  return {
    id: 'pros-cons',
    title: 'Avantages et inconvénients',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-xl p-8 border-2 border-green-200 dark:border-green-800">
          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-6 flex items-center gap-2">
            <CheckCircle className="w-7 h-7" />
            Avantages
          </h3>
          <ul className="space-y-4">
            {prosCons.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-xl p-8 border-2 border-red-200 dark:border-red-800">
          <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7" />
            Inconvénients
          </h3>
          <ul className="space-y-4">
            {prosCons.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  };
}

/**
 * Recommandations d'expert
 */
function generateExpertRecommendationsSection(template: ArticleTemplate): ArticleSection {
  const recommendations = getExpertRecommendations(template);

  return {
    id: 'expert-recommendations',
    title: 'L\'avis de notre expert CGP',
    content: (
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl shadow-2xl p-8 mb-12 text-white">
        <div className="flex items-start gap-6 mb-6">
          <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">
              L'avis d'Éric Bellaiche, CGP ORIAS
            </h2>
            <p className="text-blue-100 dark:text-blue-200">
              Analyse pédagogique et présentation des risques, sans recommandation personnalisée
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <p className="text-lg leading-relaxed mb-4">
            {recommendations.mainAdvice}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-3">Mes 3 recommandations clés :</h3>
          {recommendations.keyPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <p className="text-white/90 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    )
  };
}

/**
 * Erreurs à éviter
 */
function generateMistakesSection(template: ArticleTemplate): ArticleSection {
  const mistakes = getCommonMistakes(template);

  return {
    id: 'mistakes',
    title: 'Erreurs à éviter absolument',
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Les 5 erreurs les plus fréquentes
        </h2>

        <div className="space-y-6">
          {mistakes.map((mistake, idx) => (
            <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                  ❌
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                    Erreur #{idx + 1} : {mistake.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {mistake.description}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      ✅ Solution :
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {mistake.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };
}

/**
 * Conclusion avec CTA
 */
function generateConclusionSection(template: ArticleTemplate): ArticleSection {
  const conclusion = getConclusionForTemplate(template);

  return {
    id: 'conclusion',
    title: 'Conclusion',
    content: (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          En résumé
        </h2>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
            {conclusion.summary}
          </p>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {conclusion.finalThought}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Points clés à retenir
          </h3>
          <ul className="space-y-2">
            {conclusion.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  };
}

/**
 * FAQ complète (10-15 questions)
 */
function generateComprehensiveFAQ(template: ArticleTemplate): FAQItem[] {
  // Cette fonction retournera une FAQ complète basée sur le template
  // Elle sera implémentée avec des questions spécifiques à chaque article
  return generateFAQForTemplate(template);
}

/**
 * Estime le nombre de mots total
 */
function estimateWordCount(sections: ArticleSection[]): number {
  // Estimation basée sur le nombre de sections et leur contenu
  // Chaque section contient environ 200-400 mots
  return sections.length * 250; // Moyenne de 250 mots par section
}

// Fonctions helpers (à implémenter avec les données réelles)
function getKeyStatsForTemplate(_template: ArticleTemplate): StatBlock[] {
  // Retourne les stats clés selon l'article
  return [];
}

function getDetailedIntro(_template: ArticleTemplate): DetailedIntro {
  // Retourne l'introduction détaillée
  return {
    paragraph1: '',
    paragraph2: '',
    paragraph3: '',
    keyPoints: []
  };
}


function getComparisonData(_template: ArticleTemplate): ComparisonData {
  return {
    optionA: { name: '' },
    optionB: { name: '' },
    rows: [],
    explanation: ''
  };
}

function getPieChartData(_template: ArticleTemplate): PieSectionData {
  return {
    title: '',
    subtitle: '',
    data: [],
    insights: []
  };
}

function getDeepAnalysis(_template: ArticleTemplate): DeepAnalysisData {
  return {
    title: '',
    subsections: []
  };
}

function getFiscalityData(_template: ArticleTemplate): FiscalityData {
  return {
    tmiExamples: [],
    explanations: []
  };
}

function getStrategiesForTemplate(_template: ArticleTemplate): ArticleStrategy[] {
  return [];
}

function getProsConsForTemplate(_template: ArticleTemplate): ArticleProsCons {
  return {
    pros: [],
    cons: []
  };
}

function getExpertRecommendations(_template: ArticleTemplate): ExpertRecommendations {
  return {
    mainAdvice: '',
    keyPoints: []
  };
}

function getCommonMistakes(_template: ArticleTemplate): ArticleMistake[] {
  return [];
}

function getConclusionForTemplate(_template: ArticleTemplate): ArticleConclusion {
  return {
    summary: '',
    finalThought: '',
    keyTakeaways: []
  };
}

function generateFAQForTemplate(_template: ArticleTemplate): FAQItem[] {
  return [];
}
