import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900'
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-900'
    }
  }

  return (
    <div
      className={`w-full sm:min-w-[300px] sm:max-w-md p-3 sm:p-4 rounded-xl border-2 shadow-lg animate-slide-down ${getStyles()} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } transition-all duration-300`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs sm:text-sm break-words">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 p-1.5 sm:p-1 rounded-lg hover:bg-black/5 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast

