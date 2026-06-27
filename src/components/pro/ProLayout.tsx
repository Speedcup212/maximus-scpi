import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProReportProvider } from '../../contexts/ProReportContext';

interface ProLayoutProps {
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  currentPath: string;
  children: React.ReactNode;
}

export default function ProLayout({ onNavigate, onSignOut, currentPath, children }: ProLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const [dashboardRemountKey, setDashboardRemountKey] = useState(0);

  const handleLogoClick = () => {
    if (currentPath === '/pro/dashboard') {
      setDashboardRemountKey(k => k + 1);
    } else {
      onNavigate('/pro/dashboard');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user && currentPath !== '/pro/login' && currentPath !== '/pro/signup') {
        onNavigate('/pro/login');
      } else if (user && currentPath === '/pro/login') {
        onNavigate('/pro/dashboard');
      }
      setReady(true);
    }
  }, [authLoading, user, currentPath, onNavigate]);

  if (authLoading || !ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Chargement...
      </div>
    );
  }

  if (currentPath === '/pro/login' || currentPath === '/pro/signup') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
          <img
            src="/Maximus logo 250x50 4.svg"
            alt="MaximusSCPI Pro"
            className="h-6 sm:h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={handleLogoClick}
            title="Retour au comparateur"
          />
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 hidden sm:inline">Espace CGP</span>
          <nav className="hidden sm:flex items-center gap-1">
            <button onClick={handleLogoClick}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition ${currentPath === '/pro/dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Comparateur
            </button>
            <button onClick={() => onNavigate('/pro/rapports')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition ${currentPath === '/pro/rapports' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Mes liens clients
            </button>
            <button onClick={() => onNavigate('/pro/settings')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition ${currentPath === '/pro/settings' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Mon cabinet
            </button>
          </nav>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); onSignOut(); }}
          className="text-xs sm:text-sm text-slate-500 hover:text-red-400 transition px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-950/30 flex-shrink-0">
          Déconnexion
        </button>
      </header>
      <main className="flex-1 overflow-y-auto pb-14 sm:pb-0" key={dashboardRemountKey}>
        <ProReportProvider>
          {children}
        </ProReportProvider>
      </main>
      {/* Barre de navigation mobile — même liens que desktop */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-700 flex justify-around items-center py-1.5 pb-[env(safe-area-inset-bottom,8px)]">
        <button onClick={handleLogoClick}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition ${currentPath === '/pro/dashboard' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <span className="text-lg leading-none">📊</span>
          <span>Comparateur</span>
        </button>
        <button onClick={() => onNavigate('/pro/rapports')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition ${currentPath === '/pro/rapports' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <span className="text-lg leading-none">🔗</span>
          <span>Mes liens clients</span>
        </button>
        <button onClick={() => onNavigate('/pro/settings')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition ${currentPath === '/pro/settings' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <span className="text-lg leading-none">🏢</span>
          <span>Mon cabinet</span>
        </button>
        <button onClick={async () => { await supabase.auth.signOut(); onSignOut(); }}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-slate-500">
          <span className="text-lg leading-none">🚪</span>
          <span>Déconnexion</span>
        </button>
      </nav>
    </div>
  );
}
