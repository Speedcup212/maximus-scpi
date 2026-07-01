import React, { useState, useCallback } from 'react';
import ExpertLayout from './ExpertLayout';
import ExpertDashboard from './ExpertDashboard';
import ExpertHoldingSimulator from './ExpertHoldingSimulator';

interface ExpertAppProps {
  initialSection?: string;
  onBackToHome: () => void;
}

type ExpertSection = 'dashboard' | 'holding-simulator';

const ExpertApp: React.FC<ExpertAppProps> = ({ initialSection, onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<ExpertSection>(
    (initialSection as ExpertSection) || 'dashboard'
  );

  const handleNavigate = useCallback((section: string) => {
    const urlMap: Record<string, string> = {
      'dashboard': '/expert-comptable',
      'holding-simulator': '/expert-comptable/simulateur-holding',
    };
    setActiveSection(section as ExpertSection);
    window.history.pushState({}, '', urlMap[section] || '/expert-comptable');
    window.scrollTo(0, 0);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ExpertDashboard onNavigate={handleNavigate} />;
      case 'holding-simulator':
        return <ExpertHoldingSimulator />;
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
