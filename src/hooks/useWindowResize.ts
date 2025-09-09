import { useEffect, useState, useCallback, useRef } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowResize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const lastSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const updateViewportUnits = useCallback(() => {
    const vh = window.innerHeight * 0.01;
    const vw = window.innerWidth * 0.01;
    
    // Update CSS custom properties
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    
    // Measure and set nav height
    const nav = document.querySelector('[data-app-nav]');
    const navH = nav ? (nav as HTMLElement).offsetHeight : 64;
    document.documentElement.style.setProperty('--nav-h', `${navH}px`);
    
    // Force reflow to ensure changes are applied
    document.documentElement.offsetHeight;
    
    // Log for debugging
    console.log('Viewport units updated:', { 
      vh: `${vh}px`, 
      vw: `${vw}px`,
      navH: `${navH}px`,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth 
    });
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let rafId: number;
    let pollIntervalId: NodeJS.Timeout;

    const handleResize = () => {
      // Cancel any pending updates
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      
      // Debounce resize events
      timeoutId = setTimeout(() => {
        // Use requestAnimationFrame for smooth updates
        rafId = requestAnimationFrame(() => {
          const newWidth = window.innerWidth;
          const newHeight = window.innerHeight;
          
          // Only update if size actually changed
          if (newWidth !== lastSizeRef.current.width || newHeight !== lastSizeRef.current.height) {
            lastSizeRef.current = { width: newWidth, height: newHeight };
            
            setWindowSize({
              width: newWidth,
              height: newHeight,
            });
            
            updateViewportUnits();
          }
        });
      }, 50); // Reduced debounce time for more responsive updates
    };

    // Set initial values
    updateViewportUnits();
    
    // Method 1: Standard resize event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    // Method 2: ResizeObserver for more reliable detection
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.documentElement || entry.target === document.body) {
            handleResize();
            break;
          }
        }
      });
      
      resizeObserverRef.current.observe(document.documentElement);
      resizeObserverRef.current.observe(document.body);
    }
    
    // Method 3: Polling fallback for edge cases
    pollIntervalId = setInterval(() => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      if (currentWidth !== lastSizeRef.current.width || currentHeight !== lastSizeRef.current.height) {
        console.log('Polling detected resize:', { 
          from: lastSizeRef.current, 
          to: { width: currentWidth, height: currentHeight }
        });
        handleResize();
      }
    }, 1000); // Check every second
    
    // Also listen for visibility change (for when app comes back to foreground)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleResize();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle iOS viewport changes
    const viewport = document.querySelector('meta[name="viewport"]');
    let mutationObserver: MutationObserver | null = null;
    
    if (viewport) {
      mutationObserver = new MutationObserver(() => {
        updateViewportUnits();
      });
      mutationObserver.observe(viewport, { attributes: true });
    }

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      clearInterval(pollIntervalId);
      if (rafId) cancelAnimationFrame(rafId);
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [updateViewportUnits]);

  return windowSize;
}