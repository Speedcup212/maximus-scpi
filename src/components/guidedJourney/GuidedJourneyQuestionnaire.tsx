import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { GuidedJourneyAnswers } from '../../types/guidedJourney';

interface GuidedJourneyQuestionnaireProps {
  onComplete: (answers: GuidedJourneyAnswers) => void;
  onClose?: () => void;
}

const GuidedJourneyQuestionnaire: React.FC<GuidedJourneyQuestionnaireProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Partial<GuidedJourneyAnswers>>({});
  const [mode, setMode] = useState<'beginner' | 'expert' | null>(null);

  type Question = {
    id: number;
    question: string;
    key: keyof GuidedJourneyAnswers;
    options?: Array<{ value: string; label: string; subtitle?: string }>;
    type?: 'number';
    info?: string;
    numberConfig?: {
      min: number;
      step: number;
      placeholder: string;
      quickValues?: number[];
      suffix?: string;
      helper?: string;
    };
  };

  const beginnerQuestions: Question[] = [
    {
      id: 1,
      question: "Quel est votre objectif principal ?",
      key: 'objective',
      options: [
        { value: 'revenus-reguliers', label: 'Revenus réguliers' },
        { value: 'revenus-et-croissance', label: 'Revenus + croissance' },
        { value: 'croissance-long-terme', label: 'Croissance long terme' },
        { value: 'etre-guide', label: 'Je débute et souhaite être guidé' },
      ],
      info: "ⓘ Information : l’objectif oriente le type d’allocation SCPI."
    },
    {
      id: 2,
      question: "Quel horizon de détention envisagez-vous ?",
      key: 'horizon',
      options: [
        { value: 'moins-8-ans', label: 'Moins de 8 ans' },
        { value: '8-15-ans', label: '8 à 15 ans' },
        { value: 'plus-15-ans', label: 'Plus de 15 ans' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : l’immobilier s’inscrit dans des cycles de long terme."
    },
    {
      id: 3,
      question: "Quelle est votre tolérance au risque ?",
      key: 'riskTolerance',
      options: [
        { value: 'faible', label: 'Faible' },
        { value: 'moderee', label: 'Modérée' },
        { value: 'elevee', label: 'Élevée' },
      ],
      info: "ⓘ Information : la tolérance au risque influence le niveau de volatilité accepté."
    },
    {
      id: 4,
      question: "Avez-vous besoin de revenus rapidement ?",
      key: 'immediateIncome',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'non', label: 'Non' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 5,
      question: "Êtes-vous sensible à la stabilité du rendement ?",
      key: 'yieldStabilitySensitivity',
      options: [
        { value: 'tres', label: 'Très sensible' },
        { value: 'moyenne', label: 'Moyennement' },
        { value: 'faible', label: 'Peu' },
      ],
    },
    {
      id: 6,
      question: "Quel montant souhaitez-vous investir en SCPI ?",
      key: 'investmentAmount',
      type: 'number',
      numberConfig: {
        min: 1000,
        step: 1000,
        placeholder: "Montant envisagé",
        quickValues: [10000, 25000, 50000, 100000, 200000, 500000],
        suffix: "€",
        helper: "Minimum 1 000 €."
      },
    },
    {
      id: 7,
      question: "Quelle diversification géographique souhaitez-vous ?",
      key: 'geoDiversification',
      options: [
        { value: 'europe', label: 'Europe' },
        { value: 'mixte', label: 'Mix France + Europe' },
        { value: 'international', label: 'International' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : la fiscalité peut limiter la part France lorsque la TMI est élevée."
    },
    {
      id: 8,
      question: "Quels secteurs vous attirent le plus ?",
      key: 'sectorPreference',
      options: [
        { value: 'diversifie', label: 'Diversifié' },
        { value: 'bureaux', label: 'Bureaux' },
        { value: 'commerces', label: 'Commerces' },
        { value: 'sante', label: 'Santé & éducation' },
        { value: 'logistique', label: 'Logistique' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 9,
      question: "Quel mode de détention envisagez-vous ?",
      key: 'holdingMode',
      options: [
        { value: 'direct', label: 'Détention directe' },
        { value: 'assurance-vie', label: 'Assurance-vie' },
        { value: 'societe', label: 'Société' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 10,
      question: "Dans quelle mesure la fiscalité influence-t-elle vos décisions d’investissement aujourd’hui ?",
      key: 'taxDecisionImpact',
      options: [
        { value: 'forte', label: 'Très fortement : je cherche à limiter l’impact fiscal autant que possible' },
        { value: 'moderee', label: 'Modérément : c’est un critère parmi d’autres' },
        { value: 'faible', label: 'Peu : je privilégie d’abord la logique patrimoniale globale' },
      ],
    },
    {
      id: 11,
      question: "Quel niveau d’autonomie souhaitez-vous ?",
      key: 'autonomyLevel',
      options: [
        { value: 'autonome', label: 'Décider seul' },
        { value: 'mixte', label: 'Décider avec un avis externe' },
        { value: 'accompagne', label: 'Être accompagné' },
      ],
    },
    {
      id: 12,
      question: "Avez-vous des contraintes simples à prendre en compte ?",
      key: 'constraintsSimple',
      options: [
        { value: 'aucune', label: 'Aucune' },
        { value: 'liquidite', label: 'Liquidité' },
        { value: 'fiscalite', label: 'Fiscalité' },
        { value: 'risque', label: 'Risque' },
      ],
    },
    {
      id: 13,
      question: "Quelle est votre TMI estimée ?",
      key: 'tmiEstimate',
      options: [
        { value: 'tmi-0-11', label: '0–11 %' },
        { value: 'tmi-30', label: '30 %' },
        { value: 'tmi-41', label: '41 %' },
        { value: 'tmi-45', label: '45 %' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : la TMI (taux marginal d’imposition) est le pourcentage appliqué à la dernière tranche de vos revenus. Vous la trouvez sur votre avis d’imposition (ligne « Taux marginal d’imposition »). Elle sert ici à ajuster la lecture fiscale."
    },
  ];

  const expertQuestions: Question[] = [
    {
      id: 1,
      question: "Quelle est la valeur de votre patrimoine (hors résidence principale) ?",
      key: 'patrimoineValue',
      type: 'number',
      autoAdvance: false,
      numberConfig: {
        min: 0,
        step: 10000,
        placeholder: "Montant estimatif",
        quickValues: [100000, 250000, 500000, 1000000, 2000000, 3000000],
        suffix: "€",
        helper: "Indication approximative, sans détail."
      },
      info: "ⓘ Information : cela permet d’estimer le poids réel des SCPI dans votre patrimoine global."
    },
    {
      id: 2,
      question: "Comment se répartit votre patrimoine (hors résidence principale) ?",
      key: 'assetSplit',
      options: [
        { value: 'majoritairement-immobilier', label: 'Majoritairement immobilier' },
        { value: 'equilibre', label: 'Équilibré immobilier / financier' },
        { value: 'majoritairement-financier', label: 'Majoritairement financier' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ]
    },
    {
      id: 3,
      question: "Quelle est la part actuelle des SCPI dans votre patrimoine ?",
      key: 'scpiShare',
      options: [
        { value: 'aucune', label: 'Aucune (0 %)' },
        { value: 'faible', label: 'Faible (1–10 %)' },
        { value: 'intermediaire', label: 'Intermédiaire (10–30 %)' },
        { value: 'importante', label: 'Importante (30 % et +)' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 4,
      question: "Préférez-vous un portefeuille très diversifié ou plus concentré ?",
      key: 'concentrationTolerance',
      options: [
        { value: 'diversifie', label: 'Très diversifié, réparti sur plusieurs types d’actifs immobiliers' },
        { value: 'equilibre', label: 'Équilibré, avec quelques secteurs dominants' },
        { value: 'concentre', label: 'Plus concentré, orienté vers des actifs ciblés' },
      ],
    },
    {
      id: 5,
      question: "Avez-vous déjà des revenus immobiliers hors SCPI ?",
      key: 'otherRealEstateIncome',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'non', label: 'Non' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : cela aide à mesurer votre exposition immobilière globale."
    },
    {
      id: 6,
      question: "Quel montant souhaitez-vous investir en SCPI ?",
      key: 'investmentAmount',
      type: 'number',
      autoAdvance: false,
      numberConfig: {
        min: 1000,
        step: 1000,
        placeholder: "Montant envisagé",
        quickValues: [10000, 25000, 50000, 100000, 200000, 500000],
        suffix: "€",
        helper: "Minimum 1 000 €."
      }
    },
    {
      id: 7,
      question: "Combien d'impôt sur le revenu payez-vous chaque année ?",
      key: 'taxSituation',
      options: [
        { value: 'moins-2000', label: 'Moins de 2 000 € par an', subtitle: 'Faible imposition' },
        { value: '2000-6000', label: 'Entre 2 000 € et 6 000 € par an', subtitle: 'Imposition intermédiaire' },
        { value: 'plus-6000', label: 'Plus de 6 000 € par an', subtitle: 'Imposition élevée' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : la fiscalité influence la lecture des SCPI, sans constituer un conseil."
    },
    {
      id: 8,
      question: "Quelle est votre TMI estimée ?",
      key: 'tmiEstimate',
      options: [
        { value: 'tmi-0-11', label: '0–11 %' },
        { value: 'tmi-30', label: '30 %' },
        { value: 'tmi-41', label: '41 %' },
        { value: 'tmi-45', label: '45 %' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 9,
      question: "Êtes-vous déjà exposé aux revenus fonciers ?",
      key: 'realEstateIncomeExposure',
      options: [
        { value: 'oui-significatif', label: 'Oui, de façon significative' },
        { value: 'oui-limite', label: 'Oui, mais limité' },
        { value: 'non', label: 'Non' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 10,
      question: "Dans quelle mesure la fiscalité influence-t-elle vos décisions d’investissement aujourd’hui ?",
      key: 'taxDecisionImpact',
      options: [
        { value: 'forte', label: 'Très fortement : je cherche à limiter l’impact fiscal autant que possible' },
        { value: 'moderee', label: 'Modérément : c’est un critère parmi d’autres' },
        { value: 'faible', label: 'Peu : je privilégie d’abord la logique patrimoniale globale' },
      ],
    },
    {
      id: 11,
      question: "Quel cadre de détention envisagez-vous ?",
      key: 'holdingStructure',
      options: [
        { value: 'direct', label: 'Détention directe' },
        { value: 'assurance-vie', label: 'Assurance-vie' },
        { value: 'societe', label: 'Société' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : le cadre de détention influence la lecture des revenus et de la fiscalité."
    },
    {
      id: 12,
      question: "Quel est votre objectif principal ?",
      key: 'objective',
      options: [
        { value: 'revenus-reguliers', label: 'Revenus réguliers' },
        { value: 'revenus-et-croissance', label: 'Revenus + croissance' },
        { value: 'croissance-long-terme', label: 'Croissance long terme' },
        { value: 'etre-guide', label: 'Je débute et souhaite être guidé' },
      ],
    },
    {
      id: 13,
      question: "Que souhaitez-vous faire des revenus générés ?",
      key: 'incomeUse',
      options: [
        { value: 'consommer', label: 'Les utiliser' },
        { value: 'reinvestir', label: 'Les réinvestir' },
        { value: 'mixte', label: 'Un mix des deux' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 14,
      question: "Quelle priorité correspond le mieux à votre approche ?",
      key: 'priority',
      options: [
        { value: 'stabilite', label: 'Stabilité' },
        { value: 'equilibre', label: 'Équilibre' },
        { value: 'long-terme', label: 'Long terme' },
      ],
    },
    {
      id: 15,
      question: "Acceptez-vous une baisse temporaire des revenus ?",
      key: 'temporaryDrawdown',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'limite', label: 'Oui, mais limitée' },
        { value: 'non', label: 'Non' },
      ],
      info: "ⓘ Information : les cycles immobiliers peuvent impacter les revenus à court terme."
    },
    {
      id: 16,
      question: "Quel horizon de détention visez-vous ?",
      key: 'horizon',
      options: [
        { value: 'moins-8-ans', label: 'Moins de 8 ans' },
        { value: '8-15-ans', label: '8 à 15 ans' },
        { value: 'plus-15-ans', label: 'Plus de 15 ans' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : l’immobilier s’apprécie sur le long terme, avec des cycles."
    },
    {
      id: 17,
      question: "Avez-vous besoin de revenus rapidement ?",
      key: 'immediateIncome',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'non', label: 'Non' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 18,
      question: "Comment réagiriez-vous à une baisse de rendement ?",
      key: 'yieldDropReaction',
      options: [
        { value: 'accepter', label: 'Je l’accepte si c’est temporaire' },
        { value: 'surveiller', label: 'Je surveille de près' },
        { value: 'inquiet', label: 'Je serais inquiet' },
      ],
    },
    {
      id: 19,
      question: "Quelle est votre sensibilité à l’endettement des SCPI ?",
      key: 'debtSensitivity',
      options: [
        { value: 'faible', label: 'Faible' },
        { value: 'moderee', label: 'Modérée' },
        { value: 'forte', label: 'Forte' },
      ],
    },
    {
      id: 20,
      question: "Acceptez-vous des SCPI récentes ?",
      key: 'acceptRecentScpi',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'oui-avec-limite', label: 'Oui, mais en minorité' },
        { value: 'non', label: 'Non' },
      ],
    },
    {
      id: 21,
      question: "Quelle est votre sensibilité à la volatilité des revenus ?",
      key: 'incomeVolatilitySensitivity',
      options: [
        { value: 'faible', label: 'Faible' },
        { value: 'moyenne', label: 'Moyenne' },
        { value: 'elevee', label: 'Élevée' },
      ],
    },
    {
      id: 22,
      question: "Quelles zones géographiques privilégiez-vous ?",
      key: 'preferredZones',
      options: [
        { value: 'france', label: 'France' },
        { value: 'europe', label: 'Europe' },
        { value: 'mixte', label: 'Mix France + Europe' },
        { value: 'international', label: 'International' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
      info: "ⓘ Information : la diversification géographique réduit la dépendance à un seul marché."
    },
    {
      id: 23,
      question: "Quels secteurs vous attirent le plus ?",
      key: 'sectorPreferences',
      options: [
        { value: 'diversifie', label: 'Diversifié' },
        { value: 'bureaux', label: 'Bureaux' },
        { value: 'commerces', label: 'Commerces' },
        { value: 'sante', label: 'Santé & éducation' },
        { value: 'logistique', label: 'Logistique' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 24,
      question: "Quels secteurs souhaitez-vous limiter ?",
      key: 'sectorsToLimit',
      options: [
        { value: 'aucun', label: 'Aucun en particulier' },
        { value: 'bureaux', label: 'Bureaux' },
        { value: 'commerces', label: 'Commerces' },
        { value: 'hotellerie', label: 'Hôtellerie & loisirs' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 25,
      question: "Comment réagissez-vous face aux cycles immobiliers ?",
      key: 'cycleSensitivity',
      options: [
        { value: 'stable', label: 'Je privilégie la stabilité, même si le rendement est plus modéré' },
        { value: 'modere', label: 'J’accepte une exposition modérée aux cycles pour améliorer le rendement' },
        { value: 'cyclique', label: 'Je suis à l’aise avec des secteurs plus cycliques si le potentiel est supérieur' },
      ],
    },
    {
      id: 26,
      question: "Quelle importance accordez-vous à la taille et à la solidité des SCPI sélectionnées ?",
      key: 'capitalizationImportance',
      options: [
        { value: 'tres-importante', label: 'Très importante : je privilégie des SCPI de grande taille, bien établies' },
        { value: 'importante', label: 'Importante : un bon équilibre entre taille et potentiel' },
        { value: 'secondaire', label: 'Secondaire : je suis ouvert à des SCPI plus récentes ou plus petites' },
      ],
    },
    {
      id: 27,
      question: "Quel niveau de diversification souhaitez-vous dans votre portefeuille SCPI ?",
      key: 'diversificationLevel',
      options: [
        { value: 'concentre', label: 'Portefeuille concentré : peu de SCPI, allocation lisible' },
        { value: 'equilibre', label: 'Portefeuille équilibré : diversification maîtrisée' },
        { value: 'tres-diversifie', label: 'Portefeuille très diversifié : mutualisation maximale' },
      ],
    },
    {
      id: 28,
      question: "Quel niveau d’équilibre souhaitez-vous entre les SCPI de votre portefeuille ?",
      key: 'allocationBalancePreference',
      options: [
        { value: 'homogene', label: 'Répartition homogène : chaque SCPI a un poids comparable' },
        { value: 'dominantes', label: 'Équilibre avec une ou deux SCPI dominantes' },
        { value: 'centrale', label: 'Position centrale marquée : une SCPI peut jouer un rôle principal' },
      ],
    },
    {
      id: 29,
      question: "Quel est votre principal point de vigilance dans un investissement SCPI ?",
      key: 'primaryVigilance',
      options: [
        { value: 'stabilite', label: 'La stabilité des loyers dans le temps' },
        { value: 'cycles', label: 'La capacité à traverser les cycles immobiliers' },
        { value: 'rendement', label: 'La recherche d’un meilleur potentiel de rendement' },
      ],
    },
    {
      id: 30,
      question: "Quels critères souhaitez-vous éviter en priorité ?",
      key: 'avoidCriteria',
      options: [
        { value: 'surcote', label: 'Surcote' },
        { value: 'endettement', label: 'Endettement élevé' },
        { value: 'jeunesse', label: 'SCPI trop récentes' },
        { value: 'aucun', label: 'Aucun en particulier' },
      ],
    },
    {
      id: 31,
      question: "Quel niveau d’explication attendez-vous ?",
      key: 'postureUnderstanding',
      options: [
        { value: 'pedagogique', label: 'Comprendre les logiques' },
        { value: 'synthese', label: 'Synthèse rapide' },
        { value: 'detail', label: 'Détails complets' },
      ],
      info: "ⓘ Information : l’outil reste informatif et n’émet aucun conseil personnalisé."
    },
    {
      id: 32,
      question: "À l’issue de l’analyse, que souhaitez-vous obtenir ?",
      key: 'expectedOutcome',
      options: [
        { value: 'autonomie', label: 'Être autonome dans mes choix' },
        { value: 'clarte', label: 'Clarifier mes arbitrages' },
        { value: 'echange', label: 'Un échange pour aller plus loin' },
      ],
    },
  ];

  const questions = mode === 'expert' ? expertQuestions : beginnerQuestions;

  const currentQ = questions[currentQuestion - 1];
  const isLastQuestion = currentQuestion === questions.length;

  const handleAnswer = (value: string | number) => {
    const newAnswers = {
      ...answers,
      [currentQ.key]: value,
    };
    setAnswers(newAnswers);

    // Ne pas auto-avancer pour les questions numériques
    if (currentQ.type === 'number') {
      return;
    }

    if (isLastQuestion) {
      return;
    }

    // Passer automatiquement à la question suivante après un court délai
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
    }, 300); // Délai de 300ms pour voir la sélection
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      return;
    }
    if (mode) {
      setMode(null);
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const progress = (currentQuestion / questions.length) * 100;

  useEffect(() => {
    setHasSubmitted(false);
  }, [currentQuestion, mode]);

  useEffect(() => {
    if (isLastQuestion && !hasSubmitted && answers[currentQ.key] !== undefined) {
      setHasSubmitted(true);
      onComplete(answers as GuidedJourneyAnswers);
    }
  }, [isLastQuestion, hasSubmitted, answers, currentQ.key, onComplete]);

  if (!mode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-700 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Parcours SCPI
            </h1>
            <p className="text-lg text-slate-300">
              Deux niveaux d’analyse selon votre besoin.
            </p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => {
                setMode('beginner');
                setCurrentQuestion(1);
                setAnswers({});
              }}
              className="w-full text-left p-5 rounded-2xl border-2 border-slate-700 hover:border-emerald-500 bg-slate-900/80 transition-all"
            >
              <div className="text-sm text-emerald-300 font-semibold mb-1">Orientation rapide – Débutant</div>
              <div className="text-base font-semibold text-white">13 questions · 2–3 minutes</div>
              <div className="text-sm text-slate-300 mt-2">
                Lecture claire et pédagogique de votre profil SCPI, sans jargon.
              </div>
            </button>

            <button
              onClick={() => {
                setMode('expert');
                setCurrentQuestion(1);
                setAnswers({});
              }}
              className="w-full text-left p-5 rounded-2xl border-2 border-slate-700 hover:border-blue-500 bg-slate-900/80 transition-all"
            >
              <div className="text-sm text-blue-300 font-semibold mb-1">Analyse approfondie – Expert</div>
              <div className="text-base font-semibold text-white">32 questions · 8–10 minutes</div>
              <div className="text-sm text-slate-300 mt-2">
                Analyse structurée de la cohérence patrimoniale et des arbitrages.
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-start">
            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-600 rounded-xl font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-700 rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {mode === 'expert' ? 'Analyse approfondie – Expert' : 'Orientation rapide – Débutant'}
          </h1>
          <p className="text-lg text-slate-300">
            {mode === 'expert'
              ? 'Une analyse structurée pour évaluer la cohérence patrimoniale de votre stratégie SCPI.'
              : 'Une lecture claire et pédagogique de votre profil SCPI.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Question {currentQuestion} sur {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentQ.question}
            </h2>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {currentQ.info || "ⓘ Information : cette question aide à clarifier la cohérence de votre profil SCPI."}
            </p>
          </div>

          {currentQ.type === 'number' ? (
            // Question numérique
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={answers[currentQ.key] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === '0') {
                      handleAnswer(0);
                    } else {
                      handleAnswer(Number(value));
                    }
                  }}
                  min={currentQ.numberConfig?.min}
                  step={currentQ.numberConfig?.step}
                  placeholder={currentQ.numberConfig?.placeholder}
                  className="w-full px-4 py-4 bg-slate-800 border-2 border-slate-600 text-white rounded-xl text-2xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xl">
                  {currentQ.numberConfig?.suffix || ''}
                </span>
              </div>
              {currentQ.numberConfig?.helper && (
                <p className="text-xs text-slate-400">{currentQ.numberConfig.helper}</p>
              )}
              
              {/* Boutons de montants rapides */}
              {currentQ.numberConfig?.quickValues && (
                <div>
                  <p className="text-sm text-slate-300 mb-3">Montants rapides :</p>
                  <div className="grid grid-cols-3 gap-3">
                    {currentQ.numberConfig.quickValues.map((amount) => {
                      const isSelected = answers[currentQ.key] === amount;
                      return (
                        <button
                          key={amount}
                          onClick={() => handleAnswer(amount)}
                          className={`px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-emerald-500 text-slate-200'
                          }`}
                        >
                          {amount >= 1000 ? `${amount / 1000}k€` : `${amount}€`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bouton continuer */}
              {typeof answers[currentQ.key] === 'number' &&
                (answers[currentQ.key] as number) >= (currentQ.numberConfig?.min || 0) && (
                <button
                  onClick={() => {
                    const completeAnswers = {
                      ...answers,
                      [currentQ.key]: answers[currentQ.key] as number,
                    };
                    if (isLastQuestion) {
                      onComplete(completeAnswers as GuidedJourneyAnswers);
                    } else {
                      setCurrentQuestion(prev => prev + 1);
                    }
                  }}
                  className="w-full mt-4 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                >
                  {isLastQuestion ? 'Voir mon analyse' : 'Continuer'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {currentQ.options?.map((option) => {
                const isSelected = answers[currentQ.key] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-100">{option.label}</span>
                        {option.subtitle && (
                          <span className="text-xs text-slate-400 mt-1">{option.subtitle}</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-slate-900 rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-start">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-600 rounded-xl font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {currentQuestion === 1 ? 'Annuler' : 'Précédent'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-900/80 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-200">
            <strong>Information :</strong> Analyse informative uniquement. 
            Aucune recommandation personnalisée, aucune promesse de rendement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidedJourneyQuestionnaire;
