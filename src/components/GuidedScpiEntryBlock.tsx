import React from 'react';

interface GuidedScpiEntryBlockProps {
  // Callback déclenché au clic sur le CTA principal (quiz rapide → parcours guidé).
  onStart?: () => void;
  // Callback vers la page « Outils & simulateurs SCPI » (lien secondaire discret).
  onOpenTools?: () => void;
  // Optionnel : id d'ancre vers laquelle scroller si onStart n'est pas fourni
  targetId?: string;
  className?: string;
}

/**
 * Bloc d'entrée homepage — « Quiz SCPI rapide » orienté conversion.
 * Le questionnaire profil investisseur complet n'est plus affiché directement
 * sur la homepage : il est désormais référencé dans la page « Outils &
 * simulateurs SCPI » (/simulateurs). Outil informatif, sans recommandation
 * personnalisée automatique.
 */
export const GuidedScpiEntryBlock: React.FC<GuidedScpiEntryBlockProps> = ({
  onStart,
  onOpenTools,
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

  const openTools = () => {
    if (onOpenTools) {
      onOpenTools();
      return;
    }
    window.history.pushState({}, '', '/simulateurs');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToComparator = () => {
    const comparator = document.getElementById('comparator');
    if (comparator) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const offset = headerHeight + 16;
      const elementPosition = comparator.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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
                Quiz rapide · informatif
              </p>

              <h2
                id="guided-scpi-title"
                className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-white"
              >
                Quiz SCPI rapide : par où commencer ?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-3xl">
                En quelques minutes, identifiez les grandes pistes à analyser selon votre fiscalité,
                votre horizon et votre objectif patrimonial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Démarrer le quiz
              </button>
              <button
                type="button"
                onClick={scrollToComparator}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                Comparer les SCPI directement
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] sm:text-xs text-slate-400">
                Outil informatif : ce quiz est une aide à la réflexion, pas une recommandation personnalisée.
              </p>
              <button
                type="button"
                onClick={openTools}
                className="self-start text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                Accéder aux outils complets →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidedScpiEntryBlock;
