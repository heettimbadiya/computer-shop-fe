import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from './hooks/useTranslation'
import Header from './components/Header'
import Footer from './components/Footer'
import Configurator from './components/Configurator'
import AdminDashboard from './components/AdminDashboard'
import ItemsListing from './pages/ItemsListing'
import ItemDetail from './pages/ItemDetail'
import { getParts } from './services/api'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

function App() {
  const { t } = useTranslation()
  const [isAdmin, setIsAdmin] = useState(false)
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only load parts for configurator route
    const path = window.location.pathname
    if (path === '/' || path === '/configurator') {
      loadParts()
    } else {
      setLoading(false)
    }
    if(window.location.pathname === '/admin') {
      setIsAdmin(true)
    }
  }, [])

  const loadParts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getParts()
      setParts(data)
    } catch (err) {
      setError('Failed to load parts. Please make sure the backend server is running.')
      console.error('Error loading parts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Listen for parts updates from admin panel
  useEffect(() => {
    const handlePartsUpdate = () => {
      const path = window.location.pathname
      if (path === '/' || path === '/configurator') {
        loadParts()
      }
    }

    window.addEventListener('partsUpdated', handlePartsUpdate)
    return () => {
      window.removeEventListener('partsUpdated', handlePartsUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleAdmin = () => {
    setIsAdmin(!isAdmin)
  }

  // Configurator Page Component
  const ConfiguratorPage = () => {
    const [localLoading, setLocalLoading] = useState(loading)
    const [localError, setLocalError] = useState(error)
    const [localParts, setLocalParts] = useState(parts)

    useEffect(() => {
      if (localParts.length === 0) {
        loadParts()
      }
    }, [])

    useEffect(() => {
      setLocalLoading(loading)
      setLocalError(error)
      setLocalParts(parts)
    }, [loading, error, parts])

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {localLoading ? (
          <div className="flex items-center justify-center min-h-[60vh] sm:min-h-[70vh]">
            <div className="text-center animate-fade-in px-4">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                  <Loader2 className="w-full h-full text-primary-600 animate-spin" strokeWidth={2} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('common.loading')}</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
                {t('common.loading')}...
              </p>
            </div>
          </div>
        ) : localError ? (
          <div className="max-w-2xl mx-auto mt-6 sm:mt-8 animate-fade-in-up px-4">
            <div className="card border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" strokeWidth={2} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">{t('common.error')}</h3>
                <p className="text-sm sm:text-base text-red-700 mb-4 sm:mb-6 px-2">{localError}</p>
                <button
                  onClick={loadParts}
                  className="btn-primary mx-auto min-h-[48px]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('common.refresh')}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Configurator parts={localParts} />
        )}
      </div>
    )
  }

  // App Content Component - handles conditional header display
  const AppContent = () => {
    const location = useLocation()
    // Show header on all pages except admin (admin has its own header)
    const showHeader = location.pathname !== '/admin'

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">
        {showHeader && <Header isAdmin={isAdmin} onToggleAdmin={handleToggleAdmin} />}
        <main className={`flex-1 ${showHeader ? "pb-12" : ""}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/configurator" replace />} />
            <Route path="/configurator" element={<ConfiguratorPage />} />
            <Route path="/items" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <ItemsListing />
              </div>
            } />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/configurator" replace />} />
          </Routes>
        </main>
        {showHeader && <Footer />}
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
