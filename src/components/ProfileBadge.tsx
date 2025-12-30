import React from 'react';
import { User, Settings } from 'lucide-react';
import { RiskProfile, ClientProfile } from '../types/riskProfile';

interface ProfileBadgeProps {
  clientProfile: ClientProfile | null;
  onEditProfile: () => void;
  className?: string;
}

const ProfileBadge: React.FC<ProfileBadgeProps> = ({ 
  clientProfile, 
  onEditProfile, 
  className = '' 
}) => {
  if (!clientProfile) {
    return (
      <button
        onClick={onEditProfile}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${className}`}
      >
        <User className="w-4 h-4" />
        <span className="font-medium">Définir mon profil</span>
      </button>
    );
  }

  const { riskProfile } = clientProfile;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 bg-white dark:bg-gray-800"
        style={{ 
          borderColor: riskProfile.color,
          backgroundColor: `${riskProfile.color}10`
        }}
      >
        <span className="text-lg">{riskProfile.icon}</span>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {clientProfile.name}
          </span>
          <span 
            className="text-xs font-medium"
            style={{ color: riskProfile.color }}
          >
            Profil {riskProfile.name}
          </span>
        </div>
      </div>
      
      <button
        onClick={onEditProfile}
        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        title="Modifier le profil"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ProfileBadge;