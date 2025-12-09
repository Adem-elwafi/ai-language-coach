import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import JournalEntry from './components/JournalEntry.jsx';
import History from './components/History.jsx';
import LearningDashboard from './components/LearningDashboard';

function App() {
  const [activeView, setActiveView] = useState('journal');
  const [hasEnteredJournal, setHasEnteredJournal] = useState(false);
  const [loadedEntry, setLoadedEntry] = useState(null);

  const handleSelectHistoryEntry = (entry) => {
    setLoadedEntry(entry);
    setActiveView('journal');
  };

  // Placeholder views for sidebar items
  const renderActiveView = () => {
    switch (activeView) {
      case 'journal':
        return (
          <div className="space-y-3">
            <JournalEntry 
              onJournalSubmit={() => setHasEnteredJournal(true)}
              loadedEntry={loadedEntry}
            />
          </div>
        );
      case 'history':
        return (
          <div className="h-full">
            <History onSelectEntry={handleSelectHistoryEntry} />
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
    <div className="h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex">
      {/* Sidebar */}
      <Sidebar onNavigate={setActiveView} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span>📝</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI Journal Language Coach</h1>
              <p className="text-xs text-gray-500">
                Write in French and get instant corrections
              </p>
            </div>
          </div>
        </header>
        
        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-4 max-w-5xl">
            <main>
              {renderActiveView()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;