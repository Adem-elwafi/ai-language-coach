/**
 * Comprehensive French Grammar Rules Database
 * Provides detailed grammar rules, examples, exceptions, and practice material
 * for intelligent quiz generation and personalized learning
 */

export const frenchGrammarRules = {
	// === CONTRACTIONS ===
	'contraction-au': {
		id: 'contraction-au',
		category: 'contractions',
		rule: 'à + le = au (mandatory contraction)',
		explanation: 'When the preposition "à" is followed by the masculine definite article "le", they must contract to form "au". This is mandatory in French.',
		examples: [
			{ incorrect: 'Je vais à le parc', correct: 'Je vais au parc', translation: 'I go to the park' },
			{ incorrect: 'Il est à le cinéma', correct: 'Il est au cinéma', translation: 'He is at the cinema' },
			{ incorrect: 'à le marché', correct: 'au marché', translation: 'to the market' },
		],
		exceptions: [
			{ rule: 'à + la = à la (no contraction)', example: 'Je vais à la plage' },
			{ rule: "à + l' = à l' (no contraction)", example: "Je vais à l'école" },
			{ rule: 'à + les = aux (contraction)', example: 'Je parle aux enfants' },
		],
		relatedRules: ['contraction-du', 'prepositions-place'],
		difficulty: 'beginner',
		commonMistakes: [
			'Using "à le" instead of "au"',
			'Confusing "au" (à + le) with "du" (de + le)',
			'Not contracting when "le" follows "à"',
		],
		practice: [
			{ prompt: 'Transform: à le restaurant → __________', answer: 'au restaurant' },
			{ prompt: 'Transform: à le bureau → __________', answer: 'au bureau' },
			{ prompt: 'Fix the error: Je vais à le stade', answer: 'Je vais au stade' },
		],
	},

	'contraction-du': {
		id: 'contraction-du',
		category: 'contractions',
		rule: 'de + le = du (mandatory contraction)',
		explanation: 'When the preposition "de" is followed by the masculine definite article "le", they must contract to form "du".',
		examples: [
			{ incorrect: 'Je viens de le parc', correct: 'Je viens du parc', translation: 'I come from the park' },
			{ incorrect: 'Le chat de le voisin', correct: 'Le chat du voisin', translation: "The neighbor's cat" },
			{ incorrect: 'de le magasin', correct: 'du magasin', translation: 'from the store' },
		],
		exceptions: [
			{ rule: 'de + la = de la (no contraction)', example: 'Je viens de la maison' },
			{ rule: "de + l' = de l' (no contraction)", example: "Je viens de l'école" },
			{ rule: 'de + les = des (contraction)', example: 'Le livre des enfants' },
		],
		relatedRules: ['contraction-au', 'partitive-article'],
		difficulty: 'beginner',
		commonMistakes: [
			'Using "de le" instead of "du"',
			'Confusing partitive "du" with contraction "du"',
		],
		practice: [
			{ prompt: 'Transform: de le musée → __________', answer: 'du musée' },
			{ prompt: 'Fix: Le livre de le professeur', answer: 'Le livre du professeur' },
		],
	},

	'contraction-aux': {
		id: 'contraction-aux',
		category: 'contractions',
		rule: 'à + les = aux (mandatory contraction)',
		explanation: 'When "à" precedes the plural article "les", they contract to "aux".',
		examples: [
			{ incorrect: 'Je parle à les enfants', correct: 'Je parle aux enfants', translation: 'I speak to the children' },
			{ incorrect: 'à les États-Unis', correct: 'aux États-Unis', translation: 'to the United States' },
		],
		relatedRules: ['contraction-au', 'plural-articles'],
		difficulty: 'beginner',
		practice: [
			{ prompt: 'Transform: à les étudiants → __________', answer: 'aux étudiants' },
		],
	},

	// === GENDER & ARTICLES ===
	'gender-article-masculine': {
		id: 'gender-article-masculine',
		category: 'gender-agreement',
		rule: 'Masculine nouns use "le" (or "un" for indefinite)',
		explanation: 'French nouns have grammatical gender. Masculine nouns require masculine articles.',
		examples: [
			{ correct: 'le chat', translation: 'the cat', note: 'masculine noun' },
			{ correct: 'le livre', translation: 'the book' },
			{ correct: 'un garçon', translation: 'a boy' },
		],
		hints: [
			'Nouns ending in -age are usually masculine (le garage, le village)',
			'Nouns ending in -ment are usually masculine (le gouvernement)',
			'Nouns ending in -eau are usually masculine (le château, le bateau)',
			'Days, months, seasons are masculine (le lundi, le printemps)',
		],
		exceptions: [
			{ word: 'la plage', note: 'ends in -age but feminine' },
			{ word: 'la page', note: 'ends in -age but feminine' },
		],
		relatedRules: ['gender-article-feminine', 'adjective-agreement'],
		difficulty: 'beginner',
		practice: [
			{ prompt: 'Is "table" masculine or feminine?', answer: 'feminine (la table)', hint: 'ends in -e' },
			{ prompt: 'Choose the correct article: ___ château', answer: 'le', hint: 'ends in -eau' },
		],
	},

	'gender-article-feminine': {
		id: 'gender-article-feminine',
		category: 'gender-agreement',
		rule: 'Feminine nouns use "la" (or "une" for indefinite)',
		explanation: 'Feminine nouns require feminine articles in French.',
		examples: [
			{ correct: 'la maison', translation: 'the house' },
			{ correct: 'la table', translation: 'the table' },
			{ correct: 'une fille', translation: 'a girl' },
		],
		hints: [
			'Nouns ending in -tion/-sion are usually feminine (la nation, la passion)',
			'Nouns ending in -té are usually feminine (la liberté, la beauté)',
			'Nouns ending in -ette are usually feminine (la cigarette)',
			'Nouns ending in -ence/-ance are usually feminine (la science, la danse)',
		],
		exceptions: [
			{ word: 'le musée', note: 'ends in -ée but masculine' },
			{ word: 'le lycée', note: 'ends in -ée but masculine' },
		],
		relatedRules: ['gender-article-masculine', 'adjective-agreement'],
		difficulty: 'beginner',
	},

	// === VERB CONJUGATION ===
	'passe-compose-etre': {
		id: 'passe-compose-etre',
		category: 'verb-conjugation',
		rule: 'Passé composé with être: past participle agrees with subject',
		explanation: 'Verbs using être as auxiliary (DR & MRS VANDERTRAMP) require past participle agreement with the subject in gender and number.',
		examples: [
			{ incorrect: 'Elle est allé', correct: 'Elle est allée', translation: 'She went', note: 'feminine subject' },
			{ incorrect: 'Ils sont arrivé', correct: 'Ils sont arrivés', translation: 'They arrived', note: 'plural' },
			{ correct: 'Je suis venu(e)', translation: 'I came', note: 'gender depends on speaker' },
		],
		etreVerbs: [
			'aller (allé)', 'venir (venu)', 'arriver (arrivé)', 'partir (parti)', 
			'entrer (entré)', 'sortir (sorti)', 'monter (monté)', 'descendre (descendu)',
			'naître (né)', 'mourir (mort)', 'rester (resté)', 'tomber (tombé)',
			'retourner (retourné)', 'devenir (devenu)',
		],
		relatedRules: ['passe-compose-avoir', 'adjective-agreement'],
		difficulty: 'intermediate',
		commonMistakes: [
			'Forgetting to add -e for feminine subjects',
			'Forgetting to add -s for plural subjects',
			'Using avoir instead of être for movement verbs',
		],
		practice: [
			{ prompt: 'Conjugate: Elle (aller) au cinéma → __________', answer: 'Elle est allée au cinéma' },
			{ prompt: 'Fix: Nous sommes arrivé hier', answer: 'Nous sommes arrivés hier' },
		],
	},

	'passe-compose-avoir': {
		id: 'passe-compose-avoir',
		category: 'verb-conjugation',
		rule: 'Passé composé with avoir: no agreement (except with preceding direct object)',
		explanation: 'Most verbs use avoir as auxiliary in passé composé. The past participle does not agree with the subject.',
		examples: [
			{ correct: 'Il a mangé', translation: 'He ate' },
			{ correct: 'Elle a mangé', translation: 'She ate', note: 'same form for masculine/feminine' },
			{ correct: 'Ils ont parlé', translation: 'They spoke' },
		],
		exceptions: [
			{ 
				rule: 'Agreement with preceding direct object', 
				example: 'Les pommes que j\'ai mangées', 
				note: '"que" refers to "pommes" (feminine plural)' 
			},
		],
		relatedRules: ['passe-compose-etre', 'direct-object-pronouns'],
		difficulty: 'intermediate',
	},

	'present-tense-regular-er': {
		id: 'present-tense-regular-er',
		category: 'verb-conjugation',
		rule: 'Regular -er verbs: endings are -e, -es, -e, -ons, -ez, -ent',
		explanation: 'Verbs ending in -er follow a regular pattern in present tense.',
		examples: [
			{ verb: 'parler', conjugations: ['je parle', 'tu parles', 'il/elle parle', 'nous parlons', 'vous parlez', 'ils/elles parlent'] },
			{ verb: 'manger', conjugations: ['je mange', 'tu manges', 'il mange', 'nous mangeons', 'vous mangez', 'ils mangent'] },
		],
		relatedRules: ['present-tense-ir', 'present-tense-re'],
		difficulty: 'beginner',
		practice: [
			{ prompt: 'Conjugate "aimer" with "je"', answer: "j'aime" },
			{ prompt: 'Conjugate "parler" with "nous"', answer: 'nous parlons' },
		],
	},

	// === ADJECTIVE AGREEMENT ===
	'adjective-agreement': {
		id: 'adjective-agreement',
		category: 'adjective-agreement',
		rule: 'Adjectives agree in gender and number with the noun they modify',
		explanation: 'French adjectives change form to match the gender (masculine/feminine) and number (singular/plural) of the noun.',
		examples: [
			{ incorrect: 'une voiture beau', correct: 'une voiture belle', translation: 'a beautiful car', note: 'feminine' },
			{ incorrect: 'des chats grand', correct: 'des chats grands', translation: 'big cats', note: 'plural' },
			{ correct: 'un homme intelligent', translation: 'an intelligent man' },
			{ correct: 'une femme intelligente', translation: 'an intelligent woman', note: 'add -e for feminine' },
		],
		patterns: [
			{ pattern: 'Add -e for feminine', example: 'petit → petite' },
			{ pattern: 'Add -s for plural', example: 'petit → petits' },
			{ pattern: 'Add -es for feminine plural', example: 'petit → petites' },
			{ pattern: 'No change if already ends in -e', example: 'rouge → rouge (both genders)' },
		],
		exceptions: [
			{ pattern: '-x stays same in masculine plural', example: 'heureux → heureux (m.pl.)' },
			{ pattern: 'Irregular: beau → belle, nouveau → nouvelle, vieux → vieille' },
		],
		relatedRules: ['gender-article-masculine', 'gender-article-feminine', 'adjective-position'],
		difficulty: 'beginner',
		practice: [
			{ prompt: 'Agree: une robe (blanc) → __________', answer: 'une robe blanche' },
			{ prompt: 'Agree: des maisons (grand) → __________', answer: 'des maisons grandes' },
		],
	},

	// === PREPOSITIONS ===
	'prepositions-place': {
		id: 'prepositions-place',
		category: 'prepositions',
		rule: 'Using correct prepositions with places: à (to/at), de (from), en/au (in/to countries)',
		explanation: 'French uses different prepositions for locations depending on context.',
		examples: [
			{ correct: 'Je vais à Paris', translation: 'I go to Paris', note: 'cities use à' },
			{ correct: 'Je suis en France', translation: 'I am in France', note: 'feminine countries use en' },
			{ correct: 'Je vais au Canada', translation: 'I go to Canada', note: 'masculine countries use au' },
			{ correct: 'Je viens de Londres', translation: 'I come from London' },
		],
		rules: [
			{ rule: 'Cities: à', example: 'à Lyon, à Marseille' },
			{ rule: 'Feminine countries: en', example: 'en France, en Italie' },
			{ rule: 'Masculine countries: au', example: 'au Japon, au Brésil' },
			{ rule: 'Plural countries: aux', example: 'aux États-Unis' },
		],
		relatedRules: ['contraction-au', 'contraction-du'],
		difficulty: 'intermediate',
	},

	// === PRONOUNS ===
	'direct-object-pronouns': {
		id: 'direct-object-pronouns',
		category: 'pronouns',
		rule: 'Direct object pronouns: le, la, les, me, te, nous, vous',
		explanation: 'Direct object pronouns replace direct object nouns and come before the verb.',
		examples: [
			{ incorrect: 'Je vois le chat', correct: 'Je le vois', translation: 'I see it (the cat)', note: 'masculine singular' },
			{ incorrect: 'Il mange la pomme', correct: 'Il la mange', translation: 'He eats it (the apple)', note: 'feminine singular' },
			{ incorrect: 'Nous aimons les films', correct: 'Nous les aimons', translation: 'We love them (the films)', note: 'plural' },
		],
		order: ['me/te/nous/vous', 'le/la/les', 'lui/leur', 'y', 'en'],
		relatedRules: ['indirect-object-pronouns', 'pronoun-order'],
		difficulty: 'intermediate',
	},

	// === NEGATION ===
	'negation-ne-pas': {
		id: 'negation-ne-pas',
		category: 'negation',
		rule: 'Negation: ne ... pas surrounds the verb',
		explanation: 'To make a sentence negative, place "ne" before the verb and "pas" after it.',
		examples: [
			{ incorrect: 'Je pas parle français', correct: 'Je ne parle pas français', translation: "I don't speak French" },
			{ incorrect: 'Il ne pas mange', correct: "Il ne mange pas", translation: "He doesn't eat" },
			{ correct: "Je n'aime pas", translation: "I don't like", note: "ne → n' before vowel" },
		],
		variations: [
			{ pattern: 'ne ... jamais', meaning: 'never', example: 'Je ne mange jamais de viande' },
			{ pattern: 'ne ... plus', meaning: 'no longer', example: 'Il ne fume plus' },
			{ pattern: 'ne ... rien', meaning: 'nothing', example: 'Je ne vois rien' },
			{ pattern: 'ne ... personne', meaning: 'nobody', example: 'Je ne connais personne' },
		],
		relatedRules: ['negation-complex'],
		difficulty: 'beginner',
		practice: [
			{ prompt: 'Make negative: Il parle anglais', answer: 'Il ne parle pas anglais' },
			{ prompt: 'Make negative: Je vais au cinéma', answer: 'Je ne vais pas au cinéma' },
		],
	},

	// === PARTITIVE ARTICLES ===
	'partitive-article': {
		id: 'partitive-article',
		category: 'articles',
		rule: 'Partitive articles: du (m), de la (f), de l\' (vowel), des (plural)',
		explanation: 'Partitive articles express "some" or an unspecified quantity.',
		examples: [
			{ correct: 'Je mange du pain', translation: 'I eat (some) bread', note: 'masculine' },
			{ correct: 'Elle boit de la limonade', translation: 'She drinks (some) lemonade', note: 'feminine' },
			{ correct: "Il y a de l'eau", translation: 'There is (some) water', note: 'vowel' },
		],
		negativeForm: [
			{ rule: 'In negative, du/de la/des → de/d\'', example: 'Je ne mange pas de pain' },
		],
		relatedRules: ['contraction-du', 'indefinite-articles'],
		difficulty: 'beginner',
	},
};

/**
 * Get all rules for a specific category
 */
export function getRulesByCategory(category) {
	return Object.values(frenchGrammarRules).filter(rule => rule.category === category);
}

/**
 * Get rules by difficulty level
 */
export function getRulesByDifficulty(difficulty) {
	return Object.values(frenchGrammarRules).filter(rule => rule.difficulty === difficulty);
}

/**
 * Get a specific rule by ID
 */
export function getRule(ruleId) {
	return frenchGrammarRules[ruleId] || null;
}

/**
 * Get related rules for a given rule
 */
export function getRelatedRules(ruleId) {
	const rule = getRule(ruleId);
	if (!rule || !rule.relatedRules) return [];
	return rule.relatedRules.map(id => frenchGrammarRules[id]).filter(Boolean);
}

/**
 * Search rules by keyword
 */
export function searchRules(keyword) {
	const lowerKeyword = keyword.toLowerCase();
	return Object.values(frenchGrammarRules).filter(rule => 
		rule.rule.toLowerCase().includes(lowerKeyword) ||
		rule.explanation.toLowerCase().includes(lowerKeyword) ||
		rule.category.toLowerCase().includes(lowerKeyword)
	);
}

export default frenchGrammarRules;
