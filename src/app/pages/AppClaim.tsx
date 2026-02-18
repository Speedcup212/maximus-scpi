import React, { useMemo, useState } from 'react';

type AppClaimProps = {
  onNavigate: (path: string) => void;
};

const AppClaim: React.FC<AppClaimProps> = ({ onNavigate }) => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get('token') || '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage('Lien d’invitation invalide.');
      return;
    }
    if (!code.trim()) {
      setMessage('Veuillez saisir le code provisoire.');
      return;
    }
    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/claim-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code, password })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Échec de validation');
      }

      onNavigate('/app/login?activated=1');
    } catch (error: any) {
      setMessage(error?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Activer votre accès</h1>
        <p className="mt-2 text-sm text-slate-300">
          Saisissez le code provisoire reçu et définissez votre mot de passe.
        </p>
        {message && <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">{message}</div>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-400">Code provisoire</label>
            <input
              type="text"
              value={code}
              onChange={event => setCode(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={event => setConfirm(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
          >
            {loading ? 'Activation...' : 'Activer mon compte'}
          </button>
        </form>
        <div className="mt-6 text-xs text-slate-400">
          <button onClick={() => onNavigate('/app/login')} className="hover:text-emerald-200">Retour à la connexion</button>
        </div>
      </div>
    </div>
  );
};

export default AppClaim;
