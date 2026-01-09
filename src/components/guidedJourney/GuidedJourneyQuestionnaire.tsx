import React, { useState } from 'react';
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
  const [answers, setAnswers] = useState<Partial<GuidedJourneyAnswers>>({});

  const questions: Array<{
    id: number;
    question: string;
    key: keyof GuidedJourneyAnswers;
    options?: Array<{ value: string; label: string; subtitle?: string }>;
    type?: 'number';
  }> = [
    {
      id: 1,
      question: "Combien d'impôt sur le revenu payez-vous chaque année ?",
      key: 'taxSituation' as keyof GuidedJourneyAnswers,
      options: [
        { value: 'moins-2000', label: 'Moins de 2 000 € par an', subtitle: '(peu ou pas fiscalisé)' },
        { value: '2000-6000', label: 'Entre 2 000 € et 6 000 € par an', subtitle: '(fiscalité intermédiaire)' },
        { value: 'plus-6000', label: 'Plus de 6 000 € par an', subtitle: '(fortement fiscalisé)' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas / je préfère ne pas répondre' },
      ],
    },
    {
      id: 2,
      question: "Avec cet investissement immobilier, souhaitez-vous plutôt…",
      key: 'objective' as keyof GuidedJourneyAnswers,
      options: [
        { value: 'revenus-reguliers', label: 'Avoir des revenus réguliers' },
        { value: 'revenus-et-croissance', label: 'Avoir des revenus et faire progresser mon capital' },
        { value: 'croissance-long-terme', label: 'Faire progresser mon capital sur le long terme' },
        { value: 'etre-guide', label: 'Être guidé, je débute' },
      ],
    },
    {
      id: 3,
      question: "Sur combien de temps envisagez-vous cet investissement ?",
      key: 'horizon' as keyof GuidedJourneyAnswers,
      options: [
        { value: 'moins-8-ans', label: 'Moins de 8 ans' },
        { value: '8-15-ans', label: 'Entre 8 et 15 ans' },
        { value: 'plus-15-ans', label: 'Plus de 15 ans' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 4,
      question: "Avez-vous besoin de revenus rapidement ?",
      key: 'immediateIncome' as keyof GuidedJourneyAnswers,
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'non', label: 'Non' },
        { value: 'je-ne-sais-pas', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 5,
      question: "Combien souhaitez-vous investir ?",
      key: 'investmentAmount' as keyof GuidedJourneyAnswers,
      type: 'number', // Type spécial pour cette question
    },
  ];

  const currentQ = questions[currentQuestion - 1];
  const isLastQuestion = currentQuestion === questions.length;

  const handleAnswer = (value: string | number) => {
    const newAnswers = {
      ...answers,
      [currentQ.key]: value,
    };
    setAnswers(newAnswers);

    // Pour la question 5 (montant), on ne passe JAMAIS automatiquement à la suivante
    // L'utilisateur doit cliquer sur le bouton "Voir ma recommandation"
    if (currentQ.id === 5) {
      return; // Ne pas passer à la question suivante automatiquement
    }

    // Passer automatiquement à la question suivante après un court délai
    setTimeout(() => {
      if (isLastQuestion) {
        // Si c'est la dernière question, valider et compléter
        const completeAnswers = {
          ...newAnswers,
          [currentQ.key]: value,
        };
        if (Object.keys(completeAnswers).length === questions.length) {
          onComplete(completeAnswers as GuidedJourneyAnswers);
        }
      } else {
        // Passer à la question suivante
        setCurrentQuestion(prev => prev + 1);
      }
    }, 300); // Délai de 300ms pour voir la sélection
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    } else if (onClose) {
      onClose();
    }
  };

  const progress = (currentQuestion / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-700 rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Votre parcours d'investissement guidé
          </h1>
          <p className="text-lg text-slate-300">
            Répondez à 5 questions simples pour recevoir une recommandation personnalisée
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
              Toutes les réponses sont acceptées, y compris "Je ne sais pas"
            </p>
          </div>

          {currentQ.type === 'number' ? (
            // Question 5 : Input numérique pour le montant
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={answers.investmentAmount || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === '0') {
                      handleAnswer(0);
                    } else {
                      handleAnswer(Number(value));
                    }
                  }}
                  min={1000}
                  step={1000}
                  placeholder="Entrez un montant"
                  className="w-full px-4 py-4 bg-slate-800 border-2 border-slate-600 text-white rounded-xl text-2xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xl">€</span>
              </div>
              <p className="text-xs text-slate-400">Minimum: 1 000 €</p>
              
              {/* Boutons de montants rapides */}
              <div>
                <p className="text-sm text-slate-300 mb-3">Montants rapides :</p>
                <div className="grid grid-cols-3 gap-3">
                  {[10000, 25000, 50000, 100000, 200000, 500000].map((amount) => {
                    const isSelected = answers.investmentAmount === amount;
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

              {/* Bouton continuer */}
              {answers.investmentAmount && typeof answers.investmentAmount === 'number' && answers.investmentAmount >= 1000 && (
                <button
                  onClick={() => {
                    const completeAnswers = {
                      ...answers,
                      investmentAmount: answers.investmentAmount as number,
                    };
                    onComplete(completeAnswers as GuidedJourneyAnswers);
                  }}
                  className="w-full mt-4 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                >
                  Voir ma recommandation
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
            <strong>Conseil professionnel :</strong> Ce questionnaire vous guide vers un portefeuille adapté à votre situation. 
            Aucune promesse de performance. Investissement avec risque de perte en capital.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidedJourneyQuestionnaire;
