import React, { useMemo, useState } from 'react';

/**
 * Provides grammar explanations, visual hints, and a tiny quiz for the errors returned by analysis.
 */
const ExplanationPanel = ({ errors = [], tip = '' }) => {
	const [openIndex, setOpenIndex] = useState(0);
	const [quizState, setQuizState] = useState({});

	const enriched = useMemo(() => {
		if (!errors || errors.length === 0) {
			return [
				{
					title: 'No issues detected',
					rule: 'Great job! Keep practicing consistent tense and article usage.',
					example: 'Je suis allé au marché hier. (past simple with article)',
					fix: 'Use past tense for completed actions; add articles for nouns.',
					diagram: 'Sujet → Verbe (passé) → Objet',
					quiz: {
						question: "Choose the correct past form: 'Elle __ à l'école hier.'",
						options: ['va', 'est allée', 'irai'],
						answer: 'est allée',
					},
				},
			];
		}

		return errors.map((err, idx) => ({
			title: err.issue || `Issue ${idx + 1}`,
			rule: `Focus on: ${err.issue || 'Grammar precision'}`,
			example: err.example || 'N/A',
			fix: err.suggestion || 'Review standard usage.',
			diagram: 'Sujet → Verbe → Complément (accordés)',
			quiz: {
				question: `Which option fixes: "${err.example || '...'}"?`,
				options: [err.example || 'Option A', err.suggestion || 'Option B', 'Les deux sont correctes'],
				answer: err.suggestion || '',
			},
		}));
	}, [errors]);

	const handleQuiz = (key, option) => {
		setQuizState((prev) => ({ ...prev, [key]: option }));
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 border border-gray-100">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-gray-800">Grammar Explanations</h3>
					<p className="text-gray-500 text-sm">Dive deeper into the issues the AI found.</p>
				</div>
			</div>

			{tip && (
				<div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-900">
					💡 Tip: {tip}
				</div>
			)}

			<div className="space-y-3">
				{enriched.map((item, idx) => {
					const isOpen = openIndex === idx;
					const quizKey = `${idx}-quiz`;
					const selected = quizState[quizKey];
					const isCorrect = selected && selected === item.quiz.answer;

					return (
						<div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
							<button
								type="button"
								className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
								onClick={() => setOpenIndex(isOpen ? -1 : idx)}
								aria-expanded={isOpen}
							>
								<span className="text-sm font-semibold text-gray-800">{item.title}</span>
								<span className="text-xs text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
							</button>

							{isOpen && (
								<div className="p-4 space-y-3 bg-white">
									<div className="text-sm text-gray-700">
										<p className="font-semibold text-gray-800 mb-1">Rule</p>
										<p>{item.rule}</p>
									</div>

									<div className="text-sm text-gray-700">
										<p className="font-semibold text-gray-800 mb-1">Example</p>
										<p className="font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 inline-block">{item.example}</p>
									</div>

									<div className="text-sm text-green-800">
										<p className="font-semibold text-gray-800 mb-1">Suggested Fix</p>
										<p className="font-mono bg-green-50 border border-green-200 rounded px-2 py-1 inline-block">{item.fix}</p>
									</div>

									{/* Simple sentence diagram placeholder */}
									<div className="text-sm text-gray-700">
										<p className="font-semibold text-gray-800 mb-1">Sentence Diagram</p>
										<div className="flex items-center gap-2 text-xs text-gray-600">
											<span className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200">Sujet</span>
											<span className="px-2 py-1 rounded-lg bg-green-50 border border-green-200">Verbe</span>
											<span className="px-2 py-1 rounded-lg bg-yellow-50 border border-yellow-200">Complément</span>
										</div>
										<p className="text-xs text-gray-500 mt-1">{item.diagram}</p>
									</div>

									{/* Interactive quiz */}
									<div className="text-sm text-gray-700 space-y-2">
										<p className="font-semibold text-gray-800">Quick Check</p>
										<p className="text-gray-600">{item.quiz.question}</p>
										<div className="flex flex-wrap gap-2">
											{item.quiz.options.map((opt, oIdx) => (
												<button
													key={oIdx}
													type="button"
													onClick={() => handleQuiz(quizKey, opt)}
													className={`px-3 py-2 rounded-lg border text-xs transition ${
														selected === opt
															? 'bg-primary-500 text-white border-primary-500'
															: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
													}`}
													aria-pressed={selected === opt}
													aria-label={`Select answer ${opt}`}
												>
													{opt}
												</button>
											))}
										</div>
										{selected && (
											<div
												className={`text-xs font-semibold ${
													isCorrect ? 'text-green-700' : 'text-red-700'
												}`}
											>
												{isCorrect ? 'Correct!' : 'Try again.'}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ExplanationPanel;
