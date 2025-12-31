import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import PartSelector from './PartSelector'
import PriceSummary from './PriceSummary'
import SubmitForm from './SubmitForm'
import { getCompatibleParts, submitConfigRequest, getCategories } from '../services/api'
import { useTranslation } from '../hooks/useTranslation'
import { CheckCircle2, XCircle, Sparkles, Rocket } from 'lucide-react'

const Configurator = ({ parts }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [selectedParts, setSelectedParts] = useState({})
  const [compatibleParts, setCompatibleParts] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const processedItemRef = useRef(null)

  // Load categories
  useEffect(() => {
    loadCategories()
    
    // Listen for category updates
    const handleCategoriesUpdate = () => {
      loadCategories()
    }
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate)
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate)
    }
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data.map(cat => cat.name))
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to default categories if API fails
      setCategories(['CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'Power Supply', 'Cabinet'])
    }
  }

  // Handle item added from detail page
  useEffect(() => {
    const selectedItem = location.state?.selectedItem
    if (!selectedItem || !parts || parts.length === 0) return
    
    const category = selectedItem.category
    const selectedId = selectedItem._id?.toString()
    const itemKey = `${category}-${selectedId}`
    
    // Skip if we've already processed this item
    if (processedItemRef.current === itemKey) return
    
    // Only proceed if category is valid and ID exists
    if (!categories.includes(category) || !selectedId) {
      window.history.replaceState({}, document.title)
      return
    }
    
    // Verify the part exists in our parts list
    const partExists = parts.some(p => {
      const partId = p._id?.toString()
      return partId === selectedId
    })
    
    if (!partExists) {
      console.warn('Selected item not found in parts list:', selectedItem)
      window.history.replaceState({}, document.title)
      return
    }
    
    // Wait for compatible parts to be available, then select
    const checkAndSelect = () => {
      // Mark as processed
      processedItemRef.current = itemKey
      
      setSelectedParts((prev) => {
        // Only update if not already set
        if (prev[category]?.toString() !== selectedId) {
          return {
            ...prev,
            [category]: selectedItem._id
          }
        }
        return prev
      })
      
      // Scroll to the relevant category section
      setTimeout(() => {
        const element = document.getElementById(`category-${category}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add a highlight effect
          element.classList.add('ring-4', 'ring-primary-500', 'ring-opacity-50', 'transition-all')
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-50')
          }, 2000)
        }
      }, 500)
      
      // Clear the state to prevent re-adding on re-render
      window.history.replaceState({}, document.title)
    }
    
    // If compatible parts are already loaded, select immediately
    // Otherwise wait a bit for them to load
    if (Object.keys(compatibleParts).length > 0) {
      checkAndSelect()
    } else {
      const timer = setTimeout(checkAndSelect, 1500)
      return () => clearTimeout(timer)
    }
  }, [location.state, parts, compatibleParts, categories])

  // Load compatible parts for each category
  useEffect(() => {
    if (!parts || parts.length === 0 || categories.length === 0) return
    
    const loadCompatibleParts = async () => {
      const compatible = {}
      for (const category of categories) {
        try {
          // Always fetch fresh data from API, don't rely on cached parts
          const compatibleList = await getCompatibleParts(category, selectedParts)
          compatible[category] = compatibleList || []
        } catch (error) {
          console.error(`Error loading compatible parts for ${category}:`, error)
          compatible[category] = []
        }
      }
      setCompatibleParts(compatible)
    }

    loadCompatibleParts()
  }, [selectedParts, parts, categories])

  const handlePartSelect = (category, partId) => {
    if (!parts) return
    setSelectedParts((prev) => {
      const newSelected = { ...prev, [category]: partId || null }
      
      // Helper function to find part safely
      const findPart = (id) => {
        if (!id || !parts) return null
        return parts.find(p => p && p._id && (p._id === id || p._id.toString() === id.toString()))
      }
      
      // Reset dependent selections when a parent part changes
      if (category === 'CPU') {
        // Reset motherboard and RAM if CPU changes
        if (newSelected.Motherboard) {
          const mb = findPart(newSelected.Motherboard)
          const cpu = findPart(partId)
          if (mb && cpu && mb.compatibility?.supportedSocket !== cpu.compatibility?.socket) {
            newSelected.Motherboard = null
            newSelected.RAM = null
          }
        }
      } else if (category === 'Motherboard') {
        // Reset RAM if motherboard changes
        if (newSelected.RAM) {
          const ram = findPart(newSelected.RAM)
          const mb = findPart(partId)
          if (ram && mb && ram.compatibility?.ddrVersion !== mb.compatibility?.supportedRamType) {
            newSelected.RAM = null
          }
        }
        // Reset cabinet if motherboard form factor doesn't match
        if (newSelected.Cabinet) {
          const cabinet = findPart(newSelected.Cabinet)
          const mb = findPart(partId)
          if (cabinet && mb && mb.compatibility?.formFactor) {
            if (!cabinet.compatibility?.supportedFormFactors?.includes(mb.compatibility.formFactor)) {
              newSelected.Cabinet = null
            }
          }
        }
      } else if (category === 'Power Supply') {
        // Reset GPU if power supply is insufficient
        if (newSelected.GPU) {
          const gpu = findPart(newSelected.GPU)
          const psu = findPart(partId)
          if (gpu && psu) {
            let totalPower = 100
            const cpu = findPart(newSelected.CPU)
            if (cpu?.compatibility?.powerConsumption) {
              totalPower += cpu.compatibility.powerConsumption
            }
            if (gpu.compatibility?.powerConsumption) {
              totalPower += gpu.compatibility.powerConsumption
            }
            if (psu.compatibility?.wattage && psu.compatibility.wattage < totalPower) {
              newSelected.GPU = null
            }
          }
        }
      } else if (category === 'GPU') {
        // Reset power supply if GPU requires more power than current PSU
        if (newSelected['Power Supply']) {
          const gpu = findPart(partId)
          const psu = findPart(newSelected['Power Supply'])
          if (gpu && psu) {
            let totalPower = 100
            const cpu = findPart(newSelected.CPU)
            if (cpu?.compatibility?.powerConsumption) {
              totalPower += cpu.compatibility.powerConsumption
            }
            if (gpu.compatibility?.powerConsumption) {
              totalPower += gpu.compatibility.powerConsumption
            }
            if (psu.compatibility?.wattage && psu.compatibility.wattage < totalPower) {
              newSelected['Power Supply'] = null
            }
          }
        }
      }
      
      return newSelected
    })
  }

  const calculateTotalPrice = () => {
    if (!parts || !selectedParts) return 0
    return Object.values(selectedParts)
      .filter(Boolean)
      .reduce((total, partId) => {
        const part = parts.find(p => p && p._id && (p._id === partId || p._id.toString() === partId.toString()))
        return total + (part?.price || 0)
      }, 0)
  }

  const handleSubmit = async (customerData) => {
    setSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await submitConfigRequest({
        selectedParts,
        ...customerData,
      })

      setSubmitStatus({
        type: 'success',
        message: t('customer.configurator.submittedSuccessfully'),
        data: result,
      })
      setShowSubmitForm(false)
      
      // Notify admin panel to refresh
      window.dispatchEvent(new Event('configRequestSubmitted'))
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSelectedParts({})
        setCurrentStep(0)
        setSubmitStatus(null)
      }, 3000)
    } catch (error) {
      console.error('Error submitting config request:', error)
      const errorMessage = error.response?.data?.message || error.message || t('customer.configurator.failedToSubmit')
      const errorDetails = error.response?.data?.details || ''
      setSubmitStatus({
        type: 'error',
        message: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        errors: error.response?.data?.errors || [],
        warnings: error.response?.data?.warnings || [],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const allPartsSelected = categories.length > 0 && categories.every(cat => selectedParts[cat])
  const selectedCount = Object.values(selectedParts).filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12 animate-fade-in-up px-2">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 mb-4 sm:mb-6 shadow-xl shadow-primary-500/25">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          {t('customer.configurator.title')}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
          {t('customer.configurator.subtitle')}
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-6 sm:mt-8 max-w-md mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              {t('customer.configurator.progress')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-primary-600">
              {selectedCount} / {categories.length}
            </span>
          </div>
          <div className="w-full h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-600 to-accent-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${categories.length > 0 ? (selectedCount / categories.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {submitStatus && (
        <div
          className={`mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 animate-slide-down ${
            submitStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            {submitStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base sm:text-lg mb-2">{submitStatus.message}</p>
              {submitStatus.errors && submitStatus.errors.length > 0 && (
                <ul className="mt-2 sm:mt-3 space-y-1">
                  {submitStatus.errors.map((error, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {categories.map((category, index) => (
            <div
              key={category}
              id={`category-${category}`}
              className="card animate-slide-up transition-all duration-300"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <PartSelector
                category={category}
                parts={compatibleParts[category] || []}
                selectedPartId={selectedParts[category]}
                onSelect={(partId) => handlePartSelect(category, partId)}
                allParts={parts}
              />
            </div>
          ))}

          {allPartsSelected && !showSubmitForm && (
            <div className="card bg-gradient-to-br from-emerald-50 to-primary-50 border-2 border-emerald-300/50 animate-scale-in shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                      {t('customer.configurator.configurationComplete')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {t('customer.configurator.allPartsSelected')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="btn-primary whitespace-nowrap w-full sm:w-auto min-h-[48px] text-sm sm:text-base"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{t('customer.configurator.submitRequest')}</span>
                </button>
              </div>
            </div>
          )}

          {showSubmitForm && (
            <div className="card animate-scale-in shadow-xl">
              <SubmitForm
                onSubmit={handleSubmit}
                onCancel={() => setShowSubmitForm(false)}
                submitting={submitting}
                totalPrice={calculateTotalPrice()}
              />
            </div>
          )}
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 sm:top-24 lg:top-28">
            <PriceSummary
              selectedParts={selectedParts}
              allParts={parts}
              totalPrice={calculateTotalPrice()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configurator

