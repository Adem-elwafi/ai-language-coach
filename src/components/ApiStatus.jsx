/**
 * API Status Component
 * Displays OpenAI API health, usage statistics, and configuration status
 */
import React, { useState } from 'react';
import { useOpenAI, useApiUsage } from '../hooks/useOpenAI';
import './ApiStatus.css';

const ApiStatus = ({ compact = false }) => {
  const { apiStatus, testConnection, clearCache } = useOpenAI();
  const { usage, resetUsage } = useApiUsage();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all cached responses?')) {
      clearCache();
    }
  };

  const handleResetUsage = () => {
    if (window.confirm('Reset usage statistics for today?')) {
      resetUsage();
    }
  };

  if (!apiStatus) {
    return (
      <div className="api-status loading">
        <span>Loading API status...</span>
      </div>
    );
  }

  // Compact view for embedding in other components
  if (compact) {
    return (
      <div className="api-status-compact">
        <div className="status-indicator">
          <span className={`status-dot ${apiStatus.status}`}></span>
          <span className="status-text">
            {apiStatus.useMock ? 'Mock Mode' : `${apiStatus.model}`}
          </span>
        </div>
        {usage && (
          <div className="usage-compact">
            <span>{usage.totalRequests} / {usage.maxRequests} requests</span>
            <span className="cost">{usage.costFormatted}</span>
          </div>
        )}
      </div>
    );
  }

  // Full status panel
  return (
    <div className="api-status-panel">
      <div className="status-header">
        <h3>API Status</h3>
        <div className="status-badge">
          <span className={`badge ${apiStatus.status}`}>
            {apiStatus.configured ? '✓ Configured' : '⚠ Not Configured'}
          </span>
        </div>
      </div>

      <div className="status-grid">
        {/* Configuration Status */}
        <div className="status-card">
          <h4>Configuration</h4>
          <div className="status-details">
            <div className="detail-row">
              <span className="label">Mode:</span>
              <span className="value">
                {apiStatus.useMock ? (
                  <span className="mock-badge">🔧 Mock</span>
                ) : (
                  <span className="live-badge">🚀 Live API</span>
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Provider:</span>
              <span className="value">{apiStatus.provider}</span>
            </div>
            <div className="detail-row">
              <span className="label">Model:</span>
              <span className="value">{apiStatus.model}</span>
            </div>
            <div className="detail-row">
              <span className="label">Cache:</span>
              <span className="value">
                {apiStatus.cacheEnabled ? `Enabled (${apiStatus.cacheSize} items)` : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {usage && (
          <div className="status-card">
            <h4>Today's Usage</h4>
            <div className="status-details">
              <div className="detail-row">
                <span className="label">Requests:</span>
                <span className="value">
                  {usage.totalRequests} / {usage.maxRequests}
                  <span className={`usage-bar ${usage.status}`}>
                    <span 
                      className="usage-fill" 
                      style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
                    ></span>
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Tokens:</span>
                <span className="value">{usage.totalTokens.total.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Cost:</span>
                <span className="value cost-value">{usage.costFormatted}</span>
              </div>
              <div className="detail-row">
                <span className="label">Avg/Request:</span>
                <span className="value">${usage.averageCostPerRequest.toFixed(4)}</span>
              </div>
              {usage.percentUsed >= 80 && (
                <div className="warning-message">
                  ⚠️ {usage.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Test */}
        <div className="status-card">
          <h4>Connection</h4>
          <div className="status-details">
            <button 
              onClick={handleTestConnection} 
              disabled={testing}
              className="test-button"
            >
              {testing ? '⏳ Testing...' : '🔍 Test Connection'}
            </button>
            
            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                <span className="result-icon">
                  {testResult.success ? '✅' : '❌'}
                </span>
                <div className="result-details">
                  <div className="result-message">{testResult.message}</div>
                  {testResult.latency && (
                    <div className="result-latency">
                      Latency: {testResult.latency}ms
                    </div>
                  )}
                  {testResult.model && (
                    <div className="result-model">Model: {testResult.model}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="status-card">
          <h4>Actions</h4>
          <div className="status-actions">
            <button 
              onClick={handleClearCache}
              className="action-button"
              disabled={apiStatus.cacheSize === 0}
            >
              🗑️ Clear Cache ({apiStatus.cacheSize})
            </button>
            <button 
              onClick={handleResetUsage}
              className="action-button"
            >
              🔄 Reset Usage Stats
            </button>
            {!apiStatus.configured && (
              <div className="setup-hint">
                <p>⚠️ API key not configured</p>
                <p className="hint-text">
                  Add your OpenAI API key to <code>.env.local</code>:
                </p>
                <code className="code-block">
                  VITE_OPENAI_API_KEY=your_key_here
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Breakdown by Model */}
      {usage && usage.requestsByModel && Object.keys(usage.requestsByModel).length > 0 && (
        <div className="status-card full-width">
          <h4>Usage by Model</h4>
          <div className="model-usage-table">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Requests</th>
                  <th>Tokens</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(usage.requestsByModel).map(([model, stats]) => (
                  <tr key={model}>
                    <td>{model}</td>
                    <td>{stats.count}</td>
                    <td>{stats.tokens.toLocaleString()}</td>
                    <td>${stats.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiStatus;
