import { Receipt, ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react'

const PriceSummary = ({ selectedParts, allParts, totalPrice }) => {
  const getPart = (partId) => {
    if (!partId || !allParts) return null
    return allParts.find(p => p && p._id && (p._id === partId || p._id.toString() === partId.toString()))
  }

  const selectedPartsList = Object.entries(selectedParts || {})
    .map(([category, partId]) => ({
      category,
      part: getPart(partId),
    }))
    .filter(item => item.part)

  const allSelected = selectedPartsList.length === 7

  return (
    <div className="card bg-gradient-to-br from-primary-50 via-accent-50/50 to-primary-50 border-2 border-primary-200/50 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Receipt className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Price Summary</h3>
          <p className="text-sm text-gray-600">Build overview</p>
        </div>
      </div>

      {selectedPartsList.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">No parts selected yet</p>
          <p className="text-sm text-gray-500">Start selecting parts to see the price</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {selectedPartsList.map(({ category, part }, index) => (
              <div
                key={category}
                className="flex items-start justify-between p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{category}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{part.name}</p>
                  {part.isSecondHand === true && (
                    <span className="badge-warning text-xs font-semibold mt-1 inline-block">
                      Second Hand
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm sm:text-base font-bold text-primary-600">
                    ${(part.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {allSelected && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">All components selected!</p>
            </div>
          )}

          <div className="border-t-2 border-primary-200 pt-6 mt-6 bg-gradient-to-r from-white to-primary-50/50 -mx-6 px-6 pb-2 rounded-b-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-gray-900 block">Estimated Total</span>
                <span className="text-xs text-gray-500">Including all components</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-primary-200">
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                * Price is an estimate only. Final price may vary based on availability and promotions.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PriceSummary

