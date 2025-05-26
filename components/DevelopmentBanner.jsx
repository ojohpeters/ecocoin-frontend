"use client"

import { useState } from "react"
import { X, AlertTriangle, Clock } from "lucide-react"

export default function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="font-bold text-sm sm:text-base">🚧 WEBSITE IN DEVELOPMENT MODE</span>
              <span className="text-xs sm:text-sm opacity-90">• AWAITING PAYMENT FOR COMPLETION •</span>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar animation */}
        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
