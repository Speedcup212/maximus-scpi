import React, { useState, useCallback } from 'react';
import ExpertLayout from './ExpertLayout';
import ExpertDashboard from './ExpertDashboard';
import ExpertHoldingSimulator from './ExpertHoldingSimulator';
import { Construction } from 'lucide-react';

interface ExpertAppProps {
  initialSection?: string;
  onBackToHome: () => void;
}

type ExpertSection = 'dashboard' | 'holding-simulator' | 'dossiers-clients' | 'rapports' | 'parametres';

const URL_MAP: Record<string, string> = {
  'dashboard': '/expert-comptable/dashboard',
  'holding-simulator': '/expert-comptable/simulateur-holding',
  'dossiers-clients': '/expert-comptable/dossiers-clients',
  'rapports': '/expert-comptable/rapports',
  'parametres': '/expert-comptable/parametres',
};

const ExpertApp: React.FC<ExpertAppProps> = ({ initialSection, onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<ExpertSection>(
    (initialSection as ExpertSection) || 'dashboard'
  );

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section as ExpertSection);
    window.history.pushState({}, '', URL_MAP[section] || '/expert-comptable/dashboard');
    window.scrollTo(0, 0);
  }, []);

  const ComingSoon = ({ title, description }: { title: string; description: string }) => (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400">{description}</p>
      </div>
      <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Module à venir</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Ce module est en cours de développement et sera disponible prochainement pour les cabinets d'expertise comptable.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ExpertDashboard onNavigate={handleNavigate} />;
      case 'holding-simulator':
        return <ExpertHoldingSimulator />;
      case 'dossiers-clients':
        return <ComingSoon title="Dossiers clients" description="Suivi des simulations réalisées pour les sociétés clientes." />;
      case 'rapports':
        return <ComingSoon title="Rapports techniques" description="Génération de rapports cabinet pour documenter les hypothèses." />;
      case 'parametres':
        return <ComingSoon title="Paramètres cabinet" description="Configuration de votre espace Expert-Comptable." />;
      default:
        return <ExpertDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <ExpertLayout
      activeSection={activeSection}
      onNavigate={handleNavigate}
      onBackToHome={onBackToHome}
    >
      {renderContent()}
    </ExpertLayout>
  );
};

export default ExpertApp;
