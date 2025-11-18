import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import AppRoutes from './routes';
import EmployerRoutesWrapper from './components/employer/EmployerRoutesWrapper';
import DashboardRoutesWrapper from './components/dashboard/DashboardRoutesWrapper';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
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
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
