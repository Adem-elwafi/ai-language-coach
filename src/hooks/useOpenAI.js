/**
 * Custom React Hook for OpenAI API Integration
 * Manages AI analysis state, loading, errors, and caching
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import * as aiService from '../api/aiService';
import * as costTracker from '../api/costTracker';

/**
 * Hook for managing AI text analysis
 * @param {Object} options - Configuration options
 * @returns {Object} Analysis state and functions
 */
export function useOpenAI(options = {}) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    result: null,
    metadata: null
  });

  const [apiStatus, setApiStatus] = useState(null);
  const abortControllerRef = useRef(null);

  // Initialize API configuration on mount
  useEffect(() => {
    if (Object.keys(options).length > 0) {
      aiService.configure(options);
    }
    updateApiStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * Update API status information
   */
  const updateApiStatus = useCallback(() => {
    const status = aiService.getApiStatus();
    setApiStatus(status);
  }, []);

  /**
   * Analyze French text
   */
  const analyzeText = useCallback(async (text, analysisOptions = {}) => {
    if (!text || text.trim().length === 0) {
      setState(prev => ({
        ...prev,
        error: { message: 'Please enter some text to analyze' }
      }));
      return null;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState({
      loading: true,
      error: null,
      result: null,
      metadata: null
    });

    try {
      const result = await aiService.analyzeText(text, {
        ...options,
        ...analysisOptions
      });

      setState({
        loading: false,
        error: null,
        result: result.analysis || result,
        metadata: result.metadata || {
          provider: result.provider,
          model: result.model,
          fallbackMode: result.fallbackMode
        }
      });

      updateApiStatus();
      return result;
    } catch (error) {
      setState({
        loading: false,
        error: {
          message: error.message || 'Failed to analyze text',
          code: error.code
        },
        result: null,
        metadata: null
      });
      return null;
    }
  }, [options, updateApiStatus]);

  /**
   * Correct text only
   */
  const correctText = useCallback(async (text, correctionOptions = {}) => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await aiService.correctText(text, {
        ...options,
        ...correctionOptions
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      updateApiStatus();
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: error.message || 'Failed to correct text',
          code: error.code
        }
      }));
      return null;
    }
  }, [options, updateApiStatus]);

  /**
   * Get improvement suggestions
   */
  const getSuggestions = useCallback(async (text, suggestionOptions = {}) => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await aiService.getSuggestions(text, {
        ...options,
        ...suggestionOptions
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      updateApiStatus();
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: error.message || 'Failed to get suggestions',
          code: error.code
        }
      }));
      return null;
    }
  }, [options, updateApiStatus]);

  /**
   * Clear current results and errors
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
      metadata: null
    });
  }, []);

  /**
   * Clear response cache
   */
  const clearCache = useCallback(() => {
    aiService.clearCache();
    updateApiStatus();
  }, [updateApiStatus]);

  /**
   * Test API connection
   */
  const testConnection = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await aiService.testConnection();
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.success ? null : { message: result.message }
      }));

      updateApiStatus();
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: { message: 'Connection test failed' }
      }));
      return { success: false, message: error.message };
    }
  }, [updateApiStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    result: state.result,
    metadata: state.metadata,
    apiStatus,
    
    // Functions
    analyzeText,
    correctText,
    getSuggestions,
    reset,
    clearCache,
    testConnection,
    updateApiStatus
  };
}

/**
 * Hook for tracking API usage statistics
 * @returns {Object} Usage statistics and functions
 */
export function useApiUsage() {
  const [usage, setUsage] = useState(() => costTracker.getUsageStats());

  const updateUsage = useCallback(() => {
    const stats = costTracker.getUsageStats();
    setUsage(stats);
  }, []);

  useEffect(() => {
    // Update usage every 5 seconds
    const interval = setInterval(() => {
      const stats = costTracker.getUsageStats();
      setUsage(stats);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const resetUsage = useCallback(() => {
    costTracker.resetUsage();
    updateUsage();
  }, [updateUsage]);

  const exportData = useCallback(() => {
    return costTracker.exportUsageData();
  }, []);

  return {
    usage,
    updateUsage,
    resetUsage,
    exportData
  };
}

/**
 * Hook for estimating token usage before API call
 * @param {string} text - Text to estimate
 * @returns {Object} Estimation details
 */
export function useTokenEstimate(text) {
  // Use useMemo to derive estimate from text without effects
  const estimate = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const tokens = costTracker.estimateTokens(text);
    const limitCheck = costTracker.checkLimits(tokens);
    const estimatedCost = costTracker.calculateCost('gpt-4', tokens, tokens * 0.5);

    return {
      tokens,
      allowed: limitCheck.allowed,
      reason: limitCheck.reason,
      estimatedCost,
      formattedCost: `$${estimatedCost.toFixed(4)}`
    };
  }, [text]);

  return estimate;
}

export default {
  useOpenAI,
  useApiUsage,
  useTokenEstimate
};
