import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const HomePageSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    if (params.toString()) navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className={`flex items-stretch gap-0 bg-white rounded-[40px] p-2.5 shadow-xl shadow-black/10 border border-gray-200 transition-all duration-300 ease-in-out ${isSearchFocused ? 'shadow-2xl shadow-blue-500/15 border-blue-500' : ''}`}>
        {/* Keywords */}
        <div className="relative flex-1 min-w-0 w-full">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ease-in-out pointer-events-none ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
            }}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full py-3.5 px-5 pl-12 border border-transparent rounded-l-[30px] text-base bg-white transition-all duration-200 ease-in-out h-12 outline-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            autoComplete="off"
          />
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
