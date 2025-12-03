// App.jsx
import JournalEntry from './components/JournalEntry.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800">AI Journal Language Coach</h1>
          </div>
          <p className="text-lg text-gray-600">
            Write your daily journal in French and get instant corrections!
          </p>
        </header>
        
        <main className="space-y-8">
          <JournalEntry />
        </main>
        
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
          <p>Write daily • Get corrected • Improve naturally</p>
        </footer>
      </div>
    </div>
  );
}

export default App;