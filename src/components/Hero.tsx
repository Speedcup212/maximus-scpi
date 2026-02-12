import React from 'react';

interface HeroProps {
  onCalendlyClick: () => void;
  onComparatorClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCalendlyClick, onComparatorClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 sm:px-6 rounded-2xl sm:rounded-3xl overflow-hidden w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(100,116,139,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 via-slate-600/5 to-transparent"></div>

      <div className="relative max-w-5xl mx-auto text-center w-full">
        {/* H1 - Main Headline */}
        <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-black mb-4 leading-tight px-2 text-white max-w-4xl mx-auto">
          Comparateur SCPI : construisez un <span className="text-green-400">portefeuille diversifié</span> en quelques clics.
        </h1>

        {/* Sous-titre - Actionnable */}
        <p className="text-lg sm:text-xl text-slate-200 font-semibold mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
          MaximusSCPI vous aide à comparer les SCPI au-delà du rendement : frais, secteurs, zones et diversification, puis à valider votre sélection <span className="text-green-400">en 2 minutes.</span>
        </p>

        {/* CTA Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onComparatorClick || onCalendlyClick}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base transition-colors shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
          >
            Commencer
          </button>
        </div>
        <p className="mt-4 text-xs sm:text-sm text-slate-400">
          Beaucoup d’investisseurs choisissent des SCPI. Peu vérifient réellement si leur portefeuille tient la route.
        </p>
      </div>
    </section>
  );
};

export default Hero;