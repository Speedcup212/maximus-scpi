import { supabase } from '../lib/supabase';
import { getVerificationProfile } from './expertVerification';

/* ── Types ── */

export type UserAccessRole = 'admin' | 'cgp' | 'expert_accountant' | 'unknown';

const ROLE_STORAGE_KEY = 'maximus_expert_user_role';
const CURRENT_ROLE_KEY = 'maximus_expert_current_role';

/* ── Stockage rôle ── */

interface RoleEntry {
  email: string;
  role: UserAccessRole;
  setAt: string;
}

function loadRoles(): RoleEntry[] {
  try {
    const raw = localStorage.getItem(ROLE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRoles(roles: RoleEntry[]): void {
  localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
}

/* ── API publique : lecture synchrone (pour les composants React) ── */

export function getUserAccessRole(email: string): UserAccessRole {
  if (!email) return 'unknown';
  const roles = loadRoles();
  const entry = roles.find((r) => r.email.toLowerCase() === email.toLowerCase());
  return entry?.role || 'unknown';
}

/** Lit le rôle courant depuis le cache localStorage (sans besoin d'email). */
export function getCurrentRoleFromCache(): UserAccessRole {
  try {
    const raw = localStorage.getItem(CURRENT_ROLE_KEY);
    if (!raw) return 'unknown';
    return raw as UserAccessRole;
  } catch {
    return 'unknown';
  }
}

export function setUserAccessRole(email: string, role: UserAccessRole): void {
  const normalized = email.toLowerCase();
  const roles = loadRoles().filter((r) => r.email.toLowerCase() !== normalized);
  roles.push({ email: normalized, role, setAt: new Date().toISOString() });
  saveRoles(roles);
  localStorage.setItem(CURRENT_ROLE_KEY, role);
}

/* ── Résolution de session ── */

export async function getCurrentSessionEmail(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email || null;
}

/* ── Résolution du rôle depuis Supabase ── */

export async function resolveAccessRole(): Promise<UserAccessRole> {
  if (!supabase) return 'unknown';

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return 'unknown';

  const email = user.email;
  if (!email) return 'unknown';

  // 1. app_metadata.role (source prioritaire)
  const appRole = (user.app_metadata as Record<string, unknown>)?.['role'] as string | undefined;
  if (appRole === 'admin' || appRole === 'cgp' || appRole === 'expert_accountant') {
    setUserAccessRole(email, appRole);
    return appRole;
  }

  // 2. Fallback : public.profiles
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && profile && profile.status === 'active') {
      const profileRole = profile.role as string | undefined;
      if (profileRole === 'admin' || profileRole === 'cgp' || profileRole === 'expert_accountant') {
        setUserAccessRole(email, profileRole);
        return profileRole;
      }
    }
  } catch {
    // profiles table may not exist yet — silent fallback
  }

  return 'unknown';
}

/* ── Détermination de la redirection post-login expert ── */

export type ExpertRedirectAction =
  | 'simulator'
  | 'verification'
  | 'access-refused'
  | 'register';

export async function getExpertPostLoginRedirect(): Promise<ExpertRedirectAction> {
  const email = await getCurrentSessionEmail();
  if (!email) return 'register';

  // Résoudre le rôle depuis Supabase (et cache)
  const role = await resolveAccessRole();

  if (role === 'admin') return 'simulator';
  if (role === 'cgp') return 'access-refused';

  // expert_accountant ou unknown → vérifier le statut de vérification
  const profile = getVerificationProfile();
  if (profile?.status === 'declared_oec_registered') {
    // Marquer comme expert_accountant si vérifié
    if (role === 'unknown') {
      setUserAccessRole(email, 'expert_accountant');
    }
    return 'simulator';
  }

  // Pas encore vérifié → page de vérification
  return 'verification';
}

/* ── Guard : peut accéder à une section protégée ? ── */

export type ExpertGuardResult =
  | { allowed: true }
  | { allowed: false; redirect: ExpertRedirectAction; reason: string };

export async function checkExpertAccess(
  section: string
): Promise<ExpertGuardResult> {
  // Routes publiques : pas de check
  const publicSections = ['login', 'register', 'post-login', 'access-refused'];
  if (publicSections.includes(section)) {
    return { allowed: true };
  }

  const email = await getCurrentSessionEmail();

  // Pas de session
  if (!email) {
    return { allowed: false, redirect: 'register', reason: 'no_session' };
  }

  // Résoudre le rôle depuis Supabase (et cache)
  const role = await resolveAccessRole();

  // Admin : accès total
  if (role === 'admin') {
    return { allowed: true };
  }

  // CGP : refusé
  if (role === 'cgp') {
    return { allowed: false, redirect: 'access-refused', reason: 'cgp_role' };
  }

  // Vérification : accessible aux non-vérifiés
  if (section === 'verification') {
    return { allowed: true };
  }

  // Expert ou unknown : vérifier le statut
  const profile = getVerificationProfile();
  if (profile?.status === 'declared_oec_registered') {
    if (role === 'unknown') {
      setUserAccessRole(email, 'expert_accountant');
    }
    return { allowed: true };
  }

  // Non vérifié → rediriger vers vérification
  return { allowed: false, redirect: 'verification', reason: 'not_verified' };
}

export function getRedirectUrl(action: ExpertRedirectAction): string {
  switch (action) {
    case 'simulator':
      return '/expert-comptable/simulateur-holding';
    case 'verification':
      return '/expert-comptable/verification';
    case 'access-refused':
      return '/expert-comptable/access-refused';
    case 'register':
      return '/expert-comptable/login';
  }
}
