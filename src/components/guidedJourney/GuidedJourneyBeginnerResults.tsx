import React, { useMemo } from 'react';
import { ArrowRight, Compass, Eye, PauseCircle } from 'lucide-react';
import { GuidedJourneyAnswers } from '../../types/guidedJourney';
import { computeBeginnerProfile } from '../../utils/beginnerScoring';

interface GuidedJourneyBeginnerResultsProps {
  answers: GuidedJourneyAnswers;
  onStartExpert: () => void;
  onGoComparator: () => void;
  onStop: () => void;
}

const GuidedJourneyBeginnerResults: React.FC<GuidedJourneyBeginnerResultsProps> = ({
  answers,
  onStartExpert,
  onGoComparator,
  onStop
}) => {
  const profile = useMemo(() => computeBeginnerProfile(answers), [answers]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-300/90">Orientation rapide – Débutant</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">{profile.title}</h1>
            </div>
          </div>

          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Lecture structurée</p>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">
            {profile.summary}
          </p>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 mb-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Comment raisonner avec les SCPI</p>
            <ul className="space-y-2 text-sm text-slate-200">
              {profile.implications.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 mb-6">
            <p className="text-xs uppercase tracking-wide text-amber-300/90 mb-2">Pièges fréquents à éviter</p>
            <ul className="space-y-2 text-sm text-slate-200">
              {profile.vigilance.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 mb-6">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Et maintenant ?</p>
            <p className="text-sm text-slate-300 mb-4">{profile.nextStepHint}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={onStartExpert}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Analyse de cohérence
              </button>
              <button
                onClick={onGoComparator}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Comparateur autonome
              </button>
              <button
                onClick={onStop}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <PauseCircle className="h-4 w-4" />
                Arrêter ici
              </button>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400">
            Résultat informatif et pédagogique, sans conseil personnalisé ni incitation à investir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidedJourneyBeginnerResults;
