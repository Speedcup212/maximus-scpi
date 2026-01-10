/**
 * Page d'article riche (1800-4000 mots)
 * Structure identique à FondsEurosScpiArticle mais dynamique
 */

import React from 'react';
import { User, Calendar, Clock, Calculator, PieChart, ArrowRight } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import Footer from './Footer';
import { CookieConsent } from './CookieConsent';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';
import { generateRichArticleContent } from '../utils/richArticleContentGenerator';

interface RichArticlePageProps {
  template: ArticleTemplate;
  onNavigateHome: () => void;
  onNavigateToFaq: () => void;
  onNavigateToAbout: () => void;
  onNavigateToUnderstanding: () => void;
  onContactClick: () => void;
  onSimulateurClick: (simulateurId: string) => void;
  onComparateurClick: () => void;
  onAnalyseActuClick?: () => void;
}

const RichArticlePage: React.FC<RichArticlePageProps> = ({
  template,
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onContactClick,
  onSimulateurClick,
  onComparateurClick,
  onAnalyseActuClick
}) => {
  // Générer le contenu riche
  const sections = generateRichArticleContent(template);

  // Si aucune section générée, utiliser l'article basique
  if (sections.length === 0) {
    // Retourner vers DynamicArticlePage ou afficher un message
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Article en cours de rédaction
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Le contenu enrichi pour cet article sera bientôt disponible.
          </p>
          <button
            onClick={onNavigateHome}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title={`${template.title} - Guide 2025`}
        description={template.metaDescription}
        keywords={template.keywords}
        canonical={`https://www.maximusscpi.com/${template.slug}`}
      />

      <Header
        isDarkMode={false}
        toggleTheme={() => {}}
        onContactClick={onContactClick}
        onAboutClick={onNavigateToAbout}
        onEducationClick={() => {}}
        onLogoClick={onNavigateHome}
        onScpiPageClick={() => {}}
        onFaqClick={onNavigateToFaq}
        onUnderstandingClick={onNavigateToUnderstanding}
        onAboutSectionClick={onNavigateToAbout}
        onComparateurClick={onComparateurClick}
        onSimulateurClick={onSimulateurClick}
        onAnalyseActuClick={onAnalyseActuClick}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
              {getCategoryLabel(template.category)}
            </span>
            {template.featured && (
              <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                Article pilier
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {template.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Éric Bellaiche, CGP</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Janvier 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.ceil(template.wordCountTarget / 200)} min de lecture</span>
            </div>
          </div>

          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            {template.metaDescription}
          </p>
        </div>

        {/* Article Sections */}
        {sections.map((section, idx) => {
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
        })}

        {/* CTA Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Passez à l'action : simulez votre stratégie patrimoniale
            </h2>
            <p className="text-lg text-center mb-8 text-blue-100">
              Vous souhaitez calculer précisément le gain fiscal et patrimonial d'une stratégie adaptée à votre situation ?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => onSimulateurClick('enveloppes')}
                className="bg-white text-blue-600 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Calculator className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Simulez votre allocation</h3>
                <p className="text-gray-700 mb-4">
                  Visualisez l'impact sur votre rendement net, votre fiscalité et votre patrimoine à 10 ans.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  Accéder au simulateur
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={onComparateurClick}
                className="bg-white text-blue-600 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <PieChart className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Comparer 50+ SCPI</h3>
                <p className="text-gray-700 mb-4">
                  Trouvez les meilleures SCPI selon votre profil de risque et vos objectifs.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  Accéder au comparateur
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Important :</strong> Les SCPI sont des placements à long terme dont le capital n'est pas garanti.
            Les performances passées ne préjugent pas des performances futures. Les informations présentées dans cet article
            sont fournies à titre pédagogique et ne constituent pas un conseil en investissement personnalisé. Consultez un
            professionnel pour une recommandation adaptée à votre situation.
          </p>
        </div>
      </article>

      <Footer />
      <CookieConsent />
    </div>
  );
};

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'comparatifs': 'Comparatif 2025',
    'fiscalite': 'Fiscalité',
    'strategies': 'Stratégie Patrimoniale',
    'marche': 'Analyse Marché',
    'guides': 'Guide Pratique'
  };
  return labels[category] || 'Guide Investissement';
}

export default RichArticlePage;
