// AI service layer for language analysis.
// Exports: configure, analyzeText, correctText, getSuggestions
// control how French text gets analyzed when users submit their journal entries.
import mockData from './mockData';

const defaultConfig = {
  provider: 'mock', // 'openai' | 'huggingface' | 'mock'
  apiKey: null,
  model: 'gpt-4',
  hfModel: 'google/flan-t5-large',
  useMock: true,
  maxRetries: 2,
  retryDelayMs: 500,
};

let config = { ...defaultConfig };

export function configure(opts = {}) {
  config = { ...config, ...opts };
  if (config.apiKey && (config.provider === 'openai' || config.provider === 'huggingface')) {
    config.useMock = false;
  }
}

async function retryable(fn, attempts = 1) {
  let lastErr;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const backoff = config.retryDelayMs * Math.pow(2, i);
      // small delay before retrying
      if (i < attempts) await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

function buildAnalysisPrompt(text) {
  return `Please analyze the following learner text for language issues and provide: 1) a short summary, 2) list of errors with brief explanations, 3) suggested corrections, and 4) a short learning tip.\n\nText:\n${text}`;
}

async function callOpenAI(prompt) {
  if (!config.apiKey) throw { code: 'NO_API_KEY', message: 'OpenAI API key not configured' };
  const url = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: config.model || 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 800,
  };
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
    throw { code: 'OPENAI_ERROR', message: `OpenAI responded ${res.status}`, detail: text };
  }
  const data = await res.json();
  // Chat completions: data.choices[0].message.content
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || data.result || JSON.stringify(data);
  return content;
}

async function callHuggingFace(prompt) {
  if (!config.apiKey) throw { code: 'NO_API_KEY', message: 'Hugging Face API key not configured' };
  const model = config.hfModel || 'google/flan-t5-large';
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw { code: 'HF_ERROR', message: `Hugging Face responded ${res.status}`, detail: text };
  }
  const data = await res.json();
  // HF model responses vary; many return an array or object with generated_text
  if (Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text;
  if (data.generated_text) return data.generated_text;
  return JSON.stringify(data);
}

async function runProvider(prompt) {
  if (config.provider === 'openai') return retryable(() => callOpenAI(prompt), config.maxRetries);
  if (config.provider === 'huggingface') return retryable(() => callHuggingFace(prompt), config.maxRetries);
  throw { code: 'UNKNOWN_PROVIDER', message: `Unknown provider: ${config.provider}` };
}

export async function analyzeText(text, options = {}) {
  const useMock = options.useMock ?? config.useMock;
  if (!text) throw { code: 'NO_INPUT', message: 'No text provided to analyze' };
  if (useMock) return mockData.analyze(text);

  const prompt = buildAnalysisPrompt(text);
  try {
    const raw = await runProvider(prompt);
    return { provider: config.provider, raw };
  } catch (err) {
    throw { code: err.code || 'ANALYZE_ERROR', message: err.message || 'Failed to analyze text', detail: err.detail || err };
  }
}

export async function correctText(text, options = {}) {
  const useMock = options.useMock ?? config.useMock;
  if (!text) throw { code: 'NO_INPUT', message: 'No text provided to correct' };
  if (useMock) return mockData.correct(text);

  const prompt = `Please provide a corrected version of the following text (only output the corrected text, keep original meaning):\n\n${text}`;
  try {
    const raw = await runProvider(prompt);
    return { provider: config.provider, corrected: raw };
  } catch (err) {
    throw { code: err.code || 'CORRECT_ERROR', message: err.message || 'Failed to correct text', detail: err.detail || err };
  }
}

export async function getSuggestions(text, options = {}) {
  const useMock = options.useMock ?? config.useMock;
  if (!text) throw { code: 'NO_INPUT', message: 'No text provided to suggest improvements' };
  if (useMock) return mockData.suggestions(text);

  const prompt = `Provide 4 concise, practical suggestions to improve the following learner text (focus on grammar, phrasing, and style). Return as a numbered list.\n\n${text}`;
  try {
    const raw = await runProvider(prompt);
    return { provider: config.provider, raw };
  } catch (err) {
    throw { code: err.code || 'SUGGEST_ERROR', message: err.message || 'Failed to get suggestions', detail: err.detail || err };
  }
}

export default {
  configure,
  analyzeText,
  correctText,
  getSuggestions,
};
