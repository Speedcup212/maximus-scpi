import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';
import { useProfile } from '../hooks/useProfile';
import type { Profile } from '../types';

type PartnerClientsProps = {
  onNavigate: (path: string) => void;
};

const PartnerClients: React.FC<PartnerClientsProps> = ({ onNavigate }) => {
  const { signOut, user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [clients, setClients] = useState<Profile[]>([]);

  useEffect(() => {
    if (!profile?.org_id) return;
    const fetchClients = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('role', 'client');
      if (data) setClients(data as Profile[]);
    };
    fetchClients();
  }, [profile?.org_id]);

  return (
    <AppLayout role="partner" title="Clients" onNavigate={onNavigate} onSignOut={signOut}>
      <div className="space-y-3">
        {clients.length === 0 && (
          <EmptyState title="Aucun client assigné" description="Créez un dossier pour rattacher un client à votre organisation." />
        )}
        {clients.map(client => (
          <button
            key={client.user_id}
            onClick={() => onNavigate(`/app/partner/clients/${client.user_id}`)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left"
          >
            <div>
              <div className="text-sm font-semibold text-white">{client.full_name || client.user_id.slice(0, 8)}</div>
              <div className="text-xs text-slate-400">{client.phone || 'Téléphone non renseigné'}</div>
            </div>
            <span className="text-xs text-slate-400">Voir dossiers</span>
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default PartnerClients;
