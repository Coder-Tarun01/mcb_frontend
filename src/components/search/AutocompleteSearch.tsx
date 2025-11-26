import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  History,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { suggestAPI } from '../../services/api';
import {
  SearchSubmissionPayload,
  SuggestionCategory,
  SuggestionItem,
  SuggestionResponseDto,
} from '../../types/search';
import { useAuth } from '../../context/AuthContext';

const RECENT_SEARCH_KEY = 'mcb_recent_searches_v1';
const INPUT_DEBOUNCE_MS = 300;
const MAX_RECENT = 8;
const DEFAULT_SUGGESTIONS: SuggestionResponseDto = {
  jobs: [],
  companies: [],
  skills: [],
  locations: [],
};

interface RecentSearchEntry {
  query: string;
  location?: string;
  context: SearchSubmissionPayload['context'];
  timestamp: number;
}

interface AutocompleteSearchProps {
  placeholder?: string;
  context: SearchSubmissionPayload['context'];
  allowLocation?: boolean;
  defaultQuery?: string;
  defaultLocation?: string;
  className?: string;
  autoFocus?: boolean;
  onSubmit?: (payload: SearchSubmissionPayload) => void;
  onDebouncedSearch?: (payload: SearchSubmissionPayload) => void;
}

interface SuggestionSection {
  id: SuggestionCategory | 'recent' | 'trending';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SuggestionItem[];
  helperText?: string;
}

const categoryConfig: Record<
  SuggestionCategory | 'recent' | 'trending',
  { title: string; icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  jobs: { title: 'Jobs', icon: Briefcase, accent: 'text-blue-600 bg-blue-50' },
  companies: { title: 'Companies', icon: Building2, accent: 'text-emerald-600 bg-emerald-50' },
  skills: { title: 'Skills', icon: Sparkles, accent: 'text-purple-600 bg-purple-50' },
  locations: { title: 'Locations', icon: MapPin, accent: 'text-orange-600 bg-orange-50' },
  recent: { title: 'Recent Searches', icon: History, accent: 'text-slate-600 bg-slate-100' },
  trending: { title: 'Trending Searches', icon: TrendingUp, accent: 'text-pink-600 bg-pink-50' },
};

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadRecentSearches(): RecentSearchEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        query: typeof entry.query === 'string' ? entry.query : '',
        location: typeof entry.location === 'string' ? entry.location : undefined,
        context: entry.context || 'navbar',
        timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
      }))
      .filter((entry) => entry.query || entry.location)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT);
  } catch (error) {
    console.warn('Failed to load recent searches', error);
    return [];
  }
}

function saveRecentSearch(entry: RecentSearchEntry) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadRecentSearches();
    const updated = [
      entry,
      ...existing.filter(
        (recent) =>
          recent.query.toLowerCase() !== entry.query.toLowerCase() ||
          (recent.location || '').toLowerCase() !== (entry.location || '').toLowerCase()
      ),
    ]
      .slice(0, MAX_RECENT)
      .sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to persist recent search entry', error);
  }
}

const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  placeholder = 'Search jobs, companies, skills…',
  context,
  allowLocation = context !== 'navbar',
  defaultQuery = '',
  defaultLocation = '',
  className = '',
  autoFocus = false,
  onSubmit,
  onDebouncedSearch,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const changeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState(() => defaultQuery);
  const [location, setLocation] = useState(() => defaultLocation);
  const [suggestions, setSuggestions] = useState<SuggestionResponseDto>(DEFAULT_SUGGESTIONS);
  const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>(() => loadRecentSearches());
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = query.trim();
  const normalizedLocation = location.trim();

  const commitSearch = useCallback(
    (payload: SearchSubmissionPayload) => {
      const hasQuery = payload.query.trim().length > 0;
      const hasLocation = payload.location?.trim().length ? true : false;
      if (!hasQuery && !hasLocation) {
        return;
      }

      const recentEntry: RecentSearchEntry = {
        query: payload.query.trim(),
        location: payload.location?.trim() || undefined,
        context: payload.context,
        timestamp: Date.now(),
      };
      saveRecentSearch(recentEntry);
      setRecentSearches(loadRecentSearches());

      if (onSubmit) {
        onSubmit(payload);
        return;
      }

      const params = new URLSearchParams();
      if (recentEntry.query) params.set('q', recentEntry.query);
      if (recentEntry.location) params.set('location', recentEntry.location);
      navigate(`/search?${params.toString()}`, { replace: context === 'navbar' });
    },
    [context, navigate, onSubmit]
  );

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  const fetchSuggestions = useCallback(
    async (term: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      try {
        const data = await suggestAPI.fetchSuggestions(term, controller.signal);
        setSuggestions(data);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
        console.error('Autocomplete suggestions request failed', err);
        setError('Unable to load suggestions. Keep typing to try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleDebouncedFetch = useCallback(
    (term: string) => {
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
      }
      fetchDebounceRef.current = setTimeout(() => {
        fetchSuggestions(term);
      }, INPUT_DEBOUNCE_MS);
    },
    [fetchSuggestions]
  );

  const handleDebouncedChange = useCallback(
    (nextQuery: string, nextLocation: string) => {
      if (!onDebouncedSearch) return;
      if (changeDebounceRef.current) {
        clearTimeout(changeDebounceRef.current);
      }
      changeDebounceRef.current = setTimeout(() => {
        onDebouncedSearch({
          query: nextQuery.trim(),
          location: nextLocation.trim() || undefined,
          category: undefined,
          suggestion: null,
          context,
        });
      }, INPUT_DEBOUNCE_MS);
    },
    [context, onDebouncedSearch]
  );

  useEffect(() => {
    // Initial fetch to load trending defaults
    fetchSuggestions('');
    return () => {
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      if (changeDebounceRef.current) clearTimeout(changeDebounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchSuggestions]);

  useEffect(() => {
    if (!normalizedQuery) {
      setActiveIndex(-1);
      return;
    }
    handleDebouncedFetch(normalizedQuery);
  }, [normalizedQuery, handleDebouncedFetch]);

  useEffect(() => {
    handleDebouncedChange(query, location);
  }, [query, location, handleDebouncedChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
      setActiveIndex(-1);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const trendingItems = useMemo(() => {
    if (!suggestions.meta?.trending || normalizedQuery) return [];
    const result: SuggestionItem[] = [];
    Object.entries(suggestions.meta.trending).forEach(([categoryKey, values]) => {
      const typedCategory = categoryKey as SuggestionCategory;
      if (!values) return;
      values.slice(0, 5).forEach((value, index) => {
        result.push({
          id: `trending:${typedCategory}:${index}:${value}`,
          label: value,
          value,
          category: 'trending',
          subtitle: categoryConfig[typedCategory].title,
        });
      });
    });
    return result;
  }, [suggestions.meta?.trending, normalizedQuery]);

  const sections: SuggestionSection[] = useMemo(() => {
    const buildItems = (category: SuggestionCategory, values: string[], formatter?: (value: string) => Partial<SuggestionItem>): SuggestionItem[] => {
      return values.slice(0, 8).map((value, index) => ({
        id: `${category}:${index}:${value}`,
        label: value,
        value,
        category,
        ...(formatter ? formatter(value) : {}),
      }));
    };

    const baseSections: SuggestionSection[] = [
      {
        id: 'jobs',
        title: categoryConfig.jobs.title,
        icon: categoryConfig.jobs.icon,
        items: buildItems('jobs', suggestions.jobs),
      },
      {
        id: 'companies',
        title: categoryConfig.companies.title,
        icon: categoryConfig.companies.icon,
        items: buildItems('companies', suggestions.companies),
      },
      {
        id: 'skills',
        title: categoryConfig.skills.title,
        icon: categoryConfig.skills.icon,
        items: buildItems('skills', suggestions.skills),
      },
      {
        id: 'locations',
        title: categoryConfig.locations.title,
        icon: categoryConfig.locations.icon,
        items: buildItems('locations', suggestions.locations),
      },
    ];

    const preferredLocations = [user?.city, user?.country].filter(Boolean).map((entry) => entry!.toLowerCase());
    baseSections.forEach((section) => {
      if (section.id === 'locations' && preferredLocations.length) {
        section.items.sort((a, b) => {
          const aPriority = preferredLocations.some((needle) => a.value.toLowerCase().includes(needle)) ? 1 : 0;
          const bPriority = preferredLocations.some((needle) => b.value.toLowerCase().includes(needle)) ? 1 : 0;
          return bPriority - aPriority;
        });
      }
      if (section.id === 'skills' && Array.isArray(user?.skills) && user.skills.length) {
        const skillSet = new Set(user.skills.map((skill) => skill.toLowerCase()));
        section.items.sort((a, b) => {
          const aPriority = skillSet.has(a.value.toLowerCase()) ? 1 : 0;
          const bPriority = skillSet.has(b.value.toLowerCase()) ? 1 : 0;
          return bPriority - aPriority;
        });
      }
    });

    const recentItems: SuggestionItem[] = recentSearches.map((entry, index) => ({
      id: `recent:${index}:${entry.query}:${entry.location}`,
      label: entry.query || entry.location || '',
      value: entry.query || '',
      category: 'recent',
      subtitle: entry.location ?? undefined,
    }));

    const derivedSections: SuggestionSection[] = [];

    if (recentItems.length) {
      derivedSections.push({
        id: 'recent',
        title: categoryConfig.recent.title,
        icon: categoryConfig.recent.icon,
        items: recentItems,
        helperText: 'Quickly revisit your latest job searches',
      });
    }

    if (trendingItems.length) {
      derivedSections.push({
        id: 'trending',
        title: categoryConfig.trending.title,
        icon: categoryConfig.trending.icon,
        items: trendingItems,
        helperText: 'Popular right now on MyCareerBuild',
      });
    }

    const availableBase = baseSections.filter((section) => section.items.length);
    return [...derivedSections, ...availableBase];
  }, [recentSearches, suggestions.jobs, suggestions.companies, suggestions.skills, suggestions.locations, trendingItems, user?.city, user?.country, user?.skills]);

  const flattenedItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item, index) => ({
          sectionId: section.id,
          item,
          index,
        }))
      ),
    [sections]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [sections.length]);

  const highlightMatch = useCallback(
    (text: string) => {
      if (!normalizedQuery) return <span>{text}</span>;
      const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig');
      const segments = text.split(regex);
      return (
        <span>
          {segments.map((segment, index) =>
            index % 2 === 1 ? (
              <span key={`${segment}-${index}`} className="text-blue-600 font-semibold">
                {segment}
              </span>
            ) : (
              <span key={`${segment}-${index}`}>{segment}</span>
            )
          )}
        </span>
      );
    },
    [normalizedQuery]
  );

  const handleSubmit = useCallback(() => {
    commitSearch({
      query: query.trim(),
      location: normalizedLocation || undefined,
      context,
      category: undefined,
      suggestion: null,
    });
    setIsOpen(false);
  }, [commitSearch, context, normalizedLocation, query]);

  const handleSuggestionSelect = useCallback(
    (item: SuggestionItem) => {
      const isLocationCategory = item.category === 'locations';
      const nextLocation = isLocationCategory ? item.value : normalizedLocation || undefined;

      if (isLocationCategory) {
        setLocation(item.value);
      }

      if (item.category === 'recent') {
        commitSearch({
          query: item.value || query.trim(),
          location: item.subtitle || normalizedLocation || undefined,
          context,
          category: item.category,
          suggestion: item,
        });
        setQuery(item.value || query);
        if (item.subtitle) setLocation(item.subtitle);
      } else if (item.category === 'trending') {
        commitSearch({
          query: item.value,
          location: nextLocation,
          context,
          category: item.category,
          suggestion: item,
        });
        setQuery(item.value);
      } else {
        setQuery(item.value);
        commitSearch({
          query: item.value,
          location: nextLocation,
          context,
          category: item.category,
          suggestion: item,
        });
      }
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [commitSearch, context, normalizedLocation, query]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!flattenedItems.length) {
        if (event.key === 'Enter') {
          handleSubmit();
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => {
          const next = prev + 1;
          return next >= flattenedItems.length ? 0 : next;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => {
          const next = prev - 1;
          if (next < 0) return flattenedItems.length - 1;
          return next;
        });
      } else if (event.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < flattenedItems.length) {
          event.preventDefault();
          handleSuggestionSelect(flattenedItems[activeIndex].item);
        } else {
          handleSubmit();
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    },
    [activeIndex, flattenedItems, handleSubmit, handleSuggestionSelect]
  );

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeItemId = flattenedItems[activeIndex]?.item.id;
    if (!activeItemId) return;
    const element = document.getElementById(`autocomplete-item-${activeItemId}`);
    if (element && listRef.current) {
      const { top: itemTop, bottom: itemBottom } = element.getBoundingClientRect();
      const { top: listTop, bottom: listBottom } = listRef.current.getBoundingClientRect();
      if (itemTop < listTop) {
        element.scrollIntoView({ block: 'nearest' });
      } else if (itemBottom > listBottom) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, flattenedItems]);

  const hasAnySuggestions = sections.some((section) => section.items.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:shadow-lg ${
          isOpen ? 'shadow-lg shadow-blue-500/10' : 'shadow-none'
        }`}
      >
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-none bg-transparent text-base text-slate-900 outline-none focus:outline-none focus-visible:outline-none placeholder:text-gray-400 focus:ring-0"
        />
        {allowLocation && (
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              className="w-32 border-none bg-transparent text-sm text-gray-700 outline-none focus:outline-none focus-visible:outline-none placeholder:text-gray-400 focus:ring-0"
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span className="text-white">Searching…</span>
          </>
          ) : (
          <>
            <Search className="h-4 w-4 text-white" />
            <span className="text-white">Search</span>
          </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-xs uppercase text-gray-500">
            <span>Smart suggestions</span>
            {suggestions.meta?.tookMs !== undefined && (
              <span className="font-medium text-blue-500">
                {suggestions.meta.cached ? 'Cached' : 'Live'} · {suggestions.meta.tookMs}ms
              </span>
            )}
          </div>
          <div ref={listRef} className="max-h-80 overflow-y-auto px-2 py-2">
            {isLoading && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Discovering roles that fit you…</span>
              </div>
            )}

            {!isLoading && !hasAnySuggestions && (
              <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                <p className="font-semibold text-gray-700">No results found</p>
                <p className="mt-1 text-xs">Try refining your keywords or explore trending searches below.</p>
              </div>
            )}

            {sections.map((section) => {
              if (!section.items.length) return null;
              const config = categoryConfig[section.id];
              const SectionIcon = section.icon;
              return (
                <div key={section.id} className="mb-3">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <config.icon className={`h-4 w-4 rounded-md p-0.5 ${config.accent}`} />
                      <span>{section.title}</span>
                    </div>
                    {section.helperText && <span className="text-xs text-gray-400">{section.helperText}</span>}
                  </div>
                  <ul className="flex flex-col gap-1">
                    {section.items.map((item) => {
      const itemIndex = flattenedItems.findIndex((flat) => flat.item.id === item.id);
                      const isActive = itemIndex === activeIndex;
      const description =
        section.id === 'recent'
          ? item.subtitle
          : section.id === 'locations'
          ? item.subtitle
          : item.subtitle;
                      return (
                        <li key={item.id}>
                          <button
                            id={`autocomplete-item-${item.id}`}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSuggestionSelect(item)}
                            className={`flex w-full items-start gap-3 rounded-xl px-4 py-2 text-left transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                                section.id === 'recent'
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-blue-50 text-blue-500'
                              }`}
                              aria-hidden
                            >
                              <SectionIcon className="h-4 w-4" />
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {highlightMatch(item.label)}
                              </p>
                              {(description || section.id === 'locations') && (
                                <p className="text-xs text-slate-500">
                                  {description ||
                                    (section.id === 'locations' ? 'Location match' : undefined)}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="border-t border-gray-100 bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
          {user && (
            <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
              Tailored suggestions for {user.name?.split(' ')[0] || 'you'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;

