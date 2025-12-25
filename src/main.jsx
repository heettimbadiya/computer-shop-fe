import React from 'react'
import ReactDOM from 'react-dom/client'
import { LanguageProvider } from './contexts/LanguageContext'
import { initializeExchangeRate } from './utils/currency'
import App from './App.jsx'
import './index.css'

// Initialize exchange rate on app start
initializeExchangeRate()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)

