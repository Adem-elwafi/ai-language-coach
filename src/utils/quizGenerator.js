/**
 * Smart Quiz Generator
 * Creates pedagogically sound quiz questions with multiple difficulty levels
 * and varied question types that provide genuine learning value
 */

import frenchGrammarRules from '../data/frenchGrammarRules.js';

/**
 * Question types with different pedagogical approaches
 */
export const QuestionTypes = {
	ERROR_IDENTIFICATION: 'error_identification',
	RULE_EXPLANATION: 'rule_explanation',
	APPLICATION: 'application',
	SENTENCE_CONSTRUCTION: 'sentence_construction',
	MULTIPLE_CHOICE: 'multiple_choice',
	FILL_IN_BLANK: 'fill_in_blank',
	TRUE_FALSE: 'true_false',
};

/**
 * Difficulty levels for progressive learning
 */
export const DifficultyLevels = {
	LEVEL_1: 'recognize', // Recognize the error
	LEVEL_2: 'understand', // Understand the rule
	LEVEL_3: 'apply', // Apply to new context
	LEVEL_4: 'create', // Create original examples
};

/**
 * Generate a complete quiz set from an error
 * @param {Object} error - The error object with detection information
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Array} Array of quiz questions
 */
export function generateQuizFromError(error, numQuestions = 3) {
	if (!error || !error.grammarRule) {
		return generateDefaultQuiz();
	}

	const rule = error.grammarRule;
	const questions = [];

	// Generate different types of questions for comprehensive learning
	const questionGenerators = [
		() => generateRuleExplanationQuestion(error, rule),
		() => generateApplicationQuestion(error, rule),
		() => generateErrorIdentificationQuestion(error, rule),
		() => generateSentenceConstructionQuestion(error, rule),
	];

	// Shuffle and take requested number
	const shuffled = questionGenerators.sort(() => Math.random() - 0.5);
	
	for (let i = 0; i < Math.min(numQuestions, shuffled.length); i++) {
		const question = shuffled[i]();
		if (question) {
			questions.push(question);
		}
	}

	return questions;
}

/**
 * Generate a question about the grammar rule itself
 */
function generateRuleExplanationQuestion(error, rule) {
	const distractors = generateRuleDistractors(rule);
	
	const question = {
		id: `rule-${Date.now()}-${Math.random()}`,
		type: QuestionTypes.RULE_EXPLANATION,
		difficulty: DifficultyLevels.LEVEL_2,
		question: `Why is "${error.suggestion}" correct instead of "${error.example}"?`,
		options: [
			rule.rule, // Correct answer
			...distractors,
		].sort(() => Math.random() - 0.5), // Shuffle options
		correctAnswer: rule.rule,
		explanation: rule.explanation,
		points: 10,
	};

	return question;
}

/**
 * Generate a question that requires applying the rule to a new sentence
 */
function generateApplicationQuestion(error, rule) {
	// Get practice exercises or create one
	const practices = rule.practice || [];
	let practice;

	if (practices.length > 0) {
		practice = practices[Math.floor(Math.random() * practices.length)];
	} else {
		// Generate a similar sentence based on examples
		const examples = rule.examples || [];
		if (examples.length > 0) {
			const example = examples[Math.floor(Math.random() * examples.length)];
			practice = {
				prompt: `Fix this sentence: ${example.incorrect}`,
				answer: example.correct,
			};
		} else {
			return null;
		}
	}

	const question = {
		id: `apply-${Date.now()}-${Math.random()}`,
		type: QuestionTypes.APPLICATION,
		difficulty: DifficultyLevels.LEVEL_3,
		question: practice.prompt,
		correctAnswer: practice.answer,
		explanation: `The correct answer applies the rule: ${rule.rule}`,
		points: 15,
		hint: practice.hint,
	};

	// If it's a transformation, make it multiple choice
	if (practice.prompt.includes('Transform:') || practice.prompt.includes('Fix:')) {
		question.options = generateApplicationOptions(practice.answer, rule);
		question.type = QuestionTypes.MULTIPLE_CHOICE;
	} else {
		question.type = QuestionTypes.FILL_IN_BLANK;
	}

	return question;
}

/**
 * Generate a question to identify errors in multiple sentences
 */
function generateErrorIdentificationQuestion(error, rule) {
	const examples = rule.examples || [];
	
	if (examples.length < 2) return null;

	// Create sentences with and without errors
	const correctSentences = examples
		.filter(ex => ex.correct)
		.map(ex => ex.correct)
		.slice(0, 2);
	
	const incorrectSentence = examples.find(ex => ex.incorrect)?.incorrect || error.example;

	const allSentences = [...correctSentences, incorrectSentence].sort(() => Math.random() - 0.5);

	const question = {
		id: `identify-${Date.now()}-${Math.random()}`,
		type: QuestionTypes.ERROR_IDENTIFICATION,
		difficulty: DifficultyLevels.LEVEL_1,
		question: `Which sentence has a ${rule.category.replace(/-/g, ' ')} error?`,
		options: allSentences,
		correctAnswer: incorrectSentence,
		explanation: `"${incorrectSentence}" contains an error. ${rule.rule}`,
		points: 10,
	};

	return question;
}

/**
 * Generate a sentence construction question
 */
function generateSentenceConstructionQuestion(error, rule) {
	const examples = rule.examples || [];
	
	if (examples.length === 0) return null;

	const example = examples[Math.floor(Math.random() * examples.length)];
	const correctSentence = example.correct;

	// Break sentence into parts
	const words = correctSentence.split(' ');
	
	// Find the key word(s) related to the rule
	let keyWordIndex = -1;
	
	// For contractions, find 'au', 'du', etc.
	if (rule.category === 'contractions') {
		keyWordIndex = words.findIndex(w => ['au', 'du', 'aux', 'des'].includes(w.toLowerCase()));
	}
	// For articles, find 'le', 'la', 'un', 'une'
	else if (rule.category === 'gender-agreement') {
		keyWordIndex = words.findIndex(w => ['le', 'la', 'un', 'une', 'les', 'des'].includes(w.toLowerCase()));
	}

	if (keyWordIndex === -1) {
		keyWordIndex = Math.floor(words.length / 2);
	}

	const blank = words[keyWordIndex];
	const sentenceWithBlank = words.map((w, i) => i === keyWordIndex ? '____' : w).join(' ');

	const question = {
		id: `construct-${Date.now()}-${Math.random()}`,
		type: QuestionTypes.FILL_IN_BLANK,
		difficulty: DifficultyLevels.LEVEL_3,
		question: `Fill in the blank: ${sentenceWithBlank}`,
		correctAnswer: blank,
		options: generateBlankOptions(blank, rule),
		explanation: `The correct word is "${blank}". ${rule.rule}`,
		points: 15,
		translation: example.translation,
	};

	return question;
}

/**
 * Generate plausible wrong answers (distractors) for rule explanations
 */
function generateRuleDistractors(rule) {
	const category = rule.category;
	const distractors = [];

	// Category-specific distractors
	const distractorTemplates = {
		'contractions': [
			'Articles never contract with prepositions in French',
			'Contractions are optional depending on formality',
			'Only plural articles contract with prepositions',
		],
		'gender-agreement': [
			'All nouns ending in -e are feminine',
			'Articles must match the first letter of the noun',
			'Gender agreement is only required in written French',
		],
		'verb-conjugation': [
			'All verbs use avoir in passé composé',
			'Past participles never change form',
			'Subject agreement is optional in compound tenses',
		],
		'adjective-agreement': [
			'Adjectives in French never change form',
			'Agreement is only needed for irregular adjectives',
			'Feminine adjectives always end in -e',
		],
		'prepositions': [
			'All countries use the preposition "à"',
			'Prepositions in French are interchangeable',
			'Use "en" for all geographical locations',
		],
		'negation': [
			'Only "pas" is needed for negation',
			'Negation comes after the verb in French',
			'"Ne" is optional in spoken French',
		],
	};

	const templates = distractorTemplates[category] || [
		'This rule has many exceptions',
		'Usage varies by region',
		'Both forms are equally correct',
	];

	// Add 2-3 distractors
	distractors.push(...templates.slice(0, 3));

	// Add related but incorrect rules
	if (rule.relatedRules && rule.relatedRules.length > 0) {
		const relatedRule = frenchGrammarRules[rule.relatedRules[0]];
		if (relatedRule && relatedRule.rule !== rule.rule) {
			distractors.push(relatedRule.rule);
		}
	}

	return distractors.slice(0, 3);
}

/**
 * Generate options for application questions
 */
function generateApplicationOptions(correctAnswer, rule) {
	const options = [correctAnswer];

	// Generate plausible wrong answers based on rule type
	if (rule.category === 'contractions') {
		// For "au parc", generate "à le parc", "à la parc", "aux parc"
		if (correctAnswer.includes('au ')) {
			options.push(correctAnswer.replace('au ', 'à le '));
			options.push(correctAnswer.replace('au ', 'à la '));
			options.push(correctAnswer.replace('au ', 'aux '));
		} else if (correctAnswer.includes('du ')) {
			options.push(correctAnswer.replace('du ', 'de le '));
			options.push(correctAnswer.replace('du ', 'de la '));
			options.push(correctAnswer.replace('du ', 'des '));
		}
	} else if (rule.category === 'gender-agreement') {
		// Swap articles
		options.push(correctAnswer.replace(/\ble\b/, 'la'));
		options.push(correctAnswer.replace(/\bla\b/, 'le'));
		options.push(correctAnswer.replace(/\bun\b/, 'une'));
		options.push(correctAnswer.replace(/\bune\b/, 'un'));
	} else if (rule.category === 'verb-conjugation') {
		// Change verb endings
		options.push(correctAnswer.replace(/é(e?)s?$/, 'er'));
		options.push(correctAnswer.replace(/é(e?)s?$/, 'é'));
	} else {
		// Generic wrong options
		options.push(correctAnswer + ' (incorrect form)');
		options.push('Both forms are correct');
	}

	// Remove duplicates and ensure we have the correct answer
	const uniqueOptions = [...new Set(options)].filter(opt => opt !== correctAnswer);
	return [correctAnswer, ...uniqueOptions.slice(0, 3)].sort(() => Math.random() - 0.5);
}

/**
 * Generate options for fill-in-the-blank questions
 */
function generateBlankOptions(correctAnswer, rule) {
	const options = [correctAnswer];

	const lower = correctAnswer.toLowerCase();

	if (rule.category === 'contractions') {
		if (lower === 'au') options.push('à le', 'à la', 'aux');
		else if (lower === 'du') options.push('de le', 'de la', 'des');
		else if (lower === 'aux') options.push('à les', 'au', 'à la');
	} else if (rule.category === 'gender-agreement' || rule.category.includes('article')) {
		if (lower === 'le') options.push('la', 'les', 'un');
		else if (lower === 'la') options.push('le', 'les', 'une');
		else if (lower === 'un') options.push('une', 'le', 'des');
		else if (lower === 'une') options.push('un', 'la', 'des');
	} else {
		// Generic alternatives
		options.push(correctAnswer + 's', correctAnswer + 'e', correctAnswer.slice(0, -1));
	}

	return [...new Set(options)].slice(0, 4);
}

/**
 * Generate a default quiz when no specific error is detected
 */
function generateDefaultQuiz() {
	const basicRules = ['contraction-au', 'gender-article-masculine', 'negation-ne-pas'];
	const rule = frenchGrammarRules[basicRules[Math.floor(Math.random() * basicRules.length)]];

	return [
		{
			id: 'default-1',
			type: QuestionTypes.MULTIPLE_CHOICE,
			difficulty: DifficultyLevels.LEVEL_2,
			question: 'Which sentence is grammatically correct?',
			options: rule.examples?.slice(0, 3).map(ex => ex.correct) || ['Good job!', 'Keep practicing!'],
			correctAnswer: rule.examples?.[0]?.correct || 'Good job!',
			explanation: rule.rule,
			points: 10,
		},
	];
}

/**
 * Generate progressive quiz based on user's learning level
 * @param {Object} error - The error with detection
 * @param {number} userLevel - User's current mastery level (1-4)
 * @returns {Array} Quiz questions appropriate for user level
 */
export function generateProgressiveQuiz(error, userLevel = 1) {
	if (!error?.grammarRule) return generateDefaultQuiz();

	const rule = error.grammarRule;
	
	switch (userLevel) {
		case 1:
			// Beginner: Error recognition
			return [generateErrorIdentificationQuestion(error, rule)].filter(Boolean);
		
		case 2:
			// Intermediate: Understanding rules
			return [
				generateErrorIdentificationQuestion(error, rule),
				generateRuleExplanationQuestion(error, rule),
			].filter(Boolean);
		
		case 3:
			// Advanced: Application
			return [
				generateRuleExplanationQuestion(error, rule),
				generateApplicationQuestion(error, rule),
			].filter(Boolean);
		
		case 4:
			// Expert: Creation and complex application
			return [
				generateApplicationQuestion(error, rule),
				generateSentenceConstructionQuestion(error, rule),
			].filter(Boolean);
		
		default:
			return generateQuizFromError(error, 2);
	}
}

/**
 * Validate a user's answer
 * @param {Object} question - The question object
 * @param {string} userAnswer - The user's submitted answer
 * @returns {Object} Validation result with feedback
 */
export function validateAnswer(question, userAnswer) {
	if (!question || !userAnswer) {
		return { correct: false, feedback: 'Please provide an answer.' };
	}

	const normalize = (str) => str.toLowerCase().trim().replace(/[.,!?;]/g, '');
	const normalizedUser = normalize(userAnswer);
	const normalizedCorrect = normalize(question.correctAnswer);

	const isCorrect = normalizedUser === normalizedCorrect;

	return {
		correct: isCorrect,
		feedback: isCorrect 
			? `Correct! ${question.explanation}` 
			: `Not quite. The correct answer is "${question.correctAnswer}". ${question.explanation}`,
		points: isCorrect ? question.points : 0,
		correctAnswer: question.correctAnswer,
	};
}

/**
 * Generate a hint for a question
 * @param {Object} question - The question object
 * @returns {string} A helpful hint
 */
export function generateHint(question) {
	if (question.hint) return question.hint;

	switch (question.type) {
		case QuestionTypes.RULE_EXPLANATION:
			return 'Think about the fundamental grammar rule being applied.';
		case QuestionTypes.APPLICATION:
			return 'Apply the same rule pattern you learned.';
		case QuestionTypes.ERROR_IDENTIFICATION:
			return 'Look carefully at articles, verb forms, and word agreements.';
		case QuestionTypes.FILL_IN_BLANK:
			return question.translation ? `Translation: ${question.translation}` : 'Consider the context of the sentence.';
		default:
			return 'Review the rule explanation if you need help.';
	}
}

export default {
	generateQuizFromError,
	generateProgressiveQuiz,
	validateAnswer,
	generateHint,
	QuestionTypes,
	DifficultyLevels,
};
