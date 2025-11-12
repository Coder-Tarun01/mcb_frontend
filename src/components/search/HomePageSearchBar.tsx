import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Building2, MapPin, GraduationCap } from 'lucide-react';
import { searchAPI } from '../../services/api';

const HomePageSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any>({ jobs: [], companies: [], locations: [], skills: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

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

  // Position the dropdown as a fixed overlay directly under the input
  const updateDropdownPosition = () => {
    const input = searchInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const top = rect.bottom + 8; // 8px gap
    const left = rect.left;
    const width = rect.width;
    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width,
      zIndex: 9999
    });
  };

  useEffect(() => {
    if (!showDropdown) return;
    updateDropdownPosition();
    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showDropdown]);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(value.length >= 2);
    setSelectedIndex(-1); // Reset selection when typing
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (value.length >= 2) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
        // Recompute dropdown position as user types
        updateDropdownPosition();
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
    const params = new URLSearchParams();
    if (value.trim()) params.set('q', value.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/search?${params.toString()}`);
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
        } else {
          // Do not navigate on Enter when dropdown is open and no selection
          // Users can click the submit button or close dropdown to search
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
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    if (params.toString()) navigate(`/search?${params.toString()}`);
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className={`flex items-stretch gap-0 bg-white rounded-[40px] p-2.5 shadow-xl shadow-black/10 border border-gray-200 transition-all duration-300 ease-in-out ${isSearchFocused ? 'shadow-2xl shadow-blue-500/15 border-blue-500' : ''}`}>
        {/* Keywords */}
        <div className="relative flex-1 min-w-0 w-full">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ease-in-out pointer-events-none ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsSearchFocused(true);
              if (searchQuery.length >= 2) setShowDropdown(true);
            }}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full py-3.5 px-5 pl-12 border border-transparent rounded-l-[30px] text-base bg-white transition-all duration-200 ease-in-out h-12 outline-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            autoComplete="off"
          />

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-xl shadow-xl shadow-black/15 max-h-96 overflow-y-auto z-[9999]" style={dropdownStyle}>
              {(!suggestions.jobs || suggestions.jobs.length === 0) && (!suggestions.companies || suggestions.companies.length === 0) && (!suggestions.locations || suggestions.locations.length === 0) && (!suggestions.skills || suggestions.skills.length === 0) ? (
                <div className="py-6 px-5 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    No results found for "{searchQuery}"
                  </div>
                  <div className="text-xs text-gray-500">
                    Try different keywords
                  </div>
                </div>
              ) : (
                <>
                  {suggestions.jobs && suggestions.jobs.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Jobs
                      </div>
                      {suggestions.jobs.slice(0, 3).map((job: any, jobIndex: number) => {
                        const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                        const globalIndex = jobIndex;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                          <div
                            key={job.id}
                            className={`flex items-center py-3 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectSuggestion(job.title)}
                          >
                            <Briefcase size={14} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {job.title}
                              </div>
                              <div className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis mt-0.5 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                {job.company}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {suggestions.companies && suggestions.companies.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Companies
                      </div>
                      {suggestions.companies.map((company: string, companyIndex: number) => {
                        const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                        const globalIndex = jobsDisplayed + companyIndex;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                          <div
                            key={companyIndex}
                            className={`flex items-center py-3 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectSuggestion(company)}
                          >
                            <Building2 size={14} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {company}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {suggestions.locations && suggestions.locations.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Locations
                      </div>
                      {suggestions.locations.slice(0, 3).map((location: string, locationIndex: number) => {
                        const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                        const companiesDisplayed = Math.min(3, suggestions.companies?.length || 0);
                        const globalIndex = jobsDisplayed + companiesDisplayed + locationIndex;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                          <div
                            key={locationIndex}
                            className={`flex items-center py-3 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectSuggestion(location)}
                          >
                            <MapPin size={14} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {location}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {suggestions.skills && suggestions.skills.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Skills
                      </div>
                      {suggestions.skills.slice(0, 3).map((skill: string, skillIndex: number) => {
                        const jobsDisplayed = Math.min(3, suggestions.jobs?.length || 0);
                        const companiesDisplayed = Math.min(3, suggestions.companies?.length || 0);
                        const locationsDisplayed = Math.min(3, suggestions.locations?.length || 0);
                        const globalIndex = jobsDisplayed + companiesDisplayed + locationsDisplayed + skillIndex;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                          <div
                            key={skillIndex}
                            className={`flex items-center py-3 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectSuggestion(skill)}
                          >
                            <GraduationCap size={14} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {skill}
                              </div>
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
        {/* Divider */}
        <div className="hidden md:flex items-center px-3">
          <div className="w-px h-7 bg-gray-200" />
        </div>

        {/* Location */}
        <div className="relative w-[220px] hidden md:block">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full py-3.5 pl-11 pr-4 border border-transparent rounded-r-[30px] text-base bg-white h-12 outline-none text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button type="submit" className="ml-3 flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none rounded-[30px] text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap h-12 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 flex-none">
          <Search className="w-4.5 h-4.5" />
          <span className="text-white">Search Jobs</span>
        </button>
      </form>
    </div>
  );
};

export default HomePageSearchBar;
