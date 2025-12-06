/**
 * Error Type Detector
 * Analyzes original vs corrected text to identify specific grammar error types
 * and map them to the appropriate grammar rules for educational purposes
 */

import frenchGrammarRules from '../data/frenchGrammarRules.js';

/**
 * Detect the type of error based on original and corrected text
 * @param {string} original - The original incorrect text
 * @param {string} corrected - The corrected text
 * @param {string} errorDescription - Optional description from AI
 * @returns {Object} Error analysis with detected type and matched rule
 */
export function detectErrorType(original, corrected, errorDescription = '') {
	if (!original || !corrected) {
		return { type: 'unknown', confidence: 0, rule: null };
	}

	const originalLower = original.toLowerCase().trim();
	const correctedLower = corrected.toLowerCase().trim();
	const desc = errorDescription.toLowerCase();

	// Check for various error patterns with confidence scoring
	const detectors = [
		detectContractionErrors,
		detectGenderArticleErrors,
		detectVerbConjugationErrors,
		detectAdjectiveAgreementErrors,
		detectPrepositionErrors,
		detectNegationErrors,
		detectPartitiveArticleErrors,
		detectPronounErrors,
	];

	let bestMatch = { type: 'unknown', confidence: 0, rule: null, details: {} };

	for (const detector of detectors) {
		const result = detector(originalLower, correctedLower, desc);
		if (result.confidence > bestMatch.confidence) {
			bestMatch = result;
		}
	}

	return bestMatch;
}

/**
 * Detect contraction errors (à le → au, de le → du, etc.)
 */
function detectContractionErrors(original, corrected, desc) {
	const patterns = [
		{
			pattern: /à\s+le\b/,
			correction: /\bau\b/,
			type: 'contraction-au',
			confidence: 0.95,
		},
		{
			pattern: /de\s+le\b/,
			correction: /\bdu\b/,
			type: 'contraction-du',
			confidence: 0.95,
		},
		{
			pattern: /à\s+les\b/,
			correction: /\baux\b/,
			type: 'contraction-aux',
			confidence: 0.95,
		},
		{
			pattern: /de\s+les\b/,
			correction: /\bdes\b/,
			type: 'contraction-des',
			confidence: 0.95,
		},
	];

	for (const { pattern, correction, type, confidence } of patterns) {
		if (pattern.test(original) && correction.test(corrected)) {
			return {
				type,
				confidence,
				rule: frenchGrammarRules[type],
				details: { 
					originalPattern: pattern.toString(),
					detectedError: 'contraction',
				},
			};
		}
	}

	// Check description for contraction keywords
	if (desc.includes('contract') || desc.includes('au') || desc.includes('du')) {
		if (original.includes('à le') || original.includes('à le')) {
			return {
				type: 'contraction-au',
				confidence: 0.7,
				rule: frenchGrammarRules['contraction-au'],
				details: { source: 'description' },
			};
		}
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect gender/article agreement errors
 */
function detectGenderArticleErrors(original, corrected, desc) {
	const masculineArticles = ['le', 'un', 'ce', 'mon', 'ton', 'son'];
	const feminineArticles = ['la', 'une', 'cette', 'ma', 'ta', 'sa'];

	const originalWords = original.split(/\s+/);
	const correctedWords = corrected.split(/\s+/);

	for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
		const origWord = originalWords[i];
		const corrWord = correctedWords[i];

		// Check if article changed from masculine to feminine or vice versa
		const origMasc = masculineArticles.includes(origWord);
		const origFem = feminineArticles.includes(origWord);
		const corrMasc = masculineArticles.includes(corrWord);
		const corrFem = feminineArticles.includes(corrWord);

		if (origMasc && corrFem) {
			return {
				type: 'gender-article-feminine',
				confidence: 0.85,
				rule: frenchGrammarRules['gender-article-feminine'],
				details: { 
					wrongArticle: origWord, 
					correctArticle: corrWord,
					noun: originalWords[i + 1] || '',
				},
			};
		}

		if (origFem && corrMasc) {
			return {
				type: 'gender-article-masculine',
				confidence: 0.85,
				rule: frenchGrammarRules['gender-article-masculine'],
				details: { 
					wrongArticle: origWord, 
					correctArticle: corrWord,
					noun: originalWords[i + 1] || '',
				},
			};
		}
	}

	// Check description
	if (desc.includes('gender') || desc.includes('article') || desc.includes('masculine') || desc.includes('feminine')) {
		return {
			type: 'gender-article-masculine',
			confidence: 0.5,
			rule: frenchGrammarRules['gender-article-masculine'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect verb conjugation errors
 */
function detectVerbConjugationErrors(original, corrected, desc) {
	// Common être verbs for passé composé detection
	const etreVerbs = ['allé', 'venu', 'arrivé', 'parti', 'entré', 'sorti', 'monté', 'descendu', 
	                   'né', 'mort', 'resté', 'tombé', 'retourné', 'devenu'];

	// Check for passé composé with être (agreement issues)
	const pcEtrePattern = /\b(je suis|tu es|il est|elle est|on est|nous sommes|vous êtes|ils sont|elles sont)\s+(\w+)/i;
	const origMatch = original.match(pcEtrePattern);
	const corrMatch = corrected.match(pcEtrePattern);

	if (origMatch && corrMatch) {
		const origParticiple = origMatch[2];
		const corrParticiple = corrMatch[2];

		// Check if participle changed (likely agreement)
		if (origParticiple !== corrParticiple) {
			const baseVerb = etreVerbs.find(v => corrParticiple.startsWith(v));
			if (baseVerb) {
				return {
					type: 'passe-compose-etre',
					confidence: 0.9,
					rule: frenchGrammarRules['passe-compose-etre'],
					details: { 
						wrongForm: origParticiple,
						correctForm: corrParticiple,
						subject: origMatch[1],
					},
				};
			}
		}
	}

	// Check for regular -er verb conjugation
	if (desc.includes('conjugation') || desc.includes('verb') || desc.includes('tense')) {
		if (desc.includes('passé') || desc.includes('past')) {
			return {
				type: 'passe-compose-etre',
				confidence: 0.6,
				rule: frenchGrammarRules['passe-compose-etre'],
				details: { source: 'description' },
			};
		}
		return {
			type: 'present-tense-regular-er',
			confidence: 0.5,
			rule: frenchGrammarRules['present-tense-regular-er'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect adjective agreement errors
 */
function detectAdjectiveAgreementErrors(original, corrected, desc) {
	const originalWords = original.split(/\s+/);
	const correctedWords = corrected.split(/\s+/);

	// Look for words that differ by typical adjective endings
	for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
		const origWord = originalWords[i];
		const corrWord = correctedWords[i];

		// Check for common adjective agreement patterns
		if (origWord !== corrWord) {
			// Feminine agreement: +e
			if (corrWord === origWord + 'e' || corrWord === origWord + 'es') {
				return {
					type: 'adjective-agreement',
					confidence: 0.85,
					rule: frenchGrammarRules['adjective-agreement'],
					details: { 
						wrongForm: origWord,
						correctForm: corrWord,
						agreementType: 'feminine/plural',
					},
				};
			}

			// Plural agreement: +s
			if (corrWord === origWord + 's') {
				return {
					type: 'adjective-agreement',
					confidence: 0.85,
					rule: frenchGrammarRules['adjective-agreement'],
					details: { 
						wrongForm: origWord,
						correctForm: corrWord,
						agreementType: 'plural',
					},
				};
			}

			// Common irregular adjective changes
			const irregularPairs = [
				['beau', 'belle'], ['beau', 'beaux'], ['belle', 'belles'],
				['nouveau', 'nouvelle'], ['nouveau', 'nouveaux'], ['nouvelle', 'nouvelles'],
				['vieux', 'vieille'], ['vieux', 'vieilles'],
			];

			for (const [masc, fem] of irregularPairs) {
				if ((origWord === masc && corrWord === fem) || (origWord === fem && corrWord === masc)) {
					return {
						type: 'adjective-agreement',
						confidence: 0.9,
						rule: frenchGrammarRules['adjective-agreement'],
						details: { 
							wrongForm: origWord,
							correctForm: corrWord,
							agreementType: 'irregular',
						},
					};
				}
			}
		}
	}

	if (desc.includes('adjective') || desc.includes('agreement') || desc.includes('accord')) {
		return {
			type: 'adjective-agreement',
			confidence: 0.6,
			rule: frenchGrammarRules['adjective-agreement'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect preposition errors
 */
function detectPrepositionErrors(original, corrected, desc) {
	const prepositionChanges = [
		{ from: /\bà\b/, to: /\ben\b/, type: 'prepositions-place' },
		{ from: /\ben\b/, to: /\bau\b/, type: 'prepositions-place' },
		{ from: /\bde\b/, to: /\bà\b/, type: 'prepositions-place' },
	];

	for (const { from, to, type } of prepositionChanges) {
		if (from.test(original) && to.test(corrected)) {
			return {
				type,
				confidence: 0.7,
				rule: frenchGrammarRules[type],
				details: { 
					prepositionChange: true,
				},
			};
		}
	}

	if (desc.includes('preposition') || desc.includes('à') || desc.includes('de')) {
		return {
			type: 'prepositions-place',
			confidence: 0.5,
			rule: frenchGrammarRules['prepositions-place'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect negation errors
 */
function detectNegationErrors(original, corrected, desc) {
	// Check for ne...pas pattern
	const hasNe = /\bne\b|n'/i.test(corrected);
	const hasPas = /\bpas\b/i.test(corrected);
	const originalMissingNe = !/\bne\b|n'/i.test(original) && /\bpas\b/i.test(original);

	if (hasNe && hasPas && originalMissingNe) {
		return {
			type: 'negation-ne-pas',
			confidence: 0.9,
			rule: frenchGrammarRules['negation-ne-pas'],
			details: { 
				issue: 'missing ne',
			},
		};
	}

	if (desc.includes('negation') || desc.includes('negative') || desc.includes('ne...pas')) {
		return {
			type: 'negation-ne-pas',
			confidence: 0.7,
			rule: frenchGrammarRules['negation-ne-pas'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect partitive article errors
 */
function detectPartitiveArticleErrors(original, corrected, desc) {
	const partitives = ['du', 'de la', "de l'", 'des'];
	
	const hasPartitive = partitives.some(p => corrected.includes(p));
	const missingPartitive = !partitives.some(p => original.includes(p));

	if (hasPartitive && missingPartitive) {
		return {
			type: 'partitive-article',
			confidence: 0.75,
			rule: frenchGrammarRules['partitive-article'],
			details: { 
				issue: 'missing partitive article',
			},
		};
	}

	if (desc.includes('partitive') || desc.includes('article partitif')) {
		return {
			type: 'partitive-article',
			confidence: 0.7,
			rule: frenchGrammarRules['partitive-article'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Detect pronoun errors
 */
function detectPronounErrors(original, corrected, desc) {
	// Pronouns: ['le', 'la', 'les', 'lui', 'leur', 'me', 'te', 'se', 'nous', 'vous', 'y', 'en']

	if (desc.includes('pronoun') || desc.includes('pronom')) {
		return {
			type: 'direct-object-pronouns',
			confidence: 0.6,
			rule: frenchGrammarRules['direct-object-pronouns'],
			details: { source: 'description' },
		};
	}

	return { type: null, confidence: 0, rule: null };
}

/**
 * Analyze multiple errors from a correction
 * @param {Array} errors - Array of error objects from AI correction
 * @returns {Array} Enhanced errors with detected types and matched rules
 */
export function analyzeErrors(errors) {
	if (!errors || errors.length === 0) return [];

	return errors.map((error, index) => {
		const detection = detectErrorType(
			error.example || '',
			error.suggestion || '',
			error.issue || ''
		);

		return {
			...error,
			index: index + 1,
			detectedType: detection.type,
			confidence: detection.confidence,
			grammarRule: detection.rule,
			details: detection.details,
		};
	});
}

/**
 * Get similar examples of the same error type
 * @param {string} errorType - The detected error type
 * @param {number} count - Number of examples to return
 * @returns {Array} Array of similar example sentences
 */
export function getSimilarExamples(errorType, count = 3) {
	const rule = frenchGrammarRules[errorType];
	if (!rule || !rule.examples) return [];

	return rule.examples.slice(0, count);
}

/**
 * Get practice exercises for an error type
 * @param {string} errorType - The detected error type
 * @returns {Array} Array of practice exercises
 */
export function getPracticeExercises(errorType) {
	const rule = frenchGrammarRules[errorType];
	if (!rule || !rule.practice) return [];

	return rule.practice;
}

export default {
	detectErrorType,
	analyzeErrors,
	getSimilarExamples,
	getPracticeExercises,
};
