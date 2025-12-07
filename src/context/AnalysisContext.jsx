import React, { createContext, useState, useContext, useCallback } from 'react';

// Create Context
const AnalysisContext = createContext();

// Provider Component
export function AnalysisProvider({ children }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [userChoices, setUserChoices] = useState({
    acceptedCorrections: [],
    rejectedCorrections: [],
    quizAnswers: {},
    masteredRules: []
  });
  const [progress, setProgress] = useState({
    totalEntries: 0,
    streak: 0,
    lastSubmissionDate: null,
    scores: { grammar: 0, vocabulary: 0, fluency: 0 }
  });

  // Update analysis
  const updateAnalysis = useCallback((newAnalysis) => {
    console.log('=== CONTEXT: updateAnalysis called ===');
    console.log('New analysis received:', newAnalysis);
    console.log('Type:', typeof newAnalysis);
    console.log('Is object?', newAnalysis && typeof newAnalysis === 'object');

    if (!newAnalysis || typeof newAnalysis !== 'object') {
      console.error('ERROR: Invalid analysis data:', newAnalysis);
      return;
    }

    setCurrentAnalysis(newAnalysis);
    
    // Update progress
    setProgress(prev => {
      console.log('Updating progress, old totalEntries:', prev.totalEntries);
      return {
        ...prev,
        totalEntries: prev.totalEntries + 1,
        lastSubmissionDate: new Date().toISOString()
      };
    });

    console.log('=== CONTEXT: updateAnalysis completed ===');
  }, []);

  // Track user choices
  const trackCorrectionChoice = useCallback((correctionId, isAccepted) => {
    setUserChoices(prev => ({
      ...prev,
      acceptedCorrections: isAccepted 
        ? [...prev.acceptedCorrections, correctionId]
        : prev.acceptedCorrections,
      rejectedCorrections: !isAccepted
        ? [...prev.rejectedCorrections, correctionId]
        : prev.rejectedCorrections
    }));
  }, []);

  // Track quiz answers
  const trackQuizAnswer = useCallback((ruleId, isCorrect) => {
    setUserChoices(prev => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [ruleId]: isCorrect
      },
      masteredRules: isCorrect 
        ? [...prev.masteredRules.filter(id => id !== ruleId), ruleId]
        : prev.masteredRules.filter(id => id !== ruleId)
    }));
  }, []);

  // Update progress scores
  const updateProgressScores = useCallback((newScores) => {
    setProgress(prev => ({
      ...prev,
      scores: { ...prev.scores, ...newScores }
    }));
  }, []);

  // Calculate streak
  const calculateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = progress.lastSubmissionDate?.split('T')[0];
    
    if (lastDate === today) return progress.streak;
    if (lastDate === getYesterdayDate()) return progress.streak + 1;
    return 1;
  }, [progress.lastSubmissionDate, progress.streak]);

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Context value
  const value = {
    currentAnalysis,
    userChoices,
    progress,
    updateAnalysis,
    trackCorrectionChoice,
    trackQuizAnswer,
    updateProgressScores,
    calculateStreak
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

// Custom hook
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}
