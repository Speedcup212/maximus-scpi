import type { ExpertVerificationProfile, ExpertVerificationStatus, SiretApiResponse } from '../types/expertDossier';

const STORAGE_KEY = 'maximus_expert_verification_profile';

/* ── Nettoyage SIRET ── */

export function cleanSiret(raw: string): string {
  return raw.replace(/[\s.\-/]+/g, '');
}

export function isValidSiretFormat(siret: string): boolean {
  return /^\d{14}$/.test(siret);
}

/* ── Appel API Entreprise ── */

export async function verifyExpertFirmSiret(
  siret: string
): Promise<{ profile: ExpertVerificationProfile | null; error: string | null }> {
  const cleaned = cleanSiret(siret);

  if (!isValidSiretFormat(cleaned)) {
    return { profile: null, error: 'Format SIRET invalide. Un SIRET doit comporter exactement 14 chiffres.' };
  }

  try {
    const response = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleaned}&page=1&per_page=1&etat_administratif=A&est_entrepreneur_individuel=false`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      return { profile: null, error: 'Service de vérification temporairement indisponible. Veuillez réessayer.' };
    }

    const data = await response.json();
    const results: SiretApiResponse[] = data.results || [];

    if (results.length === 0) {
      return {
        profile: {
          status: 'siret_not_found',
          siret: cleaned,
          siren: cleaned.substring(0, 9),
          firmName: '',
          address: '',
          postalCode: '',
          city: '',
          apeCode: '',
          apeLabel: '',
          administrativeStatus: 'unknown',
          professionalEmail: '',
          oecSelfDeclaration: false,
          verifiedAt: new Date().toISOString(),
        },
        error: null,
      };
    }

    const firm = results[0];
    const apeCode = firm.activite_principale || '';
    const firmName =
      firm.personne_morale_attributs?.raison_sociale ||
      firm.enseigne ||
      '';
    const isAccountingActivity = apeCode === '69.20Z';
    const isActive =
      firm.etat_administratif === 'A' &&
      (firm.unite_legale?.etat_administratif !== 'C');

    let status: ExpertVerificationStatus;

    if (!isActive) {
      // Non actif mais trouvé
      status = 'siret_not_found';
    } else if (isAccountingActivity) {
      status = 'siret_verified_accounting_activity';
    } else {
      status = 'siret_verified_non_accounting_activity';
    }

    const profile: ExpertVerificationProfile = {
      status,
      siret: firm.siret || cleaned,
      siren: firm.siren || cleaned.substring(0, 9),
      firmName,
      address: firm.adresse || '',
      postalCode: firm.code_postal || '',
      city: firm.libelle_commune || '',
      apeCode,
      apeLabel: firm.libelle_activite_principale || '',
      administrativeStatus: isActive ? 'active' : 'closed',
      professionalEmail: '',
      oecSelfDeclaration: false,
      verifiedAt: new Date().toISOString(),
    };

    return { profile, error: null };
  } catch {
    return { profile: null, error: 'Impossible de contacter le service de vérification. Vérifiez votre connexion et réessayez.' };
  }
}

/* ── Stockage localStorage ── */

export function getVerificationProfile(): ExpertVerificationProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExpertVerificationProfile;
  } catch {
    return null;
  }
}

export function saveVerificationProfile(profile: ExpertVerificationProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getVerificationStatusLabel(status: ExpertVerificationStatus): string {
  switch (status) {
    case 'unverified':
      return 'Non vérifié';
    case 'siret_verified_accounting_activity':
      return 'SIRET vérifié';
    case 'siret_verified_non_accounting_activity':
      return 'SIRET vérifié (activité différente)';
    case 'siret_not_found':
      return 'SIRET non reconnu';
    case 'declared_oec_registered':
      return 'Cabinet déclaré';
  }
}

export function getVerificationBadgeColor(status: ExpertVerificationStatus): string {
  switch (status) {
    case 'unverified':
    case 'siret_not_found':
      return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
    case 'siret_verified_accounting_activity':
    case 'siret_verified_non_accounting_activity':
      return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'declared_oec_registered':
      return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30';
  }
}
