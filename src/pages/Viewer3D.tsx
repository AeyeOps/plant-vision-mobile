import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Box, Cylinder, Sphere, Torus, Text } from '@react-three/drei'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Layers, Eye, Ruler, ZoomIn, ZoomOut, RotateCw, Download, Info } from 'lucide-react'
import * as THREE from 'three'

// Refinery Tank Component
function RefineryTank({ position, height = 8, radius = 2, color = '#1e88e5', label }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  return (
    <group position={position}>
      <Cylinder 
        ref={meshRef}
        args={[radius, radius, height, 32]} 
        position={[0, height/2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      <Sphere 
        args={[radius, 16, 8]} 
        position={[0, height, 0]} 
        scale={[1, 0.5, 1]}
        castShadow
      >
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Sphere>
      
      <Cylinder 
        args={[radius * 1.2, radius * 1.2, 0.5, 32]} 
        position={[0, 0.25, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#424242" metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {label && (
        <Text
          position={[0, height/2, radius + 0.5]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  )
}

// Distillation Column
function DistillationColumn({ position }: any) {
  const columnRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (columnRef.current) {
      columnRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <group position={position}>
      <Cylinder 
        ref={columnRef}
        args={[1.5, 1.5, 12, 16]} 
        position={[0, 6, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#ff6f00" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      {[2, 4, 6, 8, 10].map((y) => (
        <Torus 
          key={y} 
          args={[1.3, 0.1, 8, 16]} 
          position={[0, y, 0]} 
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color="#ffa726" metalness={0.8} roughness={0.2} />
        </Torus>
      ))}
      
      <Cylinder 
        args={[0.8, 0.8, 2, 16]} 
        position={[0, 13, 0]}
        castShadow
      >
        <meshStandardMaterial color="#ff9800" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      <Text
        position={[0, 6, 2]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        DC-001
      </Text>
    </group>
  )
}

// Main Refinery Scene
function RefineryScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#ff6f00" />
      
      <Environment preset="city" />
      
      <Grid 
        args={[50, 50]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6e6e6e" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#9e9e9e" 
        fadeDistance={30} 
        fadeStrength={1} 
        followCamera={false} 
      />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#303030" />
      </mesh>
      
      <RefineryTank position={[-8, 0, 0]} height={8} radius={2} color="#1e88e5" label="T-101" />
      <RefineryTank position={[-8, 0, 6]} height={6} radius={1.5} color="#43a047" label="T-102" />
      <RefineryTank position={[8, 0, 0]} height={10} radius={2.5} color="#e53935" label="T-103" />
      <RefineryTank position={[8, 0, 7]} height={7} radius={1.8} color="#fb8c00" label="T-104" />
      
      <DistillationColumn position={[0, 0, 0]} />
      
      <Box args={[3, 2, 1]} position={[-5, 1, -5]} castShadow receiveShadow>
        <meshStandardMaterial color="#4caf50" metalness={0.7} roughness={0.3} />
      </Box>
      <Box args={[3, 2, 1]} position={[5, 1, -5]} castShadow receiveShadow>
        <meshStandardMaterial color="#4caf50" metalness={0.7} roughness={0.3} />
      </Box>
      
      <Box args={[4, 3, 4]} position={[0, 1.5, -10]} castShadow receiveShadow>
        <meshStandardMaterial color="#37474f" metalness={0.5} roughness={0.5} />
      </Box>
    </>
  )
}

export default function Viewer3D() {
  const [, setSelectedTag] = React.useState<string | null>(null)
  const controlsRef = useRef<any>(null)
  
  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      camera.position.multiplyScalar(0.8)
      controlsRef.current.update()
    }
  }
  
  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      camera.position.multiplyScalar(1.2)
      controlsRef.current.update()
    }
  }
  
  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }
  
  const handleDownload = () => {
    // Get the canvas element from the Canvas component
    const canvas = document.querySelector('canvas')
    if (canvas) {
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `refinery-3d-${new Date().toISOString().slice(0, 10)}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }
  }
  
  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      if (controlsRef.current) {
        controlsRef.current.update()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <div className="flex-1 w-full h-full relative bg-gradient-to-br from-neutral-900 to-neutral-800">
      {/* 3D Viewer Canvas */}
      <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
        <Canvas 
          shadows 
          camera={{ position: [15, 10, 15], fov: 60 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ width: '100%', height: '100%' }}
          dpr={[1, 2]}
        >
          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI * 0.45}
          />
          <Suspense fallback={null}>
            <RefineryScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Floating Controls - Left Side */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <Card className="p-1 bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Layers className="h-5 w-5" />
          </Button>
        </Card>
        <Card className="p-1 bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Eye className="h-5 w-5" />
          </Button>
        </Card>
        <Card className="p-1 bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Ruler className="h-5 w-5" />
          </Button>
        </Card>
      </div>

      {/* Floating Controls - Right Side */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Card className="p-1 bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleZoomIn}>
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleZoomOut}>
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleResetView}>
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Model Info - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <Card className="px-4 py-2 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Unit A</Badge>
            <span className="text-sm font-medium">Refinery Model v2.3</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Tag Information Sheet - Bottom */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            className="absolute bottom-24 left-1/2 -translate-x-1/2 shadow-lg"
            onClick={() => setSelectedTag('PMP-2001-A')}
          >
            <Info className="h-4 w-4 mr-2" />
            View Tag Details
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Tag: PMP-2001-A</SheetTitle>
            <SheetDescription>Centrifugal Pump - Primary Circuit</SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Docs</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Equipment Type</p>
                  <p className="font-medium">Centrifugal Pump</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">Sulzer Pumps</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flow Rate</p>
                  <p className="font-medium">500 m³/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pressure</p>
                  <p className="font-medium">10 bar</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Installation Date</p>
                  <p className="font-medium">2023-06-15</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Inspection</p>
                  <p className="font-medium">2024-11-20</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-accent">Operational</Badge>
                  <Badge variant="outline">Scheduled Maintenance</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <div className="space-y-2">
                <Card className="p-3">
                  <p className="font-medium text-sm">P&ID Drawing</p>
                  <p className="text-xs text-muted-foreground">PID-2001-A-Rev3.pdf</p>
                </Card>
                <Card className="p-3">
                  <p className="font-medium text-sm">Installation Manual</p>
                  <p className="text-xs text-muted-foreground">SULZER-PMP-2001-Manual.pdf</p>
                </Card>
                <Card className="p-3">
                  <p className="font-medium text-sm">Maintenance Schedule</p>
                  <p className="text-xs text-muted-foreground">Maintenance-2024.xlsx</p>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Routine inspection completed</p>
                    <p className="text-xs text-muted-foreground">2024-11-20 by John Smith</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Bearing replaced</p>
                    <p className="text-xs text-muted-foreground">2024-08-15 by Mike Johnson</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Performance test conducted</p>
                    <p className="text-xs text-muted-foreground">2024-06-10 by Sarah Davis</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="issues" className="mt-4">
              <div className="space-y-2">
                <Card className="p-3 border-l-4 border-destructive">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">Minor vibration detected</p>
                      <p className="text-xs text-muted-foreground">Reported 2 days ago</p>
                    </div>
                    <Badge variant="destructive">Open</Badge>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  )
}