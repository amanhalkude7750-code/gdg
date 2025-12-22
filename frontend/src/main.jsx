import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ModeProvider } from './context/ModeContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ModeProvider>
        <App />
      </ModeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
