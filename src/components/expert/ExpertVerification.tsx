import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Building2, Mail, MapPin, Briefcase, Loader2 } from 'lucide-react';
import {
  verifyExpertFirmSiret,
  getVerificationProfile,
  saveVerificationProfile,
  getVerificationStatusLabel,
  getVerificationBadgeColor,
} from '../../utils/expertVerification';
import type { ExpertVerificationProfile, ExpertVerificationStatus } from '../../types/expertDossier';

interface ExpertVerificationProps {
  onNavigate: (section: string) => void;
}

const ExpertVerification: React.FC<ExpertVerificationProps> = ({ onNavigate }) => {
  const [siret, setSiret] = useState('');
  const [profile, setProfile] = useState<ExpertVerificationProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oecChecked, setOecChecked] = useState(false);
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const saved = getVerificationProfile();
    if (saved) {
      setProfile(saved);
      setSiret(saved.siret);
      setProfessionalEmail(saved.professionalEmail || '');
      setOecChecked(saved.oecSelfDeclaration);
      if (saved.status === 'declared_oec_registered') {
        setActivated(true);
      }
    }
  }, []);

  const handleVerifySiret = async () => {
    setError('');
    setLoading(true);
    const result = await verifyExpertFirmSiret(siret);
    if (result.error && !result.profile) {
      setError(result.error);
      setProfile(null);
    } else if (result.profile) {
      setProfile(result.profile);
      setOecChecked(false);
      setActivated(false);
      saveVerificationProfile(result.profile);
    }
    setLoading(false);
  };

  const handleOpenOecDirectory = () => {
    window.open('https://annuaire.experts-comptables.org', '_blank', 'noopener,noreferrer');
  };

  const handleActivate = () => {
    if (!profile || !oecChecked) return;
    setActivating(true);
    const updated: ExpertVerificationProfile = {
      ...profile,
      status: 'declared_oec_registered',
      professionalEmail: professionalEmail.trim(),
      oecSelfDeclaration: true,
      oecSelfDeclaredAt: new Date().toISOString(),
    };
    saveVerificationProfile(updated);
    setProfile(updated);
    setActivated(true);
    setActivating(false);
  };

  const isAccountingActivity = profile?.status === 'siret_verified_accounting_activity';
  const isNonAccounting = profile?.status === 'siret_verified_non_accounting_activity';
  const isNotFound = profile?.status === 'siret_not_found';
  const isDeclared = profile?.status === 'declared_oec_registered';

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Vérification</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Vérification du cabinet</h1>
        <p className="text-slate-400 max-w-2xl">
          Vérifiez votre SIRET pour accéder à l'espace Expert-Comptable et générer des rapports sans filigrane.
        </p>
      </div>

      {/* ── Statut actuel ── */}
      {profile && (
        <div className={`rounded-xl p-5 mb-6 border ${getVerificationBadgeColor(profile.status)}`}>
          <div className="flex items-start gap-3">
            {isDeclared ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : isAccountingActivity ? (
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            ) : isNonAccounting ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {isDeclared ? 'Cabinet déclaré — SIRET vérifié' : getVerificationStatusLabel(profile.status)}
              </p>
              {profile.firmName && (
                <p className="text-sm mt-1 opacity-80">{profile.firmName}</p>
              )}
              {profile.city && (
                <p className="text-xs mt-0.5 opacity-60">{profile.address}, {profile.postalCode} {profile.city}</p>
              )}
              {profile.apeCode && (
                <p className="text-xs mt-0.5 opacity-60">Code APE : {profile.apeCode} — {profile.apeLabel}</p>
              )}
              {profile.verifiedAt && (
                <p className="text-[10px] mt-1 opacity-50">
                  Vérifié le {new Date(profile.verifiedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Formulaire SIRET ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" /> SIRET du cabinet
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              placeholder="123 456 789 00012"
              maxLength={14}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono tracking-wider"
            />
          </div>
          <button
            onClick={handleVerifySiret}
            disabled={loading || siret.replace(/\D/g, '').length !== 14}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Vérifier le SIRET
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Résultat vérification */}
        {profile && !isDeclared && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            {isAccountingActivity && (
              <p className="text-sm text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                SIRET vérifié — activité comptable identifiée.
              </p>
            )}
            {isNonAccounting && (
              <p className="text-sm text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                SIRET valide, mais l'activité principale déclarée ne correspond pas au code 69.20Z — Activités comptables.
              </p>
            )}
            {isNotFound && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                SIRET introuvable ou non reconnu.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Bouton Annuaire Ordre ── */}
      {isAccountingActivity && !isDeclared && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Inscription à l'Ordre
          </h2>

          <button
            onClick={handleOpenOecDirectory}
            className="flex items-center gap-2 px-5 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Vérifier l'inscription à l'Ordre
          </button>

          <p className="text-xs text-slate-500 mt-3">
            L'annuaire officiel permet de vérifier que le cabinet ou le professionnel est inscrit au tableau de l'Ordre.
          </p>
        </div>
      )}

      {/* ── Auto-déclaration ── */}
      {isAccountingActivity && !isDeclared && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" /> Activation de l'espace
          </h2>

          {/* Email professionnel */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email professionnel</label>
            <input
              type="email"
              value={professionalEmail}
              onChange={(e) => setProfessionalEmail(e.target.value)}
              placeholder="vous@cabinet-expertise.fr"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Case auto-déclaration */}
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={oecChecked}
              onChange={(e) => setOecChecked(e.target.checked)}
              disabled={!professionalEmail.trim()}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-slate-300">
              Je confirme que le cabinet figure dans l'annuaire officiel de l'Ordre des experts-comptables.
            </span>
          </label>

          <button
            onClick={handleActivate}
            disabled={!oecChecked || !professionalEmail.trim() || activating || activated}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {activating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : activated ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {activated ? 'Espace activé' : 'Activer mon espace Expert-Comptable'}
          </button>

          {activated && (
            <p className="mt-3 text-sm text-emerald-400">
              Cabinet déclaré — votre espace Expert-Comptable est activé.
            </p>
          )}
        </div>
      )}

      {/* ── Wording conformité ── */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 mb-6">
        <p className="text-xs text-slate-500 leading-relaxed">
          Google vérifie l'adresse email. MaximusSCPI vérifie le SIRET et l'activité déclarée du cabinet.
          L'inscription à l'Ordre est confirmée par l'utilisateur à partir de l'annuaire officiel.
        </p>
      </div>

      {/* ── Accès rapide simulateur ── */}
      <div className="text-center">
        <button
          onClick={() => onNavigate('holding-simulator')}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Accéder au simulateur Holding IS
        </button>
      </div>
    </div>
  );
};

export default ExpertVerification;
