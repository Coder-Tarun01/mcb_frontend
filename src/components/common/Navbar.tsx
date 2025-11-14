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
import { searchAPI } from '../../services/api';

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
    try {
      const data = await searchAPI.autocomplete(query);
      setSuggestions({
        jobs: data.jobs || [],
        companies: data.companies || [],
        locations: data.locations || [],
        skills: data.skills || []
      });
    } catch (error) {
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
    
    // Add job suggestions
    if (suggestions.jobs && Array.isArray(suggestions.jobs)) {
      suggestions.jobs.slice(0, 3).forEach((job: any) => {
        allSuggestions.push({ value: job.title, type: 'job' });
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

        {/* Search Bar with Autocomplete */}
        <form onSubmit={handleSearch} className={`flex-1 max-w-xs min-w-[160px] md:max-w-sm md:min-w-[180px] sm:max-w-[180px] sm:min-w-[140px] mx-2 md:mx-2 sm:mx-2 relative transition-all duration-300 ease-in-out flex-shrink lg:max-w-sm xl:max-w-md lg:mx-2 xl:mx-3 ${isSearchFocused ? 'focused' : ''}`}>
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
              <div ref={dropdownRef} className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/15 max-h-[350px] overflow-y-auto z-[2000]">
                {(!suggestions.jobs || suggestions.jobs.length === 0) && (!suggestions.companies || suggestions.companies.length === 0) && (!suggestions.locations || suggestions.locations.length === 0) && (!suggestions.skills || suggestions.skills.length === 0) ? (
                  <div className="py-5 px-4 text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1.5">No results found for "{searchQuery}"</div>
                    <div className="text-xs text-gray-500">Try different keywords</div>
                  </div>
                ) : (
                  <>
                    {suggestions.jobs && suggestions.jobs.length > 0 && (
                      <div className="py-1.5 border-b border-gray-100 last:border-b-0">
                        <div className="py-1.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</div>
                        {suggestions.jobs.slice(0, 3).map((job: any, jobIndex: number) => {
                          const globalIndex = jobIndex;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <div
                              key={job.id}
                              className={`flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                              onClick={() => selectSuggestion(job.title)}
                            >
                              <Briefcase size={14} className={`mr-2.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>{job.title}</div>
                                <div className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis mt-0.5 ${isSelected ? 'text-white' : 'text-gray-500'}`}>{job.company}</div>
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
                          const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                          const globalIndex = jobsDisplayed + companyIndex;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <div
                              key={companyIndex}
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
                          const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                          const companiesDisplayed = Math.min(3, suggestions.companies?.length || 0);
                          const globalIndex = jobsDisplayed + companiesDisplayed + locationIndex;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <div
                              key={locationIndex}
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
                          const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                          const companiesDisplayed = Math.min(3, suggestions.companies?.length || 0);
                          const locationsDisplayed = Math.min(3, suggestions.locations?.length || 0);
                          const globalIndex = jobsDisplayed + companiesDisplayed + locationsDisplayed + skillIndex;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <div
                              key={skillIndex}
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
                )}
              </div>
            )}
          </div>
        </form>

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
