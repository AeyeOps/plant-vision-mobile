import { useEffect } from 'react'

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !window.performance) return

    const logPerformanceMetrics = () => {
      try {
        // Navigation Timing API
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          const metrics = {
            // Page Load Metrics
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
            domComplete: navigation.domComplete - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart,
            
            // Core Web Vitals (if available)
            fcp: 0,
            lcp: 0,
            fid: 0,
            cls: 0
          }

          // Try to get Paint Timing
          const paintEntries = performance.getEntriesByType('paint')
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
          if (fcp) {
            metrics.fcp = fcp.startTime
          }

          // Log metrics (in production, send to analytics)
          console.log('[Performance]', metrics)
        }

        // Observe Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          try {
            const lcpObserver = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries()
              const lastEntry = entries[entries.length - 1]
              console.log('[LCP]', lastEntry.startTime)
            })
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

            // Observe First Input Delay
            const fidObserver = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries()
              entries.forEach((entry: any) => {
                if (entry.processingStart && entry.startTime) {
                  const fid = entry.processingStart - entry.startTime
                  console.log('[FID]', fid)
                }
              })
            })
            fidObserver.observe({ entryTypes: ['first-input'] })

            // Observe Cumulative Layout Shift
            let clsValue = 0
            const clsObserver = new PerformanceObserver((entryList) => {
              for (const entry of entryList.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  clsValue += (entry as any).value
                  console.log('[CLS]', clsValue)
                }
              }
            })
            clsObserver.observe({ entryTypes: ['layout-shift'] })

            // Cleanup
            return () => {
              lcpObserver.disconnect()
              fidObserver.disconnect()
              clsObserver.disconnect()
            }
          } catch (e) {
            // PerformanceObserver not supported or error
            console.log('[Performance] Observer not supported')
          }
        }
      } catch (error) {
        console.error('[Performance] Error collecting metrics:', error)
      }
    }

    // Wait for page load
    if (document.readyState === 'complete') {
      logPerformanceMetrics()
    } else {
      window.addEventListener('load', logPerformanceMetrics)
      return () => window.removeEventListener('load', logPerformanceMetrics)
    }
  }, [])

  // Memory monitoring (if available)
  useEffect(() => {
    if (!('memory' in performance)) return

    const logMemoryUsage = () => {
      const memory = (performance as any).memory
      if (memory) {
        console.log('[Memory]', {
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
        })
      }
    }

    const interval = setInterval(logMemoryUsage, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])
}