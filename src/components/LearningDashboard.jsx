import React, { useState, useMemo } from 'react';
import { getUserStats, getProgressSummary } from '../utils/learningTracker.js';

/**
 * Gamification Dashboard Component
 * Displays achievements, badges, streaks, and motivational elements
 */
const LearningDashboard = ({ compact = false }) => {
	const [showDetails, setShowDetails] = useState(false);

	// Compute stats on each render (they come from localStorage, so it's fast)
	const stats = useMemo(() => getUserStats(), []);
	const summary = useMemo(() => getProgressSummary(), []);

	if (!stats) return null;

	const badges = getBadges(stats, summary);
	const level = stats.level;
	const xpProgress = stats.experienceToNextLevel > 0 
		? (stats.experience / stats.experienceToNextLevel) * 100 
		: 0;

	if (compact) {
		return (
			<div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold">
							{level}
						</div>
						<div>
							<p className="text-sm font-semibold">Level {level} Learner</p>
							<p className="text-xs opacity-90">{stats.totalCorrect} correct answers</p>
						</div>
					</div>
					<div className="flex gap-2">
						<div className="text-center bg-white/20 backdrop-blur rounded-lg px-3 py-2">
							<div className="text-xl font-bold">{stats.accuracy}%</div>
							<div className="text-xs opacity-75">Accuracy</div>
						</div>
						<div className="text-center bg-white/20 backdrop-blur rounded-lg px-3 py-2">
							<div className="text-xl font-bold">{stats.streak}</div>
							<div className="text-xs opacity-75">🔥 Streak</div>
						</div>
					</div>
				</div>
				
				{/* XP Progress Bar */}
				<div className="mt-3">
					<div className="flex justify-between text-xs mb-1">
						<span>XP: {stats.experience}</span>
						<span>Next: {stats.experienceToNextLevel}</span>
					</div>
					<div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
						<div 
							className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 transition-all duration-500"
							style={{ width: `${Math.min(100, xpProgress)}%` }}
						></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-gray-800">Your Learning Progress</h3>
					<p className="text-gray-500 text-sm">Track your achievements and growth</p>
				</div>
				<button
					onClick={() => setShowDetails(!showDetails)}
					className="text-sm text-primary-600 hover:text-primary-700 font-medium"
				>
					{showDetails ? 'Hide Details' : 'Show Details'}
				</button>
			</div>

			{/* Main Stats */}
			<div className="grid grid-cols-4 gap-4">
				<StatCard
					icon="🎯"
					label="Level"
					value={level}
					subtext={`${Math.round(xpProgress)}% to next`}
					color="blue"
				/>
				<StatCard
					icon="✅"
					label="Accuracy"
					value={`${stats.accuracy}%`}
					subtext={`${stats.totalCorrect}/${stats.totalQuizzes}`}
					color="green"
				/>
				<StatCard
					icon="🔥"
					label="Streak"
					value={stats.streak}
					subtext={stats.streak > 0 ? 'days' : 'Start today!'}
					color="orange"
				/>
				<StatCard
					icon="⭐"
					label="Mastered"
					value={summary?.masteredRulesCount || 0}
					subtext="grammar rules"
					color="purple"
				/>
			</div>

			{/* XP Progress */}
			<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-semibold text-gray-800">
						Level {level} Progress
					</span>
					<span className="text-xs text-gray-600">
						{stats.experience} / {stats.experienceToNextLevel} XP
					</span>
				</div>
				<div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
					<div 
						className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 relative"
						style={{ width: `${Math.min(100, xpProgress)}%` }}
					>
						<div className="absolute inset-0 animate-pulse bg-white/30"></div>
					</div>
				</div>
			</div>

			{/* Badges */}
			<div>
				<h4 className="text-sm font-semibold text-gray-800 mb-3">🏆 Achievements</h4>
				<div className="grid grid-cols-5 gap-3">
					{badges.map((badge, idx) => (
						<BadgeCard key={idx} badge={badge} />
					))}
				</div>
			</div>

			{/* Detailed Stats */}
			{showDetails && summary && (
				<div className="space-y-4 pt-4 border-t border-gray-200">
					{/* Recommendations */}
					{summary.recommendations && summary.recommendations.length > 0 && (
						<div>
							<h4 className="text-sm font-semibold text-gray-800 mb-2">💡 Recommendations</h4>
							<div className="space-y-2">
								{summary.recommendations.map((rec, idx) => (
									<div 
										key={idx}
										className={`p-3 rounded-lg border text-sm ${
											rec.priority === 'high' 
												? 'bg-red-50 border-red-200 text-red-800' 
												: 'bg-blue-50 border-blue-200 text-blue-800'
										}`}
									>
										{rec.message}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Recent Activity */}
					{summary.recentActivity && summary.recentActivity.length > 0 && (
						<div>
							<h4 className="text-sm font-semibold text-gray-800 mb-2">📅 Recent Activity</h4>
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{summary.recentActivity.slice(0, 5).map((activity, idx) => (
									<div 
										key={idx}
										className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs"
									>
										<span className="text-gray-700 font-mono">{activity.ruleId}</span>
										<div className="flex items-center gap-3">
											<span className="text-gray-600">{activity.attempts} attempts</span>
											<span className={`font-semibold ${
												activity.accuracy >= 80 ? 'text-green-600' :
												activity.accuracy >= 60 ? 'text-blue-600' :
												'text-red-600'
											}`}>
												{activity.accuracy}%
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

/**
 * Individual stat card component
 */
const StatCard = ({ icon, label, value, subtext, color = 'blue' }) => {
	const colorClasses = {
		blue: 'from-blue-50 to-blue-100 border-blue-200',
		green: 'from-green-50 to-green-100 border-green-200',
		orange: 'from-orange-50 to-orange-100 border-orange-200',
		purple: 'from-purple-50 to-purple-100 border-purple-200',
	};

	return (
		<div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border text-center`}>
			<div className="text-2xl mb-1">{icon}</div>
			<div className="text-2xl font-bold text-gray-800">{value}</div>
			<div className="text-xs text-gray-600 mt-1">{label}</div>
			{subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
		</div>
	);
};

/**
 * Badge card component
 */
const BadgeCard = ({ badge }) => {
	return (
		<div 
			className={`relative rounded-xl p-3 text-center transition-all hover:scale-105 ${
				badge.unlocked 
					? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-lg' 
					: 'bg-gray-100 border border-gray-300 opacity-50 grayscale'
			}`}
			title={badge.description}
		>
			<div className="text-3xl mb-1">{badge.icon}</div>
			<div className="text-xs font-semibold text-gray-800">{badge.name}</div>
			{badge.unlocked && (
				<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
					<span className="text-white text-xs">✓</span>
				</div>
			)}
		</div>
	);
};

/**
 * Generate badges based on user progress
 */
function getBadges(stats, summary) {
	return [
		{
			id: 'first-steps',
			name: 'First Steps',
			icon: '👶',
			description: 'Completed your first quiz',
			unlocked: stats.totalQuizzes >= 1,
		},
		{
			id: 'quick-learner',
			name: 'Quick Learner',
			icon: '🚀',
			description: 'Completed 10 quizzes',
			unlocked: stats.totalQuizzes >= 10,
		},
		{
			id: 'accuracy-ace',
			name: 'Accuracy Ace',
			icon: '🎯',
			description: 'Achieved 80%+ accuracy',
			unlocked: stats.accuracy >= 80 && stats.totalQuizzes >= 10,
		},
		{
			id: 'streak-master',
			name: 'Streak Master',
			icon: '🔥',
			description: 'Maintained a 7-day streak',
			unlocked: stats.streak >= 7,
		},
		{
			id: 'grammar-guru',
			name: 'Grammar Guru',
			icon: '⭐',
			description: 'Mastered 5+ grammar rules',
			unlocked: summary?.masteredRulesCount >= 5,
		},
		{
			id: 'dedicated-student',
			name: 'Dedicated Student',
			icon: '📚',
			description: 'Completed 50 quizzes',
			unlocked: stats.totalQuizzes >= 50,
		},
		{
			id: 'level-up',
			name: 'Level Up',
			icon: '⬆️',
			description: 'Reached Level 5',
			unlocked: stats.level >= 5,
		},
		{
			id: 'perfectionist',
			name: 'Perfectionist',
			icon: '💯',
			description: 'Got 10 questions in a row correct',
			unlocked: false, // Would need streak tracking
		},
		{
			id: 'month-warrior',
			name: 'Month Warrior',
			icon: '📅',
			description: 'Maintained a 30-day streak',
			unlocked: stats.streak >= 30,
		},
		{
			id: 'master',
			name: 'French Master',
			icon: '🏆',
			description: 'Mastered 10+ grammar rules',
			unlocked: summary?.masteredRulesCount >= 10,
		},
	];
}

export default LearningDashboard;
