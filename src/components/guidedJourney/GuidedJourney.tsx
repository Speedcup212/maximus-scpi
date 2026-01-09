import React, { useState, useEffect } from 'react';
import { GuidedJourneyAnswers, PortfolioRecommendation } from '../../types/guidedJourney';
import { scpiData } from '../../data/scpiData';
import { generateRecommendation } from '../../utils/guidedJourneyLogic';
import GuidedJourneyQuestionnaire from './GuidedJourneyQuestionnaire';
import GuidedJourneyResults from './GuidedJourneyResults';

interface GuidedJourneyProps {
  onClose?: () => void;
  onStartSubscription?: (scpiIds: number[]) => void;
  onCalendlyClick?: () => void;
}

const GuidedJourney: React.FC<GuidedJourneyProps> = ({ 
  onClose,
  onStartSubscription,
  onCalendlyClick
}) => {
  // Restaurer le state depuis sessionStorage si disponible
  const getInitialState = () => {
    // Vérifier aussi l'URL pour savoir si on doit charger les résultats
    const path = window.location.pathname;
    const isResultsPage = path.includes('/parcours-guide/resultats') || path.includes('/guided-journey/resultats');
    
    try {
      const savedState = sessionStorage.getItem('guidedJourneyState');
      if (savedState && isResultsPage) {
        const parsed = JSON.parse(savedState);
        // Vérifier que les données sont valides
        if (parsed.step === 'results' && parsed.recommendation && parsed.answers) {
          return {
            step: parsed.step as 'questionnaire' | 'results',
            recommendation: parsed.recommendation as PortfolioRecommendation,
            answers: parsed.answers as GuidedJourneyAnswers
          };
        }
      }
      } catch (e) {
        // Erreur silencieuse lors de la restauration
      }
    return {
      step: 'questionnaire' as const,
      recommendation: null as PortfolioRecommendation | null,
      answers: null as GuidedJourneyAnswers | null
    };
  };

  const initialState = getInitialState();
  const [step, setStep] = useState<'questionnaire' | 'results'>(initialState.step);
  const [recommendation, setRecommendation] = useState<PortfolioRecommendation | null>(initialState.recommendation);
  const [answers, setAnswers] = useState<GuidedJourneyAnswers | null>(initialState.answers);

  // Vérifier l'URL au montage et restaurer le state si nécessaire
  useEffect(() => {
    const path = window.location.pathname;
    const isResultsPage = path.includes('/parcours-guide/resultats') || path.includes('/guided-journey/resultats');
    
    if (isResultsPage && step === 'questionnaire') {
      // Si on est sur la page de résultats mais que le state n'est pas chargé, le restaurer
      try {
        const savedState = sessionStorage.getItem('guidedJourneyState');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.step === 'results' && parsed.recommendation && parsed.answers) {
            setStep('results');
            setRecommendation(parsed.recommendation);
            setAnswers(parsed.answers);
          }
        }
      } catch (e) {
        // Erreur silencieuse lors de la restauration
      }
    } else if (!isResultsPage && step === 'results') {
      // Si on n'est plus sur la page de résultats, nettoyer
      setStep('questionnaire');
      setRecommendation(null);
      setAnswers(null);
      sessionStorage.removeItem('guidedJourneyState');
    }
  }, []);

  const handleQuestionnaireComplete = (answersData: GuidedJourneyAnswers) => {
    // Générer la recommandation
    const rec = generateRecommendation(answersData, scpiData);
    
    // Sauvegarder dans sessionStorage AVANT de mettre à jour le state
    try {
      sessionStorage.setItem('guidedJourneyState', JSON.stringify({
        step: 'results',
        recommendation: rec,
        answers: answersData
      }));
    } catch (e) {
      // Erreur silencieuse lors de la sauvegarde
    }
    
    // Mettre à jour le state
    setRecommendation(rec);
    setAnswers(answersData);
    setStep('results');
    
    // Mettre à jour l'URL APRÈS la sauvegarde
    window.history.pushState({}, '', '/parcours-guide/resultats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToQuestionnaire = () => {
    setStep('questionnaire');
    // Nettoyer le sessionStorage et l'URL
    try {
      sessionStorage.removeItem('guidedJourneyState');
      window.history.pushState({}, '', '/parcours-guide');
    } catch (e) {
      console.error('Erreur lors du nettoyage du state:', e);
    }
  };

  if (step === 'results' && recommendation && answers) {
    return (
      <GuidedJourneyResults
        recommendation={recommendation}
        answers={answers}
        onBack={handleBackToQuestionnaire}
        onStartSubscription={onStartSubscription}
        onCalendlyClick={onCalendlyClick}
      />
    );
  }
  

  return (
    <GuidedJourneyQuestionnaire
      onComplete={handleQuestionnaireComplete}
      onClose={onClose}
    />
  );
};

export default GuidedJourney;
