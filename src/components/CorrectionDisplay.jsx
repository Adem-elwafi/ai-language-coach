import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';

/**
 * Shows original vs corrected text side by side
 */
const CorrectionDisplay = ({ originalText = '', correctedText = '' }) => {
	const { currentAnalysis } = useAnalysis();

	// Use context data if available, fallback to props
	const origText = originalText;
	const corrText = currentAnalysis?.corrections || correctedText;

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
			<div>
				<h3 className="text-xl font-semibold text-gray-800">Corrections</h3>
				<p className="text-gray-500 text-sm">Compare your original text with AI corrections.</p>
			</div>

			{/* Side-by-side text */}
			<div className="grid md:grid-cols-2 gap-4">
				<div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
					<h4 className="text-sm font-semibold text-gray-700 mb-2">Original</h4>
					<p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{origText || '—'}</p>
				</div>
				<div className="p-4 rounded-xl border border-green-200 bg-green-50">
					<h4 className="text-sm font-semibold text-gray-700 mb-2">Corrected</h4>
					<p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{corrText || '—'}</p>
				</div>
			</div>
		</div>
	);
};

export default CorrectionDisplay;
