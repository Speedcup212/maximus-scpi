import React from 'react';
import { ArrowLeft, Calendar, User, Clock, TrendingUp, Shield, Calculator, AlertTriangle, CheckCircle2, PieChart, Target, Download, Phone } from 'lucide-react';
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

  // Essayer d'abord le contenu riche, sinon utiliser le contenu générique
  const richSections = generateRichArticleContent(template);
  const useRichContent = richSections && richSections.length > 0;

  // Génération du contenu basé sur le template (contenu générique)
  const articleContent = useRichContent ? { sections: [], faq: [] } : generateArticleContent(template);

  const faqSchema = generateFAQSchema(articleContent.faq);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://www.maximusscpi.com' },
    { name: 'Articles', url: 'https://www.maximusscpi.com/#articles' },
    { name: template.title, url: `https://www.maximusscpi.com/${slug}` }
  ]);
  const articleSchema = generateArticleSchema({
    headline: template.title,
    description: template.metaDescription,
    author: 'Éric Bellaiche',
    datePublished: '2025-01-20',
    dateModified: '2025-01-20',
    image: 'https://www.maximusscpi.com/images/eric-192.webp'
  });

  return (
    <>
      <SEOHead
        title={`${template.title} | MaximusSCPI`}
        description={template.metaDescription}
        keywords={template.keywords}
        canonical={`https://www.maximusscpi.com/${slug}`}
        structuredData={[faqSchema, breadcrumbSchema, articleSchema]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">{template.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
              {template.category}
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
              <span>Éric Bellaiche, CGP</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>20 janvier 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.ceil(template.wordCountTarget / 200)} min de lecture</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {useRichContent ? (
            // Afficher le contenu riche
            richSections.map((section, idx) => {
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
            // Afficher le contenu générique
            articleContent.sections.map((section, idx) => (
              <div key={idx} className="mb-12">
                {section.content}
              </div>
            ))
          )}
        </article>

        {/* CTA Section */}
        <div className="my-16 bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Besoin d'un conseil personnalisé ?</h2>
          <p className="text-xl mb-6 text-blue-100 max-w-2xl mx-auto">
            Nos conseillers certifiés ORIAS analysent votre situation et vous proposent une stratégie SCPI adaptée à votre profil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/comparateur-scpi"
              className="bg-white text-blue-700 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <PieChart className="w-5 h-5" />
              Comparer 50+ SCPI
            </a>
            <a
              href="/simulateur-enveloppes"
              className="bg-purple-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-purple-600 transition-all border-2 border-white/30 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Simuler mon allocation
            </a>
          </div>
        </div>

        {/* FAQ Section */}
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

        {/* Semantic Links */}
        <SemanticLinks
          currentPage={`/${slug}`}
          links={getSemanticLinks(`/${slug}`)}
          title="Poursuivez votre découverte des SCPI"
        />
      </div>
    </>
  );
};

// Fonction de génération de contenu dynamique
function generateArticleContent(template: ArticleTemplate) {
  const sections: { content: JSX.Element }[] = [];
  const faq: { question: string; answer: string }[] = [];

  // Section 1: Introduction avec mise en contexte
  sections.push({
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {generateIntro(template)}
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
            🎯 Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
            {generateKeyPoints(template).map((point, idx) => (
              <li key={idx}>• {point}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  });

  // Sections spécifiques selon le type d'article
  if (template.category === 'comparatifs') {
    sections.push(generateComparativeSection(template));
  } else if (template.category === 'fiscalite') {
    sections.push(generateFiscalitySection(template));
  } else if (template.category === 'strategies') {
    sections.push(generateStrategySection(template));
  } else if (template.category === 'guides') {
    sections.push(generateGuideSection(template));
  }

  // FAQ générées dynamiquement
  faq.push(...generateDynamicFAQ(template));

  return { sections, faq };
}

// Génération d'introduction contextuelle
function generateIntro(template: ArticleTemplate): string {
  const intros: Record<string, string> = {
    'scpi-direct-ou-assurance-vie': 'Janvier 2025 : vous hésitez entre souscrire des SCPI en direct ou les loger dans votre contrat d\'assurance-vie. La différence fiscale peut représenter plusieurs milliers d\'euros sur 15 ans. Les SCPI en direct offrent 5% de rendement brut, mais subissent l\'IR + 17,2% de PS. En assurance-vie, les revenus capitalisent sans fiscalité annuelle, mais les frais de contrat réduisent le rendement net.',
    'scpi-credit-effet-levier-2025': 'Avec des taux de crédit immobilier autour de 3,5% en janvier 2025, l\'effet de levier sur les SCPI reste-t-il pertinent ? Si vous empruntez 100 000€ à 3,5% sur 15 ans pour acheter des SCPI rendant 5%, votre cash-flow initial est négatif (-350€/mois). Mais à TMI 30-41%, la déductibilité des intérêts change la donne.',
    'scpi-demembrement-strategie-retraite': 'Vous avez 45 ans et visez une retraite complémentaire à 60 ans. Le démembrement de SCPI permet d\'acheter la nue-propriété avec 25% de décote, puis de récupérer l\'usufruit gratuitement dans 15 ans. Sur 100 000€ investis en nue-propriété, vous récupérez un flux de 5 000€/an de loyers à la retraite, sans impôt pendant 15 ans.',
    default: `En ${new Date().getFullYear()}, la question "${template.mainKeyword}" revient constamment chez les épargnants. Avec des fonds euros à 2% et des SCPI entre 5% et 11%, l'écart de rendement justifie-t-il de prendre plus de risque ?`
  };

  return intros[template.slug] || intros.default;
}

// Génération des points clés
function generateKeyPoints(template: ArticleTemplate): string[] {
  return [
    `Analyse complète : ${template.searchIntent}`,
    `Profil cible : ${template.targetAudience}`,
    `Chiffres réels 2025 : rendements, fiscalité, frais`,
    `Stratégies concrètes selon votre situation`,
    `FAQ avec réponses d'expert CGP ORIAS`
  ];
}

// Section comparative
function generateComparativeSection(template: ArticleTemplate) {
  return {
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <PieChart className="w-8 h-8 text-blue-600" />
          Tableau comparatif détaillé
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">Critère</th>
                <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">Option A</th>
                <th className="text-center p-4 font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">Option B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Rendement brut 2025</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">2,0%</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">5,0% - 11%</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Frais d'entrée</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">2%</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">8-12%</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Frais de gestion</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">0,8%/an</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">8-12% HT inclus</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  };
}

// Section fiscalité
function generateFiscalitySection(template: ArticleTemplate) {
  return {
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Impact de la fiscalité selon votre TMI
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3">TMI 11%</h3>
            <p className="text-sm text-green-800 dark:text-green-300">
              Fiscalité totale : 28,2%<br/>
              Rendement net SCPI 5% : <strong>3,59%</strong><br/>
              Rendement net SCPI 11% : <strong>7,91%</strong>
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3">TMI 30%</h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Fiscalité totale : 47,2%<br/>
              Rendement net SCPI 5% : <strong>2,64%</strong><br/>
              Rendement net SCPI 11% : <strong>5,81%</strong>
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-l-4 border-orange-500">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3">TMI 41%</h3>
            <p className="text-sm text-orange-800 dark:text-orange-300">
              Fiscalité totale : 58,2%<br/>
              Rendement net SCPI 5% : <strong>2,09%</strong><br/>
              Rendement net SCPI 11% : <strong>4,60%</strong>
            </p>
          </div>
        </div>
      </div>
    )
  };
}

// Section stratégie
function generateStrategySection(template: ArticleTemplate) {
  return {
    content: (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-600" />
          Stratégie recommandée
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Allocation optimale</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Fonds euros (sécurité)</span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">30-50%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">SCPI (performance)</span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">50-70%</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Rendement net global estimé</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2,5% à 4,5%</div>
            </div>
          </div>
        </div>
      </div>
    )
  };
}

// Section guide
function generateGuideSection(template: ArticleTemplate) {
  return {
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Mode d'emploi : étape par étape
        </h2>
        <div className="space-y-6">
          {[
            { title: 'Étape 1 : Analyser votre situation', desc: 'Patrimoine, TMI, objectifs, horizon de placement' },
            { title: 'Étape 2 : Définir votre allocation', desc: 'Répartition fonds euros / SCPI selon profil de risque' },
            { title: 'Étape 3 : Sélectionner les SCPI', desc: 'Diversification secteurs, zones géographiques, gestionnaires' },
            { title: 'Étape 4 : Arbitrer progressivement', desc: 'Par paliers de 20-30% pour lisser le risque' },
            { title: 'Étape 5 : Suivre et ajuster', desc: 'Réévaluation annuelle, réallocation si nécessaire' }
          ].map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start">
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
    )
  };
}

// Génération FAQ dynamique
function generateDynamicFAQ(template: ArticleTemplate): { question: string; answer: string }[] {
  const baseFAQ = [
    {
      question: `Quel est le rendement réel des SCPI en 2025 ?`,
      answer: `Les SCPI françaises affichent un rendement brut moyen de 5,0% en 2025, tandis que les SCPI européennes atteignent 6,5% à 11%. Après fiscalité (TMI + 17,2% de prélèvements sociaux), le rendement net varie de 2,09% (TMI 41%) à 3,59% (TMI 11%) pour une SCPI à 5%, et jusqu'à 7,91% (TMI 11%) pour une SCPI européenne à 11%.`
    },
    {
      question: `Quels sont les frais à prévoir ?`,
      answer: `Les SCPI comportent 8 à 12% de frais de souscription TTC, puis 8 à 12% HT de frais de gestion annuels (déjà déduits du rendement annoncé). Les fonds euros ont 2% de frais d'entrée et 0,8%/an de frais de gestion. En assurance-vie, ajoutez 0,5-1% de frais de contrat.`
    },
    {
      question: `Quel est le risque de perte en capital ?`,
      answer: `Les SCPI ne garantissent pas le capital. Historiquement, les baisses de prix de part ont été de -8% en 2008-2009 et -5% en 2020. Sur 15-20 ans, les SCPI bien gérées ont toujours retrouvé et dépassé leur valeur initiale. Il faut un horizon minimum de 8-10 ans pour lisser le risque immobilier.`
    },
    {
      question: `Comment diversifier mon portefeuille SCPI ?`,
      answer: `Une diversification optimale comprend 3 à 5 SCPI différentes : 40% bureaux France, 30% commerces/santé France, 30% diversifiées Europe. Privilégiez des SCPI avec TOF > 95%, capitalisation > 500M€, et historique > 10 ans. Répartissez sur plusieurs gestionnaires (Primonial, Perial, Atland, etc.).`
    },
    {
      question: `Quelle allocation fonds euros / SCPI selon mon profil ?`,
      answer: `Profil prudent (60+ ans) : 70-80% fonds euros, 20-30% SCPI. Profil équilibré (40-60 ans) : 50% fonds euros, 50% SCPI. Profil dynamique (25-40 ans) : 20-30% fonds euros, 70-80% SCPI. L'allocation dépend aussi de votre TMI, horizon de placement, et besoin de liquidité.`
    }
  ];

  return baseFAQ;
}

export default DynamicArticlePage;
