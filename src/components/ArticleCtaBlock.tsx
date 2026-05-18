import React from 'react';
import { ArrowRight } from 'lucide-react';

export type ArticleCtaBlockProps = {
  variant: 'top' | 'middle';
  topic?: 'demembrement' | 'fiscalite' | 'credit' | 'assurance-vie' | 'risques' | 'general';
};

const handleComparateur = () => {
  window.location.href = '/comparateur-scpi/';
};

const handleRdv = () => {
  if (typeof (window as any).openRdvModal === 'function') {
    (window as any).openRdvModal();
  } else {
    window.location.href = '/comparateur-scpi/';
  }
};

const ArticleCtaBlock: React.FC<ArticleCtaBlockProps> = ({ variant }) => {
  if (variant === 'top') {
    return (
      <div className="my-8 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
          Avant d'aller plus loin
        </p>
        <h2 className="text-lg md:text-xl font-bold text-white mb-3">
          Comparer les SCPI avant de décider
        </h2>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
          Avant d'aller plus loin, comparez les SCPI selon leurs frais, secteurs, zones géographiques, liquidité, risques et cohérence patrimoniale.
        </p>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Information générale uniquement. Investir en SCPI comporte des risques : perte en capital, revenus non garantis, liquidité limitée.
        </p>
        <button
          type="button"
          onClick={handleComparateur}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          Comparer les SCPI
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
        Analyse personnalisée
      </p>
      <h2 className="text-lg md:text-xl font-bold text-white mb-3">
        Besoin d'une analyse adaptée à votre situation ?
      </h2>
      <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
        Une analyse personnalisée nécessite de tenir compte de votre fiscalité, de votre patrimoine, de votre horizon de placement et de votre tolérance au risque.
      </p>
      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Aucune SCPI n'est garantie et aucun rendement n'est promis. Une analyse personnalisée nécessite un recueil d'informations.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleRdv}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors w-full sm:w-auto"
        >
          Analyser ma situation SCPI
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleComparateur}
          className="inline-flex items-center justify-center gap-2 bg-slate-800 text-blue-300 border border-blue-500/50 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors w-full sm:w-auto"
        >
          Comparer les SCPI
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default ArticleCtaBlock;
