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
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between shrink-0">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">Espace CGP</span>
        <button onClick={async () => { await supabase.auth.signOut(); onSignOut(); }}
          className="text-xs sm:text-sm text-slate-500 hover:text-red-400 transition px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-950/30 flex-shrink-0">
          Déconnexion
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
