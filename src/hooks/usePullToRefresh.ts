import { useState, useCallback } from 'react'

export const usePullToRefresh = (refreshFn: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    setIsRefreshing(true)
    try {
      await refreshFn()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshFn])

  return { onRefresh, isRefreshing }
}

export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return { vibrate }
}