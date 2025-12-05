import React, { useMemo, useState } from 'react';

/**
 * Shows original vs corrected text with simple diff highlights and lets users
 * accept/reject individual corrections derived from the analysis errors.
 */
const CorrectionDisplay = ({ originalText = '', correctedText = '', errors = [] }) => {
	const [decisions, setDecisions] = useState({});

	const diffTokens = useMemo(() => {
		const originalWords = (originalText || '').split(/(\s+)/);
		const correctedWords = (correctedText || '').split(/(\s+)/);
		const max = Math.max(originalWords.length, correctedWords.length);
		const tokens = [];
		for (let i = 0; i < max; i++) {
			const o = originalWords[i] || '';
			const c = correctedWords[i] || '';
			const changed = o !== c;
			tokens.push({ original: o, corrected: c, changed });
		}
		return tokens;
	}, [originalText, correctedText]);

	const handleDecision = (issue, value) => {
		setDecisions((prev) => ({ ...prev, [issue]: value }));
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-gray-800">Corrections</h3>
					<p className="text-gray-500 text-sm">Compare your original text with AI corrections.</p>
				</div>
			</div>

			{/* Side-by-side text */}
			<div className="grid md:grid-cols-2 gap-4">
				<div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
					<h4 className="text-sm font-semibold text-gray-700 mb-2">Original</h4>
					<p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{originalText || '—'}</p>
				</div>
				<div className="p-4 rounded-xl border border-green-200 bg-green-50">
					<h4 className="text-sm font-semibold text-gray-700 mb-2">Corrected</h4>
					<div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
						{diffTokens.map((tok, idx) => (
							<span
								key={idx}
								className={tok.changed ? 'bg-green-100 text-green-800 rounded-sm px-1' : ''}
							>
								{tok.corrected}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Individual corrections list */}
			<div className="space-y-3">
				<h4 className="text-sm font-semibold text-gray-700">Correction Details</h4>
				{errors.length === 0 && (
					<p className="text-sm text-gray-500">No specific issues were identified.</p>
				)}

				{errors.map((err, idx) => {
					const decision = decisions[err.issue];
					return (
						<div
							key={idx}
							className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 flex flex-col gap-3"
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-sm font-semibold text-yellow-900">Issue: {err.issue}</p>
									<p className="text-xs text-gray-600">Example: {err.example}</p>
								</div>
								<span className="text-xs text-yellow-700">#{err.index || idx + 1}</span>
							</div>

							<div className="text-sm text-green-800">
								✓ Suggestion: <span className="font-mono bg-green-100 px-2 py-1 rounded">{err.suggestion}</span>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => handleDecision(err.issue, 'accepted')}
									className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
										decision === 'accepted'
											? 'bg-green-600 text-white border-green-600'
											: 'bg-white text-green-700 border-green-300 hover:bg-green-50'
									}`}
									aria-pressed={decision === 'accepted'}
									aria-label={`Accept correction for ${err.issue}`}
								>
									Accept
								</button>
								<button
									type="button"
									onClick={() => handleDecision(err.issue, 'rejected')}
									className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
										decision === 'rejected'
											? 'bg-red-600 text-white border-red-600'
											: 'bg-white text-red-700 border-red-300 hover:bg-red-50'
									}`}
									aria-pressed={decision === 'rejected'}
									aria-label={`Reject correction for ${err.issue}`}
								>
									Reject
								</button>
								{decision && (
									<span className="text-xs text-gray-600">You {decision} this correction.</span>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CorrectionDisplay;
