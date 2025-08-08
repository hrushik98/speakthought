'use client'

import React from 'react'
import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm p-4 rounded-xl shadow-xl border transition-all duration-300 ease-in-out backdrop-blur-sm
            ${toast.variant === 'destructive' 
              ? 'bg-red-950/80 border-red-800/50 text-red-200' 
              : 'bg-gray-800/80 border-gray-700/50 text-white'
            }
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {toast.title && (
                <div className={`font-semibold mb-1 ${
                  toast.variant === 'destructive' ? 'text-red-100' : 'text-white'
                }`}>
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className={`text-sm ${
                  toast.variant === 'destructive' ? 'text-red-300' : 'text-gray-300'
                }`}>
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className={`ml-3 text-lg leading-none hover:opacity-70 ${
                toast.variant === 'destructive' ? 'text-red-300' : 'text-gray-400'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}