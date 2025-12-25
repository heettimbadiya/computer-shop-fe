// Currency configuration
let CURRENCY_CONFIG = {
  en: {
    symbol: '$',
    code: 'USD',
    exchangeRate: 1, // Base currency
  },
  tr: {
    symbol: '₺',
    code: 'TRY',
    exchangeRate: 34.5, // Default rate, will be updated from backend
  },
}

// Cache for exchange rate
let exchangeRateCache = {
  rate: 34.5,
  lastFetched: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
}

/**
 * Initialize exchange rate from backend
 * @returns {Promise<void>}
 */
export const initializeExchangeRate = async () => {
  try {
    const { getSettings } = await import('../services/api')
    const settings = await getSettings()
    if (settings?.currency?.usdToTryRate) {
      const rate = parseFloat(settings.currency.usdToTryRate)
      if (!isNaN(rate) && rate > 0) {
        CURRENCY_CONFIG.tr.exchangeRate = rate
        exchangeRateCache.rate = rate
        exchangeRateCache.lastFetched = new Date()
      }
    }
  } catch (error) {
    console.error('Error initializing exchange rate:', error)
    // Use default rate if fetch fails
  }
}

/**
 * Update exchange rate (called when admin updates it)
 * @param {number} rate - New exchange rate
 */
export const updateExchangeRate = (rate) => {
  const numRate = typeof rate === 'number' ? rate : parseFloat(rate)
  if (!isNaN(numRate) && numRate > 0) {
    CURRENCY_CONFIG.tr.exchangeRate = numRate
    exchangeRateCache.rate = numRate
    exchangeRateCache.lastFetched = new Date()
  }
}

/**
 * Get current exchange rate (with caching)
 * @returns {Promise<number>}
 */
export const getExchangeRate = async () => {
  const now = new Date()
  const shouldRefresh = !exchangeRateCache.lastFetched || 
    (now - exchangeRateCache.lastFetched) > exchangeRateCache.cacheDuration

  if (shouldRefresh) {
    try {
      await initializeExchangeRate()
    } catch (error) {
      console.error('Error refreshing exchange rate:', error)
    }
  }

  return exchangeRateCache.rate
}

/**
 * Format price based on current language (synchronous - uses cached rate)
 * @param {number} price - Price in USD
 * @param {string} language - Current language ('en' or 'tr')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, language = 'en') => {
  // Ensure price is a valid number
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  if (isNaN(numPrice)) return '$0'
  
  const config = CURRENCY_CONFIG[language] || CURRENCY_CONFIG.en
  // Ensure exchange rate is a valid number
  const rate = typeof config.exchangeRate === 'number' ? config.exchangeRate : parseFloat(config.exchangeRate) || 1
  const convertedPrice = numPrice * rate
  
  return `${config.symbol}${convertedPrice.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Get currency symbol based on language
 * @param {string} language - Current language ('en' or 'tr')
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (language = 'en') => {
  const config = CURRENCY_CONFIG[language] || CURRENCY_CONFIG.en
  return config.symbol
}

/**
 * Get currency code based on language
 * @param {string} language - Current language ('en' or 'tr')
 * @returns {string} Currency code
 */
export const getCurrencyCode = (language = 'en') => {
  const config = CURRENCY_CONFIG[language] || CURRENCY_CONFIG.en
  return config.code
}

/**
 * Convert price from USD to target currency
 * @param {number} priceUSD - Price in USD
 * @param {string} language - Target language ('en' or 'tr')
 * @returns {number} Converted price
 */
export const convertPrice = (priceUSD, language = 'en') => {
  const numPrice = typeof priceUSD === 'number' ? priceUSD : parseFloat(priceUSD) || 0
  if (isNaN(numPrice)) return 0
  
  const config = CURRENCY_CONFIG[language] || CURRENCY_CONFIG.en
  const rate = typeof config.exchangeRate === 'number' ? config.exchangeRate : parseFloat(config.exchangeRate) || 1
  return numPrice * rate
}

