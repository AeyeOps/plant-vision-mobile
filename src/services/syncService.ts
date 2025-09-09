import { db } from '@/lib/db'
import type { Inspection, SyncQueueItem } from '@/lib/db'
import { mockApi } from './mockApi'
import { useAppStore } from '@/stores/useAppStore'

export class SyncService {
  private static isSyncing = false
  private static syncInterval: NodeJS.Timeout | null = null
  private static retryCount = 0
  private static maxRetries = 3
  
  // Start sync process
  static async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...')
      return
    }
    
    const store = useAppStore.getState()
    if (!store.isOnline) {
      console.log('Device is offline, sync skipped')
      return
    }
    
    try {
      this.isSyncing = true
      store.setSyncing(true)
      
      console.log('Starting sync process...')
      
      // 1. Push local changes
      await this.pushChanges()
      
      // 2. Pull remote changes
      await this.pullChanges()
      
      // 3. Update sync time and reset counters
      store.setLastSyncTime(new Date())
      await this.updatePendingSyncCount()
      
      // Reset retry count on successful sync
      this.retryCount = 0
      console.log('Sync completed successfully')
      
    } catch (error) {
      console.error('Sync failed:', error)
      this.retryCount++
      
      if (this.retryCount < this.maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, this.retryCount) * 1000 // 2s, 4s, 8s
        console.log(`Retrying sync in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`)
        setTimeout(() => this.sync(), delay)
      } else {
        console.error(`Sync failed after ${this.maxRetries} attempts`)
        this.retryCount = 0 // Reset for future syncs
      }
    } finally {
      this.isSyncing = false
      store.setSyncing(false)
    }
  }
  
  // Push local changes to server
  private static async pushChanges(): Promise<void> {
    console.log('Pushing local changes...')
    
    const queue = await db.syncQueue.toArray()
    if (queue.length === 0) {
      console.log('No items in sync queue')
      return
    }
    
    console.log(`Found ${queue.length} items in sync queue`)
    
    // Process in batches of 50
    const batchSize = 50
    const batches = []
    for (let i = 0; i < queue.length; i += batchSize) {
      batches.push(queue.slice(i, i + batchSize))
    }
    
    for (const batch of batches) {
      await this.processSyncBatch(batch)
    }
  }
  
  // Process a batch of sync queue items
  private static async processSyncBatch(batch: SyncQueueItem[]): Promise<void> {
    const inspectionsToSync: Inspection[] = []
    
    for (const item of batch) {
      if (item.entity === 'inspection') {
        if (item.operation === 'delete') {
          // For deletes, we already have the data in the queue item
          if (item.data) {
            inspectionsToSync.push(item.data)
          }
        } else {
          // For create/update, get latest data from database
          const inspection = await db.inspections
            .where('uuid').equals(item.entityId).first()
          if (inspection) {
            inspectionsToSync.push(inspection)
          }
        }
      }
    }
    
    if (inspectionsToSync.length > 0) {
      console.log(`Syncing ${inspectionsToSync.length} inspections...`)
      
      const result = await mockApi.syncPush(inspectionsToSync)
      
      if (result.success && result.synced && result.synced > 0) {
        console.log(`Successfully synced ${result.synced} items`)
        
        // Mark inspections as synced and clear from sync queue
        for (const inspection of inspectionsToSync) {
          // Update inspection status
          await db.inspections
            .where('uuid').equals(inspection.uuid)
            .modify({ 
              status: 'synced', 
              syncedAt: new Date() 
            })
          
          // Remove from sync queue
          await db.syncQueue
            .where('entityId').equals(inspection.uuid)
            .delete()
        }
      }
    }
  }
  
  // Pull remote changes from server
  private static async pullChanges(): Promise<void> {
    console.log('Pulling remote changes...')
    
    const store = useAppStore.getState()
    const lastSync = store.lastSyncTime
    
    const response = await mockApi.syncPull(lastSync)
    
    if (!response.success || !response.data) {
      console.error('Failed to pull changes:', response.error)
      return
    }
    
    const remoteData = response.data
    console.log(`Found ${remoteData.length} remote changes`)
    
    for (const remoteItem of remoteData) {
      await this.processRemoteItem(remoteItem)
    }
  }
  
  // Process a single remote item with conflict resolution
  private static async processRemoteItem(remoteItem: Inspection): Promise<void> {
    // Check if we have this item locally
    const localItem = await db.inspections
      .where('uuid').equals(remoteItem.uuid).first()
    
    if (localItem) {
      // Conflict resolution: Last write wins
      const remoteTime = new Date(remoteItem.updatedAt).getTime()
      const localTime = new Date(localItem.updatedAt).getTime()
      
      if (remoteTime > localTime) {
        console.log(`Updating local item ${remoteItem.uuid} with remote changes`)
        await db.inspections
          .where('uuid').equals(remoteItem.uuid)
          .modify({
            ...remoteItem,
            status: 'synced',
            syncedAt: new Date()
          })
      } else {
        console.log(`Local item ${remoteItem.uuid} is newer, keeping local version`)
      }
    } else {
      // New item from server
      console.log(`Adding new item from server: ${remoteItem.uuid}`)
      await db.inspections.add({
        ...remoteItem,
        status: 'synced',
        syncedAt: new Date()
      })
    }
  }
  
  // Update pending sync count in store
  private static async updatePendingSyncCount(): Promise<void> {
    const pendingCount = await db.syncQueue.count()
    useAppStore.getState().setPendingSyncCount(pendingCount)
  }
  
  // Start auto-sync with configurable interval
  static startAutoSync(intervalMs: number = 30000): void {
    console.log(`Starting auto-sync with ${intervalMs}ms interval`)
    
    this.stopAutoSync()
    this.syncInterval = setInterval(() => {
      this.sync()
    }, intervalMs)
    
    // Initial sync
    this.sync()
  }
  
  // Stop auto-sync
  static stopAutoSync(): void {
    if (this.syncInterval) {
      console.log('Stopping auto-sync')
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
  
  // Get sync statistics
  static async getSyncStats(): Promise<{
    pendingCount: number
    lastSyncTime: Date | null
    isSyncing: boolean
    isOnline: boolean
  }> {
    const store = useAppStore.getState()
    const pendingCount = await db.syncQueue.count()
    
    return {
      pendingCount,
      lastSyncTime: store.lastSyncTime,
      isSyncing: store.isSyncing,
      isOnline: store.isOnline
    }
  }
  
  // Force sync now (ignores cooldown)
  static async forcSync(): Promise<void> {
    this.isSyncing = false // Reset flag
    await this.sync()
  }
  
  // Clear all pending sync items (for testing/reset)
  static async clearSyncQueue(): Promise<void> {
    await db.syncQueue.clear()
    await this.updatePendingSyncCount()
    console.log('Sync queue cleared')
  }
}

// Expose to window for testing
if (typeof window !== 'undefined') {
  (window as any).SyncService = SyncService
}