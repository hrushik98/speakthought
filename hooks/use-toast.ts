'use client'

import React, { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

let toastStore: ToastStore = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
}

let listeners: Array<() => void> = []

const subscribe = (listener: () => void) => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

const notify = () => {
  listeners.forEach(listener => listener())
}

toastStore.addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast,
  }
  
  toastStore.toasts.push(newToast)
  notify()
  
  // Auto remove after duration
  setTimeout(() => {
    toastStore.removeToast(id)
  }, newToast.duration)
}

toastStore.removeToast = (id: string) => {
  toastStore.toasts = toastStore.toasts.filter(toast => toast.id !== id)
  notify()
}

export function useToast() {
  const [, forceUpdate] = useState({})
  
  const refresh = useCallback(() => {
    forceUpdate({})
  }, [])
  
  // Subscribe to store changes
  React.useEffect(() => {
    return subscribe(refresh)
  }, [refresh])
  
  return {
    toast: toastStore.addToast,
    toasts: toastStore.toasts,
    dismiss: toastStore.removeToast,
  }
}