import React, { useMemo, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';

/**
 * Tracks learner progress: category scores, streaks, achievements, and suggested paths.
 */
const ProgressTracker = ({
	stats = {
		entries: 0,
		streak: 0,
		categories: {
			grammar: 0,
			vocabulary: 0,
			fluency: 0,
		},
		achievements: [],
	},
}) => {
	const { currentAnalysis, userChoices, progress } = useAnalysis();
	const [activeCategory, setActiveCategory] = useState('grammar');
	const [showAchievements, setShowAchievements] = useState(true);

	// Calculate REAL scores based on actual data
	const scores = useMemo(() => {
		if (!currentAnalysis) {
			return { grammar: 0, vocabulary: 0, fluency: 0 };
		}

		// Grammar score: Based on error count and acceptance
		const totalErrors = currentAnalysis.errors?.length || 0;
		const acceptedCount = userChoices.acceptedCorrections.length;
		const grammarScore = Math.max(0, 100 - (totalErrors * 15) + (acceptedCount * 10));

		// Vocabulary score: Based on text complexity (simplified)
		const textLength = currentAnalysis.summary?.length || 0;
		const vocabScore = Math.min(Math.floor(textLength / 3), 100);

		// Fluency score: Based on acceptance rate and error severity
		const totalChoices =
			userChoices.acceptedCorrections.length + userChoices.rejectedCorrections.length;
		const fluencyScore =
			totalChoices > 0
				? Math.floor((userChoices.acceptedCorrections.length / totalChoices) * 100)
				: 50; // Default middle score

		return {
			grammar: Math.min(grammarScore, 100),
			vocabulary: Math.min(vocabScore, 100),
			fluency: Math.min(fluencyScore, 100),
		};
	}, [currentAnalysis, userChoices]);

	// Use actual streak from context
	const streak = progress.streak || 0;

	// Use actual total entries from context
	const totalEntries = progress.totalEntries || 0;

	const categoryList = useMemo(() => Object.keys(scores), [scores]);

	// Dynamic achievements based on actual progress
	const achievements = useMemo(
		() => [
			{
				id: 1,
				name: 'First Entry',
				unlocked: totalEntries >= 1,
				description: 'Submit your first journal entry',
			},
			{
				id: 2,
				name: 'Grammar Guru',
				unlocked: scores.grammar >= 80,
				description: 'Achieve 80% grammar score',
			},
			{
				id: 3,
				name: 'Vocabulary Master',
				unlocked: scores.vocabulary >= 85,
				description: 'Achieve 85% vocabulary score',
			},
			{
				id: 4,
				name: 'Consistent Learner',
				unlocked: streak >= 7,
				description: '7-day writing streak',
			},
			{
				id: 5,
				name: 'Error Hunter',
				unlocked: userChoices.acceptedCorrections.length >= 10,
				description: 'Accept 10 corrections',
			},
		],
		[totalEntries, scores, streak, userChoices]
	);

	// Personalized suggestions based on performance
	const suggestions = useMemo(() => {
		const baseSuggestions = [
			'Try writing about your weekend plans.',
			'Describe a memorable meal you had recently.',
			'Write about your favorite French city or region.',
			'Explain how you practice French outside of this app.',
			'Describe a recent movie or book you enjoyed.',
		];

		// Personalized suggestions based on weak areas
		const personalized = [];

		if (scores.grammar < 70) {
			personalized.push('Focus on reviewing verb conjugations in your next entry.');
		}

		if (scores.vocabulary < 70) {
			personalized.push('Try using 3 new vocabulary words in your next entry.');
		}

		if (currentAnalysis?.errors?.length > 2) {
			const commonError = currentAnalysis.errors[0]?.issue;
			personalized.push(
				`Pay attention to ${commonError?.toLowerCase() || 'common errors'} in your next entry.`
			);
		}

		return [...personalized, ...baseSuggestions].slice(0, 3);
	}, [scores, currentAnalysis]);

	const score = scores[activeCategory] ?? 0;

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-gray-800">Progress Tracker</h3>
					<p className="text-gray-500 text-sm">See how your writing improves over time.</p>
				</div>
			<div className="text-right text-sm text-gray-600">
				<p>Entries: <span className="font-semibold text-gray-800">{totalEntries}</span></p>
				<p>Streak: <span className="font-semibold text-primary-600">{streak} days</span></p>
			</div>
			</div>

			{/* Category selectors */}
			<div className="flex flex-wrap gap-2">
				{categoryList.map((cat) => (
					<button
						key={cat}
						type="button"
						onClick={() => setActiveCategory(cat)}
						className={`px-3 py-2 rounded-lg border text-sm capitalize transition ${
							activeCategory === cat
								? 'bg-primary-500 text-white border-primary-500'
								: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
						}`}
						aria-pressed={activeCategory === cat}
						aria-label={`Show progress for ${cat}`}
					>
						{cat}
					</button>
				))}
			</div>

			{/* Score bar */}
			<div className="space-y-2">
				<div className="flex justify-between text-sm text-gray-600">
					<span className="capitalize">{activeCategory}</span>
					<span className="font-semibold text-gray-800">{score}%</span>
				</div>
				<div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
					<div
						className="h-3 bg-primary-500 rounded-full transition-all"
						style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={score}
						role="progressbar"
					/>
				</div>
				<p className="text-xs text-gray-500">Score increases as you accept corrections and write daily.</p>
			</div>

			{/* Suggestions */}
			<div className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-2">
				<p className="text-sm font-semibold text-blue-900">Personalized path</p>
				<ul className="list-disc list-inside text-sm text-blue-900 space-y-1">
					{suggestions.map((s, idx) => (
						<li key={idx}>{s}</li>
					))}
				</ul>
			</div>

			{/* Achievements */}
			<div className="border border-gray-200 rounded-xl">
				<button
					type="button"
					className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm"
					onClick={() => setShowAchievements((v) => !v)}
					aria-expanded={showAchievements}
				>
					<span className="font-semibold text-gray-800">Achievements</span>
					<span className="text-xs text-gray-500">{showAchievements ? 'Hide' : 'Show'}</span>
				</button>
			{showAchievements && (
				<div className="p-4 space-y-2 bg-white">
					{achievements.map((ach) => (
						<div
							key={ach.id}
							className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
								ach.unlocked
									? 'bg-green-50 text-green-800'
									: 'bg-gray-50 text-gray-500 opacity-60'
							}`}
							title={ach.description}
						>
							<span
								className={`w-3 h-3 rounded-full ${
									ach.unlocked ? 'bg-green-500' : 'bg-gray-300'
								}`}
								aria-hidden="true"
							/>
							<span className="font-medium">{ach.name}</span>
							{ach.unlocked && <span className="ml-auto text-xs">✓</span>}
						</div>
					))}
					{achievements.filter((a) => a.unlocked).length === 0 && (
						<p className="text-sm text-gray-500">No achievements yet — submit your first entry!</p>
					)}
				</div>
			)}
			</div>
		</div>
	);
};

export default ProgressTracker;
