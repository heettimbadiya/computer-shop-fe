import { useState, useEffect } from 'react'
import Header from './components/Header'
import Configurator from './components/Configurator'
import AdminDashboard from './components/AdminDashboard'
import { getParts } from './services/api'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAdmin) {
      loadParts()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  const loadParts = async () => {
    try {
      setLoading(true)
      const data = await getParts()
      setParts(data)
      setError(null)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header isAdmin={isAdmin} onToggleAdmin={handleToggleAdmin} />
      <main>
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="container mx-auto px-4 py-8">
            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading parts...</p>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-800 mb-4">{error}</p>
                  <button
                    onClick={loadParts}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <Configurator parts={parts} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

