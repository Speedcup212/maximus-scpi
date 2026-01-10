import React from 'react';
import { CheckCircle2 } from 'lucide-react';

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
        {/* Eyebrow - Tagline */}
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/30 shadow-lg shadow-blue-500/10 text-blue-300">
          Outil d'analyse de portefeuille SCPI
        </div>

        {/* H1 - Main Headline (positionnement de marque) */}
        <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-black mb-3 leading-tight px-2 text-white max-w-4xl mx-auto">
          Ne cherchez pas la meilleure SCPI.{" "}
          <span className="font-black text-green-400">Construisez le bon portefeuille.</span>
        </h1>

        {/* Trust Indicators - Compact, orientés méthode et accompagnement */}
        <div className="flex flex-wrap gap-4 justify-center items-center text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Analyse multi‑critères de votre portefeuille SCPI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Équilibre rendement, risque et diversification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Accompagnement personnalisé par un conseiller</span>
          </div>
        </div>

        {/* H2 - Subtitle (promesse : outil + portefeuille + équilibre) */}
        <h2 className="text-lg sm:text-lg md:text-xl font-semibold mb-6 max-w-3xl mx-auto leading-relaxed px-4 text-slate-300">
          Un outil pour analyser l'équilibre de votre portefeuille SCPI, au‑delà du simple rendement.
        </h2>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          {onGuidedJourneyClick && (
            <button
              onClick={onGuidedJourneyClick}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base transition-colors shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              Démarrer l'analyse
            </button>
          )}
          <button
            onClick={onCalendlyClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-base transition-colors shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Prendre rendez-vous
          </button>
        </div>

        {/* Secondary CTA - Subtle Links */}
        <div className="mb-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCalendlyClick}
            className="text-slate-400 hover:text-white text-sm font-medium underline decoration-slate-600 hover:decoration-white underline-offset-4 transition-all duration-200"
          >
            Préparer mon portefeuille avec un conseiller expert
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;