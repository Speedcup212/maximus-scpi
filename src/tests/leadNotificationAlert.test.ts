import { describe, expect, it } from 'vitest';
import {
  amountLabel,
  buildLeadAlert,
  formatParisDate,
  isTestLead,
  replyToFor,
  type LeadRow,
} from '../../supabase/functions/send-lead-notification/logic.ts';

// RECOVERY-204 — alerte « Nouveau prospect » lisible, Répondre au prospect.
const simulationLead: LeadRow = {
  request_id: 'e322c1ac-f0fb-4fbf-bf9d-c3d64db667f5',
  created_at: '2026-11-13T09:05:45.884Z',
  email: 'Prospect.Fixture@Example.test',
  prenom: 'Claire',
  nom: null,
  telephone: null,
  form_type: 'lead_simulation_email',
  channel: 'simulateur',
  context_slug: 'simulateur-scpi',
  page_url: '/simulateur-scpi/',
  utm_source: 'instagram',
  utm_medium: 'social',
  utm_campaign: 'cas-simule',
  gclid: null,
  message: null,
  answers: {
    tranche_montant: '50-100k', montant_simule: 50000, taux_hypothese: 5, delai_jouissance_mois: 6,
    origine: 'france', tmi: 30, horizon_ans: 10, revenu_brut_annuel: 2500, revenu_net_annuel: 1320,
    revenu_net_mensuel: 110, action: 'email_simulation', consent_text_version: 'sim-email-v2',
  },
  consentement_marketing: true,
  consentement_date: '2026-11-13T09:05:45.000Z',
};

describe('lead alert (RECOVERY-204)', () => {
  it('puts the amount, first name and form in the subject', () => {
    expect(buildLeadAlert(simulationLead).subject)
      .toBe('Nouveau prospect · 50 000 à 100 000 € · Claire · Simulation envoyée par email');
  });

  it('replies directly to the prospect, normalised', () => {
    expect(buildLeadAlert(simulationLead).replyTo).toBe('prospect.fixture@example.test');
    expect(replyToFor({ ...simulationLead, email: 'not an email' })).toBeNull();
    expect(buildLeadAlert({ ...simulationLead, email: 'x' }).text)
      .toContain('Adresse du prospect invalide');
  });

  it('shows Paris time, readable figures and the marketing consent', () => {
    const { text } = buildLeadAlert(simulationLead);
    expect(text).toContain('reçu le 13/11/2026 à 10:05 (heure de Paris)');
    expect(text).toContain('- Montant envisagé : 50 000 à 100 000 €');
    expect(text).toContain('- Montant simulé : 50 000 €');
    expect(text).toContain('- Revenu net simulé : 110 € / mois · 1 320 € / an');
    expect(text).toContain('- TMI déclarée : 30 %');
    expect(text).toContain('OUI : accepte les informations et propositions de rendez-vous par email (le 13/11/2026 à 10:05, texte sim-email-v2)');
    expect(text).toContain('- Source : instagram / social / cas-simule');
    expect(text).toContain('Répondre à cet email écrit directement à prospect.fixture@example.test.');
    expect(text).not.toContain('{"');
  });

  it('distinguishes refused and not-collected consent', () => {
    expect(buildLeadAlert({ ...simulationLead, consentement_marketing: false }).text)
      .toContain("NON : n'a pas accepté les propositions par email");
    expect(buildLeadAlert({ ...simulationLead, consentement_marketing: null }).text)
      .toContain('Non recueilli sur ce formulaire');
  });

  it('flags test leads in the subject', () => {
    const test = { ...simulationLead, utm_source: 'test_eric_prod' };
    expect(isTestLead(test)).toBe(true);
    expect(buildLeadAlert(test).subject.startsWith('[TEST] Nouveau prospect')).toBe(true);
    expect(isTestLead(simulationLead)).toBe(false);
  });

  it('handles an appointment form with a numeric amount, phone and message', () => {
    const alert = buildLeadAlert({
      ...simulationLead,
      form_type: 'lead_rdv', prenom: 'Marc', nom: 'Fixture', telephone: '06 00 00 00 00',
      message: 'Je souhaite <b>diversifier</b>', consentement_marketing: null,
      answers: { montant: 150000, creneau: 'matin', action: 'calendly' },
      utm_source: null, utm_medium: null, utm_campaign: null,
    });
    expect(alert.subject).toBe('Nouveau prospect · 150 000 € · Marc · Demande de rendez-vous');
    expect(alert.text).toContain('- Téléphone : 06 00 00 00 00');
    expect(alert.text).toContain('- Action : A ouvert la prise de rendez-vous en ligne (Calendly)');
    expect(alert.text).toContain('- Creneau : matin');
    expect(alert.text).toContain('- Source : Accès direct ou non renseignée');
    expect(alert.html).toContain('href="tel:0600000000"');
    expect(alert.html).toContain('Je souhaite &lt;b&gt;diversifier&lt;/b&gt;');
    expect(alert.html).not.toContain('<b>diversifier</b>');
  });

  it('falls back gracefully when nothing is known', () => {
    const alert = buildLeadAlert({ request_id: 'r', email: 'a@b.fr', answers: null, prenom: null });
    expect(alert.subject).toBe('Nouveau prospect · montant non renseigné · prénom non renseigné · formulaire');
    expect(amountLabel({})).toBeNull();
    expect(formatParisDate('not a date', new Date('2026-07-01T10:00:00Z'))).toBe('01/07/2026 à 12:00');
  });
});
