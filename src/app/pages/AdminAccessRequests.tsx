import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

type AccessRequest = {
  id: string;
  created_at: string;
  requested_role: 'CLIENT' | 'PARTENAIRE';
  full_name: string;
  email: string;
  phone: string | null;
  message: string | null;
};

const AdminAccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionNote, setDecisionNote] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      setError('Session manquante.');
      setLoading(false);
      return;
    }

    const response = await fetch('/.netlify/functions/admin-list-access-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ page: 1, page_size: 50 })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload?.error || 'Erreur lors du chargement.');
      setLoading(false);
      return;
    }

    setRequests(payload.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      setError('Session manquante.');
      return;
    }

    const response = await fetch('/.netlify/functions/admin-decide-access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        request_id: id,
        decision,
        decision_note: decisionNote[id] || null
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload?.error || 'Erreur lors de la décision.');
      return;
    }

    setRequests(prev => prev.filter(item => item.id !== id));
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
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Demandes d’accès</h1>
          <p className="mt-2 text-sm text-slate-300">Validez ou refusez les demandes en attente.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center text-slate-300">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                Aucune demande en attente.
              </div>
            )}
            {requests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-300">{req.requested_role}</p>
                    <h2 className="text-lg font-semibold">{req.full_name}</h2>
                    <p className="text-sm text-slate-400">{req.email}</p>
                    {req.phone && <p className="text-xs text-slate-500">{req.phone}</p>}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(req.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                {req.message && (
                  <p className="text-sm text-slate-300">{req.message}</p>
                )}
                <div>
                  <label className="text-xs text-slate-400">Note (optionnel)</label>
                  <textarea
                    value={decisionNote[req.id] || ''}
                    onChange={(event) => setDecisionNote(prev => ({ ...prev, [req.id]: event.target.value }))}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => handleDecision(req.id, 'APPROVED')}
                    className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleDecision(req.id, 'REJECTED')}
                    className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-200"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccessRequests;
