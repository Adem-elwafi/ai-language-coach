/**
 * Learning Progress Tracker
 * Tracks user performance across different grammar rules to enable
 * adaptive learning and personalized quiz difficulty
 */

/**
 * Local storage keys
 */
const STORAGE_KEYS = {
	PROGRESS: 'ai-language-coach-progress',
	STATS: 'ai-language-coach-stats',
	ACHIEVEMENTS: 'ai-language-coach-achievements',
};

/**
 * Initialize or get existing progress data
 */
function getProgressData() {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error('Error loading progress data:', error);
	}

	// Default structure
	return {
		rulesMastery: {}, // { ruleId: { attempts, correct, level, lastPracticed } }
		totalQuizzes: 0,
		totalCorrect: 0,
		streak: 0,
		lastPracticeDate: null,
		level: 1,
		experience: 0,
	};
}

/**
 * Save progress data
 */
function saveProgressData(data) {
	try {
		localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
	} catch (error) {
		console.error('Error saving progress data:', error);
	}
}

/**
 * Get user statistics
 */
export function getUserStats() {
	const progress = getProgressData();
	
	return {
		totalQuizzes: progress.totalQuizzes || 0,
		totalCorrect: progress.totalCorrect || 0,
		accuracy: progress.totalQuizzes > 0 
			? Math.round((progress.totalCorrect / progress.totalQuizzes) * 100) 
			: 0,
		streak: progress.streak || 0,
		level: progress.level || 1,
		experience: progress.experience || 0,
		experienceToNextLevel: getExperienceForLevel(progress.level + 1),
		lastPracticeDate: progress.lastPracticeDate,
		rulesCount: Object.keys(progress.rulesMastery || {}).length,
	};
}

/**
 * Calculate experience required for a level
 */
function getExperienceForLevel(level) {
	// Progressive XP curve: 100, 250, 500, 1000, 1500, ...
	return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Record a quiz attempt
 * @param {string} ruleId - The grammar rule ID
 * @param {boolean} correct - Whether the answer was correct
 * @param {number} points - Points earned
 */
export function recordAttempt(ruleId, correct, points = 0) {
	const progress = getProgressData();

	// Update rule-specific mastery
	if (!progress.rulesMastery[ruleId]) {
		progress.rulesMastery[ruleId] = {
			attempts: 0,
			correct: 0,
			level: 1,
			lastPracticed: null,
			totalPoints: 0,
		};
	}

	const ruleMastery = progress.rulesMastery[ruleId];
	ruleMastery.attempts += 1;
	if (correct) {
		ruleMastery.correct += 1;
		ruleMastery.totalPoints += points;
	}
	ruleMastery.lastPracticed = new Date().toISOString();

	// Update mastery level based on performance
	const accuracy = ruleMastery.correct / ruleMastery.attempts;
	if (accuracy >= 0.9 && ruleMastery.attempts >= 5) {
		ruleMastery.level = Math.min(4, ruleMastery.level + 1);
	} else if (accuracy < 0.5 && ruleMastery.attempts >= 3) {
		ruleMastery.level = Math.max(1, ruleMastery.level - 1);
	}

	// Update overall stats
	progress.totalQuizzes += 1;
	if (correct) {
		progress.totalCorrect += 1;
		progress.experience += points;
	}

	// Update streak
	const today = new Date().toDateString();
	const lastDate = progress.lastPracticeDate ? new Date(progress.lastPracticeDate).toDateString() : null;
	
	if (lastDate === today) {
		// Same day, streak continues
	} else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
		// Yesterday, increment streak
		progress.streak += 1;
	} else if (lastDate) {
		// Broke streak
		progress.streak = 1;
	} else {
		// First day
		progress.streak = 1;
	}
	
	progress.lastPracticeDate = new Date().toISOString();

	// Check for level up
	const nextLevelXP = getExperienceForLevel(progress.level + 1);
	
	if (progress.experience >= nextLevelXP) {
		progress.level += 1;
		// Could trigger level up celebration here
	}

	saveProgressData(progress);

	return {
		levelUp: progress.experience >= nextLevelXP,
		newLevel: progress.level,
		pointsEarned: correct ? points : 0,
		streak: progress.streak,
	};
}

/**
 * Get mastery level for a specific rule
 * @param {string} ruleId - The grammar rule ID
 * @returns {number} Mastery level (1-4)
 */
export function getRuleMastery(ruleId) {
	const progress = getProgressData();
	const ruleMastery = progress.rulesMastery[ruleId];
	
	if (!ruleMastery) {
		return 1; // Beginner level for new rules
	}

	return ruleMastery.level || 1;
}

/**
 * Get rules the user struggles with (for focused practice)
 * @param {number} limit - Maximum number of rules to return
 * @returns {Array} Array of rule IDs where user needs improvement
 */
export function getWeakRules(limit = 5) {
	const progress = getProgressData();
	const rules = Object.entries(progress.rulesMastery || {});

	// Filter rules with low accuracy and sort by attempts (prioritize practiced rules)
	const weakRules = rules
		.filter(([, data]) => {
			const accuracy = data.attempts > 0 ? data.correct / data.attempts : 0;
			return accuracy < 0.7 && data.attempts >= 2;
		})
		.sort((a, b) => {
			// Sort by accuracy (ascending) then by attempts (descending)
			const accA = a[1].correct / a[1].attempts;
			const accB = b[1].correct / b[1].attempts;
			if (Math.abs(accA - accB) > 0.1) {
				return accA - accB;
			}
			return b[1].attempts - a[1].attempts;
		})
		.slice(0, limit)
		.map(([ruleId]) => ruleId);

	return weakRules;
}

/**
 * Get rules the user has mastered
 * @returns {Array} Array of rule IDs with high mastery
 */
export function getMasteredRules() {
	const progress = getProgressData();
	const rules = Object.entries(progress.rulesMastery || {});

	return rules
		.filter(([, data]) => {
			const accuracy = data.attempts > 0 ? data.correct / data.attempts : 0;
			return accuracy >= 0.85 && data.attempts >= 5;
		})
		.map(([ruleId]) => ruleId);
}

/**
 * Get performance stats for a specific rule
 * @param {string} ruleId - The grammar rule ID
 * @returns {Object} Performance statistics
 */
export function getRulePerformance(ruleId) {
	const progress = getProgressData();
	const ruleMastery = progress.rulesMastery[ruleId];

	if (!ruleMastery || ruleMastery.attempts === 0) {
		return {
			attempts: 0,
			correct: 0,
			accuracy: 0,
			level: 1,
			lastPracticed: null,
			totalPoints: 0,
			status: 'new',
		};
	}

	const accuracy = ruleMastery.correct / ruleMastery.attempts;
	let status = 'learning';
	
	if (accuracy >= 0.9 && ruleMastery.attempts >= 5) {
		status = 'mastered';
	} else if (accuracy >= 0.7) {
		status = 'progressing';
	} else if (accuracy < 0.5) {
		status = 'struggling';
	}

	return {
		attempts: ruleMastery.attempts,
		correct: ruleMastery.correct,
		accuracy: Math.round(accuracy * 100),
		level: ruleMastery.level,
		lastPracticed: ruleMastery.lastPracticed,
		totalPoints: ruleMastery.totalPoints,
		status,
	};
}

/**
 * Get overall learning progress summary
 * @returns {Object} Comprehensive progress summary
 */
export function getProgressSummary() {
	const progress = getProgressData();
	const stats = getUserStats();
	const masteredRules = getMasteredRules();
	const weakRules = getWeakRules();

	// Calculate category performance
	const categoryPerformance = {};
	Object.entries(progress.rulesMastery || {}).forEach(([, data]) => {
		// Note: We'd need to load the rule to get its category
		// For now, simplified version
		if (!categoryPerformance.overall) {
			categoryPerformance.overall = { correct: 0, total: 0 };
		}
		categoryPerformance.overall.correct += data.correct;
		categoryPerformance.overall.total += data.attempts;
	});

	return {
		stats,
		masteredRulesCount: masteredRules.length,
		strugglingRulesCount: weakRules.length,
		categoryPerformance,
		recentActivity: getRecentActivity(),
		recommendations: getRecommendations(),
	};
}

/**
 * Get recent learning activity
 * @returns {Array} Recent practice sessions
 */
function getRecentActivity() {
	const progress = getProgressData();
	const rules = Object.entries(progress.rulesMastery || {});

	return rules
		.filter(([, data]) => data.lastPracticed)
		.sort((a, b) => new Date(b[1].lastPracticed) - new Date(a[1].lastPracticed))
		.slice(0, 10)
		.map(([ruleId, data]) => ({
			ruleId,
			lastPracticed: data.lastPracticed,
			accuracy: data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0,
			attempts: data.attempts,
		}));
}

/**
 * Get personalized learning recommendations
 * @returns {Array} Array of recommendation objects
 */
function getRecommendations() {
	const weakRules = getWeakRules(3);
	const masteredRules = getMasteredRules();
	const stats = getUserStats();

	const recommendations = [];

	if (weakRules.length > 0) {
		recommendations.push({
			type: 'focus',
			priority: 'high',
			message: `Focus on improving ${weakRules.length} challenging rule${weakRules.length > 1 ? 's' : ''}`,
			action: 'review-weak-rules',
			data: weakRules,
		});
	}

	if (stats.streak >= 7) {
		recommendations.push({
			type: 'achievement',
			priority: 'medium',
			message: `Amazing! You've maintained a ${stats.streak}-day streak!`,
			action: 'celebrate',
		});
	} else if (stats.streak === 0) {
		recommendations.push({
			type: 'motivation',
			priority: 'medium',
			message: 'Start a new learning streak today!',
			action: 'practice-daily',
		});
	}

	if (masteredRules.length >= 5) {
		recommendations.push({
			type: 'progression',
			priority: 'medium',
			message: `You've mastered ${masteredRules.length} rules! Try advanced exercises.`,
			action: 'increase-difficulty',
		});
	}

	if (stats.totalQuizzes >= 20 && stats.accuracy < 60) {
		recommendations.push({
			type: 'strategy',
			priority: 'high',
			message: 'Consider reviewing grammar explanations before practicing',
			action: 'review-fundamentals',
		});
	}

	return recommendations;
}

/**
 * Reset progress (for testing or user request)
 */
export function resetProgress() {
	localStorage.removeItem(STORAGE_KEYS.PROGRESS);
	return getProgressData();
}

/**
 * Export progress data (for backup)
 */
export function exportProgress() {
	return getProgressData();
}

/**
 * Import progress data (from backup)
 */
export function importProgress(data) {
	saveProgressData(data);
}

export default {
	getUserStats,
	recordAttempt,
	getRuleMastery,
	getWeakRules,
	getMasteredRules,
	getRulePerformance,
	getProgressSummary,
	resetProgress,
	exportProgress,
	importProgress,
};
