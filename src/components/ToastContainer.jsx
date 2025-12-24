import { useState, useCallback } from 'react'
import Toast from './Toast'

let toastId = 0

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = toastId++
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { showToast, removeToast, toasts }
}

export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 bottom-auto left-3 sm:left-auto z-50 flex flex-col gap-2 w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-md">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 + index 
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

