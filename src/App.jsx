import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import JournalEntry from './components/JournalEntry.jsx';
import LearningDashboard from './components/LearningDashboard';

function App() {
  const [activeView, setActiveView] = useState('journal');
  const [hasEnteredJournal, setHasEnteredJournal] = useState(false);

  // Placeholder views for sidebar items
  const renderActiveView = () => {
    switch (activeView) {
      case 'journal':
        return (
          <div className="space-y-8">
            <JournalEntry onJournalSubmit={() => setHasEnteredJournal(true)} />
            
          </div>
        );
      case 'dashboard':
        return <LearningDashboard />;
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
              </h2>
              <p className="text-gray-600">
                This feature is coming soon! Clicking "{activeView}" in the sidebar will work in the next update.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Currently viewing: <strong>Journal Entry</strong> mode
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">AI Journal Language Coach</h1>
                <p className="text-lg text-gray-600 mt-2">
                  Write your daily journal in French and get instant corrections!
                </p>
              </div>
            </div>
          </header>
          
          <main>
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;