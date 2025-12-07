import React, { useMemo, useState, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { analyzeErrors } from '../utils/errorDetector.js';
import { generateProgressiveQuiz, validateAnswer, generateHint, QuestionTypes } from '../utils/quizGenerator.js';
import { recordAttempt, getRuleMastery, getUserStats, getRulePerformance } from '../utils/learningTracker.js';

/**
 * Enhanced ExplanationPanel with genuine educational value
 * - Multi-level question types (recognition, understanding, application, creation)
 * - Progressive difficulty based on user mastery
 * - Intelligent quiz generation without showing answers
 * - Adaptive learning with performance tracking
 */
const ExplanationPanel = ({ errors = [], tip = '' }) => {
	const { currentAnalysis, userChoices, trackQuizAnswer } = useAnalysis();
	const [openIndex, setOpenIndex] = useState(0);
	const [quizAnswers, setQuizAnswers] = useState({});
	const [showHints, setShowHints] = useState({});
	const [feedback, setFeedback] = useState({});
	const [userStats, setUserStats] = useState(null);
	const [showCelebration, setShowCelebration] = useState(false);

	// Use real errors from context if available, fallback to props
	const analysisErrors = currentAnalysis?.errors || errors;

	// Analyze errors and enrich with grammar rules
	const enrichedErrors = useMemo(() => {
		if (!analysisErrors || analysisErrors.length === 0) {
			return [];
		}
		return analyzeErrors(analysisErrors);
	}, [analysisErrors]);

	// Generate educational quizzes
	const quizData = useMemo(() => {
		if (enrichedErrors.length === 0) {
			return [];
		}

		return enrichedErrors.map((error) => {
			const mastery = getRuleMastery(error.detectedType || 'unknown');
			const quizzes = generateProgressiveQuiz(error, mastery);
			const performance = getRulePerformance(error.detectedType || 'unknown');
			
			return {
				error,
				quizzes,
				performance,
				mastery,
			};
		});
	}, [enrichedErrors]);

	// Load user stats and initialize quiz answers from context
	useEffect(() => {
		setUserStats(getUserStats());
		
		// Initialize quiz answers from context if they exist
		if (userChoices.quizAnswers && Object.keys(userChoices.quizAnswers).length > 0) {
			// Map context quiz answers to component format
			const contextAnswers = {};
			Object.entries(userChoices.quizAnswers).forEach(([ruleId, isCorrect]) => {
				contextAnswers[ruleId] = isCorrect;
			});
			setQuizAnswers(prev => ({ ...prev, ...contextAnswers }));
		}
	}, [userChoices.quizAnswers]);

	const handleAnswerSelect = (errorIndex, quizIndex, answer) => {
		const key = `${errorIndex}-${quizIndex}`;
		setQuizAnswers((prev) => ({ ...prev, [key]: answer }));
		
		// Clear previous feedback
		setFeedback((prev) => ({ ...prev, [key]: null }));
	};

	const handleSubmitAnswer = (errorIndex, quizIndex) => {
		const key = `${errorIndex}-${quizIndex}`;
		const userAnswer = quizAnswers[key];
		const quiz = quizData[errorIndex]?.quizzes[quizIndex];

		if (!quiz || !userAnswer) return;

		const validation = validateAnswer(quiz, userAnswer);
		setFeedback((prev) => ({ ...prev, [key]: validation }));

		// Record attempt for learning tracker
		const ruleId = quizData[errorIndex].error.detectedType || 'unknown';
		const result = recordAttempt(ruleId, validation.correct, validation.points);

		// Track in shared context
		if (trackQuizAnswer) {
			trackQuizAnswer(ruleId, validation.correct);
		}

		// Update stats
		setUserStats(getUserStats());

		// Show celebration on level up
		if (result.levelUp) {
			setShowCelebration(true);
			setTimeout(() => setShowCelebration(false), 3000);
		}
	};

	const toggleHint = (errorIndex, quizIndex) => {
		const key = `${errorIndex}-${quizIndex}`;
		setShowHints((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	// Debug: Log when component receives real analysis data
	useEffect(() => {
		if (currentAnalysis && currentAnalysis.errors && currentAnalysis.errors.length > 0) {
			console.log('📚 ExplanationPanel using context data:', {
				totalErrors: currentAnalysis.errors.length,
				enrichedErrorsCount: enrichedErrors.length,
				quizDataCount: quizData.length,
				errors: currentAnalysis.errors.map(e => e.issue),
				userQuizAnswers: userChoices.quizAnswers
			});
		}
	}, [currentAnalysis, enrichedErrors, quizData, userChoices]);

	if (enrichedErrors.length === 0) {
		return (
			<div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 border border-gray-100">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-xl font-semibold text-gray-800">Grammar Explanations</h3>
						<p className="text-gray-500 text-sm">Great work! No errors detected.</p>
					</div>
				</div>
				<div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
					<div className="text-4xl mb-2">🎉</div>
					<p className="text-green-800 font-semibold">Perfect Grammar!</p>
					<p className="text-green-700 text-sm mt-1">Keep up the excellent work!</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 border border-gray-100">
			{/* Header with Stats */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-gray-800">Grammar Explanations & Practice</h3>
					<p className="text-gray-500 text-sm">Master French grammar through interactive learning</p>
				</div>
				{userStats && (
					<div className="flex items-center gap-4 text-sm">
						<div className="text-center">
							<div className="text-lg font-bold text-primary-600">Lvl {userStats.level}</div>
							<div className="text-xs text-gray-500">Level</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-green-600">{userStats.accuracy}%</div>
							<div className="text-xs text-gray-500">Accuracy</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-orange-600">{userStats.streak}</div>
							<div className="text-xs text-gray-500">Streak</div>
						</div>
					</div>
				)}
			</div>

			{/* Level Up Celebration */}
			{showCelebration && (
				<div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-center animate-bounce">
					<div className="text-3xl mb-2">🎊 Level Up! 🎊</div>
					<p className="text-white font-bold text-lg">You've reached Level {userStats?.level}!</p>
				</div>
			)}

			{tip && (
				<div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-900">
					💡 Tip: {tip}
				</div>
			)}

			{/* Error Explanations with Quizzes */}
			<div className="space-y-4">
				{quizData.map((item, errorIdx) => {
					const { error, quizzes, performance, mastery } = item;
					const isOpen = openIndex === errorIdx;
					const rule = error.grammarRule;

					return (
						<div key={errorIdx} className="border border-gray-200 rounded-xl overflow-hidden">
							{/* Error Header */}
							<button
								type="button"
								className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition"
								onClick={() => setOpenIndex(isOpen ? -1 : errorIdx)}
								aria-expanded={isOpen}
							>
								<div className="flex items-center gap-3">
									<span className="text-sm font-semibold text-gray-800">
										{error.issue || `Grammar Point ${errorIdx + 1}`}
									</span>
									{performance.status && (
										<span className={`text-xs px-2 py-1 rounded-full ${
											performance.status === 'mastered' ? 'bg-green-100 text-green-700' :
											performance.status === 'progressing' ? 'bg-blue-100 text-blue-700' :
											performance.status === 'struggling' ? 'bg-red-100 text-red-700' :
											'bg-gray-100 text-gray-700'
										}`}>
											{performance.status === 'mastered' ? '⭐ Mastered' :
											 performance.status === 'progressing' ? '📈 Progressing' :
											 performance.status === 'struggling' ? '💪 Practice More' :
											 '🆕 New'}
										</span>
									)}
								</div>
								<span className="text-xs text-gray-500">{isOpen ? '▲ Hide' : '▼ Show'}</span>
							</button>

							{isOpen && (
								<div className="p-5 space-y-5 bg-white">
									{/* Grammar Rule Section */}
									{rule && (
										<div className="space-y-3">
											<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
												<h4 className="text-sm font-bold text-blue-900 mb-2">📚 Grammar Rule</h4>
												<p className="text-sm text-blue-800 font-semibold">{rule.rule}</p>
												<p className="text-sm text-gray-700 mt-2">{rule.explanation}</p>
											</div>

											{/* Error Example */}
											<div className="grid grid-cols-2 gap-3">
												<div className="bg-red-50 border border-red-200 rounded-lg p-3">
													<p className="text-xs font-semibold text-red-700 mb-1">❌ Incorrect</p>
													<p className="text-sm font-mono text-red-900">{error.example}</p>
												</div>
												<div className="bg-green-50 border border-green-200 rounded-lg p-3">
													<p className="text-xs font-semibold text-green-700 mb-1">✓ Correct</p>
													<p className="text-sm font-mono text-green-900">{error.suggestion}</p>
												</div>
											</div>

											{/* More Examples */}
											{rule.examples && rule.examples.length > 0 && (
												<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
													<p className="text-xs font-semibold text-gray-700 mb-2">📝 More Examples</p>
													<div className="space-y-2">
														{rule.examples.slice(0, 2).map((ex, idx) => (
															<div key={idx} className="text-xs">
																{ex.incorrect && (
																	<span className="text-red-600">❌ {ex.incorrect} → </span>
																)}
																<span className="text-green-600 font-semibold">✓ {ex.correct}</span>
																{ex.translation && (
																	<span className="text-gray-500 ml-2">({ex.translation})</span>
																)}
															</div>
														))}
													</div>
												</div>
											)}

											{/* Performance Stats */}
											{performance.attempts > 0 && (
												<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
													<p className="text-xs font-semibold text-purple-700 mb-2">📊 Your Performance</p>
													<div className="flex gap-4 text-xs">
														<span>Attempts: <strong>{performance.attempts}</strong></span>
														<span>Correct: <strong>{performance.correct}</strong></span>
														<span>Accuracy: <strong className={
															performance.accuracy >= 80 ? 'text-green-600' :
															performance.accuracy >= 60 ? 'text-blue-600' :
															'text-red-600'
														}>{performance.accuracy}%</strong></span>
														<span>Level: <strong>{mastery}/4</strong></span>
													</div>
												</div>
											)}
										</div>
									)}

									{/* Interactive Quizzes */}
									<div className="space-y-4">
										<h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
											<span>🎯</span>
											<span>Practice Exercises</span>
											<span className="text-xs font-normal text-gray-500">
												(Level {mastery}/4)
											</span>
										</h4>

										{quizzes.map((quiz, quizIdx) => {
											const quizKey = `${errorIdx}-${quizIdx}`;
											const userAnswer = quizAnswers[quizKey];
											const quizFeedback = feedback[quizKey];
											const showHint = showHints[quizKey];

											return (
												<div key={quizIdx} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 space-y-3">
													{/* Question Type Badge */}
													<div className="flex items-center justify-between">
														<span className="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-800 font-semibold">
															{quiz.type === QuestionTypes.ERROR_IDENTIFICATION ? '🔍 Error Identification' :
															 quiz.type === QuestionTypes.RULE_EXPLANATION ? '📖 Rule Understanding' :
															 quiz.type === QuestionTypes.APPLICATION ? '✏️ Application' :
															 quiz.type === QuestionTypes.FILL_IN_BLANK ? '📝 Fill in Blank' :
															 '❓ Quiz'}
														</span>
														<span className="text-xs text-gray-600">
															{quiz.points} points
														</span>
													</div>

													{/* Question */}
													<p className="text-sm font-semibold text-gray-800">{quiz.question}</p>

													{/* Translation/Context */}
													{quiz.translation && (
														<p className="text-xs text-gray-600 italic">
															Translation: {quiz.translation}
														</p>
													)}

													{/* Options */}
													{quiz.options && (
														<div className="space-y-2">
															{quiz.options.map((option, optIdx) => (
																<button
																	key={optIdx}
																	type="button"
																	onClick={() => handleAnswerSelect(errorIdx, quizIdx, option)}
																	disabled={quizFeedback !== null && quizFeedback !== undefined}
																	className={`w-full text-left px-4 py-3 rounded-lg border-2 transition text-sm ${
																		userAnswer === option
																			? quizFeedback?.correct
																				? 'bg-green-100 border-green-500 text-green-900'
																				: quizFeedback
																				? 'bg-red-100 border-red-500 text-red-900'
																				: 'bg-blue-100 border-blue-500 text-blue-900'
																			: quizFeedback && option === quiz.correctAnswer
																			? 'bg-green-50 border-green-300 text-green-800'
																			: 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
																	} ${quizFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
																>
																	<span className="font-mono">{option}</span>
																</button>
															))}
														</div>
													)}

													{/* Fill in blank input */}
													{quiz.type === QuestionTypes.FILL_IN_BLANK && !quiz.options && (
														<input
															type="text"
															value={userAnswer || ''}
															onChange={(e) => handleAnswerSelect(errorIdx, quizIdx, e.target.value)}
															disabled={quizFeedback !== null && quizFeedback !== undefined}
															placeholder="Type your answer..."
															className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														/>
													)}

													{/* Actions */}
													<div className="flex items-center gap-2">
														{!quizFeedback && (
															<>
																<button
																	type="button"
																	onClick={() => handleSubmitAnswer(errorIdx, quizIdx)}
																	disabled={!userAnswer}
																	className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
																>
																	Submit Answer
																</button>
																<button
																	type="button"
																	onClick={() => toggleHint(errorIdx, quizIdx)}
																	className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
																>
																	{showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
																</button>
															</>
														)}
													</div>

													{/* Hint */}
													{showHint && !quizFeedback && (
														<div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
															💡 <strong>Hint:</strong> {generateHint(quiz)}
														</div>
													)}

													{/* Feedback */}
													{quizFeedback && (
														<div className={`rounded-lg p-3 ${
															quizFeedback.correct
																? 'bg-green-100 border border-green-300'
																: 'bg-red-100 border border-red-300'
														}`}>
															<p className={`text-sm font-bold ${
																quizFeedback.correct ? 'text-green-800' : 'text-red-800'
															}`}>
																{quizFeedback.correct ? '✓ Correct! 🎉' : '✗ Not quite'}
															</p>
															<p className="text-xs text-gray-700 mt-1">{quizFeedback.feedback}</p>
															{quizFeedback.correct && quizFeedback.points > 0 && (
																<p className="text-xs text-green-700 mt-1 font-semibold">
																	+{quizFeedback.points} XP earned!
																</p>
															)}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Progress Summary Footer */}
			{userStats && (
				<div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold text-gray-800">Your Learning Journey</p>
							<p className="text-xs text-gray-600 mt-1">
								{userStats.totalCorrect} / {userStats.totalQuizzes} correct answers
							</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-gray-600">XP to next level</p>
							<div className="flex items-center gap-2 mt-1">
								<div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
									<div 
										className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
										style={{ 
											width: `${Math.min(100, (userStats.experience / userStats.experienceToNextLevel) * 100)}%` 
										}}
									></div>
								</div>
								<span className="text-xs font-semibold text-gray-700">
									{userStats.experience} / {userStats.experienceToNextLevel}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ExplanationPanel;
