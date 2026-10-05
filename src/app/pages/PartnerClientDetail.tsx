import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import type { Case, Profile } from '../types';

type PartnerClientDetailProps = {
  clientId: string;
  onNavigate: (path: string) => void;
};

const PartnerClientDetail: React.FC<PartnerClientDetailProps> = ({ clientId, onNavigate }) => {
  const { signOut } = useAuth();
  const [client, setClient] = useState<Profile | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: clientRow } = await supabase.from('profiles').select('*').eq('user_id', clientId).single();
      const { data: casesRows } = await supabase.from('cases').select('*').eq('client_user_id', clientId);
      if (clientRow) setClient(clientRow as Profile);
      if (casesRows) setCases(casesRows as Case[]);
    };
    load();
  }, [clientId]);

  return (
    <AppLayout role="partner" title="Client" onNavigate={onNavigate} onSignOut={signOut}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">{client?.full_name || 'Client'}</h2>
          <p className="text-xs text-slate-400">{client?.phone || 'Téléphone non renseigné'}</p>
        </div>
        <div className="space-y-3">
          {cases.length === 0 && (
            <EmptyState title="Aucun dossier" description="Créez un dossier pour ce client afin de commencer le suivi." />
          )}
          {cases.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(`/app/partner/dossiers/${item.id}`)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left"
            >
              <div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-slate-400">Dernière activité : {new Date(item.updated_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <StatusBadge status={item.status} />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PartnerClientDetail;
