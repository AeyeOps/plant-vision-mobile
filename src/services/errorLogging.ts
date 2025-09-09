import * as Sentry from '@sentry/react'

export interface ErrorContext {
  userId?: string
  action?: string
  context?: string
  metadata?: Record<string, any>
}

class ErrorLoggingService {
  private initialized = false

  init() {
    if (this.initialized) return
    
    const dsn = import.meta.env.VITE_SENTRY_DSN
    
    // Only initialize if we have a valid DSN
    if (dsn && dsn !== 'your_sentry_dsn_here') {
      try {
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE,
          integrations: [
            // Browser tracing without the problematic constructor
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        })
        
        this.initialized = true
        console.log('[ErrorLogging] Sentry initialized')
      } catch (error) {
        console.warn('[ErrorLogging] Failed to initialize Sentry:', error)
      }
    } else {
      console.log('[ErrorLogging] Sentry DSN not configured - using console logging only')
    }
  }

  logError(error: Error, context?: ErrorContext) {
    console.error('[Error]', error, context)
    
    if (this.initialized) {
      Sentry.withScope(scope => {
        if (context?.userId) {
          scope.setUser({ id: context.userId })
        }
        if (context?.action) {
          scope.setTag('action', context.action)
        }
        if (context?.metadata) {
          scope.setContext('metadata', context.metadata)
        }
        Sentry.captureException(error)
      })
    }
  }

  logWarning(message: string, context?: ErrorContext) {
    console.warn('[Warning]', message, context)
    
    if (this.initialized) {
      Sentry.captureMessage(message, 'warning')
    }
  }

  logInfo(message: string, context?: ErrorContext) {
    console.info('[Info]', message, context)
    
    if (this.initialized && import.meta.env.MODE !== 'production') {
      Sentry.captureMessage(message, 'info')
    }
  }

  setUser(userId: string, email?: string, username?: string) {
    if (this.initialized) {
      Sentry.setUser({
        id: userId,
        email,
        username
      })
    }
  }

  clearUser() {
    if (this.initialized) {
      Sentry.setUser(null)
    }
  }

  addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel) {
    if (this.initialized) {
      Sentry.addBreadcrumb({
        message,
        category,
        level: level || 'info',
        timestamp: Date.now() / 1000
      })
    }
  }
}

export const errorLogger = new ErrorLoggingService()