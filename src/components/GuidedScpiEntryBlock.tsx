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
                Parcours guidé · 5 questions
              </p>

              <h2
                id="guided-scpi-title"
                className="mt-3 text-2xl sm:text-3xl lg:text-[30px] font-semibold tracking-tight text-white"
              >
                Construisez votre portefeuille SCPI adapté à votre situation
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl">
                Répondez à 5 questions simples et obtenez une recommandation claire,
                personnalisée et immédiatement exploitable.
              </p>

              {/* Micro-bénéfices en un coup d'œil */}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] sm:text-xs text-slate-300/90">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  5 questions simples
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Pas de jargon technique
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Résultat visuel et pédagogique
                </span>
              </div>

              {/* CTA + micro-réassurance */}
              <div className="mt-5 flex flex-col items-start gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleClick}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm sm:text-[15px] font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 hover:shadow-emerald-400/50 active:scale-[0.97]"
                >
                  Créer mon portefeuille SCPI
                </button>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  Aucune connaissance requise · Sans engagement · 2 à 3 minutes
                </p>
              </div>
            </div>

            {/* Colonne droite : visuel simple, compatible mobile/desktop */}
            <div className="flex w-full justify-center lg:w-auto lg:justify-end">
              <div className="relative mt-1 w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-xs sm:text-sm text-slate-200 shadow-inner shadow-black/40">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Aperçu du parcours
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    2–3 min
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    'Votre situation',
                    'Votre horizon de placement',
                    'Votre tolérance aux variations',
                    'Vos objectifs de revenus',
                    'Votre préférence fiscale',
                  ].map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] text-slate-200">{label}</p>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                            style={{ width: `${40 + index * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t border-slate-800/80 pt-3">
                  <p className="text-[11px] text-slate-300">
                    À la fin, vous obtenez une{' '}
                    <span className="font-semibold text-emerald-300">
                      proposition de portefeuille SCPI
                    </span>{' '}
                    cohérente avec vos réponses.
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

