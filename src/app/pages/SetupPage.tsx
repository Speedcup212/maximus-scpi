import React, { useState } from 'react';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

const ENV_TEMPLATE = `VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PUBLIC_SITE_URL=
`;

const SetupPage: React.FC = () => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ENV_TEMPLATE);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = ENV_TEMPLATE;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus('Template copié dans le presse-papiers.');
    } catch (error) {
      setCopyStatus('Impossible de copier automatiquement. Copiez manuellement.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SupabaseNotConfigured title="Configurer Supabase" showReload={false} showSetupLink={false} />
      <div className="-mt-10 px-6 pb-12">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Étapes rapides</h2>
            <p className="mt-2 text-sm text-slate-300">
              Ajoutez ces variables dans <span className="text-slate-100">.env.local</span> (local) ou dans votre
              hébergeur (Netlify → Site settings → Environment variables).
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-200">
            <pre className="whitespace-pre-wrap">{ENV_TEMPLATE}</pre>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleCopy}
              className="rounded-lg bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-100"
            >
              Copier le template .env.local
            </button>
            {copyStatus && <span className="text-xs text-slate-300">{copyStatus}</span>}
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200 space-y-2">
            <p className="font-semibold text-slate-100">Chemin exact dans Supabase</p>
            <ul className="space-y-1 text-slate-300">
              <li>Supabase Dashboard → Project Settings → API → “Les clés API”</li>
              <li>Project URL</li>
              <li>Publishable (anon) key</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => window.location.href = '/app/login'}
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Retour à /app/login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
