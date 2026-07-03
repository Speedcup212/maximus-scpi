import React, { useState, useCallback, useEffect } from 'react';
import ExpertLayout from './ExpertLayout';
import ExpertDashboard from './ExpertDashboard';
import ExpertHoldingSimulator from './ExpertHoldingSimulator';
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary';
import ExpertDossiersList from './ExpertDossiersList';
import ExpertDossierDetail from './ExpertDossierDetail';
import ExpertSimulationView from './ExpertSimulationView';
import ExpertVerification from './ExpertVerification';
import ExpertAccessRefused from './ExpertAccessRefused';
import ExpertPostLogin from './ExpertPostLogin';
import { Construction, Loader2, AlertTriangle } from 'lucide-react';
import { checkExpertAccess, getRedirectUrl } from '../../utils/expertAccess';

interface ExpertAppProps {
  initialSection?: string;
  initialDossierId?: string;
  initialSimulationId?: string;
  onBackToHome: () => void;
}

type ExpertSection = 'dashboard' | 'holding-simulator' | 'dossiers-list' | 'dossier-detail' | 'simulation-view' | 'verification' | 'post-login' | 'access-refused' | 'register' | 'rapports' | 'parametres';

const URL_MAP: Record<string, string> = {
  'dashboard': '/expert-comptable/dashboard',
  'holding-simulator': '/expert-comptable/simulateur-holding',
  'dossiers-list': '/expert-comptable/dossiers',
  'dossier-detail': '/expert-comptable/dossiers/:dossierId',
  'simulation-view': '/expert-comptable/dossiers/:dossierId/simulations/:simulationId',
  'verification': '/expert-comptable/verification',
  'post-login': '/expert-comptable/post-login',
  'access-refused': '/expert-comptable/access-refused',
  'register': '/expert-comptable/register',
  'rapports': '/expert-comptable/rapports',
  'parametres': '/expert-comptable/parametres',
};

// Sections publiques (pas de check d'accès)
const PUBLIC_SECTIONS: ExpertSection[] = ['post-login', 'access-refused', 'register'];

const ExpertApp: React.FC<ExpertAppProps> = ({ initialSection, initialDossierId, initialSimulationId, onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<ExpertSection>(
    (initialSection as ExpertSection) || 'dashboard'
  );
  const [currentDossierId, setCurrentDossierId] = useState<string | null>(initialDossierId || null);
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(initialSimulationId || null);
  const [guardChecked, setGuardChecked] = useState(false);
  const [guardAllowed, setGuardAllowed] = useState(true);

  // ── Route guard ──
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runGuard = async () => {
      if (PUBLIC_SECTIONS.includes(activeSection)) {
        if (!cancelled) {
          setGuardAllowed(true);
          setGuardChecked(true);
        }
        return;
      }

      try {
        const result = await checkExpertAccess(activeSection);

        if (cancelled) return;

        if (!result.allowed) {
          const redirectUrl = getRedirectUrl(result.redirect);
          window.location.href = redirectUrl;
          setGuardAllowed(false);
        } else {
          setGuardAllowed(true);
        }
      } catch (err) {
        console.error('[ExpertApp guard] Erreur lors de la vérification d\'accès :', err);
        // En cas d'erreur, on débloque quand même pour éviter le spinner infini
        if (!cancelled) {
          setGuardAllowed(true);
        }
      } finally {
        if (!cancelled) setGuardChecked(true);
      }
    };

    // Timeout de sécurité : si la vérification dépasse 8 secondes, on débloque
    timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn('[ExpertApp guard] Timeout de vérification d\'accès — déblocage de sécurité.');
        setGuardChecked(true);
        setGuardAllowed(true);
      }
    }, 8000);

    runGuard();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [activeSection]);

  useEffect(() => {
    if (initialDossierId) {
      setCurrentDossierId(initialDossierId);
    }
    if (initialSimulationId) {
      setCurrentSimulationId(initialSimulationId);
    }
  }, [initialDossierId, initialSimulationId]);

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section as ExpertSection);
    window.history.pushState({}, '', URL_MAP[section] || '/expert-comptable/dashboard');
    window.scrollTo(0, 0);
  }, []);

  const handleOpenDossier = useCallback((dossierId: string) => {
    setCurrentDossierId(dossierId);
    setActiveSection('dossier-detail');
    window.history.pushState({}, '', `/expert-comptable/dossiers/${dossierId}`);
    window.scrollTo(0, 0);
  }, []);

  const handleViewSimulation = useCallback((simId: string) => {
    setCurrentSimulationId(simId);
    setActiveSection('simulation-view');
    window.history.pushState({}, '', `/expert-comptable/dossiers/${currentDossierId}/simulations/${simId}`);
    window.scrollTo(0, 0);
  }, [currentDossierId]);

  const handleBackToDossier = useCallback(() => {
    setCurrentSimulationId(null);
    setActiveSection('dossier-detail');
    if (currentDossierId) {
      window.history.pushState({}, '', `/expert-comptable/dossiers/${currentDossierId}`);
    }
    window.scrollTo(0, 0);
  }, [currentDossierId]);

  const handleBackToDossiers = useCallback(() => {
    setCurrentDossierId(null);
    setCurrentSimulationId(null);
    setActiveSection('dossiers-list');
    window.history.pushState({}, '', '/expert-comptable/dossiers');
    window.scrollTo(0, 0);
  }, []);

  // ── Spinner pendant le guard ──
  if (!guardChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  // ── Accès refusé : redirection avec fallback ──
  if (!guardAllowed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-amber-950/50 border border-amber-900/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Redirection vers l'espace Expert-Comptable</h2>
          <p className="text-sm text-slate-400">
            Votre session a expiré ou votre accès n'a pas pu être vérifié.
          </p>
          <button
            onClick={() => { window.location.href = getRedirectUrl('register'); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Accéder à l'espace Expert-Comptable
          </button>
        </div>
      </div>
    );
  }

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

  // ── Sections publiques : pas de sidebar ──
  if (PUBLIC_SECTIONS.includes(activeSection)) {
    if (activeSection === 'post-login') return <ExpertPostLogin />;
    if (activeSection === 'access-refused') return <ExpertAccessRefused onNavigate={handleNavigate} />;
    if (activeSection === 'register') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
          <ExpertLayout activeSection={activeSection} onNavigate={handleNavigate} onBackToHome={onBackToHome}>
            <div />
          </ExpertLayout>
        </div>
      );
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ExpertDashboard onNavigate={handleNavigate} />;
      case 'holding-simulator':
        return (
          <SimulatorErrorBoundary onBack={() => handleNavigate('dashboard')}>
            <ExpertHoldingSimulator onNavigateToDossier={handleOpenDossier} />
          </SimulatorErrorBoundary>
        );
      case 'dossiers-list':
        return <ExpertDossiersList onNavigate={handleNavigate} onOpenDossier={handleOpenDossier} />;
      case 'dossier-detail':
        if (!currentDossierId) {
          return <ExpertDossiersList onNavigate={handleNavigate} onOpenDossier={handleOpenDossier} />;
        }
        return (
          <ExpertDossierDetail
            dossierId={currentDossierId}
            onBack={handleBackToDossiers}
            onViewSimulation={handleViewSimulation}
            onNavigate={handleNavigate}
          />
        );
      case 'simulation-view':
        if (!currentSimulationId) {
          return (
            <ExpertDossierDetail
              dossierId={currentDossierId || ''}
              onBack={handleBackToDossiers}
              onViewSimulation={handleViewSimulation}
              onNavigate={handleNavigate}
            />
          );
        }
        return <ExpertSimulationView simulationId={currentSimulationId} onBack={handleBackToDossier} />;
      case 'verification':
        return <ExpertVerification onNavigate={handleNavigate} />;
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
