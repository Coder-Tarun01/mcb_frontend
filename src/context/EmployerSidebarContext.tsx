import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EmployerSidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  isMobileOrTablet: boolean;
}

const EmployerSidebarContext = createContext<EmployerSidebarContextType | undefined>(undefined);

export const EmployerSidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize based on screen size (check if window is available for SSR)
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      const isSmallScreen = window.innerWidth < 1024;
      return {
        isMobileOrTablet: isSmallScreen,
        isSidebarOpen: !isSmallScreen // Open on desktop, closed on mobile/tablet
      };
    }
    return {
      isMobileOrTablet: false,
      isSidebarOpen: true // Default to open (desktop)
    };
  };

  const initialState = getInitialState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(initialState.isSidebarOpen);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(initialState.isMobileOrTablet);

  useEffect(() => {
    const checkScreenSize = () => {
      const isSmallScreen = window.innerWidth < 1024; // <1024px = mobile/tablet
      setIsMobileOrTablet(isSmallScreen);
      
      // On desktop (>=1024px), sidebar should always be open
      // On mobile/tablet, don't force close - let user toggle it
      if (!isSmallScreen) {
        setIsSidebarOpen(true);
      }
      // Note: We don't force close on mobile/tablet to allow user to toggle
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <EmployerSidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, openSidebar, closeSidebar, isMobileOrTablet }}>
      {children}
    </EmployerSidebarContext.Provider>
  );
};

export const useEmployerSidebar = (): EmployerSidebarContextType => {
  const context = useContext(EmployerSidebarContext);
  if (context === undefined) {
    throw new Error('useEmployerSidebar must be used within EmployerSidebarProvider');
  }
  return context;
};

// Safe hook that returns null if context is not available (for use in components that may not be within provider)
export const useEmployerSidebarSafe = (): EmployerSidebarContextType | null => {
  const context = useContext(EmployerSidebarContext);
  return context || null;
};

