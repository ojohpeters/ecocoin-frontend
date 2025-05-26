"use client"

import { useState, createContext, useContext, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

// Create a context for the toast
const ToastContext = createContext(null)

// Toast types
const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
}

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])

    // Auto remove toast after duration
    if (duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  // Expose the toast functions
  const toast = {
    success: (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
    error: (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration),
    info: (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use the toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Toast container component
function ToastContainer({ toasts, removeToast }) {
  // Adjust position based on screen size
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Check on mount
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 p-4 max-w-[90vw] ${
        isMobile ? "bottom-0 left-0 right-0 items-center" : "bottom-4 right-4 max-w-sm"
      }`}
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2 rounded-lg p-4 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-right-5 w-full ${
            toast.type === TOAST_TYPES.SUCCESS
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : toast.type === TOAST_TYPES.ERROR
                ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
          }`}
        >
          {toast.type === TOAST_TYPES.SUCCESS ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : toast.type === TOAST_TYPES.ERROR ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Info className="h-5 w-5 flex-shrink-0" />
          )}
          <div className="flex-1 text-sm sm:text-base">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
