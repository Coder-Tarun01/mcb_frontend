import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Building2,
  Briefcase,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import JobsDropdown from '../jobs/JobsDropdown';
import NotificationBell from '../notifications/NotificationBell';
import { suggestAPI } from '../../services/api';
import { useEmployerSidebarSafe } from '../../context/EmployerSidebarContext';
import { useDashboardSidebarSafe } from '../../context/DashboardSidebarContext';

const Navbar: React.FC = () => {
  const { user, logout, isEmployee, isEmployer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any>({ jobs: [], companies: [], locations: [], skills: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Employer sidebar context (only available on employer routes)
  // Always call hook unconditionally - it returns null if context not available
  const employerSidebar = useEmployerSidebarSafe();
  const dashboardSidebar = useDashboardSidebarSafe();

  // Check if we're on an employer route
  const isEmployerRoute = location.pathname.startsWith('/employer');
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  
  // Check if hamburger should be shown (only on mobile/tablet)
  const shouldShowEmployerHamburger = employerSidebar && employerSidebar.isMobileOrTablet;
  const shouldShowDashboardHamburger = dashboardSidebar && dashboardSidebar.isMobileOrTablet;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(value.length >= 2);
    setSelectedIndex(-1); // Reset selection when typing
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (value.length >= 2) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions({ jobs: [], companies: [], locations: [], skills: [] });
    }
  };

  const fetchSuggestions = async (query: string) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const data = await suggestAPI.fetchSuggestions(query, controller.signal);
      setSuggestions({
        jobs: data.jobs || [],
        companies: data.companies || [],
        locations: data.locations || [],
        skills: data.skills || []
      });
    } catch (error: any) {
      // Don't handle AbortError - it's expected when cancelling requests
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Autocomplete error:', error);
      setSuggestions({ jobs: [], companies: [], locations: [], skills: [] });
    }
  };

  const selectSuggestion = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(false);
    setSelectedIndex(-1);
    navigate(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  const getAllSuggestions = () => {
    const allSuggestions: Array<{ value: string; type: 'job' | 'company' | 'location' | 'skill' }> = [];
    
    // Add job suggestions (now strings, not objects)
    if (suggestions.jobs && Array.isArray(suggestions.jobs)) {
      suggestions.jobs.slice(0, 3).forEach((jobTitle: string) => {
        allSuggestions.push({ value: jobTitle, type: 'job' });
      });
    }
    
    // Add company suggestions (show all companies)
    if (suggestions.companies && Array.isArray(suggestions.companies)) {
      suggestions.companies.forEach((company: string) => {
        allSuggestions.push({ value: company, type: 'company' });
      });
    }
    
    // Add location suggestions
    if (suggestions.locations && Array.isArray(suggestions.locations)) {
      suggestions.locations.slice(0, 3).forEach((location: string) => {
        allSuggestions.push({ value: location, type: 'location' });
      });
    }
    
    // Add skill suggestions
    if (suggestions.skills && Array.isArray(suggestions.skills)) {
      suggestions.skills.slice(0, 3).forEach((skill: string) => {
        allSuggestions.push({ value: skill, type: 'skill' });
      });
    }
    
    return allSuggestions;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    
    const allSuggestions = getAllSuggestions();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
          selectSuggestion(allSuggestions[selectedIndex].value);
        } else if (searchQuery.trim()) {
          handleSearch(e as any);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[1000] transition-all duration-300 ease-out backdrop-blur-[20px] min-h-[56px] md:min-h-[80px] shadow-sm shadow-black/10">
      <div className="font-['Plus_Jakarta_Sans',sans-serif] container max-w-7xl mx-auto px-3 py-1.5 md:px-4 md:py-2.5 sm:px-3 sm:py-2 flex items-center justify-between min-h-[30px] md:min-h-[50px] sm:min-h-[45px] gap-1.5 sm:gap-3 md:gap-x-3 md:gap-y-2 flex-nowrap md:flex-wrap lg:flex-nowrap">
        {/* Logo */}
        <Link to="/" className="flex items-center text-decoration-none text-gray-800 text-3xl md:text-2xl sm:text-xl font-extrabold whitespace-nowrap gap-2 transition-all duration-300 ease-in-out hover:scale-[1.02] flex-shrink-0 focus:outline-none focus-visible:outline-none">
          <img src="/logo.png" alt="MyCareerbuild JOBS" className="h-12 sm:h-12 md:h-14 lg:h-16 transition-all duration-300 ease-in-out object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center md:flex-wrap md:justify-center lg:justify-start md:flex-1 lg:flex-initial order-3 md:order-2 lg:order-none"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="flex items-center list-none m-0 p-0 gap-1 whitespace-nowrap md:flex-wrap md:justify-center md:gap-0.5">
            {/* Home */}
            <li className="relative">
              <Link 
                to="/" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm md:text-xs lg:text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 md:py-1.5 md:px-2 hover:bg-slate-50 hover:text-gray-800 ${isActive('/') ? 'bg-blue-50 text-blue-600' : ''}`}
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
                className={`flex items-center gap-1 text-gray-600 text-sm md:text-xs lg:text-sm transition-all duration-200 ease-in-out relative bg-none border-none shadow-none m-0 py-2 px-2.5 md:py-1.5 md:px-2 rounded-lg cursor-pointer hover:bg-slate-50 hover:text-gray-800 ${isActive('/jobs') ? 'bg-blue-50 text-blue-600' : ''}`}
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
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm md:text-xs lg:text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 md:py-1.5 md:px-2 hover:bg-slate-50 hover:text-gray-800 ${isActive('/job-categories') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Job Category
              </Link>
            </li>

            {/* Blogs */}
            <li className="relative">
              <Link 
                to="/blogs" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm md:text-xs lg:text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 md:py-1.5 md:px-2 hover:bg-slate-50 hover:text-gray-800 ${isActive('/blogs') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Blogs
              </Link>
            </li>

            {/* Contact Us */}
            <li className="relative">
              <Link 
                to="/contact" 
                className={`w-auto flex items-center text-decoration-none text-gray-600 text-sm md:text-xs lg:text-sm transition-all duration-200 ease-in-out whitespace-nowrap border-none bg-none rounded-lg cursor-pointer py-2 px-2.5 md:py-1.5 md:px-2 hover:bg-slate-50 hover:text-gray-800 ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Search Bar with Autocomplete */}
        <form
          onSubmit={handleSearch}
          className={`order-2 md:order-4 lg:order-none flex-1 md:flex-none w-full max-w-full md:max-w-full md:basis-full lg:basis-auto md:mt-2 lg:mt-0 md:mx-0 lg:mx-2 xl:mx-3 relative transition-all duration-300 ease-in-out flex-shrink lg:flex-1 lg:max-w-xs xl:max-w-sm ${isSearchFocused ? 'focused' : ''}`}
        >
          <div className="relative w-full">
            <Search className="absolute left-4 md:left-3 sm:left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 text-gray-400 transition-colors duration-200 ease-in-out pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchQuery.length >= 2) setShowDropdown(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full py-3.5 px-4 pl-11 md:py-3 md:px-3 md:pl-9 sm:py-3 sm:px-3 sm:pl-9 border border-gray-300 rounded-xl text-sm md:text-sm sm:text-xs bg-white transition-all duration-200 ease-in-out h-11 md:h-11 sm:h-10 shadow-sm shadow-black/5 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
              autoComplete="off"
            />
            
            {/* Autocomplete Dropdown */}
            {showDropdown && (
              <div ref={dropdownRef} className="absolute top-[calc(100%+4px)] left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:min-w-[340px] sm:max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/15 max-h-[350px] overflow-y-auto z-[2000]">
                {(!suggestions.jobs || suggestions.jobs.length === 0) && (!suggestions.companies || suggestions.companies.length === 0) && (!suggestions.locations || suggestions.locations.length === 0) && (!suggestions.skills || suggestions.skills.length === 0) ? (
                  <div className="py-5 px-4 text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1.5">No results found for "{searchQuery}"</div>
                    <div className="text-xs text-gray-500">Try different keywords</div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      let globalIndex = 0;
                      return (
                        <>
                          {suggestions.jobs && suggestions.jobs.length > 0 && (
                            <div className="py-1.5 border-b border-gray-100 last:border-b-0">
                              <div className="py-1.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</div>
                              {suggestions.jobs.slice(0, 3).map((jobTitle: string, jobIndex: number) => {
                                const currentIndex = globalIndex++;
                                const isSelected = selectedIndex === currentIndex;
                                return (
                                  <div
                                    key={`job-${jobIndex}`}
                                    className={`flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                                    onClick={() => selectSuggestion(jobTitle)}
                                  >
                                    <Briefcase size={14} className={`mr-2.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>{jobTitle}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {suggestions.companies && suggestions.companies.length > 0 && (
                            <div className="py-1.5 border-b border-gray-100 last:border-b-0">
                              <div className="py-1.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Companies</div>
                              {suggestions.companies.map((company: string, companyIndex: number) => {
                                const currentIndex = globalIndex++;
                                const isSelected = selectedIndex === currentIndex;
                                return (
                                  <div
                                    key={`company-${companyIndex}`}
                                    className={`flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                                    onClick={() => selectSuggestion(company)}
                                  >
                                    <Building2 size={14} className={`mr-2.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>{company}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {suggestions.locations && suggestions.locations.length > 0 && (
                            <div className="py-1.5 border-b border-gray-100 last:border-b-0">
                              <div className="py-1.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Locations</div>
                              {suggestions.locations.slice(0, 3).map((location: string, locationIndex: number) => {
                                const currentIndex = globalIndex++;
                                const isSelected = selectedIndex === currentIndex;
                                return (
                                  <div
                                    key={`location-${locationIndex}`}
                                    className={`flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                                    onClick={() => selectSuggestion(location)}
                                  >
                                    <MapPin size={14} className={`mr-2.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>{location}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {suggestions.skills && suggestions.skills.length > 0 && (
                            <div className="py-1.5 border-b border-gray-100 last:border-b-0">
                              <div className="py-1.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</div>
                              {suggestions.skills.slice(0, 3).map((skill: string, skillIndex: number) => {
                                const currentIndex = globalIndex++;
                                const isSelected = selectedIndex === currentIndex;
                                return (
                                  <div
                                    key={`skill-${skillIndex}`}
                                    className={`flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                                    onClick={() => selectSuggestion(skill)}
                                  >
                                    <GraduationCap size={14} className={`mr-2.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>{skill}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </form>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0 whitespace-nowrap order-5 md:order-3 lg:order-none md:ml-auto">
          {user ? (
            <>
              <NotificationBell className="mr-0.5" />
              <div className="flex items-center gap-1">
              {/* Employer Sidebar Hamburger (only on employer routes and mobile/tablet) */}
              {isEmployerRoute && shouldShowEmployerHamburger && employerSidebar && (
                <button
                  onClick={() => employerSidebar.toggleSidebar()}
                  className="flex items-center gap-1 py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
              {/* Employee Sidebar Hamburger (only on dashboard routes and mobile/tablet) */}
              {isDashboardRoute && shouldShowDashboardHamburger && dashboardSidebar && (
                <button
                  onClick={() => dashboardSidebar.toggleSidebar()}
                  className="flex items-center gap-1 py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
              {isEmployee() && (
                <Link 
                  to="/dashboard" 
                  className={`flex items-center justify-center py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`}
                  title="Employee Dashboard"
                  aria-label="Employee Dashboard"
                >
                  <User className="w-4 h-4" />
                </Link>
              )}
              {isEmployer() && (
                <Link 
                  to="/employer/dashboard" 
                  className={`flex items-center justify-center py-1.5 px-2 text-gray-600 text-decoration-none font-medium text-sm rounded-lg transition-all duration-200 ease-in-out bg-none border-none shadow-none hover:bg-slate-50 hover:text-gray-800 whitespace-nowrap ${isActive('/employer/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`}
                  title="Employer Dashboard"
                  aria-label="Employer Dashboard"
                >
                  <Building2 className="w-4 h-4" />
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center py-1.5 px-2 text-red-600 bg-none border-none font-medium text-sm rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
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
          className="md:hidden bg-none border-none text-gray-600 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-gray-800 flex-shrink-0 order-3"
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
                      {/* Employer Sidebar Hamburger (mobile menu, only on employer routes and mobile/tablet) */}
                      {isEmployerRoute && shouldShowEmployerHamburger && (
                        <li className="m-0">
                          <button
                            onClick={() => {
                              employerSidebar?.toggleSidebar();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800"
                            aria-label="Toggle sidebar"
                          >
                            <Menu className="w-5 h-5 flex-shrink-0" />
                            <span>Menu</span>
                          </button>
                        </li>
                      )}
                      {/* Employee Sidebar Hamburger (mobile menu, only on dashboard routes and mobile/tablet) */}
                      {isDashboardRoute && shouldShowDashboardHamburger && (
                        <li className="m-0">
                          <button
                            onClick={() => {
                              dashboardSidebar?.toggleSidebar();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 py-4 px-5 md:py-3.5 md:px-4 sm:py-3.5 sm:px-4 text-gray-600 text-decoration-none font-medium text-base md:text-base sm:text-sm rounded-xl transition-all duration-200 ease-in-out bg-none border-none shadow-none m-0 w-full text-left hover:bg-slate-50 hover:text-gray-800"
                            aria-label="Toggle sidebar"
                          >
                            <Menu className="w-5 h-5 flex-shrink-0" />
                            <span>Menu</span>
                          </button>
                        </li>
                      )}
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
