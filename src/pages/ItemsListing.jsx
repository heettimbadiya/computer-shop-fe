import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getParts } from '../services/api'
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
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const CATEGORIES = [
    'CPU',
    'Motherboard',
    'RAM',
    'Storage',
    'GPU',
    'Power Supply',
    'Cabinet',
  ]

  useEffect(() => {
    loadItems()
    
    // Listen for parts updates from admin panel
    const handlePartsUpdate = () => {
      loadItems()
    }
    
    window.addEventListener('partsUpdated', handlePartsUpdate)
    return () => {
      window.removeEventListener('partsUpdated', handlePartsUpdate)
    }
  }, [])

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
          <p className="text-gray-700 font-medium">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 mb-6 shadow-xl shadow-primary-500/25">
          <Package className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="section-title gradient-text mb-3">
          Computer Components
        </h2>
        <p className="section-subtitle max-w-2xl mx-auto">
          Browse our extensive collection of high-quality computer parts. Find the perfect components for your build.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field pl-11 md:w-48 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
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
          <p className="text-gray-700 font-semibold text-lg mb-2">No items found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterCategory
              ? 'Try adjusting your search or filter criteria'
              : 'No items available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        Second Hand
                      </span>
                    ) : (
                      <span className="badge-success text-xs font-semibold">
                        New
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
                        ${item.price?.toLocaleString() || '0'}
                      </p>
                      {item.stock !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: <span className={`font-semibold ${item.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.stock} units
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-primary-600 group-hover:text-primary-700 transition-colors">
                      <span className="text-sm font-semibold">View Details</span>
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

