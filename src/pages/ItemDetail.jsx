import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPartById, getContactInfo } from '../services/api'
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
  ShoppingCart,
  Share2,
  Heart,
  Phone,
  ChevronRight,
  MapPin,
  Calendar,
  Hash,
  Tag
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
  const [activeTab, setActiveTab] = useState('details')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showMoreSpecs, setShowMoreSpecs] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    workerPhone: '+90 551 894 00 69',
    instagramUrl: 'https://www.instagram.com/xpanbilgisayar',
  })

  useEffect(() => {
    loadItem()
    loadContactInfo()
  }, [id])

  const loadContactInfo = async () => {
    try {
      const data = await getContactInfo()
      if (data) {
        setContactInfo({
          workerPhone: data.workerPhone || '+90 551 894 00 69',
          instagramUrl: data.instagramUrl || 'https://www.instagram.com/xpanbilgisayar',
        })
      }
    } catch (error) {
      console.error('Error loading contact info:', error)
      // Keep default values on error
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!id) {
        setError('Invalid item ID')
        return
      }
      const data = await getPartById(id)
      if (!data) {
        setError('Item not found')
        return
      }
      setItem(data)
    } catch (err) {
      console.error('Error loading item:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Item not found'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToConfig = () => {
    if (!item || !item._id) {
      alert('Item information is not available. Please try again.')
      return
    }
    
    if (item.stock === 0) {
      alert('This item is out of stock and cannot be added to configuration.')
      return
    }
    
    // Navigate to configurator with the selected item
    navigate('/configurator', { 
      state: { 
        selectedItem: {
          _id: item._id,
          category: item.category,
          name: item.name
        }
      } 
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: item.description || `Check out this ${item.category}: ${item.name}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleCall = () => {
    if (contactInfo.workerPhone) {
      window.location.href = `tel:${contactInfo.workerPhone.replace(/\s/g, '')}`
    } else {
      alert('Contact phone number is not available')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0)
  }

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
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

  // Create images array
  const images = item?.imageUrl ? [item.imageUrl] : []

  // Get specifications for mobile display
  const getSpecs = () => {
    const specs = []
    if (item.compatibility?.socket) specs.push({ label: 'Socket', value: item.compatibility.socket })
    if (item.compatibility?.supportedSocket) specs.push({ label: 'Socket Type', value: item.compatibility.supportedSocket })
    if (item.compatibility?.ddrVersion) specs.push({ label: 'DDR Version', value: item.compatibility.ddrVersion })
    if (item.compatibility?.supportedRamType) specs.push({ label: 'RAM Type', value: item.compatibility.supportedRamType })
    if (item.compatibility?.formFactor) specs.push({ label: 'Form Factor', value: item.compatibility.formFactor })
    if (item.compatibility?.wattage) specs.push({ label: 'Wattage', value: `${item.compatibility.wattage}W` })
    if (item.compatibility?.powerConsumption) specs.push({ label: 'Power Consumption', value: `${item.compatibility.powerConsumption}W` })
    if (item.compatibility?.interface) specs.push({ label: 'Interface', value: item.compatibility.interface })
    if (item.stock !== undefined) specs.push({ label: 'Stock', value: item.stock > 0 ? `${item.stock} available` : 'Out of stock' })
    return specs
  }

  const allSpecs = getSpecs()
  const displayedSpecs = showMoreSpecs ? allSpecs : allSpecs.slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mobile Sticky Header - Only visible on mobile */}
      <div className="md:hidden sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/items')}
            className="p-2 -ml-2 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center">Item Details</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Favorite"
            >
              <Heart className={`w-6 h-6 ${isFavorited ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content - Only visible on mobile */}
      <div className="md:hidden pb-24">
        {/* Product Image Section */}
        {images.length > 0 && (
          <div className="relative w-full bg-white">
            <div className="relative aspect-[4/3] bg-gray-100">
              <img
                src={images[currentImageIndex]}
                alt={item.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1}/{images.length}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4 bg-gradient-to-t from-black/20 to-transparent">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                    aria-label={`Image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            <span className="whitespace-nowrap">Computer</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Components</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{item.category}</span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Available for shipping</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Item Information
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'location'
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Location
            </button>
          </div>
        </div>

        {/* Price and Title Section */}
        <div className="bg-white px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {item.isSecondHand ? (
              <span className="badge-warning text-xs font-semibold">
                Second Hand
              </span>
            ) : (
              <span className="badge-success text-xs font-semibold">
                New
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(item.price)}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">
            {item.name}
            {item.compatibility?.socket && ` | ${item.compatibility.socket}`}
            {item.compatibility?.ddrVersion && ` | ${item.compatibility.ddrVersion}`}
            {item.compatibility?.wattage && ` | ${item.compatibility.wattage}W`}
          </h2>
        </div>

        {/* System Features Section */}
        {activeTab === 'details' && (
          <div className="bg-white px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">System Features:</h3>
              {allSpecs.length > 4 && (
                <button
                  onClick={() => setShowMoreSpecs(!showMoreSpecs)}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  {showMoreSpecs ? 'Show Less' : 'More'}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {displayedSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{spec.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Table */}
        {activeTab === 'details' && (
          <div className="bg-white px-4 py-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Item Date
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Item No
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {item._id?.slice(-8) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Brand
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {item.category}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Type
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {item.category}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Condition
                </span>
                <span className={`text-sm font-semibold ${
                  item.isSecondHand === true ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {item.isSecondHand === true ? 'Second Hand' : 'New'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Location Tab Content */}
        {activeTab === 'location' && (
          <div className="bg-white px-4 py-6">
            <div className="text-center text-gray-600">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium mb-1">Shipping Available</p>
              <p className="text-sm">This item can be shipped to your location</p>
            </div>
          </div>
        )}

        {/* Description Section */}
        {item.description && activeTab === 'details' && (
          <div className="bg-white px-4 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>
        )}

        {/* Additional Details */}
        {activeTab === 'details' && (
          <div className="bg-white px-4 py-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Case Type</span>
              <span className="text-sm font-semibold text-gray-900">
                {item.compatibility?.formFactor || 'Standard'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Button - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg z-50 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex gap-2 sm:gap-3">
          <button
            onClick={handleAddToConfig}
            className="flex-1 bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-sm sm:text-base"
            disabled={item.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add to Config</span>
          </button>
          <button
            onClick={handleCall}
            className="flex-1 bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Contact</span>
          </button>
        </div>
      </div>

      {/* Desktop Layout - Only visible on desktop (md and above) */}
      <div className="hidden md:block">
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
                {item.isSecondHand === true ? (
                  <span className="badge-warning text-sm font-semibold">
                    Second Hand
                  </span>
                ) : (
                  <span className="badge-success text-sm font-semibold">
                    New
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.name}</h1>
              <div className="flex items-baseline gap-3 mb-6 flex-wrap">
                <span className="text-4xl font-bold text-primary-600">
                  ${item.price?.toLocaleString() || '0'}
                </span>
                {item.isSecondHand === true ? (
                  <span className="badge-warning text-sm font-semibold">
                    Second Hand Item
                  </span>
                ) : (
                  <span className="badge-success text-sm font-semibold">
                    Brand New
                  </span>
                )}
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
    </div>
  )
}

export default ItemDetail
