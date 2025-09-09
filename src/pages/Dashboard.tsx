import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Plus, Camera, ScanLine, FileText, AlertTriangle, RefreshCw } from 'lucide-react'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { useToastContext } from '@/hooks/use-toast'

export default function Dashboard() {
  const { addToast } = useToastContext()
  const [projects] = useState([
    {
      id: 1,
      name: 'Refinery Unit A',
      division: 'Power & Process',
      progress: 87,
      status: 'Active',
      tags: 142,
      complete: 28,
      issues: 5,
    },
    {
      id: 2,
      name: 'Turbine Station B',
      division: 'Power Generation',
      progress: 62,
      status: 'Active',
      tags: 89,
      complete: 15,
      issues: 2,
    },
    {
      id: 3,
      name: 'Chemical Plant C',
      division: 'Process Engineering',
      progress: 45,
      status: 'Planning',
      tags: 201,
      complete: 8,
      issues: 12,
    },
  ])

  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    addToast({
      title: 'Projects Refreshed',
      description: 'Latest project data retrieved',
      type: 'success'
    })
  }

  const { isRefreshing } = usePullToRefresh(handleRefresh)

  return (
    <div className="min-h-full">
      <div className="relative">
        {isRefreshing && (
          <div className="absolute top-0 left-0 right-0 flex justify-center items-center py-2 bg-primary/10">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Active Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Track progress across all facilities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-l-4 border-primary hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-background to-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>{project.division}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-xl font-bold text-secondary">{project.tags}</p>
                    <p className="text-xs text-muted-foreground">Tags</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-xl font-bold text-accent">{project.complete}</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-xl font-bold text-primary">{project.issues}</p>
                    <p className="text-xs text-muted-foreground">Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="space-y-2">
            <Card className="p-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <p className="text-sm">Tag PMP-2001-A inspected successfully</p>
              <span className="text-xs text-muted-foreground ml-auto">2 mins ago</span>
            </Card>
            <Card className="p-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <p className="text-sm">New issue reported on Valve V-445</p>
              <span className="text-xs text-muted-foreground ml-auto">15 mins ago</span>
            </Card>
            <Card className="p-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <p className="text-sm">3D model sync completed for Unit A</p>
              <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button 
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Quick Actions</DrawerTitle>
            <DrawerDescription>Select an action to perform</DrawerDescription>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-4 p-6">
            <Button 
              variant="outline" 
              className="h-28 flex-col gap-3"
              onClick={() => {
                addToast({
                  title: 'Camera Opening',
                  description: 'Preparing camera for photo capture',
                  type: 'default'
                })
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Capture Photo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-28 flex-col gap-3"
              onClick={() => {
                addToast({
                  title: 'Scanner Ready',
                  description: 'Position QR code in view',
                  type: 'default'
                })
              }}
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <ScanLine className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-sm font-medium">Scan Tag</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-28 flex-col gap-3"
              onClick={() => {
                addToast({
                  title: 'Report Created',
                  description: 'New inspection report started',
                  type: 'success'
                })
              }}
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Create Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-28 flex-col gap-3"
              onClick={() => {
                addToast({
                  title: 'Issue Reported',
                  description: 'Maintenance team has been notified',
                  type: 'warning'
                })
              }}
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-sm font-medium">Report Issue</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      </div>
    </div>
  )
}