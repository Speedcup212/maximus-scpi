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

    // Priorité au hero pendant le tout premier paint, puis préchargement rapide
    // de la suite afin qu'elle soit déjà disponible quand l'utilisateur scrolle.
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

    // Le téléchargement démarre presque immédiatement, mais après le premier paint.
    const preloadTimer = window.setTimeout(preloadBelowFold, 180);
    // La suite est montée rapidement même sans scroll : pas de page "vide" pendant plusieurs secondes.
    const revealTimer = window.setTimeout(revealBelowFold, 850);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(preloadTimer);
      window.clearTimeout(revealTimer);
    };
  }, [showBelowFold]);

  const handleLeadCapture = (data: QuizData) => {
    console.log('[MaximusSCPI] Lead quiz capturé :', data);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <SEOHead
        title="MaximusSCPI — Comparateur et analyse de SCPI | CGP-CIF"
        description="Comparez les SCPI selon rendement, TOF, frais, capitalisation, endettement et risques. Analyses et outils par un CGP-CIF immatriculé à l’ORIAS."
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
                  Analyse SCPI pédagogique • Fiscalité • Rendement net
                </span>

                <h1 className="mt-5 mb-6 md:mb-7 lg:mb-8 overflow-visible">
                  <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold leading-none text-slate-100">
                    SCPI
                  </span>
                  <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text text-transparent pb-1">
                    Testez. Comparez. Décidez.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl">
                  En 2 minutes, obtenez une première orientation pédagogique selon votre montant, votre fiscalité, votre horizon d'investissement et votre tolérance au risque.
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
                    Faire ma simulation pédagogique
                  </button>
                  <a
                    href="/comparateur-scpi/"
                    className="text-center font-medium underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
                    style={{ color: '#00C896' }}
                  >
                    Voir le comparateur complet
                  </a>
                </div>

                <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Comparateur, simulateurs, fiches SCPI, fiscalité, risques et rendement net&nbsp;: une expérience complète pour avancer avec méthode.
                </p>

                <p className="mt-4 text-sm sm:text-base font-semibold text-slate-200">
                  Plus de 4 650 situations patrimoniales étudiées — plus de 330 M€ de projets analysés
                </p>

                <p className="hidden lg:block mt-4 text-sm text-slate-400">
                  Répondez aux 4 questions à droite pour obtenir une première orientation.
                </p>
              </div>

              <div className="lg:pl-2">
                <InvestorQuiz
                  onComplete={handleLeadCapture}
                  onRdvClick={() => setIsRdvModalOpen(true)}
                />
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
