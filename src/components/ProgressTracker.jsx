import React, { useMemo, useState } from 'react';

/**
 * Tracks learner progress with mock data: category scores, streaks, achievements, and suggested paths.
 */
const ProgressTracker = ({
	stats = {
		entries: 5,
		streak: 3,
		categories: {
			grammar: 68,
			vocabulary: 74,
			fluency: 61,
		},
		achievements: ['Started journaling', '3-day streak', 'First correction accepted'],
	},
}) => {
	const [activeCategory, setActiveCategory] = useState('grammar');
	const [showAchievements, setShowAchievements] = useState(true);

	const categoryList = useMemo(() => Object.keys(stats.categories || {}), [stats.categories]);

	const suggestions = useMemo(() => {
		switch (activeCategory) {
			case 'grammar':
				return ['Review past tense forms', 'Practice article usage', 'Do 5 sentence rewrites'];
			case 'vocabulary':
				return ['Learn 10 food words', 'Create flashcards', 'Use 3 new adjectives today'];
			case 'fluency':
				return ['Read aloud for 5 minutes', 'Record a 1-minute summary', 'Shadow a native clip'];
			default:
				return ['Keep practicing daily!', 'Reflect on mistakes', 'Celebrate progress'];
		}
	}, [activeCategory]);

	const score = stats.categories?.[activeCategory] ?? 0;

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-gray-800">Progress Tracker</h3>
					<p className="text-gray-500 text-sm">See how your writing improves over time.</p>
				</div>
				<div className="text-right text-sm text-gray-600">
					<p>Entries: <span className="font-semibold text-gray-800">{stats.entries}</span></p>
					<p>Streak: <span className="font-semibold text-primary-600">{stats.streak} days</span></p>
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
						{(stats.achievements || []).map((ach, idx) => (
							<div
								key={idx}
								className="flex items-center gap-2 text-sm text-gray-700"
							>
								<span className="w-2 h-2 rounded-full bg-primary-500" aria-hidden="true" />
								<span>{ach}</span>
							</div>
						))}
						{(!stats.achievements || stats.achievements.length === 0) && (
							<p className="text-sm text-gray-500">No achievements yet — submit your first entry!</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ProgressTracker;
