import { useLanguage } from '../contexts/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'
import { Globe } from 'lucide-react'

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ]

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md min-h-[44px]"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-primary-600" />
        <span className="hidden sm:inline">
          {languages.find(lang => lang.code === language)?.flag} {languages.find(lang => lang.code === language)?.name}
        </span>
        <span className="sm:hidden">
          {languages.find(lang => lang.code === language)?.flag}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${
              language === lang.code
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-primary-600">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSwitcher

