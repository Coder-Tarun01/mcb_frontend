import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Building2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { JobFilter as JobFilterType } from '../../types/job';

interface JobFilterProps {
  filters: JobFilterType;
  onFiltersChange: (filters: JobFilterType) => void;
  onClearFilters: () => void;
  className?: string;
}

const JobFilter: React.FC<JobFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['0-1', '1-3', '3-5', '5-10', '10+'];
  const salaryRanges = [
    { label: '0-3L', min: 0, max: 300000 },
    { label: '3-6L', min: 300000, max: 600000 },
    { label: '6-10L', min: 600000, max: 1000000 },
    { label: '10L+', min: 1000000, max: 999999999 }
  ];

  const handleFilterChange = (key: keyof JobFilterType, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden shadow-sm shadow-black/5 ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex justify-between items-center py-4 px-5 bg-slate-50 border-b border-gray-200">
        <button
          className="flex items-center gap-2 bg-none border-none text-gray-700 font-semibold text-base cursor-pointer py-2 px-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="w-5 h-5 text-blue-600" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white py-0.5 px-2 rounded-xl text-xs font-semibold min-w-5 text-center">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {hasActiveFilters && (
          <button
            className="flex items-center gap-1.5 bg-red-600 text-white border-none py-2 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out hover:bg-red-700 hover:-translate-y-px"
            onClick={onClearFilters}
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-t border-gray-200"
          >
            <div className="py-6 px-6 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 md:grid-cols-1 md:gap-5 md:py-5 md:px-5 sm:py-4 sm:px-4">
              {/* Location Filter */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city or state"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="py-2.5 px-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 ease-in-out outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
                />
              </div>

              {/* Salary Range Filter */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Salary Range
                </label>
                <div className="flex items-center gap-3 md:flex-col md:items-stretch">
                  <input
                    type="number"
                    placeholder="Min (LPA)"
                    value={filters.salaryMin ? filters.salaryMin / 100000 : ''}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseFloat(e.target.value) * 100000 : '')}
                    className="py-2.5 px-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 ease-in-out outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
                  />
                  <span className="text-gray-500 font-medium text-sm md:text-center">to</span>
                  <input
                    type="number"
                    placeholder="Max (LPA)"
                    value={filters.salaryMax ? filters.salaryMax / 100000 : ''}
                    onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseFloat(e.target.value) * 100000 : '')}
                    className="py-2.5 px-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 ease-in-out outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
                  />
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-1.5">
                  {salaryRanges.map((range) => (
                    <button
                      key={range.label}
                      className={`py-1.5 px-3 border-2 bg-white text-gray-700 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ease-in-out hover:border-blue-600 hover:text-blue-600 ${
                        filters.salaryMin === range.min && filters.salaryMax === range.max ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200'
                      } sm:py-1 sm:px-3 sm:text-xs`}
                      onClick={() => {
                        handleFilterChange('salaryMin', range.min);
                        handleFilterChange('salaryMax', range.max);
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Experience
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-1.5">
                  {experienceLevels.map((level) => (
                    <button
                      key={level}
                      className={`py-2 px-4 border-2 bg-white text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out hover:border-blue-600 hover:text-blue-600 ${
                        filters.experience === level ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200'
                      } sm:py-1.5 sm:px-3 sm:text-xs`}
                      onClick={() => handleFilterChange('experience', level)}
                    >
                      {level} years
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type Filter */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Job Type
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-1.5">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      className={`py-2 px-4 border-2 bg-white text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out hover:border-blue-600 hover:text-blue-600 ${
                        filters.jobType === type ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200'
                      } sm:py-1.5 sm:px-3 sm:text-xs`}
                      onClick={() => handleFilterChange('jobType', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Filter */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={filters.company || ''}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  className="py-2.5 px-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 ease-in-out outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobFilter;
