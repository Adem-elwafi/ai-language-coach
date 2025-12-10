import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Moon, RefreshCw, Sun } from 'lucide-react';
import { cn } from '../utils/cn';
import { resetProgress } from '../utils/learningTracker';
import { useTheme } from '../context/ThemeContext';

const PREFERENCES_KEY = 'ai-language-coach-preferences';

const defaultPreferences = {
  language: 'french',
  difficulty: 'beginner',
  notifications: true,
};

const Switch = ({ enabled, onToggle, label }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800',
      enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
    )}
    aria-label={label}
    aria-pressed={enabled}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
        enabled ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);

const Settings = () => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [statusMessage, setStatusMessage] = useState('');
  const { isDark, toggleDarkMode } = useTheme();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...defaultPreferences, ...parsed };
        setPreferences(merged);
      } else {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPreferences));
      }
    } catch (error) {
      console.error('Failed to load preferences', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences', error);
    }
  }, [preferences]);

  const applyTheme = (isDark) => {
    toggleDarkMode(isDark);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetProgress = () => {
    const confirmed = window.confirm('Reset learning progress? This clears local progress data.');
    if (!confirmed) return;

    resetProgress();
    setStatusMessage('Progress reset. Fresh start!');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const mutedText = 'text-gray-600 dark:text-gray-400';
  const sectionTitle = 'text-sm font-semibold text-gray-900 dark:text-white';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className={`text-sm ${mutedText}`}>
            Personalize your AI coach experience and save preferences locally.
          </p>
        </div>
        {statusMessage && (
          <span className="rounded-full bg-primary-50 dark:bg-primary-900 px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-200">
            {statusMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className={sectionTitle}>Language preference</p>
              <p className={`text-xs ${mutedText}`}>
                Choose the UI language you prefer.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePreferenceChange('language', 'french')}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                preferences.language === 'french'
                  ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              French (FR)
            </button>
            <button
              type="button"
              onClick={() => handlePreferenceChange('language', 'english')}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                preferences.language === 'english'
                  ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              English (EN)
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className={sectionTitle}>Difficulty level</p>
              <p className={`text-xs ${mutedText}`}>
                Tune feedback depth to your level.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'beginner', label: 'Beginner' },
              { id: 'intermediate', label: 'Intermediate' },
              { id: 'advanced', label: 'Advanced' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePreferenceChange('difficulty', option.id)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition',
                  preferences.difficulty === option.id
                    ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className={sectionTitle}>Dark / Light mode</p>
              <p className={`text-xs ${mutedText}`}>
                Toggle the interface theme preference.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
              <Switch
                enabled={isDark}
                onToggle={() => applyTheme(!isDark)}
                label="Dark mode toggle"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className={sectionTitle}>Notifications</p>
              <p className={`text-xs ${mutedText}`}>
                Get helpful nudges and reminders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {preferences.notifications ? <Bell size={18} /> : <BellOff size={18} />}
              <Switch
                enabled={preferences.notifications}
                onToggle={() => togglePreference('notifications')}
                label="Notifications toggle"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 bg-white dark:bg-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={sectionTitle}>Reset progress</p>
            <p className={`text-xs ${mutedText}`}>
              Clears local learning progress. History and preferences stay intact.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetProgress}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-200 transition hover:bg-red-100 dark:hover:bg-red-800"
          >
            <RefreshCw size={16} />
            Reset progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
