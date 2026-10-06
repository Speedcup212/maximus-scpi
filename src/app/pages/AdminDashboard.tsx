import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import type { Organization, Profile, ProfileRole, ProfileStatus } from '../types';

type AdminDashboardProps = {
  onNavigate: (path: string) => void;
};

type BusinessMetrics = {
  quizStarted: number;
  analysesOpened: number;
  validationClicked: number;
  formsOpened: number;
  leads: number;
  portfolioLeads: number;
  calendlyOpened: number;
  bookings: number;
};

const emptyBusinessMetrics: BusinessMetrics = {
  quizStarted: 0,
  analysesOpened: 0,
  validationClicked: 0,
  formsOpened: 0,
  leads: 0,
  portfolioLeads: 0,
  calendlyOpened: 0,
  bookings: 0,
};

const rate = (value: number, base: number) =>
  base > 0 ? `${Math.round((value / base) * 100)} %` : '—';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { signOut } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [business30d, setBusiness30d] = useState<BusinessMetrics>(emptyBusinessMetrics);
  const [business7d, setBusiness7d] = useState<BusinessMetrics>(emptyBusinessMetrics);
  const [businessLoading, setBusinessLoading] = useState(true);

  const loadBusinessMetrics = async (days: number): Promise<BusinessMetrics> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [eventsResult, leadsResult] = await Promise.all([
      supabase
        .from('funnel_events')
        .select('event_name,session_id')
        .gte('created_at', since),
      supabase
        .from('contact_submissions')
        .select('form_type')
        .gte('created_at', since),
    ]);

    if (eventsResult.error) {
      console.warn('[AdminDashboard] Funnel indisponible', eventsResult.error);
    }
    if (leadsResult.error) {
      console.warn('[AdminDashboard] Leads indisponibles', leadsResult.error);
    }

    const events = eventsResult.data || [];
    const leads = leadsResult.data || [];

    const uniqueSessions = (eventName: string) =>
      new Set(
        events
          .filter(event => event.event_name === eventName)
          .map(event => event.session_id)
          .filter(Boolean),
      ).size;

    return {
      quizStarted: uniqueSessions('quiz_started'),
      analysesOpened: uniqueSessions('analysis_opened'),
      validationClicked: uniqueSessions('portfolio_validation_clicked'),
      formsOpened: uniqueSessions('lead_form_opened'),
      leads: leads.length,
      portfolioLeads: leads.filter(lead => lead.form_type === 'portfolio_validation').length,
      calendlyOpened: uniqueSessions('calendly_opened'),
      bookings: uniqueSessions('calendly_booking_completed'),
    };
  };

  const refresh = async () => {
    const [profilesResult, orgResult, metrics30d, metrics7d] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      loadBusinessMetrics(30),
      loadBusinessMetrics(7),
    ]);

    if (profilesResult.data) setProfiles(profilesResult.data as Profile[]);
    if (orgResult.data) setOrganizations(orgResult.data as Organization[]);
    setBusiness30d(metrics30d);
    setBusiness7d(metrics7d);
    setBusinessLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    await supabase.from('profiles').update(updates).eq('user_id', userId);
    refresh();
  };

  const createOrg = async () => {
    if (!newOrgName.trim()) return;
    await supabase.from('organizations').insert({ name: newOrgName.trim(), slug: newOrgSlug || null });
    setNewOrgName('');
    setNewOrgSlug('');
    refresh();
  };

  return (
    <AppLayout role="admin" title="Administration" onNavigate={onNavigate} onSignOut={signOut}>
      <section className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Business MaximusSCPI</p>
            <h2 className="mt-1 text-xl font-bold text-white">Funnel commercial — 30 derniers jours</h2>
            <p className="mt-1 text-xs text-slate-400">
              Sessions uniques par étape. Les leads proviennent directement de contact_submissions.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            7 derniers jours : {business7d.leads} lead{business7d.leads > 1 ? 's' : ''} · {business7d.bookings} RDV réservé{business7d.bookings > 1 ? 's' : ''}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Quiz démarrés', business30d.quizStarted],
            ['Analyses ouvertes', business30d.analysesOpened],
            ['Validation cliquée', business30d.validationClicked],
            ['Formulaires ouverts', business30d.formsOpened],
            ['Leads enregistrés', business30d.leads],
            ['Leads portefeuille', business30d.portfolioLeads],
            ['Calendly ouverts', business30d.calendlyOpened],
            ['RDV réservés', business30d.bookings],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-bold text-white">{businessLoading ? '—' : value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-300">
            Quiz → analyse <span className="float-right font-bold text-emerald-300">{rate(business30d.analysesOpened, business30d.quizStarted)}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-300">
            Analyse → validation <span className="float-right font-bold text-emerald-300">{rate(business30d.validationClicked, business30d.analysesOpened)}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-300">
            Validation → formulaire <span className="float-right font-bold text-emerald-300">{rate(business30d.formsOpened, business30d.validationClicked)}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-300">
            Formulaire → lead <span className="float-right font-bold text-emerald-300">{rate(business30d.portfolioLeads, business30d.formsOpened)}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Utilisateurs</h2>
          <div className="mt-4 space-y-3">
            {profiles.map(profile => (
              <div key={profile.user_id} className="rounded-lg border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{profile.full_name || profile.user_id}</div>
                    <div className="text-slate-400">{profile.phone || '—'}</div>
                  </div>
                  <StatusBadge status={profile.status} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500">Rôle</label>
                    <select
                      value={profile.role}
                      onChange={event => updateProfile(profile.user_id, { role: event.target.value as ProfileRole })}
                      className="mt-1 w-full rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
                    >
                      <option value="client">Client</option>
                      <option value="partner">Partenaire</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500">Statut</label>
                    <select
                      value={profile.status}
                      onChange={event => updateProfile(profile.user_id, { status: event.target.value as ProfileStatus })}
                      className="mt-1 w-full rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspendu</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500">Organisation</label>
                    <select
                      value={profile.org_id || ''}
                      onChange={event => updateProfile(profile.user_id, { org_id: event.target.value || null })}
                      className="mt-1 w-full rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
                    >
                      <option value="">—</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Organisations</h2>
          <div className="mt-4 space-y-2 text-xs text-slate-300">
            {organizations.map(org => (
              <div key={org.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                <div className="font-semibold">{org.name}</div>
                <div className="text-slate-500">{org.slug || '—'}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <input
              type="text"
              value={newOrgName}
              onChange={event => setNewOrgName(event.target.value)}
              placeholder="Nom organisation"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              value={newOrgSlug}
              onChange={event => setNewOrgSlug(event.target.value)}
              placeholder="Slug (optionnel)"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
            />
            <button
              onClick={createOrg}
              className="w-full rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100"
            >
              Créer organisation
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
