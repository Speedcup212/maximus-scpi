import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBtobClient } from '../../lib/btob/supabaseBtob';

type Partner = {
  id: string;
  cabinet_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  commission_share: number;
  signed_at: string | null;
  created_at: string;
  notes: string | null;
};

type PartnerLead = {
  id: string;
  cabinet_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  page_url: string | null;
  created_at: string;
};

type PartnerDossier = {
  id: string;
  partner_id: string | null;
  client_label: string | null;
  invested_amount: number;
  subscribed_at: string | null;
  commission_rate: number;
  commission_gross: number;
  commission_share: number;
  commission_retro: number;
  status: string;
  created_at: string;
  notes: string | null;
  partners?: { cabinet_name: string | null } | null;
};

type TabKey = 'leads' | 'partners' | 'dossiers';

const AdminPartners: React.FC = () => {
  const supabase = useMemo(() => getSupabaseBtobClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [tab, setTab] = useState<TabKey>('leads');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [dossiers, setDossiers] = useState<PartnerDossier[]>([]);

  const [assumedYield, setAssumedYield] = useState('0.06');
  const [isTaxRate, setIsTaxRate] = useState('0.25');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) {
        setIsAdmin(null);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Admin check failed', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    checkAdmin();
  }, [session, supabase]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        if (tab === 'leads') {
          const { data, error } = await supabase
            .from('partner_leads')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setLeads(data as PartnerLead[]);
        }

        if (tab === 'partners') {
          let query = supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }

          const { data, error } = await query;
          if (error) throw error;
          setPartners(data as Partner[]);
        }

        if (tab === 'dossiers') {
          let query = supabase
            .from('partner_dossiers')
            .select('*, partners(cabinet_name)')
            .order('created_at', { ascending: false });

          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }

          const { data, error } = await query;
          if (error) throw error;
          setDossiers(data as PartnerDossier[]);
        }
      } catch (err) {
        console.error('Admin load failed', err);
        setErrorMessage('Impossible de charger les données.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAdmin, statusFilter, supabase, tab]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword
    });

    if (error) {
      setAuthError('Connexion impossible. Vérifiez vos identifiants.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(null);
  };

  const handleGeneratePdf = async (dossier: PartnerDossier) => {
    if (!dossier.partner_id) {
      return;
    }

    setGeneratingId(dossier.id);
    try {
      const response = await fetch('/.netlify/functions/generate_partner_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossierId: dossier.id,
          partnerId: dossier.partner_id,
          assumedGrossYield: Number(assumedYield),
          isTaxRate: Number(isTaxRate)
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const data = await response.json();
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Erreur lors de la génération du PDF.');
    } finally {
      setGeneratingId(null);
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md space-y-4">
          <h1 className="text-lg font-semibold">Admin partenaires</h1>
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={event => setLoginEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Mot de passe</label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={event => setLoginPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm">Connexion</button>
          {authError && <p className="text-sm text-rose-600">{authError}</p>}
        </form>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center space-y-3">
          <h1 className="text-lg font-semibold">Accès restreint</h1>
          <p className="text-sm text-slate-600">Votre compte n’est pas autorisé.</p>
          <button onClick={handleSignOut} className="text-sm text-slate-700 underline">
            Se déconnecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin partenaires</h1>
            <p className="text-sm text-slate-500">Leads, partenaires et dossiers cabinet.</p>
          </div>
          <button onClick={handleSignOut} className="text-sm text-slate-700 underline">
            Déconnexion
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['leads', 'partners', 'dossiers'] as TabKey[]).map(key => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full text-sm border ${tab === key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
            >
              {key === 'leads' ? 'Leads' : key === 'partners' ? 'Partners' : 'Dossiers'}
            </button>
          ))}
        </div>

        {tab !== 'leads' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Statut</label>
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
            >
              <option value="all">Tous</option>
              {tab === 'partners' && (
                <>
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="dormant">Dormant</option>
                </>
              )}
              {tab === 'dossiers' && (
                <>
                  <option value="open">Open</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="paid">Paid</option>
                </>
              )}
            </select>
          </div>
        )}

        {tab === 'dossiers' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-sm">
            <div>
              <label className="text-slate-600">Rendement brut</label>
              <input
                value={assumedYield}
                onChange={event => setAssumedYield(event.target.value)}
                className="ml-2 w-24 rounded-xl border border-slate-200 px-2 py-1"
              />
            </div>
            <div>
              <label className="text-slate-600">IS</label>
              <input
                value={isTaxRate}
                onChange={event => setIsTaxRate(event.target.value)}
                className="ml-2 w-20 rounded-xl border border-slate-200 px-2 py-1"
              />
            </div>
            <span className="text-slate-500">Valeurs décimales (ex: 0.06 / 0.25)</span>
          </div>
        )}

        {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}
        {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}

        {tab === 'leads' && (
          <div className="overflow-auto bg-white border border-slate-200 rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Cabinet</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Téléphone</th>
                  <th className="p-3 text-left">UTM</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-t border-slate-100">
                    <td className="p-3">{lead.cabinet_name}</td>
                    <td className="p-3">{lead.contact_name || '-'}</td>
                    <td className="p-3">{lead.email}</td>
                    <td className="p-3">{lead.phone || '-'}</td>
                    <td className="p-3">
                      {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ') || '-'}
                    </td>
                    <td className="p-3">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'partners' && (
          <div className="overflow-auto bg-white border border-slate-200 rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Cabinet</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Rétro</th>
                  <th className="p-3 text-left">Créé</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(partner => (
                  <tr key={partner.id} className="border-t border-slate-100">
                    <td className="p-3">{partner.cabinet_name}</td>
                    <td className="p-3">{partner.contact_name || '-'}</td>
                    <td className="p-3">{partner.email || '-'}</td>
                    <td className="p-3">{partner.status}</td>
                    <td className="p-3">{Math.round(partner.commission_share * 100)}%</td>
                    <td className="p-3">{new Date(partner.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'dossiers' && (
          <div className="overflow-auto bg-white border border-slate-200 rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">Cabinet</th>
                  <th className="p-3 text-left">Montant</th>
                  <th className="p-3 text-left">Commission</th>
                  <th className="p-3 text-left">Rétro</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {dossiers.map(dossier => (
                  <tr key={dossier.id} className="border-t border-slate-100">
                    <td className="p-3">{dossier.client_label || '-'}</td>
                    <td className="p-3">{dossier.partners?.cabinet_name || '-'}</td>
                    <td className="p-3">{Number(dossier.invested_amount).toLocaleString()} €</td>
                    <td className="p-3">{Number(dossier.commission_gross || 0).toLocaleString()} €</td>
                    <td className="p-3">{Number(dossier.commission_retro || 0).toLocaleString()} €</td>
                    <td className="p-3">{dossier.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleGeneratePdf(dossier)}
                        disabled={!dossier.partner_id || generatingId === dossier.id}
                        className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs disabled:opacity-50"
                      >
                        {generatingId === dossier.id ? 'Génération…' : 'Générer PDF cabinet'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminPartners;
