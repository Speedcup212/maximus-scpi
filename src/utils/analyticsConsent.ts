const CONSENT_KEY = 'cookie-consent';

// Opposition à la mesure d'audience interne exemptée de consentement
// (RECOVERY-203). Il s'agit d'un choix de l'utilisateur, pas d'un traceur.
export const AUDIENCE_OPTOUT_KEY = 'maximus-audience-optout';

export const hasAnalyticsConsent = () => {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return parsed.analytics === true;
  } catch {
    return false;
  }
};

export const hasAudienceOptOut = () => {
  if (typeof window === 'undefined') return true;

  try {
    return localStorage.getItem(AUDIENCE_OPTOUT_KEY) === '1';
  } catch {
    // Stockage illisible : on ne mesure pas plutôt que de risquer d'ignorer
    // une opposition que l'on ne peut pas relire.
    return true;
  }
};

export const setAudienceOptOut = (optOut: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    if (optOut) localStorage.setItem(AUDIENCE_OPTOUT_KEY, '1');
    else localStorage.removeItem(AUDIENCE_OPTOUT_KEY);
  } catch {
    // Stockage indisponible : rien à mémoriser.
  }
};
