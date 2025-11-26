import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Briefcase,
  FileText,
  CreditCard,
  Search,
  BarChart3,
  Edit,
  User,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCompanyProfile } from '../../hooks/useCompanyProfile';
import { profileAPI, BACKEND_BASE_URL } from '../../services/api';

interface EmployerSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const EmployerSidebar: React.FC<EmployerSidebarProps> = ({ className = '', isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isLoadingProfile, getCompanyName, getCompanyLogo, forceRefresh } = useCompanyProfile();

  // Close sidebar on route change (mobile/tablet only)
  useEffect(() => {
    // Close sidebar on route change only on mobile/tablet (when onClose prop exists)
    // Only close if sidebar is currently open to avoid interfering with user's manual toggle
    if (onClose && isOpen) {
      const mediaQuery = window.matchMedia('(max-width: 1023px)');
      if (mediaQuery.matches) {
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only run when pathname changes, not when isOpen changes

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Building2,
      path: '/employer/dashboard',
      isActive: location.pathname === '/employer/dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/employer/analytics',
      isActive: location.pathname.startsWith('/employer/analytics')
    },
    {
      id: 'company-profile',
      label: 'Company Profile',
      icon: User,
      path: '/employer/profile',
      isActive: location.pathname.startsWith('/employer/profile')
    },
    {
      id: 'post-job',
      label: 'Post A Job',
      icon: FileText,
      path: '/employer/post-job',
      isActive: location.pathname.startsWith('/employer/post-job')
    },
    {
      id: 'manage-jobs',
      label: 'Manage Jobs',
      icon: Briefcase,
      path: '/employer/jobs',
      isActive: location.pathname.startsWith('/employer/jobs') || location.pathname.startsWith('/employer/edit-job')
    },
    {
      id: 'browse-candidates',
      label: 'Browse Candidates',
      icon: Search,
      path: '/employer/candidates',
      isActive: location.pathname.startsWith('/employer/candidates')
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      path: '/employer/transactions',
      isActive: location.pathname.startsWith('/employer/transactions')
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Use dedicated company logo upload endpoint
      const res = await profileAPI.uploadCompanyLogo(file);
      const url = res?.companyLogo || res?.url;
      if (url) {
        // Refresh profile to get updated company logo
        await forceRefresh();
      }
    } catch (err) {
      console.error('Company logo upload failed', err);
    } finally {
      // reset input so same file can be reselected
      e.target.value = '';
    }
  };

  return (
    <>
      {/* Backdrop - shown only on mobile/tablet when sidebar is open */}
      {onClose && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
              onClick={onClose}
            />
          )}
        </AnimatePresence>
      )}

      {/* Sidebar - Fixed on desktop, drawer on mobile/tablet */}
      <motion.aside
        initial={false}
        animate={{ 
          x: onClose ? (isOpen ? 0 : '-100%') : 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed lg:relative w-72 lg:w-64 h-screen lg:h-[calc(100vh-32px)] bg-gradient-to-b from-white via-slate-50/50 to-white border-r border-gray-200/60 lg:border lg:border-gray-200 lg:rounded-lg flex flex-col z-[100] shadow-xl lg:shadow-none shadow-black/10 overflow-hidden lg:overflow-visible flex-shrink-0 lg:ml-0 ${className}`}>
      {/* Close Button - shown only on mobile/tablet */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Company Profile Section */}
      <div className="pt-4 pb-4 px-5 lg:pt-5 lg:pb-4 lg:px-4 border-b border-gray-200/60 bg-gradient-to-br from-blue-50/30 via-white to-slate-50/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="relative w-20 h-20 lg:w-16 lg:h-16 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200/50 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/10 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300 overflow-hidden">
              {isLoadingProfile ? (
                <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (() => {
                // Prefer employer avatar; fallback to company logo; then icon
                const raw = (user as any)?.avatarUrl || (user as any)?.profilePicture || getCompanyLogo();
                if (raw) {
                  const isAbsolute = typeof raw === 'string' && /^https?:\/\//i.test(raw);
                  const src = isAbsolute ? raw : `${BACKEND_BASE_URL}${String(raw).startsWith('/') ? '' : '/'}${raw}`;
                  return <img src={src} alt={getCompanyName()} className="w-full h-full rounded-2xl object-cover bg-white" />;
                }
                return <Building2 className="w-10 h-10 lg:w-9 lg:h-9 sm:w-8 sm:h-8 text-blue-600" />;
              })()}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/20 transition-all duration-300 rounded-2xl"></div>
            </div>
            <input 
              id="sidebar-company-logo-file" 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              style={{ display: 'none' }} 
              onChange={handleLogoUpload} 
            />
            <motion.button 
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-2 border-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/30 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              title="Edit Company Logo"
              onClick={() => document.getElementById('sidebar-company-logo-file')?.click()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="text-center">
            <div className="text-base lg:text-sm sm:text-xs font-bold text-gray-900 mb-0.5 tracking-tight">
              {getCompanyName()}
            </div>
            <div className="text-[10px] lg:text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Employer Portal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 px-3 pt-3 pb-24 md:pb-32 lg:py-2">
        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5 pb-2">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`group flex items-center gap-3 py-3 px-4 lg:py-2.5 lg:px-3 sm:py-2 sm:px-2 rounded-xl text-sm lg:text-sm sm:text-xs font-medium cursor-pointer transition-all duration-200 ease-in-out text-left relative overflow-hidden flex-shrink-0 ${
                item.isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 hover:text-blue-600'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: item.isActive ? 0 : 4 }}
              whileTap={{ scale: 0.97 }}
            >
              {item.isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-r-full"></div>
              )}
              <div className={`flex items-center justify-center w-5 h-5 lg:w-4.5 lg:h-4.5 sm:w-4 sm:h-4 flex-shrink-0 transition-all duration-200 ${
                item.isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
              }`}>
                <item.icon className="w-full h-full" />
              </div>
              <span className={`flex-1 truncate font-medium ${
                item.isActive ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
              }`}>
                {item.label}
              </span>
              {item.isActive && (
                <motion.div 
                  className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Logout Button */}
        <div className="flex-shrink-0 mt-auto pt-3 pb-8 md:pb-12 border-t border-gray-200/60">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-3 px-4 lg:py-2.5 lg:px-3 sm:py-2 sm:px-2 bg-gradient-to-r from-red-50 to-red-100/50 text-red-600 border border-red-200/50 font-semibold rounded-xl cursor-pointer transition-all duration-200 ease-in-out text-left relative overflow-hidden hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 hover:text-red-700 hover:border-red-300 hover:shadow-md hover:shadow-red-500/10 whitespace-nowrap group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-center justify-center w-5 h-5 lg:w-4.5 lg:h-4.5 sm:w-4 sm:h-4 flex-shrink-0 text-red-600 group-hover:text-red-700 transition-colors">
              <LogOut className="w-full h-full" />
            </div>
            <span className="flex-1 truncate text-sm lg:text-sm sm:text-xs">
              Log Out
            </span>
          </motion.button>
        </div>
      </nav>
      </motion.aside>
    </>
  );
};

export default EmployerSidebar;
