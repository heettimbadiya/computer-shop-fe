import { useState, useEffect } from 'react'
import { getParts, createPart, updatePart, deletePart } from '../../services/api'
import PartForm from './PartForm'
import { useTranslation } from '../../hooks/useTranslation'
import { formatPrice } from '../../utils/currency'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Loader2, 
  AlertTriangle,
  Cpu,
  CircuitBoard,
  Database,
  HardDrive,
  Monitor,
  Zap,
  Box
} from 'lucide-react'

const categoryIcons = {
  'CPU': Cpu,
  'Motherboard': CircuitBoard,
  'RAM': Database,
  'Storage': HardDrive,
  'GPU': Monitor,
  'Power Supply': Zap,
  'Cabinet': Box,
}

const CATEGORIES = [
  'CPU',
  'Motherboard',
  'RAM',
  'Storage',
  'GPU',
  'Power Supply',
  'Cabinet',
]

const PartsManagement = ({ showToast = () => {} }) => {
  const { t, language } = useTranslation()
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPart, setEditingPart] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadParts()
  }, [])

  const loadParts = async () => {
    try {
      setLoading(true)
      // Admin can see all parts (both new and second-hand)
      const data = await getParts()
      setParts(data)
    } catch (error) {
      console.error('Error loading parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPart(null)
    setShowForm(true)
  }

  const handleEdit = (part) => {
    setEditingPart(part)
    setShowForm(true)
  }

  const handleDelete = async (partId) => {
    try {
      await deletePart(partId)
      await loadParts()
      setDeleteConfirm(null)
      // Force refresh customer pages by triggering a storage event
      window.dispatchEvent(new Event('partsUpdated'))
      if (showToast) {
        showToast(t('admin.parts.partDeleted'), 'success')
      }
    } catch (error) {
      console.error('Error deleting part:', error)
      const errorMessage = error.response?.data?.message || error.message || t('admin.parts.failedToDelete')
      if (showToast) {
        showToast(errorMessage, 'error', 5000)
      }
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPart(null)
  }

  const handleFormSuccess = (isEdit = false) => {
    loadParts()
    handleFormClose()
    // Force refresh customer pages by triggering a storage event
    window.dispatchEvent(new Event('partsUpdated'))
    if (showToast) {
      showToast(
        isEdit ? t('admin.parts.partUpdated') : t('admin.parts.partCreated'),
        'success'
      )
    }
  }

  const filteredParts = parts.filter((part) => {
    const matchesCategory = !filterCategory || part.category === filterCategory
    const matchesSearch =
      !searchTerm ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="card animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-3 md:gap-4 min-w-0">
            {/* Search */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.parts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 sm:pl-11 text-sm sm:text-base min-h-[48px] w-full"
              />
            </div>
            {/* Category Filter */}
            <div className="relative w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
              <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field pl-9 sm:pl-11 w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] appearance-none cursor-pointer text-sm sm:text-base min-h-[48px]"
              >
                <option value="">{t('admin.parts.allCategories')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary whitespace-nowrap animate-scale-in min-h-[48px] text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.parts.addNewPart')}</span>
          </button>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-6">
        {filteredParts.map((part, index) => {
          const Icon = categoryIcons[part.category] || Package
          return (
            <div
              key={part._id}
              className="card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative w-full h-32 sm:h-36 md:h-40 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {part.imageUrl ? (
                  <img
                    src={part.imageUrl}
                    alt={part.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    part.imageUrl ? 'hidden' : 'flex'
                  }`}
                >
                  <Icon className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate flex-1 min-w-0">
                      {part.name}
                    </h3>
                    {part.isSecondHand === true ? (
                      <span className="badge-warning text-xs font-semibold flex-shrink-0">
                        {t('admin.parts.secondHand')}
                      </span>
                    ) : (
                      <span className="badge-success text-xs font-semibold flex-shrink-0">
                        {t('admin.parts.new')}
                      </span>
                    )}
                  </div>
                  <span className="badge-primary text-xs">
                    {part.category}
                  </span>
                </div>
              </div>

            {part.description && (
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                {part.description}
              </p>
            )}

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                <span className="text-xs sm:text-sm font-medium text-gray-600">{t('admin.parts.price')}</span>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600">
                  {formatPrice(part.price, language)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                <span className="text-xs sm:text-sm font-medium text-gray-600">{t('admin.parts.stock')}</span>
                <span
                  className={`font-bold text-base sm:text-lg ${
                    part.stock > 10
                      ? 'text-emerald-600'
                      : part.stock > 0
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {part.stock} {t('admin.parts.units')}
                </span>
              </div>
            </div>

            {part.compatibility && (
              <div className="mb-4 flex flex-wrap gap-2">
                {part.compatibility.socket && (
                  <span className="badge-primary text-xs">
                    Socket: {part.compatibility.socket}
                  </span>
                )}
                {part.compatibility.ddrVersion && (
                  <span className="badge-info text-xs">
                    {part.compatibility.ddrVersion}
                  </span>
                )}
                {part.compatibility.formFactor && (
                  <span className="badge-success text-xs">
                    {part.compatibility.formFactor}
                  </span>
                )}
                {part.compatibility.wattage && (
                  <span className="badge-warning text-xs">
                    {part.compatibility.wattage}W
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleEdit(part)}
                className="flex-1 btn-secondary text-sm min-h-[44px]"
              >
                <Edit className="w-4 h-4" />
                <span>{t('common.edit')}</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(part._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-3 sm:px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('common.delete')}</span>
              </button>
            </div>
          </div>
          )
        })}
      </div>

      {filteredParts.length === 0 && (
        <div className="card text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">{t('admin.parts.noPartsFound')}</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterCategory
              ? t('admin.parts.tryAdjusting')
              : t('admin.parts.addFirstPart')}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
          <div className="card max-w-md w-full animate-scale-in shadow-2xl my-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('admin.parts.deleteConfirm')}
                </h3>
                <p className="text-sm text-gray-600">{t('common.confirm')}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {t('admin.parts.deleteMessage')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary min-h-[48px]"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('common.delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Part Form Modal */}
      {showForm && (
        <PartForm
          part={editingPart}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          showToast={showToast}
        />
      )}
    </div>
  )
}

export default PartsManagement

