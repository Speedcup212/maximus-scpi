// RECOVERY-204 — Logique pure de l'alerte « Nouveau prospect » (sans API Deno
// ni réseau), partagée par index.ts et testée par
// src/tests/leadNotificationAlert.test.ts.
//
// Objectif : une alerte lisible en 10 secondes, dont « Répondre » écrit
// directement au prospect, avec le statut de son accord marketing visible.

export interface LeadRow {
  request_id: string;
  created_at?: string | null;
  email: string;
  prenom?: string | null;
  nom?: string | null;
  telephone?: string | null;
  form_type?: string | null;
  channel?: string | null;
  context_slug?: string | null;
  page_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  gclid?: string | null;
  message?: string | null;
  answers?: Record<string, unknown> | null;
  consentement_marketing?: boolean | null;
  consentement_date?: string | null;
}

export interface LeadAlert {
  subject: string;
  text: string;
  html: string;
  replyTo: string | null;
}

export const TRANCHE_LABELS: Record<string, string> = {
  'moins-20k': 'Moins de 20 000 €',
  '20-50k': '20 000 à 50 000 €',
  '50-100k': '50 000 à 100 000 €',
  '100-300k': '100 000 à 300 000 €',
  'plus-300k': 'Plus de 300 000 €',
};

const FORM_LABELS: Record<string, string> = {
  lead_simulation_email: 'Simulation envoyée par email',
  lead_simulation: 'Analyse de simulation',
  lead_rdv: 'Demande de rendez-vous',
  portfolio_validation: 'Validation de portefeuille',
  portfolio_analysis: 'Analyse de portefeuille',
  lead_contact: 'Contact depuis une fiche SCPI',
  lead_magnet: 'Guide téléchargé',
  lead_partner: 'Partenaire',
  lead_souscription: 'Souscription',
};

const ACTION_LABELS: Record<string, string> = {
  calendly: 'A ouvert la prise de rendez-vous en ligne (Calendly)',
  email_simulation: 'A demandé sa simulation par email',
};

const ORIGIN_LABELS: Record<string, string> = {
  france: 'Immeubles en France',
  international: 'Europe / international',
};

// Réponses affichées dans le bloc « Projet » ; les autres vont en « Autres réponses ».
// Les montants dérivés du simulateur (brut, première année, cumul) se
// recalculent depuis les hypothèses : ils ne sont pas répétés dans l'alerte.
const PROJECT_KEYS = new Set([
  'tranche_montant', 'montant', 'montant_simule', 'amount', 'revenu_net_mensuel',
  'revenu_net_annuel', 'taux_hypothese', 'tmi', 'origine', 'horizon_ans', 'action',
  'consent_text_version', 'delai_jouissance_mois', 'revenu_brut_annuel',
  'revenu_premiere_annee', 'cumul_horizon',
]);

const EMAIL = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

const clean = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();

const toNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) && String(value ?? '').trim() !== '' ? parsed : null;
};

export const formatEuro = (value: number): string =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value).replace(/\u202f|\u00a0/g, ' ')} €`;

export const formatParisDate = (iso: string | null | undefined, fallback: Date): string => {
  const date = iso ? new Date(iso) : fallback;
  const safe = Number.isNaN(date.getTime()) ? fallback : date;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris', hourCycle: 'h23',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).formatToParts(safe).map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} à ${parts.hour}:${parts.minute}`;
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const humanizeKey = (key: string): string => {
  const words = key.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const answerValue = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 300);
  return clean(value).slice(0, 300);
};

export function isTestLead(lead: LeadRow): boolean {
  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign].map(clean).join(' ').toLowerCase();
  return /\btest/.test(utm) || /\+test/i.test(clean(lead.email));
}

export function replyToFor(lead: LeadRow): string | null {
  const email = clean(lead.email).toLowerCase();
  return EMAIL.test(email) ? email : null;
}

/** Montant mis en avant dans l'objet et le bloc « Projet ». */
export function amountLabel(answers: Record<string, unknown>): string | null {
  const tranche = clean(answers.tranche_montant);
  if (tranche) return TRANCHE_LABELS[tranche] || tranche;
  for (const key of ['montant', 'montant_simule', 'amount']) {
    const amount = toNumber(answers[key]);
    if (amount !== null && amount > 0) return formatEuro(amount);
    const raw = clean(answers[key]);
    if (raw) return raw.slice(0, 60);
  }
  return null;
}

type Line = { label: string; value: string; href?: string };

function sections(lead: LeadRow, now: Date) {
  const answers = (lead.answers && typeof lead.answers === 'object' ? lead.answers : {}) as Record<string, unknown>;
  const fullName = `${clean(lead.prenom)} ${clean(lead.nom)}`.trim();
  const email = clean(lead.email);
  const phone = clean(lead.telephone);

  const contact: Line[] = [
    { label: 'Nom', value: fullName || 'Non renseigné' },
    { label: 'Email', value: email, href: replyToFor(lead) ? `mailto:${email}` : undefined },
    { label: 'Téléphone', value: phone || 'Non renseigné', href: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined },
  ];

  const project: Line[] = [];
  const amount = amountLabel(answers);
  if (amount) project.push({ label: 'Montant envisagé', value: amount });
  const simulated = toNumber(answers.montant_simule);
  if (simulated !== null && clean(answers.tranche_montant)) {
    project.push({ label: 'Montant simulé', value: formatEuro(simulated) });
  }
  const monthly = toNumber(answers.revenu_net_mensuel);
  const yearly = toNumber(answers.revenu_net_annuel);
  if (monthly !== null || yearly !== null) {
    const parts = [
      monthly !== null ? `${formatEuro(monthly)} / mois` : '',
      yearly !== null ? `${formatEuro(yearly)} / an` : '',
    ].filter(Boolean);
    project.push({ label: 'Revenu net simulé', value: parts.join(' · ') });
  }
  const rate = toNumber(answers.taux_hypothese);
  if (rate !== null) project.push({ label: 'Hypothèse de distribution', value: `${rate} %` });
  const tmi = toNumber(answers.tmi);
  if (tmi !== null) project.push({ label: 'TMI déclarée', value: `${tmi} %` });
  const origin = clean(answers.origine);
  if (origin) project.push({ label: 'Origine des revenus', value: ORIGIN_LABELS[origin] || origin });
  const delay = toNumber(answers.delai_jouissance_mois);
  if (delay !== null) project.push({ label: 'Délai de jouissance', value: `${delay} mois` });
  const horizon = toNumber(answers.horizon_ans);
  if (horizon !== null) project.push({ label: 'Horizon', value: `${horizon} ans` });
  const action = clean(answers.action);
  if (action) project.push({ label: 'Action', value: ACTION_LABELS[action] || action });

  const consentVersion = clean(answers.consent_text_version);
  const consentDate = lead.consentement_date ? formatParisDate(lead.consentement_date, now) : '';
  const consentDetails = [
    consentDate ? `le ${consentDate}` : '',
    consentVersion ? `texte ${consentVersion}` : '',
  ].filter(Boolean).join(', ');
  const consent = lead.consentement_marketing === true
    ? `OUI : accepte les informations et propositions de rendez-vous par email${consentDetails ? ` (${consentDetails})` : ''}`
    : lead.consentement_marketing === false
      ? 'NON : n\'a pas accepté les propositions par email'
      : 'Non recueilli sur ce formulaire';

  const others: Line[] = Object.entries(answers)
    .filter(([key, value]) => !PROJECT_KEYS.has(key) && answerValue(value) !== '')
    .map(([key, value]) => ({ label: humanizeKey(key), value: answerValue(value) }));

  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign].map(clean).filter(Boolean).join(' / ');
  const formType = clean(lead.form_type);
  const origin_: Line[] = [
    { label: 'Formulaire', value: `${FORM_LABELS[formType] || formType || 'Non renseigné'}${formType ? ` (${formType})` : ''}` },
    { label: 'Page', value: clean(lead.page_url) || clean(lead.context_slug) || 'Non renseignée' },
    { label: 'Source', value: utm || 'Accès direct ou non renseignée' },
  ];
  if (clean(lead.gclid)) origin_.push({ label: 'Google Ads (gclid)', value: clean(lead.gclid) });

  return { answers, fullName, amount, contact, project, consent, others, origin: origin_, formType };
}

export function buildLeadAlert(lead: LeadRow, now: Date = new Date()): LeadAlert {
  const s = sections(lead, now);
  const test = isTestLead(lead);
  const replyTo = replyToFor(lead);
  const received = formatParisDate(lead.created_at, now);
  const who = clean(lead.prenom) || s.fullName || 'prénom non renseigné';
  const what = FORM_LABELS[s.formType] || s.formType || 'formulaire';

  const subject = [
    `${test ? '[TEST] ' : ''}Nouveau prospect`,
    s.amount || 'montant non renseigné',
    who,
    what,
  ].join(' · ').slice(0, 200);

  const message = clean(lead.message);
  const replyHint = replyTo
    ? `Répondre à cet email écrit directement à ${replyTo}.`
    : 'Adresse du prospect invalide : ne pas utiliser « Répondre ».';

  const textBlock = (title: string, lines: Line[]) =>
    lines.length ? [`${title}`, ...lines.map((line) => `- ${line.label} : ${line.value}`), ''] : [];

  const text = [
    `${test ? '[TEST] ' : ''}Nouveau prospect, reçu le ${received} (heure de Paris)`,
    '',
    ...textBlock('CONTACT', s.contact),
    ...textBlock('PROJET', s.project),
    'ACCORD MARKETING',
    `- ${s.consent}`,
    '',
    ...(message ? ['MESSAGE', message.slice(0, 2000), ''] : []),
    ...textBlock('AUTRES RÉPONSES', s.others),
    ...textBlock('ORIGINE', s.origin),
    replyHint,
    `Référence : ${lead.request_id}`,
  ].join('\n');

  const row = (line: Line) => {
    const value = escapeHtml(line.value);
    const cell = line.href ? `<a href="${escapeHtml(line.href)}" style="color:#0a6e4d">${value}</a>` : value;
    return `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${escapeHtml(line.label)}</td><td style="padding:4px 0;color:#111827">${cell}</td></tr>`;
  };
  const htmlBlock = (title: string, lines: Line[]) =>
    lines.length
      ? `<h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#0a6e4d">${escapeHtml(title)}</h3><table style="border-collapse:collapse;font-size:14px">${lines.map(row).join('')}</table>`
      : '';
  const consentColor = lead.consentement_marketing === true ? '#0a6e4d' : '#b45309';

  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px">
<p style="margin:0 0 4px;font-size:12px;color:#6b7280">${test ? '<strong style="color:#b45309">[TEST]</strong> ' : ''}Reçu le ${escapeHtml(received)} (heure de Paris)</p>
<h2 style="margin:0 0 4px;font-size:20px;color:#111827">${escapeHtml(who)} · ${escapeHtml(s.amount || 'montant non renseigné')}</h2>
<p style="margin:0;font-size:14px;color:#374151">${escapeHtml(what)}</p>
${htmlBlock('Contact', s.contact)}
${htmlBlock('Projet', s.project)}
<h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#0a6e4d">Accord marketing</h3>
<p style="margin:0;font-size:14px;font-weight:bold;color:${consentColor}">${escapeHtml(s.consent)}</p>
${message ? `<h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#0a6e4d">Message</h3><p style="margin:0;font-size:14px;color:#111827;white-space:pre-wrap">${escapeHtml(message.slice(0, 2000))}</p>` : ''}
${htmlBlock('Autres réponses', s.others)}
${htmlBlock('Origine', s.origin)}
<p style="margin:20px 0 0;padding-top:12px;border-top:1px solid #e5e7eb;font-size:13px;color:#374151">${escapeHtml(replyHint)}</p>
<p style="margin:4px 0 0;font-size:11px;color:#9ca3af">Référence : ${escapeHtml(lead.request_id)}</p>
</div></body></html>`;

  return { subject, text, html, replyTo };
}
