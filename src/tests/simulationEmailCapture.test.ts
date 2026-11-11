import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_TEXT_VERSION,
  buildLeadPayload,
  buildSubmittedMetadata,
  isAtLeast50k,
  isValidEmail,
  sourceFromPath,
  trancheFromAmount,
  type SimulationSnapshot,
} from '../utils/simulationEmailCapture';
import {
  buildContactAttributes,
  buildEmailParams,
  buildRdvUrl,
  cleanPrenom,
  formatMoney,
  isFresh,
  shouldOfferRdv,
  validateAnswers,
} from '../../supabase/functions/send-simulation-email/logic';

// RECOVERY-201 — capture email après simulation.

const snapshot: SimulationSnapshot = {
  montantSimule: 75000,
  tauxHypothese: 5,
  delaiJouissanceMois: 6,
  origine: 'france',
  tmi: 30,
  horizonAns: 10,
  revenuBrutAnnuel: 3750,
  revenuNetAnnuel: 1980.4,
  revenuNetMensuel: 165.03,
  revenuPremiereAnnee: 990.2,
  cumulHorizon: null,
};

const spaces = (value: string) => value.replace(/[\s\u202f\u00a0]/g, ' ');

describe('logique pure du bloc', () => {
  it.each([
    [19999, 'moins-20k'], [20000, '20-50k'], [49999, '20-50k'], [50000, '50-100k'],
    [99999, '50-100k'], [100000, '100-300k'], [299999, '100-300k'], [300000, 'plus-300k'],
  ])('trancheFromAmount(%i) = %s', (amount, tranche) => {
    expect(trancheFromAmount(amount)).toBe(tranche);
  });

  it('ne propose le rendez-vous qu’à partir de 50 k€', () => {
    expect(isAtLeast50k('moins-20k')).toBe(false);
    expect(isAtLeast50k('20-50k')).toBe(false);
    expect(isAtLeast50k('50-100k')).toBe(true);
    expect(isAtLeast50k('100-300k')).toBe(true);
    expect(isAtLeast50k('plus-300k')).toBe(true);
  });

  it('déduit la page source du chemin', () => {
    expect(sourceFromPath('/simulateur-revenus-nets-scpi/')).toBe('simulateur-revenus-nets-scpi');
    expect(sourceFromPath('/simulateur-scpi/')).toBe('simulateur-scpi');
    expect(sourceFromPath('/')).toBe('simulateur-scpi');
  });

  it('valide le format email simplement', () => {
    expect(isValidEmail('client@exemple.fr')).toBe(true);
    expect(isValidEmail(' client@exemple.fr ')).toBe(true);
    expect(isValidEmail('client@exemple')).toBe(false);
    expect(isValidEmail('client exemple@x.fr')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('construit le lead sans consentement par défaut, sans email dans answers et sans transformer un null', () => {
    const payload = buildLeadPayload({
      email: ' Client@Exemple.fr ', prenom: '  ', tranche: '50-100k',
      consentMarketing: false, source: 'simulateur-scpi', snapshot,
    });
    expect(payload.form_type).toBe('lead_simulation_email');
    expect(payload.channel).toBe('simulateur');
    expect(payload.context_slug).toBe('simulateur-scpi');
    expect(payload.identity).toEqual({ email: 'Client@Exemple.fr', prenom: null });
    expect(payload.consent).toEqual({ marketing: false, textVersion: CONSENT_TEXT_VERSION });
    expect(payload.answers).toMatchObject({
      tranche_montant: '50-100k', montant_simule: 75000, revenu_net_annuel: 1980,
      revenu_net_mensuel: 165, cumul_horizon: null, action: 'email_simulation',
    });
    expect(JSON.stringify(payload.answers)).not.toContain('@');
    expect(Object.keys(payload.answers ?? {})).not.toContain('email');
    expect(Object.keys(payload.answers ?? {})).not.toContain('prenom');
  });

  it('enregistre la case cochée', () => {
    const payload = buildLeadPayload({
      email: 'a@b.fr', prenom: 'Anne', tranche: '20-50k',
      consentMarketing: true, source: 'simulateur-revenus-nets-scpi', snapshot,
    });
    expect(payload.consent?.marketing).toBe(true);
    expect(payload.identity.prenom).toBe('Anne');
  });

  it('ne met ni email ni prénom dans les métadonnées de suivi', () => {
    const metadata = buildSubmittedMetadata({
      source: 'simulateur-scpi', tranche: '100-300k', consentMarketing: true,
      requestId: '622489bf-981b-4cee-b2ce-ea8ca988b724',
    });
    expect(Object.keys(metadata).sort()).toEqual(
      ['consent_marketing', 'lead_request_id', 'source', 'tranche_montant'],
    );
    expect(JSON.stringify(metadata)).not.toContain('@');
  });
});

describe('submitLead écrit le consentement uniquement quand il est recueilli', () => {
  const database = vi.hoisted(() => ({ insert: vi.fn(), invoke: vi.fn() }));
  vi.mock('../supabaseClient', () => ({
    supabase: {
      from: () => ({ insert: database.insert }),
      functions: { invoke: database.invoke },
    },
  }));

  let submitLead: typeof import('../utils/leadSubmitter').submitLead;
  let trackFunnelEvent: typeof import('../utils/funnelAnalytics').trackFunnelEvent;
  const send = vi.fn<typeof fetch>();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const session = new Map<string, string>();
    vi.stubGlobal('window', {
      location: new URL('https://maximusscpi.com/simulateur-scpi/'), dataLayer: [], gtag: vi.fn(),
    });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ analytics: true }) });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => session.set(key, value),
    });
    send.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', send);
    database.insert.mockResolvedValue({ error: null });
    database.invoke.mockResolvedValue({});
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    ({ submitLead } = await import('../utils/leadSubmitter'));
    ({ trackFunnelEvent } = await import('../utils/funnelAnalytics'));
  });

  it('case cochée : colonnes de consentement, date et version du texte', async () => {
    const result = await submitLead(buildLeadPayload({
      email: 'a@b.fr', tranche: '50-100k', consentMarketing: true, source: 'simulateur-scpi', snapshot,
    }));
    expect(result.ok).toBe(true);
    const row = database.insert.mock.calls[0][0][0];
    expect(row.consentement_marketing).toBe(true);
    expect(Number.isNaN(Date.parse(row.consentement_date))).toBe(false);
    expect(row.answers.consent_text_version).toBe(CONSENT_TEXT_VERSION);
    expect(row.form_type).toBe('lead_simulation_email');
  });

  it('case non cochée : consentement false, aucune date', async () => {
    await submitLead(buildLeadPayload({
      email: 'a@b.fr', tranche: '20-50k', consentMarketing: false, source: 'simulateur-scpi', snapshot,
    }));
    const row = database.insert.mock.calls[0][0][0];
    expect(row.consentement_marketing).toBe(false);
    expect(row.consentement_date).toBeNull();
  });

  it('les autres formulaires restent identiques (aucune colonne de consentement ajoutée)', async () => {
    await submitLead({
      channel: 'contact', form_type: 'lead_rdv', identity: { email: 'a@b.fr' }, answers: { montant: '50k' },
    });
    const row = database.insert.mock.calls[0][0][0];
    expect(row).not.toHaveProperty('consentement_marketing');
    expect(row).not.toHaveProperty('consentement_date');
    expect(row.answers).toEqual({ montant: '50k' });
  });

  it('transmet les nouveaux événements et clés au journal first-party, sans email', () => {
    trackFunnelEvent('simulation_email_submitted', buildSubmittedMetadata({
      source: 'simulateur-scpi', tranche: '50-100k', consentMarketing: false,
      requestId: '622489bf-981b-4cee-b2ce-ea8ca988b724',
    }));
    const body = JSON.parse(send.mock.calls[0][1]?.body as string);
    expect(body.event_name).toBe('simulation_email_submitted');
    expect(body.metadata).toMatchObject({ tranche_montant: '50-100k', consent_marketing: false });
    expect(JSON.stringify(body)).not.toContain('@');
  });
});

describe('endpoint /api/funnel-event accepte les événements RECOVERY-201', () => {
  const source = readFileSync(new URL('../../netlify/functions/funnel-event.ts', import.meta.url), 'utf8');
  const executable = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  type Handler = (event: { httpMethod: string; headers: Record<string, string>; body: string }) =>
    Promise<{ statusCode: number; body: string }>;
  let handler: Handler;
  const write = vi.fn<typeof fetch>();

  beforeEach(() => {
    write.mockReset();
    write.mockResolvedValue(new Response(null, { status: 201 }));
    const exports = {} as { handler: Handler };
    vm.runInNewContext(executable, {
      exports, Buffer, console, fetch: write,
      process: { env: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } },
    });
    handler = exports.handler;
  });

  const call = (eventName: string, metadata: Record<string, unknown>) => handler({
    httpMethod: 'POST', headers: { origin: 'https://maximusscpi.com' },
    body: JSON.stringify({
      event_name: eventName, session_id: '622489bf-981b-4cee-b2ce-ea8ca988b724',
      path: '/simulateur-scpi/', metadata,
    }),
  });

  it.each(['simulation_email_viewed', 'simulation_email_submitted', 'simulation_email_calendly_clicked'])(
    'accepte %s', async (eventName) => {
      const response = await call(eventName, { source: 'simulateur-scpi', tranche_montant: '50-100k', consent_marketing: true });
      expect(response.statusCode).toBe(204);
    },
  );

  it('refuse toujours une clé email', async () => {
    const response = await call('simulation_email_submitted', { email: 'a@b.fr' });
    expect(response.statusCode).toBe(400);
    expect(write).not.toHaveBeenCalled();
  });
});

describe('fonction send-simulation-email : logique serveur', () => {
  const answers = {
    tranche_montant: '50-100k', montant_simule: 75000, taux_hypothese: 5, delai_jouissance_mois: 6,
    origine: 'france', tmi: 30, horizon_ans: 10, revenu_brut_annuel: 3750, revenu_net_annuel: 1980,
    revenu_net_mensuel: 165, revenu_premiere_annee: 990, cumul_horizon: null,
  };

  it('accepte des réponses valides', () => {
    expect(validateAnswers(answers)).not.toBeNull();
  });

  it.each([
    ['tmi hors barème', { tmi: 25 }],
    ['montant trop faible', { montant_simule: 999 }],
    ['taux trop élevé', { taux_hypothese: 11 }],
    ['horizon inconnu', { horizon_ans: 12 }],
    ['tranche inconnue', { tranche_montant: 'tout' }],
    ['montant en texte', { revenu_net_annuel: '<b>1980</b>' }],
  ])('refuse : %s', (_label, patch) => {
    expect(validateAnswers({ ...answers, ...patch })).toBeNull();
  });

  it('ne remplace jamais une valeur absente par un chiffre', () => {
    expect(formatMoney(null)).toBe('non calculé');
    const params = buildEmailParams(validateAnswers(answers)!, 'Anne', 'simulateur-scpi');
    expect(params.CUMUL).toBe('non calculé');
    expect(spaces(params.MONTANT)).toBe('75 000 €');
    expect(spaces(params.TAUX)).toBe('5,0 %');
    expect(params.LIEN_SIMULATION).toBe('https://www.maximusscpi.com/simulateur-scpi/');
  });

  it('borne le lien de simulation aux deux pages connues', () => {
    const params = buildEmailParams(validateAnswers(answers)!, '', 'https://evil.example');
    expect(params.LIEN_SIMULATION).toBe('https://www.maximusscpi.com/simulateur-scpi/');
  });

  it('nettoie le prénom', () => {
    expect(cleanPrenom('<script>alert(1)</script> Jean-Luc')).toBe('scriptalertscript Jean-Luc');
    expect(cleanPrenom("D'Artagnan")).toBe("D'Artagnan");
    expect(cleanPrenom('x'.repeat(60))).toHaveLength(40);
    expect(cleanPrenom(null)).toBe('');
  });

  it('marque MONTANT_50K et date le consentement au jour', () => {
    const attributes = buildContactAttributes(validateAnswers(answers)!, 'Anne', 'simulateur-scpi', '2026-11-11T05:00:00.000Z');
    expect(attributes).toEqual({
      PRENOM: 'Anne', TRANCHE_MONTANT: '50-100k', MONTANT_50K: true,
      SOURCE_PAGE: 'simulateur-scpi', CONSENT_DATE: '2026-11-11', RDV_PRIS: false,
    });
  });

  it('ne propose le rendez-vous dans l’email qu’avec la case cochée et 50 k€ ou plus', () => {
    expect(shouldOfferRdv('50-100k', true)).toBe(true);
    expect(shouldOfferRdv('plus-300k', true)).toBe(true);
    expect(shouldOfferRdv('50-100k', false)).toBe(false);
    expect(shouldOfferRdv('20-50k', true)).toBe(false);
  });

  it('sans case cochée, l’email 1 reste transactionnel (aucun lien de rendez-vous)', () => {
    const params = buildEmailParams(validateAnswers(answers)!, 'Anne', 'simulateur-scpi', {
      consentMarketing: false, email: 'anne@exemple.fr',
    });
    expect(params.AFFICHER_RDV).toBe('');
    expect(params.LIEN_RDV).toBe('');
    expect(params.CONSENTEMENT).toBe('');
  });

  it('avec la case cochée et 50 k€ ou plus, le lien Calendly est prérempli et traçable', () => {
    const params = buildEmailParams(validateAnswers(answers)!, 'Anne', 'simulateur-scpi', {
      consentMarketing: true, email: 'anne@exemple.fr',
    });
    expect(params.AFFICHER_RDV).toBe('oui');
    expect(params.CONSENTEMENT).toBe('oui');
    const url = new URL(params.LIEN_RDV);
    expect(url.origin + url.pathname).toBe('https://calendly.com/eric-bellaiche/rdv-strategique-scpi');
    expect(url.searchParams.get('utm_content')).toBe('simulateur-scpi-email');
    expect(url.searchParams.get('utm_medium')).toBe('email');
    expect(url.searchParams.get('email')).toBe('anne@exemple.fr');
    expect(url.searchParams.get('name')).toBe('Anne');
  });

  it('case cochée sous 50 k€ : pas de rendez-vous, mais consentement transmis', () => {
    const params = buildEmailParams(validateAnswers({ ...answers, tranche_montant: '20-50k' })!, '', 'simulateur-scpi', {
      consentMarketing: true, email: 'anne@exemple.fr',
    });
    expect(params.AFFICHER_RDV).toBe('');
    expect(params.CONSENTEMENT).toBe('oui');
  });

  it('borne aussi le lien de rendez-vous aux pages connues', () => {
    const url = new URL(buildRdvUrl('a@b.fr', '', 'https://evil.example'));
    expect(url.searchParams.get('utm_content')).toBe('simulateur-scpi-email');
    expect(url.searchParams.has('name')).toBe(false);
  });

  it('refuse une ligne de plus de 15 minutes', () => {
    const now = Date.parse('2026-11-11T06:00:00Z');
    expect(isFresh('2026-11-11T05:50:00Z', now)).toBe(true);
    expect(isFresh('2026-11-11T05:40:00Z', now)).toBe(false);
    expect(isFresh('pas une date', now)).toBe(false);
  });
});
