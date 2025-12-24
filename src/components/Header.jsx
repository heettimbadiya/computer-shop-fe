import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Cpu, Settings, LayoutDashboard, ArrowLeft, Package, Sparkles, Menu, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import LanguageSwitcher from './LanguageSwitcher'

const Header = ({ isAdmin, onToggleAdmin }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleToggleAdmin = () => {
    onToggleAdmin()
    setMobileMenuOpen(false)
    if (!isAdmin) {
      navigate('/admin')
    } else {
      navigate('/configurator')
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-gray-200/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link 
            to={isAdmin ? '/admin' : '/configurator'} 
            className="flex items-center space-x-2 sm:space-x-4 group cursor-pointer min-w-0 flex-1 sm:flex-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 transform group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                {t('header.title')}
              </h1>
              <p className="text-xs text-gray-500 font-medium hidden xs:block">
                {isAdmin ? t('header.adminTitle') : t('header.customerTitle')}
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {!isAdmin && (
              <>
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                  <Link
                    to="/configurator"
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                      location.pathname === '/configurator'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('header.configurator')}</span>
                  </Link>
                  <Link
                    to="/items"
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                      location.pathname.startsWith('/items')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>{t('header.items')}</span>
                  </Link>
                </nav>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              </>
            )}
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 min-h-[44px]">
              {isAdmin ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-700">{t('header.dashboard')}</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-700">{t('header.configurator')}</span>
                </>
              )}
            </div>
            
            {isAdmin && (
              <button
                onClick={handleToggleAdmin}
                className="group relative overflow-hidden px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 text-xs sm:text-sm md:text-base min-h-[44px]"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">{t('header.customerView')}</span>
                <span className="sm:hidden">{t('common.view')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !isAdmin && (
          <div className="md:hidden border-t border-gray-200 py-3 sm:py-4 animate-slide-down">
            <nav className="flex flex-col gap-2">
              <Link
                to="/configurator"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 min-h-[48px] ${
                  location.pathname === '/configurator'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('header.configurator')}</span>
              </Link>
              <Link
                to="/items"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 min-h-[48px] ${
                  location.pathname.startsWith('/items')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{t('header.items')}</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

