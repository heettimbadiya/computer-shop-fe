import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Default to Turkish - this ensures the website opens in Turkish by default
    const savedLanguage = localStorage.getItem('appLanguage')
    
    // If no language is saved, default to Turkish
    if (!savedLanguage) {
      return 'tr'
    }
    
    // Check if this is the first time loading with Turkish as default
    // If user had 'en' saved before, migrate to Turkish as default
    const hasMigrated = localStorage.getItem('languageMigratedToTurkish')
    if (!hasMigrated && savedLanguage === 'en') {
      // Migrate to Turkish as default, but allow user to switch back
      localStorage.setItem('languageMigratedToTurkish', 'true')
      return 'tr'
    }
    
    // Use saved language preference
    return savedLanguage
  })

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('appLanguage', language)
  }, [language])

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

