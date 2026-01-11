import React from 'react';

interface HeroProps {
  onCalendlyClick: () => void;
  onGuidedJourneyClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCalendlyClick, onGuidedJourneyClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 sm:px-6 rounded-2xl sm:rounded-3xl overflow-hidden w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(100,116,139,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 via-slate-600/5 to-transparent"></div>

      <div className="relative max-w-5xl mx-auto text-center w-full">
        {/* H1 - Main Headline */}
        <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-black mb-4 leading-tight px-2 text-white max-w-4xl mx-auto">
          Ne cherchez pas la meilleure SCPI.{" "}
          <span className="font-black text-green-400">Construisez le bon portefeuille.</span>
        </h1>

        {/* Sous-titre - Actionnable */}
        <p className="text-lg sm:text-xl text-slate-200 font-semibold mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
          Analysez l'équilibre rendement / risque / diversification de vos SCPI en 2 minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {onGuidedJourneyClick && (
            <button
              onClick={onGuidedJourneyClick}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base transition-colors shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              Démarrer l'analyse
            </button>
          )}
          <button
            onClick={onCalendlyClick}
            className="px-6 py-3 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg font-medium text-base transition-colors border border-slate-600 hover:border-slate-500"
          >
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;