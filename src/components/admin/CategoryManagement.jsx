import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api'
import { useTranslation } from '../../hooks/useTranslation'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  X,
  Save,
  Tag,
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react'

const CategoryManagement = ({ showToast = () => {} }) => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({ name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

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
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      showToast(t('admin.categories.failedToLoad'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '' })
    setErrors({})
    setShowForm(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setErrors({})
    setShowForm(true)
  }

  const handleDelete = async (categoryId) => {
    try {
      const response = await deleteCategory(categoryId)
      showToast(t('admin.categories.categoryDeleted'), 'success')
      await loadCategories()
      setDeleteConfirm(null)
      // Trigger categories updated event
      window.dispatchEvent(new Event('categoriesUpdated'))
    } catch (error) {
      console.error('Error deleting category:', error)
      const errorMessage = error.response?.data?.message || t('admin.categories.failedToDelete')
      showToast(errorMessage, 'error', 5000)
      setDeleteConfirm(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = t('admin.categories.nameRequired')
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, { name: formData.name.trim() })
        showToast(t('admin.categories.categoryUpdated'), 'success')
      } else {
        await createCategory({ name: formData.name.trim() })
        showToast(t('admin.categories.categoryCreated'), 'success')
      }
      setShowForm(false)
      await loadCategories()
      // Trigger categories updated event so other components can refresh
      window.dispatchEvent(new Event('categoriesUpdated'))
    } catch (error) {
      console.error('Error saving category:', error)
      const errorMessage = error.response?.data?.message || t('admin.categories.failedToSave')
      setErrors({ submit: errorMessage })
      showToast(errorMessage, 'error', 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '' })
    setErrors({})
  }

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="card animate-slide-up bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-100/50 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
              <Tag className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                {t('admin.categories.title')}
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" strokeWidth={2} />
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('admin.categories.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary whitespace-nowrap animate-scale-in min-h-[48px] text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold">{t('admin.categories.addNewCategory')}</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700">{categories.length}</p>
                <p className="text-xs sm:text-sm text-primary-600 font-medium">Total Categories</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">
                  {categories.filter(c => c.isDefault).length}
                </p>
                <p className="text-xs sm:text-sm text-emerald-600 font-medium">Default Categories</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {categories.filter(c => !c.isDefault).length}
                </p>
                <p className="text-xs sm:text-sm text-amber-600 font-medium">Custom Categories</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="card text-center py-12 sm:py-16 animate-slide-up bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
            <Tag className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.categories.noCategoriesFound')}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('admin.categories.emptyStateDescription')}
          </p>
          <button
            onClick={handleCreate}
            className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">{t('admin.categories.addNewCategory')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((category, index) => (
            <div
              key={category._id}
              className="card-hover animate-slide-up group relative overflow-hidden"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Gradient background overlay for hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-all duration-300 pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      category.isDefault 
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-primary-100 group-hover:to-accent-100'
                    }`}>
                      <Tag className={`w-6 h-6 transition-colors duration-300 ${
                        category.isDefault ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'
                      }`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl truncate mb-1 group-hover:text-primary-700 transition-colors">
                        {category.name}
                      </h3>
                      {category.isDefault && (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary-600" />
                          <p className="text-xs text-primary-600 font-semibold">
                            {t('admin.categories.defaultCategory')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 btn-secondary text-sm py-2.5 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={category.isDefault}
                    title={category.isDefault ? t('admin.categories.cannotDeleteDefault') : t('common.edit')}
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium">{t('common.edit')}</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(category._id)}
                    className="flex-1 btn-danger text-sm py-2.5 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={category.isDefault}
                    title={category.isDefault ? t('admin.categories.cannotDeleteDefault') : t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">{t('common.delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseForm()
          }}
        >
          <div className="card max-w-md w-full animate-scale-in shadow-2xl border-2 border-gray-100 my-4">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Tag className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addNewCategory')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingCategory ? 'Update category information' : 'Create a new product category'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseForm}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary-600" />
                  {t('admin.categories.categoryName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: '' })
                    if (errors.submit) setErrors({})
                  }}
                  className={`input-field text-sm sm:text-base min-h-[48px] transition-all ${
                    errors.name || errors.submit ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''
                  }`}
                  placeholder="e.g., CPU, GPU, RAM, Motherboard"
                  required
                  autoFocus
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-slide-down">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
                {errors.submit && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-slide-down">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.submit}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {t('admin.categories.nameHint')}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 btn-secondary min-h-[48px] font-semibold"
                  disabled={submitting}
                >
                  <X className="w-4 h-4" />
                  <span>{t('common.cancel')}</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary min-h-[48px] font-semibold shadow-lg hover:shadow-xl"
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
                      <span>{t('common.save')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null)
          }}
        >
          <div className="card max-w-md w-full animate-scale-in shadow-2xl border-2 border-red-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center border-2 border-red-300">
                <AlertCircle className="w-7 h-7 text-red-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{t('admin.categories.deleteConfirm')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {t('admin.categories.deleteMessage')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary min-h-[48px] font-semibold order-2 sm:order-1"
              >
                <X className="w-4 h-4" />
                <span>{t('common.cancel')}</span>
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn-danger min-h-[48px] font-semibold shadow-lg hover:shadow-xl order-1 sm:order-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('common.delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagement
