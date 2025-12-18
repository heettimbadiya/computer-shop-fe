import { useState } from 'react'

const PartSelector = ({ category, parts, selectedPartId, onSelect, allParts }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const selectedPart = allParts.find(p => p._id === selectedPartId)

  const handleSelect = (partId) => {
    onSelect(partId)
    setIsExpanded(false)
  }

  const handleClear = () => {
    onSelect(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
        {selectedPart && (
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {selectedPart ? (
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{selectedPart.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                ${selectedPart.price.toLocaleString()}
              </p>
              {selectedPart.compatibility && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPart.compatibility.socket && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Socket: {selectedPart.compatibility.socket}
                    </span>
                  )}
                  {selectedPart.compatibility.ddrVersion && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {selectedPart.compatibility.ddrVersion}
                    </span>
                  )}
                  {selectedPart.compatibility.formFactor && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {selectedPart.compatibility.formFactor}
                    </span>
                  )}
                  {selectedPart.compatibility.wattage && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {selectedPart.compatibility.wattage}W
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {isExpanded ? 'Hide' : 'Change'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <p className="text-gray-500 mb-3">No {category.toLowerCase()} selected</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary text-sm"
          >
            {isExpanded ? 'Hide Options' : 'Select ' + category}
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 animate-fade-in">
          {parts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No compatible {category.toLowerCase()} available</p>
              <p className="text-sm mt-1">
                {selectedPartId
                  ? 'Please select compatible parts first'
                  : 'Loading...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {parts.map((part) => (
                <button
                  key={part._id}
                  onClick={() => handleSelect(part._id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    selectedPartId === part._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{part.name}</h4>
                      <p className="text-lg font-bold text-blue-600 mt-1">
                        ${part.price.toLocaleString()}
                      </p>
                      {part.compatibility && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {part.compatibility.socket && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {part.compatibility.socket}
                            </span>
                          )}
                          {part.compatibility.ddrVersion && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              {part.compatibility.ddrVersion}
                            </span>
                          )}
                          {part.compatibility.formFactor && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              {part.compatibility.formFactor}
                            </span>
                          )}
                          {part.compatibility.wattage && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                              {part.compatibility.wattage}W
                            </span>
                          )}
                        </div>
                      )}
                      {part.stock !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {part.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PartSelector

