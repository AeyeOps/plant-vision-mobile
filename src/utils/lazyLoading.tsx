import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/LoadingStates';

export const lazyWithRetry = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(async () => {
    const pageLoadMaxRetries = 3;
    for (let i = 0; i < pageLoadMaxRetries; i++) {
      try {
        const component = await componentImport();
        return component;
      } catch (error) {
        // If last attempt fails, throw the error
        if (i === pageLoadMaxRetries - 1) throw error;

        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Failed to load component');
  });
};

export const withLazyLoading = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

export const preloadImage = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve();
    image.onerror = reject;
  });
};

// Define route modules explicitly for proper Vite handling
const routeModules: Record<string, () => Promise<any>> = {
  'Dashboard': () => import('../pages/Dashboard.tsx'),
  'Scanner': () => import('../pages/Scanner.tsx'),
  'Viewer3D': () => import('../pages/Viewer3D.tsx'),
  'Inspections': () => import('../pages/Inspections.tsx'),
  'Settings': () => import('../pages/Settings.tsx'),
  'Sync': () => import('../pages/Sync.tsx')
};

export const preloadRoutes = async (routes: string[]) => {
  const preloadPromises = routes.map(route => {
    const loader = routeModules[route];
    if (!loader) {
      console.warn(`Route "${route}" not found in route modules`);
      return Promise.resolve();
    }
    return lazyWithRetry(loader);
  });

  try {
    await Promise.all(preloadPromises);
  } catch (error) {
    console.error('Route preloading failed:', error);
  }
};