import Dexie from 'dexie';

export interface Inspection {
  id?: number;
  uuid: string;
  tagId: string;
  tagName: string;  
  timestamp: Date;
  readings: {
    temperature?: number;
    pressure?: number;
    flowRate?: number;
    vibration?: number;
  };
  notes: string;
  photos: string[]; // base64
  status: 'draft' | 'complete' | 'synced';
  createdBy: string;
  location?: { lat: number; lng: number };
  syncedAt?: Date;
  updatedAt: Date;
}

export interface SyncQueueItem {
  id?: number;
  entityId: string; // UUID of the entity
  entity: 'inspection';
  operation: 'create' | 'update' | 'delete';
  createdAt: Date;
  data?: any; // Optional snapshot of data at time of queue
}

export class PlantVisionDatabase extends Dexie {
  inspections!: Dexie.Table<Inspection, number>
  syncQueue!: Dexie.Table<SyncQueueItem, number>

  constructor() {
    super('PlantVisionDatabase');
    this.version(1).stores({
      inspections: '++id, uuid, tagId, tagName, timestamp, status, createdBy',
      syncQueue: '++id, entityId, entity, operation, createdAt'
    });

    this.inspections = this.table('inspections');
    this.syncQueue = this.table('syncQueue');
  }

  async addInspection(inspection: Inspection) {
    return this.transaction('rw', this.inspections, this.syncQueue, async () => {
      const id = await this.inspections.add({
        ...inspection,
        updatedAt: new Date()
      });

      // Add to sync queue if not already synced
      if (inspection.status !== 'synced') {
        await this.syncQueue.add({
          entityId: inspection.uuid,
          entity: 'inspection',
          operation: 'create',
          createdAt: new Date(),
          data: inspection
        });
      }

      return id;
    });
  }

  async getAllInspections() {
    return this.inspections.toArray();
  }

  async getInspectionById(id: number) {
    return this.inspections.get(id);
  }

  async updateInspection(id: number, updates: Partial<Inspection>) {
    return this.transaction('rw', this.inspections, this.syncQueue, async () => {
      await this.inspections.update(id, {
        ...updates,
        updatedAt: new Date()
      });

      // Re-add to sync queue if not synced
      const inspection = await this.getInspectionById(id);
      if (inspection && inspection.status !== 'synced') {
        // Remove existing sync queue entry for this entity
        await this.syncQueue.where('entityId').equals(inspection.uuid).delete();
        
        // Add new sync queue entry
        await this.syncQueue.add({
          entityId: inspection.uuid,
          entity: 'inspection',
          operation: 'update',
          createdAt: new Date(),
          data: inspection
        });
      }
    });
  }

  async deleteInspection(id: number) {
    return this.transaction('rw', this.inspections, this.syncQueue, async () => {
      // Get the inspection to store uuid for sync queue
      const inspection = await this.getInspectionById(id);
      
      if (inspection) {
        // Add delete operation to sync queue if inspection was synced before
        if (inspection.status === 'synced') {
          await this.syncQueue.add({
            entityId: inspection.uuid,
            entity: 'inspection',
            operation: 'delete',
            createdAt: new Date(),
            data: inspection
          });
        } else {
          // Remove from sync queue if not synced yet (no need to sync delete)
          await this.syncQueue.where('entityId').equals(inspection.uuid).delete();
        }
      }
      
      await this.inspections.delete(id);
    });
  }
}

export const db = new PlantVisionDatabase();