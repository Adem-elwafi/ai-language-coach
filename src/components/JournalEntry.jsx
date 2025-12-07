// components/JournalEntry.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import aiService from '../api/aiService';
import { formatApiError, validateTextInput, parseAnalysisResult } from '../utils/apiHelpers';
import CorrectionDisplay from './CorrectionDisplay';
import ExplanationPanel from './ExplanaitionPanel';
import ProgressTracker from './ProgressTracker';
import LearningDashboard from './LearningDashboard';

const JournalEntry = () => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentAnalysis, updateAnalysis, progress } = useAnalysis();
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [submissionCount, setSubmissionCount] = useState(0);
  
console.log('Context Debug:', { 
  hasAnalysis: !!currentAnalysis,
  analysisKeys: currentAnalysis ? Object.keys(currentAnalysis) : 'none',
  progress: progress 
});

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
      setText('');
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
    <div className="space-y-6">
      {/* Learning Dashboard */}
      <LearningDashboard compact={true} />
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Write about your day:
          </h2>
          <p className="text-gray-600 mb-4">
            Describe your day, thoughts, or experiences in French. The AI will analyze and correct your writing.
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">Error: {error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your journal entry (in French):
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aujourd'hui, je suis allé au marché et j'ai acheté des pommes..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{text.length} characters</span>
            <span>Min. 50 characters recommended</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              !text.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </span>
            ) : (
              'Analyze & Correct'
            )}
          </button>
        </div>
      </form>

      {/* Analysis Results Section */}
      {currentAnalysis && (
        <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analysis Results</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed">{currentAnalysis.summary}</p>
            </div>
          </div>

          {/* Errors Found */}
          {currentAnalysis.errors && currentAnalysis.errors.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Issues Found</h4>
              <div className="space-y-3">
                {currentAnalysis.errors.map((err, idx) => (
                  <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-yellow-900">{err.issue}</span>
                      <span className="text-sm text-yellow-700">Issue #{err.index}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{err.example}</span>
                    </p>
                    <p className="text-sm text-green-700">
                      ✓ Suggestion: <span className="font-mono bg-green-100 px-2 py-1 rounded">{err.suggestion}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Corrections */}
          {currentAnalysis.corrections && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Full Corrections</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap font-mono">{currentAnalysis.corrections}</p>
              </div>
            </div>
          )}

          {/* Learning Tip */}
          {currentAnalysis.tip && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">💡 Learning Tip</h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{currentAnalysis.tip}</p>
              </div>
            </div>
          )}

          {/* Provider Info */}
          <div className="text-xs text-gray-500 text-right mt-4">
            Analyzed using {currentAnalysis.provider} provider
          </div>

          {/* Connected components grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CorrectionDisplay
              originalText={lastInput}
              correctedText={currentAnalysis.corrections}
              errors={currentAnalysis.errors}
            />

            <ExplanationPanel errors={currentAnalysis.errors} tip={currentAnalysis.tip} />
          </div>

          <ProgressTracker stats={progressStats} />
        </div>
      )}
    </div>
    </div>
  );
};

export default JournalEntry;