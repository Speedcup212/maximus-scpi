import React, { useMemo, useState } from 'react';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';

type AnswerOption = 'A' | 'B' | 'C' | 'D';

type Question = {
  id: number;
  text: string;
  options: { value: AnswerOption; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Selon vous, le principal risque d’un investissement sur plusieurs années est :",
    options: [
      { value: 'A', label: 'Une perte définitive de capital' },
      { value: 'B', label: 'Une période prolongée sans performance' },
      { value: 'C', label: 'Une mauvaise décision prise au mauvais moment' },
      { value: 'D', label: 'L’impossibilité de savoir à l’avance ce qui va se produire' },
    ]
  },
  {
    id: 2,
    text: "Si un investissement respecte son scénario initial mais traverse une phase difficile, vous considérez que :",
    options: [
      { value: 'A', label: 'Le scénario est invalidé' },
      { value: 'B', label: 'Il faut réévaluer les hypothèses' },
      { value: 'C', label: 'La phase fait partie du cycle' },
      { value: 'D', label: 'Cela dépend du contexte global' },
    ]
  },
  {
    id: 3,
    text: "Un investissement qui ne progresse pas pendant 3 à 4 ans vous semble :",
    options: [
      { value: 'A', label: 'Inadapté' },
      { value: 'B', label: 'Problématique mais tolérable' },
      { value: 'C', label: 'Compatible avec une logique long terme' },
      { value: 'D', label: 'Impossible à juger sans recul supplémentaire' },
    ]
  },
  {
    id: 4,
    text: "Pour vous, le temps joue généralement :",
    options: [
      { value: 'A', label: 'Contre l’investisseur' },
      { value: 'B', label: 'Un rôle neutre' },
      { value: 'C', label: 'En faveur de l’investisseur patient' },
      { value: 'D', label: 'Différemment selon le type d’investissement' },
    ]
  },
  {
    id: 5,
    text: "Un investissement évolue moins bien que prévu pendant un certain temps. Que faites-vous en priorité ?",
    options: [
      { value: 'A', label: 'Je choisis l’option la plus rassurante' },
      { value: 'B', label: 'Je choisis l’option que je comprends le mieux' },
      { value: 'C', label: 'Je garde le cap si le projet reste cohérent' },
      { value: 'D', label: 'Je préfère attendre avant de décider' },
    ]
  },
  {
    id: 6,
    text: "Entre deux investissements, lequel vous attire le plus ?",
    options: [
      { value: 'A', label: 'Celui qui est plus sûr, même s’il évolue peu' },
      { value: 'B', label: 'Plutôt celui qui est plus sûr' },
      { value: 'C', label: 'Plutôt celui qui peut mieux évoluer, même s’il est moins prévisible' },
      { value: 'D', label: 'Cela dépend de la situation' },
    ]
  },
  {
    id: 7,
    text: "Un investissement subit une baisse marquée mais temporaire. Votre priorité devient :",
    options: [
      { value: 'A', label: 'Réduire l’exposition' },
      { value: 'B', label: 'Comprendre l’origine de la baisse' },
      { value: 'C', label: 'Vérifier si le scénario reste cohérent' },
      { value: 'D', label: 'Repenser l’allocation globale' },
    ]
  },
  {
    id: 8,
    text: "Si vendre tout de suite vous fait perdre de l’argent, mais attendre reste incertain, que faites-vous ?",
    options: [
      { value: 'A', label: 'Je vends pour éviter que la situation empire' },
      { value: 'B', label: 'Je réduis une partie de ma position' },
      { value: 'C', label: 'J’attends si le projet reste solide' },
      { value: 'D', label: 'Je prends du recul pour revoir l’ensemble' },
    ]
  },
  {
    id: 9,
    text: "Quel équilibre vous convient le mieux pour un investissement ?",
    options: [
      { value: 'A', label: 'Être très protégé, même si ça rapporte peu' },
      { value: 'B', label: 'Être assez stable avec une progression modérée' },
      { value: 'C', label: 'Accepter des variations pour viser plus d’évolution' },
      { value: 'D', label: 'Impossible à dire sans une vision d’ensemble' },
    ]
  },
  {
    id: 10,
    text: "Pour vous, un bon investissement est avant tout :",
    options: [
      { value: 'A', label: 'Celui qui rassure' },
      { value: 'B', label: 'Celui qui tient dans le temps' },
      { value: 'C', label: 'Celui qui optimise le couple risque/temps' },
      { value: 'D', label: 'Celui qui s’intègre dans une stratégie globale' },
    ]
  },
  {
    id: 11,
    text: "Si un investissement ne se passe pas comme prévu, qu’est-ce que vous questionnez en premier ?",
    options: [
      { value: 'A', label: 'Le placement lui-même' },
      { value: 'B', label: 'Le moment où j’ai investi' },
      { value: 'C', label: 'Les raisons qui m’avaient fait investir' },
      { value: 'D', label: 'L’ensemble de ma stratégie' },
    ]
  },
  {
    id: 12,
    text: "Selon vous, qu’est-ce qui fait le plus de dégâts pour un investisseur ?",
    options: [
      { value: 'A', label: 'Une mauvaise année' },
      { value: 'B', label: 'Une mauvaise décision' },
      { value: 'C', label: 'Un manque de discipline dans le temps' },
      { value: 'D', label: 'Une mauvaise vision d’ensemble' },
    ]
  },
  {
    id: 13,
    text: "Quelle phrase résume le mieux votre façon d’investir ?",
    options: [
      { value: 'A', label: 'Éviter les erreurs' },
      { value: 'B', label: 'Avancer prudemment' },
      { value: 'C', label: 'Accepter une part d’incertitude' },
      { value: 'D', label: 'Piloter dans la durée' },
    ]
  },
];

const WEIGHTED_QUESTIONS = new Set([5, 7, 8, 11, 12]);

const SCORE_MAP: Record<AnswerOption, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4
};

type ProfileKey =
  | 'oppose'
  | 'securitaire'
  | 'prudent-structure'
  | 'equilibre-prudent'
  | 'equilibre-dynamique'
  | 'dynamique'
  | 'tres-dynamique';

const PROFILE_CONTENT: Record<ProfileKey, { title: string; description: string; style: string; vigilance: string[] }> = {
  'oppose': {
    title: 'Profil opposé au risque',
    description: "Vous cherchez avant tout à éviter les situations inconfortables et les variations imprévues. Votre priorité est la protection et la lisibilité immédiate. Les phases d’incertitude génèrent rapidement un besoin de sécurisation. Ce profil n’est pas figé dans le temps.",
    style: 'Très sécuritaire et réactif',
    vigilance: [
      "Éviter toute décision prise uniquement sous l’effet de la peur.",
      "Les périodes stables peuvent alterner avec des phases moins favorables.",
      "Trop de protection peut parfois limiter la compréhension des cycles."
    ]
  },
  'securitaire': {
    title: 'Profil sécuritaire',
    description: "Vous privilégiez la stabilité et la prévisibilité dans vos décisions. Vous acceptez peu d’incertitude et recherchez un cadre rassurant. Les variations prolongées peuvent générer un inconfort croissant. Ce profil n’est pas figé dans le temps.",
    style: 'Prudent et protecteur',
    vigilance: [
      "La stabilité apparente n’exclut pas les phases de transition.",
      "Réagir trop tôt peut parfois nuire à la cohérence globale.",
      "Le temps joue un rôle clé dans l’interprétation des résultats."
    ]
  },
  'prudent-structure': {
    title: 'Profil prudent structuré',
    description: "Vous avancez avec prudence et méthode. Vous recherchez un cadre lisible pour traverser les phases moins favorables. Vous privilégiez la cohérence et la discipline dans le temps plutôt que la réaction immédiate. Ce profil n’est pas figé dans le temps.",
    style: 'Analytique et progressif',
    vigilance: [
      "La discipline compte davantage qu’une seule année.",
      "Un choix cohérent peut rester valide même dans une phase difficile.",
      "Les cycles existent : l’enjeu est la manière de les traverser."
    ]
  },
  'equilibre-prudent': {
    title: 'Profil équilibré prudent',
    description: "Vous recherchez un compromis entre stabilité et évolution. Vous acceptez certaines variations tant qu’elles restent compréhensibles. Votre approche vise l’équilibre plutôt que l’optimisation à court terme. Ce profil n’est pas figé dans le temps.",
    style: 'Structuré et mesuré',
    vigilance: [
      "L’équilibre suppose d’accepter des phases imparfaites.",
      "Les résultats ne sont pas toujours linéaires.",
      "La cohérence globale reste prioritaire face aux fluctuations ponctuelles."
    ]
  },
  'equilibre-dynamique': {
    title: 'Profil équilibré dynamique',
    description: "Vous acceptez des variations pour viser une évolution plus marquée. Les phases moins favorables ne remettent pas immédiatement en cause vos choix. Vous raisonnez dans une logique de cycle plutôt que de résultat immédiat. Ce profil n’est pas figé dans le temps.",
    style: 'Cyclique et structuré',
    vigilance: [
      "Les périodes de baisse font partie des cycles normaux.",
      "La discipline reste essentielle face à la volatilité.",
      "Une vision long terme aide à éviter les réactions excessives."
    ]
  },
  'dynamique': {
    title: 'Profil dynamique',
    description: "Vous acceptez des variations importantes et une incertitude plus élevée. Vous êtes à l’aise avec des scénarios imparfaits ou dégradés. Votre approche repose sur la capacité à traverser les cycles dans la durée. Ce profil n’est pas figé dans le temps.",
    style: 'Stratégique et orienté cycles',
    vigilance: [
      "Les variations fortes demandent une grande discipline.",
      "Les décisions émotionnelles peuvent amplifier les risques.",
      "Le pilotage global reste plus important que les mouvements ponctuels."
    ]
  },
  'tres-dynamique': {
    title: 'Profil très dynamique / autonome',
    description: "Vous êtes à l’aise avec l’incertitude et les fluctuations marquées. Vous raisonnez en vision d’ensemble plutôt qu’en réaction immédiate. Votre approche suppose une forte capacité à maintenir le cap dans la durée. Ce profil n’est pas figé dans le temps.",
    style: 'Systémique et autonome',
    vigilance: [
      "L’autonomie nécessite une rigueur constante.",
      "Les cycles extrêmes demandent une grande lucidité.",
      "La cohérence globale doit rester prioritaire face aux opportunités isolées."
    ]
  }
};

const getProfileFromScore = (score: number): ProfileKey => {
  if (score <= 24) return 'oppose';
  if (score <= 30) return 'securitaire';
  if (score <= 36) return 'prudent-structure';
  if (score <= 42) return 'equilibre-prudent';
  if (score <= 50) return 'equilibre-dynamique';
  if (score <= 58) return 'dynamique';
  return 'tres-dynamique';
};

const getComprehensionLabel = (profile: ProfileKey) => PROFILE_CONTENT[profile].style;

const InvestorProfileSimulator: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, AnswerOption | null>>({});
  const [showResult, setShowResult] = useState(false);

  const allAnswered = QUESTIONS.every(q => answers[q.id]);

  const score = useMemo(() => {
    return QUESTIONS.reduce((total, q) => {
      const answer = answers[q.id];
      if (!answer) return total;
      const base = SCORE_MAP[answer];
      return total + (WEIGHTED_QUESTIONS.has(q.id) ? base * 2 : base);
    }, 0);
  }, [answers]);

  const profileKey = useMemo(() => getProfileFromScore(score), [score]);
  const profile = PROFILE_CONTENT[profileKey];
  const comprehension = getComprehensionLabel(profileKey);
  const vigilancePoints = profile.vigilance;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
              Profil investisseur — simulateur pédagogique
            </h1>
            <p className="text-sm text-slate-300">
              ⓘ Ce questionnaire ne cherche pas ce que vous préférez, mais comment vous arbitrez lorsque tout n’est pas idéal.
            </p>
          </div>

          <div className="space-y-6">
            {QUESTIONS.map((question) => (
              <div key={question.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Q{question.id}. {question.text}
                </h3>
                <div className="grid gap-2">
                  {question.options.map(option => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        answers[question.id] === option.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100'
                          : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        onChange={() => setAnswers(prev => ({ ...prev, [question.id]: option.value }))}
                        className="mt-1 accent-emerald-400"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowResult(true)}
              disabled={!allAnswered}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                allAnswered
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Voir mon profil
            </button>
            {!allAnswered && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <AlertCircle className="h-4 w-4" />
                Répondez aux 13 questions pour afficher votre profil.
              </div>
            )}
          </div>
        </div>

        {showResult && allAnswered && (
          <div className="mt-6 bg-slate-900/70 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Titre du profil</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                {profile.title}
              </h2>
            </div>

            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Lecture du profil</p>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {profile.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Style de compréhension</p>
                <p className="text-sm text-slate-100">{comprehension}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Points de vigilance pédagogiques</p>
                <ul className="space-y-2 text-sm text-slate-200">
                  {vigilancePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              <span>
                Ce résultat aide à se situer. Il n’est ni une décision, ni une orientation d’investissement.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorProfileSimulator;
