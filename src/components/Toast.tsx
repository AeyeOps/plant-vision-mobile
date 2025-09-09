import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastContext } from '@/hooks/use-toast'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext()

  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
      data-radix-toast-viewport
    >
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle :
                     toast.type === 'destructive' ? AlertCircle :
                     toast.type === 'warning' ? AlertTriangle : Info

        const bgColor = toast.type === 'success' ? 'bg-green-500' :
                       toast.type === 'destructive' ? 'bg-red-500' :
                       toast.type === 'warning' ? 'bg-yellow-500' : 'bg-primary'

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg 
              bg-background border border-border max-w-sm animate-in slide-in-from-right
            `}
          >
            <div className={`${bgColor} text-white rounded-full p-1`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.description && (
                <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="pointer-events-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}