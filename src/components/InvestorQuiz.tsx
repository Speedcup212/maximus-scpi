// MaximusSCPI — InvestorQuiz — refonte homepage

import { useState } from 'react'
import type { ReactNode } from 'react'
import type {
  Montant,
  TMI,
  Horizon,
  Objectif,
  QuizData,
  QuizResult,
} from '../types/quiz'

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL ?? '#'

interface InvestorQuizProps {
  onComplete: (data: QuizData) => void
}

type PartialQuizData = Partial<QuizData>

type Option<T extends string> = { value: T; label: string }

const MONTANT_OPTIONS: Option<Montant>[] = [
  { value: 'moins-10k', label: 'Moins de 10 000 €' },
  { value: '10k-50k', label: '10 000 – 50 000 €' },
  { value: '50k-150k', label: '50 000 – 150 000 €' },
  { value: 'plus-150k', label: 'Plus de 150 000 €' },
]

const TMI_OPTIONS: Option<TMI>[] = [
  { value: 'inconnu', label: 'Je ne sais pas' },
  { value: '11', label: '11%' },
  { value: '30', label: '30%' },
  { value: '41', label: '41% ou 45%' },
]

const HORIZON_OPTIONS: Option<Horizon>[] = [
  { value: 'moins-5ans', label: 'Moins de 5 ans' },
  { value: '5-10ans', label: '5 à 10 ans' },
  { value: 'plus-10ans', label: 'Plus de 10 ans' },
]

const OBJECTIF_OPTIONS: Option<Objectif>[] = [
  { value: 'revenus', label: 'Revenus complémentaires' },
  { value: 'fiscalite', label: 'Réduction fiscale' },
  { value: 'diversification', label: 'Diversification patrimoine' },
  { value: 'transmission', label: 'Transmission' },
]

// Fonction pure — règles de priorité, on s'arrête à la première correspondance.
export function calculateResult(data: QuizData): QuizResult {
  // RÈGLE 1
  if (data.objectif === 'fiscalite') {
    return {
      profil: 'Investisseur orienté optimisation fiscale',
      recommandations: [
        'SCPI en nue-propriété : aucun revenu imposable pendant le démembrement',
        'SCPI fiscales Denormandie ou Malraux selon éligibilité géographique',
        'Démembrement temporaire 5-10 ans calibré selon votre TMI',
      ],
    }
  }

  // RÈGLE 2
  if (
    (data.tmi === '30' || data.tmi === '41' || data.tmi === '45') &&
    data.horizon === 'plus-10ans'
  ) {
    return {
      profil: 'Investisseur patrimonial long terme',
      recommandations: [
        'SCPI européennes : revenus fonciers étrangers hors barème IR français',
        "SCPI diversifiées internationales pour réduire l'exposition fiscale",
        'Mix pleine propriété + nue-propriété pour lisser la fiscalité',
      ],
    }
  }

  // RÈGLE 3
  if (data.tmi === '11' && data.objectif === 'revenus') {
    return {
      profil: 'Investisseur revenus complémentaires',
      recommandations: [
        'SCPI françaises à rendement solide : TMI faible = impact fiscal maîtrisé',
        'SCPI commerces ou bureaux avec track record supérieur à 5 ans',
        'Privilégier la distribution trimestrielle pour un flux régulier',
      ],
    }
  }

  // RÈGLE 4
  if (data.montant === 'moins-10k') {
    return {
      profil: 'Investisseur en phase de démarrage',
      alerte:
        "Avec moins de 10 000 €, la diversification sur plusieurs SCPI est limitée. Envisager une SCPI unique à ticket minimum faible ou l'accès via assurance-vie pour mutualiser les frais d'entrée.",
      recommandations: [
        'SCPI à ticket minimum faible (parts à partir de 200 €)',
        "Accès via assurance-vie SCPI pour réduire les frais d'entrée",
        "Priorité à la qualité du gestionnaire plutôt qu'au taux affiché",
      ],
    }
  }

  // RÈGLE 5 — défaut
  return {
    profil: 'Investisseur diversification patrimoine',
    recommandations: [
      'Mix SCPI bureaux + résidentiel + santé pour réduire la corrélation',
      'Minimum 3 gestionnaires différents pour diluer le risque de gestion',
      "Vérifier le taux d'occupation financier (TOF) sur les 3 dernières années",
    ],
  }
}

const TOTAL_STEPS = 4

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00C896"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 mt-0.5"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default function InvestorQuiz({ onComplete }: InvestorQuizProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<PartialQuizData>({})
  const [showTmiTooltip, setShowTmiTooltip] = useState(false)
  const [locked, setLocked] = useState(false)

  const goToStep = (next: number) => {
    setStep(next)
  }

  const selectAnswer = <K extends keyof QuizData>(
    key: K,
    value: QuizData[K]
  ) => {
    if (locked) return
    const updated = { ...data, [key]: value }
    setData(updated)
    setLocked(true)

    // Passage automatique après 300ms.
    window.setTimeout(() => {
      if (step >= TOTAL_STEPS - 1) {
        // Dernière question : on bascule sur l'écran résultat.
        onComplete(updated as QuizData)
        setStep(TOTAL_STEPS)
      } else {
        setStep(step + 1)
      }
      setLocked(false)
    }, 300)
  }

  const goBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const reset = () => {
    setStep(0)
    setData({})
    setShowTmiTooltip(false)
    setLocked(false)
  }

  const optionButtonClass = (selected: boolean) =>
    [
      'group w-full text-left px-4 py-3.5 rounded-xl border text-slate-100 font-medium',
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
      'flex items-center justify-between gap-3',
      selected
        ? 'border-emerald-400/60 bg-emerald-400/15'
        : 'border-slate-700/70 bg-slate-800/40 hover:border-emerald-400/60 hover:bg-emerald-400/10',
    ].join(' ')

  const renderProgress = () => (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Étape {Math.min(step + 1, TOTAL_STEPS)} sur {TOTAL_STEPS}
        </span>
        <span className="text-xs font-bold" style={{ color: '#00C896' }}>
          {Math.round((step / TOTAL_STEPS) * 100)}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden ring-1 ring-inset ring-slate-700/60">
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${(step / TOTAL_STEPS) * 100}%`,
            background: 'linear-gradient(90deg, #0056b3 0%, #00C896 100%)',
          }}
        />
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= step ? '#00C896' : 'rgba(148,163,184,0.25)' }}
          />
        ))}
      </div>
    </div>
  )

  const renderQuestion = (
    title: ReactNode,
    options: { value: string; label: string }[],
    onSelect: (value: string) => void,
    selectedValue?: string
  ) => (
    <div className="transition-all duration-300 ease-in-out">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-5">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={optionButtonClass(selectedValue === opt.value)}
          >
            <span>{opt.label}</span>
            <span
              className={`h-2 w-2 rounded-full transition-opacity ${
                selectedValue === opt.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`}
              style={{ backgroundColor: '#00C896' }}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const result: QuizResult | null =
    step >= TOTAL_STEPS &&
    data.montant &&
    data.tmi &&
    data.horizon &&
    data.objectif
      ? calculateResult(data as QuizData)
      : null

  return (
    <div
      id="quiz-section"
      className="scroll-mt-28 rounded-3xl border border-emerald-400/20 bg-slate-900/80 p-5 sm:p-7 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl"
    >
      {/* Barre supérieure type module SaaS */}
      <div className="mb-5 flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: '#00C896' }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#00C896' }} />
          </span>
          <span className="text-sm font-semibold text-slate-200">
            Simulation pédagogique
          </span>
        </div>
        <span className="rounded-full border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
          4 questions
        </span>
      </div>

      <div>
        {step < TOTAL_STEPS && renderProgress()}

        {/* Bouton Précédent — disponible à partir de Q2 */}
        {step > 0 && step < TOTAL_STEPS && (
          <button
            type="button"
            onClick={goBack}
            className="mb-4 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Précédent
          </button>
        )}

        {/* Q1 — Montant */}
        {step === 0 &&
          renderQuestion(
            'Quel montant souhaitez-vous investir ?',
            MONTANT_OPTIONS,
            (v) => selectAnswer('montant', v as Montant),
            data.montant
          )}

        {/* Q2 — TMI */}
        {step === 1 && (
          <div className="transition-all duration-300 ease-in-out">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Quelle est votre tranche marginale d'imposition ?
            </h3>
            <button
              type="button"
              onClick={() => setShowTmiTooltip((v) => !v)}
              className="text-sm underline text-slate-400 hover:text-slate-200 transition-colors mb-3"
            >
              (Comment la trouver ?)
            </button>
            {showTmiTooltip && (
              <p className="mb-4 rounded-lg border border-slate-700/70 bg-slate-800/80 px-4 py-3 text-sm text-slate-300 transition-all duration-300 ease-in-out">
                Consultez votre dernier avis d'imposition, rubrique Taux
                marginal d'imposition.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TMI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectAnswer('tmi', opt.value)}
                  className={optionButtonClass(data.tmi === opt.value)}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`h-2 w-2 rounded-full transition-opacity ${
                      data.tmi === opt.value ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundColor: '#00C896' }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q3 — Horizon */}
        {step === 2 &&
          renderQuestion(
            "Quel est votre horizon d'investissement ?",
            HORIZON_OPTIONS,
            (v) => selectAnswer('horizon', v as Horizon),
            data.horizon
          )}

        {/* Q4 — Objectif */}
        {step === 3 &&
          renderQuestion(
            'Quel est votre objectif principal ?',
            OBJECTIF_OPTIONS,
            (v) => selectAnswer('objectif', v as Objectif),
            data.objectif
          )}

          {/* Écran résultat */}
          {result && (
            <div className="transition-all duration-300 ease-in-out">
              {/* 1. Profil */}
              <p className="text-sm uppercase tracking-widest text-slate-400 mb-1">
                Votre profil
              </p>
              <h3 className="text-2xl font-bold text-white mb-6">
                {result.profil}
              </h3>

              {/* 2. Alerte éventuelle */}
              {result.alerte && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3">
                  <WarningIcon />
                  <p className="text-sm text-amber-100">{result.alerte}</p>
                </div>
              )}

              {/* 3. Recommandations */}
              <p className="font-semibold text-white mb-3">3 pistes à explorer :</p>
              <ul className="space-y-3 mb-6">
                {result.recommandations.map((reco, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200">
                    <CheckIcon />
                    <span>{reco}</span>
                  </li>
                ))}
              </ul>

              {/* 4. Mention légale */}
              <p className="text-xs text-gray-400 mb-6">
                Ces orientations sont informatives et ne constituent pas une
                recommandation personnalisée au sens de la réglementation MIF2.
              </p>

              {/* 5. CTA primaire Calendly */}
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-4 rounded-xl font-semibold text-[#0D1117] transition-all duration-300 ease-in-out hover:opacity-90"
                style={{ backgroundColor: '#00C896' }}
              >
                Valider ma sélection avec un expert →
              </a>

              {/* 6. CTA secondaire */}
              <div className="mt-4 text-center">
                <a
                  href="/comparateur-scpi"
                  className="text-sm underline text-slate-300 hover:text-white transition-colors"
                >
                  Explorer le comparateur complet →
                </a>
              </div>

              {/* 7. Reset */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Recommencer
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
