import React from 'react';
import { Calculator, Landmark, TrendingUp, BarChart3, Shield, ChevronRight, Building2 } from 'lucide-react';

interface ExpertLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
  onBackToHome: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'holding-simulator', icon: Calculator, label: 'Simulateur Holding IS' },
  { id: 'coming-soon', icon: Landmark, label: 'À venir' },
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
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-3"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-xs">Retour au site</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
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
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Shield className="w-3 h-3" />
            <span>Espace réservé • Cabinet</span>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Expert-Comptable</span>
        </div>
        <div className="flex gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 rounded-lg text-xs transition ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400'
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
