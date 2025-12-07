// main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import aiService from './api/aiService'
import { AnalysisProvider } from './context/AnalysisContext'

// Initialize AI service with environment configuration
aiService.configure();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnalysisProvider>
      <App />
    </AnalysisProvider>
  </React.StrictMode>,
)