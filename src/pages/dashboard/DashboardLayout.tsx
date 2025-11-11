import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  FileText, 
  Bell,
  LogOut,
  BarChart3,
  Star,
  Bookmark,
  ClipboardCheck,
  Folder,
  Search,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import ProfilePhotoUpload from '../../components/dashboard/ProfilePhotoUpload';


const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // (removed unused resume upload state)

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const userData = await usersAPI.fetchUserById(user.id);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path: string, action?: () => void) => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  };

  // (removed unused back-to-dashboard helper)

  // Check if we're on a resume page
  const isResumePage = location.pathname.startsWith('/dashboard/my-resume');

  // (removed unused resume upload handlers)

  // (removed duplicate loadUserProfile; using the scoped version inside useEffect)

  // Handle avatar update
  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        avatarUrl: newAvatarUrl
      });
    }
  };

  const mainSidebarItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile', action: undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics', action: undefined },
    { id: 'recommended', label: 'Recommended', icon: Star, path: '/dashboard/recommended', action: undefined },
    { id: 'resume', label: 'My Resume', icon: FileText, path: '/dashboard/my-resume', action: undefined },
    { id: 'saved', label: 'Saved Jobs', icon: Bookmark, path: '/dashboard/saved', action: undefined },
    { id: 'applied', label: 'Applied Jobs', icon: ClipboardCheck, path: '/dashboard/applied', action: undefined },
    { id: 'alerts', label: 'Job Alerts', icon: Bell, path: '/dashboard/alerts', action: undefined },
    { id: 'cv-manager', label: 'CV Manager', icon: Folder, path: '/dashboard/cv-manager', action: undefined }
  ];

  // (removed unused logout menu item)

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

      return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 w-full bg-blue-600 text-white shadow-md z-50">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu size={20} />
              </button>
            <h1 className="text-xl font-semibold">mycareerbuild Dashboard</h1>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 lg:max-w-lg xl:max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-gray-800 bg-white border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
                </div>
              </div>
              
          {/* Right side - User Menu */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
            <div className="relative user-menu-container">
                    <button 
                className="flex items-center gap-2 p-2 hover:bg-blue-700 rounded-lg transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold">
                  {isLoadingProfile ? '...' : 
                   userProfile ? 
                     (userProfile.name ? userProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U') : 
                     (user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U')
                  }
                  </div>
                <ChevronDown size={16} />
              </button>
              
              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        {isLoadingProfile ? 'Loading...' : 
                         userProfile?.name || user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isLoadingProfile ? 'Loading...' : 
                         userProfile?.professionalTitle || userProfile?.jobTitle || 'Professional'}
                      </p>
                </div>
                <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        navigate('/dashboard/profile');
                        setShowUserMenu(false);
                      }}
                    >
                      <User size={16} className="inline mr-2" />
                      Profile Settings
                </button>
                <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Logout
                </button>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16 w-full max-w-7xl mx-auto gap-6">
        {/* Desktop Sidebar */}
        <AnimatePresence mode="wait">
          {!isResumePage && (
            <motion.aside 
              key="desktop-sidebar"
              className="hidden lg:flex w-64 h-auto sticky top-16 bg-white border border-gray-200 shadow-lg rounded-xl flex-col"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Profile Section */}
              <div className="p-5 border-b border-gray-200 bg-gradient-to-br from-blue-50/80 to-blue-100/40 flex-shrink-0">
                <ProfilePhotoUpload
                  currentAvatarUrl={userProfile?.avatarUrl}
                  userName={userProfile?.name || user?.name || 'User'}
                  userTitle={userProfile?.professionalTitle || userProfile?.jobTitle || 'Professional'}
                  onAvatarUpdate={handleAvatarUpdate}
                  size="md"
                  showName={true}
                  showTitle={true}
                />
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-1.5 p-3 flex-shrink-0">
                {mainSidebarItems.map((item) => (
                  <motion.button
                      key={item.id}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive(item.path || '') 
                        ? 'bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/30' 
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                      onClick={() => handleNavigation(item.path || '', item.action)}
                  >
                    <div className={`p-1.5 rounded-md ${isActive(item.path || '') ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path || '') ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className={`flex-1 text-left ${isActive(item.path || '') ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
                    {isActive(item.path || '') && (
                      <div className="absolute right-2 w-1 h-6 bg-white/30 rounded-full"></div>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="p-3 border-t border-gray-200 flex-shrink-0">
                <motion.button
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  <div className="p-1.5 rounded-md bg-red-100">
                    <LogOut className="h-5 w-5 shrink-0 text-red-600" />
                  </div>
                  <span className="flex-1 text-left">Logout</span>
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
                className="fixed left-0 top-0 w-64 h-full bg-white shadow-xl z-50 lg:hidden border-r border-gray-200 flex flex-col overflow-hidden"
              >
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-blue-100/40">
                  <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Mobile Profile Section */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-50/80 to-blue-100/40 flex-shrink-0">
                  <ProfilePhotoUpload
                    currentAvatarUrl={userProfile?.avatarUrl}
                    userName={userProfile?.name || user?.name || 'User'}
                    userTitle={userProfile?.professionalTitle || userProfile?.jobTitle || 'Professional'}
                    onAvatarUpdate={handleAvatarUpdate}
                    size="sm"
                    showName={true}
                    showTitle={true}
                  />
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-2 p-4 flex-1">
                  {mainSidebarItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive(item.path || '') 
                          ? 'bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/30' 
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      onClick={() => {
                        handleNavigation(item.path || '', item.action);
                        setIsMobileSidebarOpen(false);
                      }}
                    >
                      <div className={`p-1.5 rounded-md ${isActive(item.path || '') ? 'bg-white/20' : 'bg-gray-100'}`}>
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path || '') ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className={`flex-1 text-left ${isActive(item.path || '') ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
                      {isActive(item.path || '') && (
                        <div className="absolute right-2 w-1 h-6 bg-white/30 rounded-full"></div>
                      )}
                    </motion.button>
                  ))}
              </nav>

              {/* Mobile Logout Button */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <motion.button
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    handleLogout();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  <div className="p-1.5 rounded-md bg-red-100">
                    <LogOut className="h-5 w-5 shrink-0 text-red-600" />
                  </div>
                  <span className="flex-1 text-left">Logout</span>
                </motion.button>
              </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-h-screen min-w-0 max-w-full pt-0">
          <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
            className="container max-w-7xl mx-auto w-full"
        >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

