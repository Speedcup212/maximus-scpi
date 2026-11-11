import React, { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { submitLead } from '../utils/leadSubmitter';
import { trackFunnelEvent } from '../utils/funnelAnalytics';
import { buildCalendlyUrl } from '../config/calendly';
import { openCalendlyPopup } from '../utils/calendlyPopup';
import {
  TRANCHE_OPTIONS,
  buildLeadPayload,
  buildSubmittedMetadata,
  isAtLeast50k,
  isTranche,
  isValidEmail,
  sourceFromPath,
  trancheFromAmount,
  type SimulationSnapshot,
  type Tranche,
} from '../utils/simulationEmailCapture';

/**
 * RECOVERY-201 — Bloc « Recevoir ma simulation par email ».
 * Textes : docs/cadrage/RECOVERY-201-capture-simulation.md (section « Textes exacts »).
 */

interface SimulationEmailCaptureProps {
  snapshot: SimulationSnapshot;
  hasRdvBlock: boolean;
}

const SENT_KEY = 'maximus_sim_email_sent';
const SENT_TRANCHE_KEY = 'maximus_sim_email_tranche';
const VIEWED_KEY = 'maximus_sim_email_viewed';
const PRIVACY_CONTACT = 'eric.bellaiche@gmail.com';

const ERROR_SEND = "L'envoi n'a pas abouti. Réessayez dans un instant.";
const ERROR_EMAIL = 'Vérifiez votre adresse email.';

const readSession = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSession = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Non bloquant : l'état de succès reste affiché pendant la visite.
  }
};

const currentSource = () =>
  sourceFromPath(typeof window !== 'undefined' ? window.location.pathname : '/');

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-950 outline-none focus:border-green-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white';

const SimulationEmailCapture: React.FC<SimulationEmailCaptureProps> = ({ snapshot, hasRdvBlock }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [tranche, setTranche] = useState<Tranche>(() => trancheFromAmount(snapshot.montantSimule));
  const [trancheTouched, setTrancheTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(() =>
    readSession(SENT_KEY) === '1' ? 'success' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [sentTranche, setSentTranche] = useState<Tranche | null>(() => {
    const stored = readSession(SENT_TRANCHE_KEY);
    return isTranche(stored) ? stored : null;
  });

  // La tranche suit le montant simulé tant que le visiteur ne l'a pas choisie lui-même.
  useEffect(() => {
    if (!trancheTouched) setTranche(trancheFromAmount(snapshot.montantSimule));
  }, [snapshot.montantSimule, trancheTouched]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || readSession(VIEWED_KEY) === '1' || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        writeSession(VIEWED_KEY, '1');
        trackFunnelEvent('simulation_email_viewed', { source: currentSource() });
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showSuccess = (value: Tranche) => {
    writeSession(SENT_KEY, '1');
    writeSession(SENT_TRANCHE_KEY, value);
    setSentTranche(value);
    setMessage(null);
    setStatus('success');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    // Champ piège rempli : on simule un succès sans rien enregistrer ni envoyer.
    if (website.trim()) {
      showSuccess(tranche);
      return;
    }

    if (!isValidEmail(email)) {
      setMessage(ERROR_EMAIL);
      setStatus('error');
      return;
    }

    setStatus('sending');
    setMessage(null);
    const source = currentSource();

    try {
      const result = await submitLead(
        buildLeadPayload({ email, prenom, tranche, consentMarketing: consent, source, snapshot }),
      );

      if (!result.ok) {
        setMessage(ERROR_SEND);
        setStatus('error');
        return;
      }

      try {
        const { supabase } = await import('../supabaseClient');
        const response = await supabase?.functions.invoke('send-simulation-email', {
          body: { request_id: result.request_id },
        });
        if (!supabase || response?.error) {
          console.warn('[simulation-email] envoi non confirmé', result.request_id);
        }
      } catch {
        // Le lead est enregistré ; la notification admin existante permet de rattraper l'envoi.
        console.warn('[simulation-email] envoi non confirmé', result.request_id);
      }

      trackFunnelEvent(
        'simulation_email_submitted',
        buildSubmittedMetadata({ source, tranche, consentMarketing: consent, requestId: result.request_id }),
      );
      showSuccess(tranche);
    } catch {
      setMessage(ERROR_SEND);
      setStatus('error');
    }
  };

  const handleCalendlyClick = async () => {
    const source = currentSource();
    trackFunnelEvent('simulation_email_calendly_clicked', {
      source,
      tranche_montant: sentTranche ?? tranche,
    });
    const url = buildCalendlyUrl(`${source}-email`, { name: prenom, email });
    try {
      await openCalendlyPopup(url);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const title =
    hasRdvBlock && snapshot.montantSimule >= 50000
      ? 'Pas encore prêt pour un échange ? Recevez votre simulation par email'
      : 'Recevez votre simulation par email';

  if (status === 'success') {
    const offerRdv = isAtLeast50k(sentTranche ?? tranche);
    return (
      <div
        ref={containerRef}
        className="rounded-2xl border border-green-500/30 bg-green-50 p-5 shadow-sm dark:border-green-500/30 dark:bg-green-950/20"
      >
        <p role="status" aria-live="polite" className="text-sm font-semibold text-gray-950 dark:text-white">
          {offerRdv
            ? "C'est envoyé. Vérifiez votre boîte de réception, et vos indésirables. Vous voulez qu'on regarde cette simulation ensemble ?"
            : "C'est envoyé. Vérifiez votre boîte de réception, et vos indésirables."}
        </p>
        {offerRdv ? (
          <button
            type="button"
            onClick={handleCalendlyClick}
            className="mt-4 w-full rounded-xl bg-green-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-green-700"
          >
            Choisir un créneau en visio
          </button>
        ) : (
          <a
            href="/comparateur-scpi/"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3.5 text-base font-bold text-gray-900 transition hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            Comparer les SCPI
          </a>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
        <div>
          <p className="text-base font-bold text-gray-950 dark:text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Le détail de vos hypothèses et de vos résultats, pour y revenir à tête reposée.
          </p>
        </div>
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="sim-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Votre email
          </label>
          <input
            id="sim-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="sim-prenom" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Votre prénom (facultatif)
          </label>
          <input
            id="sim-prenom"
            name="prenom"
            type="text"
            autoComplete="given-name"
            maxLength={40}
            value={prenom}
            onChange={event => setPrenom(event.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="sim-tranche" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Montant que vous envisagez de placer
          </label>
          <select
            id="sim-tranche"
            name="tranche"
            required
            value={tranche}
            onChange={event => {
              if (isTranche(event.target.value)) {
                setTranche(event.target.value);
                setTrancheTouched(true);
              }
            }}
            className={`mt-1 ${inputClass}`}
          >
            {TRANCHE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="sim-website">Site web</label>
          <input
            id="sim-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={event => setWebsite(event.target.value)}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="sim-consent"
            name="consentement"
            type="checkbox"
            checked={consent}
            onChange={event => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="sim-consent" className="text-sm leading-6 text-gray-700 dark:text-gray-300">
            J'accepte de recevoir par email des informations sur l'investissement en SCPI de la part d'Eric
            Bellaiche, conseiller financier (MaximusSCPI). Je peux me désinscrire en un clic dans chaque email.
          </label>
        </div>

        {status === 'error' && message && (
          <p role="alert" aria-live="polite" className="text-sm font-semibold text-red-600 dark:text-red-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-xl bg-green-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {status === 'sending' ? 'Envoi…' : 'Recevoir ma simulation'}
        </button>

        <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
          Vos données sont utilisées par Eric Bellaiche (MaximusSCPI) pour vous envoyer cette simulation et, si vous
          avez coché la case, des informations sur les SCPI. Elles sont conservées 3 ans après votre dernier contact.
          Pour y accéder, les corriger ou les supprimer : {PRIVACY_CONTACT}.{' '}
          <a
            href="/politique_confidentialite_maximusscpi.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-700"
          >
            Politique de confidentialité
          </a>
        </p>
      </form>
    </div>
  );
};

export default SimulationEmailCapture;
