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
  const handleClick = () => {
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

  return (
    <section
      className={`w-full px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 ${className}`}
      aria-labelledby="guided-scpi-title"
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
          {/* Halo discret derrière le CTA */}
          <div className="pointer-events-none absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 px-5 py-7 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:gap-10">
            {/* Colonne gauche : texte */}
            <div className="flex-1">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300/90 border border-slate-700/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Analyse SCPI · 2 modes
              </p>

              <h2
                id="guided-scpi-title"
                className="mt-3 text-2xl sm:text-3xl lg:text-[30px] font-semibold tracking-tight text-white"
              >
                Tu es un moteur d’analyse SCPI pédagogique et structurant.
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
                Cet outil remplace l’ancien bloc “Parcours guidé – 5 questions”. Il est accessible librement,
                sans inscription et sans collecte de données. L’utilisateur choisit un mode d’analyse puis obtient
                un rendu clair, structuré et pédagogique.
              </p>

              <div className="mt-4 space-y-2 text-xs sm:text-sm text-slate-300 max-w-2xl">
                <p className="font-semibold text-slate-100">Cadre impératif (non négociable)</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pas de conseil personnalisé, pas de recommandation d’investissement</li>
                  <li>Aucun nom de SCPI, aucun produit cité</li>
                  <li>Une structure de portefeuille cohérente, jamais une décision</li>
                  <li>Clarté et pédagogie, sans promesse de performance</li>
                </ul>
              </div>

              {/* Micro-bénéfices en un coup d'œil */}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] sm:text-xs text-slate-300/90">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Mode Débutant · 12 questions
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Mode Expert · 25–35 questions
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Résultat structuré et défendable
                </span>
              </div>

              {/* CTA + micro-réassurance */}
              <div className="mt-5 flex flex-col items-start gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleClick}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm sm:text-[15px] font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 hover:shadow-emerald-400/50 active:scale-[0.97]"
                >
                  Démarrer l’analyse SCPI
                </button>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  Sans inscription · Sans collecte · Temps modulable selon le mode
                </p>
              </div>
            </div>

            {/* Colonne droite : visuel simple, compatible mobile/desktop */}
            <div className="flex w-full justify-center lg:w-auto lg:justify-end">
              <div className="relative mt-1 w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-xs sm:text-sm text-slate-200 shadow-inner shadow-black/40">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Choix du mode
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    Étape 0
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs font-semibold text-slate-100">
                      Orientation rapide – Débutant
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      12 questions structurantes · vocabulaire simplifié
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs font-semibold text-slate-100">
                      Analyse approfondie – Expert
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      25–35 questions · score de cohérence et contraintes
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-800/80 pt-3">
                  <p className="text-[11px] text-slate-300">
                    À la fin, vous obtenez une{' '}
                    <span className="font-semibold text-emerald-300">
                      structure d’allocation indicative
                    </span>{' '}
                    et les limites explicites de l’analyse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidedScpiEntryBlock;

