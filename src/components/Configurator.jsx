import { useState, useEffect } from 'react'
import PartSelector from './PartSelector'
import PriceSummary from './PriceSummary'
import SubmitForm from './SubmitForm'
import { getCompatibleParts, submitConfigRequest } from '../services/api'
import { CheckCircle2, XCircle, Sparkles, Rocket } from 'lucide-react'

const CATEGORIES = [
  'CPU',
  'Motherboard',
  'RAM',
  'Storage',
  'GPU',
  'Power Supply',
  'Cabinet',
]

const Configurator = ({ parts }) => {
  const [selectedParts, setSelectedParts] = useState({})
  const [compatibleParts, setCompatibleParts] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  // Load compatible parts for each category
  useEffect(() => {
    const loadCompatibleParts = async () => {
      const compatible = {}
      for (const category of CATEGORIES) {
        try {
          const compatibleList = await getCompatibleParts(category, selectedParts)
          compatible[category] = compatibleList
        } catch (error) {
          console.error(`Error loading compatible parts for ${category}:`, error)
          compatible[category] = []
        }
      }
      setCompatibleParts(compatible)
    }

    loadCompatibleParts()
  }, [selectedParts])

  const handlePartSelect = (category, partId) => {
    setSelectedParts((prev) => {
      const newSelected = { ...prev, [category]: partId || null }
      
      // Reset dependent selections when a parent part changes
      if (category === 'CPU') {
        // Reset motherboard and RAM if CPU changes
        if (newSelected.Motherboard) {
          const mb = parts.find(p => p._id === newSelected.Motherboard)
          const cpu = parts.find(p => p._id === partId)
          if (mb && cpu && mb.compatibility?.supportedSocket !== cpu.compatibility?.socket) {
            newSelected.Motherboard = null
            newSelected.RAM = null
          }
        }
      } else if (category === 'Motherboard') {
        // Reset RAM if motherboard changes
        if (newSelected.RAM) {
          const ram = parts.find(p => p._id === newSelected.RAM)
          const mb = parts.find(p => p._id === partId)
          if (ram && mb && ram.compatibility?.ddrVersion !== mb.compatibility?.supportedRamType) {
            newSelected.RAM = null
          }
        }
        // Reset cabinet if motherboard form factor doesn't match
        if (newSelected.Cabinet) {
          const cabinet = parts.find(p => p._id === newSelected.Cabinet)
          const mb = parts.find(p => p._id === partId)
          if (cabinet && mb && mb.compatibility?.formFactor) {
            if (!cabinet.compatibility?.supportedFormFactors?.includes(mb.compatibility.formFactor)) {
              newSelected.Cabinet = null
            }
          }
        }
      } else if (category === 'Power Supply') {
        // Reset GPU if power supply is insufficient
        if (newSelected.GPU) {
          const gpu = parts.find(p => p._id === newSelected.GPU)
          const psu = parts.find(p => p._id === partId)
          if (gpu && psu) {
            let totalPower = 100
            const cpu = parts.find(p => p._id === newSelected.CPU)
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
          const gpu = parts.find(p => p._id === partId)
          const psu = parts.find(p => p._id === newSelected['Power Supply'])
          if (gpu && psu) {
            let totalPower = 100
            const cpu = parts.find(p => p._id === newSelected.CPU)
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
    return Object.values(selectedParts)
      .filter(Boolean)
      .reduce((total, partId) => {
        const part = parts.find(p => p._id === partId)
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
        message: 'Configuration request submitted successfully!',
        data: result,
      })
      setShowSubmitForm(false)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSelectedParts({})
        setCurrentStep(0)
        setSubmitStatus(null)
      }, 3000)
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit configuration request',
        errors: error.response?.data?.errors || [],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const allPartsSelected = CATEGORIES.every(cat => selectedParts[cat])
  const selectedCount = Object.values(selectedParts).filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 mb-6 shadow-xl shadow-primary-500/25">
          <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="section-title gradient-text mb-3">
          Build Your Custom PC
        </h2>
        <p className="section-subtitle max-w-2xl mx-auto">
          Select compatible parts to configure your dream computer. Our intelligent system ensures all components work together perfectly.
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Configuration Progress
            </span>
            <span className="text-sm font-bold text-primary-600">
              {selectedCount} / {CATEGORIES.length}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-600 to-accent-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(selectedCount / CATEGORIES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {submitStatus && (
        <div
          className={`mb-8 p-5 rounded-2xl border-2 animate-slide-down ${
            submitStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {submitStatus.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-lg mb-2">{submitStatus.message}</p>
              {submitStatus.errors && submitStatus.errors.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {submitStatus.errors.map((error, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {CATEGORIES.map((category, index) => (
            <div
              key={category}
              className="card animate-slide-up"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Rocket className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      Configuration Complete! 🎉
                    </h3>
                    <p className="text-sm text-gray-700">
                      All parts have been selected. Review your build and submit your request.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="btn-primary whitespace-nowrap"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Submit Request</span>
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
          <div className="sticky top-28">
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

