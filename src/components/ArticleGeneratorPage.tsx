import React, { useState } from 'react';
import { FileText, Download, Eye, Check, Clock, Zap } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import Footer from './Footer';
import { CookieConsent } from './CookieConsent';
import { articleTemplates, getTemplateById, ArticleTemplate } from '../data/articleTemplatesConfig';
import { generateArticleContent } from '../utils/articleGenerator';
import { supabase } from '../supabaseClient';

interface ArticleGeneratorPageProps {
  onNavigateHome: () => void;
  onNavigateToFaq: () => void;
  onNavigateToAbout: () => void;
  onNavigateToUnderstanding: () => void;
  onContactClick: () => void;
  onReviewsClick: () => void;
  onSimulateurClick: (simulateurId: string) => void;
  onComparateurClick: () => void;
  onAnalyseActuClick: () => void;
}

const ArticleGeneratorPage: React.FC<ArticleGeneratorPageProps> = ({
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onContactClick,
  onReviewsClick,
  onSimulateurClick,
  onComparateurClick,
  onAnalyseActuClick
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateArticle = async (articleId: number) => {
    const template = getTemplateById(articleId);
    if (!template) return;

    setIsGenerating(true);
    setSelectedArticleId(articleId);

    try {
      // Simulation d'un délai de génération pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const content = generateArticleContent(template);
      setGeneratedContent(content.html);
      setShowPreview(true);
    } catch (error) {
      console.error('Erreur génération article:', error);
      alert('Erreur lors de la génération de l\'article');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToSupabase = async () => {
    if (!selectedArticleId || !generatedContent) return;

    const template = getTemplateById(selectedArticleId);
    if (!template) return;

    setIsSaving(true);

    try {
      const content = generateArticleContent(template);

      const { error } = await supabase
        .from('articles_generated')
        .upsert({
          article_id: template.id,
          slug: template.slug,
          title: template.title,
          meta_description: template.metaDescription,
          keywords: template.keywords,
          category: template.category,
          content: content.html,
          word_count: content.wordCount,
          read_time: content.readTime,
          main_keyword: template.mainKeyword,
          search_intent: template.searchIntent,
          target_audience: template.targetAudience,
          featured: template.featured || false,
          status: 'draft',
          published_at: null,
          generated_at: new Date().toISOString()
        }, {
          onConflict: 'article_id'
        });

      if (error) throw error;

      setSavedArticleIds(prev => new Set(prev).add(template.id));
      alert(`Article "${template.title}" sauvegardé avec succès !`);
    } catch (error) {
      console.error('Erreur sauvegarde Supabase:', error);
      alert('Erreur lors de la sauvegarde de l\'article');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!generatedContent || !selectedArticleId) return;

    const template = getTemplateById(selectedArticleId);
    if (!template) return;

    const blob = new Blob([generatedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'comparatifs': 'blue',
      'fiscalite': 'green',
      'strategies': 'orange',
      'marche': 'purple',
      'guides': 'cyan'
    };
    return colors[category] || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Générateur d'Articles SEO - MaximusSCPI Admin"
        description="Interface de génération automatique des 30 articles SEO MaximusSCPI"
        keywords="générateur, articles, SEO, admin"
        canonical="https://www.maximusscpi.com/admin/article-generator"
      />

      <Header
        isDarkMode={false}
        toggleTheme={() => {}}
        onContactClick={onContactClick}
        onAboutClick={onNavigateToAbout}
        onReviewsClick={onReviewsClick}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold mb-4">
            🤖 Générateur Automatique
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Générateur d'Articles SEO
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Générez les 30 articles SEO MaximusSCPI en un clic
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">{articleTemplates.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Articles configurés</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600">{savedArticleIds.size}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Articles sauvegardés</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-orange-600">
              {articleTemplates.filter(t => t.featured).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Articles piliers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">
              {articleTemplates.reduce((sum, t) => sum + t.wordCountTarget, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mots au total</div>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {articleTemplates.map((template) => {
            const color = getCategoryColor(template.category);
            const isSaved = savedArticleIds.has(template.id);
            const isSelected = selectedArticleId === template.id;

            return (
              <div
                key={template.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-4 ring-blue-200'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-${color}-600">{template.id}</span>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold text-${color}-600 uppercase`}>
                        {template.category}
                      </div>
                      {template.featured && (
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded mt-1">
                          ⭐ PILIER
                        </span>
                      )}
                    </div>
                  </div>
                  {isSaved && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <Check className="w-4 h-4" />
                      Sauvegardé
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {template.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {template.wordCountTarget.toLocaleString()} mots
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.ceil(template.wordCountTarget / 200)} min
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Mot-clé principal
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {template.mainKeyword}
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateArticle(template.id)}
                  disabled={isGenerating && selectedArticleId === template.id}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating && selectedArticleId === template.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Générer l'article
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview */}
        {showPreview && generatedContent && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Prévisualisation de l'article
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadHTML}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger HTML
                </button>
                <button
                  onClick={handleSaveToSupabase}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Sauvegarder dans Supabase
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
          </div>
        )}
      </div>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default ArticleGeneratorPage;
