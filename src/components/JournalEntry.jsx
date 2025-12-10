// components/JournalEntry.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import aiService from '../api/aiService';
import { formatApiError, validateTextInput, parseAnalysisResult } from '../utils/apiHelpers';
import { saveToHistory } from '../utils/historyManager';
import CorrectionDisplay from './CorrectionDisplay';
import ExplanationPanel from './ExplanaitionPanel';
import ProgressTracker from './ProgressTracker';
import LearningDashboard from './LearningDashboard';

const JournalEntry = ({ onJournalSubmit, loadedEntry = null }) => {
  const [text, setText] = useState(loadedEntry?.originalText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentAnalysis, updateAnalysis, progress } = useAnalysis();
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
console.log('Context Debug:', { 
  hasAnalysis: !!currentAnalysis,
  analysisKeys: currentAnalysis ? Object.keys(currentAnalysis) : 'none',
  progress: progress 
});

  // Load analysis when entry is loaded from history
  useEffect(() => {
    if (loadedEntry?.analysis) {
      updateAnalysis(loadedEntry.analysis);
      setLastInput(loadedEntry.originalText);
      console.log('Loaded entry from history:', loadedEntry);
    }
  }, [loadedEntry]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Validate input
    const validation = validateTextInput(text, 10);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    console.log('=== SUBMISSION START ===');
    console.log('Text submitted:', text);

    try {
      console.log('1. Calling analyzeText...');

      const result = await aiService.analyzeText(text);

      console.log('2. Raw API result:', result);
      console.log('3. Result type:', typeof result);
      console.log('4. Result keys:', Object.keys(result || {}));
      
      const parsed = parseAnalysisResult(result);
      console.log('5. Parsed analysis:', parsed);
      console.log('6. Parsed keys:', Object.keys(parsed || {}));
      
      console.log('7. Calling updateAnalysis...');
      updateAnalysis(parsed);
      console.log('8. updateAnalysis called');

      setTimeout(() => {
        console.log('9. Context after update (delayed):', {
          hasAnalysis: !!currentAnalysis,
          analysis: currentAnalysis,
        });
      }, 100);

      setLastInput(text);
      setSubmissionCount((c) => c + 1);
      
      // Save to history
      saveToHistory(text, parsed.corrections, parsed);
      
      setText('');
      
      // Trigger callback to show components
      if (onJournalSubmit) {
        onJournalSubmit();
      }
    } catch (err) {
      console.error('SUBMISSION ERROR:', err);
      const errorMsg = formatApiError(err);
      setError(errorMsg.userMessage || errorMsg.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // TEMP: simple data helper for debugging context updates
  const testSimpleUpdate = useCallback(() => {
    const testAnalysis = {
      summary: 'TEST: Your text has 2 errors',
      errors: [{ issue: 'TEST Error', example: 'test wrong', suggestion: 'test correct' }],
      corrections: 'TEST corrected text',
      tip: 'TEST learning tip',
    };

    console.log('TEST: Updating with simple data:', testAnalysis);
    updateAnalysis(testAnalysis);
  }, [updateAnalysis]);

  useEffect(() => {
    window.__testSimpleUpdate = testSimpleUpdate;
    return () => {
      delete window.__testSimpleUpdate;
    };
  }, [testSimpleUpdate]);

  // Optionally, you can use progress from context instead of local progressStats
  const progressStats = useMemo(() => {
    const grammarScore = Math.max(40, 95 - (currentAnalysis?.errors?.length || 0) * 10);
    return {
      entries: submissionCount,
      streak: Math.max(1, submissionCount),
      categories: {
        grammar: grammarScore,
        vocabulary: 70,
        fluency: 65,
      },
      achievements: submissionCount
        ? ['First analysis completed', `${submissionCount}-entry streak`, 'Accepted corrections ready']
        : ['Submit your first entry to unlock achievements'],
    };
  }, [currentAnalysis, submissionCount]);

  return (
    <div className="space-y-3">
      {/* Learning Dashboard - Compact */}
      <LearningDashboard compact={true} />
      
      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Write about your day:
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Describe your day in French. The AI will analyze and correct your writing.
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-200 text-sm font-medium">Error: {error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Your journal entry (in French):
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aujourd'hui, je suis allé au marché et j'ai acheté des pommes..."
            rows={5}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{text.length} chars</span>
            <span>Min. 50 recommended</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`px-6 py-2 text-sm rounded-lg font-medium transition-all ${
              !text.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </span>
            ) : (
              'Analyze & Correct'
            )}
          </button>
          
          {currentAnalysis && (
            <button
              onClick={() => setShowQuizModal(true)}
              className="px-6 py-2 text-sm rounded-lg font-medium transition-all bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              📋 Quiz & Corrections
            </button>
          )}
        </div>
      </form>
    </div>
    
    {/* Quiz & Corrections Modal */}
    {showQuizModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">📋 Quiz & Corrections Review</h2>
            <button
              onClick={() => setShowQuizModal(false)}
              className="text-2xl hover:bg-indigo-500 dark:hover:bg-indigo-600 p-1 rounded-lg transition-all">
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-8 space-y-8">
            {/* Progress Tracker at Top */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 Your Progress</h3>
              <ProgressTracker stats={progressStats} />
            </div>

            {/* Original vs Corrected */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📝 Original vs Corrected Text</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3">Your Original Text</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{lastInput}</p>
                </div>
                <div className="p-6 rounded-xl border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3">AI Corrections</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm font-mono">{currentAnalysis?.corrections}</p>
                </div>
              </div>
            </div>

            {/* Detailed Errors */}
            {currentAnalysis?.errors && currentAnalysis.errors.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">⚠️ Detailed Error Analysis ({currentAnalysis.errors.length} errors found)</h3>
                <div className="space-y-4">
                  {currentAnalysis.errors.map((err, idx) => (
                    <div key={idx} className="border-l-4 border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-yellow-900 dark:text-yellow-400 text-lg">{err.issue}</span>
                        <span className="bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">Error #{idx + 1}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">❌ Wrong:</span> 
                          <code className="ml-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs">{err.example}</code>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">✓ Correct:</span> 
                          <code className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">{err.suggestion}</code>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {currentAnalysis?.summary && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 Analysis Summary</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-6 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentAnalysis.summary}</p>
                </div>
              </div>
            )}

            {/* Learning Tip */}
            {currentAnalysis?.tip && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">💡 Learning Tip</h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-400 p-6 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentAnalysis.tip}</p>
                </div>
              </div>
            )}

            {/* Explanation Panel */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📚 Grammar & Language Tips</h3>
              <ExplanationPanel errors={currentAnalysis?.errors} tip={currentAnalysis?.tip} />
            </div>

            {/* Provider Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right border-t dark:border-gray-700 pt-4">
              Analyzed using {currentAnalysis?.provider} provider
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900 p-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowQuizModal(false)}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default JournalEntry;