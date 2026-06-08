import React from 'react';
import { UserCheck, Sparkles, Calculator, Scale, BarChart3, ArrowRight, Info, Landmark, Wallet, Layers, RefreshCw, Coins } from 'lucide-react';

interface ToolCard {
  title: string;
  description: string;
  path: string;
  cta: string;
  badge?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

/**
 * Outils SCPI — page regroupant les outils informatifs et préparatoires,
 * organisés par usage : Questionnaires, Simulateurs, Comparateurs.
 * Aucun de ces outils ne constitue une recommandation personnalisée
 * (cf. mention réglementaire MIF2 en bas de page).
 */

// Section 1 — Questionnaires (le complet 32 questions AVANT le quiz rapide).
const QUESTIONNAIRES: ToolCard[] = [
  {
    title: 'Questionnaire investisseur complet',
    description:
      'Évaluez votre profil, votre horizon, vos connaissances financières et votre tolérance au risque.',
    path: '/parcours-guide',
    cta: 'Démarrer le questionnaire complet',
    badge: '32 questions',
    Icon: UserCheck,
  },
  {
    title: 'Quiz SCPI rapide',
    description:
      'Obtenez une première orientation selon votre fiscalité, votre horizon et votre objectif patrimonial.',
    path: '/simulateur-profil-investisseur',
    cta: 'Faire le quiz rapide',
    badge: 'Version rapide',
    Icon: Sparkles,
  },
];

// Section 2 — Simulateurs.
const SIMULATEURS: ToolCard[] = [
  {
    title: 'Simulateur fiscalité SCPI',
    description: "Estimez l'impact fiscal des revenus de SCPI selon votre tranche marginale d'imposition.",
    path: '/simulateur-impact-fiscal-scpi',
    cta: 'Lancer le simulateur',
    Icon: Calculator,
  },
  {
    title: 'Simulateur démembrement',
    description: "Comprenez l'intérêt potentiel de la nue-propriété selon votre horizon d'investissement.",
    path: '/simulateur-demembrement-scpi',
    cta: 'Lancer le simulateur',
    Icon: Scale,
  },
  {
    title: 'Simulateur SCPI à crédit',
    description: 'Mesurez l’effet de levier et le cash-flow d’un achat de parts à crédit.',
    path: '/simulateur-credit-scpi',
    cta: 'Lancer le simulateur',
    Icon: Landmark,
  },
  {
    title: 'Revenus nets SCPI (IR)',
    description: 'Estimez vos revenus réels après fiscalité.',
    path: '/simulateur-revenus-nets-scpi',
    cta: 'Lancer le simulateur',
    Icon: Wallet,
  },
  {
    title: 'Trésorerie IS – SCPI',
    description: 'Projection de trésorerie nette à l’impôt sur les sociétés.',
    path: '/simulateur-tresorerie-is',
    cta: 'Lancer le simulateur',
    Icon: Coins,
  },
  {
    title: 'Fonds euros vs SCPI',
    description: 'Comparatif de réallocation entre fonds euros et SCPI.',
    path: '/simulateur-fonds-euros-scpi',
    cta: 'Lancer le simulateur',
    Icon: Layers,
  },
];

// Section 3 — Comparateurs.
const COMPARATEURS: ToolCard[] = [
  {
    title: 'Comparateur SCPI',
    description: 'Analysez les SCPI référencées selon leurs principaux indicateurs.',
    path: '/comparateur-scpi',
    cta: 'Ouvrir le comparateur',
    Icon: BarChart3,
  },
  {
    title: "Comparateur d'enveloppes",
    description: 'Direct, assurance-vie ou SCI à l’IS : comparez les enveloppes de détention.',
    path: '/simulateur-enveloppes-scpi',
    cta: 'Ouvrir le comparateur',
    Icon: Layers,
  },
  {
    title: 'Comparateur démembrement',
    description: 'Pleine propriété vs nue-propriété vs usufruit.',
    path: '/comparateur-demembrement-scpi',
    cta: 'Ouvrir le comparateur',
    Icon: RefreshCw,
  },
];

const SimulateursHub: React.FC = () => {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCard = (tool: ToolCard) => (
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
      <h3 className="mt-4 text-lg font-semibold">{tool.title}</h3>
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
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">MaximusSCPI</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Simuler et structurer votre projet SCPI</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            Questionnaires, simulateurs et comparateurs pour préparer une décision d’investissement cohérente.
          </p>
        </div>

        {/* Section 1 — Définir votre profil */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Définir votre profil</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Évaluez votre profil avant d’investir.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 gap-5">
            {QUESTIONNAIRES.map(renderCard)}
          </div>
        </section>

        {/* Section 2 — Simuler votre stratégie */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Simuler votre stratégie</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Estimez l’impact de vos choix patrimoniaux.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SIMULATEURS.map(renderCard)}
          </div>
        </section>

        {/* Section 3 — Comparer les solutions */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Comparer les solutions</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Comparez SCPI, enveloppes et stratégies de détention.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPARATEURS.map(renderCard)}
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
