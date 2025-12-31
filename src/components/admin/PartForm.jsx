import { useState, useEffect } from 'react'
import { createPart, updatePart, getCategories } from '../../services/api'
import { useTranslation } from '../../hooks/useTranslation'
import { X, Save, Loader2, Package } from 'lucide-react'

const PartForm = ({ part, onClose, onSuccess, showToast = () => {} }) => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    isSecondHand: false,
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
    imageUrl: '',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

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
      setLoadingCategories(true)
      const data = await getCategories()
      setCategories(data.map(cat => cat.name))
      
      // Set default category if formData.category is empty
      if (!formData.category && data.length > 0) {
        setFormData(prev => ({ ...prev, category: data[0].name }))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to default categories if API fails
      setCategories(['CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'Power Supply', 'Cabinet'])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        category: part.category || (categories.length > 0 ? categories[0] : ''),
        price: part.price || 0,
        stock: part.stock || 0,
        isSecondHand: part.isSecondHand || false,
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
        imageUrl: part.imageUrl || '',
        description: part.description || '',
      })
    } else if (categories.length > 0 && !formData.category) {
      // Set default category if no part is being edited
      setFormData(prev => ({ ...prev, category: prev.category || categories[0] }))
    }
  }, [part, categories])

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
    if (!formData.name.trim()) newErrors.name = t('admin.parts.name') + ' ' + t('admin.parts.required').toLowerCase()
    if (!formData.category) newErrors.category = t('admin.parts.category') + ' ' + t('admin.parts.required').toLowerCase()
    if (formData.price <= 0) newErrors.price = t('admin.parts.price') + ' must be greater than 0'
    if (formData.stock < 0) newErrors.stock = t('admin.parts.stock') + ' cannot be negative'
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
        onSuccess(true) // Pass true for edit
      } else {
        await createPart(partData)
        onSuccess(false) // Pass false for create
      }
    } catch (error) {
      console.error('Error saving part:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t('admin.parts.failedToSave')
      setErrors({ 
        submit: errorMessage,
        ...(error.response?.data?.errors || {})
      })
      // Show error toast if available
      if (showToast) {
        showToast(errorMessage, 'error', 5000)
      } else {
        alert(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="card max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl custom-scrollbar my-2 sm:my-4">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {part ? t('admin.parts.editPart') : t('admin.parts.addNewPart')}
              </h2>
              <p className="text-sm text-gray-600">{part ? t('admin.parts.updatePart') : t('admin.parts.createPart')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.parts.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field text-sm sm:text-base min-h-[48px] ${errors.name ? 'border-red-500' : ''}`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.parts.category')} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field text-sm sm:text-base min-h-[48px] ${errors.category ? 'border-red-500' : ''}`}
                required
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.parts.price')} (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input-field text-sm sm:text-base min-h-[48px] ${errors.price ? 'border-red-500' : ''}`}
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.parts.stock')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`input-field text-sm sm:text-base min-h-[48px] ${errors.stock ? 'border-red-500' : ''}`}
                required
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSecondHand"
                  checked={formData.isSecondHand}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSecondHand: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('admin.parts.isSecondHand')}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {t('admin.parts.isSecondHandDesc')}
              </p>
            </div>
          </div>

          {/* Compatibility Fields */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              {t('admin.parts.compatibility')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(formData.category === 'CPU' || formData.category === 'Motherboard') && (
                <>
                  {formData.category === 'CPU' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('admin.parts.socketType')}
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
                          {t('admin.parts.supportedSocket')}
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
                          {t('admin.parts.supportedRamType')}
                        </label>
                        <select
                          name="compatibility.supportedRamType"
                          value={formData.compatibility.supportedRamType}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="">{t('common.select')} RAM Type</option>
                          <option value="DDR4">DDR4</option>
                          <option value="DDR5">DDR5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.parts.formFactor')}
                        </label>
                        <select
                          name="compatibility.formFactor"
                          value={formData.compatibility.formFactor}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="">{t('common.select')} {t('admin.parts.formFactor')}</option>
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
                    {t('admin.parts.ddrVersion')}
                  </label>
                  <select
                    name="compatibility.ddrVersion"
                    value={formData.compatibility.ddrVersion}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">{t('common.select')} {t('admin.parts.ddrVersion')}</option>
                    <option value="DDR4">DDR4</option>
                    <option value="DDR5">DDR5</option>
                  </select>
                </div>
              )}

              {formData.category === 'Cabinet' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.parts.supportedFormFactors')}
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
                    {t('admin.parts.wattage')}
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
                    {t('admin.parts.powerConsumption')}
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
                    {t('admin.parts.interface')}
                  </label>
                  <select
                    name="compatibility.interface"
                    value={formData.compatibility.interface}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">{t('common.select')} {t('admin.parts.interface')}</option>
                    <option value="SATA">SATA</option>
                    <option value="NVMe">NVMe</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.parts.imageUrl')}
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL to an image for this item
            </p>
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.parts.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Enter a detailed description of this item..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary min-h-[48px]"
              disabled={submitting}
            >
              <X className="w-4 h-4" />
              <span>{t('common.cancel')}</span>
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary min-h-[48px]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.save')}...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{part ? t('admin.parts.editPart') : t('admin.parts.createPart')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PartForm

