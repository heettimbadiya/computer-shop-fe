import { useState, useEffect } from 'react'
import PartSelector from './PartSelector'
import PriceSummary from './PriceSummary'
import SubmitForm from './SubmitForm'
import { getCompatibleParts, submitConfigRequest } from '../services/api'

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Build Your Custom PC</h2>
        <p className="text-gray-600">Select compatible parts to configure your dream computer</p>
      </div>

      {submitStatus && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            submitStatus.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          } animate-slide-up`}
        >
          <p className="font-semibold">{submitStatus.message}</p>
          {submitStatus.errors && submitStatus.errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {submitStatus.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-4">
          {CATEGORIES.map((category, index) => (
            <div
              key={category}
              className={`card animate-slide-up opacity-100`}
              // className={`card animate-slide-up ${
              //   index <= currentStep ? 'opacity-100' : 'opacity-50'
              // }`}
              style={{ animationDelay: `${index * 0.1}s` }}
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
            <div className="card bg-blue-50 border-2 border-blue-200 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    All parts selected! Ready to submit?
                  </h3>
                  <p className="text-sm text-blue-700">
                    Review your configuration and submit your request
                  </p>
                </div>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}

          {showSubmitForm && (
            <div className="card animate-scale-in">
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
          <div className="sticky top-24">
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

