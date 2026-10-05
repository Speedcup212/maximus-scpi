import React from 'react';
import { Calculator, CheckCircle2, Clock, PieChart, Target, User } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '../utils/seoOptimizer';
import { getTemplateBySlug, ArticleTemplate } from '../data/articleTemplatesConfig';
import { generateRichArticleContent } from '../utils/richArticleContentGenerator';

interface DynamicArticlePageProps {
  slug: string;
}

const DynamicArticlePage: React.FC<DynamicArticlePageProps> = ({ slug }) => {
  const template = getTemplateBySlug(slug);

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article non trouvé</h1>
          <a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    'strategies-patrimoniales': 'Stratégies patrimoniales SCPI',
    'fiscalite-modes': 'Fiscalité et modes de détention',
    'analyse-criteres': 'Critères d\'analyse SCPI',
    'risques-vigilance': 'Risques, liquidité et vigilance',
    'gestionnaires-acteurs': 'Gestionnaires & acteurs SCPI',
    'scpi-societes-gestion': 'Sociétés de gestion SCPI',
    'comparatifs': 'Comparatifs SCPI',
    'fiscalite': 'Fiscalité SCPI',
    'strategies': 'Stratégies SCPI',
    'guides': 'Guides SCPI',
  };
  const displayCategory = categoryLabels[template.category] || template.category;

  const richSections = generateRichArticleContent(template);
  const useRichContent = Boolean(richSections && richSections.length > 0);
  const articleContent = useRichContent ? { sections: [], faq: [] } : generateArticleContent(template);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://maximusscpi.com' },
    { name: 'Articles', url: 'https://maximusscpi.com/articles/' },
    { name: template.title, url: `https://maximusscpi.com/articles/${slug}/` },
  ]);

  const articleSchema = generateArticleSchema({
    headline: template.title,
    description: template.metaDescription,
    author: 'Éric Bellaiche',
    image: 'https://maximusscpi.com/images/eric-192.webp',
  });

  const schemaData = articleContent.faq.length > 0
    ? [generateFAQSchema(articleContent.faq), breadcrumbSchema, articleSchema]
    : [breadcrumbSchema, articleSchema];

  return (
    <>
      <SEOHead
        title={`${template.title} | MaximusSCPI`}
        description={template.metaDescription}
        keywords={template.keywords}
        canonical={`https://maximusscpi.com/articles/${slug}/`}
        schemaData={schemaData}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8" aria-label="Fil d'Ariane">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/articles/" className="hover:text-blue-600 dark:hover:text-blue-400">Articles</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">{template.title}</li>
          </ol>
        </nav>

        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
              {displayCategory}
            </span>
            {template.featured && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">
                Article pilier
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {template.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Éric Bellaiche, CGP-CIF</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.max(3, Math.ceil(template.wordCountTarget / 200))} min de lecture estimées</span>
            </div>
          </div>
        </header>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          {useRichContent ? (
            richSections.map(section => {
              const Icon = section.icon;
              return (
                <section key={section.id} className="mb-16">
                  {section.title && (
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      {Icon && <Icon className="w-8 h-8 text-blue-600" />}
                      {section.title}
                    </h2>
                  )}
                  {section.content}
                </section>
              );
            })
          ) : (
            articleContent.sections.map((section, idx) => (
              <div key={idx} className="mb-12">
                {section.content}
              </div>
            ))
          )}
        </article>

        <div className="my-16 bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Comparer avant de décider</h2>
          <p className="text-xl mb-6 text-blue-100 max-w-2xl mx-auto">
            Utilise les données, la trajectoire et les signaux de vigilance avant toute souscription. Une analyse personnalisée peut ensuite intégrer ta situation patrimoniale et fiscale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/comparateur-scpi/"
              className="bg-white text-blue-700 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <PieChart className="w-5 h-5" />
              Comparer les SCPI
            </a>
            <a
              href="/simulateur-enveloppes/"
              className="bg-purple-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-purple-600 transition-all border-2 border-white/30 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Comparer les modes de détention
            </a>
          </div>
        </div>

        {articleContent.faq.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              {articleContent.faq.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{faq.question}</span>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <SemanticLinks
          currentPage={`/articles/${slug}`}
          links={getSemanticLinks(`/articles/${slug}`)}
          title="Poursuivez votre analyse des SCPI"
        />
      </div>
    </>
  );
};

function generateArticleContent(template: ArticleTemplate) {
  const sections: { content: JSX.Element }[] = [];
  const faq: { question: string; answer: string }[] = [];

  sections.push({
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {generateIntro(template)}
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
            Ce que cette analyse doit permettre de vérifier :
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
            {generateKeyPoints(template).map((point, idx) => (
              <li key={idx}>• {point}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  });

  if (template.category === 'comparatifs') {
    sections.push(generateComparativeSection());
  } else if (template.category === 'fiscalite' || template.category === 'fiscalite-modes') {
    sections.push(generateFiscalitySection());
  } else if (template.category === 'strategies' || template.category === 'strategies-patrimoniales') {
    sections.push(generateStrategySection());
  } else {
    sections.push(generateGuideSection());
  }

  faq.push(...generateDynamicFAQ());

  return { sections, faq };
}

function generateIntro(template: ArticleTemplate): string {
  const intros: Record<string, string> = {
    'scpi-direct-ou-assurance-vie':
      "Comparer la détention directe et l'assurance-vie exige de distinguer fiscalité courante, frais du contrat, quote-part de distribution réellement créditée, liquidité, IFI éventuel et fiscalité du rachat. Aucun mode de détention n'est systématiquement supérieur.",
    'scpi-credit-effet-levier-2025':
      "L'effet de levier dépend du coût total du crédit, du niveau et de la variabilité des distributions, de la fiscalité réellement applicable, des garanties et du cash-flow. La déductibilité éventuelle de certaines charges ne suffit pas à rendre l'opération rentable.",
    'scpi-demembrement-strategie-retraite':
      "Le démembrement temporaire doit être analysé à partir de la clé de répartition, des distributions abandonnées pendant la nue-propriété, de l'horizon, de la liquidité et du traitement fiscal correspondant à la situation réelle.",
    default:
      `Cette analyse répond à la recherche « ${template.mainKeyword} » en distinguant les données observables, les risques, les hypothèses et les points qui doivent être vérifiés avant toute décision.`,
  };

  return intros[template.slug] || intros.default;
}

function generateKeyPoints(template: ArticleTemplate): string[] {
  return [
    `Intention de recherche : ${template.searchIntent}`,
    `Public concerné : ${template.targetAudience}`,
    'Données à vérifier dans les documents officiels et les dernières publications',
    'Risques, liquidité, frais et trajectoire à croiser avec le rendement',
    'Fiscalité à calculer selon les flux réels et le mode de détention',
  ];
}

function generateComparativeSection() {
  const rows = [
    ['Rendement', 'Comparer la distribution observée', 'Vérifier sa régularité et la variation du prix de part'],
    ['Frais', 'Comparer les frais réellement supportés', 'Inclure frais du support, de l’enveloppe et du financement éventuel'],
    ['Liquidité', 'Comparer le mécanisme de sortie', 'La revente n’est garantie ni en délai ni en prix'],
    ['Risque', 'Comparer patrimoine, dette et locataires', 'Éviter un classement fondé sur un seul indicateur'],
    ['Fiscalité', 'Comparer le net du dossier', 'Traiter les flux par nature, pays et mode de détention'],
  ];

  return {
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <PieChart className="w-8 h-8 text-blue-600" />
          Comparer sur une base homogène
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left p-4 font-bold bg-gray-100 dark:bg-gray-700">Critère</th>
                <th className="text-left p-4 font-bold bg-blue-50 dark:bg-blue-900/30">Ce qu'il faut comparer</th>
                <th className="text-left p-4 font-bold bg-green-50 dark:bg-green-900/30">Vigilance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map(([criterion, compare, vigilance]) => (
                <tr key={criterion}>
                  <td className="p-4 font-semibold">{criterion}</td>
                  <td className="p-4">{compare}</td>
                  <td className="p-4">{vigilance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  };
}

function generateFiscalitySection() {
  const cards = [
    {
      title: 'Revenus français en direct',
      text: 'Identifier la base imposable, les charges déductibles éventuelles, le barème applicable et les prélèvements sociaux en vigueur.',
    },
    {
      title: 'Revenus étrangers',
      text: 'Ventiler les revenus pays par pays et appliquer la convention fiscale correspondante. Il n’existe pas de fiscalité européenne unique.',
    },
    {
      title: 'Enveloppes et démembrement',
      text: 'Assurance-vie, nue-propriété ou société modifient la chronologie et parfois la nature de l’imposition. Les frais et l’IFI éventuel doivent être intégrés.',
    },
  ];

  return {
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Fiscalité : raisonner flux par flux
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.title} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{card.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{card.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          La TMI est un taux marginal : elle ne doit pas être appliquée mécaniquement à tous les flux ni servir de filtre géographique automatique.
        </p>
      </div>
    ),
  };
}

function generateStrategySection() {
  const steps = [
    ['Objectif', 'Définir le besoin de revenu, la durée d’investissement et la perte temporaire acceptable.'],
    ['Sélection', 'Comparer les supports sur les fondamentaux, la liquidité et la trajectoire avant la fiscalité.'],
    ['Allocation', 'Limiter les concentrations par SCPI, gestionnaire, secteur, pays et type de risque.'],
    ['Suivi', 'Réévaluer l’allocation lorsque les valeurs, la liquidité, le TOF ou l’endettement changent significativement.'],
  ];

  return {
    content: (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-600" />
          Construire une stratégie sans allocation automatique
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {steps.map(([title, text]) => (
            <div key={title} className="bg-white dark:bg-gray-800 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  };
}

function generateGuideSection() {
  const steps = [
    { title: 'Étape 1 : définir le besoin', desc: 'Objectif, horizon, liquidité nécessaire et capacité de perte.' },
    { title: 'Étape 2 : vérifier les données', desc: 'Documents officiels, période de référence, chiffres manquants et sources.' },
    { title: 'Étape 3 : analyser les risques', desc: 'Patrimoine, TOF, baux, dette, valeurs, collecte et retraits.' },
    { title: 'Étape 4 : comparer les scénarios', desc: 'Hypothèses cohérentes de rendement, frais, fiscalité et sortie.' },
    { title: 'Étape 5 : suivre la trajectoire', desc: 'Mettre à jour l’analyse lorsque les données significatives changent.' },
  ];

  return {
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Méthode d'analyse : étape par étape
        </h2>
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };
}

function generateDynamicFAQ(): { question: string; answer: string }[] {
  return [
    {
      question: 'Le rendement d’une SCPI est-il garanti ?',
      answer: 'Non. Les distributions et la valeur des parts peuvent évoluer à la hausse comme à la baisse. Le taux de distribution historique doit être lu avec la trajectoire du prix de part, des valeurs et de la liquidité.',
    },
    {
      question: 'Quels frais faut-il comparer ?',
      answer: 'Les frais dépendent de la SCPI et du mode de détention. Il faut vérifier les documents du support et intégrer, selon le cas, les frais de souscription, de gestion, de cession, d’enveloppe et de financement.',
    },
    {
      question: 'Combien de SCPI faut-il détenir ?',
      answer: 'Il n’existe pas de nombre optimal universel. La diversification dépend du capital, des secteurs, des zones, des gestionnaires et des risques réellement différents dans le portefeuille.',
    },
    {
      question: 'La TMI suffit-elle pour choisir entre France et Europe ?',
      answer: 'Non. La TMI n’est qu’un élément du calcul fiscal. La qualité de la SCPI, les conventions fiscales, les frais, la liquidité et le mode de détention doivent être analysés séparément.',
    },
    {
      question: 'Comment vérifier les chiffres affichés ?',
      answer: 'Utilise en priorité les bulletins trimestriels, rapports annuels, DIC, notes d’information et données publiées par la société de gestion, en vérifiant toujours la période de référence.',
    },
  ];
}

export default DynamicArticlePage;
