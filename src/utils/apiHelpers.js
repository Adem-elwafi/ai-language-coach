/**
 * API helper utilities for error handling, formatting, and request processing.
 */

/**
 * Format error response into a user-friendly message.
 * @param {Error|Object} error - The error object from API or service.
 * @returns {Object} Formatted error with code, message, and detail.
 */
export function formatApiError(error) {
  // If already a formatted error object
  if (error.code && error.message) {
    return error;
  }

  // Network or fetch errors
  if (error instanceof TypeError) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      detail: error.message,
    };
  }

  // Generic error handling
  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
    detail: error.detail || error.toString(),
  };
}

/**
 * Validate text input before sending to AI service.
 * @param {string} text - The text to validate.
 * @param {number} minLength - Minimum required length (default: 10).
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateTextInput(text, minLength = 10) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Text must be a non-empty string' };
  }

  const trimmed = text.trim();
  if (trimmed.length < minLength) {
    return { isValid: false, error: `Please enter at least ${minLength} characters` };
  }

  return { isValid: true };
}

/**
 * Parse and extract meaningful text from analysis results.
 * Handles both mock and real provider responses.
 * @param {Object} result - The analysis result from aiService.
 * @returns {Object} Cleaned analysis object.
 */
export function parseAnalysisResult(result) {
  if (!result) return null;

  return {
    summary: result.summary || 'No summary available',
    errors: Array.isArray(result.errors) ? result.errors : [],
    corrections: result.corrections || '',
    tip: result.tip || '',
    provider: result.provider || 'mock',
  };
}

/**
 * Format correction result for display.
 * @param {Object} result - The correction result from aiService.
 * @returns {Object} Formatted correction.
 */
export function parseCorrectionResult(result) {
  if (!result) return null;

  return {
    original: result.original || '',
    corrected: result.corrected || '',
    provider: result.provider || 'mock',
  };
}

/**
 * Handle async API call with timeout and error handling.
 * @param {Promise} promise - The async operation to perform.
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000).
 * @returns {Promise} Result or throws formatted error.
 */
export async function withTimeout(promise, timeoutMs = 30000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (err) {
    throw formatApiError(err);
  }
}

export default {
  formatApiError,
  validateTextInput,
  parseAnalysisResult,
  parseCorrectionResult,
  withTimeout,
};
