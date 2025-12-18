const PriceSummary = ({ selectedParts, allParts, totalPrice }) => {
  const getPart = (partId) => {
    if (!partId) return null
    return allParts.find(p => p._id === partId)
  }

  const selectedPartsList = Object.entries(selectedParts)
    .map(([category, partId]) => ({
      category,
      part: getPart(partId),
    }))
    .filter(item => item.part)

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Price Summary</h3>

      {selectedPartsList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No parts selected yet</p>
          <p className="text-sm mt-2">Start selecting parts to see the price</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {selectedPartsList.map(({ category, part }) => (
              <div
                key={category}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm animate-fade-in"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{category}</p>
                  <p className="text-sm text-gray-800 font-semibold">{part.name}</p>
                </div>
                <p className="text-sm font-bold text-blue-600">
                  ${part.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-blue-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-gray-800">
                Estimated Total
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-600 italic mt-2">
              * Price is an estimate only. Final price may vary.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default PriceSummary

