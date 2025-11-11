import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTE_PERMISSIONS } from '../../constants/routes';

interface RouteGuardProps {
  children: React.ReactNode;
  path: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, path }) => {
  const { user, isEmployee, isEmployer } = useAuth();
  const location = useLocation();

  // Get route permissions
  const routePermission = ROUTE_PERMISSIONS[path as keyof typeof ROUTE_PERMISSIONS];
  
  if (!routePermission) {
    // If no specific permissions defined, allow access
    return <>{children}</>;
  }

  // Check if user has required role
  const hasPermission = routePermission.roles.some(role => {
    switch (role) {
      case 'public':
        return true;
      case 'employee':
        return user && isEmployee();
      case 'employer':
        return user && isEmployer();
      default:
        return false;
    }
  });

  if (!hasPermission) {
    // Redirect to login if not authenticated, or to appropriate dashboard
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // If user is logged in but doesn't have permission, redirect to their dashboard
    if (isEmployee()) {
      return <Navigate to="/dashboard" replace />;
    } else if (isEmployer()) {
      return <Navigate to="/employer/dashboard" replace />;
    }
    
    // Fallback to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
