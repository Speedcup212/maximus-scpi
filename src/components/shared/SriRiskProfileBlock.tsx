import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Entrée représentant une SCPI dans le calcul du profil de risque.
 * Supporte aussi bien `scpi: { profilRisque }` (structure Portfolio)
 * que `{ profilRisque }` directement (SCPIExtended).
 */
export interface SriInputScpi {
  profilRisque?: number;
  name?: string;
  scpi?: { profilRisque?: number; name?: string };
}

export interface SriRiskProfileBlockProps {
  /** SCPI sélectionnées avec leur poids/percentage */
  scpis: Array<SriInputScpi & { weight?: number; percentage?: number }>;
  /** Titre du bloc (par défaut "Profil de risque moyen (SRI)") */
  title?: string;
  /** Texte explicatif sous la jauge */
  disclaimer?: string;
  /** Variante compacte (moins de padding) */
  compact?: boolean;
}

/**
 * Bloc Profil de risque moyen (SRI) partagé entre espace public et espace Pro.
 *
 * Calcule une moyenne pondérée du SRI (1-7) à partir des SCPI fournies.
 * - Le poids est pris depuis `weight` ou `percentage` (normalisé).
 * - Si aucun poids, moyenne simple.
 * - Les SCPI sans `profilRisque` sont exclues du calcul.
 * - Si aucune SCPI n'a de SRI, affiche "SRI non disponible".
 */
const SriRiskProfileBlock: React.FC<SriRiskProfileBlockProps> = ({
  scpis,
  title = 'Profil de risque moyen (SRI)',
  disclaimer = 'Moyenne pondérée des indicateurs synthétiques de risque (SRI) figurant dans les DIC des SCPI sélectionnées.',
  compact = false,
}) => {
  // Extraire profilRisque et poids pour chaque SCPI
  const entries = scpis.map(item => {
    const scpi = item.scpi ?? item;
    const sri = (scpi as any).profilRisque;
    const weight = item.weight ?? item.percentage ?? 0;
    return {
      sri,
      weight,
      name: (scpi as any).name ?? (scpi as any).scpiName ?? 'Inconnu',
    };
  });

  // Calculer la moyenne pondérée
  const hasAnySri = entries.some(e => typeof e.sri === 'number' && e.sri >= 1 && e.sri <= 7);
  let score: number | null = null;
  const missingNames: string[] = [];

  if (hasAnySri) {
    let totalWeight = 0;
    let weightedSriSum = 0;

    entries.forEach(e => {
      if (typeof e.sri === 'number' && e.sri >= 1 && e.sri <= 7) {
        if (e.weight > 0) {
          weightedSriSum += e.sri * e.weight;
          totalWeight += e.weight;
        }
      } else {
        missingNames.push(e.name);
      }
    });

    if (totalWeight === 0) {
      // Fallback : moyenne simple si aucun poids disponible
      const validSri = entries
        .filter(e => typeof e.sri === 'number' && e.sri >= 1 && e.sri <= 7)
        .map(e => e.sri as number);
      if (validSri.length > 0) {
        score = validSri.reduce((s, v) => s + v, 0) / validSri.length;
      }
    } else {
      score = weightedSriSum / totalWeight;
    }

    // Arrondir à 1 décimale
    if (score !== null) {
      score = Math.round(score * 10) / 10;
    }
  }

  const hasScore = score !== null && hasAnySri;
  const pad = compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4';
  const barH = compact ? 'h-2.5 sm:h-3' : 'h-3 sm:h-4';
  const titleSize = compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm';
  const scoreSize = compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base';
  const legendSize = compact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]';
  const discSize = compact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]';

  return (
    <div className={`bg-slate-800/50 rounded-lg ${pad} border border-slate-700`}>
      <h4 className={`${titleSize} font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-1.5`}>
        <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400 flex-shrink-0" />
        {title}
      </h4>

      {hasScore ? (
        <>
          {/* Barres de risque 1-7 avec remplissage fractionnaire */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex-1 flex gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                const s = score!;
                const fullBars = Math.floor(s);
                const fraction = s - fullBars;
                const isFull = level <= fullBars;
                const isFractional = !isFull && level === fullBars + 1 && fraction > 0;
                return (
                  <div
                    key={level}
                    className={`flex-1 ${barH} rounded-sm relative overflow-hidden transition-all duration-300`}
                    title={`Niveau ${level}/7`}
                  >
                    <div className={`absolute inset-0 ${isFull ? 'bg-teal-300' : 'bg-slate-600'}`} />
                    {(isFull || isFractional) && (
                      <div
                        className="absolute inset-y-0 left-0 bg-teal-300 opacity-100"
                        style={{ width: isFractional ? `${Math.round(fraction * 100)}%` : '100%' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <span className={`${scoreSize} font-bold text-white min-w-[2.5rem] text-right tabular-nums`}>
              {score!.toFixed(1).replace('.', ',')}/7
            </span>
          </div>
          {/* Légende */}
          <div className="flex justify-between mt-1 sm:mt-1.5">
            <span className={`${legendSize} text-slate-500`}>Prudent</span>
            <span className={`${legendSize} text-slate-500`}>Équilibré</span>
            <span className={`${legendSize} text-slate-500`}>Dynamique</span>
          </div>
          {missingNames.length > 0 && scpis.length > 0 && (
            <p className={`${discSize} text-amber-400/80 mt-1.5 sm:mt-2 leading-relaxed`}>
              ⚠ SRI non disponible pour : {missingNames.join(', ')}.
              Le score est calculé uniquement sur les SCPI disposant d'un SRI DIC.
            </p>
          )}
          <p className={`${discSize} text-slate-400 mt-1.5 sm:mt-2 italic leading-relaxed`}>
            {disclaimer}
          </p>
        </>
      ) : (
        <>
          <p className={`${scoreSize} text-slate-400 italic`}>
            SRI non disponible
          </p>
          <p className={`${discSize} text-slate-500 mt-1 leading-relaxed`}>
            Aucune SCPI sélectionnée ne dispose d'un indicateur synthétique de risque (SRI) renseigné.
          </p>
        </>
      )}
    </div>
  );
};

export default SriRiskProfileBlock;
