import { useEffect, useState, lazy, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProReportProvider } from '../../contexts/ProReportContext';

const ProReportBar = lazy(() => import('./ProReportBar'));

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
        Chargement de l'environnement sécurisé...
      </div>
    );
  }

  if (currentPath === '/pro/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      

      {/* ZONE DE TRAVAIL PRINCIPALE */}
      <main className="flex-grow p-10 overflow-y-auto">
        <ProReportProvider>
          {children}
          <Suspense fallback={null}>
            <ProReportBar />
          </Suspense>
        </ProReportProvider>
      </main>
    </div>
  );
}


