import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import AppRoutes from './routes';
import EmployerRoutesWrapper from './components/employer/EmployerRoutesWrapper';
import DashboardRoutesWrapper from './components/dashboard/DashboardRoutesWrapper';
import { Toaster } from 'react-hot-toast';

// Inner component to access AuthContext
const AppContent: React.FC = () => {
  const { sessionExpired, handleSessionExpired } = useAuth();

  // Listen for session expiration events from API
  React.useEffect(() => {
    const handleSessionExpiredEvent = () => {
      handleSessionExpired();
    };

    window.addEventListener('sessionExpired', handleSessionExpiredEvent);
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpiredEvent);
    };
  }, [handleSessionExpired]);

  return (
    <Router>
      <EmployerRoutesWrapper>
        <DashboardRoutesWrapper>
          <ScrollToTop />
          <div className="App">
            <Toaster position="top-right" />
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </DashboardRoutesWrapper>
      </EmployerRoutesWrapper>
    </Router>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
