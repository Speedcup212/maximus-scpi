import React from 'react';
import { Building, Calendar, Shield, Award, CheckCircle, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

interface DynamicHeroProps {
  onCalendlyClick: () => void;
  h1?: string;
  description?: string;
}

const DynamicHero: React.FC<DynamicHeroProps> = ({
  onCalendlyClick,
  h1,
  description
}) => {
  const defaultH1 = 'La plateforme la plus performante pour <span class="text-green-400">investir en SCPI</span>';
  const defaultDescription = 'Votre sélection optimisée en moins de 2 minutes';

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 overflow-hidden w-full">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-emerald-600/10 to-transparent"></div>
      <div className="relative max-w-4xl mx-auto text-center w-full">
        <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
          🚀 Réinventer la façon d'investir en SCPI
        </div>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 leading-tight px-2 break-words"
          dangerouslySetInnerHTML={{ __html: h1 || defaultH1 }}
        />

        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-medium px-4 break-words">
          {description || defaultDescription}
        </h2>

        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-lg opacity-50"></div>
                  <img
                    src="/cercle Eric Bellaiche bleu.svg"
                    alt="Eric Bellaiche - Conseiller en Gestion de Patrimoine"
                    className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-xl"
                    loading="eager"
                    width="160"
                    height="160"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Éric Bellaiche
                </h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm sm:text-base text-slate-200 font-semibold">
                    Conseiller en Gestion de Patrimoine et en Investissements Financiers
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience
                  </p>
                </div>
                <blockquote className="relative mb-4">
                  <div className="absolute -left-2 -top-2 text-6xl text-white/20 font-serif">"</div>
                  <p className="relative text-sm sm:text-base text-white/90 leading-relaxed italic pl-6">
                    J'ai créé MaximusSCPI pour rendre l'investissement en SCPI simple, transparent et performant, même pour les débutants. Mon expertise de 15 ans combinée à l'intelligence artificielle vous garantit des recommandations personnalisées.
                  </p>
                </blockquote>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <Shield className="w-4 h-4 text-green-300" />
                    <span className="text-xs sm:text-sm font-semibold text-white">ACPR</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <Award className="w-4 h-4 text-emerald-300" />
                    <span className="text-xs sm:text-sm font-semibold text-white">CNCEF N° D016571</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span className="text-xs sm:text-sm font-semibold text-white">Orias N°13001580</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 w-full">
          <a
            href="#comparator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black text-lg sm:text-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            <Building className="w-5 h-5 sm:w-6 sm:h-6" />
            Comparer les SCPI
          </a>

          <button
            onClick={onCalendlyClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-lg sm:text-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1"
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            Constituer mon portefeuille avec un expert
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-10 px-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-sm sm:text-base font-bold text-white">10k+ analyses IA/jour</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
            <TrendingUp className="w-5 h-5 text-green-300" />
            <span className="text-sm sm:text-base font-bold text-white">+2.3% de performance</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
            <BarChart3 className="w-5 h-5 text-blue-300" />
            <span className="text-sm sm:text-base font-bold text-white">51 SCPI analysées</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicHero;
