import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerBoxProps {
  className?: string;
}

const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({ className = '' }) => {
  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 shadow-lg border-2 border-amber-200 dark:border-amber-800 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
            Avertissement
          </h4>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Les performances passées ne préjugent pas des performances futures.
            L'investissement en SCPI comporte des risques de perte en capital et de liquidité limitée.
            Les revenus ne sont pas garantis et dépendent de l'évolution du marché immobilier.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBox;
