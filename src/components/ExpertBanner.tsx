import React from 'react';
import { Star, Shield, Award, MessageCircle } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

interface ExpertBannerProps {
  isDarkMode: boolean;
  onContactClick?: () => void;
  compact?: boolean;
}

const ExpertBanner: React.FC<ExpertBannerProps> = ({
  isDarkMode,
  onContactClick,
  compact = false
}) => {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gradient-to-r from-green-50 to-emerald-50'} border ${isDarkMode ? 'border-gray-700' : 'border-green-100'} rounded-xl ${compact ? 'p-4' : 'p-6 md:p-8'} shadow-lg`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 rounded-full blur-lg opacity-50"></div>
              <img
                src="/cercle Eric Bellaiche bleu.svg"
                alt="Eric Bellaiche - Conseiller en Gestion de Patrimoine"
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl"
                loading="lazy"
                width="96"
                height="96"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Éric Bellaiche
              </h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            <p className={`text-sm md:text-base font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>
              Conseiller en Gestion de Patrimoine et en Investissements Financiers
            </p>

            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
              Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience
            </p>

            {!compact && (
              <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-4 italic leading-relaxed`}>
                "J'ai créé MaximusSCPI pour clarifier la cohérence d'un projet SCPI, même pour les débutants. Mon expertise de 15 ans combinée à l'intelligence artificielle apporte une lecture structurée, sans promesse ni décision à votre place."
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                <Award className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  ACPR
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                <Award className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  CNCEF N° D016571
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                <Award className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Orias N°13001580
                </span>
              </div>
            </div>
          </div>

          {onContactClick && (
            <div className="flex-shrink-0 w-full md:w-auto">
              <button
                onClick={onContactClick}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Prendre RDV</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertBanner;
