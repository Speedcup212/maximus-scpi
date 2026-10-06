import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import InvestorQuiz from './components/InvestorQuiz';
import { CookieConsent } from './components/CookieConsent';
import { scpiDataExtended } from './data/scpiDataExtended';
import { trackFunnelEvent } from './utils/funnelAnalytics';
import type { QuizData } from './types/quiz';

const loadHomeBelowFold = () => import('./HomeBelowFold');
const HomeBelowFold = lazy(loadHomeBelowFold);
const FloatingButton = lazy(() => import('./components/FloatingButton'));
const RdvModal = lazy(() => import('./components/RdvModal'));

const go = (path: string) => {
  window.location.href = path;
};

const ToolIcon = ({ type }: { type: 'compare' | 'analysis' | 'trend' | 'simulation' }) => {
  if (type === 'compare') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
      </svg>
    );
  }
  if (type === 'analysis') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 3v18h18" /><path d="m7 16 4-5 4 3 4-7" />
      </svg>
    );
  }
  if (type === 'trend') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 18 9 12l4 4 8-10" /><path d="M15 6h6v6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
    </svg>
  );
};

const MiniRadar = () => (
  <svg viewBox="0 0 180 150" className="h-32 w-full" aria-hidden="true">
    <polygon points="90,12 160,58 134,132 46,132 20,58" fill="rgba(15,23,42,.55)" stroke="#475569" strokeWidth="1.5" />
    <polygon points="90,34 137,66 118,113 58,112 40,68" fill="rgba(16,185,129,.18)" stroke="#34d399" strokeWidth="2.5" />
    <line x1="90" y1="12" x2="90" y2="132" stroke="#334155" />
    <line x1="20" y1="58" x2="134" y2="132" stroke="#334155" />
    <line x1="160" y1="58" x2="46" y2="132" stroke="#334155" />
    {[[90,34],[137,66],[118,113],[58,112],[40,68]].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#34d399" />
    ))}
  </svg>
);

const MiniTrend = () => (
  <svg viewBox="0 0 320 120" className="h-28 w-full" aria-hidden="true">
    {[26, 54, 82].map(y => <line key={y} x1="10" x2="310" y1={y} y2={y} stroke="#334155" strokeWidth="1" />)}
    <path d="M16 91 C54 82 82 76 112 72 C146 68 160 59 192 58 C224 57 255 48 302 35" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 91 C54 82 82 76 112 72 C146 68 160 59 192 58 C224 57 255 48 302 35 L302 108 L16 108 Z" fill="rgba(16,185,129,.08)" />
    {[[16,91],[76,78],[136,66],[196,58],[252,49],[302,35]].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#34d399" />
    ))}
  </svg>
);

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

  const previewScpis = useMemo(() => scpiDataExtended.slice(0, 3), []);
  const featuredScpi = previewScpis[0];

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

  useEffect(() => {
    const quiz = document.getElementById('quiz-section');
    if (!quiz) return;

    const onQuizClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const summary = target.closest('summary');
      if (summary && quiz.contains(summary)) {
        const details = summary.parentElement as HTMLDetailsElement | null;
        if (details && !details.open) {
          const scpiName = summary.querySelector('p')?.textContent?.trim() || undefined;
          trackFunnelEvent('scpi_detail_opened', {
            scpi_name: scpiName,
            source: 'portfolio_analysis',
          });
        }
        return;
      }

      const button = target.closest('button');
      if (!button || !quiz.contains(button)) return;

      const isAnswer =
        button.classList.contains('group') &&
        button.classList.contains('w-full') &&
        button.classList.contains('text-left');
      if (!isAnswer) return;

      const stepMatch = (quiz.textContent || '').match(/Étape\s+(\d)\s+sur\s+4/i);
      if (!stepMatch) return;

      const step = Number(stepMatch[1]);
      if (step === 1) {
        trackFunnelEvent('quiz_started', { step: 1 });
        trackFunnelEvent('quiz_step_1_completed', { step: 1 });
      } else if (step === 2) {
        trackFunnelEvent('quiz_step_2_completed', { step: 2 });
      } else if (step === 3) {
        trackFunnelEvent('quiz_step_3_completed', { step: 3 });
      } else if (step === 4) {
        trackFunnelEvent('quiz_completed', { step: 4 });
      }
    };

    quiz.addEventListener('click', onQuizClick);
    return () => quiz.removeEventListener('click', onQuizClick);
  }, []);

  const handleQuizComplete = (data: QuizData) => {
    try {
      sessionStorage.setItem('maximus_quiz_context', JSON.stringify({ quiz: data }));
    } catch {
      // Le parcours reste fonctionnel si le stockage navigateur est indisponible.
    }

    trackFunnelEvent('analysis_opened', { source: 'quiz_completion' });
    setQuizCompleted(true);
    setIsAnalysisModalOpen(true);
  };

  const scrollToPortfolioBuilder = () => {
    trackFunnelEvent('hero_portfolio_clicked', { source: 'home_hero' });
    document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openRdvFromQuiz = () => {
    trackFunnelEvent('portfolio_validation_clicked', { source: 'analysis' });
    setIsAnalysisModalOpen(false);
    setIsRdvModalOpen(true);
  };

  const reopenAnalysis = () => {
    trackFunnelEvent('analysis_opened', { source: 'reopen' });
    setIsAnalysisModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-slate-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <SEOHead
        title="MaximusSCPI — Analyse, comparaison et portefeuille multi-SCPI"
        description="Comparez les SCPI, analysez leurs forces et leurs risques, simulez votre projet et construisez votre portefeuille multi-SCPI."
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
        <section className="relative overflow-hidden border-b border-slate-800 bg-[#0D1117]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 55% at 10% 8%, rgba(0,200,150,0.13) 0%, transparent 62%), radial-gradient(48% 48% at 92% 16%, rgba(0,86,179,0.18) 0%, transparent 62%), radial-gradient(40% 40% at 70% 92%, rgba(244,114,182,0.08) 0%, transparent 65%)',
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
                  Analyse SCPI • Comparaison • Simulation • Suivi
                </span>

                <h1 className="mt-5 mb-5 overflow-visible md:mb-6">
                  <span className="block text-4xl font-bold leading-tight text-slate-100 sm:text-5xl lg:whitespace-nowrap lg:text-5xl">
                    Analysez. Comparez.
                  </span>
                  <span className="mt-2 block bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text pb-1 text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">
                    Investissez sur
                  </span>
                  <span className="block bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text pb-1 text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">
                    MaximusSCPI.
                  </span>
                </h1>

                <p className="max-w-xl text-lg font-semibold leading-relaxed text-slate-200 sm:text-xl">
                  Un seul espace pour comprendre les SCPI, les comparer, simuler votre investissement et construire votre portefeuille.
                </p>

                <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  Au-delà du rendement, découvrez les forces, la trajectoire et les fondamentaux de chaque SCPI.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    onClick={scrollToPortfolioBuilder}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                  >
                    Construire mon portefeuille
                  </button>
                  <a
                    href="/comparateur-scpi/"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800/70 px-6 py-3.5 text-sm font-bold text-slate-100 transition hover:border-emerald-500/50 hover:bg-slate-800"
                  >
                    Voir le comparateur
                  </a>
                </div>
                <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
                  Analyse gratuite et informative. Si vous souhaitez aller plus loin, votre allocation peut ensuite être vérifiée avant souscription et suivie dans le temps.
                </p>
              </div>

              <div className="relative mx-auto min-h-[550px] w-full max-w-2xl lg:mx-0">
                <div className="absolute left-0 top-6 z-10 w-[60%] overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-800 shadow-2xl shadow-black/30">
                  <div className="border-b border-slate-700 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <ToolIcon type="compare" />
                        <p className="text-sm font-bold text-white">Comparateur SCPI</p>
                      </div>
                      <span className="rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-[9px] font-semibold text-slate-300">Grille</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Même logique visuelle que le comparateur MaximusSCPI.</p>
                  </div>
                  <div className="grid grid-cols-4 border-b border-slate-700 bg-slate-900/40 px-3 py-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                    <span>SCPI</span><span>TD</span><span>TOF</span><span>Prix</span>
                  </div>
                  {previewScpis.map((scpi) => (
                    <div key={scpi.id} className="grid grid-cols-4 items-center border-b border-slate-700/70 px-3 py-2.5 text-[10px] last:border-b-0">
                      <span className="truncate font-semibold text-white">{scpi.name}</span>
                      <span className="font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</span>
                      <span className="text-slate-300">{scpi.tof}%</span>
                      <span className="text-slate-300">{scpi.price}€</span>
                    </div>
                  ))}
                </div>

                <div className="absolute right-0 top-20 z-20 w-[47%] rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <ToolIcon type="analysis" />
                        <p className="text-sm font-bold text-white">Analyse détaillée</p>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">Radar, chiffres clés et points de vigilance.</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <MiniRadar />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2">
                      <p className="text-[9px] text-slate-500">TD brut</p>
                      <p className="mt-0.5 text-sm font-bold text-emerald-400">{featuredScpi ? `${featuredScpi.yield.toFixed(2)}%` : '—'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2">
                      <p className="text-[9px] text-slate-500">TOF</p>
                      <p className="mt-0.5 text-sm font-bold text-blue-400">{featuredScpi ? `${featuredScpi.tof}%` : '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-3 z-10 w-[57%] rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/30">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <ToolIcon type="trend" />
                        <p className="text-sm font-bold text-white">Évolution & signaux</p>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">Visualisez les indicateurs trimestre après trimestre.</p>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-300">À surveiller</span>
                  </div>
                  <div className="mt-3 flex gap-1.5 text-[9px] font-semibold">
                    <span className="rounded-lg bg-emerald-600 px-2 py-1 text-white">TOF</span>
                    <span className="rounded-lg bg-slate-700 px-2 py-1 text-slate-300">Prix</span>
                    <span className="rounded-lg bg-slate-700 px-2 py-1 text-slate-300">Dette</span>
                    <span className="rounded-lg bg-slate-700 px-2 py-1 text-slate-300">Liquidité</span>
                  </div>
                  <MiniTrend />
                </div>

                <div className="absolute bottom-0 right-1 z-20 w-[42%] rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/30">
                  <div className="flex items-center gap-2 text-orange-400">
                    <ToolIcon type="simulation" />
                    <p className="text-sm font-bold text-white">Simulateurs</p>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Testez votre projet avec les outils MaximusSCPI.</p>
                  <div className="mt-4 space-y-2.5">
                    {['Montant investi', 'Durée', 'Hypothèses fiscales'].map((label, index) => (
                      <div key={label} className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-slate-400">{label}</span>
                          <span className={`h-1.5 rounded-full ${index === 0 ? 'w-14 bg-emerald-500' : index === 1 ? 'w-10 bg-blue-500' : 'w-12 bg-orange-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <a href="/simulateurs/" className="mt-4 inline-flex text-[10px] font-semibold text-emerald-400 hover:text-emerald-300">
                    Voir les simulateurs →
                  </a>
                </div>

                <p className="absolute -bottom-7 left-3 text-[10px] text-slate-500">
                  Aperçus construits à partir des composants et données du site.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="quiz-section" className="border-b border-slate-800 bg-slate-900 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Votre projet</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Construisez votre sélection multi-SCPI</h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-400">
                  Répondez aux 4 questions pour obtenir une première analyse de répartition. Cette étape pédagogique ne remplace pas un conseil personnalisé.
                </p>
              </div>

              <div className="lg:pl-2">
                {quizCompleted && !isAnalysisModalOpen && (
                  <div className="rounded-3xl border border-emerald-400/25 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl sm:p-7">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-slate-100">Analyse MaximusSCPI</span>
                    </div>
                    <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Analyse conservée</p>
                      <h3 className="mt-2 text-xl font-bold text-white">Votre stratégie SCPI est prête</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Retrouvez votre allocation, les indicateurs pondérés, les vigilances et le Radar MaximusSCPI.
                      </p>
                      <button
                        type="button"
                        onClick={openRdvFromQuiz}
                        className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:opacity-90"
                      >
                        Faire valider et suivre mon portefeuille
                      </button>
                      <button
                        type="button"
                        onClick={reopenAnalysis}
                        className="mt-2.5 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
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
                        onComplete={handleQuizComplete}
                        onRdvClick={openRdvFromQuiz}
                      />
                    </div>

                    {quizCompleted && isAnalysisModalOpen && (
                      <div className="sticky bottom-0 z-20 border-t border-emerald-400/20 bg-[#0D1117]/95 px-4 py-3 backdrop-blur md:rounded-b-3xl md:px-6">
                        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">Votre allocation est prête à être vérifiée</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                              Vérification de l’adéquation, de la disponibilité et de la répartition avant souscription, puis suivi des SCPI dans le temps.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={openRdvFromQuiz}
                            className="shrink-0 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:opacity-90"
                          >
                            Faire valider et suivre
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showBelowFold && (
        <Suspense fallback={<div className="min-h-[240px] bg-slate-900" aria-hidden="true" />}>
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