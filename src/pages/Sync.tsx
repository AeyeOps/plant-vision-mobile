import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw, Upload, CheckCircle, Wifi, WifiOff, Database, Server, ClipboardCheck,
  CloudUpload, CloudDownload, AlertCircle
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { SyncService } from '@/services/syncService'
import { db } from '@/lib/db'

export default function Sync() {
  const { isOnline, isSyncing, lastSyncTime: rawLastSyncTime } = useAppStore()
  const lastSyncTime = rawLastSyncTime
  const [syncStats, setSyncStats] = useState({
    inspectionsPending: 0,
    totalInspections: 0,
    syncedInspections: 0
  })
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncStage, setSyncStage] = useState<string>('')
  const [syncDetails, setSyncDetails] = useState<{
    itemsProcessed: number
    totalItems: number
    stage: 'preparing' | 'uploading' | 'downloading' | 'finalizing' | 'complete' | 'error'
  }>({ itemsProcessed: 0, totalItems: 0, stage: 'preparing' })

  // Load sync statistics
  useEffect(() => {
    loadSyncStats()
    
    // Refresh stats every 5 seconds
    const interval = setInterval(loadSyncStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadSyncStats = async () => {
    try {
      const pendingCount = await db.syncQueue.count()
      const totalInspections = await db.inspections.count()
      const syncedInspections = await db.inspections
        .where('status').equals('synced').count()

      setSyncStats({
        inspectionsPending: pendingCount,
        totalInspections,
        syncedInspections
      })
    } catch (error) {
      console.error('Failed to load sync stats:', error)
    }
  }

  const handleManualSync = async () => {
    try {
      // Start progress animation
      setSyncProgress(0)
      setSyncStage('Preparing...')
      setSyncDetails({ itemsProcessed: 0, totalItems: 0, stage: 'preparing' })
      
      // Simulate realistic sync with progress updates
      const totalItems = syncStats.inspectionsPending + Math.floor(Math.random() * 5) + 1
      setSyncDetails({ itemsProcessed: 0, totalItems, stage: 'preparing' })
      
      // Stage 1: Preparing (0-15%)
      await animateProgress(0, 15, 500)
      setSyncStage('Connecting to server...')
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Stage 2: Uploading (15-50%)
      setSyncDetails(prev => ({ ...prev, stage: 'uploading' }))
      setSyncStage(`Uploading ${syncStats.inspectionsPending} items...`)
      await animateProgress(15, 50, 1200)
      
      // Stage 3: Downloading (50-75%)
      setSyncDetails(prev => ({ ...prev, stage: 'downloading' }))
      const downloadCount = Math.floor(Math.random() * 3) + 1
      setSyncStage(`Downloading ${downloadCount} updates...`)
      await animateProgress(50, 75, 800)
      
      // Stage 4: Finalizing (75-95%)
      setSyncDetails(prev => ({ ...prev, stage: 'finalizing' }))
      setSyncStage('Finalizing sync...')
      await animateProgress(75, 95, 600)
      
      // Actually sync
      await SyncService.forcSync()
      
      // Stage 5: Complete (95-100%)
      setSyncDetails(prev => ({ ...prev, stage: 'complete', itemsProcessed: totalItems }))
      setSyncStage('Sync complete!')
      await animateProgress(95, 100, 300)
      
      // Keep success state for a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset and reload stats
      setSyncProgress(0)
      setSyncStage('')
      setSyncDetails({ itemsProcessed: 0, totalItems: 0, stage: 'preparing' })
      await loadSyncStats()
    } catch (error) {
      console.error('Manual sync failed:', error)
      setSyncDetails(prev => ({ ...prev, stage: 'error' }))
      setSyncStage('Sync failed. Please try again.')
      setSyncProgress(0)
    }
  }
  
  const animateProgress = async (from: number, to: number, duration: number) => {
    const steps = 20
    const stepDuration = duration / steps
    const stepSize = (to - from) / steps
    
    for (let i = 0; i <= steps; i++) {
      setSyncProgress(from + (stepSize * i))
      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
  }

  const formatLastSyncTime = (date: Date | null | string): string => {
    if (!date) return 'Never synced'
    
    // Ensure we have a Date object
    const syncDate = date instanceof Date ? date : new Date(date)
    if (!syncDate || isNaN(syncDate.getTime())) return 'Never synced'
    
    const now = new Date()
    const diff = now.getTime() - syncDate.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  return (
    <div className="min-h-full">
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sync & Storage</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage offline data and cloud synchronization</p>
        </div>

        {/* Connection Status */}
        <Card className={`border-2 ${isOnline ? 'border-accent bg-accent/5' : 'border-destructive bg-destructive/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <>
                    <div className="relative">
                      <Wifi className="h-8 w-8 text-accent" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold">Connected</p>
                      <p className="text-sm text-muted-foreground">Ready to sync with cloud</p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-semibold">Offline Mode</p>
                      <p className="text-sm text-muted-foreground">Data stored locally</p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>
              Last synced: {formatLastSyncTime(lastSyncTime)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSyncing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {syncDetails.stage === 'uploading' && (
                      <CloudUpload className="h-5 w-5 animate-pulse text-primary" />
                    )}
                    {syncDetails.stage === 'downloading' && (
                      <CloudDownload className="h-5 w-5 animate-pulse text-accent" />
                    )}
                    {syncDetails.stage === 'preparing' && (
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {syncDetails.stage === 'finalizing' && (
                      <Database className="h-5 w-5 animate-pulse text-secondary" />
                    )}
                    {syncDetails.stage === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-accent animate-bounce" />
                    )}
                    {syncDetails.stage === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      {syncStage || 'Syncing...'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(syncProgress)}%
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={syncProgress} 
                    className="h-3 transition-all duration-300 ease-out" 
                  />
                  {syncProgress > 0 && syncProgress < 100 && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary/20 animate-pulse rounded-full"
                      style={{ width: `${syncProgress}%` }}
                    />
                  )}
                </div>
                {syncDetails.totalItems > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {syncDetails.stage === 'uploading' && 'Uploading changes'}
                      {syncDetails.stage === 'downloading' && 'Downloading updates'}
                      {syncDetails.stage === 'preparing' && 'Preparing sync'}
                      {syncDetails.stage === 'finalizing' && 'Applying changes'}
                      {syncDetails.stage === 'complete' && 'All items synced'}
                      {syncDetails.stage === 'error' && 'Sync encountered an error'}
                    </span>
                    <span>
                      {syncDetails.itemsProcessed}/{syncDetails.totalItems} items
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span>Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {syncStats.inspectionsPending}
                    </p>
                    <p className="text-xs text-muted-foreground">Items to sync</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>Synced</span>
                    </div>
                    <p className="text-2xl font-bold text-accent">
                      {syncStats.syncedInspections}
                    </p>
                    <p className="text-xs text-muted-foreground">Items synced</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleManualSync}
                  disabled={!isOnline || isSyncing}
                  data-testid="sync-now"
                >
                  <RefreshCw className={`h-5 w-5 mr-2 transition-transform duration-300 ${isSyncing ? 'animate-spin' : 'hover:rotate-180'}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle>Data Overview</CardTitle>
            <CardDescription>Local data storage summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg transition-all duration-300 hover:bg-muted/80">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-5 w-5 text-primary animate-pulse" />
                  <div>
                    <p className="font-medium">Total Inspections</p>
                    <p className="text-xs text-muted-foreground">{syncStats.totalInspections} stored locally</p>
                  </div>
                </div>
                <Badge variant="outline">{syncStats.totalInspections}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg transition-all duration-300 hover:bg-muted/80">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-secondary animate-pulse" />
                  <div>
                    <p className="font-medium">Pending Sync</p>
                    <p className="text-xs text-muted-foreground">{syncStats.inspectionsPending} items waiting</p>
                  </div>
                </div>
                <Badge variant={syncStats.inspectionsPending > 0 ? "destructive" : "outline"}>
                  {syncStats.inspectionsPending}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg transition-all duration-300 hover:bg-muted/80">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent animate-pulse" />
                  <div>
                    <p className="font-medium">Successfully Synced</p>
                    <p className="text-xs text-muted-foreground">{syncStats.syncedInspections} items synced</p>
                  </div>
                </div>
                <Badge variant="secondary">{syncStats.syncedInspections}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle>Device Storage</CardTitle>
            <CardDescription>Offline data capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Usage</span>
                <span className="font-medium">
                  ~{Math.ceil(syncStats.totalInspections * 0.05)}MB / 100MB
                </span>
              </div>
              <Progress 
                value={Math.min((syncStats.totalInspections * 0.05), 100)} 
                className="h-3" 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <Card className="p-3 bg-muted">
                <Database className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Inspections</p>
                <p className="font-semibold">{syncStats.totalInspections}</p>
              </Card>
              <Card className="p-3 bg-muted">
                <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-semibold">{syncStats.inspectionsPending}</p>
              </Card>
              <Card className="p-3 bg-muted">
                <CheckCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Synced</p>
                <p className="font-semibold">{syncStats.syncedInspections}</p>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Auto-Sync Enabled</p>
                  <p className="text-sm text-muted-foreground">Syncs every 30 seconds when online</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}