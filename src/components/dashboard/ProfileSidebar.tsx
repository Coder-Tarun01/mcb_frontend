import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ProfileSidebar.css';

interface ProfileSidebarProps {
  className?: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/dashboard?tab=profile'
    },
    {
      id: 'resume',
      label: 'Resume',
      icon: FileText,
      path: '/dashboard?tab=resume'
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: Briefcase,
      path: '/dashboard?tab=applications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/dashboard?tab=settings'
    }
  ];

  const isActive = (path: string) => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab') || 'profile';
    return path.includes(`tab=${tab}`);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`profile-sidebar ${className}`}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {(() => {
              const raw = user?.avatarUrl || user?.profilePicture;
              if (raw) {
                const isAbsolute = /^https?:\/\//i.test(raw);
                const src = isAbsolute ? raw : `${process.env.REACT_APP_API_URL || 'https://mcb.instatripplan.com'}${raw.startsWith('/') ? '' : '/'}${raw}`;
                return <img src={src} alt={user?.name || 'User'} />;
              }
              return <User className="avatar-icon" />;
            })()}
          </div>
          <div className="user-details">
            <h3 className="user-name">{user?.name || 'User'}</h3>
            <p className="user-email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                  <item.icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </div>
                <ChevronRight className="nav-arrow" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="logout-icon" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
