import React, { useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Camera, Flashlight, Image, ScanLine, CheckCircle, AlertCircle, X } from 'lucide-react'

type ScannerMode = 'idle' | 'camera' | 'captured' | 'scanning' | 'result'

export default function Scanner() {
  const [mode, setMode] = useState<ScannerMode>('idle')
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recentScans] = React.useState([
    { id: 1, tag: 'PMP-2001-A', type: 'Pump', time: '2 mins ago', status: 'success' },
    { id: 2, tag: 'VLV-3042-B', type: 'Valve', time: '15 mins ago', status: 'success' },
    { id: 3, tag: 'TNK-1001-C', type: 'Tank', time: '1 hour ago', status: 'warning' },
  ])

  const startCamera = useCallback(async () => {
    // Always cleanup first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    
    // Reset states
    setCapturedImage(null)
    setScanResult(null)
    setIsVideoReady(false)
    setMode('camera')
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        // Give video time to initialize
        setTimeout(() => {
          if (streamRef.current) {
            setIsVideoReady(true)
          }
        }, 500)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
      setMode('idle')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    setIsVideoReady(false)
    if (mode === 'camera') {
      setMode('idle')
    }
  }, [mode])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0 && isVideoReady) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        
        // Stop camera and update state
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop()
          })
          streamRef.current = null
        }
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.srcObject = null
        }
        
        setCapturedImage(imageData)
        setMode('scanning')
        
        // Simulate tag detection
        setTimeout(() => {
          setScanResult('PMP-2001-A')
          setMode('result')
        }, 2000)
      }
    }
  }, [isVideoReady])

  const resetScanner = useCallback(() => {
    // Cleanup camera if running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    
    // Reset all states
    setScanResult(null)
    setCapturedImage(null)
    setIsVideoReady(false)
    setMode('idle')
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCapturedImage(imageData)
        setMode('scanning')
        
        // Simulate tag detection
        setTimeout(() => {
          setScanResult('PMP-2001-A')
          setMode('result')
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop()
        })
        streamRef.current = null
      }
    }
  }, [])

  return (
    <div className="min-h-full">
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tag Scanner</h1>
          <p className="text-muted-foreground text-sm mt-1">Scan equipment tags for instant information</p>
        </div>

        {/* Scanner Viewport */}
        <Card className="border-2 border-primary/20 bg-gradient-to-b from-background to-primary/5">
          <CardContent className="p-0">
            <div className="relative h-[400px] flex items-center justify-center bg-neutral-900/5 rounded-lg overflow-hidden">
              {/* Camera Mode */}
              {mode === 'camera' && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <Button
                    className="absolute top-4 right-4 z-10"
                    variant="outline"
                    size="icon"
                    onClick={stopCamera}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Captured/Scanning/Result Modes */}
              {(mode === 'captured' || mode === 'scanning' || mode === 'result') && capturedImage && (
                <>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {mode === 'scanning' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 animate-ping">
                          <ScanLine className="h-32 w-32 text-primary opacity-75" />
                        </div>
                        <ScanLine className="h-32 w-32 text-primary animate-pulse" />
                      </div>
                      <div className="absolute top-4 left-4 right-4">
                        <div className="h-0.5 bg-accent animate-pulse" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="h-0.5 bg-accent animate-pulse" />
                      </div>
                    </div>
                  )}
                  {mode === 'result' && scanResult && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center bg-card p-6 rounded-lg">
                        <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                        <p className="text-lg font-semibold">Tag Detected</p>
                        <p className="text-2xl font-bold text-primary mt-2">{scanResult}</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={resetScanner}
                        >
                          Scan Another
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Idle Mode */}
              {mode === 'idle' && (
                <div className="text-center text-muted-foreground">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Click 'Start Camera' to begin scanning</p>
                  <p className="text-xs mt-2">Position tag within frame</p>
                </div>
              )}

              {/* Scanning Frame Corners */}
              {mode !== 'result' && (
                <>
                  <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-primary" />
                  <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-primary" />
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-primary" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scanner Controls */}
        <div className="flex gap-2">
          {mode === 'idle' && (
            <Button 
              className="flex-1 h-14 text-lg font-semibold"
              onClick={startCamera}
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Camera
            </Button>
          )}
          {mode === 'camera' && (
            <Button 
              className="flex-1 h-14 text-lg font-semibold"
              onClick={capturePhoto}
              variant="default"
              disabled={!isVideoReady}
            >
              <Camera className="h-5 w-5 mr-2" />
              {isVideoReady ? 'Capture & Scan' : 'Initializing...'}
            </Button>
          )}
          {mode === 'result' && (
            <Button 
              className="flex-1 h-14 text-lg font-semibold"
              onClick={resetScanner}
              variant="outline"
            >
              <ScanLine className="h-5 w-5 mr-2" />
              Scan Another
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-14 w-14">
            <Flashlight className="h-5 w-5" />
          </Button>
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-14 w-14"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-5 w-5" />
            </Button>
          </>
        </div>

        {/* Scan Result Actions */}
        {mode === 'result' && scanResult && (
          <Card className="border-l-4 border-accent">
            <CardHeader>
              <CardTitle className="text-lg">Tag Actions</CardTitle>
              <CardDescription>What would you like to do with {scanResult}?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                View Equipment Details
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Start Inspection
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View in 3D Model
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Scans */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Scans</h2>
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <Card key={scan.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {scan.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{scan.tag}</p>
                      <p className="text-xs text-muted-foreground">{scan.type} • {scan.time}</p>
                    </div>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">View</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>{scan.tag}</SheetTitle>
                        <SheetDescription>Equipment Type: {scan.type}</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Scanned</p>
                          <p className="font-medium">{scan.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={scan.status === 'success' ? 'default' : 'destructive'}>
                            {scan.status === 'success' ? 'Operational' : 'Needs Attention'}
                          </Badge>
                        </div>
                        <div className="pt-4 space-y-2">
                          <Button className="w-full">View Full Details</Button>
                          <Button variant="outline" className="w-full">Start Inspection</Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Manual Entry Option */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Can't scan the tag?</p>
                <p className="text-sm text-muted-foreground">Enter tag ID manually</p>
              </div>
              <Button variant="secondary">Manual Entry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}