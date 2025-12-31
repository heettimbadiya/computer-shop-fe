import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getParts, getCategories } from '../services/api'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/currency'
import { 
  Cpu, 
  Monitor, 
  HardDrive, 
  Database, 
  CircuitBoard, 
  Zap, 
  Box,
  Search,
  Filter,
  Loader2,
  Package,
  ExternalLink
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

const ItemsListing = () => {
  const { t, language } = useTranslation()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    loadItems()
    loadCategories()
    
    // Listen for parts updates from admin panel
    const handlePartsUpdate = () => {
      loadItems()
    }
    
    // Listen for category updates
    const handleCategoriesUpdate = () => {
      loadCategories()
    }
    
    window.addEventListener('partsUpdated', handlePartsUpdate)
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate)
    return () => {
      window.removeEventListener('partsUpdated', handlePartsUpdate)
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

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getParts()
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory = !filterCategory || item.category === filterCategory
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12 animate-fade-in-up px-2">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 mb-4 sm:mb-6 shadow-xl shadow-primary-500/25">
          <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          {t('customer.items.title')}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
          {t('customer.items.subtitle')}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6 sm:mb-8 animate-slide-up">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('customer.items.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 sm:pl-11 text-sm sm:text-base min-h-[48px]"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field pl-9 sm:pl-11 sm:w-48 w-full appearance-none cursor-pointer text-sm sm:text-base min-h-[48px]"
            >
              <option value="">{t('customer.items.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">{t('customer.items.noItemsFound')}</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterCategory
              ? t('customer.items.tryAdjusting')
              : t('customer.items.noItemsAvailable')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => {
            const Icon = categoryIcons[item.category] || Package
            return (
              <Link
                key={item._id}
                to={`/items/${item._id}`}
                className="card-hover animate-slide-up group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      item.imageUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    <Icon className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className="badge-primary">{item.category}</span>
                    {item.isSecondHand === true ? (
                      <span className="badge-warning text-xs font-semibold">
                        {t('customer.items.secondHand')}
                      </span>
                    ) : (
                      <span className="badge-success text-xs font-semibold">
                        {t('customer.items.new')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Specifications */}
                  {item.compatibility && (
                    <div className="flex flex-wrap gap-2">
                      {item.compatibility.socket && (
                        <span className="badge-primary text-xs">
                          Socket: {item.compatibility.socket}
                        </span>
                      )}
                      {item.compatibility.ddrVersion && (
                        <span className="badge-info text-xs">
                          {item.compatibility.ddrVersion}
                        </span>
                      )}
                      {item.compatibility.formFactor && (
                        <span className="badge-success text-xs">
                          {item.compatibility.formFactor}
                        </span>
                      )}
                      {item.compatibility.wattage && (
                        <span className="badge-warning text-xs">
                          {item.compatibility.wattage}W
                        </span>
                      )}
                      {item.compatibility.interface && (
                        <span className="badge-primary text-xs">
                          {item.compatibility.interface}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatPrice(item.price || 0, language)}
                      </p>
                      {item.stock !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('customer.items.stock')}: <span className={`font-semibold ${item.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.stock} {t('admin.parts.units')}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-primary-600 group-hover:text-primary-700 transition-colors">
                      <span className="text-sm font-semibold">{t('customer.items.viewDetails')}</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ItemsListing

