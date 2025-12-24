import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../translations/en'
import { tr } from '../translations/tr'

const translations = {
  en,
  tr,
}

export const useTranslation = () => {
  const { language } = useLanguage()

  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Fallback to English if translation not found
        value = translations.en
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey]
          } else {
            return key // Return key if translation not found
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters in translation string
    if (params && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match
      })
    }

    return value
  }

  return { t, language }
}

