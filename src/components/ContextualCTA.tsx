import React from 'react';
import { Calculator, BarChart3, TrendingUp, FileText, PiggyBank, Euro, Target } from 'lucide-react';

interface ContextualCTAProps {
  contentKeywords: string[];
  className?: string;
}

interface CTA {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  iconBg: string;
  priority: number;
}

const contextualCTAs: Record<string, CTA> = {
  rendement: {
    title: 'Comparez les Rendements',
    description: 'Trouvez les SCPI avec les meilleurs taux de distribution',
    link: '/meilleures-scpi-rendement',
    icon: <TrendingUp className="h-6 w-6" />,
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    iconBg: 'bg-green-100 dark:bg-green-900',
    priority: 10
  },
  fiscalite: {
    title: 'Simulateur Fiscal',
    description: 'Calculez votre économie d\'impôts avec les SCPI',
    link: '/simulateur-fiscal',
    icon: <Calculator className="h-6 w-6" />,
    bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    priority: 9
  },
  retraite: {
    title: 'Préparez votre Retraite',
    description: 'Découvrez comment constituer un revenu complémentaire',
    link: '/preparer-retraite-scpi',
    icon: <PiggyBank className="h-6 w-6" />,
    bgColor: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    priority: 9
  },
  revenu: {
    title: 'Générez des Revenus Passifs',
    description: 'Créez un revenu complémentaire mensuel avec les SCPI',
    link: '/revenu-complementaire-scpi',
    icon: <Euro className="h-6 w-6" />,
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    priority: 8
  },
  comparateur: {
    title: 'Comparateur Intelligent',
    description: 'Comparez 51 SCPI selon vos critères personnalisés',
    link: '/',
    icon: <BarChart3 className="h-6 w-6" />,
    bgColor: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900',
    priority: 10
  },
  guide: {
    title: 'Guide Complet SCPI',
    description: 'Comprenez les fondamentaux avant d\'investir',
    link: '/comprendre-scpi',
    icon: <FileText className="h-6 w-6" />,
    bgColor: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20',
    textColor: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-slate-100 dark:bg-slate-900',
    priority: 7
  },
  simulation: {
    title: 'Simulez votre Investissement',
    description: 'Estimez vos revenus futurs avec notre simulateur',
    link: '/simulateur',
    icon: <Calculator className="h-6 w-6" />,
    bgColor: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
    textColor: 'text-teal-700 dark:text-teal-300',
    iconBg: 'bg-teal-100 dark:bg-teal-900',
    priority: 8
  },
  objectif: {
    title: 'Définissez vos Objectifs',
    description: 'Trouvez les SCPI adaptées à votre profil',
    link: '/meilleures-scpi-rendement',
    icon: <Target className="h-6 w-6" />,
    bgColor: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
    textColor: 'text-rose-700 dark:text-rose-300',
    iconBg: 'bg-rose-100 dark:bg-rose-900',
    priority: 7
  }
};

const keywordMapping: Record<string, string[]> = {
  rendement: ['rendement', 'performance', 'distribution', 'tdvm', 'taux'],
  fiscalite: ['fiscalité', 'impôt', 'défiscalisation', 'tmi', 'réduction', 'déduction', 'malraux', 'pinel'],
  retraite: ['retraite', 'pension', 'senior', 'retraité'],
  revenu: ['revenu', 'complément', 'passif', 'mensuel', 'trimestriel'],
  comparateur: ['comparer', 'comparaison', 'choisir', 'sélection', 'meilleur'],
  guide: ['comprendre', 'fonctionnement', 'définition', 'explication', 'débuter'],
  simulation: ['simuler', 'calculer', 'estimer', 'projection'],
  objectif: ['objectif', 'profil', 'stratégie', 'adapter']
};

const ContextualCTA: React.FC<ContextualCTAProps> = ({
  contentKeywords,
  className = ''
}) => {
  const matchedCTAs = Object.entries(keywordMapping)
    .map(([ctaKey, keywords]) => {
      const matchCount = keywords.filter(keyword =>
        contentKeywords.some(contentKeyword =>
          contentKeyword.toLowerCase().includes(keyword.toLowerCase())
        )
      ).length;

      if (matchCount === 0) return null;

      return {
        ...contextualCTAs[ctaKey],
        matchScore: matchCount
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b!.matchScore !== a!.matchScore) {
        return b!.matchScore - a!.matchScore;
      }
      return b!.priority - a!.priority;
    })
    .slice(0, 2);

  if (matchedCTAs.length === 0) {
    return (
      <div className={`bg-gradient-to-br ${contextualCTAs.comparateur.bgColor} rounded-xl p-6 shadow-lg ${className}`}>
        <a
          href={contextualCTAs.comparateur.link}
          className="block group"
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${contextualCTAs.comparateur.iconBg} rounded-xl flex items-center justify-center ${contextualCTAs.comparateur.textColor} group-hover:scale-110 transition-transform`}>
              {contextualCTAs.comparateur.icon}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${contextualCTAs.comparateur.textColor} group-hover:underline`}>
                {contextualCTAs.comparateur.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {contextualCTAs.comparateur.description}
              </p>
            </div>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {matchedCTAs.map((cta, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${cta!.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          <a href={cta!.link} className="block group">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 ${cta!.iconBg} rounded-xl flex items-center justify-center ${cta!.textColor} group-hover:scale-110 transition-transform`}>
                {cta!.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${cta!.textColor} group-hover:underline`}>
                  {cta!.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {cta!.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs font-medium bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
                  Recommandé
                </span>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

export default ContextualCTA;
