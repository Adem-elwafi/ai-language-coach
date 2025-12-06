/**
 * Cost Tracker for OpenAI API Usage
 * Monitors token usage, estimates costs, and enforces limits
 */

// OpenAI GPT-4 Pricing (as of 2024)
const PRICING = {
  'gpt-4': {
    input: 0.03 / 1000,    // $0.03 per 1K tokens
    output: 0.06 / 1000     // $0.06 per 1K tokens
  },
  'gpt-4-turbo': {
    input: 0.01 / 1000,
    output: 0.03 / 1000
  },
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000,
    output: 0.0015 / 1000
  }
};

const STORAGE_KEY = 'aiLanguageCoach_usage';

/**
 * Get usage data from localStorage
 */
const getUsageData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return initializeUsageData();
    }
    const parsed = JSON.parse(data);
    
    // Reset if it's a new day
    const lastReset = new Date(parsed.lastReset);
    const today = new Date();
    if (lastReset.toDateString() !== today.toDateString()) {
      return initializeUsageData();
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading usage data:', error);
    return initializeUsageData();
  }
};

/**
 * Initialize fresh usage data
 */
const initializeUsageData = () => {
  const data = {
    lastReset: new Date().toISOString(),
    totalRequests: 0,
    totalTokens: {
      input: 0,
      output: 0,
      total: 0
    },
    totalCost: 0,
    requestsByModel: {},
    history: []
  };
  saveUsageData(data);
  return data;
};

/**
 * Save usage data to localStorage
 */
const saveUsageData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving usage data:', error);
  }
};

/**
 * Track a new API request
 * @param {Object} request - Request details
 * @param {string} request.model - Model used (e.g., 'gpt-4')
 * @param {number} request.inputTokens - Input tokens used
 * @param {number} request.outputTokens - Output tokens used
 * @param {number} request.cost - Calculated cost
 * @param {boolean} request.success - Whether request succeeded
 */
export const trackRequest = (request) => {
  const data = getUsageData();
  
  data.totalRequests += 1;
  data.totalTokens.input += request.inputTokens || 0;
  data.totalTokens.output += request.outputTokens || 0;
  data.totalTokens.total += (request.inputTokens || 0) + (request.outputTokens || 0);
  data.totalCost += request.cost || 0;
  
  // Track by model
  if (!data.requestsByModel[request.model]) {
    data.requestsByModel[request.model] = {
      count: 0,
      tokens: 0,
      cost: 0
    };
  }
  data.requestsByModel[request.model].count += 1;
  data.requestsByModel[request.model].tokens += (request.inputTokens || 0) + (request.outputTokens || 0);
  data.requestsByModel[request.model].cost += request.cost || 0;
  
  // Add to history (keep last 100)
  data.history.unshift({
    timestamp: new Date().toISOString(),
    ...request
  });
  if (data.history.length > 100) {
    data.history = data.history.slice(0, 100);
  }
  
  saveUsageData(data);
  return data;
};

/**
 * Calculate cost for a request
 * @param {string} model - Model name
 * @param {number} inputTokens - Input tokens
 * @param {number} outputTokens - Output tokens
 * @returns {number} Estimated cost in USD
 */
export const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = PRICING[model] || PRICING['gpt-4'];
  const inputCost = inputTokens * pricing.input;
  const outputCost = outputTokens * pricing.output;
  return inputCost + outputCost;
};

/**
 * Estimate tokens in text (rough approximation)
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
export const estimateTokens = (text) => {
  // Rough estimate: ~4 characters per token for English/French
  // This is approximate; actual tokenization varies
  return Math.ceil(text.length / 4);
};

/**
 * Check if request would exceed daily limits
 * @param {number} estimatedTokens - Estimated tokens for new request
 * @returns {Object} { allowed: boolean, reason: string }
 */
export const checkLimits = (estimatedTokens = 0) => {
  const maxRequestsPerDay = parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_DAY) || 100;
  const maxTokensPerRequest = parseInt(import.meta.env.VITE_MAX_TOKENS_PER_REQUEST) || 1000;
  
  const data = getUsageData();
  
  // Check daily request limit
  if (data.totalRequests >= maxRequestsPerDay) {
    return {
      allowed: false,
      reason: `Daily request limit reached (${maxRequestsPerDay} requests). Resets at midnight.`
    };
  }
  
  // Check per-request token limit
  if (estimatedTokens > maxTokensPerRequest) {
    return {
      allowed: false,
      reason: `Text too long. Maximum ${maxTokensPerRequest} tokens per request (estimated: ${estimatedTokens}).`
    };
  }
  
  return { allowed: true };
};

/**
 * Get current usage statistics
 * @returns {Object} Usage statistics
 */
export const getUsageStats = () => {
  const data = getUsageData();
  const maxRequests = parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_DAY) || 100;
  
  return {
    ...data,
    remainingRequests: Math.max(0, maxRequests - data.totalRequests),
    maxRequests,
    costFormatted: `$${data.totalCost.toFixed(4)}`,
    averageCostPerRequest: data.totalRequests > 0 
      ? data.totalCost / data.totalRequests 
      : 0,
    percentUsed: (data.totalRequests / maxRequests) * 100
  };
};

/**
 * Reset usage statistics (manual reset)
 */
export const resetUsage = () => {
  return initializeUsageData();
};

/**
 * Get usage summary for display
 * @returns {Object} Formatted summary
 */
export const getUsageSummary = () => {
  const stats = getUsageStats();
  
  return {
    requests: `${stats.totalRequests} / ${stats.maxRequests}`,
    tokens: stats.totalTokens.total.toLocaleString(),
    cost: stats.costFormatted,
    status: stats.percentUsed >= 90 ? 'warning' : 'ok',
    message: stats.percentUsed >= 90 
      ? 'Approaching daily limit' 
      : stats.percentUsed >= 100
      ? 'Daily limit reached'
      : 'Usage within limits'
  };
};

/**
 * Export usage data for analysis
 * @returns {string} JSON string of usage data
 */
export const exportUsageData = () => {
  const data = getUsageData();
  return JSON.stringify(data, null, 2);
};

export default {
  trackRequest,
  calculateCost,
  estimateTokens,
  checkLimits,
  getUsageStats,
  getUsageSummary,
  resetUsage,
  exportUsageData
};
