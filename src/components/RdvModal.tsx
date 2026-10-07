import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Calendar, DollarSign, Mail, MessageCircle, Phone, TrendingUp, User } from 'lucide-react';
import type { Scpi } from '../types/scpi';
import { submitLead } from '../utils/leadSubmitter';
import { trackFunnelEvent } from '../utils/funnelAnalytics';
import { openCalendlyPopup } from '../utils/calendlyPopup';
import { buildCalendlyUrl, PORTFOLIO_CALENDLY_URL } from '../config/calendly';

interface RdvModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScpi?: Scpi[];
  recommendedScpi?: string[];
  clientProfile?: any;
  profilRisque?: string;
  profilESG?: string;
  scpi?: string[];
}

type QuizContext = {
  quiz?: {
    montant?: string;
    tmi?: string;
    horizon?: string;
    objectif?: string;
  };
  orientation?: string;
  portfolio?: Array<{ name: string; weight: number }>;
  result?: string;
};

const montantLabel = (value?: string) => {
  const labels: Record<string, string> = {
    'moins-10k': 'Moins de 10 000 €',
    '10k-50k': '10 000 – 50 000 €',
    '50k-150k': '50 000 – 150 000 €',
    'plus-150k': 'Plus de 150 000 €',
  };
  return value ? labels[value] || value : '';
};

const horizonLabel = (value?: string) => {
  const labels: Record<string, string> = {
    'moins-5ans': 'Moins de 5 ans',
    '5-10ans': '5 à 10 ans',
    'plus-10ans': 'Plus de 10 ans',
  };
  return value ? labels[value] || value : '';
};

const objectifLabel = (value?: string) => {
  const labels: Record<string, string> = {
    revenus: 'Revenus complémentaires',
    fiscalite: 'Fiscalité',
    diversification: 'Diversification',
    croissance: 'Croissance du capital',
    retraite: 'Préparer la retraite',
    transmission: 'Transmission',
  };
  return value ? labels[value] || value : '';
};

const isCalendlyOrigin = (origin: string) => {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'calendly.com' || hostname.endsWith('.calendly.com');
  } catch {
    return false;
  }
};

const RdvModal: React.FC<RdvModalProps> = ({
  isOpen,
  onClose,
  selectedScpi = [],
  recommendedScpi = [],
  profilRisque = 'Non défini',
  profilESG = 'Standard',
  scpi = [],
}) => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    montant: '',
    commentaire: '',
    creneau: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizContext, setQuizContext] = useState<QuizContext | null>(null);
  const pendingCalendlyLeadIdRef = useRef<string | null>(null);
  const bookingTrackedRef = useRef(false);

  const explicitScpi = useMemo(() => {
    const names = [
      ...selectedScpi.map(item => item.name),
      ...recommendedScpi,
      ...scpi,
    ];
    return [...new Set(names.filter(Boolean))];
  }, [selectedScpi, recommendedScpi, scpi]);

  const portfolio = quizContext?.portfolio ?? [];
  const isPortfolioFlow = portfolio.length > 0;
  const portfolioNames = portfolio.map(item => item.name);
  const leadScpi = isPortfolioFlow ? portfolioNames : explicitScpi;

  const isSimulatorLanding =
    typeof window !== 'undefined' &&
    window.location.pathname.replace(/\/+$/, '') === '/simulateur-scpi';

  useEffect(() => {
    if (!isOpen) return;

    let parsedContext: QuizContext | null = null;
    try {
      const raw = sessionStorage.getItem('maximus_quiz_context');
      parsedContext = raw ? JSON.parse(raw) : null;
      setQuizContext(parsedContext);
    } catch {
      setQuizContext(null);
    }

    if (isSimulatorLanding) {
      try {
        const savedAmount = Number(sessionStorage.getItem('maximus_simulator_amount'));
        if (Number.isFinite(savedAmount) && savedAmount > 0) {
          const formattedAmount = `${new Intl.NumberFormat('fr-FR').format(savedAmount)} €`;
          setFormValues(prev => ({ ...prev, montant: formattedAmount }));
        }
      } catch {
        // Le montant reste éditable si le stockage de session n'est pas disponible.
      }
    }

    trackFunnelEvent('lead_form_opened', {
      source: parsedContext?.portfolio?.length ? 'portfolio_analysis' : 'site',
      form_type: parsedContext?.portfolio?.length ? 'portfolio_validation' : 'lead_rdv',
      portfolio_size: parsedContext?.portfolio?.length || undefined,
    });

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmTerm = urlParams.get('utm_term');
    const gclid = urlParams.get('gclid');

    if (utmSource) sessionStorage.setItem('utm_source', utmSource);
    if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
    if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
    if (utmTerm) sessionStorage.setItem('utm_term', utmTerm);
    if (gclid) sessionStorage.setItem('gclid', gclid);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onCalendlyMessage = (event: MessageEvent) => {
      if (!isCalendlyOrigin(event.origin)) return;
      if (event.data?.event !== 'calendly.event_scheduled') return;
      if (bookingTrackedRef.current) return;

      bookingTrackedRef.current = true;
      trackFunnelEvent('calendly_booking_completed', {
        lead_request_id: pendingCalendlyLeadIdRef.current || undefined,
        form_type: isPortfolioFlow ? 'portfolio_validation' : 'lead_rdv',
        action: 'calendly',
      });

      setStatus('Rendez-vous réservé. Confirmation envoyée par Calendly.');
      sessionStorage.removeItem('maximus_quiz_context');

      window.setTimeout(() => {
        window.location.href = '/merci-landing-page.html?source=calendly';
      }, 900);
    };

    window.addEventListener('message', onCalendlyMessage);
    return () => window.removeEventListener('message', onCalendlyMessage);
  }, [isOpen, isPortfolioFlow]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const nativeEvent = e.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLButtonElement | null;
    const action = isSimulatorLanding
      ? 'calendly'
      : submitter?.value === 'calendly' ? 'calendly' : 'callback';
    const contextSlug = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home';
    const effectiveMontant = isPortfolioFlow
      ? montantLabel(quizContext?.quiz?.montant)
      : formValues.montant;

    try {
      const result = await submitLead({
        channel: 'contact',
        form_type: isPortfolioFlow ? 'portfolio_validation' : 'lead_rdv',
        context_type: contextSlug === 'home' ? 'site' : 'page',
        context_slug: contextSlug,
        identity: {
          nom: formValues.name,
          email: formValues.email,
          telephone: formValues.phone,
        },
        message: isPortfolioFlow ? '' : formValues.commentaire,
        answers: {
          montant: effectiveMontant,
          creneau: isPortfolioFlow ? '' : formValues.creneau,
          profil_risque: profilRisque,
          profil_esg: profilESG,
          scpi: leadScpi,
          action,
          quiz_context: quizContext,
        },
      });

      if (!result.ok) throw new Error(result.error || 'Erreur insertion');

      if (action === 'calendly') {
        setStatus('Coordonnées enregistrées. Choisissez maintenant votre créneau.');
        const targetUrl = buildCalendlyUrl(
          isPortfolioFlow ? 'home-portefeuille' : contextSlug,
          { name: formValues.name, email: formValues.email },
          isPortfolioFlow ? PORTFOLIO_CALENDLY_URL : undefined
        );

        pendingCalendlyLeadIdRef.current = result.request_id;
        bookingTrackedRef.current = false;

        try {
          await openCalendlyPopup(targetUrl);
        } catch {
          window.location.href = targetUrl;
        }
        return;
      }

      sessionStorage.removeItem('maximus_quiz_context');
      setStatus('Votre demande a bien été envoyée.');
      setTimeout(() => {
        window.location.href = '/merci-landing-page.html';
      }, 900);
    } catch (err) {
      setStatus(`Erreur : ${err instanceof Error ? err.message : 'problème technique'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-start justify-center overflow-y-auto bg-black/60 p-3 pt-5 sm:p-4 sm:pt-8"
      onClick={handleBackdropClick}
    >
      <div className={`my-3 flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${isPortfolioFlow ? 'max-w-xl' : 'max-w-2xl'}`}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50 p-5 dark:border-slate-700 dark:from-emerald-950/40 dark:to-blue-950/30">
          <div className="flex min-w-0 items-start gap-4">
            <img
              src="/images/eric-120.webp"
              alt="Conseiller MaximusSCPI"
              width="56"
              height="56"
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/25"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                {isPortfolioFlow ? 'Étape suivante' : 'Rendez-vous MaximusSCPI'}
              </p>
              <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white sm:text-2xl">
                {isPortfolioFlow ? 'Faire valider et suivre votre allocation SCPI' : 'Prendre rendez-vous'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-300">
                Visio • 30 min
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                Conseiller MaximusSCPI
              </p>
              {isPortfolioFlow && (
                <p className="mt-2 max-w-lg text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                  Vérification de l’adéquation, de la disponibilité des SCPI et de la répartition finale avant souscription. Votre portefeuille pourra ensuite être suivi dans MaximusSCPI.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-gray-500 transition hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
          {isPortfolioFlow && (
            <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-emerald-50/70 p-4 dark:bg-emerald-400/5">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-white">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Votre allocation MaximusSCPI
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {quizContext?.quiz?.montant && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    {montantLabel(quizContext.quiz.montant)}
                  </span>
                )}
                {quizContext?.quiz?.tmi && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    TMI {quizContext.quiz.tmi} %
                  </span>
                )}
                {quizContext?.quiz?.horizon && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    {horizonLabel(quizContext.quiz.horizon)}
                  </span>
                )}
                {quizContext?.quiz?.objectif && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    {objectifLabel(quizContext.quiz.objectif)}
                  </span>
                )}
              </div>

              {quizContext?.orientation && (
                <p className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {quizContext.orientation}
                </p>
              )}

              <div className="mt-3 grid gap-2">
                {portfolio.map(item => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/80">
                    <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-300">{item.weight}%</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                Vos réponses et cette allocation seront jointes automatiquement à votre demande. Vous n’avez rien à ressaisir.
              </p>
              <div className="mt-3 grid gap-1.5 text-xs text-gray-600 dark:text-slate-300 sm:grid-cols-3">
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-center font-semibold dark:bg-slate-800">Adéquation</span>
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-center font-semibold dark:bg-slate-800">Souscription</span>
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-center font-semibold dark:bg-slate-800">Suivi dans le temps</span>
              </div>
            </div>
          )}

          {!isPortfolioFlow && explicitScpi.length > 0 && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">SCPI sélectionnées</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {explicitScpi.map(name => (
                  <span key={name} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-800 dark:text-slate-100">
                  <User className="mr-1 inline h-4 w-4" /> Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="Nom et prénom"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-gray-800 dark:text-slate-100">
                  <Mail className="mr-1 inline h-4 w-4" /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-800 dark:text-slate-100">
                <Phone className="mr-1 inline h-4 w-4" /> Téléphone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formValues.phone}
                onChange={handleInputChange}
                required
                autoComplete="tel"
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="Votre numéro de téléphone"
              />
            </div>

            {!isPortfolioFlow && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-800 dark:text-slate-100">
                    <DollarSign className="mr-1 inline h-4 w-4" /> Montant à investir *
                  </label>
                  <input
                    type="text"
                    name="montant"
                    value={formValues.montant}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="Ex : 50 000 €"
                  />
                </div>

                {!isSimulatorLanding && (
                  <>
                                    <div>
                                      <label className="mb-1 block text-sm font-bold text-gray-800 dark:text-slate-100">
                                        <Calendar className="mr-1 inline h-4 w-4" /> Créneau préféré
                                      </label>
                                      <select
                                        name="creneau"
                                        value={formValues.creneau}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                      >
                                        <option value="">Peu importe / à convenir</option>
                                        <option value="Matin (9h-12h)">Matin (9h-12h)</option>
                                        <option value="Après-midi (14h-17h)">Après-midi (14h-17h)</option>
                                        <option value="Soir (18h-20h)">Soir (18h-20h)</option>
                                      </select>
                                    </div>
                    
                                    <div>
                                      <label className="mb-1 block text-sm font-bold text-gray-800 dark:text-slate-100">
                                        <MessageCircle className="mr-1 inline h-4 w-4" /> Commentaire
                                      </label>
                                      <textarea
                                        name="commentaire"
                                        value={formValues.commentaire}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        placeholder="Précisez votre projet si nécessaire"
                                      />
                                    </div>
                  </>
                )}
              </>
            )}

            {status && (
              <div className={`rounded-xl border p-3 text-sm font-semibold ${status.startsWith('Erreur') ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300' : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'}`}>
                {status}
              </div>
            )}

            {isSimulatorLanding ? (
              <button
                type="submit"
                name="lead_action"
                value="calendly"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 text-base font-black text-slate-950 shadow-lg transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement…' : 'Choisir mon créneau visio'}
              </button>
            ) : (
                          <div className="grid gap-3 pt-1 sm:grid-cols-2">
                            <button
                              type="submit"
                              name="lead_action"
                              value="calendly"
                              disabled={isSubmitting}
                              className="rounded-xl bg-emerald-500 px-5 py-3.5 text-base font-black text-slate-950 shadow-lg transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                              {isSubmitting ? 'Enregistrement…' : 'Choisir mon créneau'}
                            </button>
                            <button
                              type="submit"
                              name="lead_action"
                              value="callback"
                              disabled={isSubmitting}
                              className="rounded-xl border-2 border-slate-300 bg-white px-5 py-3.5 text-base font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                            >
                              {isSubmitting ? 'Enregistrement…' : 'Être rappelé'}
                            </button>
                          </div>
            )}

            {isPortfolioFlow && (
              <p className="text-center text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                Le rendez-vous Calendly est un échange de 30 minutes en visioconférence Zoom consacré à votre portefeuille SCPI.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RdvModal;