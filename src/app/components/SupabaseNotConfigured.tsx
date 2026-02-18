import React from 'react';

type SupabaseNotConfiguredProps = {
  title?: string;
  showReload?: boolean;
  showSetupLink?: boolean;
};

const SupabaseNotConfigured: React.FC<SupabaseNotConfiguredProps> = ({
  title = 'Configuration requise',
  showReload = true,
  showSetupLink = true
}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL;

  const statusRow = (label: string, value?: string) => (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className={`text-xs font-semibold ${value ? 'text-emerald-300' : 'text-amber-300'}`}>
        {value ? '✅ présent' : '❌ manquant'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Espace privé</p>
          <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-slate-300">
            Supabase n’est pas configuré. L’espace privé est désactivé tant que les variables d’environnement ne sont pas renseignées.
          </p>
        </div>

        <div className="space-y-2">
          {statusRow('VITE_SUPABASE_URL', supabaseUrl)}
          {statusRow('VITE_SUPABASE_ANON_KEY', supabaseAnonKey)}
          {statusRow('VITE_PUBLIC_SITE_URL (optionnel)', publicSiteUrl)}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200 space-y-2">
          <p className="font-semibold text-slate-100">Où les trouver</p>
          <ul className="space-y-1 text-slate-300">
            <li>Supabase Dashboard → Project Settings → API → “Les clés API”</li>
            <li>Project URL</li>
            <li>Publishable (anon) key</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {showSetupLink && (
            <button
              onClick={() => { window.location.href = '/app/setup'; }}
              className="rounded-lg bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-100"
            >
              Ouvrir /app/setup
            </button>
          )}
          {showReload && (
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Recharger
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseNotConfigured;
