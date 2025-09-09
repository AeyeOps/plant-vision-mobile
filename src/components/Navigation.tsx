import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clipboard, Camera, Settings, Box } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      route: '/'
    },
    {
      name: 'Scanner',
      icon: Camera,
      route: '/scanner'
    },
    {
      name: 'Inspections',
      icon: Clipboard,
      route: '/inspections'
    },
    {
      name: 'Viewer 3D',
      icon: Box,
      route: '/viewer3d'
    },
    {
      name: 'Settings',
      icon: Settings,
      route: '/settings'
    }
  ];

  return (
    <div data-app-nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-background border-t border-border z-50 safe-bottom">
      <div className="flex justify-around items-center w-full h-full px-1 sm:px-4 md:px-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.route || 
                          (item.route === '/' && location.pathname === '/dashboard');
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors touch-target ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <item.icon 
                className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className="text-xs sm:text-sm mt-1 truncate">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};