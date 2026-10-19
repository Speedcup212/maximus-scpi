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
                Analyse SCPI : Historique, Radar, Trajectoire et Surveillance
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Quatre lectures complémentaires pour comparer les SCPI au-delà du rendement : données historiques sourcées, Radar multicritère sur les fiches, trajectoires documentées et signaux de surveillance. Les données non fiables restent neutralisées.
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

      <section aria-label="Les quatre analyses MaximusSCPI" className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-[1500px] gap-3 px-4 py-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            ['Historique', 'Comparer des indicateurs datés sans mélanger TD et ancien TDVM.'],
            ['Radar', 'Lire plusieurs dimensions de risque sur chaque fiche SCPI, sans notation réglementaire.'],
            ['Trajectoire', 'Observer les évolutions vérifiables sans prédire les rendements futurs.'],
            ['Surveillance', 'Identifier les changements de liquidité, TOF, valorisation et dette.'],
          ].map(([name,detail]) => (
            <div key={name} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h2 className="text-sm font-bold text-white">{name}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
            </div>
          ))}
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
        </div>
      </section>

      <div id="analyses-scpi">
        {activeView === 'signals' ? <AnalysesLiveFeed /> : <TrajectorySurveillanceTable />}
      </div>

      <section id="analyses-methodologie-360" className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-[1500px] px-4 py-9 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white">Quelle analyse mener avant de comparer deux SCPI ?</h2>
          <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-300">
            Deux SCPI présentant une distribution similaire peuvent avoir des niveaux de valorisation, d'endettement et de liquidité très différents. Vérifiez d'abord la période et la définition de chaque indicateur, puis rapprochez le prix de souscription de la valeur de reconstitution et l'occupation des caractéristiques des baux.
          </p>
          <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-300">
            Le Radar propose une synthèse propriétaire multicritère sur les fiches, la Trajectoire éclaire les variations documentées et la Surveillance aide à repérer les changements. Aucun signal isolé ne vaut conseil personnalisé. L'absence d'alerte ne garantit pas l'absence de risque ; un chiffre non publié ne doit pas être traité comme zéro.
          </p>
          <nav aria-label="Parcours d'analyse SCPI" className="mt-4 flex flex-wrap gap-4 text-sm">
            <a href="/comparateur-scpi/" className="font-semibold text-emerald-300 hover:underline">Comparer les SCPI</a>
            <a href="/surveillance/" className="font-semibold text-emerald-300 hover:underline">Examiner la Surveillance</a>
            <a href="/methodologie-donnees-scpi/" className="font-semibold text-emerald-300 hover:underline">Consulter sources et méthodologie</a>
          </nav>
        </div>
      </section>

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
