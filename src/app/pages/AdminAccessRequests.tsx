import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

type AccessRequest = {
  id: string;
  created_at: string;
  requested_role: 'CLIENT' | 'PARTENAIRE';
  full_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
};

type AdminAccessRequestsProps = {
  onNavigate: (path: string) => void;
};

const AdminAccessRequests: React.FC<AdminAccessRequestsProps> = ({ onNavigate }) => {
  const { signOut } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke('client-access-admin', {
      body: { action: 'list' }
    });

    if (invokeError || data?.error) {
      setError(data?.error || invokeError?.message || 'Impossible de charger les demandes.');
      setLoading(false);
      return;
    }

    setRequests((data?.data ?? []) as AccessRequest[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleDecision = async (request: AccessRequest, decision: 'APPROVED' | 'REJECTED') => {
    if (!supabase) return;

    setWorkingId(request.id);
    setError(null);
    setSuccess(null);

    const { data, error: invokeError } = await supabase.functions.invoke('client-access-admin', {
      body: {
        action: 'decide',
        request_id: request.id,
        decision,
        decision_note: decisionNote[request.id] || null
      }
    });

    if (invokeError || data?.error) {
      setError(data?.error || invokeError?.message || 'Impossible de traiter la demande.');
      setWorkingId(null);
      return;
    }

    setRequests(prev => prev.filter(item => item.id !== request.id));
    setSuccess(
      decision === 'APPROVED'
        ? `Accès activé pour ${request.email}. Le client peut maintenant se connecter avec Google en utilisant cette adresse.`
        : `Demande de ${request.email} refusée.`
    );
    setWorkingId(null);
  };

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour l’admin"
        showSetupLink
        showReload
      />
    );
  }

  return (
    <AppLayout
      role="admin"
      title="Demandes d’accès"
      onNavigate={onNavigate}
      onSignOut={signOut}
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Demandes clients</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                L’approbation crée ou active le compte client dans Supabase. La première connexion se fait avec Google sur la même adresse email, sans dépendre d’un email d’activation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadRequests()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[35vh] items-center justify-center text-slate-300">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
            <div className="mt-3 font-medium text-white">Aucune demande en attente</div>
            <div className="mt-1 text-sm text-slate-400">Toutes les demandes ont été traitées.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <article key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      {request.requested_role === 'CLIENT' ? 'Client' : 'Partenaire'}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{request.full_name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{request.email}</p>
                    {request.phone && <p className="mt-1 text-xs text-slate-500">{request.phone}</p>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(request.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>

                {request.message && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                    {request.message}
                  </div>
                )}

                <label className="mt-5 block text-xs text-slate-400">
                  Note interne
                  <textarea
                    value={decisionNote[request.id] || ''}
                    onChange={event =>
                      setDecisionNote(prev => ({ ...prev, [request.id]: event.target.value }))
                    }
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/40"
                  />
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={workingId === request.id || request.requested_role !== 'CLIENT'}
                    onClick={() => void handleDecision(request, 'APPROVED')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {workingId === request.id ? 'Traitement…' : 'Approuver'}
                  </button>
                  <button
                    type="button"
                    disabled={workingId === request.id}
                    onClick={() => void handleDecision(request, 'REJECTED')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-40"
                  >
                    <XCircle className="h-4 w-4" />
                    Refuser
                  </button>
                </div>

                {request.requested_role !== 'CLIENT' && (
                  <p className="mt-3 text-xs text-amber-300">
                    Les demandes partenaires restent traitées dans l’Espace Pro.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminAccessRequests;
