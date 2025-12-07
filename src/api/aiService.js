/**
 * AI Service Layer for Language Analysis
 * Production-ready OpenAI integration with caching, rate limiting, and error handling
 * Exports: configure, analyzeText, correctText, getSuggestions, clearCache, getApiStatus
 */
import mockData from './mockData';
import { grammarAnalysisPrompt, SYSTEM_MESSAGE } from './promptTemplates';
import * as costTracker from './costTracker';

const defaultConfig = {
  provider: 'openai', // 'openai' | 'huggingface' | 'mock'
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || null,
  model: 'gpt-4o-mini',
  useMock: import.meta.env.VITE_USE_MOCK_AI === 'true',
  maxRetries: 2,
  retryDelayMs: 500,
  cacheEnabled: true,
  cacheDuration: 3600000, // 1 hour in milliseconds
};

let config = { ...defaultConfig };

// Response cache to avoid duplicate API calls
const responseCache = new Map();

export function configure(opts = {}) {
  config = { ...config, ...opts };
  
  // AUTO-CONFIGURE: Detect and use environment API key
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (envApiKey && envApiKey.startsWith('sk-')) {
    config.apiKey = envApiKey;
    config.provider = 'openai';
    config.useMock = false;
    console.log('🔑 OpenAI API key loaded from environment (.env.local)');
    console.log(`📊 Provider: ${config.provider} | Model: ${config.model} | Cache: ${config.cacheEnabled ? '✅' : '❌'}`);
  } else if (config.apiKey && config.apiKey.startsWith('sk-')) {
    config.provider = 'openai';
    config.useMock = false;
    console.log('🔑 OpenAI API key loaded from config options');
    console.log(`📊 Provider: ${config.provider} | Model: ${config.model} | Cache: ${config.cacheEnabled ? '✅' : '❌'}`);
  } else if (opts.useMock === true || import.meta.env.VITE_USE_MOCK_AI === 'true') {
    config.useMock = true;
    console.log('🤖 Using mock data (no API key found or mock mode enabled)');
  } else {
    config.useMock = true;
    console.warn('⚠️ No valid OpenAI API key found, falling back to mock mode');
    console.warn('   To enable real AI, add VITE_OPENAI_API_KEY to .env.local');
    console.warn('   Get key from: https://platform.openai.com/api-keys');
  }
}

/**
 * Cache key generator
 */
function getCacheKey(type, text, options = {}) {
  return `${type}:${text}:${JSON.stringify(options)}`;
}

/**
 * Get cached response if available and not expired
 */
function getFromCache(key) {
  if (!config.cacheEnabled) return null;
  
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > config.cacheDuration) {
    responseCache.delete(key);
    return null;
  }
  
  console.log('📦 Using cached response');
  return cached.data;
}

/**
 * Store response in cache
 */
function setCache(key, data) {
  if (!config.cacheEnabled) return;
  
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Clean old cache entries (keep last 50)
  if (responseCache.size > 50) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
}

/**
 * Clear all cached responses
 */
export function clearCache() {
  responseCache.clear();
  console.log('🗑️ Cache cleared');
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryable(fn, attempts = 1) {
  let lastErr;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ Attempt ${i + 1} failed:`, err.message);
      const backoff = config.retryDelayMs * Math.pow(2, i);
      if (i < attempts) {
        console.log(`⏳ Retrying in ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr;
}

/**
 * Build analysis prompt for French text (legacy - uses new template system)
 */
function buildAnalysisPrompt(text, userLevel = 'A2') {
  return grammarAnalysisPrompt(text, userLevel);
}

/**
 * Call OpenAI API with proper error handling and token tracking
 */
async function callOpenAI(prompt, options = {}) {
  if (!config.apiKey || config.apiKey === 'your_openai_api_key_here') {
    throw { 
      code: 'NO_API_KEY', 
      message: 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local' 
    };
  }

  // Check rate limits before making request
  const estimatedTokens = costTracker.estimateTokens(prompt);
  const limitCheck = costTracker.checkLimits(estimatedTokens);
  
  if (!limitCheck.allowed) {
    throw { 
      code: 'RATE_LIMIT', 
      message: limitCheck.reason 
    };
  }

  const url = options.baseUrl || 'https://api.openai.com/v1/chat/completions';
  const model = options.model || config.model || 'gpt-4';
  
  const body = {
    model,
    messages: [
      SYSTEM_MESSAGE,
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature || 0.3,
    max_tokens: options.maxTokens || 1500,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined
  };

  console.log(`🤖 Calling OpenAI ${model}...`);
  const startTime = Date.now();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let errorMessage = `OpenAI API error (${res.status})`;
    
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.error?.message || errorMessage;
    } catch (e) {
      // Use status text if can't parse JSON
      errorMessage = res.statusText || errorMessage;
    }

    throw { 
      code: 'OPENAI_ERROR', 
      message: errorMessage, 
      status: res.status,
      detail: text 
    };
  }

  const data = await res.json();
  const duration = Date.now() - startTime;
  
  // Extract response content
  const content = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  // Track usage and costs
  const cost = costTracker.calculateCost(
    model,
    usage.prompt_tokens || 0,
    usage.completion_tokens || 0
  );

  costTracker.trackRequest({
    model,
    inputTokens: usage.prompt_tokens || 0,
    outputTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    cost,
    duration,
    success: true
  });

  console.log(`✅ Response received in ${duration}ms | Tokens: ${usage.total_tokens || 0} | Cost: $${cost.toFixed(4)}`);

  return {
    content,
    usage,
    cost,
    duration,
    model
  };
}

/**
 * Run provider with retry logic
 */
async function runProvider(prompt, options = {}) {
  if (config.provider === 'openai') {
    return retryable(() => callOpenAI(prompt, options), config.maxRetries);
  }
  throw { code: 'UNKNOWN_PROVIDER', message: `Provider not supported: ${config.provider}` };
}

/**
 * Parse and validate JSON response from AI
 */
function parseAIResponse(content) {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn('⚠️ Failed to parse JSON response, returning raw content');
    return { raw: content, parseError: true };
  }
}

/**
 * Analyze French text with comprehensive grammar and style feedback
 * @param {string} text - French text to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Structured analysis results
 */
export async function analyzeText(text, options = {}) {
  const useMock = options.useMock ?? config.useMock;
  
  if (!text || text.trim().length === 0) {
    throw { code: 'NO_INPUT', message: 'No text provided to analyze' };
  }

  // Use mock data in development or when API key not configured
  if (useMock) {
    console.log('🤖 Using mock data (AI disabled)');
    return mockData.analyze(text);
  }

  // Check cache first
  const cacheKey = getCacheKey('analyze', text, options);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const userLevel = options.userLevel || 'A2';
  const prompt = buildAnalysisPrompt(text, userLevel);

  try {
    console.log(`🧠 Analyzing French text (${userLevel} level)...`);
    const response = await runProvider(prompt, {
      jsonMode: true,
      temperature: 0.3,
      maxTokens: 1500
    });

    const parsedContent = parseAIResponse(response.content);
    
    const result = {
      provider: config.provider,
      model: response.model,
      analysis: parsedContent,
      metadata: {
        tokens: response.usage?.total_tokens || 0,
        cost: response.cost,
        duration: response.duration,
        cached: false,
        timestamp: new Date().toISOString()
      }
    };

    // Cache the successful response
    setCache(cacheKey, result);
    console.log(`✅ Real AI analysis received (${response.model})`);
    
    return result;
  } catch (err) {
    // Auto-fallback to mock on API errors
    console.error('❌ Real AI API error, falling back to mock:', err.message);
    console.error('   Error details:', err);
    
    costTracker.trackRequest({
      model: config.model,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      success: false,
      error: err.message
    });

    return {
      ...mockData.analyze(text),
      fallbackMode: true,
      error: err.message
    };
  }
}

/**
 * Get quick text correction
 * @param {string} text - Text to correct
 * @param {Object} options - Options
 * @returns {Promise<Object>} Corrected text
 */
export async function correctText(text, options = {}) {
  const useMock = options.useMock ?? config.useMock;
  
  if (!text || text.trim().length === 0) {
    throw { code: 'NO_INPUT', message: 'No text provided to correct' };
  }

  if (useMock) {
    console.log('🔧 Using mock data');
    return mockData.correct(text);
  }

  // Check cache
  const cacheKey = getCacheKey('correct', text, options);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const prompt = `Please provide a corrected version of the following French text. Only output the corrected text, keeping the original meaning and style:\n\n"${text}"`;

  try {
    const response = await runProvider(prompt, {
      temperature: 0.2,
      maxTokens: 500
    });

    const result = {
      provider: config.provider,
      corrected: response.content.trim(),
      metadata: {
        tokens: response.usage?.total_tokens || 0,
        cost: response.cost,
        duration: response.duration
      }
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('❌ Correction error, falling back to mock:', err.message);
    return {
      ...mockData.correct(text),
      fallbackMode: true,
      error: err.message
    };
  }
}

/**
 * Get improvement suggestions
 * @param {string} text - Text to analyze
 * @param {Object} options - Options
 * @returns {Promise<Object>} Suggestions
 */
export async function getSuggestions(text, options = {}) {
  const useMock = options.useMock ?? config.useMock;
  
  if (!text || text.trim().length === 0) {
    throw { code: 'NO_INPUT', message: 'No text provided for suggestions' };
  }

  if (useMock) {
    console.log('🔧 Using mock data');
    return mockData.suggestions(text);
  }

  // Check cache
  const cacheKey = getCacheKey('suggestions', text, options);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const prompt = `Provide 4 concise, practical suggestions to improve the following French learner text. Focus on grammar, phrasing, and style. Return as a numbered list.\n\nText:\n"${text}"`;

  try {
    const response = await runProvider(prompt, {
      temperature: 0.4,
      maxTokens: 400
    });

    const result = {
      provider: config.provider,
      suggestions: response.content,
      metadata: {
        tokens: response.usage?.total_tokens || 0,
        cost: response.cost,
        duration: response.duration
      }
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('❌ Suggestions error, falling back to mock:', err.message);
    return {
      ...mockData.suggestions(text),
      fallbackMode: true,
      error: err.message
    };
  }
}

/**
 * Get API status and health information
 * @returns {Object} API status
 */
export function getApiStatus() {
  const hasValidKey = config.apiKey && config.apiKey !== 'your_openai_api_key_here';
  const usageStats = costTracker.getUsageStats();
  
  return {
    configured: hasValidKey,
    useMock: config.useMock,
    provider: config.provider,
    model: config.model,
    cacheEnabled: config.cacheEnabled,
    cacheSize: responseCache.size,
    usage: usageStats,
    status: hasValidKey && !config.useMock ? 'active' : 'mock'
  };
}

/**
 * Validate API connection
 * @returns {Promise<Object>} Connection test result
 */
export async function testConnection() {
  if (config.useMock) {
    return {
      success: true,
      message: 'Running in mock mode',
      mode: 'mock'
    };
  }

  try {
    const testText = 'Bonjour';
    const response = await callOpenAI(
      `Say "OK" if you can read this: ${testText}`,
      { maxTokens: 10, temperature: 0 }
    );

    return {
      success: true,
      message: 'API connection successful',
      model: response.model,
      latency: response.duration
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      error: err.code
    };
  }
}

export default {
  configure,
  analyzeText,
  correctText,
  getSuggestions,
  clearCache,
  getApiStatus,
  testConnection
};

