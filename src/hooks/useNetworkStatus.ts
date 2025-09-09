import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { SyncService } from '@/services/syncService'

export function useNetworkStatus() {
  const setOnline = useAppStore(state => state.setOnline)
  
  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine
      setOnline(isOnline)
      
      console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`)
      
      if (isOnline) {
        // Trigger sync when back online
        console.log('Device back online, triggering sync...')
        SyncService.sync()
      }
    }
    
    // Add event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Check initial status
    updateOnlineStatus()
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [setOnline])
}