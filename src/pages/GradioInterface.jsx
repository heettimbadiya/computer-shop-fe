import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Smartphone, Monitor, ExternalLink, RefreshCw } from 'lucide-react'

// Get Gradio URL - now uses Express proxy (works on Render!)
const getGradioUrl = () => {
  const envUrl = import.meta.env.VITE_GRADIO_URL
  if (envUrl) return envUrl
  
  // Get backend URL from API base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  const backendUrl = apiBaseUrl.replace('/api', '').replace(/\/$/, '')
  
  // Gradio is now accessible through Express proxy at /gradio
  // This works on both localhost and Render!
  return `${backendUrl}/gradio`
}

const GRADIO_SERVER_URL = getGradioUrl()
const IS_RENDER = GRADIO_SERVER_URL.includes('render.com')

const GradioInterface = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    
    // Check if Gradio is accessible via health check endpoint
    const checkGradioHealth = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
        const healthUrl = `${apiBaseUrl.replace('/api', '')}/api/gradio/health`
        
        const response = await fetch(healthUrl)
        const data = await response.json()
        
        if (data.status === 'running') {
          console.log('✅ Gradio server is running')
        } else if (data.status === 'disabled') {
          setError('Gradio is disabled. Please enable it in the backend configuration.')
          setLoading(false)
        } else {
          console.log('⚠️  Gradio status:', data.status, data.message)
          // Don't set error here - let the iframe try to load
        }
      } catch (err) {
        console.log('⚠️  Could not check Gradio health:', err)
        // Don't set error here - let the iframe try to load
      }
    }
    
    checkGradioHealth()
    
    // Set a timeout to show error if iframe doesn't load
    const errorTimer = setTimeout(() => {
      if (!iframeLoaded && !error) {
        setError('Gradio server is taking longer than expected to load. Please check if the backend server is running and Gradio is enabled.')
        setLoading(false)
      }
    }, 15000) // 15 second timeout
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(errorTimer)
    }
  }, [iframeLoaded, error])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Reload the page to retry
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Connecting to Gradio server...</p>
        </div>
      </div>
    )
  }

  // Note: Removed Render-specific error message since Gradio now works on Render via proxy

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-fade-in-up">
        <div className="card border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">Gradio Server Not Available</h3>
            <p className="text-amber-700 mb-4">{error}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 font-semibold mb-2">To start the Gradio server:</p>
              <ol className="text-sm text-amber-700 list-decimal list-inside space-y-1">
                <li>Gradio server should start automatically with the backend</li>
                <li>If not, check that Python and Gradio are installed</li>
                <li>Install dependencies: <code className="bg-amber-100 px-1 rounded">pip install -r requirements.txt</code></li>
                <li>Check backend logs for Gradio startup messages</li>
                <li>Gradio URL: <code className="bg-amber-100 px-1 rounded">{GRADIO_SERVER_URL}</code></li>
              </ol>
            </div>
            <button
              onClick={handleRetry}
              className="btn-primary mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6 shadow-xl shadow-purple-500/25">
          {isMobile ? (
            <Smartphone className="w-10 h-10 text-white" strokeWidth={2.5} />
          ) : (
            <Monitor className="w-10 h-10 text-white" strokeWidth={2.5} />
          )}
        </div>
        <h2 className="section-title gradient-text mb-3">
          Gradio Mobile Interface
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-3">
          <span>🧪</span>
          <span>Experimental</span>
        </div>
        <p className="section-subtitle max-w-2xl mx-auto">
          Mobile-optimized interface for browsing and searching computer components.
          {!isMobile && (
            <span className="block mt-2 text-amber-600 text-sm">
              ⚠️ This interface is optimized for mobile devices. Desktop support may be limited.
            </span>
          )}
        </p>
      </div>

      {/* Warning Banner for Desktop */}
      {!isMobile && (
        <div className="card bg-amber-50 border-2 border-amber-200 mb-6 animate-slide-down">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Desktop Support Limited</p>
              <p className="text-sm text-amber-800">
                This Gradio interface is primarily designed for mobile devices. For the best experience, 
                please use the standard <a href="/configurator" className="underline font-semibold">Configurator</a> or 
                <a href="/items" className="underline font-semibold ml-1">Items</a> pages on desktop.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gradio iframe */}
      <div className="card p-0 overflow-hidden animate-fade-in relative">
        <div 
          className="w-full relative"
          style={{
            height: isMobile ? 'calc(100vh - 300px)' : '800px',
            minHeight: '600px'
          }}
        >
          {loading && !iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Loading Gradio interface...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          )}
          <iframe
            src={GRADIO_SERVER_URL}
            title="Gradio PC Builder Interface"
            className="w-full h-full border-0"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              opacity: iframeLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            allow="camera; microphone; geolocation; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
            onLoad={(e) => {
              console.log('✅ Gradio iframe loaded successfully')
              setIframeLoaded(true)
              setLoading(false)
              setError(null)
              // Small delay to ensure content is rendered
              setTimeout(() => {
                setLoading(false)
              }, 500)
            }}
            onError={(e) => {
              console.error('❌ Gradio iframe error:', e)
              setLoading(false)
              setError('Failed to load Gradio interface. Please check if the backend server is running and Gradio is enabled.')
            }}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Mobile Optimized</h3>
              <p className="text-sm text-blue-800">
                This interface is specifically designed for mobile devices with touch-friendly controls and responsive layout.
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-2 border-purple-200">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Direct Access</h3>
              <p className="text-sm text-purple-800">
                {GRADIO_SERVER_URL ? (
                  <>
                    You can also access the Gradio interface directly at{' '}
                    <a 
                      href={GRADIO_SERVER_URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      {GRADIO_SERVER_URL}
                    </a>
                  </>
                ) : (
                  'Gradio is not available on Render. Use locally or deploy as a separate service.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradioInterface

