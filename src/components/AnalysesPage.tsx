import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  Database,
  Gauge,
  LineChart,
  Radar,
  Search,
  ShieldCheck,
} from 'lucide-react';

const researchPillars = [
  {
    icon: Radar,
    title: 'Analyses SCPI',
    description:
      'Lecture structurée des indicateurs d’exploitation, de valorisation et de liquidité : rendement, TOF, endettement, valeur de reconstitution, prix de part et profondeur du marché.',
    href: '/comparateur-scpi/',
    cta: 'Comparer les SCPI',
  },
  {
    icon: LineChart,
    title: 'Analyses de marché',
    description:
      'Décryptage des tendances qui modifient le couple rendement/risque : collecte, évolution des prix, marché secondaire, refinancement, secteurs et zones géographiques.',
    href: '/actualites/',
    cta: 'Voir les analyses de marché',
  },
  {
    icon: AlertTriangle,
    title: 'Signaux d’alerte',
    description:
      'Identification des points de vigilance avant souscription : dette, vacance, tension de liquidité, concentration, décote/surcote et incohérences entre rendement affiché et fondamentaux.',
    href: '/risques-scpi/',
    cta: 'Comprendre les risques',
  },
  {
    icon: Database,
    title: 'Méthodologie & sources',
    description:
      'Priorité aux documents des sociétés de gestion et aux données réglementaires. Les indicateurs sont datés, contextualisés et distingués des estimations ou interprétations.',
    href: '/methodologie-donnees-scpi/',
    cta: 'Consulter la méthodologie',
  },
];

const analysisGrid = [
  {
    icon: Building2,
    label: 'Patrimoine',
    text: 'Secteurs, géographies, concentration, diversification et qualité des actifs.',
  },
  {
    icon: Gauge,
    label: 'Exploitation',
    text: 'TOF, vacance, durée des baux, qualité locative et dynamique des loyers.',
  },
  {
    icon: BarChart3,
    label: 'Financement',
    text: 'Endettement, coût de la dette, maturités et sensibilité au refinancement.',
  },
  {
    icon: Activity,
    label: 'Rendement',
    text: 'Distribution, soutenabilité du rendement et cohérence avec les fondamentaux.',
  },
  {
    icon: Search,
    label: 'Valorisation',
    text: 'Prix de part, valeur de reconstitution, décote/surcote et trajectoire de valorisation.',
  },
  {
    icon: ShieldCheck,
    label: 'Liquidité',
    text: 'Collecte, retraits, marché secondaire et capacité réelle à sortir dans de bonnes conditions.',
  },
];

const AnalysesPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.10),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <Radar className="h-4 w-4" />
              MaximusSCPI Research
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Analyser une SCPI avant de regarder son rendement
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              La performance affichée n’est qu’un résultat. MaximusSCPI Research cherche à comprendre ce qui la produit,
              si elle est soutenable et quels risques peuvent dégrader la valeur ou la liquidité des parts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/comparateur-scpi/"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Accéder au comparateur
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/methodologie-donnees-scpi/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
              >
                Voir la méthodologie
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">4 niveaux de lecture</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Le centre de recherche MaximusSCPI</h2>
          <p className="mt-3 text-slate-400">
            L’objectif n’est pas de produire un classement décoratif, mais de rendre chaque conclusion vérifiable et exploitable.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {researchPillars.map(({ icon: Icon, title, description, href, cta }) => (
            <article
              key={title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-emerald-500/40 hover:bg-slate-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{description}</p>
              <a
                href={href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200"
              >
                {cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">Radar MaximusSCPI</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Une lecture multi-critères, pas un score unique</h2>
            <p className="mt-3 text-slate-400">
              Un bon rendement ne compense pas automatiquement une liquidité dégradée, une dette élevée ou un prix de part trop tendu.
              Chaque axe doit pouvoir être lu séparément.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analysisGrid.map(({ icon: Icon, label, text }) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-blue-300" />
                  <h3 className="font-semibold text-white">{label}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-7">
          <div className="flex items-center gap-3 text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Ce que signifie une vigilance</h2>
          </div>
          <p className="mt-4 leading-7 text-slate-300">
            Une vigilance n’est pas une condamnation de la SCPI. Elle signale un écart mesurable ou une information à contrôler :
            seuil dépassé, tendance défavorable, donnée ancienne ou incohérence avec d’autres indicateurs.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Chaque alerte utile doit préciser le motif, le seuil, la valeur observée, la source et la date de la donnée.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7">
          <div className="flex items-center gap-3 text-emerald-300">
            <BookOpenCheck className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-white">Hiérarchie de confiance</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
            <p><strong className="text-white">Certain :</strong> donnée publiée ou information réglementaire vérifiable.</p>
            <p><strong className="text-white">Probable :</strong> interprétation étayée par plusieurs indicateurs convergents.</p>
            <p><strong className="text-white">À vérifier :</strong> information incomplète, ancienne ou nécessitant une confirmation de la société de gestion.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-7 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-white">Passer de l’analyse à la comparaison</h2>
              <p className="mt-2 text-slate-300">
                Compare les SCPI sur plusieurs critères avant de retenir une allocation. Le rendement seul ne doit pas piloter la décision.
              </p>
            </div>
            <a
              href="/comparateur-scpi/"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 lg:mt-0"
            >
              Ouvrir le comparateur
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AnalysesPage;
