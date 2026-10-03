import React, { lazy, Suspense } from 'react';
import ExpertBanner from './components/ExpertBanner';
import SemanticLinks from './components/SemanticLinks';
import Footer from './components/Footer';
import { scpiDataExtended, type SCPIExtended } from './data/scpiDataExtended';
import { getSemanticLinks } from './data/semanticCocon';

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

const getPreviewScpis = (): SCPIExtended[] => {
  const preferred = ['Comète', 'Transitions Europe', 'Iroko Zen']
    .map(name => scpiDataExtended.find(scpi => scpi.name === name))
    .filter((scpi): scpi is SCPIExtended => Boolean(scpi));

  const fallback = scpiDataExtended.filter(scpi => !preferred.some(item => item.id === scpi.id));
  return [...preferred, ...fallback].slice(0, 3);
};

const HomeBelowFold: React.FC<HomeBelowFoldProps> = ({
  isDarkMode,
  onContactClick,
  onNavigate,
}) => {
  const previewScpis = getPreviewScpis();
  const featuredScpi = previewScpis[0];

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
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Le comparateur MaximusSCPI</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Comparez les SCPI sur des données concrètes
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  Le comparateur ne se limite pas au taux de distribution. Il met en regard le prix de part, le TOF, la typologie, la société de gestion et les indicateurs utiles pour approfondir une SCPI.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                  {['Rendement', 'TOF', 'Prix', 'Secteurs', 'Géographie', 'Fiscalité', 'Liquidité'].map(item => (
                    <span key={item} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">{item}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/comparateur-scpi/')}
                  className="mt-7 inline-flex items-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                  Ouvrir le comparateur →
                </button>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-[#0D1117] p-4 shadow-2xl shadow-black/20 sm:p-5">
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Comparateur SCPI</p>
                    <p className="mt-1 text-xs text-slate-500">Aperçu construit avec des données présentes dans le comparateur.</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-400">Vue grille</div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {previewScpis.map((scpi) => (
                    <div key={scpi.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
                      <div className="border-b border-slate-700 bg-slate-900/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{scpi.name}</p>
                            <p className="truncate text-[10px] text-slate-500">{scpi.managementCompany}</p>
                          </div>
                          <span className="rounded-md border border-slate-600 bg-slate-800 px-1.5 py-1 text-[9px] text-slate-400">{scpi.category}</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-4 text-white">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-100">Taux de distribution brut</p>
                        <p className="mt-1 text-3xl font-black">{scpi.yield.toFixed(2)}%</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-2.5">
                          <p className="text-[9px] text-slate-500">TOF</p>
                          <p className="mt-1 text-sm font-bold text-blue-400">{scpi.tof}%</p>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-2.5">
                          <p className="text-[9px] text-slate-500">Prix de part</p>
                          <p className="mt-1 text-sm font-bold text-white">{scpi.price.toLocaleString('fr-FR')} €</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
                  Données affichées à titre d’aperçu de l’interface. Les performances passées ne préjugent pas des performances futures.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800 bg-[#0D1117] py-16 sm:py-20">
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
                    <p className="mt-1 text-xs text-slate-400">Chiffres clés de {featuredScpi?.name ?? 'la SCPI'}.</p>
                  </div>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Analyse</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-[10px] text-slate-500">Taux de distribution brut</p>
                    <p className="mt-1 text-lg font-bold text-emerald-400">{featuredScpi ? `${featuredScpi.yield.toFixed(2)}%` : '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-[10px] text-slate-500">TOF</p>
                    <p className="mt-1 text-lg font-bold text-blue-400">{featuredScpi ? `${featuredScpi.tof}%` : '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-[10px] text-slate-500">Prix de part</p>
                    <p className="mt-1 text-lg font-bold text-white">{featuredScpi ? `${featuredScpi.price.toLocaleString('fr-FR')} €` : '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-[10px] text-slate-500">Capitalisation</p>
                    <p className="mt-1 text-lg font-bold text-cyan-400">{featuredScpi?.capitalization ?? '—'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/analyses/')}
                  className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  Voir les analyses détaillées →
                </button>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl shadow-black/10">
                <div>
                  <p className="text-sm font-bold text-white">Dans le temps</p>
                  <p className="mt-1 text-xs text-slate-400">Le même langage visuel que les trajectoires du site.</p>
                </div>
                <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                    <span className="rounded-lg bg-emerald-600 px-2 py-1 text-white">TOF</span>
                    <span className="rounded-lg bg-slate-700 px-2 py-1 text-slate-300">Prix de part</span>
                    <span className="rounded-lg bg-slate-700 px-2 py-1 text-slate-300">Dette</span>
                    <span className="rounded-lg bg-slate-700 px-2 py-1 text-slate-300">Liquidité</span>
                  </div>
                  <svg viewBox="0 0 300 140" className="mt-4 h-36 w-full" aria-hidden="true">
                    {[28, 62, 96].map(y => <line key={y} x1="8" x2="292" y1={y} y2={y} stroke="#334155" />)}
                    <path d="M10 102 C48 94 75 90 104 82 C135 74 164 77 193 63 C224 49 251 54 290 39" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                    {[[10,102],[70,91],[130,76],[190,64],[245,52],[290,39]].map(([cx, cy]) => (
                      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#34d399" />
                    ))}
                  </svg>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Les graphiques complets utilisent les séries historiques disponibles dans les analyses MaximusSCPI.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl shadow-black/10">
                <div>
                  <p className="text-sm font-bold text-white">Signaux Maximus</p>
                  <p className="mt-1 text-xs text-slate-400">Une lecture structurée des évolutions documentées.</p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm font-bold text-emerald-300">En amélioration</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Les évolutions favorables sont visibles sans réduire l’analyse au seul rendement.</p>
                  </div>
                  <div className="rounded-xl border border-slate-600 bg-slate-900/50 p-4">
                    <p className="text-sm font-bold text-slate-200">Stable</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">La stabilité évite de surinterpréter une variation isolée.</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm font-bold text-amber-300">À surveiller</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Les vigilances sont remises dans leur contexte avec les sources disponibles.</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-relaxed text-slate-500">
              Les SCPI présentent un risque de perte en capital, des revenus non garantis et une liquidité limitée. Les performances passées ne préjugent pas des performances futures.
            </p>
          </div>
        </section>

        <section className="border-b border-slate-800 bg-slate-900 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="rounded-3xl border border-slate-700 bg-[#0D1117] p-5 shadow-2xl shadow-black/20 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">Simulateurs MaximusSCPI</p>
                    <p className="mt-1 text-xs text-slate-500">Projetez plusieurs dimensions du projet.</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
                    <FeatureIcon kind="simulate" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Investissement', 'Montant, horizon et revenus'],
                    ['Fiscalité', 'Comparer les impacts fiscaux'],
                    ['Portefeuille', 'Répartir entre plusieurs SCPI'],
                    ['Revente', 'Tester différents scénarios'],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="mt-1 text-xs text-slate-400">{text}</p>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-500 to-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-400">Passer des données au projet</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Simulez avant de décider
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  Les simulateurs complètent l’analyse : ils permettent de tester un montant, une durée, une répartition ou un scénario de sortie sans transformer une hypothèse en promesse de résultat.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/simulateurs/')}
                  className="mt-7 inline-flex items-center rounded-xl border border-orange-500/40 bg-orange-500/10 px-5 py-3 text-sm font-bold text-orange-300 transition hover:bg-orange-500/15"
                >
                  Voir tous les simulateurs →
                </button>
              </div>
            </div>
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
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('/comparateur-scpi/')}
                  className="rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                  Accéder au comparateur
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/analyses/')}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-6 py-3.5 text-sm font-bold text-white transition hover:border-slate-500"
                >
                  Voir les analyses
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
          <ExpertBanner
            isDarkMode={isDarkMode}
            onContactClick={onContactClick}
          />
        </div>
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
