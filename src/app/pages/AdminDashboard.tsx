import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import type { Organization, Profile, ProfileRole, ProfileStatus } from '../types';

type AdminDashboardProps = {
  onNavigate: (path: string) => void;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { signOut } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');

  const refresh = async () => {
    const { data: profilesRows } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: orgRows } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
    if (profilesRows) setProfiles(profilesRows as Profile[]);
    if (orgRows) setOrganizations(orgRows as Organization[]);
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
