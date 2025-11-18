import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardSidebarProvider } from '../../context/DashboardSidebarContext';

interface DashboardRoutesWrapperProps {
  children: React.ReactNode;
}

const DashboardRoutesWrapper: React.FC<DashboardRoutesWrapperProps> = ({ children }) => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  if (isDashboardRoute) {
    return (
      <DashboardSidebarProvider>
        {children}
      </DashboardSidebarProvider>
    );
  }

  return <>{children}</>;
};

export default DashboardRoutesWrapper;

