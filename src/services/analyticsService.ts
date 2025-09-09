interface UserProperties {
  userId?: string
  email?: string
  plan?: string
  [key: string]: any
}

class AnalyticsService {
  private initialized = false
  private amplitude: any = null

  async init() {
    if (this.initialized) return
    
    const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY
    
    // Only initialize if we have a valid API key
    if (apiKey && apiKey !== 'your_amplitude_api_key_here') {
      try {
        // Dynamically import Amplitude only when needed
        const { default: amplitude } = await import('@amplitude/analytics-browser')
        this.amplitude = amplitude
        
        this.amplitude.init(apiKey, undefined, {
          defaultTracking: {
            sessions: true,
            pageViews: true,
            formInteractions: true,
            fileDownloads: true
          },
          logLevel: import.meta.env.MODE === 'development' ? 'Verbose' : 'None'
        })
        
        this.initialized = true
        console.log('[Analytics] Amplitude initialized')
      } catch (error) {
        console.warn('[Analytics] Failed to initialize Amplitude:', error)
      }
    } else {
      console.log('[Analytics] Amplitude API key not configured - using console logging only')
    }
  }

  track(event: string, properties?: Record<string, any>) {
    console.log('[Analytics] Track:', event, properties)
    
    if (this.initialized && this.amplitude) {
      this.amplitude.track(event, properties)
    }
  }

  identify(userId: string, userProperties?: UserProperties) {
    console.log('[Analytics] Identify:', userId, userProperties)
    
    if (this.initialized && this.amplitude) {
      this.amplitude.setUserId(userId)
      if (userProperties) {
        this.amplitude.identify(new this.amplitude.Identify().set(userProperties))
      }
    }
  }

  setUserProperties(properties: UserProperties) {
    console.log('[Analytics] Set user properties:', properties)
    
    if (this.initialized && this.amplitude) {
      this.amplitude.identify(new this.amplitude.Identify().set(properties))
    }
  }

  incrementUserProperty(property: string, value: number = 1) {
    if (this.initialized && this.amplitude) {
      this.amplitude.identify(new this.amplitude.Identify().add(property, value))
    }
  }

  revenue(amount: number, productId?: string, quantity?: number) {
    console.log('[Analytics] Revenue:', { amount, productId, quantity })
    
    if (this.initialized && this.amplitude) {
      const revenue = new this.amplitude.Revenue()
        .setPrice(amount)
        .setQuantity(quantity || 1)
      
      if (productId) {
        revenue.setProductId(productId)
      }
      
      this.amplitude.revenue(revenue)
    }
  }

  reset() {
    if (this.initialized && this.amplitude) {
      this.amplitude.reset()
    }
  }

  // Track specific app events
  trackAppLaunch() {
    this.track('App Launched', {
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || 'unknown'
    })
  }

  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('Page Viewed', {
      page: pageName,
      ...properties
    })
  }

  trackInspectionCreated(inspectionId: string, tagId: string) {
    this.track('Inspection Created', {
      inspectionId,
      tagId,
      timestamp: new Date().toISOString()
    })
  }

  trackSyncCompleted(itemCount: number, duration: number) {
    this.track('Sync Completed', {
      itemCount,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  trackError(error: string, context?: Record<string, any>) {
    this.track('Error Occurred', {
      error,
      ...context,
      timestamp: new Date().toISOString()
    })
  }
}

export const analytics = new AnalyticsService()