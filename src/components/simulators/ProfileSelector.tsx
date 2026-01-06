import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export type InvestmentProfile = 'prudent' | 'neutre' | 'dynamique';

interface ProfileSelectorProps {
  value: InvestmentProfile;
  onChange: (value: InvestmentProfile) => void;
  label?: string;
  className?: string;
}

const PROFILES = [
  {
    value: 'prudent' as InvestmentProfile,
    label: 'Prudent',
    icon: TrendingDown,
    description: 'Hypothèses conservatrices',
    color: 'text-orange-600 dark:text-orange-400'
  },
  {
    value: 'neutre' as InvestmentProfile,
    label: 'Neutre',
    icon: Minus,
    description: 'Hypothèses moyennes',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    value: 'dynamique' as InvestmentProfile,
    label: 'Dynamique',
    icon: TrendingUp,
    description: 'Hypothèses optimistes',
    color: 'text-green-600 dark:text-green-400'
  }
];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  value,
  onChange,
  label = 'Profil de projection',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>

      <div className="grid grid-cols-3 gap-2">
        {PROFILES.map((profile) => {
          const Icon = profile.icon;
          const isSelected = value === profile.value;

          return (
            <button
              key={profile.value}
              type="button"
              onClick={() => onChange(profile.value)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : profile.color}`} />
              <div className="text-center">
                <div className={`text-sm font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {profile.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
        Le profil ajuste des hypothèses de travail (rendement, revalorisation, durée) pour la simulation.
        Ce n'est pas une promesse de performance.
      </p>
    </div>
  );
};
