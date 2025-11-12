import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import JobsDropdown from '../jobs/JobsDropdown';
import NotificationBell from '../notifications/NotificationBell';
import AutocompleteSearch from '../search/AutocompleteSearch';
import { SearchSubmissionPayload } from '../../types/search';

const Navbar: React.FC = () => {
  const { user, logout, isEmployee, isEmployer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleJobsDropdownClose = () => {
    setIsJobsDropdownOpen(false);
  };


  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleAutocompleteSubmit = (payload: SearchSubmissionPayload) => {
    const params = new URLSearchParams();
    if (payload.query.trim()) params.set('q', payload.query.trim());
    if (payload.location?.trim()) params.set('location', payload.location.trim());
    navigate(`/search?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[1000] transition-all duration-300 ease-out backdrop-blur-[20px] min-h-[80px] shadow-sm shadow-black/10">
      <div className="font-['Plus_Jakarta_Sans',sans-serif] container max-w-7xl mx-auto px-5 py-3 md:px-4 md:py-2.5 sm:px-3 sm:py-2 flex items-center justify-between min-h-[30px] md:min-h-[50px] sm:min-h-[45px] flex-nowrap gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center text-decoration-none text-gray-800 text-3xl md:text-2xl sm:text-xl font-extrabold whitespace-nowrap gap-2 transition-all duration-300 ease-in-out hover:scale-[1.02] flex-shrink-0 focus:outline-none focus-visible:outline-none">
          <img src="/logo.png" alt="MyCareerbuild JOBS" className="h-10 sm:h-12 md:h-14 lg:h-16 transition-all duration-300 ease-in-out object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center flex-shrink-0" role="navigation" aria-label="Main navigation">
          <ul className="flex items-center list-none m-0 p-0 gap-1 whitespace-nowrap">
            {/* Home */}
            <li className="relative">
              <Link 
                to="/" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 hover:bg-slate-50 hover:text-gray-800 ${isActive('/') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Home
              </Link>
            </li>
            

            {/* Jobs Dropdown */}
            <li 
              className="relative"
              onMouseEnter={() => setIsJobsDropdownOpen(true)}
              onMouseLeave={() => setIsJobsDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-gray-600 text-sm transition-all duration-200 ease-in-out relative bg-none border-none shadow-none m-0 py-2 px-2.5 rounded-lg cursor-pointer hover:bg-slate-50 hover:text-gray-800 ${isActive('/jobs') ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => navigate('/jobs')}
              >
                Job Provider
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 ease-in-out text-gray-500 hover:text-gray-600" />
              </button>
              <JobsDropdown
                isOpen={isJobsDropdownOpen}
                onClose={handleJobsDropdownClose}
              />
            </li>

            {/* Job Category */}
            <li className="relative">
              <Link 
                to="/job-categories" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 hover:bg-slate-50 hover:text-gray-800 ${isActive('/job-categories') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Job Category
              </Link>
            </li>

            {/* Blogs */}
            <li className="relative">
              <Link 
                to="/blogs" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 hover:bg-slate-50 hover:text-gray-800 ${isActive('/blogs') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Blogs
              </Link>
            </li>

            {/* Contact Us */}
            <li className="relative">
              <Link 
                to="/contact" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 hover:bg-slate-50 hover:text-gray-800 ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-1 sm:px-2 md:px-3 lg:px-4">
          <div className="w-full max-w-[480px] sm:max-w-[520px] md:max-w-[560px] lg:max-w-[600px] xl:max-w-[680px] 2xl:max-w-[760px] flex-shrink">
            <AutocompleteSearch
              context="navbar"
              placeholder="Search jobs, companies, skills..."
              className="w-full"
              allowLocation={false}
              onSubmit={handleAutocompleteSubmit}
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
          {user ? (
            <>
              <NotificationBell className="mr-0.5" />
              <div className="flex items-center gap-1">
              {isEmployee() && (
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-1 py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline">Dashboard</span>
                </Link>
              )}
              {isEmployer() && (
                <Link 
                  to="/employer/dashboard" 
                  className={`flex items-center gap-1 py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap ${isActive('/employer/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Employer Dashboard</span>
                  <span className="xl:hidden hidden 2xl:inline">Dashboard</span>
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1 py-1.5 px-2 text-red-600 bg-none border-none font-medium text-sm rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-red-50 hover:text-red-700 whitespace-nowrap">
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Logout</span>
              </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
              <Link 
                to="/login" 
                className={`py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap ${isActive('/login') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className={`py-1.5 px-2 text-white text-decoration-none font-semibold text-sm rounded-lg transition-all duration-200 ease-in-out bg-blue-500 hover:bg-blue-600 whitespace-nowrap ${isActive('/signup') ? 'bg-blue-700' : ''}`}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden bg-none border-none text-gray-600 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-gray-800 flex-shrink-0"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-t border-gray-200 shadow-lg shadow-black/10"
          >
            <div className="py-5 md:py-4 sm:py-4">
              <nav className="w-full" role="navigation" aria-label="Mobile navigation">
                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  <li className="m-0">
                    <Link 
                      to="/" 
                      className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/') ? 'bg-blue-50 text-blue-600' : ''}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  
                  <li className="m-0">
                    <Link 
                      to="/jobs" 
                      className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/jobs') ? 'bg-blue-50 text-blue-600' : ''}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Job Provider
                    </Link>
                  </li>
                  
                  <li className="m-0">
                    <Link 
                      to="/job-categories" 
                      className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/job-categories') ? 'bg-blue-50 text-blue-600' : ''}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Job Category
                    </Link>
                  </li>
                  
                  <li className="m-0">
                    <Link 
                      to="/blogs" 
                      className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/blogs') ? 'bg-blue-50 text-blue-600' : ''}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Blogs
                    </Link>
                  </li>
                  
                  <li className="m-0">
                    <Link 
                      to="/contact" 
                      className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : ''}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </li>
                  
                  {user ? (
                    <>
                      {isEmployee() && (
                        <li className="m-0">
                          <Link 
                            to="/dashboard" 
                            className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`} 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="w-5 h-5 flex-shrink-0" />
                            <span>Dashboard</span>
                          </Link>
                        </li>
                      )}
                      {isEmployer() && (
                        <li className="m-0">
                          <Link 
                            to="/employer/dashboard" 
                            className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/employer/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`} 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Building2 className="w-5 h-5 flex-shrink-0" />
                            <span>Employer Dashboard</span>
                          </Link>
                        </li>
                      )}
                      <li className="m-0">
                        <button onClick={handleLogout} className="flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-red-600 bg-none border-none font-medium text-base md:text-base sm:text-sm rounded-xl cursor-pointer transition-all duration-200 ease-in-out w-full text-left hover:bg-red-50 hover:text-red-700">
                          <LogOut className="w-5 h-5 flex-shrink-0" />
                          <span>Logout</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="m-0">
                        <Link 
                          to="/login" 
                          className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800 ${isActive('/login') ? 'bg-blue-50 text-blue-600' : ''}`} 
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                      </li>
                      <li className="m-0">
                        <Link 
                          to="/signup" 
                          className={`flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-white text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-blue-500 hover:bg-blue-600 ${isActive('/signup') ? 'bg-blue-700' : ''}`} 
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;
