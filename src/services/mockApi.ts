import type { Inspection } from '@/lib/db'

export interface MockApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  synced?: number
}

export interface MockUser {
  id: string
  email: string
  name: string
  role: string
  plant: string
  token: string
}

export interface MockModel {
  modelId: string
  data: string
  size: number
}

class MockAPI {
  private delay = (min: number = 300, max: number = 1000): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, min + Math.random() * (max - min)))
  
  // Mock login endpoint
  async login(email: string, password: string): Promise<MockApiResponse<{ user: MockUser }>> {
    await this.delay()
    
    // Simple mock validation
    if (email === 'inspector@plantvision.com' && password === 'demo') {
      const user: MockUser = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0],
        role: 'inspector',
        plant: 'Plant A',
        token: 'mock-jwt-' + Date.now()
      }
      return { success: true, data: { user } }
    }
    
    throw new Error('Invalid credentials')
  }
  
  // Push local changes to mock server
  async syncPush(data: Inspection[]): Promise<MockApiResponse<{ synced: number }>> {
    // Simulate longer delay for upload based on data size
    const uploadDelay = Math.min(500 + (data.length * 100), 2000)
    await this.delay(uploadDelay, uploadDelay + 500)
    
    try {
      // Get existing server data from localStorage
      const serverData = JSON.parse(localStorage.getItem('mock-server-data') || '[]')
      let syncedCount = 0
      
      data.forEach(item => {
        const existingIndex = serverData.findIndex((s: Inspection) => s.uuid === item.uuid)
        
        if (existingIndex >= 0) {
          // Update existing item (conflict resolution: last write wins)
          if (new Date(item.updatedAt) > new Date(serverData[existingIndex].updatedAt)) {
            serverData[existingIndex] = { ...item, syncedAt: new Date() }
            syncedCount++
          }
        } else {
          // Add new item
          serverData.push({ ...item, syncedAt: new Date() })
          syncedCount++
        }
      })
      
      // Save to localStorage as mock server
      localStorage.setItem('mock-server-data', JSON.stringify(serverData))
      
      return { 
        success: true, 
        data: { synced: syncedCount },
        synced: syncedCount 
      }
    } catch (error) {
      console.error('Mock API syncPush error:', error)
      return { success: false, error: 'Failed to sync data' }
    }
  }
  
  // Pull changes from mock server
  async syncPull(lastSyncTime: Date | null = null): Promise<MockApiResponse<Inspection[]>> {
    // Simulate download delay
    await this.delay(400, 800)
    
    try {
      const serverData: Inspection[] = JSON.parse(localStorage.getItem('mock-server-data') || '[]')
      
      let filteredData = serverData
      
      if (lastSyncTime) {
        // Only return items updated since last sync
        filteredData = serverData.filter(item => 
          new Date(item.updatedAt) > lastSyncTime
        )
      }
      
      return { success: true, data: filteredData }
    } catch (error) {
      console.error('Mock API syncPull error:', error)
      return { success: false, error: 'Failed to pull data', data: [] }
    }
  }
  
  // Get 3D model data
  async getModel(modelId: string): Promise<MockApiResponse<MockModel>> {
    await this.delay()
    
    try {
      // Return mock base64 3D model data
      // For demo, return small placeholder GLTF
      const mockModel: MockModel = {
        modelId,
        data: 'data:model/gltf+json;base64,eyJ2ZXJzaW9uIjoiMi4wIn0=',
        size: 1024
      }
      
      return { success: true, data: mockModel }
    } catch (error) {
      console.error('Mock API getModel error:', error)
      return { success: false, error: 'Failed to get model' }
    }
  }
  
  // Check server health
  async healthCheck(): Promise<MockApiResponse<{ status: string; timestamp: string }>> {
    await this.delay(200, 400)
    
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    }
  }
}

export const mockApi = new MockAPI()

// Expose to window for testing
if (typeof window !== 'undefined') {
  (window as any).mockApi = mockApi
}