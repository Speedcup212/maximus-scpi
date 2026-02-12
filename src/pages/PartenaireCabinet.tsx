import React, { useMemo, useState } from 'react';
import { insertPartnerLead } from '../lib/btob/supabaseBtob';
import { parseUtmFromLocation } from '../lib/btob/utm';

type LeadFormState = {
  cabinetName: string;
  contactName: string;
  email: string;
  phone: string;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialState: LeadFormState = {
  cabinetName: '',
  contactName: '',
  email: '',
  phone: ''
};

const PartenaireCabinet: React.FC = () => {
  const [formState, setFormState] = useState<LeadFormState>(initialState);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calendlyUrl = import.meta.env.VITE_CALENDLY_PARTNER_URL as string | undefined;
  const utm = useMemo(() => parseUtmFromLocation(window.location), []);

  const handleChange = (field: keyof LeadFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const { error } = await insertPartnerLead({
        cabinet_name: formState.cabinetName.trim(),
        contact_name: formState.contactName.trim() || undefined,
        email: formState.email.trim(),
        phone: formState.phone.trim() || undefined,
        source: 'btob',
        page_url: window.location.href,
        ...utm
      });

      if (error) {
        throw error;
      }

      setStatus('success');
      setFormState(initialState);
    } catch (err) {
      console.error('Partner lead insert failed', err);
      setStatus('error');
      setErrorMessage('Impossible d’envoyer la demande pour le moment.');
    }
  };

  return (
    <main className="text-gray-900 dark:text-gray-100">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">Espace cabinet partenaire</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">
            Une couche SCPI B2B simple, claire, cabinet-ready.
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
            MaximusSCPI s’intègre à votre accompagnement sans changer votre positionnement.
            Nous gérons le digital et la souscription, vous gardez la relation client.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={calendlyUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className={`px-5 py-2.5 rounded-full text-white ${calendlyUrl ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Prendre rendez-vous partenaire
            </a>
            <span className="text-sm text-gray-500 dark:text-gray-400 self-center">Zoom uniquement • 30% de rétrocession</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12 grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Le problème</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              Les cabinets manquent d’outils simples pour qualifier une sélection SCPI,
              formaliser la cohérence globale et produire un dossier client clair.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">La solution</h2>
            <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Comparateur expert + lecture structurelle (Z-score).</li>
              <li>• Dossier cabinet-ready généré en PDF.</li>
              <li>• Suivi simple des prospects et des dossiers.</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Process en 4 étapes</h2>
            <ol className="mt-3 space-y-2 text-gray-600 dark:text-gray-300">
              <li>1. Qualification du client (profil investisseur).</li>
              <li>2. Pré-sélection SCPI + analyse de structure.</li>
              <li>3. Génération du dossier cabinet-ready.</li>
              <li>4. Souscription 100% en ligne (Zoom).</li>
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conformité & rôle</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              Le cabinet est apporteur d’affaires. MaximusSCPI opère la souscription
              et la conformité CIF. Les indicateurs sont descriptifs, sans recommandation.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rémunération</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              Rétrocession cabinet : 30% de la commission perçue sur les dossiers signés.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Zoom-only</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              Tout se fait à distance. Une secrétaire gère l’administratif.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Demander un rendez-vous partenaire
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Laissez vos coordonnées pour un échange rapide et la mise en place du flux cabinet.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Cabinet *</label>
              <input
                value={formState.cabinetName}
                onChange={handleChange('cabinetName')}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Contact</label>
              <input
                value={formState.contactName}
                onChange={handleChange('contactName')}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Email *</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleChange('email')}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Téléphone</label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange('phone')}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Envoi en cours…' : 'Envoyer la demande'}
            </button>

            {status === 'success' && (
              <p className="text-sm text-emerald-600">Merci, votre demande a bien été envoyée.</p>
            )}
            {status === 'error' && (
              <p className="text-sm text-rose-600">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
};

export default PartenaireCabinet;
