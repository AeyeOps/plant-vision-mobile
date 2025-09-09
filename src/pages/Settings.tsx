import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, Palette, LogOut, Moon,
  Sun, Globe, RefreshCw, Download
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useTheme } from '@/components/theme-provider'
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function SettingsPage() {
  const { 
    user, 
    isAuthenticated, 
    settings, 
    login, 
    logout, 
    updateSettings 
  } = useAppStore()
  
  const { theme, setTheme } = useTheme()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  const { needRefresh, updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleCheckForUpdates = () => {
    if (needRefresh) {
      updateServiceWorker(true)
    } else {
      alert('App is up to date')
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  const userProfile = user || {
    name: 'Guest User',
    role: 'Not Logged In',
    email: '',
    company: '',
    department: '',
    employeeId: ''
  }

  const handleLogin = async () => {
    try {
      await login('user@plantvision.com', 'demo')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-full">
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure app preferences and account</p>
        </div>

        {/* User Profile Card */}
        <Card className="border-l-4 border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>{userProfile.name}</CardTitle>
                  <CardDescription>{userProfile.role}</CardDescription>
                  {isAuthenticated && (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{userProfile.department}</Badge>
                      <Badge variant="outline">{userProfile.employeeId}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button variant="default" className="w-full" onClick={handleLogin}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-3 mt-4">
            {/* Appearance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-muted-foreground">Choose app theme</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === 'system' ? 'default' : 'outline'}
                      onClick={() => setTheme('system')}
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Default View</p>
                      <p className="text-sm text-muted-foreground">Choose default landing page</p>
                    </div>
                  </div>
                  <Select 
                    value={settings.defaultView} 
                    onValueChange={(value) => updateSettings({ defaultView: value as 'dashboard' | '3d' | 'inspections' })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="3d">3D View</SelectItem>
                      <SelectItem value="inspections">Inspections</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PWA Update Settings */}
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">App Updates</p>
                      <p className="text-sm text-muted-foreground">Check for updates</p>
                    </div>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCheckForUpdates}
                    >
                      Check for Updates
                    </Button>
                  </div>
                </div>

                {/* Unit Preferences */}
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Temperature Unit</Label>
                    <Select 
                      value={settings.temperatureUnit} 
                      onValueChange={(value) => updateSettings({ temperatureUnit: value as 'celsius' | 'fahrenheit' })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Pressure Unit</Label>
                    <Select 
                      value={settings.pressureUnit} 
                      onValueChange={(value) => updateSettings({ pressureUnit: value as 'bar' | 'psi' | 'kpa' })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="psi">PSI</SelectItem>
                        <SelectItem value="kpa">kPa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Flow Unit</Label>
                    <Select 
                      value={settings.flowUnit} 
                      onValueChange={(value) => updateSettings({ flowUnit: value as 'm3h' | 'gpm' | 'lpm' })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m3h">m³/h</SelectItem>
                        <SelectItem value="gpm">GPM</SelectItem>
                        <SelectItem value="lpm">LPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>App Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">App Version</p>
                    <p className="font-semibold">{import.meta.env.VITE_APP_VERSION || 'Unknown'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Build Date</p>
                    <p className="font-semibold">{import.meta.env.VITE_BUILD_DATE || 'Unknown'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Service Worker</p>
                    <p className="font-semibold">{needRefresh ? 'Update Available' : 'Up to Date'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Installation</p>
                    <Badge variant={isInstalled ? "default" : "outline"}>
                      {isInstalled ? "Installed" : "Web App"}
                    </Badge>
                  </div>
                  {(isInstallable && !isInstalled) || needRefresh ? (
                    <div className="flex gap-2 pt-2">
                      {needRefresh && (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleCheckForUpdates}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      )}
                      {isInstallable && !isInstalled && (
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={handleInstallApp}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Install App
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>Manage data synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Auto Sync</p>
                    <p className="text-sm text-muted-foreground">Automatically sync when online</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Last Sync</p>
                    <p className="text-sm text-muted-foreground">Never synced</p>
                  </div>
                  <Button variant="default" size="sm">Sync Now</Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Pending Changes</p>
                    <p className="text-sm text-muted-foreground">0 items waiting to sync</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage app security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Require Authentication</p>
                    <p className="text-sm text-muted-foreground">Ask for login on app start</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Biometric Login</p>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face unlock</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>Not Available</Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Clear Local Data</p>
                    <p className="text-sm text-muted-foreground">Remove all cached data</p>
                  </div>
                  <Button variant="destructive" size="sm">Clear Data</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}