import React, { lazy, Suspense, useEffect, useState } from 'react';
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import InvestorQuiz from './components/InvestorQuiz';
import { CookieConsent } from './components/CookieConsent';
import { trackFunnelEvent } from './utils/funnelAnalytics';
import type { QuizData } from './types/quiz';

const loadHomeBelowFold = () => import('./HomeBelowFold');
const HomeBelowFold = lazy(loadHomeBelowFold);
const FloatingButton = lazy(() => import('./components/FloatingButton'));
const RdvModal = lazy(() => import('./components/RdvModal'));

const go = (path: string) => {
  window.location.href = path;
};

const Arrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ProductIcon = ({ type }: { type: 'compare' | 'analysis' | 'trend' | 'simulation' }) => {
  if (type === 'compare') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
      </svg>
    );
  }
  if (type === 'analysis') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 4v16h16" /><path d="m7 15 4-5 4 3 4-6" />
      </svg>
    );
  }
  if (type === 'trend') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 18 9 12l4 4 8-10" /><path d="M15 6h6v6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
    </svg>
  );
};

const RadarPreview = () => (
  <svg viewBox="0 0 220 190" className="h-40 w-full" aria-hidden="true">
    <polygon points="110,18 194,78 164,166 56,166 26,78" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
    <polygon points="110,42 166,82 145,142 72,144 50,85" fill="rgba(16,185,129,.18)" stroke="#10b981" strokeWidth="2.4" />
    <line x1="110" y1="18" x2="110" y2="166" stroke="#dbe3eb" />
    <line x1="26" y1="78" x2="164" y2="166" stroke="#dbe3eb" />
    <line x1="194" y1="78" x2="56" y2="166" stroke="#dbe3eb" />
    {[[110,42],[166,82],[145,142],[72,144],[50,85]].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#10b981" />
    ))}
  </svg>
);

const TrendPreview = ({ compact = false }: { compact?: boolean }) => (
  <svg viewBox="0 0 320 120" className={compact ? 'h-20 w-full' : 'h-28 w-full'} aria-hidden="true">
    {[28, 58, 88].map(y => <line key={y} x1="10" x2="310" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />)}
    <path d="M14 92 C50 87 74 76 108 74 C142 72 169 64 198 62 C232 60 262 47 306 34" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    <path d="M14 92 C50 87 74 76 108 74 C142 72 169 64 198 62 C232 60 262 47 306 34 L306 108 L14 108 Z" fill="rgba(16,185,129,.08)" />
  </svg>
);

const FeatureCard = ({
  type,
  title,
  text,
  link,
  linkLabel,
}: {
  type: 'compare' | 'analysis' | 'trend' | 'simulation';
  title: string;
  text: string;
  link: string;
  linkLabel: string;
}) => (
  <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_70px_rgba(15,23,42,0.10)] sm:p-7">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
      <ProductIcon type={type} />
    </div>
    <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    <a href={link} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition group-hover:gap-3">
      {linkLabel} <Arrow />
    </a>
  </article>
);

const HomeApp: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const handleLeadCapture = (data: QuizData) => {
    console.log('[MaximusSCPI] Lead quiz capturé :', data);
    trackFunnelEvent('analysis_opened', { source: 'quiz_completion' });
    setQuizCompleted(true);
    setIsAnalysisModalOpen(true);
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

  const startProjectAnalysis = () => {
    trackFunnelEvent('home_primary_cta_clicked', { source: 'hero', destination: 'quiz' });
    document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SEOHead
        title="MaximusSCPI — Analyse, comparaison et portefeuille multi-SCPI"
        description="Comparez, analysez, simulez et suivez les SCPI avec MaximusSCPI. Construisez votre portefeuille multi-SCPI à partir de données et d’outils d’aide à la décision."
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
        <section className="relative overflow-hidden border-b border-slate-100 bg-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-50 blur-3xl" />
            <div className="absolute right-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-slate-100 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Plateforme dédiée aux SCPI</p>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Analysez. Comparez.
                  <span className="mt-2 block text-emerald-600">Investissez dans plusieurs SCPI.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-700 sm:text-xl">
                  Un seul espace pour comprendre les SCPI, les comparer, simuler votre investissement et construire votre portefeuille.
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                  MaximusSCPI analyse aussi leur évolution dans le temps afin de faire ressortir les forces, les fragilités et les signaux à surveiller.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="/comparateur-scpi/"
                    onClick={() => trackFunnelEvent('home_primary_cta_clicked', { source: 'hero', destination: 'comparateur' })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_30px_rgba(5,150,105,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    Voir le comparateur complet <Arrow />
                  </a>
                  <a
                    href="/analyses/"
                    onClick={() => trackFunnelEvent('home_secondary_cta_clicked', { source: 'hero', destination: 'analyses' })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-black text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Découvrir les analyses
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
                  <span><strong className="text-slate-950">4 650+</strong> situations patrimoniales étudiées</span>
                  <span><strong className="text-slate-950">330 M€+</strong> de projets analysés</span>
                </div>
              </div>

              <div className="relative mx-auto min-h-[570px] w-full max-w-2xl lg:mx-0">
                <div className="absolute left-0 top-2 z-10 w-[63%] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Comparateur</p>
                      <h2 className="mt-1 text-base font-black text-slate-950">Comparez les indicateurs clés</h2>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Aperçu</span>
                  </div>
                  <div className="grid grid-cols-4 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <span>SCPI</span><span>TD hist.</span><span>TOF</span><span>Risque</span>
                  </div>
                  {[
                    ['SCPI A', '6,1 %', '98 %', '3/7'],
                    ['SCPI B', '5,3 %', '96 %', '2/7'],
                    ['SCPI C', '5,8 %', '97 %', '4/7'],
                  ].map((row) => (
                    <div key={row[0]} className="grid grid-cols-4 items-center border-t border-slate-100 px-4 py-3 text-xs">
                      <span className="font-bold text-slate-900">{row[0]}</span>
                      <span className="font-black text-emerald-600">{row[1]}</span>
                      <span className="text-slate-600">{row[2]}</span>
                      <span className="text-slate-600">{row[3]}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute right-0 top-12 z-20 w-[45%] rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Analyse Maximus</p>
                      <p className="mt-1 text-sm font-black text-slate-950">Radar multi-critères</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <RadarPreview />
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-xl bg-slate-50 p-2.5"><span className="block text-slate-400">Occupation</span><strong className="text-slate-900">Élevée</strong></div>
                    <div className="rounded-xl bg-slate-50 p-2.5"><span className="block text-slate-400">Liquidité</span><strong className="text-amber-600">À suivre</strong></div>
                  </div>
                </div>

                <div className="absolute bottom-14 left-4 z-10 w-[58%] rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Évolution</p>
                      <p className="mt-1 text-sm font-black text-slate-950">Suivez les ruptures dans le temps</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">À surveiller</span>
                  </div>
                  <div className="mt-3 flex gap-2 text-[10px] font-bold text-slate-500">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">TOF</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">Prix</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">Dette</span>
                  </div>
                  <TrendPreview />
                </div>

                <div className="absolute bottom-0 right-1 z-20 w-[40%] rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Simulation</p>
                  <p className="mt-1 text-sm font-black text-slate-950">Capital simulé</p>
                  <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">100 000 €</p>
                  <p className="mt-1 text-xs text-slate-500">Hypothèses personnalisables selon le simulateur.</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[72%] rounded-full bg-emerald-500" /></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[54%] rounded-full bg-slate-400" /></div>
                  </div>
                  <a href="/simulateurs/" className="mt-4 inline-flex items-center gap-1 text-xs font-black text-emerald-700">Voir les simulateurs <Arrow /></a>
                </div>

                <p className="absolute -bottom-8 left-4 max-w-[520px] text-[10px] leading-4 text-slate-400">
                  Exemples illustratifs. Les performances passées ne préjugent pas des performances futures. Capital et revenus non garantis ; liquidité limitée.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfcfd] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Des outils pensés pour vos investissements</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Une vision complète des SCPI, dans un seul espace</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Comparez, analysez, simulez et suivez les SCPI grâce aux outils MaximusSCPI.</p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <FeatureCard
                type="compare"
                title="Comparer les SCPI"
                text="Mettez les SCPI côte à côte sur les indicateurs qui comptent vraiment : rendement historique, occupation, capitalisation, prix, risque et plus encore."
                link="/comparateur-scpi/"
                linkLabel="Ouvrir le comparateur"
              />
              <FeatureCard
                type="analysis"
                title="Analyses détaillées"
                text="Accédez à une lecture structurée de chaque SCPI : chiffres clés, profil de risque, radar, analyse Maximus et données documentées."
                link="/analyses/"
                linkLabel="Voir les analyses"
              />
              <FeatureCard
                type="trend"
                title="Suivre l’évolution"
                text="Visualisez les indicateurs trimestre après trimestre afin d’identifier les améliorations, les dégradations et les ruptures structurelles."
                link="/analyses/"
                linkLabel="Explorer les trajectoires"
              />
              <FeatureCard
                type="simulation"
                title="Simuler votre projet"
                text="Testez différents montants, modes de détention et hypothèses pour mieux comprendre les impacts financiers et fiscaux de votre projet."
                link="/simulateurs/"
                linkLabel="Voir les simulateurs"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Une analyse plus complète</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Un rendement ne suffit pas pour juger une SCPI</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                  MaximusSCPI analyse chaque SCPI sous plusieurs angles et dans la durée, pour mettre en perspective le rendement avec l’occupation, la valorisation, l’endettement et la liquidité.
                </p>
                <a href="/analyses/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
                  Voir l’analyse complète <Arrow />
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Aujourd’hui</p>
                  <p className="mt-2 text-base font-black text-slate-950">Lecture multi-critères</p>
                  <RadarPreview />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Dans le temps</p>
                  <p className="mt-2 text-base font-black text-slate-950">Trajectoire des indicateurs</p>
                  <div className="mt-5 rounded-2xl bg-white p-2"><TrendPreview compact /></div>
                  <div className="mt-3 rounded-2xl bg-white p-2"><TrendPreview compact /></div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Signaux Maximus</p>
                  <p className="mt-2 text-base font-black text-slate-950">Ce qui mérite votre attention</p>
                  <div className="mt-5 space-y-3 text-xs font-bold">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-800">Occupation en amélioration</div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-700">Valorisation stable</div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-amber-800">Liquidité à surveiller</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="quiz-section" className="bg-slate-950 py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-400">Votre projet</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Construisez une première sélection multi-SCPI</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
                  Répondez à 4 questions pour obtenir une première analyse de répartition. Cette étape reste pédagogique et ne remplace pas un conseil personnalisé.
                </p>
                <button
                  type="button"
                  onClick={startProjectAnalysis}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
                >
                  Commencer l’analyse <Arrow />
                </button>
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
                        onClick={reopenAnalysis}
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

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Passez à l’action</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Commencez par comparer les SCPI</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Analysez les données, identifiez les différences et approfondissez ensuite les SCPI qui correspondent à votre projet.
            </p>
            <a href="/comparateur-scpi/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700">
              Accéder au comparateur <Arrow />
            </a>
          </div>
        </section>
      </main>

      {showBelowFold && (
        <Suspense fallback={<div className="min-h-[240px] bg-white" aria-hidden="true" />}>
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
