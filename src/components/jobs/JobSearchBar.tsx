import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AutocompleteSearch from '../search/AutocompleteSearch';
import { SearchSubmissionPayload } from '../../types/search';

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

const JobSearchBar: React.FC<JobSearchBarProps> = ({ onSearch, className = '', valueFilters, behaveLikeNavbar }) => {
  const navigate = useNavigate();
  const defaultQuery = valueFilters?.keyword ?? '';
  const defaultLocation = valueFilters?.location ?? '';
  const lastSearchRef = useRef<SearchFilters | null>(null);

  const handleSubmit = useCallback(
    (payload: SearchSubmissionPayload) => {
      if (behaveLikeNavbar) {
        const params = new URLSearchParams();
        if (payload.query.trim()) params.set('q', payload.query.trim());
        if (payload.location?.trim()) params.set('location', payload.location.trim());
        navigate(`/search?${params.toString()}`);
        return;
      }
      if (onSearch) {
        const nextFilters: SearchFilters = {
          keyword: payload.query.trim(),
          location: payload.location?.trim() || '',
        };
        lastSearchRef.current = nextFilters;
        onSearch(nextFilters);
      }
    },
    [behaveLikeNavbar, navigate, onSearch]
  );

  const handleDebouncedSearch = useCallback(
    (payload: SearchSubmissionPayload) => {
      if (behaveLikeNavbar) return;
      if (!onSearch) return;
      const nextFilters: SearchFilters = {
        keyword: payload.query.trim(),
        location: payload.location?.trim() || '',
      };
      const last = lastSearchRef.current;
      if (last && last.keyword === nextFilters.keyword && last.location === nextFilters.location) {
        return;
      }
      lastSearchRef.current = nextFilters;
      onSearch(nextFilters);
    },
    [behaveLikeNavbar, onSearch]
  );

  return (
    <div className={`w-full max-w-3xl mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl sm:px-3 md:px-0 ${className}`}>
      <AutocompleteSearch
        context="jobs"
        allowLocation
        defaultQuery={defaultQuery}
        defaultLocation={defaultLocation}
        onSubmit={handleSubmit}
        onDebouncedSearch={handleDebouncedSearch}
        placeholder="Search by title, company, or skill"
      />
    </div>
  );
};

export default JobSearchBar;