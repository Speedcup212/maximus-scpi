import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import type { Case } from '../types';

type ClientDashboardProps = {
  onNavigate: (path: string) => void;
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const { signOut } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase.from('cases').select('*').order('updated_at', { ascending: false }).limit(5);
      if (data) {
        setCases(data as Case[]);
      }
    };
    fetchCases();
  }, []);

  return (
    <AppLayout role="client" title="Dashboard client" onNavigate={onNavigate} onSignOut={signOut}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Derniers dossiers</h2>
          <div className="mt-4 space-y-3">
            {cases.length === 0 && (
              <EmptyState
                title="Aucun dossier pour le moment"
                description="Votre conseiller créera votre premier dossier après votre prochain échange."
                action={<button onClick={() => onNavigate('/app/client/dossiers')} className="text-xs text-emerald-200">Voir mes dossiers</button>}
              />
            )}
            {cases.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-3">
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-slate-400">Mis à jour le {new Date(item.updated_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Accès sécurisé</h2>
          <p className="mt-3">
            Vos documents sont stockés de manière privée. Les téléchargements se font via des liens signés à durée limitée.
          </p>
          <button
            onClick={() => onNavigate('/app/client/dossiers')}
            className="mt-6 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100"
          >
            Accéder à mes dossiers
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
