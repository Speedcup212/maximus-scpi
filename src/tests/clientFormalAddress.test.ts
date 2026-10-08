import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Vérification de cohérence du ton des messages rédigés pour l'espace privé.
// Les titres de navigation à la première personne ("Mon compte", "Mes SCPI")
// sont compatibles avec le vouvoiement et doivent rester inchangés.
const surfaces = [
  '../app/pages/ClientDashboard.tsx',
  '../app/pages/ClientCases.tsx',
  '../app/pages/ClientCaseDetail.tsx',
  '../app/pages/AccountPage.tsx',
  '../app/pages/AppEntry.tsx',
  '../app/pages/AppLogin.tsx',
  '../app/pages/AppOnboarding.tsx',
  '../app/pages/AppSignup.tsx',
  '../app/pages/AppClaim.tsx',
  '../app/pages/SetPassword.tsx',
  '../app/pages/SetupPage.tsx',
  '../app/components/ClientPortfolioRadarTrajectory.tsx',
  '../app/components/ClientScpiCard.tsx',
  '../app/components/AppLayout.tsx',
];

describe('vouvoiement des parcours clients MaximusSCPI', () => {
  it.each(surfaces)('%s ne contient aucun tutoiement explicite', (path) => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const informal = /\b(?:tu|ton|tes|ta|toi|réessaie|renseigne|clique|vérifie|corrige)\b/iu;
    expect(source).not.toMatch(informal);
  });

  it('emploie le vouvoiement dans les points de contact essentiels', () => {
    const dashboard = readFileSync(new URL('../app/pages/ClientDashboard.tsx', import.meta.url), 'utf8');
    const login = readFileSync(new URL('../app/pages/AppLogin.tsx', import.meta.url), 'utf8');
    const account = readFileSync(new URL('../app/pages/AccountPage.tsx', import.meta.url), 'utf8');
    expect(dashboard).toContain('Votre portefeuille, surveillé dans le temps.');
    expect(dashboard).toContain('Composition de votre portefeuille');
    expect(dashboard).toContain('Ajoutez vos SCPI détenues ailleurs');
    expect(login).toContain('Première connexion : utilisez Google');
    expect(account).toContain('Vous pouvez également définir un mot de passe');
  });
});
