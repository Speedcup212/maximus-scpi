import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { GuidedJourneyAnswers } from '../../types/guidedJourney';

interface GuidedJourneyQuestionnaireProps {
  onComplete: (answers: GuidedJourneyAnswers) => void;
  onClose?: () => void;
  initialMode?: 'beginner' | 'expert';
}

const GuidedJourneyQuestionnaire: React.FC<GuidedJourneyQuestionnaireProps> = ({ 
  onComplete, 
  onClose,
  initialMode
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Partial<GuidedJourneyAnswers>>({});
  const [mode, setMode] = useState<'beginner' | 'expert'>(initialMode || 'beginner');

  useEffect(() => {
    try {
      const preferred = sessionStorage.getItem('guidedJourneyPreferredMode');
      const nextMode = preferred === 'expert' || preferred === 'beginner'
        ? preferred
        : initialMode || 'beginner';
      setMode(nextMode);
      setCurrentQuestion(1);
      setAnswers({
        questionnaireMode: nextMode,
        ...(nextMode === 'beginner' ? { taxSituation: 'je-ne-sais-pas' } : {})
      });
      if (preferred) {
        sessionStorage.removeItem('guidedJourneyPreferredMode');
      }
    } catch (e) {
      // Erreur silencieuse
    }
  }, []);

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
      question: "Pourquoi vous intéressez-vous aux SCPI aujourd’hui ?",
      key: 'interestReason',
      options: [
        { value: 'complement-revenus', label: 'J’aimerais créer un complément de revenus dans le temps' },
        { value: 'repartir-patrimoine', label: 'Je cherche à mieux répartir mon patrimoine' },
        { value: 'epargne-insatisfait', label: 'Mon épargne ne me satisfait plus telle quelle' },
        { value: 'decouvrir-comprendre', label: 'Je découvre les SCPI et je veux comprendre' },
      ],
    },
    {
      id: 2,
      question: "Sur quelle durée vous projetez-vous ?",
      key: 'projectionDuration',
      options: [
        { value: 'moins-5-ans', label: 'Moins de 5 ans' },
        { value: '5-8-ans', label: 'Entre 5 et 8 ans' },
        { value: '8-12-ans', label: 'Entre 8 et 12 ans' },
        { value: 'plus-12-ans', label: 'Plus de 12 ans' },
      ],
    },
    {
      id: 3,
      question: "Si les revenus baissaient temporairement, vous vous sentiriez plutôt :",
      key: 'incomeDropFeeling',
      options: [
        { value: 'tres-inquiet', label: 'Très inquiet' },
        { value: 'gene', label: 'Un peu gêné' },
        { value: 'serein', label: 'Plutôt serein' },
        { value: 'a-laise', label: 'À l’aise' },
      ],
    },
    {
      id: 4,
      question: "Quelle est votre expérience en immobilier ?",
      key: 'realEstateExperience',
      options: [
        { value: 'aucune', label: 'Aucune' },
        { value: 'rp', label: 'Résidence principale' },
        { value: 'locatif', label: 'Immobilier locatif' },
        { value: 'plusieurs', label: 'Plusieurs investissements' },
      ],
    },
    {
      id: 5,
      question: "Les revenus issus des SCPI seraient-ils importants à court terme ?",
      key: 'incomeImportanceShortTerm',
      options: [
        { value: 'oui-rapidement', label: 'Oui, rapidement' },
        { value: 'utile', label: 'Utile mais non indispensable' },
        { value: 'non-long-terme', label: 'Non, long terme' },
      ],
    },
    {
      id: 6,
      question: "Vos revenus mensuels sont plutôt :",
      key: 'monthlyIncomeRange',
      options: [
        { value: 'moins-2000', label: 'Moins de 2 000 €' },
        { value: '2000-6000', label: 'Entre 2 000 € et 6 000 €' },
        { value: 'plus-6000', label: 'Plus de 6 000 €' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 7,
      question: "Face à un investissement, vous préférez :",
      key: 'simplicityLevel',
      options: [
        { value: 'tres-simple', label: 'Quelque chose de très simple, sans trop de détails' },
        { value: 'simple-structure', label: 'Comprendre les grandes lignes, sans entrer dans le technique' },
        { value: 'technique', label: 'Avoir accès aux détails, même s’ils sont techniques' },
      ],
    },
    {
      id: 8,
      question: "Dans un investissement, ce qui compte le plus pour vous est :",
      key: 'investmentPreference',
      options: [
        { value: 'stabilite', label: 'Avoir des revenus et une évolution plutôt réguliers' },
        { value: 'equilibre', label: 'Un compromis entre régularité et opportunités' },
        { value: 'potentiel', label: 'Accepter plus de variations pour viser davantage de potentiel' },
      ],
    },
    {
      id: 9,
      question: "Aujourd’hui, votre priorité est surtout de :",
      key: 'currentPriority',
      options: [
        { value: 'comprendre', label: 'Comprendre avant de prendre une décision' },
        { value: 'securiser', label: 'Avancer prudemment, sans prendre de risque inutile' },
        { value: 'diversifier', label: 'Ne pas mettre tous mes œufs dans le même panier' },
        { value: 'potentiel', label: 'Accepter plus de variations pour viser davantage de potentiel' },
      ],
    },
    {
      id: 10,
      question: "Concernant les risques liés aux SCPI, aujourd’hui :",
      key: 'riskAwareness',
      options: [
        { value: 'ne-connait-pas', label: 'Je n’y ai pas vraiment réfléchi' },
        { value: 'idee-generale', label: 'Je sais qu’il peut y avoir des périodes moins favorables' },
        { value: 'cycles', label: 'Je sais que l’immobilier évolue par cycles, avec des hauts et des bas' },
      ],
    },
    {
      id: 11,
      question: "Après ce résultat, vous préférez :",
      key: 'afterResultPreference',
      options: [
        { value: 'continuer-comprendre', label: 'Continuer à mieux comprendre les bases' },
        { value: 'analyse-structuree', label: 'Aller un peu plus loin dans l’analyse' },
        { value: 'explorer-autonomie', label: 'Découvrir les SCPI librement, par vous-même' },
        { value: 'arreter', label: 'En rester là pour l’instant' },
      ],
    },
    {
      id: 12,
      question: "Aujourd’hui, vous vous situez comme :",
      key: 'selfPositioning',
      options: [
        { value: 'debutant-prudent', label: 'Je débute et je préfère avancer prudemment' },
        { value: 'debutant-curieux', label: 'Je débute mais j’ai envie d’en savoir plus' },
        { value: 'reflexion', label: 'Je réfléchis sérieusement à passer à l’action' },
        { value: 'decide', label: 'J’ai déjà une idée claire de ce que je veux faire' },
      ],
    },
  ];

  const expertQuestions: Question[] = [
    {
      id: 1,
      question: "Quelle est la taille approximative de votre patrimoine financier et immobilier (hors résidence principale) ?",
      key: 'patrimoineValue',
      type: 'number',
      autoAdvance: false,
      numberConfig: {
        min: 0,
        step: 10000,
        placeholder: "Ordre de grandeur",
        quickValues: [100000, 250000, 500000, 1000000, 2000000, 3000000],
        suffix: "€",
        helper: "Ordre de grandeur suffisant. Aucun détail requis."
      },
      info: "ⓘ Information : cela permet d’estimer la place des SCPI dans votre patrimoine global."
    },
    {
      id: 2,
      question: "Aujourd’hui, votre patrimoine (hors résidence principale) est plutôt :",
      key: 'assetSplit',
      options: [
        { value: 'majoritairement-immobilier', label: 'Principalement investi en immobilier', subtitle: 'Immobilier déjà structurant dans votre patrimoine' },
        { value: 'equilibre', label: 'Réparti entre immobilier et actifs financiers', subtitle: 'Équilibre déjà en place' },
        { value: 'majoritairement-financier', label: 'Majoritairement investi en actifs financiers', subtitle: 'Immobilier encore secondaire' },
        { value: 'je-ne-sais-pas', label: 'Je n’ai pas une vision claire de cette répartition' },
      ]
    },
    {
      id: 3,
      question: "Quelle est la part actuelle des SCPI dans votre patrimoine ?",
      key: 'scpiShare',
      info: "ⓘ Information : cette question aide à clarifier la cohérence de votre profil SCPI.",
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
      question: "En matière de diversification, votre approche est plutôt :",
      key: 'concentrationTolerance',
      options: [
        { value: 'diversifie', label: 'Large et très répartie', subtitle: 'Réduire la dépendance à un secteur ou un cycle précis' },
        { value: 'equilibre', label: 'Sélective mais équilibrée', subtitle: 'Accepter quelques moteurs dominants tout en limitant les risques' },
        { value: 'concentre', label: 'Ciblée et concentrée', subtitle: 'Assumer une dépendance plus forte à certains actifs ou secteurs' },
      ],
    },
    {
      id: 5,
      question: "Disposez-vous déjà de revenus immobiliers hors SCPI ?",
      key: 'otherRealEstateIncome',
      options: [
        { value: 'oui-significatif', label: 'Oui, de manière significative', subtitle: 'Les revenus immobiliers représentent déjà une part importante de mes revenus' },
        { value: 'oui-complementaire', label: 'Oui, mais de façon complémentaire', subtitle: 'Revenus présents mais non centraux' },
        { value: 'non', label: 'Non, pas ou très peu', subtitle: 'Les SCPI constitueraient une nouvelle source de revenus immobiliers' },
        { value: 'je-ne-sais-pas', label: 'Je n’ai pas une vision claire de leur poids réel' },
      ],
      info: "ⓘ Information : cela aide à mesurer votre exposition immobilière globale."
    },
    {
      id: 6,
      question: "À titre indicatif, quel ordre de grandeur envisagez-vous pour une exposition en SCPI ?",
      key: 'investmentAmount',
      type: 'number',
      autoAdvance: false,
      numberConfig: {
        min: 1000,
        step: 1000,
        placeholder: "Ordre de grandeur",
        quickValues: [10000, 25000, 50000, 100000, 200000, 500000],
        suffix: "€",
        helper: "Montant hypothétique, utilisé uniquement pour analyser la cohérence globale. Minimum technique : 1 000 €."
      }
    },
    {
      id: 7,
      question: "À titre indicatif, votre impôt sur le revenu annuel se situe plutôt :",
      key: 'taxSituation',
      options: [
        { value: 'moins-2000', label: 'Moins de 2 000 € par an', subtitle: 'Impact fiscal limité sur les revenus complémentaires' },
        { value: '2000-6000', label: 'Entre 2 000 € et 6 000 € par an', subtitle: 'La fiscalité commence à influencer la lecture des revenus' },
        { value: 'plus-6000', label: 'Plus de 6 000 € par an', subtitle: 'La fiscalité devient un paramètre structurant' },
        { value: 'je-ne-sais-pas', label: 'Je n’ai pas de repère précis' },
      ],
      info: "ⓘ Information : la fiscalité influence la lecture des SCPI, sans constituer un conseil."
    },
    {
      id: 8,
      question: "Votre tranche marginale d’imposition (ordre de grandeur) est plutôt :",
      key: 'tmiEstimate',
      options: [
        { value: 'tmi-0-11', label: 'Faible — 0 à 11 %' },
        { value: 'tmi-30', label: 'Intermédiaire — 30 %' },
        { value: 'tmi-41', label: 'Élevée — 41 %' },
        { value: 'tmi-45', label: 'Très élevée — 45 %' },
        { value: 'je-ne-sais-pas', label: 'Je n’ai pas de repère précis' },
      ],
    },
    {
      id: 9,
      question: "Êtes-vous déjà exposé aux revenus fonciers ?",
      key: 'realEstateIncomeExposure',
      options: [
        { value: 'oui-significatif', label: 'Oui, de manière significative' },
        { value: 'oui-limite', label: 'Oui, de manière complémentaire' },
        { value: 'non', label: 'Non, pas ou très peu' },
        { value: 'je-ne-sais-pas', label: 'Je n’ai pas une vision claire' },
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
        { value: 'stabilite', label: 'Stabilité', subtitle: 'Privilégier la régularité et la visibilité' },
        { value: 'equilibre', label: 'Équilibre', subtitle: 'Combiner régularité et potentiel' },
        { value: 'long-terme', label: 'Long terme', subtitle: 'Accepter les cycles pour construire dans le temps' },
      ],
    },
    {
      id: 15,
      question: "Acceptez-vous une baisse temporaire des revenus ?",
      key: 'temporaryDrawdown',
      options: [
        { value: 'oui', label: 'Oui, je l’accepte' },
        { value: 'limite', label: 'Oui, mais seulement de façon limitée' },
        { value: 'non', label: 'Non, je privilégie la stabilité' },
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
      question: "Avez-vous besoin de revenus à court terme ?",
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
      question: "Comment percevez-vous l’endettement utilisé par les SCPI ?",
      key: 'debtSensitivity',
      options: [
        { value: 'faible', label: 'Je suis à l’aise avec un endettement maîtrisé' },
        { value: 'moderee', label: 'Je suis prudent, je préfère qu’il reste limité' },
        { value: 'forte', label: 'Je suis réticent, je privilégie peu ou pas de dette' },
      ],
    },
    {
      id: 20,
      question: "Acceptez-vous d’intégrer des SCPI récentes dans votre portefeuille ?",
      key: 'acceptRecentScpi',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'oui-avec-limite', label: 'Oui, mais en minorité' },
        { value: 'non', label: 'Non' },
      ],
    },
    {
      id: 21,
      question: "Comment réagissez-vous aux variations possibles des revenus SCPI ?",
      key: 'incomeVolatilitySensitivity',
      options: [
        { value: 'faible', label: 'Je privilégie des revenus réguliers' },
        { value: 'moyenne', label: 'J’accepte des variations' },
        { value: 'elevee', label: 'Les variations ne me gênent pas' },
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
      question: "Quels secteurs souhaitez-vous privilégier ?",
      key: 'sectorPreferences',
      options: [
        { value: 'diversifie', label: 'Diversifié (plusieurs secteurs, pas un seul dominant)' },
        { value: 'bureaux', label: 'Bureaux' },
        { value: 'commerces', label: 'Commerces' },
        { value: 'sante', label: 'Santé & éducation' },
        { value: 'logistique', label: 'Logistique' },
        { value: 'residentiel', label: 'Résidentiel' },
        { value: 'hotellerie', label: 'Hôtellerie & tourisme' },
        { value: 'activites', label: 'Activités / locaux d’activité' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 24,
      question: "Y a-t-il des secteurs que vous souhaitez limiter ?",
      key: 'sectorsToLimit',
      options: [
        { value: 'aucun', label: 'Aucun en particulier' },
        { value: 'bureaux', label: 'Bureaux' },
        { value: 'commerces', label: 'Commerces' },
        { value: 'sante', label: 'Santé & éducation' },
        { value: 'logistique', label: 'Logistique' },
        { value: 'residentiel', label: 'Résidentiel' },
        { value: 'hotellerie', label: 'Hôtellerie & tourisme' },
        { value: 'activites', label: 'Activités / locaux d’activité' },
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
      question: "Comment souhaitez-vous aborder la construction de votre portefeuille SCPI ?",
      key: 'postureUnderstanding',
      options: [
        { value: 'pedagogique', label: 'Avec une logique très structurée et cadrée' },
        { value: 'synthese', label: 'Avec une approche souple, ajustable dans le temps' },
        { value: 'detail', label: 'Je préfère garder une grande liberté de décision' },
      ],
      info: "ⓘ Information : l’outil reste informatif et n’émet aucun conseil personnalisé."
    },
    {
      id: 32,
      question: "À l’issue de l’analyse, que souhaitez-vous obtenir ?",
      key: 'expectedOutcome',
      options: [
        { value: 'autonomie', label: 'Pouvoir décider de façon autonome' },
        { value: 'clarte', label: 'Mieux comprendre les arbitrages à faire' },
        { value: 'echange', label: 'Disposer d’un cadre clair pour aller plus loin' },
      ],
    },
  ];

  const questions = mode === 'expert' ? expertQuestions : beginnerQuestions;

  const currentQ = questions[currentQuestion - 1];
  const isLastQuestion = currentQuestion === questions.length;

  const handleAnswer = (value: string | number) => {
    const newAnswers = {
      ...answers,
      questionnaireMode: mode || answers.questionnaireMode,
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
            {currentQ.info && (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                {currentQ.info}
              </p>
            )}
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
