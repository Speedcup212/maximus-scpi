import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import type { Case } from '../types';

type ClientCasesProps = {
  onNavigate: (path: string) => void;
};

const ClientCases: React.FC<ClientCasesProps> = ({ onNavigate }) => {
  const { signOut } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase.from('cases').select('*').order('updated_at', { ascending: false });
      if (data) {
        setCases(data as Case[]);
      }
    };
    fetchCases();
  }, []);

  return (
    <AppLayout role="client" title="Mes dossiers" onNavigate={onNavigate} onSignOut={signOut}>
      <div className="space-y-4">
        {cases.length === 0 && (
          <EmptyState
            title="Aucun dossier"
            description="Dès qu’un dossier est créé, il apparaîtra ici."
          />
        )}
        {cases.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(`/app/client/dossiers/${item.id}`)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left"
          >
            <div>
              <div className="text-sm font-semibold text-white">{item.title}</div>
              <div className="text-xs text-slate-400">Dernière activité : {new Date(item.last_activity_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <StatusBadge status={item.status} />
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default ClientCases;
