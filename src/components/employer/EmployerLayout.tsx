import React from 'react';
import EmployerSidebar from './EmployerSidebar';
import { useEmployerSidebar } from '../../context/EmployerSidebarContext';

interface EmployerLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const EmployerLayout: React.FC<EmployerLayoutProps> = ({ children, className = '' }) => {
  const { isSidebarOpen, closeSidebar, isMobileOrTablet } = useEmployerSidebar();

  return (
    <div className={`min-h-screen bg-slate-50 ${className}`} style={{ paddingTop: '32px' }}>
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 flex flex-col lg:flex-row items-start gap-6 relative overflow-x-hidden">
      {/* Sidebar - Fixed on desktop, drawer on mobile/tablet */}
      <EmployerSidebar 
        isOpen={isSidebarOpen} 
        onClose={isMobileOrTablet ? closeSidebar : undefined} 
      />

      {/* Main Content - Adjusts based on sidebar state */}
      <main className={`flex-1 overflow-y-auto min-h-[calc(100vh-32px)] bg-slate-50 w-full lg:w-auto transition-all duration-300`}>
        <div className="px-4 sm:px-6 pb-6 lg:px-8 lg:pb-8 xl:px-10 xl:pb-10 max-w-full">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};

export default EmployerLayout;
