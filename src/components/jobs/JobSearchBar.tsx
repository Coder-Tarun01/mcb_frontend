import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Building2, GraduationCap } from 'lucide-react';
import { searchAPI } from '../../services/api';

interface SearchFilters {
  keyword: string;
  location: string;
}

interface JobSearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
  valueFilters?: Partial<SearchFilters>;
  resetToken?: number;
  behaveLikeNavbar?: boolean;
}

const JobSearchBar: React.FC<JobSearchBarProps> = ({ onSearch, className = '', valueFilters, resetToken, behaveLikeNavbar }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    location: ''
  });

  const [isSearching, setIsSearching] = useState(false);
  
  // Autocomplete state
  const [keywordSuggestions, setKeywordSuggestions] = useState<any>({ jobs: [], companies: [], locations: [], skills: [] });
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [keywordSelectedIndex, setKeywordSelectedIndex] = useState(-1);
  const [locationSelectedIndex, setLocationSelectedIndex] = useState(-1);
  
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const keywordDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Sync with parent-provided values (for clear/reset)
  useEffect(() => {
    if (valueFilters) {
      setFilters(prev => ({
        keyword: valueFilters.keyword !== undefined ? valueFilters.keyword : prev.keyword,
        location: valueFilters.location !== undefined ? valueFilters.location : prev.location
      }));
    }
  }, [valueFilters?.keyword, valueFilters?.location]);

  // Close dropdowns when parent signals a reset
  useEffect(() => {
    if (resetToken !== undefined) {
      setShowKeywordDropdown(false);
      setShowLocationDropdown(false);
      setKeywordSelectedIndex(-1);
      setLocationSelectedIndex(-1);
    }
  }, [resetToken]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        keywordDropdownRef.current &&
        !keywordDropdownRef.current.contains(event.target as Node) &&
        !keywordInputRef.current?.contains(event.target as Node)
      ) {
        setShowKeywordDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));

    // Trigger autocomplete
    if (field === 'keyword') {
      setShowKeywordDropdown(value.length >= 2);
      setKeywordSelectedIndex(-1); // Reset selection when typing
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetchKeywordSuggestions(value);
      }, 300);
    } else if (field === 'location') {
      setShowLocationDropdown(value.length >= 2);
      setLocationSelectedIndex(-1); // Reset selection when typing
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetchLocationSuggestions(value);
      }, 300);
    }

  // Trigger real-time search with debouncing (separate timer for search)
  // Skip this when behaving like navbar to avoid auto-navigation while typing
  if (!behaveLikeNavbar && (field === 'keyword' || field === 'location')) {
      const searchTimer = setTimeout(() => {
        if (onSearch && (value.length >= 2 || value.length === 0)) {
          const currentFilters = { ...filters, [field]: value };
          onSearch({ keyword: currentFilters.keyword, location: currentFilters.location });
        }
      }, 500); // 500ms debounce for real-time search
      
      // Clear previous search timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = searchTimer;
    }
  };

  const fetchKeywordSuggestions = async (query: string) => {
    if (query.length < 2) {
      setKeywordSuggestions({ jobs: [], companies: [], locations: [], skills: [] });
      return;
    }

    try {
      const data = await searchAPI.autocomplete(query);
      setKeywordSuggestions({
        jobs: data.jobs || [],
        companies: data.companies || [],
        locations: data.locations || [],
        skills: data.skills || []
      });
    } catch (error) {
      console.error('Keyword autocomplete error:', error);
      setKeywordSuggestions({ jobs: [], companies: [], locations: [], skills: [] });
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const data = await searchAPI.autocompleteLocations(query);
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Location autocomplete error:', error);
    }
  };

  const selectKeywordSuggestion = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setShowKeywordDropdown(false);
    setKeywordSelectedIndex(-1);
    if (behaveLikeNavbar && value.trim()) {
      const params = new URLSearchParams();
      params.set('q', value.trim());
      if (filters.location?.trim()) params.set('location', filters.location.trim());
      navigate(`/search?${params.toString()}`);
    }
  };

  const selectLocationSuggestion = (value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
    setShowLocationDropdown(false);
    setLocationSelectedIndex(-1);
    if (behaveLikeNavbar && value.trim()) {
      const params = new URLSearchParams();
      // For a pure location selection, do NOT set q; only set location
      if (filters.keyword?.trim()) params.set('q', filters.keyword.trim());
      params.set('location', value.trim());
      navigate(`/search?${params.toString()}`);
    }
  };

  const getAllKeywordSuggestions = () => {
    const allSuggestions: Array<{ value: string; type: 'job' | 'company' | 'location' | 'skill' }> = [];
    
    // Add job suggestions
    if (keywordSuggestions.jobs && Array.isArray(keywordSuggestions.jobs)) {
      keywordSuggestions.jobs.slice(0, 3).forEach((job: any) => {
        allSuggestions.push({ value: job.title, type: 'job' });
      });
    }
    
    // Add company suggestions (show all companies)
    if (keywordSuggestions.companies && Array.isArray(keywordSuggestions.companies)) {
      keywordSuggestions.companies.forEach((company: string) => {
        allSuggestions.push({ value: company, type: 'company' });
      });
    }
    
    // Add location suggestions
    if (keywordSuggestions.locations && Array.isArray(keywordSuggestions.locations)) {
      keywordSuggestions.locations.slice(0, 3).forEach((location: string) => {
        allSuggestions.push({ value: location, type: 'location' });
      });
    }
    
    // Add skill suggestions
    if (keywordSuggestions.skills && Array.isArray(keywordSuggestions.skills)) {
      keywordSuggestions.skills.slice(0, 3).forEach((skill: string) => {
        allSuggestions.push({ value: skill, type: 'skill' });
      });
    }
    
    return allSuggestions;
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (!showKeywordDropdown) return;
    
    const allSuggestions = getAllKeywordSuggestions();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setKeywordSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setKeywordSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (keywordSelectedIndex >= 0 && keywordSelectedIndex < allSuggestions.length) {
          selectKeywordSuggestion(allSuggestions[keywordSelectedIndex].value);
        }
        break;
      case 'Escape':
        setShowKeywordDropdown(false);
        setKeywordSelectedIndex(-1);
        break;
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (!showLocationDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setLocationSelectedIndex(prev => 
          prev < locationSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setLocationSelectedIndex(prev => 
          prev > 0 ? prev - 1 : locationSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (locationSelectedIndex >= 0 && locationSelectedIndex < locationSuggestions.length) {
          selectLocationSuggestion(locationSuggestions[locationSelectedIndex]);
        }
        break;
      case 'Escape':
        setShowLocationDropdown(false);
        setLocationSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setShowKeywordDropdown(false);
    setShowLocationDropdown(false);
    setKeywordSelectedIndex(-1);
    setLocationSelectedIndex(-1);
    
    try {
      if (behaveLikeNavbar) {
        const q = filters.keyword?.trim() || filters.location?.trim() || '';
        if (q) {
          const params = new URLSearchParams();
          params.set('q', q);
          if (filters.location?.trim()) params.set('location', filters.location.trim());
          navigate(`/search?${params.toString()}`);
        }
      } else {
        // Call the onSearch callback if provided (this will trigger real-time search)
        if (onSearch) {
          onSearch(filters);
        }
      }
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl sm:px-3 md:px-0 ${className}`}>
      <form role="search" onSubmit={handleSearch} className="relative">
        <label htmlFor="job-keyword" className="sr-only">Search by job title, keyword, or company</label>
        <label htmlFor="job-location" className="sr-only">Search by location</label>

        <div className="flex w-full rounded-2xl bg-white border border-gray-200 shadow-lg shadow-black/10 overflow-hidden focus-within:border-gray-300 focus-within:shadow-xl">
          {/* Keyword */}
          <div className="flex flex-1 items-center gap-3 px-5 py-4 border-r border-gray-200 focus-within:outline-none">
            <Search className="w-5 h-5 text-gray-500" aria-hidden="true" />
            <input
              id="job-keyword"
              ref={keywordInputRef}
              type="text"
              placeholder="Job title, keywords, or company"
              value={filters.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onFocus={() => filters.keyword.length >= 2 && setShowKeywordDropdown(true)}
              className="w-full bg-transparent outline-none border-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none text-base text-gray-900 placeholder:text-gray-500 caret-blue-600"
              autoComplete="off"
            />
          </div>

          {/* Location */}
          <div className="flex flex-1 items-center gap-3 px-5 py-4 focus-within:outline-none">
            <MapPin className="w-5 h-5 text-gray-500" aria-hidden="true" />
            <input
              id="job-location"
              ref={locationInputRef}
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              onKeyDown={handleLocationKeyDown}
              onFocus={() => filters.location.length >= 2 && setShowLocationDropdown(true)}
              className="w-full bg-transparent outline-none border-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none text-base text-gray-900 placeholder:text-gray-500 caret-blue-600"
              autoComplete="off"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 font-semibold transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            disabled={isSearching}
            aria-label="Search jobs"
          >
            <Search className="w-5 h-5 text-white" aria-hidden="true" />
            <span className="text-white">{isSearching ? 'Searching...' : 'Search Jobs'}</span>
          </button>
        </div>

        {/* Keyword Dropdown */}
        {showKeywordDropdown && ((keywordSuggestions.jobs && keywordSuggestions.jobs.length > 0) || (keywordSuggestions.companies && keywordSuggestions.companies.length > 0) || (keywordSuggestions.locations && keywordSuggestions.locations.length > 0) || (keywordSuggestions.skills && keywordSuggestions.skills.length > 0)) && (
          <div ref={keywordDropdownRef} className="absolute left-0 right-1/2 pr-2 top-full mt-1 z-50 sm:left-0 sm:right-0 sm:pr-0">
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-96 overflow-y-auto">
              {behaveLikeNavbar ? (
                // Single merged list like navbar
                <>
                  {getAllKeywordSuggestions().length === 0 ? (
                    <div className="py-6 px-4 text-center">
                      <div className="text-sm font-medium text-gray-700 mb-2">No results found for "{filters.keyword}"</div>
                      <div className="text-xs text-gray-500">Try different keywords or check spelling</div>
                    </div>
                  ) : (
                    getAllKeywordSuggestions().map((item, idx) => {
                      const isSelected = keywordSelectedIndex === idx;
                      return (
                        <div
                          key={`${item.type}-${idx}`}
                          className={`flex items-center py-2.5 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                          onClick={() => selectKeywordSuggestion(item.value)}
                        >
                          {item.type === 'job' ? (
                            <Briefcase size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          ) : item.type === 'company' ? (
                            <Building2 size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          ) : item.type === 'location' ? (
                            <MapPin size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          ) : (
                            <GraduationCap size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          )}
                          <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{item.value}</div>
                        </div>
                      );
                    })
                  )}
                </>
              ) : (!keywordSuggestions.jobs || keywordSuggestions.jobs.length === 0) && (!keywordSuggestions.companies || keywordSuggestions.companies.length === 0) && (!keywordSuggestions.locations || keywordSuggestions.locations.length === 0) && (!keywordSuggestions.skills || keywordSuggestions.skills.length === 0) ? (
                <div className="py-6 px-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">No results found for "{filters.keyword}"</div>
                  <div className="text-xs text-gray-500">Try different keywords or check spelling</div>
                </div>
              ) : (
                <>
                  {keywordSuggestions.jobs && keywordSuggestions.jobs.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</div>
                      {keywordSuggestions.jobs.slice(0, 3).map((job: any, jobIndex: number) => {
                        const jobsDisplayed = Math.min(3, keywordSuggestions.jobs?.length || 0);
                        const globalIndex = jobIndex;
                        const isSelected = keywordSelectedIndex === globalIndex;
                        return (
                          <div
                            key={job.id}
                            className={`flex items-center py-2.5 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectKeywordSuggestion(job.title)}
                          >
                            <Briefcase size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className="min-w-0">
                              <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{job.title}</div>
                              <div className={`text-xs truncate ${isSelected ? 'text-white' : 'text-gray-500'}`}>{job.company}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {keywordSuggestions.companies && keywordSuggestions.companies.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Companies</div>
                      {keywordSuggestions.companies.map((company: string, companyIndex: number) => {
                        const jobsDisplayed = Math.min(3, keywordSuggestions.jobs?.length || 0);
                        const globalIndex = jobsDisplayed + companyIndex;
                        const isSelected = keywordSelectedIndex === globalIndex;
                        return (
                          <div
                            key={companyIndex}
                            className={`flex items-center py-2.5 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectKeywordSuggestion(company)}
                          >
                            <Building2 size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{company}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {keywordSuggestions.locations && keywordSuggestions.locations.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Locations</div>
                      {keywordSuggestions.locations.slice(0, 3).map((location: string, locationIndex: number) => {
                        const jobsDisplayed = Math.min(3, keywordSuggestions.jobs?.length || 0);
                        const companiesDisplayed = Math.min(3, keywordSuggestions.companies?.length || 0);
                        const globalIndex = jobsDisplayed + companiesDisplayed + locationIndex;
                        const isSelected = keywordSelectedIndex === globalIndex;
                        return (
                          <div
                            key={locationIndex}
                            className={`flex items-center py-2.5 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectKeywordSuggestion(location)}
                          >
                            <MapPin size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{location}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {keywordSuggestions.skills && keywordSuggestions.skills.length > 0 && (
                    <div className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</div>
                      {keywordSuggestions.skills.slice(0, 3).map((skill: string, skillIndex: number) => {
                        const jobsDisplayed = Math.min(3, keywordSuggestions.jobs?.length || 0);
                        const companiesDisplayed = Math.min(3, keywordSuggestions.companies?.length || 0);
                        const locationsDisplayed = Math.min(3, keywordSuggestions.locations?.length || 0);
                        const globalIndex = jobsDisplayed + companiesDisplayed + locationsDisplayed + skillIndex;
                        const isSelected = keywordSelectedIndex === globalIndex;
                        return (
                          <div
                            key={skillIndex}
                            className={`flex items-center py-2.5 px-4 cursor-pointer transition-colors duration-150 ease-in-out ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                            onClick={() => selectKeywordSuggestion(skill)}
                          >
                            <GraduationCap size={16} className={`mr-3 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{skill}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Location Dropdown */}
        {showLocationDropdown && (
          <div ref={locationDropdownRef} className="absolute right-0 left-1/2 pl-2 top-full mt-1 z-50 sm:left-0 sm:right-0 sm:pl-0">
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-96 overflow-y-auto">
              {locationSuggestions.length === 0 ? (
                <div className="py-6 px-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">No locations found for "{filters.location}"</div>
                  <div className="text-xs text-gray-500">Try a different location name</div>
                </div>
              ) : (
                locationSuggestions.map((location: string, idx: number) => (
                  <div
                    key={idx}
                    className={`flex items-center py-2.5 px-4 cursor-pointer hover:bg-gray-50 ${locationSelectedIndex === idx ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => selectLocationSuggestion(location)}
                  >
                    <MapPin size={16} className={`mr-3 ${locationSelectedIndex === idx ? 'text-white' : 'text-gray-500'}`} />
                    <div className={`text-sm font-medium truncate ${locationSelectedIndex === idx ? 'text-white' : 'text-gray-900'}`}>{location}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobSearchBar;