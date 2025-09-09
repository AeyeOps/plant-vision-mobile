// Register service worker for PWA functionality
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          type: 'classic',
          updateViaCache: 'none'
        });
        
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available. Refresh to update.');
              }
            });
          }
        });
        
        // Handle install prompt
        let deferredPrompt: any = null;
        
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPrompt = e;
          console.log('PWA install prompt available');
          
          // Store for use in Settings page
          (window as any).deferredPrompt = deferredPrompt;
          
          // Dispatch custom event for components to listen to
          window.dispatchEvent(new CustomEvent('pwainstallable'));
        });
        
        // Handle successful installation
        window.addEventListener('appinstalled', () => {
          console.log('PWA was installed');
          deferredPrompt = null;
          (window as any).deferredPrompt = null;
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
}