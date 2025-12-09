/**
 * Local Storage History Manager
 * Handles saving, retrieving, and managing journal entry history
 */

const STORAGE_KEY = 'journalHistory';

/**
 * Save a journal entry to history
 */
export function saveToHistory(originalText, correctedText, analysis) {
  try {
    const entries = getHistory();
    const newEntry = {
      id: Date.now(),
      originalText,
      correctedText,
      analysis,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    entries.unshift(newEntry); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    console.log('Entry saved to history:', newEntry);
    return newEntry;
  } catch (error) {
    console.error('Error saving to history:', error);
    return null;
  }
}

/**
 * Get all history entries
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

/**
 * Get single entry by ID
 */
export function getHistoryEntry(id) {
  const entries = getHistory();
  return entries.find(entry => entry.id === id) || null;
}

/**
 * Delete entry from history
 */
export function deleteFromHistory(id) {
  try {
    const entries = getHistory();
    const filtered = entries.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('Entry deleted from history:', id);
    return true;
  } catch (error) {
    console.error('Error deleting from history:', error);
    return false;
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('History cleared');
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

/**
 * Search history by text or date
 */
export function searchHistory(query) {
  const entries = getHistory();
  const lowerQuery = query.toLowerCase();
  
  return entries.filter(entry => 
    entry.originalText.toLowerCase().includes(lowerQuery) ||
    entry.correctedText.toLowerCase().includes(lowerQuery) ||
    entry.date.toLowerCase().includes(lowerQuery) ||
    (entry.analysis?.summary && entry.analysis.summary.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter history by date range
 */
export function filterByDate(startDate, endDate) {
  const entries = getHistory();
  return entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get entries count
 */
export function getHistoryCount() {
  return getHistory().length;
}

export default {
  saveToHistory,
  getHistory,
  getHistoryEntry,
  deleteFromHistory,
  clearHistory,
  searchHistory,
  filterByDate,
  getHistoryCount
};
