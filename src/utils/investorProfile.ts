export type InvestorProfile =
  | 'PROFIL OPPOSE AU RISQUE'
  | 'Profil sécuritaire'
  | 'Profil prudent défensif'
  | 'Profil équilibré prudent'
  | 'Profil équilibré dynamique'
  | 'Profil dynamique'
  | 'Profil agressif'
  | null;

const STORAGE_KEY = 'investor_profile_label';

const PROFILE_VALUES: Array<Exclude<InvestorProfile, null>> = [
  'PROFIL OPPOSE AU RISQUE',
  'Profil sécuritaire',
  'Profil prudent défensif',
  'Profil équilibré prudent',
  'Profil équilibré dynamique',
  'Profil dynamique',
  'Profil agressif',
];

const LEGACY_MAP: Record<string, Exclude<InvestorProfile, null>> = {
  'Profil opposé au risque': 'PROFIL OPPOSE AU RISQUE',
  'Profil prudent structuré': 'Profil prudent défensif',
  'Profil très dynamique / autonome': 'Profil agressif',
};

export const isInvestorProfile = (value: string | null): value is Exclude<InvestorProfile, null> => {
  return value !== null && PROFILE_VALUES.includes(value as Exclude<InvestorProfile, null>);
};

export const getInvestorProfile = (): InvestorProfile => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isInvestorProfile(stored)) {
      return stored;
    }
    if (stored && LEGACY_MAP[stored]) {
      const mapped = LEGACY_MAP[stored];
      window.localStorage.setItem(STORAGE_KEY, mapped);
      return mapped;
    }
    return null;
  } catch {
    return null;
  }
};

export const setInvestorProfile = (profile: Exclude<InvestorProfile, null>): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, profile);
  } catch {
    // ignore storage errors
  }
};

export const clearInvestorProfile = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
};
