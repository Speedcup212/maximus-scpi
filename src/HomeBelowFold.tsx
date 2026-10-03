import React, { lazy, Suspense } from 'react';
import ExpertBanner from './components/ExpertBanner';
import PreuveSociale from './components/PreuveSociale';
import TeaserComparateur from './components/TeaserComparateur';
import SemanticLinks from './components/SemanticLinks';
import Footer from './components/Footer';
import { getSemanticLinks } from './data/semanticCocon';

const Testimonials = lazy(() => import('./components/Testimonials'));
const LandingPagesMenu = lazy(() => import('./components/LandingPagesMenu'));

interface HomeBelowFoldProps {
  isDarkMode: boolean;
  onContactClick: () => void;
  onNavigate: (path: string) => void;
}

const FeatureIcon = ({ kind }: { kind: 'compare' | 'analysis' | 'follow' | 'simulate' }) => {
  if (kind === 'compare') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
      </svg>
    );
  }
  if (kind === 'analysis') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 3v18h18" /><path d="m7 16 4-5 4 3 4-7" />
      </svg>
    );
  }
  if (kind === 'follow') {
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

const HomeBelowFold: React.FC<HomeBelowFoldProps> = ({
  isDarkMode,
  onContactClick,
  onNavigate,
}) => {
  const featureCards = [
    {
      kind: 'compare' as const,
      title: 'Comparer les SCPI',
      description: 'Rendement, TOF, prix, risque, fiscalité, secteurs et géographies dans le même outil.',
      items: ['Filtres avancés', 'Vue grille et liste', 'Sélection multi-SCPI'],
      cta: 'Accéder au comparateur',
      path: '/comparateur-scpi/',
      accent: 'text-emerald-400',
    },
    {
      kind: 'analysis' as const,
      title: 'Analyses détaillées',
      description: 'Passez derrière le rendement avec les chiffres clés, le Radar Maximus et les vigilances.',
      items: ['Chiffres clés', 'Profil de risque', 'Analyse MaximusSCPI'],
      cta: 'Découvrir les analyses',
      path: '/analyses/',
      accent: 'text-cyan-400',
    },
    {
      kind: 'follow' as const,
      title: 'Suivre l’évolution',
      description: 'Visualisez l’historique des indicateurs et les changements qui comptent trimestre après trimestre.',
      items: ['TOF et prix de part', 'Dette et liquidité', 'Signaux de vigilance'],
      cta: 'Voir les évolutions',
      path: '/analyses/',
      accent: 'text-blue-400',
    },
    {
      kind: 'simulate' as const,
      title: 'Simuler votre projet',
      description: 'Testez plusieurs hypothèses pour mesurer l’impact de votre investissement SCPI.',
      items: ['Investissement', 'Fiscalité', 'Revente et scénarios'],
      cta: 'Lancer une simulation',
      path: '/simulateurs/',
      accent: 'text-orange-400',
    },
  ];

  return (
    <>
      <main className="bg-slate-900 text-white">
        <section className="border-b border-slate-800 bg-[#0D1117] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                Des outils pensés pour vos investissements
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Une vision complète des SCPI, dans un seul espace
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                Comparez, analysez, simulez et suivez les SCPI avec les mêmes codes visuels et les mêmes indicateurs que dans les outils MaximusSCPI.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {featureCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => onNavigate(card.path)}
                  className="group rounded-2xl border border-slate-700 bg-slate-800/80 p-6 text-left shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-800"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 ${card.accent}`}>
                    <FeatureIcon kind={card.kind} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.description}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {card.items.map((item) => (
                      <span key={item} className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-400 transition group-hover:text-emerald-300">
                    {card.cta} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800 bg-slate-900 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Une analyse plus complète</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Un rendement ne suffit pas pour juger une SCPI
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                MaximusSCPI croise la situation actuelle, son évolution dans le temps et les signaux à surveiller pour donner davantage de contexte à la décision.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">Aujourd’hui</p>
                    <p className="mt-1 text-xs text-slate-400">Une photographie structurée de la SCPI.</p>
                  </div>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Radar</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ['Taux de distribution', 'Donnée officielle', 'text-emerald-400'],
                    ['TOF', 'Occupation', 'text-blue-400'],
                    ['Valorisation', 'Prix / valeur', 'text-cyan-400'],
                    ['Endettement', 'Structure financière', 'text-orange-400'],
                  ].map(([label, sub, color]) => (
                    <div key={label} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                      <p className="text-[10px] text-slate-500">{sub}</p>
                      <p className={`mt-1 text-sm font-bold ${color}`}>{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <div className="mx-auto flex h-32 max-w-[220px] items-center justify-center">
                    <svg viewBox="0 0 180 145" className="h-full w-full" aria-hidden="true">
                      <polygon points="90,10 160,55 134,130 46,130 20,55" fill="rgba(15,23,42,.7)" stroke="#475569" strokeWidth="1.5" />
                      <polygon points="90,32 137,65 116,110 58,110 42,67" fill="rgba(16,185,129,.18)" stroke="#34d399" strokeWidth="2.5" />
                      <line x1="90" y1="10" x2="90" y2="130" stroke="#334155" />
                      <line x1="20" y1="55" x2="134" y2="130" stroke="#334155" />
                      <line x1="160" y1="55" x2="46" y2="130" stroke="#334155" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl shadow-black/10">
                <div>
                  <p className="text-sm font-bold text-white">Dans le temps</p>
                  <p className="mt-1 text-xs text-slate-400">Des séries historiques pour voir les changements.</p>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { title: 'TOF', stroke: '#34d399', path: 'M8 84 C42 76 58 68 90 66 C122 65 148 54 182 48 C212 43 242 35 292 28' },
                    { title: 'Prix de part', stroke: '#60a5fa', path: 'M8 72 C40 70 66 70 94 65 C126 59 156 62 184 54 C214 45 244 48 292 38' },
                  ].map((chart) => (
                    <div key={chart.title} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-300">{chart.title}</p>
                        <span className="text-[10px] text-slate-500">Historique</span>
                      </div>
                      <svg viewBox="0 0 300 100" className="mt-2 h-24 w-full" aria-hidden="true">
                        {[25, 50, 75].map(y => <line key={y} x1="5" x2="295" y1={y} y2={y} stroke="#334155" />)}
                        <path d={chart.path} fill="none" stroke={chart.stroke} strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl shadow-black/10">
                <div>
                  <p className="text-sm font-bold text-white">Signaux Maximus</p>
                  <p className="mt-1 text-xs text-slate-400">Les évolutions sont remises dans leur contexte.</p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm font-bold text-emerald-300">Indicateur en amélioration</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Une tendance favorable peut être mise en évidence lorsqu’elle est documentée dans les données.</p>
                  </div>
                  <div className="rounded-xl border border-slate-600 bg-slate-900/50 p-4">
                    <p className="text-sm font-bold text-slate-200">Indicateur stable</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">La stabilité permet d’éviter de surinterpréter une variation isolée.</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm font-bold text-amber-300">Point à surveiller</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Les vigilances sont affichées avec leur contexte et leur source lorsqu’ils sont disponibles.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/analyses/')}
                  className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  Voir les analyses complètes →
                </button>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-relaxed text-slate-500">
              Les SCPI présentent un risque de perte en capital, des revenus non garantis et une liquidité limitée. Les performances passées ne préjugent pas des performances futures.
            </p>
          </div>
        </section>

        <section className="bg-[#0D1117] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-7 shadow-2xl shadow-black/20 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Passez à l’action</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Commencez par comparer les SCPI</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                  Analysez les données, identifiez les différences et approfondissez les SCPI qui correspondent à votre projet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/comparateur-scpi/')}
                className="mt-6 inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 lg:mt-0"
              >
                Accéder au comparateur
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ExpertBanner
            isDarkMode={isDarkMode}
            onContactClick={onContactClick}
          />
        </div>

        <Suspense fallback={<div className="min-h-[360px]" aria-hidden="true" />}>
          <Testimonials />
        </Suspense>

        <PreuveSociale />
        <TeaserComparateur />
      </main>

      <Suspense fallback={<div className="min-h-[420px] bg-slate-900" aria-hidden="true" />}>
        <div className="mx-auto max-w-7xl bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
          <LandingPagesMenu onPageClick={(slug) => onNavigate(`/${slug}/`)} />
        </div>
      </Suspense>

      <div className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <SemanticLinks
            currentPage="/"
            links={getSemanticLinks('/')}
            title="Poursuivez votre découverte des SCPI"
          />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HomeBelowFold;
