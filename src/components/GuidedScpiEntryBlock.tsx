import React from 'react';

interface GuidedScpiEntryBlockProps {
  // Callback déclenché au clic sur le CTA
  onStart?: (mode?: 'beginner' | 'expert') => void;
  // Optionnel : id d'ancre vers laquelle scroller si onStart n'est pas fourni
  targetId?: string;
  className?: string;
}

export const GuidedScpiEntryBlock: React.FC<GuidedScpiEntryBlockProps> = ({
  onStart,
  targetId = 'guided-journey',
  className = '',
}) => {
  const startWithMode = (mode: 'beginner' | 'expert') => {
    try {
      sessionStorage.setItem('guidedJourneyPreferredMode', mode);
    } catch (e) {
      // Erreur silencieuse
    }

    if (onStart) {
      onStart(mode);
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

          <div className="relative flex flex-col gap-6 px-5 py-7 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300/90 border border-slate-700/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Diagnostic de cohérence · 2 niveaux
              </p>

              <h2
                id="guided-scpi-title"
                className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-white"
              >
                Vérifiez la cohérence de votre projet SCPI
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-3xl">
                Deux lectures complémentaires pour valider ou invalider une allocation avant engagement.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-inner shadow-black/40">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                    Lecture rapide
                  </span>
                  <span className="text-[11px] text-slate-400">13 questions</span>
                </div>
                <h3 className="mt-3 text-lg sm:text-xl font-semibold text-white">
                  Diagnostic de cohérence – Lecture rapide
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Un premier diagnostic pour comprendre si votre projet SCPI repose sur des bases cohérentes, sans décision d’investissement.
                  Ce diagnostic vise à révéler les déséquilibres potentiels avant toute décision engageante.
                </p>
                <ul className="mt-3 space-y-1 text-xs sm:text-sm text-slate-300">
                  <li>2–3 minutes · lecture simplifiée</li>
                  <li>Repères de cohérence immédiats</li>
                  <li>Aucune sélection, aucune décision d’investissement</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startWithMode('beginner')}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
                >
                  Lancer le diagnostic rapide
                </button>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5 sm:p-6 shadow-inner shadow-black/50">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">
                    Niveau avancé
                  </span>
                  <span className="text-[11px] text-slate-400">25–35 questions</span>
                </div>
                <h3 className="mt-3 text-lg sm:text-xl font-semibold text-white">
                  Analyse de cohérence patrimoniale – Niveau avancé
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Analyse structurée des équilibres rendement / risque / diversification, destinée à valider ou invalider une allocation SCPI avant engagement.
                  Ce diagnostic vise à révéler les déséquilibres potentiels avant toute décision engageante.
                </p>
                <ul className="mt-3 space-y-1 text-xs sm:text-sm text-slate-300">
                  <li>8–10 minutes · niveau détaillé</li>
                  <li>Score de cohérence et contraintes</li>
                  <li>Structure de portefeuille plus fine</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startWithMode('expert')}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
                >
                  Lancer l’analyse de cohérence
                </button>
              </div>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-400">
              Cadre informatif uniquement · Aucun conseil personnalisé · Aucune recommandation d’investissement · Aucune promesse de performance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidedScpiEntryBlock;

