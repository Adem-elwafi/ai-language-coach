// Mock responses for AI service unit testing and development.
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const analyze = async (text) => {
  await delay(250);
  return {
    summary: 'The text shows basic sentence structure but contains tense inconsistencies and article misuse.',
    errors: [
      { index: 1, issue: 'Article usage', example: 'I have car', suggestion: 'I have a car' },
      { index: 2, issue: 'Tense inconsistency', example: 'She go to school yesterday', suggestion: 'She went to school yesterday' },
    ],
    corrections: `1) I have a car.\n2) She went to school yesterday.`,
    tip: 'Focus on simple past forms for completed actions and use articles (a/an/the) with singular countable nouns.',
    raw: 'MOCK_ANALYSIS_RAW',
  };
};

const correct = async (text) => {
  await delay(150);
  // naive mock: replace some common mistakes
  let corrected = text.replace(/\bI have car\b/gi, 'I have a car');
  corrected = corrected.replace(/\bShe go to school yesterday\b/gi, 'She went to school yesterday');
  return { original: text, corrected, raw: 'MOCK_CORRECTION_RAW' };
};

const suggestions = async (text) => {
  await delay(150);
  return {
    suggestions: [
      'Check and regularize verb tenses (past vs present).',
      'Use articles before singular countable nouns: a, an, the.',
      'Break long sentences into shorter ones for clarity.',
      'Prefer simple synonyms for better readability.',
    ],
    raw: 'MOCK_SUGGESTIONS_RAW',
  };
};

export default {
  analyze,
  correct,
  suggestions,
};
