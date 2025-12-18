const Header = ({ isAdmin, onToggleAdmin }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Computer Shop</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 hidden md:block">
              {isAdmin ? 'Admin Dashboard' : 'Custom PC Builder'}
            </p>
            <button
              onClick={onToggleAdmin}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isAdmin
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAdmin ? '← Customer View' : 'Admin Panel'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

