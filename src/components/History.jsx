import React, { useState, useEffect } from 'react';
import { getHistory, deleteFromHistory, clearHistory, searchHistory } from '../utils/historyManager';
import { X, Trash2, Search } from 'lucide-react';

const History = ({ onSelectEntry }) => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, selectedDate]);

  const loadHistory = () => {
    const history = getHistory();
    setEntries(history);
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchQuery.trim()) {
      filtered = searchHistory(searchQuery);
    }

    if (selectedDate) {
      filtered = filtered.filter(entry => entry.date.includes(selectedDate));
    }

    setFilteredEntries(filtered);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this entry?')) {
      deleteFromHistory(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear ALL history? This cannot be undone.')) {
      clearHistory();
      loadHistory();
    }
  };

  const handleSelectEntry = (entry) => {
    onSelectEntry(entry);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow p-4 space-y-3">
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">📋 Journal History</h2>

        {/* Search Bar */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Clear All Button */}
        {entries.length > 0 && (
          <button
            onClick={handleClearAll}
            className="w-full mb-3 px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              {entries.length === 0 ? 'No entries yet' : 'No results found'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleSelectEntry(entry)}
              className="p-2 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-all border border-gray-200 hover:border-primary-300 group"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 mb-1">{entry.date}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 line-clamp-1 truncate">
                      <span className="font-semibold">Original:</span> {(entry.originalText || entry.text || '').substring(0, 60)}...
                    </p>
                    <p className="text-xs text-green-600 line-clamp-1 truncate">
                      <span className="font-semibold">Corrected:</span> {(entry.correctedText || '').substring(0, 60)}...
                    </p>
                  </div>
                  {entry.analysis?.summary && (
                    <p className="text-xs text-blue-600 mt-1 line-clamp-1">
                      ✓ Analyzed
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(entry.id, e)}
                  className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-all flex-shrink-0"
                  title="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
