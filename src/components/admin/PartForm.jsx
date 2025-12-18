import { useState, useEffect } from 'react'
import { createPart, updatePart } from '../../services/api'

const CATEGORIES = [
  'CPU',
  'Motherboard',
  'RAM',
  'Storage',
  'GPU',
  'Power Supply',
  'Cabinet',
]

const PartForm = ({ part, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'CPU',
    price: 0,
    stock: 0,
    compatibility: {
      socket: '',
      supportedSocket: '',
      ddrVersion: '',
      supportedRamType: '',
      formFactor: '',
      supportedFormFactors: [],
      wattage: '',
      powerConsumption: '',
      interface: '',
    },
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        category: part.category || 'CPU',
        price: part.price || 0,
        stock: part.stock || 0,
        compatibility: {
          socket: part.compatibility?.socket || '',
          supportedSocket: part.compatibility?.supportedSocket || '',
          ddrVersion: part.compatibility?.ddrVersion || '',
          supportedRamType: part.compatibility?.supportedRamType || '',
          formFactor: part.compatibility?.formFactor || '',
          supportedFormFactors: part.compatibility?.supportedFormFactors || [],
          wattage: part.compatibility?.wattage || '',
          powerConsumption: part.compatibility?.powerConsumption || '',
          interface: part.compatibility?.interface || '',
        },
        description: part.description || '',
      })
    }
  }, [part])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    if (name.startsWith('compatibility.')) {
      const compatField = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        compatibility: {
          ...prev.compatibility,
          [compatField]:
            type === 'number' && value ? parseFloat(value) : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }))
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSupportedFormFactorsChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData((prev) => ({
      ...prev,
      compatibility: {
        ...prev.compatibility,
        supportedFormFactors: options,
      },
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      // Clean up compatibility data - remove empty strings and convert to proper types
      const cleanedCompatibility = {}
      Object.keys(formData.compatibility).forEach((key) => {
        const value = formData.compatibility[key]
        if (value !== '' && value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length > 0) {
            cleanedCompatibility[key] = value
          } else if (!Array.isArray(value)) {
            cleanedCompatibility[key] = value
          }
        }
      })

      const partData = {
        ...formData,
        compatibility: cleanedCompatibility,
      }

      if (part) {
        await updatePart(part._id, partData)
      } else {
        await createPart(partData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving part:', error)
      alert(
        error.response?.data?.message || 'Failed to save part. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {part ? 'Edit Part' : 'Add New Part'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.stock ? 'border-red-500' : ''}`}
                required
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Compatibility Fields */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Compatibility Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.category === 'CPU' || formData.category === 'Motherboard') && (
                <>
                  {formData.category === 'CPU' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Socket Type
                      </label>
                      <input
                        type="text"
                        name="compatibility.socket"
                        value={formData.compatibility.socket}
                        onChange={handleChange}
                        placeholder="e.g., AM4, LGA1700"
                        className="input-field"
                      />
                    </div>
                  )}
                  {formData.category === 'Motherboard' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supported Socket
                        </label>
                        <input
                          type="text"
                          name="compatibility.supportedSocket"
                          value={formData.compatibility.supportedSocket}
                          onChange={handleChange}
                          placeholder="e.g., AM4, LGA1700"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supported RAM Type
                        </label>
                        <select
                          name="compatibility.supportedRamType"
                          value={formData.compatibility.supportedRamType}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="">Select RAM Type</option>
                          <option value="DDR4">DDR4</option>
                          <option value="DDR5">DDR5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Form Factor
                        </label>
                        <select
                          name="compatibility.formFactor"
                          value={formData.compatibility.formFactor}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="">Select Form Factor</option>
                          <option value="ATX">ATX</option>
                          <option value="mATX">mATX</option>
                          <option value="ITX">ITX</option>
                          <option value="E-ATX">E-ATX</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              {formData.category === 'RAM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DDR Version
                  </label>
                  <select
                    name="compatibility.ddrVersion"
                    value={formData.compatibility.ddrVersion}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select DDR Version</option>
                    <option value="DDR4">DDR4</option>
                    <option value="DDR5">DDR5</option>
                  </select>
                </div>
              )}

              {formData.category === 'Cabinet' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supported Form Factors
                  </label>
                  <select
                    multiple
                    value={formData.compatibility.supportedFormFactors}
                    onChange={handleSupportedFormFactorsChange}
                    className="input-field"
                    size="4"
                  >
                    <option value="ATX">ATX</option>
                    <option value="mATX">mATX</option>
                    <option value="ITX">ITX</option>
                    <option value="E-ATX">E-ATX</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>
              )}

              {formData.category === 'Power Supply' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wattage
                  </label>
                  <input
                    type="number"
                    name="compatibility.wattage"
                    value={formData.compatibility.wattage}
                    onChange={handleChange}
                    placeholder="e.g., 750"
                    min="0"
                    className="input-field"
                  />
                </div>
              )}

              {(formData.category === 'CPU' || formData.category === 'GPU') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Power Consumption (Watts)
                  </label>
                  <input
                    type="number"
                    name="compatibility.powerConsumption"
                    value={formData.compatibility.powerConsumption}
                    onChange={handleChange}
                    placeholder="e.g., 125"
                    min="0"
                    className="input-field"
                  />
                </div>
              )}

              {formData.category === 'Storage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interface
                  </label>
                  <select
                    name="compatibility.interface"
                    value={formData.compatibility.interface}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Interface</option>
                    <option value="SATA">SATA</option>
                    <option value="NVMe">NVMe</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Saving...
                </span>
              ) : (
                part ? 'Update Part' : 'Create Part'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PartForm

