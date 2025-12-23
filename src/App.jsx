import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Configurator from './components/Configurator'
import AdminDashboard from './components/AdminDashboard'
import ItemsListing from './pages/ItemsListing'
import ItemDetail from './pages/ItemDetail'
import { getParts } from './services/api'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

function App() {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {localLoading ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto">
                  <Loader2 className="w-full h-full text-primary-600 animate-spin" strokeWidth={2} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Components</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Fetching the latest PC parts and compatibility data...
              </p>
            </div>
          </div>
        ) : localError ? (
          <div className="max-w-2xl mx-auto mt-8 animate-fade-in-up">
            <div className="card border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Connection Error</h3>
                <p className="text-red-700 mb-6">{localError}</p>
                <button
                  onClick={loadParts}
                  className="btn-primary mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Connection</span>
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
    const showHeader = !location.pathname.startsWith('/items/')

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {showHeader && <Header isAdmin={isAdmin} onToggleAdmin={handleToggleAdmin} />}
        <main className={showHeader ? "pb-12" : ""}>
          <Routes>
            <Route path="/" element={<Navigate to="/configurator" replace />} />
            <Route path="/configurator" element={<ConfiguratorPage />} />
            <Route path="/items" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <ItemsListing />
              </div>
            } />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/configurator" replace />} />
          </Routes>
        </main>
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
