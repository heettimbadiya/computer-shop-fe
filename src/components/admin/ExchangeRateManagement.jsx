import { useState, useEffect } from 'react'
import { getSettings, updateExchangeRate } from '../../services/api'
import { useTranslation } from '../../hooks/useTranslation'
import { DollarSign, RefreshCw, Save, Loader2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { updateExchangeRate as updateCurrencyRate } from '../../utils/currency'

const ExchangeRateManagement = ({ showToast = () => {} }) => {
  const { t, language } = useTranslation()
  const [exchangeRate, setExchangeRate] = useState(34.5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = await getSettings()
      if (settings?.currency?.usdToTryRate) {
        const rate = parseFloat(settings.currency.usdToTryRate)
        if (!isNaN(rate) && rate > 0) {
          setExchangeRate(rate)
          setLastUpdated(settings.currency.lastUpdated)
        } else {
          setExchangeRate(34.5) // Default fallback
        }
      } else {
        setExchangeRate(34.5) // Default fallback
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setError('Failed to load exchange rate settings')
      setExchangeRate(34.5) // Default fallback on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Ensure we have a valid number
    let rate
    if (typeof exchangeRate === 'string') {
      if (exchangeRate === '') {
        setError('Exchange rate is required')
        return
      }
      rate = parseFloat(exchangeRate)
    } else {
      rate = exchangeRate
    }
    
    if (!rate || isNaN(rate) || rate <= 0) {
      setError('Exchange rate must be a positive number')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateExchangeRate(rate)
      // Update the currency utility cache
      updateCurrencyRate(rate)
      setExchangeRate(rate) // Ensure state is updated with numeric value
      setLastUpdated(new Date())
      showToast('Exchange rate updated successfully!', 'success')
      
      // Trigger a page refresh to update all displayed prices
      window.dispatchEvent(new Event('exchangeRateUpdated'))
    } catch (error) {
      console.error('Error updating exchange rate:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update exchange rate'
      setError(errorMessage)
      showToast(errorMessage, 'error', 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = async () => {
    await loadSettings()
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
      <div className="card animate-slide-up">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Exchange Rate Management</h2>
            <p className="text-xs sm:text-sm text-gray-600">Manage USD to TRY exchange rate for price conversion</p>
          </div>
        </div>
      </div>

      {/* Exchange Rate Form */}
      <form onSubmit={handleSubmit} className="card animate-slide-up">
        <div className="space-y-4 sm:space-y-6">
          {/* Current Rate Display */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-primary-50 to-accent-50/50 rounded-xl border-2 border-primary-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-semibold text-gray-700">Current Exchange Rate</span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-primary-600" />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                1 USD = {(() => {
                  const rate = typeof exchangeRate === 'number' ? exchangeRate : (typeof exchangeRate === 'string' && exchangeRate !== '' ? parseFloat(exchangeRate) : 34.5)
                  return (!isNaN(rate) && rate > 0) ? rate.toFixed(2) : '34.50'
                })()} TRY
              </span>
            </div>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {new Date(lastUpdated).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}
              </p>
            )}
          </div>

          {/* Exchange Rate Input */}
          <div>
            <label htmlFor="exchangeRate" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary-600 flex-shrink-0" />
              USD to TRY Exchange Rate
            </label>
            <div className="relative">
              <input
                type="number"
                id="exchangeRate"
                name="exchangeRate"
                value={typeof exchangeRate === 'number' ? exchangeRate : (exchangeRate === '' ? '' : parseFloat(exchangeRate) || '')}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setExchangeRate('')
                    setError(null)
                  } else {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      setExchangeRate(numValue)
                      setError(null)
                    } else {
                      setExchangeRate(value) // Allow typing, validate on submit
                    }
                  }
                }}
                step="0.01"
                min="0.01"
                placeholder="34.50"
                className={`input-field text-sm sm:text-base min-h-[48px] pr-20 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                TRY
              </span>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter the current exchange rate. This will be used to convert all USD prices to Turkish Lira when Turkish language is selected.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All prices in the database are stored in USD</li>
                  <li>When users select Turkish language, prices are automatically converted using this rate</li>
                  <li>Update this rate regularly to reflect current market conditions</li>
                  <li>Changes take effect immediately across the entire application</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto min-h-[48px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Exchange Rate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ExchangeRateManagement

