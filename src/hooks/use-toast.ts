import React, { createContext, useContext, useState } from 'react'

type ToastType = 'default' | 'success' | 'warning' | 'destructive'

interface ToastData {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id, duration: toast.duration || 3000 }
    setToasts(prev => [...prev, newToast])

    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return { toasts, addToast, removeToast }
}

export const ToastContext = createContext<ReturnType<typeof useToast> | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toastState = useToast()
  const ToastContainer = React.lazy(() => import('../components/Toast').then(m => ({ default: m.ToastContainer })))
  
  return React.createElement(
    ToastContext.Provider, 
    { value: toastState }, 
    React.createElement(React.Fragment, null,
      children,
      React.createElement(React.Suspense, { fallback: null },
        React.createElement(ToastContainer)
      )
    )
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}