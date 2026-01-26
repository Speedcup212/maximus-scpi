/**
 * Composant d'avertissement pour les comparaisons France ↔ Europe
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { SCPIExtended } from '../data/scpiDataExtended';
import { getComparisonWarning, needsComparisonWarning } from '../utils/yieldDisplay';

interface ComparisonWarningProps {
  scpiList: (Scpi | SCPIExtended)[];
  className?: string;
}

const ComparisonWarning: React.FC<ComparisonWarningProps> = ({ scpiList, className = '' }) => {
  // Vérifier s'il y a un mélange France/Europe
  const hasMixedComparison = scpiList.length >= 2 && 
    scpiList.some((scpi, idx) => {
      for (let i = idx + 1; i < scpiList.length; i++) {
        if (needsComparisonWarning(scpi, scpiList[i])) {
          return true;
        }
      }
      return false;
    });

  if (!hasMixedComparison) {
    return null;
  }

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2">
            ⚠️ Avertissement de comparaison
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            Vous comparez des SCPI françaises et européennes. Les taux ne sont pas directement comparables :
          </p>
          <ul className="text-sm text-amber-800 dark:text-amber-300 mt-2 ml-4 list-disc space-y-1">
            <li>Les <strong>SCPI françaises</strong> affichent un <strong>taux brut</strong> (avant fiscalité française)</li>
            <li>Les <strong>SCPI européennes</strong> affichent un <strong>taux net</strong> (après fiscalité étrangère prélevée à la source)</li>
            <li>Les revenus européens ne supportent pas les prélèvements sociaux français</li>
          </ul>
          <p className="text-sm text-amber-800 dark:text-amber-300 mt-2 font-medium">
            Pour une comparaison équitable, consultez les taux bruts et nets de chaque SCPI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonWarning;
