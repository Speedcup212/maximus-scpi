import React from 'react';
import { Building, CheckCircle2, Zap, TrendingUp, BarChart3 } from 'lucide-react';

interface HeroProps {
  onCalendlyClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCalendlyClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 sm:px-6 rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 overflow-hidden w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(100,116,139,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 via-slate-600/5 to-transparent"></div>

      <div className="relative max-w-5xl mx-auto text-center w-full">
        {/* Eyebrow - Tagline */}
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/30 shadow-lg shadow-blue-500/10 text-blue-300">
          🚀 Réinventer la façon d'investir en SCPI
        </div>

        {/* H1 - Main Headline */}
        <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-black mb-3 leading-tight px-2 text-white max-w-4xl mx-auto">
          Faites travailler votre argent plus efficacement grâce aux SCPI
        </h1>

        {/* Trust Indicators - Compact */}
        <div className="flex flex-wrap gap-4 justify-center items-center text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>10k+ analyses IA/jour</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>51 SCPI analysées</span>
          </div>
          <a
            href="/meilleures-scpi-rendement"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
            <span>🔥 Top 5 Meilleurs Rendements</span>
          </a>
        </div>

        {/* H2 - Subtitle */}
        <h2 className="text-lg sm:text-lg md:text-xl font-semibold mb-4 max-w-3xl mx-auto leading-relaxed px-4 text-slate-300">
          Comparez les meilleures SCPI pour viser +2.3% de performance.
        </h2>

        {/* Secondary CTA - Subtle Link */}
        <div className="mb-2">
          <button
            onClick={onCalendlyClick}
            className="text-slate-400 hover:text-white text-sm font-medium underline decoration-slate-600 hover:decoration-white underline-offset-4 transition-all duration-200"
          >
            ...ou constituer mon portefeuille avec un expert
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;