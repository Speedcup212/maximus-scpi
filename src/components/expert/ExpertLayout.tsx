import React from 'react';
import { Calculator, BarChart3, ChevronRight, Building2, Users, FileText, Settings } from 'lucide-react';

interface ExpertLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
  onBackToHome: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard', available: true },
  { id: 'holding-simulator', icon: Calculator, label: 'Simulateur Holding IS', available: true },
  { id: 'dossiers-clients', icon: Users, label: 'Dossiers clients', available: false },
  { id: 'rapports', icon: FileText, label: 'Rapports', available: false },
  { id: 'parametres', icon: Settings, label: 'Paramètres cabinet', available: false },
];

const ExpertLayout: React.FC<ExpertLayoutProps> = ({ children, activeSection, onNavigate, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 overflow-y-auto hidden lg:flex flex-col">
        {/* Logo / Brand */}
        <div className="p-5 border-b border-slate-800">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-3"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-xs">Retour au site</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Expert-Comptable</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">MaximusSCPI</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Outils cabinet
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.available && onNavigate(item.id)}
                disabled={!item.available}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : item.available
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {!item.available && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-medium">
                    Bientôt
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Building2 className="w-3 h-3" />
            <span>Espace réservé • Cabinet</span>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Expert-Comptable</span>
        </div>
        <div className="flex gap-2">
          {NAV_ITEMS.filter(i => i.available).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 rounded-lg text-xs transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default ExpertLayout;
