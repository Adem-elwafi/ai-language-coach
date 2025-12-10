import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import JournalEntry from './components/JournalEntry.jsx';
import History from './components/History.jsx';
import LearningDashboard from './components/LearningDashboard';
import Settings from './components/Settings';

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
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                This feature is coming soon! Clicking "{activeView}" in the sidebar will work in the next update.
              </p>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Currently viewing: <strong>Journal Entry</strong> mode
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex">
        {/* Sidebar */}
        <Sidebar onNavigate={setActiveView} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <header className="h-[72px] dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-6 py-3 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span>📝</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Journal Language Coach</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
    </ThemeProvider>
  );
}

export default App;