import React from 'react';
import { FileText, LayoutDashboard, LogOut, Shield, Users, WalletCards } from 'lucide-react';
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
    {
      id: 'dashboard',
      label: role === 'client' ? 'Mon portefeuille' : 'Dashboard',
      icon: role === 'client' ? WalletCards : LayoutDashboard,
      path: role === 'partner' ? '/app/partner' : role === 'admin' ? '/app/admin' : '/app/client'
    },
    ...(role === 'client'
      ? [
          { id: 'cases', label: 'Mon dossier', icon: FileText, path: '/app/client/dossiers' }
        ]
      : []),
    ...(role === 'partner'
      ? [
          { id: 'clients', label: 'Clients', icon: Users, path: '/app/partner/clients' }
        ]
      : []),
    ...(role === 'admin'
      ? [
          { id: 'admin', label: 'Administration', icon: Shield, path: '/app/admin' },
          { id: 'requests', label: 'Demandes d’accès', icon: Users, path: '/app/admin/access-requests' }
        ]
      : [])
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-white/10 bg-slate-900/40 p-6 lg:flex">
          <button onClick={() => onNavigate('/')} className="text-left text-lg font-semibold">MaximusSCPI</button>
          {role === 'client' && <div className="mt-1 text-xs text-slate-500">Espace client privé</div>}
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

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 sm:text-xs">Espace privé</p>
                <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
              </div>
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 lg:hidden"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
              <div className="hidden items-center gap-4 text-xs text-slate-400 lg:flex">
                <span>{role === 'client' ? 'Compte client' : `Rôle : ${role}`}</span>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto border-t border-white/5 px-4 py-2 lg:hidden">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
