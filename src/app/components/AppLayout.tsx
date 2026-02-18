import React from 'react';
import { LogOut, LayoutDashboard, Users, FileText, Shield } from 'lucide-react';
import type { ProfileRole } from '../types';

type AppLayoutProps = {
  role: ProfileRole;
  title: string;
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
};

const AppLayout: React.FC<AppLayoutProps> = ({ role, title, children, onNavigate, onSignOut }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: role === 'partner' ? '/app/partner' : role === 'admin' ? '/app/admin' : '/app/client' },
    ...(role === 'client'
      ? [
          { id: 'cases', label: 'Mes dossiers', icon: FileText, path: '/app/client/dossiers' }
        ]
      : []),
    ...(role === 'partner'
      ? [
          { id: 'clients', label: 'Clients', icon: Users, path: '/app/partner/clients' }
        ]
      : []),
    ...(role === 'admin'
      ? [
          { id: 'admin', label: 'Administration', icon: Shield, path: '/app/admin' }
        ]
      : [])
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-slate-900/40 p-6">
          <div className="text-lg font-semibold">MaximusSCPI</div>
          <div className="mt-6 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-6">
            <button
              onClick={onSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Espace privé</p>
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
              <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
                <span>Rôle : {role}</span>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
