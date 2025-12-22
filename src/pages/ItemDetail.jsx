import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPartById } from '../services/api'
import { 
  Cpu, 
  Monitor, 
  HardDrive, 
  Database, 
  CircuitBoard, 
  Zap, 
  Box,
  ArrowLeft,
  Loader2,
  Package,
  CheckCircle2,
  XCircle,
  DollarSign,
  ShoppingCart
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

const ItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadItem()
  }, [id])

  const loadItem = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPartById(id)
      setItem(data)
    } catch (err) {
      console.error('Error loading item:', err)
      setError('Item not found')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToConfig = () => {
    // Navigate to configurator with this item pre-selected
    navigate('/configurator', { state: { selectedItem: item } })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-fade-in-up">
        <div className="card border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Item Not Found</h3>
            <p className="text-red-700 mb-6">{error || 'The item you are looking for does not exist.'}</p>
            <Link to="/items" className="btn-primary inline-flex">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Items</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const Icon = categoryIcons[item.category] || Package

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        to="/items"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Items</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
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
                <Icon className="w-32 h-32 text-gray-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="badge-primary text-sm">{item.category}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.name}</h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-primary-600">
                ${item.price?.toLocaleString() || '0'}
              </span>
              {item.stock !== undefined && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  item.stock > 10
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.stock > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {item.compatibility && Object.keys(item.compatibility).length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.compatibility.socket && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Socket Type</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.socket}</p>
                  </div>
                )}
                {item.compatibility.supportedSocket && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Supported Socket</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.supportedSocket}</p>
                  </div>
                )}
                {item.compatibility.ddrVersion && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">DDR Version</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.ddrVersion}</p>
                  </div>
                )}
                {item.compatibility.supportedRamType && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Supported RAM Type</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.supportedRamType}</p>
                  </div>
                )}
                {item.compatibility.formFactor && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Form Factor</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.formFactor}</p>
                  </div>
                )}
                {item.compatibility.supportedFormFactors && item.compatibility.supportedFormFactors.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Supported Form Factors</p>
                    <p className="font-semibold text-gray-900">
                      {item.compatibility.supportedFormFactors.join(', ')}
                    </p>
                  </div>
                )}
                {item.compatibility.wattage && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Wattage</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.wattage}W</p>
                  </div>
                )}
                {item.compatibility.powerConsumption && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Power Consumption</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.powerConsumption}W</p>
                  </div>
                )}
                {item.compatibility.interface && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Interface</p>
                    <p className="font-semibold text-gray-900">{item.compatibility.interface}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToConfig}
              className="flex-1 btn-primary"
              disabled={item.stock === 0}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Configuration</span>
            </button>
            <Link
              to="/configurator"
              className="flex-1 btn-secondary text-center"
            >
              <Package className="w-4 h-4" />
              <span>View Configurator</span>
            </Link>
          </div>

          {item.stock === 0 && (
            <div className="card bg-amber-50 border-2 border-amber-200">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-amber-800 font-medium">
                  This item is currently out of stock. Please check back later.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemDetail

