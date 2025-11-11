import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import EmployerSidebar from './EmployerSidebar';

interface EmployerLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const EmployerLayout: React.FC<EmployerLayoutProps> = ({ children, className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On desktop, always keep sidebar open
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-50 ${className}`} style={{ paddingTop: '32px' }}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-start gap-6 relative">
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-[68px] left-4 z-[110] w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <EmployerSidebar 
        isOpen={isSidebarOpen || !isMobile} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-[calc(100vh-32px)] bg-slate-50 w-full m-0">
        <div className="px-6 pb-6 md:px-8 md:pb-8 lg:px-10 lg:pb-10 max-w-full">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};

export default EmployerLayout;
