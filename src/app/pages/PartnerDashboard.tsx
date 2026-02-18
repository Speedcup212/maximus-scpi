import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import type { Case } from '../types';

type PartnerDashboardProps = {
  onNavigate: (path: string) => void;
};

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ onNavigate }) => {
  const { signOut } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase.from('cases').select('*').order('updated_at', { ascending: false }).limit(8);
      if (data) setCases(data as Case[]);
    };
    fetchCases();
  }, []);

  return (
    <AppLayout role="partner" title="Dashboard partenaire" onNavigate={onNavigate} onSignOut={signOut}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Dossiers récents</h2>
        <div className="mt-4 space-y-3">
          {cases.length === 0 && (
            <EmptyState title="Aucun dossier" description="Créez un dossier client pour démarrer." />
          )}
          {cases.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(`/app/partner/dossiers/${item.id}`)}
              className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-3 text-left"
            >
              <div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-slate-400">Mis à jour le {new Date(item.updated_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <StatusBadge status={item.status} />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PartnerDashboard;
