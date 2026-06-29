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
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); onSignOut(); }}
          className="text-xs sm:text-sm text-slate-500 hover:text-red-400 transition px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-950/30 flex-shrink-0">
          Déconnexion
        </button>
      </header>
      <main className="flex-1 overflow-y-auto" key={dashboardRemountKey}>
        <ProReportProvider>
          {children}
        </ProReportProvider>
      </main>
    </div>
  );
}
