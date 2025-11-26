import React from 'react';
import { useLocation } from 'react-router-dom';
import { EmployerSidebarProvider } from '../../context/EmployerSidebarContext';

interface EmployerRoutesWrapperProps {
  children: React.ReactNode;
}

const EmployerRoutesWrapper: React.FC<EmployerRoutesWrapperProps> = ({ children }) => {
  const location = useLocation();
  const isEmployerRoute = location.pathname.startsWith('/employer');

  if (isEmployerRoute) {
    return <EmployerSidebarProvider>{children}</EmployerSidebarProvider>;
  }

  return <>{children}</>;
};

export default EmployerRoutesWrapper;

