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
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <img src="/Maximus logo 250x50 4.svg" alt="MaximusSCPI Pro" className="h-8 object-contain" />
          <span className="text-xs uppercase tracking-widest text-slate-500">Espace CGP</span>
          <nav className="flex items-center gap-1">
            <button onClick={() => onNavigate('/pro/dashboard')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${currentPath === '/pro/dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Comparateur
            </button>
            <button onClick={() => onNavigate('/pro/rapports')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${currentPath === '/pro/rapports' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Mes liens clients
            </button>
            <button onClick={() => onNavigate('/pro/settings')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${currentPath === '/pro/settings' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Mon cabinet
            </button>
          </nav>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); onSignOut(); }}
          className="text-sm text-slate-500 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-red-950/30">
          Deconnexion
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <ProReportProvider>
          {children}
        </ProReportProvider>
      </main>
    </div>
  );
}
