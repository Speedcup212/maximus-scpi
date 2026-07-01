import React from 'react';
import { Calculator, ChevronRight, Building2, Shield, Users, FileText } from 'lucide-react';

interface ExpertDashboardProps {
  onNavigate: (section: string) => void;
}

const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Cabinet comptable
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Tableau de bord Expert-Comptable
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Outils de chiffrage société, fiscalité IS et usufruit temporaire SCPI.
        </p>
      </div>

      {/* Outils */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* Simulateur Holding IS */}
        <button
          onClick={() => onNavigate('holding-simulator')}
          className="group text-left bg-slate-900 border border-slate-800 hover:border-blue-600/50 rounded-xl p-6 transition-all hover:bg-slate-900/80"
        >
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
            <Calculator className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Simulateur Holding IS
          </h3>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Chiffrage trésorerie société, usufruit temporaire, amortissement et impact IS.
          </p>
          <div className="flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
            Lancer le simulateur
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Dossiers clients */}
        <div className="text-left bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-6 opacity-70">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-500 uppercase">
              Bientôt
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-500 mb-2">
            Dossiers clients
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Suivi des simulations réalisées pour les sociétés clientes.
          </p>
        </div>

        {/* Rapports techniques */}
        <div className="text-left bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-6 opacity-70">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-500 uppercase">
              Bientôt
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-500 mb-2">
            Rapports techniques
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Génération de rapports cabinet pour documenter les hypothèses.
          </p>
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
