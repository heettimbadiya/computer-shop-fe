import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Cpu, 
  CircuitBoard, 
  HardDrive, 
  Database, 
  Monitor, 
  Zap, 
  Box,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
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

const PartSelector = ({ category, parts, selectedPartId, onSelect, allParts }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const selectedPart = allParts.find(p => p._id === selectedPartId)
  const Icon = categoryIcons[category] || Package

  const handleSelect = (partId) => {
    onSelect(partId)
    setIsExpanded(false)
  }

  const handleClear = () => {
    onSelect(null)
    setIsExpanded(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{category}</h3>
        </div>
        {selectedPart && (
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {selectedPart ? (
        <div className="card-hover border-2 border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50/50 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                <h4 className="font-bold text-gray-900 text-lg">{selectedPart.name}</h4>
                {selectedPart.isSecondHand === true ? (
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
                <span className="text-2xl font-bold text-primary-600">
                  ${selectedPart.price.toLocaleString()}
                </span>
              </div>
              {selectedPart.compatibility && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedPart.compatibility.socket && (
                    <span className="badge-primary">
                      Socket: {selectedPart.compatibility.socket}
                    </span>
                  )}
                  {selectedPart.compatibility.ddrVersion && (
                    <span className="badge-info">
                      {selectedPart.compatibility.ddrVersion}
                    </span>
                  )}
                  {selectedPart.compatibility.formFactor && (
                    <span className="badge-success">
                      {selectedPart.compatibility.formFactor}
                    </span>
                  )}
                  {selectedPart.compatibility.wattage && (
                    <span className="badge-warning">
                      {selectedPart.compatibility.wattage}W
                    </span>
                  )}
                </div>
              )}
              <Link
                to={`/items/${selectedPart._id}`}
                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-secondary text-sm shrink-0"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <span>Change</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="card border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-300">
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-gray-400" strokeWidth={2} />
            </div>
            <p className="text-gray-600 font-medium mb-4">No {category.toLowerCase()} selected</p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-primary"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Options</span>
                </>
              ) : (
                <>
                  <span>Select {category}</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="animate-fade-in-up">
          {parts.length === 0 ? (
            <div className="card text-center py-8 bg-gray-50">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium">No compatible {category.toLowerCase()} available</p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedPartId
                  ? 'Please select compatible parts first'
                  : 'Loading compatible parts...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {parts
                  .filter(part => part._id !== selectedPartId)
                  .map((part) => (
                <div
                  key={part._id}
                  className={`group text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    selectedPartId === part._id
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50/50 shadow-lg shadow-primary-500/10 scale-[1.02]'
                      : 'border-gray-200 hover:border-primary-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {part.name}
                        </h4>
                        {part.isSecondHand === true ? (
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
                        <span className="text-xl font-bold text-primary-600">
                          ${part.price.toLocaleString()}
                        </span>
                      </div>
                      {part.compatibility && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {part.compatibility.socket && (
                            <span className="badge-primary text-xs">
                              {part.compatibility.socket}
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
                      {part.stock !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                          <Package className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Stock: <span className="font-semibold">{part.stock}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedPartId === part._id && (
                      <CheckCircle2 className="w-6 h-6 text-primary-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleSelect(part._id)}
                      className="flex-1 btn-primary text-sm"
                    >
                      Select
                </button>
                    <Link
                      to={`/items/${part._id}`}
                      className="btn-secondary text-sm flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PartSelector

