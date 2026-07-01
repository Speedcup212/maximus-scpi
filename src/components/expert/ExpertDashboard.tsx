import React from 'react';
import { Calculator, Landmark, TrendingUp, ChevronRight, Building2, Shield, FileText } from 'lucide-react';

interface ExpertDashboardProps {
  onNavigate: (section: string) => void;
}

const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Cabinet comptable
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Espace Expert-Comptable
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Chiffrage société — trésorerie, usufruit temporaire SCPI et fiscalité IS.
          Outils dédiés aux cabinets comptables pour simuler et analyser les stratégies d'investissement SCPI via société.
        </p>
      </div>

      {/* Outils */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Simulateur Holding IS */}
        <button
          onClick={() => onNavigate('holding-simulator')}
          className="group text-left bg-slate-900 border border-slate-800 hover:border-emerald-600/50 rounded-xl p-6 transition-all hover:bg-slate-900/80"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600/30 transition-colors">
              <Calculator className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1.5">
                Simulateur Holding IS
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Simulez l'impact fiscal d'un investissement en usufruit temporaire SCPI
                via une société à l'IS. Projection complète : résultat fiscal, IS, cash-flow.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                  <Landmark className="w-3 h-3" /> IS société
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                  <TrendingUp className="w-3 h-3" /> Usufruit temporaire
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                  <FileText className="w-3 h-3" /> Projection annuelle
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
          </div>
        </button>

        {/* À venir */}
        <div className="text-left bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-6 opacity-60">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Landmark className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-500 mb-1.5">
                À venir
              </h3>
              <p className="text-sm text-slate-600">
                De nouveaux outils seront disponibles prochainement pour les cabinets comptables.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Simulation indicative.</strong> Les hypothèses fiscales, comptables et financières
            doivent être validées par l'expert-comptable selon la situation réelle de la société.
            L'outil ne constitue ni un conseil fiscal, ni une recommandation d'investissement,
            ni une déclaration d'adéquation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;
