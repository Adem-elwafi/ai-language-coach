// components/JournalEntry.jsx
import React, { useState } from 'react';

const JournalEntry = () => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    console.log('Text submitted:', text);
    // We'll implement AI analysis later
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Write about your day:
          </h2>
          <p className="text-gray-600 mb-4">
            Describe your day, thoughts, or experiences in French. The AI will analyze and correct your writing.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your journal entry (in French):
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aujourd'hui, je suis allé au marché et j'ai acheté des pommes..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{text.length} characters</span>
            <span>Min. 50 characters recommended</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              !text.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </span>
            ) : (
              'Analyze & Correct'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntry;