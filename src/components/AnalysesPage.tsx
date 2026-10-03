import React, { useState } from 'react';
import { Activity, ArrowRight, Database, LineChart, Radar } from 'lucide-react';
import AnalysesLiveFeed from './AnalysesLiveFeed';
import TrajectorySurveillanceTable from './trajectory/TrajectorySurveillanceTable';

type AnalysisView = 'signals' | 'trajectories';

const AnalysesPage: React.FC = () => {
  const [activeView, setActiveView] = useState<AnalysisView>('signals');

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.13),transparent_34%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                <Radar className="h-4 w-4" />
                MaximusSCPI Research
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Analyses SCPI : signaux actuels et trajectoires historiques des SCPI
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Une lecture opérationnelle des fondamentaux : occupation, liquidité, valorisation, dette et évolution dans le temps. Les données insuffisamment fiables restent neutralisées.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="/methodologie-donnees-scpi/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
              >
                <Database className="h-4 w-4" />
                Méthodologie
              </a>
              <a
                href="/comparateur-scpi/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
              >
                Comparateur
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setActiveView('signals')}
            className={
              activeView === 'signals'
                ? 'inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950'
                : 'inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white'
            }
          >
            <Activity className="h-4 w-4" />
            Signaux du marché
          </button>
          <button
            type="button"
            onClick={() => setActiveView('trajectories')}
            className={
              activeView === 'trajectories'
                ? 'inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950'
                : 'inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white'
            }
          >
            <LineChart className="h-4 w-4" />
            Trajectoires
          </button>
          <span className="ml-auto hidden text-xs text-slate-500 md:inline">
            Un seul écran d’analyse à la fois pour aller directement à l’essentiel.
          </span>
        </div>
      </section>

      <div id="analyses-scpi">
        {activeView === 'signals' ? <AnalysesLiveFeed /> : <TrajectorySurveillanceTable />}
      </div>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-[1500px] gap-3 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          <a
            href="/methodologie-donnees-scpi/"
            className="rounded-xl border border-slate-800 bg-slate-900/55 px-4 py-4 transition hover:border-emerald-500/30"
          >
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">Méthodologie</div>
            <div className="mt-1 text-sm font-semibold text-white">Comprendre les sources et contrôles qualité</div>
          </a>
          <a
            href="/comparateur-scpi/"
            className="rounded-xl border border-slate-800 bg-slate-900/55 px-4 py-4 transition hover:border-sky-500/30"
          >
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-sky-300">Comparer</div>
            <div className="mt-1 text-sm font-semibold text-white">Passer des signaux à la comparaison des SCPI</div>
          </a>
          <a
            href="/actualites/"
            className="rounded-xl border border-slate-800 bg-slate-900/55 px-4 py-4 transition hover:border-amber-500/30"
          >
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300">Actualités</div>
            <div className="mt-1 text-sm font-semibold text-white">Voir les derniers changements publiés</div>
          </a>
        </div>
      </section>
    </main>
  );
};

export default AnalysesPage;
