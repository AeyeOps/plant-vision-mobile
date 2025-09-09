import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as Sentry from "@sentry/react";

// Performance and Lazy Loading
import { 
  usePerformanceMonitoring 
} from './hooks/usePerformanceMonitoring';
import { useWindowResize } from './hooks/useWindowResize';
import { 
  lazyWithRetry, 
  withLazyLoading, 
  preloadRoutes 
} from './utils/lazyLoading';

// Analytics
import { analytics } from './services/analyticsService';
import { errorLogger } from './services/errorLogging';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingStates';
import { ToastProvider } from './hooks/use-toast';
import { Navigation } from './components/Navigation';
import { ThemeProvider } from './components/theme-provider';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useAppStore } from './stores/useAppStore';

// Lazy-loaded Pages
const Dashboard = withLazyLoading(lazyWithRetry(() => import('./pages/Dashboard')));
const Scanner = withLazyLoading(lazyWithRetry(() => import('./pages/Scanner')));
const Viewer3D = withLazyLoading(lazyWithRetry(() => import('./pages/Viewer3D')));
const Inspections = withLazyLoading(lazyWithRetry(() => import('./pages/Inspections')));
const Settings = withLazyLoading(lazyWithRetry(() => import('./pages/Settings')));

const App: React.FC = () => {
  // Performance Monitoring
  usePerformanceMonitoring();
  
  // Handle window resizing
  useWindowResize();
  
  // Get default view from settings
  const defaultView = useAppStore((state) => state.settings.defaultView);

  useEffect(() => {
    // Analytics and Performance Tracking
    analytics.trackPageView('App Initialization');

    // Preload Additional Routes
    preloadRoutes(['Dashboard', 'Scanner', 'Viewer3D', 'Inspections', 'Settings'])
      .catch(error => {
        errorLogger.logError(error, { 
          context: 'Route Preloading'
        });
      });

    // Browser Performance Markers
    performance.mark('app-initialized');
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="plant-vision-theme">
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Router>
              <div className="flex flex-col w-full h-screen overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
                <div className="flex-1 min-h-0 overflow-auto w-full pb-16">
                  <Routes>
                    <Route path="/" element={
                      defaultView === '3d' ? <Navigate to="/viewer3d" replace /> :
                      defaultView === 'inspections' ? <Navigate to="/inspections" replace /> :
                      <Dashboard />
                    } />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/scanner" element={<Scanner />} />
                    <Route path="/viewer3d" element={<Viewer3D />} />
                    <Route path="/inspections" element={<Inspections />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
                <Navigation />
                <PWAInstallPrompt />
              </div>
            </Router>
          </Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default Sentry.withProfiler(App);