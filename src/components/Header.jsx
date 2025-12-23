import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Cpu, Settings, LayoutDashboard, ArrowLeft, Package, Sparkles } from 'lucide-react'

const Header = ({ isAdmin, onToggleAdmin }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleToggleAdmin = () => {
    onToggleAdmin()
    if (!isAdmin) {
      navigate('/admin')
    } else {
      navigate('/configurator')
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-gray-200/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to={isAdmin ? '/admin' : '/configurator'} className="flex items-center space-x-4 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 transform group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                PC Builder Pro
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {isAdmin ? 'Administration' : 'Custom Configuration'}
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {!isAdmin && (
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  to="/configurator"
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                    location.pathname === '/configurator'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Configurator</span>
                </Link>
                <Link
                  to="/items"
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                    location.pathname.startsWith('/items')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Items</span>
                </Link>
              </nav>
            )}
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
              {isAdmin ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-700">Dashboard</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-700">PC Configurator</span>
                </>
              )}
            </div>
            
            <button
              onClick={handleToggleAdmin}
              className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isAdmin
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200'
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg shadow-primary-500/25'
              } transform hover:scale-105 active:scale-95 flex items-center gap-2`}
            >
              {isAdmin ? (
                <>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>Customer View</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  <span>Admin Panel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

