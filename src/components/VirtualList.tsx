import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import type { Inspection } from '../lib/db'

interface VirtualInspectionListProps {
  items: Inspection[]
}

const InspectionCard: React.FC<{ inspection: Inspection }> = ({ inspection }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{inspection.tagName}</CardTitle>
          <Badge variant={inspection.status === 'complete' ? 'default' : 'outline'}>
            {inspection.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {inspection.tagId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          {new Date(inspection.timestamp).toLocaleDateString()}
        </div>
        
        {inspection.readings && Object.keys(inspection.readings).length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {inspection.readings.temperature && (
              <div className="text-sm">
                <span className="font-medium">Temp:</span> {inspection.readings.temperature}°C
              </div>
            )}
            {inspection.readings.pressure && (
              <div className="text-sm">
                <span className="font-medium">Pressure:</span> {inspection.readings.pressure} bar
              </div>
            )}
            {inspection.readings.flowRate && (
              <div className="text-sm">
                <span className="font-medium">Flow:</span> {inspection.readings.flowRate} m³/h
              </div>
            )}
            {inspection.readings.vibration && (
              <div className="text-sm">
                <span className="font-medium">Vibration:</span> {inspection.readings.vibration} mm/s
              </div>
            )}
          </div>
        )}
        
        {inspection.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {inspection.notes}
          </p>
        )}
        
        {inspection.photos && inspection.photos.length > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            📷 {inspection.photos.length} photo(s)
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function VirtualInspectionList({ items }: VirtualInspectionListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5
  })
  
  // Only use virtual scrolling for large lists (>50 items)
  if (items.length <= 50) {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <InspectionCard key={item.uuid || index} inspection={item} />
        ))}
      </div>
    )
  }
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <InspectionCard inspection={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}