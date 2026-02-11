import React from 'react';

interface GuidedScpiEntryBlockProps {
  // Callback déclenché au clic sur le CTA
  onStart?: () => void;
  // Optionnel : id d'ancre vers laquelle scroller si onStart n'est pas fourni
  targetId?: string;
  className?: string;
}

export const GuidedScpiEntryBlock: React.FC<GuidedScpiEntryBlockProps> = ({
  onStart,
  targetId = 'guided-journey',
  className = '',
}) => {
  const start = () => {
    if (onStart) {
      onStart();
      return;
    }

    // Comportement par défaut : scroll vers une section identifiée
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToComparator = () => {
    const comparator = document.getElementById('comparator');
    if (comparator) {
      comparator.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className={`w-full px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 ${className}`}
      aria-labelledby="guided-scpi-title"
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
          {/* Halo discret derrière le CTA */}
          <div className="pointer-events-none absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 px-5 py-7 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300/90 border border-slate-700/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Test complet · 32 questions
              </p>

              <h2
                id="guided-scpi-title"
                className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-white"
              >
                Test complet : profil investisseur + pré-liste de SCPI à comparer
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-3xl">
                En 8 minutes : profil identifié + pré-liste + points à vérifier (frais, secteurs, zones).
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5 sm:p-6 shadow-inner shadow-black/50">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">
                    Test complet • 8 min
                  </span>
                  <span className="text-[11px] text-slate-400">32 questions</span>
                </div>
                <h3 className="mt-3 text-lg sm:text-xl font-semibold text-white">
                  Ce que vous obtenez
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Profil investisseur + pré-liste de SCPI + points à vérifier avant décision.
                </p>
                <ul className="mt-3 space-y-1 text-xs sm:text-sm text-slate-300">
                  <li>8 min • 32 questions</li>
                  <li>Pré-liste + critères clés (frais, secteurs, zones)</li>
                  <li>Résultat clair selon votre profil</li>
                </ul>
                <button
                  type="button"
                  onClick={start}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
                >
                  Faire le test complet (8 min)
                </button>
                <button
                  type="button"
                  onClick={scrollToComparator}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  Comparer les SCPI
                </button>
              </div>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-400">
              Outil informatif : la pré-liste est une aide à la comparaison, pas une recommandation personnalisée.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidedScpiEntryBlock;

