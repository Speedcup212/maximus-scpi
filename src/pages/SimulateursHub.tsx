import React from 'react';
import { UserCheck, Sparkles, Calculator, Scale, BarChart3, ArrowRight, Info } from 'lucide-react';

interface ToolCard {
  title: string;
  description: string;
  path: string;
  cta: string;
  badge?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

/**
 * Outils & simulateurs SCPI — page regroupant les outils informatifs et
 * préparatoires sous forme de cards. Aucun de ces outils ne constitue une
 * recommandation personnalisée (cf. mention réglementaire MIF2 en bas de page).
 */
const PRIMARY_TOOLS: ToolCard[] = [
  {
    title: 'Questionnaire profil investisseur complet',
    description:
      'Évaluez votre profil, votre horizon, vos connaissances financières et votre tolérance au risque à travers le questionnaire complet.',
    path: '/parcours-guide',
    cta: 'Démarrer le questionnaire complet',
    badge: 'Test complet — 32 questions',
    Icon: UserCheck,
  },
  {
    title: 'Quiz SCPI rapide',
    description:
      'Identifiez les grandes pistes à analyser selon votre fiscalité, votre horizon et votre objectif patrimonial.',
    path: '/simulateur-profil-investisseur',
    cta: 'Démarrer le quiz',
    Icon: Sparkles,
  },
  {
    title: 'Simulateur fiscalité SCPI',
    description:
      "Estimez l'impact fiscal potentiel des revenus de SCPI selon votre tranche marginale d'imposition.",
    path: '/simulateur-impact-fiscal-scpi',
    cta: 'Lancer le simulateur',
    Icon: Calculator,
  },
  {
    title: 'Simulateur démembrement',
    description:
      "Comprenez l'intérêt potentiel de la nue-propriété selon votre horizon d'investissement.",
    path: '/simulateur-demembrement-scpi',
    cta: 'Lancer le simulateur',
    Icon: Scale,
  },
  {
    title: 'Comparateur SCPI',
    description: 'Analysez les SCPI référencées selon leurs principaux indicateurs.',
    path: '/comparateur-scpi',
    cta: 'Ouvrir le comparateur',
    Icon: BarChart3,
  },
];

// Outils complémentaires conservés (accessibles, non supprimés).
const SECONDARY_TOOLS: { title: string; description: string; path: string }[] = [
  { title: 'Revenus nets SCPI (IR)', description: 'Estimez vos revenus réels après fiscalité.', path: '/simulateur-revenus-nets-scpi' },
  { title: 'SCPI à crédit', description: 'Effet de levier et cash-flow.', path: '/simulateur-credit-scpi' },
  { title: 'Trésorerie IS – SCPI', description: 'Projection de trésorerie nette à l’impôt sur les sociétés.', path: '/simulateur-tresorerie-is' },
  { title: 'Comparateur d’enveloppes', description: 'Direct, assurance-vie ou SCI à l’IS.', path: '/simulateur-enveloppes-scpi' },
  { title: 'Comparateur démembrement', description: 'Pleine propriété vs nue-propriété vs usufruit.', path: '/comparateur-demembrement-scpi' },
  { title: 'Fonds euros vs SCPI', description: 'Comparatif de réallocation.', path: '/simulateur-fonds-euros-scpi' },
];

const SimulateursHub: React.FC = () => {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">Outils / Simulateurs</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Outils &amp; simulateurs SCPI</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            Des outils informatifs pour structurer votre réflexion avant d’échanger avec un conseiller :
            comprenez votre profil, estimez l’impact fiscal et comparez les SCPI référencées.
          </p>
        </div>

        {/* Cards principales */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRIMARY_TOOLS.map((tool) => (
            <div
              key={tool.path + tool.title}
              className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:border-emerald-400/60 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <tool.Icon className="w-5 h-5" />
                </div>
                {tool.badge && (
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2.5 py-1 text-[11px] font-semibold">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-lg font-semibold">{tool.title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex-1">{tool.description}</p>
              <button
                type="button"
                onClick={() => navigateTo(tool.path)}
                className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                {tool.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Autres simulateurs (conservés) */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Autres simulateurs</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Outils complémentaires pour approfondir un levier précis.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECONDARY_TOOLS.map((tool) => (
              <div
                key={tool.path}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5"
              >
                <h3 className="text-sm font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                <button
                  type="button"
                  onClick={() => navigateTo(tool.path)}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400"
                >
                  Lancer <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Mention réglementaire MIF2 */}
        <div className="mt-12 rounded-2xl border border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Ces outils sont informatifs et préparatoires. Ils ne constituent pas une recommandation
              personnalisée au sens de la réglementation MIF2. Toute recommandation nécessite une analyse
              complète validée par un conseiller.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SimulateursHub;
