import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Globe,
  DollarSign,
  Clock,
  GraduationCap
} from 'lucide-react';
import { Job } from '../../types/job';
import { jobsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { buildCompanySlug, buildJobSlug } from '../../utils/slug';

interface JobCardProps {
  job: Job;
  index: number;
}

const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Handle card click - always navigate to job details page
  const handleCardClick = () => {
    const slug = (job as any).slug || buildJobSlug({
      title: job.title,
      company: job.company,
      location: job.location || null,
      id: job.id
    });
    navigate(`/jobs/${slug}`);
  };

  // Handle Apply button click - navigate to details (apply logic handled there)
  const handleApplyButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    const slug = (job as any).slug || buildJobSlug({
      title: job.title,
      company: job.company,
      location: job.location || null,
      id: job.id
    });
    // Navigate to job details - the Apply button there will handle login check
    navigate(`/jobs/${slug}`);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-2xl p-0 backdrop-blur-[10px] border border-white/20 relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-auto md:h-[320px] transform-gpu"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onClick={handleCardClick}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-none rounded-r-sm"></div>
      <div className="p-5 flex-grow flex flex-col justify-between h-full relative z-20">
        <div className="flex justify-between items-start mb-2 flex-shrink-0 gap-2">
          <h3 className="text-base font-bold text-slate-800 m-0 leading-tight line-clamp-2 overflow-hidden flex-1 min-w-0 tracking-[-0.01em]">
            {job.title}
          </h3>
          <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-2xl text-[11px] font-semibold uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(59,130,246,0.25)] border-none transition-all duration-300 flex-shrink-0 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            {job.isRemote ? (
              <>
                <Globe className="w-[14px] h-[14px] text-white" />
                <span className="text-white font-semibold">Remote</span>
              </>
            ) : (
              <>
                <Briefcase className="w-[14px] h-[14px] text-white" />
                <span className="text-white font-semibold">{job.type || 'Specialized'}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden mb-3">
          <p className="text-sm text-slate-500 m-0 font-medium leading-snug">
            {job.companyId ? (
              <span
                role="link"
                onClick={(e) => { e.stopPropagation(); navigate(`/companies/${buildCompanySlug(job.company, job.companyId!)}`); }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {job.company}
              </span>
            ) : (
              job.company
            )}
          </p>
          
          <div className="flex flex-col gap-1.5 mt-1.5 flex-shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
              <span>{job.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <Briefcase className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
              <span>
                {(() => {
                  // Handle the experience data structure we're receiving
                  if (job.experienceLevel) {
                    return job.experienceLevel;
                  }
                  if (typeof job.experience === 'string') {
                    return job.experience;
                  }
                  if (job.experience && job.experience.min && job.experience.max) {
                    return `${job.experience.min}-${job.experience.max} years`;
                  }
                  return 'Experience not specified';
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <DollarSign className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
              <span>
                {(() => {
                  if (!job.salary) return 'Salary not specified';
                  if (typeof job.salary === 'string') return job.salary;
                  
                  const currency = job.salary.currency === 'INR' ? '₹' : '$';
                  
                  if (job.salary.min && job.salary.max) {
                    if (job.salary.currency === 'INR') {
                      // Format Indian salaries in Lakhs
                      const minLakhs = (job.salary.min / 100000).toFixed(1);
                      const maxLakhs = (job.salary.max / 100000).toFixed(1);
                      return `${currency}${minLakhs}L - ${currency}${maxLakhs}L`;
                    } else {
                      // Format USD salaries in thousands
                      const minK = (job.salary.min / 1000).toFixed(0);
                      const maxK = (job.salary.max / 1000).toFixed(0);
                      return `${currency}${minK}K - ${currency}${maxK}K`;
                    }
                  }
                  
                  if (job.salary.min) {
                    if (job.salary.currency === 'INR') {
                      const minLakhs = (job.salary.min / 100000).toFixed(1);
                      return `${currency}${minLakhs}L+`;
                    } else {
                      const minK = (job.salary.min / 1000).toFixed(0);
                      return `${currency}${minK}K+`;
                    }
                  }
                  
                  return 'Salary not specified';
                })()}
              </span>
            </div>
            {job.postedDate && (
              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                <Clock className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                <span>{new Date(job.postedDate).toLocaleDateString()}</span>
              </div>
            )}
            {job.skills && job.skills.length > 0 && (
              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                <GraduationCap className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-0 p-0 flex-shrink-0">
          <button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 w-full h-8 flex items-center justify-center text-center whitespace-nowrap leading-none box-border text-decoration-none outline-none relative tracking-[0.3px] uppercase hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
            onClick={handleApplyButtonClick}
          >
            Apply Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;