import React, { lazy, Suspense, useEffect, useState } from 'react';
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import InvestorQuiz from './components/InvestorQuiz';
import { CookieConsent } from './components/CookieConsent';
import type { QuizData } from './types/quiz';

const loadHomeBelowFold = () => import('./HomeBelowFold');
const HomeBelowFold = lazy(loadHomeBelowFold);
const FloatingButton = lazy(() => import('./components/FloatingButton'));
const RdvModal = lazy(() => import('./components/RdvModal'));

const go = (path: string) => {
  window.location.href = path;
};

const HomeApp: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [showBelowFold, setShowBelowFold] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => setShowFloatingButton(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (showBelowFold) return;

    const preloadBelowFold = () => {
      void loadHomeBelowFold();
    };
    const revealBelowFold = () => {
      preloadBelowFold();
      setShowBelowFold(true);
    };
    const onScroll = () => {
      if (window.scrollY > 20) revealBelowFold();
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const preloadTimer = window.setTimeout(preloadBelowFold, 180);
    const revealTimer = window.setTimeout(revealBelowFold, 850);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(preloadTimer);
      window.clearTimeout(revealTimer);
    };
  }, [showBelowFold]);

  useEffect(() => {
    if (!isAnalysisModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAnalysisModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isAnalysisModalOpen]);

  const handleLeadCapture = (data: QuizData) => {
    console.log('[MaximusSCPI] Lead quiz capturé :', data);
    setQuizCompleted(true);
    setIsAnalysisModalOpen(true);
  };

  const openRdvFromQuiz = () => {
    setIsAnalysisModalOpen(false);
    setIsRdvModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <SEOHead
        title="MaximusSCPI — Analyse, comparaison et portefeuille multi-SCPI"
        description="Analysez et comparez les SCPI, construisez votre portefeuille multi-SCPI et avancez vers la souscription depuis un parcours unique."
        canonical="https://maximusscpi.com/"
      />

      <Header
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(v => !v)}
        onContactClick={() => setIsRdvModalOpen(true)}
        onAboutClick={() => go('/qui-sommes-nous/')}
        onLogoClick={() => go('/')}
        onScpiPageClick={(slug) => go(`/${slug}/`)}
        onFaqClick={() => go('/faq/')}
        onUnderstandingClick={() => go('/comprendre-les-scpi/')}
        onAboutSectionClick={() => go('/qui-sommes-nous/')}
        onAboutNavigation={(path) => go(path.startsWith('/') ? path : `/${path}`)}
        onComparateurClick={() => go('/comparateur-scpi/')}
        onSimulateurClick={() => go('/simulateurs/')}
        onArticlesClick={() => go('/articles/')}
        onActualitesClick={() => go('/actualites/')}
        onProClick={() => go('/professionnels')}
        currentView="home"
      />

      <main>
        <section className="relative overflow-hidden min-h-[calc(100svh-4rem)] flex items-center" style={{ backgroundColor: '#0D1117' }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 50% at 12% 8%, rgba(0,200,150,0.14) 0%, transparent 60%), radial-gradient(50% 50% at 92% 18%, rgba(0,86,179,0.20) 0%, transparent 60%), radial-gradient(45% 45% at 75% 95%, rgba(244,114,182,0.10) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
                  Analyse SCPI • Comparaison • Portefeuille multi-SCPI
                </span>

                <h1 className="mt-5 mb-5 md:mb-6 overflow-visible">
                  <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-100">
                    Analysez. Comparez.
                  </span>
                  <span className="block mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text text-transparent pb-1">
                    Investissez dans plusieurs SCPI.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl font-semibold leading-relaxed text-slate-200 max-w-xl">
                  Un seul parcours pour construire et souscrire votre portefeuille multi-SCPI.
                </p>

                <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                  MaximusSCPI vous aide à sélectionner et répartir votre investissement entre plusieurs SCPI selon votre projet.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="lg:hidden px-7 py-4 rounded-xl font-semibold text-[#0D1117] shadow-2xl shadow-emerald-500/20 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#00C896' }}
                  >
                    Construire mon portefeuille multi-SCPI
                  </button>
                  <a
                    href="/comparateur-scpi/"
                    className="text-center font-medium underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
                    style={{ color: '#00C896' }}
                  >
                    Voir le comparateur complet
                  </a>
                </div>

                <p className="mt-6 text-sm sm:text-base font-semibold text-slate-200">
                  Plus de 4 650 situations patrimoniales étudiées — plus de 330 M€ de projets analysés
                </p>

                <p className="hidden lg:block mt-4 text-sm text-slate-400">
                  Répondez aux 4 questions à droite pour obtenir votre analyse MaximusSCPI.
                </p>
              </div>

              <div className="lg:pl-2">
                {quizCompleted && !isAnalysisModalOpen && (
                  <div className="rounded-3xl border border-emerald-400/25 bg-slate-900/85 p-6 sm:p-7 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-slate-100">Analyse MaximusSCPI</span>
                    </div>
                    <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Analyse conservée</p>
                      <h2 className="mt-2 text-xl font-bold text-white">Votre stratégie SCPI est prête</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Retrouvez votre allocation, les indicateurs pondérés, les vigilances et le Radar MaximusSCPI.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAnalysisModalOpen(true)}
                        className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:opacity-90"
                      >
                        Revoir mon analyse
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={quizCompleted
                    ? (isAnalysisModalOpen
                      ? 'fixed inset-0 z-[10000] flex items-stretch justify-center bg-slate-950/85 backdrop-blur-sm md:items-center md:p-6'
                      : 'hidden')
                    : ''}
                >
                  <div className={quizCompleted && isAnalysisModalOpen
                    ? 'relative h-full w-full overflow-y-auto bg-[#0D1117] md:h-auto md:max-h-[92vh] md:max-w-5xl md:rounded-3xl md:border md:border-slate-700/70 md:shadow-2xl'
                    : 'w-full'}>
                    {quizCompleted && isAnalysisModalOpen && (
                      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-700/70 bg-[#0D1117]/95 px-4 py-3 backdrop-blur md:rounded-t-3xl md:px-6">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Résultat personnalisé</p>
                          <p className="text-sm font-bold text-white">Analyse MaximusSCPI</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAnalysisModalOpen(false)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-xl leading-none text-slate-300 transition hover:border-slate-500 hover:text-white"
                          aria-label="Fermer l’analyse"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div className={quizCompleted && isAnalysisModalOpen ? 'mx-auto w-full max-w-4xl p-3 sm:p-5 md:p-7' : ''}>
                      <InvestorQuiz
                        onComplete={handleLeadCapture}
                        onRdvClick={openRdvFromQuiz}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {showBelowFold && (
        <Suspense fallback={<div className="min-h-[240px]" aria-hidden="true" />}>
          <HomeBelowFold
            isDarkMode={isDarkMode}
            onContactClick={() => setIsRdvModalOpen(true)}
            onNavigate={go}
          />
        </Suspense>
      )}

      {showFloatingButton && (
        <Suspense fallback={null}>
          <FloatingButton
            isVisible={showFloatingButton}
            onClick={() => setIsRdvModalOpen(true)}
          />
        </Suspense>
      )}

      {isRdvModalOpen && (
        <Suspense fallback={null}>
          <RdvModal
            isOpen={isRdvModalOpen}
            onClose={() => setIsRdvModalOpen(false)}
          />
        </Suspense>
      )}

      <CookieConsent />
    </div>
  );
};

export default HomeApp;
