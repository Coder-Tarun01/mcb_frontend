import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  Building2,
  Users,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Job } from '../../types/job';
import './JobListCard.css';

interface JobListCardProps {
  job: Job;
  onBookmark: (jobId: string) => void;
  onClick: (jobId: string) => void;
}

const JobListCard: React.FC<JobListCardProps> = ({ job, onBookmark, onClick }) => {
  const navigate = useNavigate();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(job.id);
  };

  const handleCardClick = () => {
    onClick(job.id);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/apply/${job.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      className="job-list-card"
      onClick={handleCardClick}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main Content */}
      <div className="card-main">
        {/* Company Logo and Info */}
        <div className="company-section">
          <div className="company-logo">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} />
            ) : (
              <Building2 className="logo-icon" />
            )}
          </div>
          
          <div className="job-info">
            <div className="job-header">
              <h3 className="job-title">{job.title}</h3>
              <button
                className={`bookmark-btn ${job.isBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmarkClick}
              >
                {job.isBookmarked ? (
                  <BookmarkCheck className="bookmark-icon" />
                ) : (
                  <Bookmark className="bookmark-icon" />
                )}
              </button>
            </div>
            
            <div className="company-details">
              <p className="company-name">{job.company}</p>
              <div className="job-rating">
                <Star className="star-icon" />
                <span className="rating-value">{job.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Meta Information */}
        <div className="job-meta">
          <div className="meta-row">
            <div className="meta-item">
              <MapPin className="meta-icon" />
              <span className="meta-text">
                {job.location || 'Location not specified'}
                {job.isRemote && <span className="remote-badge">Remote</span>}
              </span>
            </div>
            
            <div className="meta-item">
              <Briefcase className="meta-icon" />
              <span className="meta-text">{job.type || job.jobType || 'Full-time'}</span>
            </div>
            
            <div className="meta-item">
              <Clock className="meta-icon" />
              <span className="meta-text">{job.experienceLevel || 'Not specified'}</span>
            </div>
          </div>
          
          <div className="meta-row">
            {job.salary && (
              <div className="meta-item">
                <DollarSign className="meta-icon" />
                <span className="meta-text salary">
                  {typeof job.salary === 'string' ? job.salary : `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`}
                </span>
              </div>
            )}
            
            <div className="meta-item">
              <Users className="meta-icon" />
              <span className="meta-text">{job.applicantsCount || 0} applicants</span>
            </div>
            
            <div className="meta-item">
              <Calendar className="meta-icon" />
              <span className="meta-text">{job.postedDate ? formatDate(job.postedDate) : 'Recently posted'}</span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="job-description">
          <p>{job.description}</p>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="skills-section">
            <div className="skills-list">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="skill-more">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="card-actions">
        <button className="apply-btn" onClick={handleApplyClick}>
          <ExternalLink className="btn-icon" />
          Apply Now
        </button>
        
        <div className="job-stats">
          <div className="stat-item">
            <Users className="stat-icon" />
            <span className="stat-text">{job.applicantsCount}</span>
          </div>
          
          <div className="stat-item">
            <Star className="stat-icon" />
            <span className="stat-text">{job.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobListCard;
