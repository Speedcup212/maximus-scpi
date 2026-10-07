import React from 'react';
import { ArrowRight, Calculator, ShieldCheck, BarChart3 } from 'lucide-react';
import ScpiDirectIncomeSimulator from '../components/ScpiDirectIncomeSimulator';

type Props = { onRdvClick: () => void };

const ScpiAcquisitionSimulatorPage: React.FC<Props> = ({ onRdvClick }) => (
  <main className="bg-slate-50 dark:bg-gray-900">
    <section className="px-4 pt-8 pb-3 text-center">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Outil gratuit • sans inscription</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white md:text-5xl">Simulateur SCPI 2026</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">Estimez vos revenus SCPI en détention directe, leur fiscalité et l'effet du délai de jouissance à partir de vos propres hypothèses.</p>
      </div>
    </section>

    <ScpiDirectIncomeSimulator embedded />

    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Calculator, '50 000 €', 'À 5 % brut, l’ordre de grandeur avant fiscalité est de 2 500 € par an en année pleine.'],
            [BarChart3, '100 000 €', 'À 5 % brut, l’ordre de grandeur avant fiscalité est de 5 000 € par an en année pleine.'],
            [ShieldCheck, '200 000 €', 'À 5 % brut, l’ordre de grandeur avant fiscalité est de 10 000 € par an en année pleine.'],
          ].map(([Icon, title, text]: any) => (
            <article key={title} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <Icon className="mb-3 h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">Exemple : {title} en SCPI</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{text}</p>
            </article>
          ))}
        </div>

        <article className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 md:p-8">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Ce que le simulateur permet réellement d’arbitrer</h2>
          <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">Un taux de distribution seul ne suffit pas pour juger un investissement. Le revenu réellement disponible dépend notamment du délai de jouissance, de la fiscalité, de l’origine géographique des revenus et de la durée de détention. Les résultats affichés sont des estimations fondées sur les hypothèses saisies et ne constituent ni une promesse de rendement ni un conseil personnalisé.</p>
          <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">Les SCPI présentent un risque de perte en capital et de liquidité. Les revenus et la valeur des parts peuvent évoluer à la hausse comme à la baisse. La fiscalité des revenus étrangers doit être appréciée selon les conventions fiscales applicables et la situation de l’investisseur.</p>
        </article>

        <div className="rounded-2xl bg-gray-950 p-7 text-white md:flex md:items-center md:justify-between md:gap-8">
          <div><h2 className="text-2xl font-bold">Le rendement ne suffit pas pour choisir une SCPI.</h2><p className="mt-2 text-gray-300">Compare ensuite les SCPI sur leurs données patrimoniales, leur trajectoire et leurs signaux de vigilance.</p></div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
            <a href="/comparateur-scpi/" className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-700">Comparer les SCPI <ArrowRight className="h-4 w-4" /></a>
            <button onClick={onRdvClick} className="rounded-lg border border-gray-600 px-5 py-3 font-semibold hover:bg-gray-800">Étudier mon projet</button>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default ScpiAcquisitionSimulatorPage;
