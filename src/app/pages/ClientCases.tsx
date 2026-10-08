import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    if (!supabase) {
      setError('Service indisponible.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .order('updated_at', { ascending: false });

    if (fetchError) {
      setCases([]);
      setError('Impossible de charger vos dossiers. Veuillez réessayer dans quelques instants.');
      setLoading(false);
      return;
    }

    setCases((data ?? []) as Case[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCases();
  }, [fetchCases]);

  return (
    <AppLayout role="client" title="Mes dossiers" onNavigate={onNavigate} onSignOut={signOut}>
      <div className="space-y-5">
        {loading ? (
          <div className="flex min-h-[35vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              <div className="flex-1">
                <div className="font-medium text-red-100">Chargement impossible</div>
                <p className="mt-1 text-sm text-red-200/80">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchCases()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300/20 px-3 py-2 text-xs font-medium text-red-100 hover:bg-red-500/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            title="Aucun dossier"
            description="Dès qu’un dossier sera créé pour votre compte, il apparaîtra ici."
          />
        ) : (
          cases.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(`/app/client/dossiers/${item.id}`)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/[0.08]"
            >
              <div>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-xs text-slate-400">
                  Dernière activité : {new Date(item.last_activity_at || item.updated_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <StatusBadge status={item.status} />
            </button>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default ClientCases;
