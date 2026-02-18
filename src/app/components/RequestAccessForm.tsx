import React, { useState } from 'react';

type RequestAccessFormProps = {
  onSuccess?: () => void;
};

const RequestAccessForm: React.FC<RequestAccessFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/.netlify/functions/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = payload?.error || `Erreur ${response.status}`;
        throw new Error(detail);
      }
      setShowSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Erreur réseau. Vérifiez que Netlify Dev tourne sur le port 8888.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-white">
      <h1 className="text-2xl font-semibold">Demander un accès</h1>
      <p className="mt-2 text-sm text-slate-300">
        Demande réservée. Si votre profil est validé, vous recevrez une invitation.
      </p>
      {message && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
          {message}
        </div>
      )}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs text-slate-400">Prénom</label>
          <input
            type="text"
            value={firstName}
            onChange={event => setFirstName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Nom</label>
          <input
            type="text"
            value={lastName}
            onChange={event => setLastName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
        >
          {loading ? 'Envoi...' : 'Envoyer ma demande'}
        </button>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 text-white">
            <h2 className="text-lg font-semibold">Demande envoyée</h2>
            <p className="mt-2 text-sm text-slate-300">
              Votre demande a bien été envoyée. Si votre profil est validé, vous recevrez une invitation par email.
            </p>
            <button
              className="mt-4 w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100"
              onClick={() => setShowSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestAccessForm;
