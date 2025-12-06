/**
 * Specialized prompt templates for French language learning
 * Optimized for OpenAI GPT-4 with structured JSON responses
 */

/**
 * Generate grammar analysis prompt for French text
 * @param {string} text - The French text to analyze
 * @param {string} userLevel - CEFR level (A1, A2, B1, B2, C1, C2)
 * @returns {string} Formatted prompt for OpenAI
 */
export const grammarAnalysisPrompt = (text, userLevel = 'A2') => `
You are a professional French language teacher specializing in language acquisition and CEFR standards. Analyze this ${userLevel}-level student text with precision and pedagogical insight.

**Student Text:**
"${text}"

**Your Task:**
Provide a comprehensive analysis in this EXACT JSON format (ensure valid JSON):

{
  "summary": "Brief overall assessment in 1-2 sentences, highlighting main strengths and areas for improvement",
  "cefrLevel": "Estimated CEFR level based on vocabulary, grammar complexity, and fluency (A1, A2, B1, B2, C1, C2)",
  "errors": [
    {
      "type": "grammar|vocabulary|spelling|syntax|conjugation|preposition|article|agreement",
      "original": "exact problematic phrase from the text",
      "corrected": "corrected version",
      "explanation": "Clear, simple explanation of the rule in French with English translation if helpful",
      "severity": "low|medium|high",
      "ruleReference": "Brief rule name (e.g., 'Accord du participe passé', 'Subjonctif après il faut que')"
    }
  ],
  "corrections": "Full corrected text with all errors fixed , with making the sentense  more readable  ",
  "vocabulary": [
    {
      "word": "original word or phrase",
      "suggestion": "better or more appropriate word",
      "reason": "why this is better (more natural, higher register, more precise, etc.)",
      "level": "CEFR level of the suggested word"
    }
  ],
  "strengths": [
    "Specific positive aspects of the writing (e.g., 'Good use of passé composé', 'Rich vocabulary for level')"
  ],
  "tipOfTheDay": "One actionable, specific tip for immediate improvement based on the most common error pattern",
  "culturalNote": "Relevant French cultural insight, idiom, or expression related to the text topic (if applicable)",
  "nextSteps": "Suggested focus areas for the next practice session"
}

**Analysis Guidelines:**
- Be encouraging but honest about errors
- Prioritize errors by severity (high = changes meaning, medium = grammatically incorrect, low = stylistic)
- Suggest vocabulary that is appropriate for one level above current proficiency
- Provide cultural notes that enhance understanding of French-speaking contexts
- Focus on patterns, not isolated mistakes
- Use simple, clear language in explanations
`;

/**
 * Generate vocabulary enrichment prompt
 * @param {string} text - The French text
 * @param {string} userLevel - CEFR level
 * @param {string} focusArea - Specific focus (e.g., 'formal', 'conversational', 'academic')
 * @returns {string} Formatted prompt for vocabulary suggestions
 */
export const vocabularyEnrichmentPrompt = (text, userLevel = 'A2', focusArea = 'general') => `
You are a French vocabulary specialist. Analyze this ${userLevel}-level text and suggest vocabulary improvements for ${focusArea} French.

**Text:**
"${text}"

Provide suggestions in this JSON format:

{
  "currentLevel": "Detected CEFR level",
  "targetLevel": "Recommended target level for vocabulary growth",
  "suggestions": [
    {
      "original": "word or phrase from text",
      "alternatives": ["synonym1", "synonym2", "synonym3"],
      "context": "when to use each alternative",
      "register": "formal|informal|neutral",
      "frequency": "common|less common|rare"
    }
  ],
  "idioms": [
    {
      "situation": "context from the text",
      "idiom": "French idiomatic expression",
      "literal": "literal translation",
      "meaning": "actual meaning",
      "example": "example sentence"
    }
  ],
  "lexicalField": "Main semantic field of the text (e.g., 'daily life', 'travel', 'work')",
  "keyVocabulary": ["essential words for this topic at this level"]
}
`;

/**
 * Generate cultural context prompt
 * @param {string} text - The French text
 * @param {string} topic - Topic of the text
 * @returns {string} Formatted prompt for cultural insights
 */
export const culturalContextPrompt = (text, topic = 'general') => `
You are a French culture expert. Analyze this text about "${topic}" and provide cultural insights.

**Text:**
"${text}"

Provide analysis in this JSON format:

{
  "culturalReferences": [
    {
      "reference": "cultural element mentioned or implied",
      "explanation": "what a French person would understand",
      "context": "historical or social context",
      "relevance": "why this matters for language learners"
    }
  ],
  "communicationStyle": "Analysis of formality, politeness, and social register",
  "regionalVariations": "Any regional French variations or considerations",
  "practicalTips": [
    "Practical advice for using this language in real French contexts"
  ],
  "dosDonts": {
    "dos": ["culturally appropriate expressions or behaviors"],
    "donts": ["common mistakes or faux pas to avoid"]
  }
}
`;

/**
 * Generate progressive learning prompt based on user history
 * @param {string} currentText - Current text to analyze
 * @param {Array} pastErrors - Array of past error types
 * @param {string} userLevel - CEFR level
 * @returns {string} Formatted prompt for adaptive learning
 */
export const progressiveAnalysisPrompt = (currentText, pastErrors = [], userLevel = 'A2') => `
You are an adaptive French learning AI. This ${userLevel}-level student has been working on these areas: ${pastErrors.join(', ')}.

**Current Text:**
"${currentText}"

Provide personalized analysis in this JSON format:

{
  "progressCheck": {
    "previousIssues": ["issues from past that appear again"],
    "improvements": ["areas showing clear improvement"],
    "newChallenges": ["new types of errors appearing"]
  },
  "adaptiveFeedback": "Personalized feedback acknowledging progress and addressing persistent challenges",
  "focusRecommendation": "Specific grammar point or skill to practice next",
  "exercises": [
    {
      "type": "grammar drill|writing prompt|vocabulary exercise",
      "description": "what to practice",
      "example": "sample exercise"
    }
  ],
  "milestones": {
    "current": "Current skill level description",
    "next": "What achieving the next level looks like",
    "estimatedTime": "Estimated time to reach next milestone with regular practice"
  }
}
`;

/**
 * Generate quick correction prompt for real-time feedback
 * @param {string} text - Text to correct
 * @returns {string} Lightweight prompt for fast responses
 */
export const quickCorrectionPrompt = (text) => `
Quickly correct this French text and provide essential feedback.

**Text:**
"${text}"

Respond in this concise JSON format:

{
  "corrected": "corrected text",
  "majorErrors": [
    {
      "type": "error type",
      "fix": "what was fixed"
    }
  ],
  "score": "Grammar accuracy score 0-100",
  "oneLineTip": "Most important thing to remember"
}
`;

/**
 * System message for all OpenAI requests
 */
export const SYSTEM_MESSAGE = {
  role: 'system',
  content: `You are an expert French language teacher specializing in helping students improve their written French. You provide constructive, encouraging feedback with clear explanations. You understand CEFR levels and adapt your feedback accordingly. Always respond with valid JSON matching the requested structure exactly. Be precise, pedagogical, and supportive.`
};

/**
 * Get appropriate prompt based on analysis type
 * @param {string} type - Type of analysis
 * @param {Object} params - Parameters for the prompt
 * @returns {string} Generated prompt
 */
export const getPrompt = (type, params = {}) => {
  const { text, userLevel = 'A2', focusArea, topic, pastErrors } = params;

  switch (type) {
    case 'grammar':
      return grammarAnalysisPrompt(text, userLevel);
    case 'vocabulary':
      return vocabularyEnrichmentPrompt(text, userLevel, focusArea);
    case 'cultural':
      return culturalContextPrompt(text, topic);
    case 'progressive':
      return progressiveAnalysisPrompt(text, pastErrors, userLevel);
    case 'quick':
      return quickCorrectionPrompt(text);
    default:
      return grammarAnalysisPrompt(text, userLevel);
  }
};

export default {
  grammarAnalysisPrompt,
  vocabularyEnrichmentPrompt,
  culturalContextPrompt,
  progressiveAnalysisPrompt,
  quickCorrectionPrompt,
  getPrompt,
  SYSTEM_MESSAGE
};
