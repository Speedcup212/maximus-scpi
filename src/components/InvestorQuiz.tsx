// MaximusSCPI — InvestorQuiz — refonte homepage

import { useState, useRef, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type {
  Montant,
  TMI,
  Horizon,
  Objectif,
  QuizData,
  QuizResult,
  AllocationItem,
  AnalysisCriterion,
} from '../types/quiz'
import { CALENDLY_URL } from '../config/calendly'
import { buildCalendlyPrefillAnswers } from '../config/calendlyMapping'

// Type global minimal pour le widget Calendly
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (config: {
        url: string
        parentElement: HTMLElement
        prefill?: {
          customAnswers?: Record<string, string>
        }
        utm?: Record<string, string>
      }) => void
    }
  }
}

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
  { value: 'revenus', label: 'Rechercher des revenus complémentaires' },
  { value: 'fiscalite', label: 'Réduire ma fiscalité' },
  { value: 'diversification', label: 'Diversifier mon patrimoine' },
  { value: 'croissance', label: 'Faire fructifier mon capital' },
  { value: 'retraite', label: 'Préparer ma retraite' },
  { value: 'transmission', label: 'Transmettre mon patrimoine' },
]

// Fonction pure — règles de priorité, on s'arrête à la première correspondance.
export function calculateResult(data: QuizData): QuizResult {
  // RÈGLE 1 — objectif fiscalité
  if (data.objectif === 'fiscalite') {
    return {
      profil: 'Investisseur orienté optimisation fiscale',
      score: 84,
      geographicAllocation: [
        { label: 'Europe hors France', value: 75 },
        { label: 'International', value: 25 },
      ],
      sectorAllocation: [
        { label: 'Santé / éducation', value: 25 },
        { label: 'Bureaux', value: 20 },
        { label: 'Résidentiel', value: 15 },
        { label: 'Logistique', value: 15 },
      ],
      recommandations: [
        'Privilégier les SCPI européennes pour améliorer la fiscalité nette potentielle.',
        'Étudier le démembrement temporaire si vous n\'avez pas besoin de revenus immédiats.',
        'Comparer les SCPI fiscales uniquement si l\'avantage fiscal ne dégrade pas la qualité patrimoniale.',
      ],
      criteria: [
        { label: 'Fiscalité nette', status: 'prioritaire', description: 'Comparer le rendement brut et le rendement net après fiscalité.' },
        { label: 'Décote / surcote', status: 'prioritaire', description: 'Vérifier l\'écart entre prix de souscription et valeur de reconstitution.' },
        { label: 'TOF', status: 'important', description: 'Contrôler la solidité locative sur plusieurs exercices.' },
        { label: 'Endettement', status: 'important', description: 'Surveiller le niveau d\'endettement dans un contexte de taux élevés.' },
        { label: 'Capitalisation', status: 'important', description: 'Favoriser une taille suffisante pour limiter le risque de concentration.' },
        { label: 'Rendement', status: 'a-verifier', description: 'Retraiter le taux affiché de la fiscalité avant toute comparaison.' },
        { label: 'Diversification gestionnaires', status: 'a-verifier', description: 'Éviter une dépendance à un seul acteur de gestion.' },
      ],
      fiscalStrategy: [
        'SCPI européennes à analyser en priorité.',
        'Démembrement temporaire à envisager selon horizon et besoin de revenus.',
        'SCPI fiscales à traiter comme une niche, pas comme le cœur de l\'allocation.',
      ],
      vigilancePoints: [
        'La réduction fiscale ne doit jamais compenser une mauvaise qualité immobilière.',
        'Le rendement affiché doit être retraité de la fiscalité.',
        'La nue-propriété bloque les revenus pendant la durée du démembrement.',
      ],
    }
  }

  // RÈGLE 2 — TMI élevée + horizon long terme
  if (
    (data.tmi === '30' || data.tmi === '41' || data.tmi === '45') &&
    data.horizon === 'plus-10ans'
  ) {
    return {
      profil: 'Investisseur patrimonial long terme',
      score: 88,
      geographicAllocation: [
        { label: 'Europe hors France', value: 75 },
        { label: 'International', value: 25 },
      ],
      sectorAllocation: [
        { label: 'Bureaux', value: 20 },
        { label: 'Santé / éducation', value: 20 },
        { label: 'Logistique', value: 20 },
        { label: 'Résidentiel', value: 10 },
        { label: 'Commerces', value: 10 },
      ],
      recommandations: [
        'Construire une exposition européenne significative pour optimiser la fiscalité nette potentielle.',
        'Étudier un mix pleine propriété + nue-propriété pour lisser les revenus imposables.',
        'Diversifier les gestionnaires et éviter une concentration sur une seule thématique.',
      ],
      criteria: [
        { label: 'Capitalisation', status: 'prioritaire', description: 'Chercher une taille suffisante pour sécuriser la diversification immobilière.' },
        { label: 'TOF', status: 'prioritaire', description: 'Vérifier la stabilité du taux d\'occupation financier.' },
        { label: 'Décote / surcote', status: 'prioritaire', description: 'Identifier les SCPI achetées à un prix cohérent avec leur valeur patrimoniale.' },
        { label: 'Endettement', status: 'important', description: 'Éviter les véhicules trop dépendants de la dette.' },
        { label: 'Rendement', status: 'important', description: 'Privilégier un rendement soutenable plutôt qu\'un taux exceptionnel.' },
        { label: 'Fiscalité nette', status: 'important', description: 'Comparer l\'impact fiscal France vs Europe sur la durée.' },
        { label: 'Diversification gestionnaires', status: 'important', description: 'Répartir l\'exposition entre plusieurs sociétés de gestion.' },
      ],
      fiscalStrategy: [
        'SCPI européennes à privilégier.',
        'Démembrement pertinent si les revenus ne sont pas nécessaires à court terme.',
        'Pleine propriété possible sur une poche génératrice de revenus maîtrisés.',
      ],
      vigilancePoints: [
        'L\'horizon long terme ne supprime pas le risque de liquidité.',
        'La fiscalité étrangère doit être vérifiée pays par pays.',
        'Une forte capitalisation ne garantit pas la performance.',
      ],
    }
  }

  // RÈGLE 3 — TMI 11 % + revenus
  if (data.tmi === '11' && data.objectif === 'revenus') {
    return {
      profil: 'Investisseur revenus complémentaires',
      score: 78,
      geographicAllocation: [
        { label: 'Europe hors France', value: 45 },
        { label: 'France', value: 40 },
        { label: 'International', value: 15 },
      ],
      sectorAllocation: [
        { label: 'Commerces', value: 20 },
        { label: 'Bureaux', value: 20 },
        { label: 'Santé / éducation', value: 20 },
        { label: 'Logistique', value: 10 },
        { label: 'Résidentiel', value: 10 },
      ],
      recommandations: [
        'Ne pas exclure les SCPI européennes même avec une TMI faible.',
        'Comparer le rendement brut, le rendement net fiscal et la régularité des distributions.',
        'Privilégier les SCPI avec un TOF solide et une capitalisation suffisante.',
      ],
      criteria: [
        { label: 'Rendement', status: 'prioritaire', description: 'Analyser la régularité du rendement, pas seulement le taux affiché.' },
        { label: 'TOF', status: 'prioritaire', description: 'Contrôler la qualité d\'occupation du patrimoine.' },
        { label: 'Capitalisation', status: 'important', description: 'Éviter une exposition trop concentrée sur une petite SCPI.' },
        { label: 'Décote / surcote', status: 'important', description: 'Vérifier si le prix d\'entrée est cohérent avec la valeur de reconstitution.' },
        { label: 'Fiscalité nette', status: 'important', description: 'Même à TMI 11 %, comparer France et Europe.' },
        { label: 'Endettement', status: 'a-verifier', description: 'Surveiller l\'endettement des véhicules à rendement élevé.' },
        { label: 'Diversification gestionnaires', status: 'a-verifier', description: 'Ne pas concentrer le flux de revenus sur un seul gestionnaire.' },
      ],
      fiscalStrategy: [
        'SCPI européennes intéressantes pour la diversification et la fiscalité nette.',
        'Pleine propriété cohérente si l\'objectif est le revenu.',
        'Démembrement moins prioritaire si le besoin de revenus est immédiat.',
      ],
      vigilancePoints: [
        'Un rendement élevé peut masquer un risque de marché ou de collecte.',
        'Les revenus SCPI ne sont pas garantis.',
        'La liquidité reste limitée même sur une SCPI de rendement.',
      ],
    }
  }

  // RÈGLE 4 — montant < 10 k€
  if (data.montant === 'moins-10k') {
    return {
      profil: 'Investisseur en phase de démarrage',
      score: 64,
      geographicAllocation: [
        { label: 'Europe hors France', value: 45 },
        { label: 'France', value: 40 },
        { label: 'International', value: 15 },
      ],
      sectorAllocation: [
        { label: 'Santé / éducation', value: 20 },
        { label: 'Bureaux', value: 20 },
        { label: 'Logistique', value: 15 },
        { label: 'Commerces', value: 10 },
      ],
      alerte:
        'Avec moins de 10 000 €, la diversification sur plusieurs SCPI est limitée. Il faut prioriser la qualité du véhicule, le ticket d\'entrée, les frais et la liquidité.',
      recommandations: [
        'Privilégier une SCPI diversifiée ou européenne avec ticket d\'entrée accessible.',
        'Comparer les frais d\'entrée et les délais de jouissance.',
        'Explorer l\'assurance-vie si elle permet une meilleure diversification avec un faible montant.',
      ],
      criteria: [
        { label: 'Ticket minimum', status: 'prioritaire', description: 'Le montant disponible peut limiter le choix réel.' },
        { label: 'Frais', status: 'prioritaire', description: 'Les frais pèsent davantage sur un petit investissement.' },
        { label: 'Capitalisation', status: 'important', description: 'Une SCPI trop petite peut être plus concentrée.' },
        { label: 'TOF', status: 'important', description: 'La qualité locative reste essentielle même sur un petit ticket.' },
        { label: 'Rendement', status: 'important', description: 'Ne pas arbitrer uniquement sur le taux affiché.' },
        { label: 'Décote / surcote', status: 'a-verifier', description: 'Vérifier le prix d\'entrée par rapport à la valeur de reconstitution.' },
        { label: 'Diversification gestionnaires', status: 'a-verifier', description: 'Limiter le risque de gestion sur un portefeuille restreint.' },
      ],
      fiscalStrategy: [
        'SCPI européennes à regarder même sur petit montant.',
        'Assurance-vie SCPI à comparer selon frais du contrat.',
        'Démembrement possible mais souvent moins prioritaire sur un petit ticket.',
      ],
      vigilancePoints: [
        'La diversification peut être insuffisante.',
        'Le ticket minimum peut forcer une sélection trop étroite.',
        'Les frais doivent être analysés avant toute souscription.',
      ],
    }
  }

  // RÈGLE 5 — défaut
  return {
    profil: 'Investisseur diversification patrimoine',
    score: 76,
    geographicAllocation: [
      { label: 'Europe hors France', value: 45 },
      { label: 'France', value: 35 },
      { label: 'International', value: 20 },
    ],
    sectorAllocation: [
      { label: 'Bureaux', value: 20 },
      { label: 'Santé / éducation', value: 20 },
      { label: 'Logistique', value: 15 },
      { label: 'Commerces', value: 15 },
      { label: 'Résidentiel', value: 10 },
    ],
    recommandations: [
      'Construire une allocation diversifiée avec une poche européenne significative.',
      'Comparer les SCPI selon capitalisation, TOF, rendement, dette et prix de reconstitution.',
      'Éviter de sélectionner uniquement les SCPI les plus connues ou les plus rémunératrices.',
    ],
    criteria: [
      { label: 'Diversification', status: 'prioritaire', description: 'Répartir les risques entre secteurs, zones et gestionnaires.' },
      { label: 'Capitalisation', status: 'prioritaire', description: 'Rechercher une taille cohérente avec l\'objectif de mutualisation.' },
      { label: 'TOF', status: 'important', description: 'Contrôler la stabilité locative.' },
      { label: 'Décote / surcote', status: 'important', description: 'Analyser le prix d\'achat par rapport à la valeur de reconstitution.' },
      { label: 'Endettement', status: 'important', description: 'Vérifier l\'exposition à la dette.' },
      { label: 'Rendement', status: 'important', description: 'Privilégier un rendement cohérent et soutenable.' },
      { label: 'Fiscalité nette', status: 'a-verifier', description: 'Comparer l\'impact fiscal France et Europe.' },
    ],
    fiscalStrategy: [
      'SCPI européennes à intégrer dans l\'analyse.',
      'Démembrement à étudier si l\'horizon est suffisant et les revenus non nécessaires.',
      'Pleine propriété si l\'objectif est de générer du revenu.',
    ],
    vigilancePoints: [
      'Une diversification apparente peut cacher une concentration géographique ou sectorielle.',
      'Les frais et le délai de jouissance peuvent réduire la performance réelle.',
      'Le rendement passé ne préjuge pas du rendement futur.',
    ],
  }
}

const TOTAL_STEPS = 4

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-0.5">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-[72px] h-[72px] shrink-0">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke="#00C896" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-wide">/100</span>
      </div>
    </div>
  )
}

// Orientation géographique — pilotée par la TMI (information générale, aucune SCPI nommée)
function buildGeoJustification(quizData: QuizData): string {
  const isTmiElevated = quizData.tmi === '30' || quizData.tmi === '41' || quizData.tmi === '45'

  if (isTmiElevated) {
    return "À partir de 30 % de tranche marginale, les revenus des SCPI françaises supportent une fiscalité lourde (impôt sur le revenu + 17,2 % de prélèvements sociaux). L'orientation privilégie donc les SCPI européennes et internationales, dont les revenus de source étrangère échappent le plus souvent aux prélèvements sociaux selon les conventions fiscales. La répartition précise se valide avec un conseiller."
  }

  return "À votre tranche d'imposition, la fiscalité des SCPI françaises reste mesurée. Le marché français peut donc constituer un socle pertinent (offre large, simplicité de déclaration), complété par une diversification européenne et internationale. La répartition précise dépend de votre situation et se valide avec un conseiller."
}

function buildSectorJustification(_quizData: QuizData): string {
  return "Le commerce peut offrir des rendements attractifs. La sélection des actifs se précise avec un conseiller."
}

const STATUS_STYLES: Record<AnalysisCriterion['status'], { badge: string; dot: string }> = {
  prioritaire: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: '#00C896' },
  important: { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', dot: '#3b82f6' },
  'a-verifier': { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: '#f59e0b' },
}

const STATUS_LABELS: Record<AnalysisCriterion['status'], string> = {
  prioritaire: 'Prioritaire',
  important: 'Important',
  'a-verifier': 'À vérifier',
}

function QuizResultDashboard({ result, quizData, onReset }: { result: QuizResult; quizData: QuizData; onReset: () => void }) {
  const [loadingRDV, setLoadingRDV] = useState(false)
  const calendlyLoadedRef = useRef(false)

  // Classement qualitatif : géographie (piloté par la TMI)
  const isTmiElevated = quizData.tmi === '30' || quizData.tmi === '41' || quizData.tmi === '45'
  const geoPrincipaux: string[] = isTmiElevated ? ['Europe hors France'] : ['France']
  const geoComplements: string[] = isTmiElevated ? ['International'] : ['Europe hors France', 'International']

  // Classement qualitatif : secteurs
  const sectorPrioritairesRaw = result.sectorAllocation.filter(s => s.value >= 20).map(s => s.label)
  const sectorComplementsRaw = result.sectorAllocation.filter(s => s.value > 0 && s.value < 20).map(s => s.label)

  // Commerce et Logistique toujours en axes prioritaires, quel que soit le profil
  const sectorPrioritairesWithCommerce = sectorPrioritairesRaw.includes('Commerces')
    ? sectorPrioritairesRaw
    : [...sectorPrioritairesRaw, 'Commerces']
  const sectorPrioritaires = sectorPrioritairesWithCommerce.includes('Logistique')
    ? sectorPrioritairesWithCommerce
    : [...sectorPrioritairesWithCommerce, 'Logistique']
  const sectorComplements = sectorComplementsRaw.filter(s => s !== 'Commerces' && s !== 'Logistique')

  const handleRDVClick = useCallback(() => {
    if (loadingRDV) return
    setLoadingRDV(true)

    const openPopup = () => {
      if (!window.Calendly) return
      window.Calendly.initPopupWidget({
        url: CALENDLY_URL,
        prefill: {
          customAnswers: buildCalendlyPrefillAnswers(quizData),
        },
        utm: {
          utmSource: 'maximusscpi',
          utmMedium: 'quiz',
          utmCampaign: 'rdv-scpi',
          utmContent: `${quizData.montant}|${quizData.tmi}|${quizData.horizon}|${quizData.objectif}`,
        },
      })
      setLoadingRDV(false)
    }

    if (calendlyLoadedRef.current && window.Calendly) {
      openPopup()
      return
    }

    if (!window.Calendly) {
      // Lazy-load CSS Calendly
      if (!document.querySelector('link[href*="calendly.com/assets/external/widget.css"]')) {
        const cssEl = document.createElement('link')
        cssEl.href = 'https://assets.calendly.com/assets/external/widget.css'
        cssEl.rel = 'stylesheet'
        document.head.appendChild(cssEl)
      }

      // Lazy-load script Calendly
      const scriptEl = document.createElement('script')
      scriptEl.src = 'https://assets.calendly.com/assets/external/widget.js'
      scriptEl.async = true
      scriptEl.onload = () => {
        calendlyLoadedRef.current = true
        openPopup()
      }
      document.head.appendChild(scriptEl)
    } else {
      calendlyLoadedRef.current = true
      openPopup()
    }
  }, [loadingRDV, quizData])
  return (
    <div className="transition-all duration-300 ease-in-out space-y-5 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
      {/* 1. Profil + score */}
      <div className="flex items-start gap-4">
        <ScoreRing score={result.score} />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-0.5">Votre profil</p>
          <p className="text-[11px] text-emerald-400/80 mb-1">Simulation pédagogique indicative</p>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{result.profil}</h3>
        </div>
      </div>

      {/* Comment lire ce score */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 px-3.5 py-3">
        <p className="text-xs font-semibold text-slate-300 mb-1">Comment lire ce score</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Ce score reflète la cohérence pédagogique de votre profil d'investisseur
          (montant, fiscalité, horizon, objectif). Il est indicatif et ne constitue pas
          une note de performance ni une recommandation. Il sert à structurer votre
          réflexion avant un échange avec un conseiller.
        </p>
      </div>

      {/* Alerte */}
      {result.alerte && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3.5 py-3">
          <WarningIcon />
          <p className="text-xs text-amber-100 leading-relaxed">{result.alerte}</p>
        </div>
      )}

      {/* 2. Orientation géographique indicative (qualitatif) */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3.5">
        <p className="text-xs font-semibold text-slate-300 mb-0.5">Orientation géographique indicative</p>
        <p className="text-[10px] text-slate-500 mb-3">À valider avec un conseiller</p>
        <ul className="space-y-1.5">
          {geoPrincipaux.map((label) => (
            <li key={label} className="flex items-center gap-2 text-xs text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: '#00C896' }} />
              {label} — Axe principal
            </li>
          ))}
          {geoComplements.map((label) => (
            <li key={label} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: '#3b82f6' }} />
              {label} — Complément
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          {buildGeoJustification(quizData)}
        </p>
      </div>

      {/* 3. Secteurs à étudier (qualitatif) */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3.5">
        <p className="text-xs font-semibold text-slate-300 mb-0.5">Secteurs à étudier en priorité</p>
        <p className="text-[10px] text-slate-500 mb-3">Analyse indicative — à valider avec un conseiller</p>
        {sectorPrioritaires.length > 0 && (
          <>
            <p className="text-[11px] font-medium text-emerald-300 mb-1.5">Axes prioritaires</p>
            <ul className="space-y-1 mb-2.5">
              {sectorPrioritaires.map((label) => (
                <li key={label} className="flex items-center gap-2 text-xs text-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: '#00C896' }} />
                  {label}
                </li>
              ))}
            </ul>
          </>
        )}
        {sectorComplements.length > 0 && (
          <>
            <p className="text-[11px] font-medium text-blue-300 mb-1.5">Compléments possibles</p>
            <ul className="space-y-1">
              {sectorComplements.map((label) => (
                <li key={label} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: '#3b82f6' }} />
                  {label}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          {buildSectorJustification(quizData)}
        </p>
      </div>

      {/* Pistes à explorer */}
      <div>
        <p className="text-xs font-semibold text-white mb-2">Critères à approfondir</p>
        <ul className="space-y-2">
          {result.recommandations.map((reco, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
              <CheckIcon />
              <span>{reco}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Critères SCPI */}
      <div>
        <p className="text-xs font-semibold text-white mb-2">Critères SCPI à analyser en priorité</p>
        <div className="space-y-2">
          {result.criteria.map((c) => (
            <div key={c.label} className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-200">{c.label}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[c.status].badge}`}>
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Stratégie fiscale */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5">
        <p className="text-xs font-semibold text-blue-200 mb-2">Stratégie à approfondir</p>
        <ul className="space-y-1.5">
          {result.fiscalStrategy.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-blue-400 shrink-0">→</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Vigilance */}
      <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3.5">
        <p className="text-xs font-semibold text-red-300 mb-2">Points de vigilance</p>
        <ul className="space-y-1.5">
          {result.vigilancePoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <AlertIcon />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mention légale MIF2 */}
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Ces orientations sont informatives et ne constituent pas une recommandation personnalisée au sens de la réglementation MIF2.
      </p>

      {/* Bloc CTA — popup Calendly au clic (RGPD) */}
      <div className="rounded-2xl border border-emerald-400/20 bg-slate-800/40 p-6 space-y-5">
        <div className="text-center space-y-2">
          <h4 className="text-base font-bold text-white sm:text-lg">
            Votre profil est analysé. Validez-le en 30 min avec un CGP.
          </h4>

          {/* Signature Éric Bellaiche */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <img
              src="/images/eric-192.webp"
              srcSet="/images/eric-96.webp 96w, /images/eric-192.webp 192w, /images/eric-384.webp 384w"
              sizes="64px"
              alt="Éric Bellaiche, Conseiller en Investissements Financiers"
              width="56"
              height="56"
              className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-emerald-400/30"
              loading="lazy"
            />
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">Éric Bellaiche</p>
              <p className="text-xs text-slate-400 leading-snug">
                Conseiller en Investissements Financiers (CIF) · Orias n°13001580
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Visio gratuite, sans engagement. On vérifie ensemble votre orientation avec vos chiffres réels.
          </p>
        </div>

        {/* Réassurance */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-700/40 px-3 py-1.5 text-xs text-slate-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Gratuit, sans engagement
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-700/40 px-3 py-1.5 text-xs text-slate-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            30 min en visio Zoom
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleRDVClick}
            disabled={loadingRDV}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-60"
            style={{ backgroundColor: '#00C896' }}
          >
            {loadingRDV ? 'Chargement…' : 'Réserver mon rendez-vous'}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed text-center">
          En réservant, vous accédez à notre outil de prise de rendez-vous (Calendly),
          susceptible de déposer des cookies.{' '}
          <a
            href="/politique_confidentialite_maximusscpi.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-300 transition-colors"
          >
            Voir notre politique de confidentialité.
          </a>
        </p>
      </div>

      {/* CTA secondaire discret */}
      <div className="text-center">
        <a href="/comparateur-scpi" className="text-xs underline text-slate-400 hover:text-white transition-colors">
          Explorer le comparateur complet →
        </a>
      </div>

      <div className="text-center pb-1">
        <button type="button" onClick={onReset} className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
          ← Recommencer
        </button>
      </div>
    </div>
  )
}

export default function InvestorQuiz({ onComplete }: InvestorQuizProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<PartialQuizData>({})
  const [showTmiTooltip, setShowTmiTooltip] = useState(false)
  const [locked, setLocked] = useState(false)

  const selectAnswer = <K extends keyof QuizData>(
    key: K,
    value: QuizData[K]
  ) => {
    if (locked) return
    const updated = { ...data, [key]: value }
    setData(updated)
    setLocked(true)

    window.setTimeout(() => {
      if (step >= TOTAL_STEPS - 1) {
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
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-5">{title}</h3>
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
      <div className="mb-5 flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: '#00C896' }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#00C896' }} />
          </span>
          <span className="text-sm font-semibold text-slate-200">Simulation pédagogique</span>
        </div>
        <span className="rounded-full border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
          {result ? 'Résultat' : '4 questions'}
        </span>
      </div>

      <div>
        {step < TOTAL_STEPS && renderProgress()}

        {step > 0 && step < TOTAL_STEPS && (
          <button type="button" onClick={goBack} className="mb-4 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
            ← Précédent
          </button>
        )}

        {step === 0 &&
          renderQuestion('Quel montant souhaitez-vous investir ?', MONTANT_OPTIONS, (v) => selectAnswer('montant', v as Montant), data.montant)}

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
              <p className="mb-4 rounded-lg border border-slate-700/70 bg-slate-800/80 px-4 py-3 text-sm text-slate-300">
                Consultez votre dernier avis d'imposition, rubrique Taux marginal d'imposition.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TMI_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => selectAnswer('tmi', opt.value)} className={optionButtonClass(data.tmi === opt.value)}>
                  <span>{opt.label}</span>
                  <span className={`h-2 w-2 rounded-full transition-opacity ${data.tmi === opt.value ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: '#00C896' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 &&
          renderQuestion("Quel est votre horizon d'investissement ?", HORIZON_OPTIONS, (v) => selectAnswer('horizon', v as Horizon), data.horizon)}

        {step === 3 &&
          <div className="transition-all duration-300 ease-in-out">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
              Quel est votre objectif principal ?
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              Choisissez l'objectif qui compte le plus pour vous aujourd'hui.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {OBJECTIF_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectAnswer('objectif', opt.value as Objectif)}
                  className={optionButtonClass(data.objectif === opt.value)}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`h-2 w-2 rounded-full transition-opacity ${
                      data.objectif === opt.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}
                    style={{ backgroundColor: '#00C896' }}
                  />
                </button>
              ))}
            </div>
          </div>}

        {result && <QuizResultDashboard result={result} quizData={data as QuizData} onReset={reset} />}
      </div>
    </div>
  )
}
