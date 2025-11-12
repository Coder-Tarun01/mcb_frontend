import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Users, Briefcase, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './JobCallToAction.css';

interface JobCallToActionProps {
  variant?: 'hero' | 'section' | 'footer';
  title?: string;
  subtitle?: string;
  showStats?: boolean;
}

const JobCallToAction: React.FC<JobCallToActionProps> = ({
  variant = 'section',
  title = "Ready to start your career journey?",
  subtitle = "Find your dream job today and take the next step in your professional development.",
  showStats = true
}) => {
  const navigate = useNavigate();

  const handleBrowseJobs = () => {
    navigate('/jobs');
  };

  const stats = [
    { icon: <Briefcase className="stat-icon" />, value: "10,000+", label: "Active Jobs" },
    { icon: <Users className="stat-icon" />, value: "50,000+", label: "Job Seekers" },
    { icon: <Star className="stat-icon" />, value: "4.8", label: "Rating" }
  ];

  return (
    <motion.section
      className={`job-cta job-cta--${variant}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="job-cta-container">
        <div className="job-cta-content">
          <motion.div
            className="job-cta-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="job-cta-title">{title}</h2>
            <p className="job-cta-subtitle">{subtitle}</p>
          </motion.div>

          <motion.div
            className="job-cta-actions"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <button 
              className="job-cta-button job-cta-button--primary"
              onClick={handleBrowseJobs}
            >
              <Search className="button-icon" />
              <span>Browse All Jobs</span>
              <ArrowRight className="button-arrow" />
            </button>
            
            <button 
              className="job-cta-button job-cta-button--secondary"
              onClick={() => navigate('/jobs')}
            >
              <Briefcase className="button-icon" />
              <span>View Job Grid</span>
            </button>
          </motion.div>

          {showStats && (
            <motion.div
              className="job-cta-stats"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="job-cta-stat">
                  <div className="stat-icon-wrapper">
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Background Elements */}
        <div className="job-cta-background">
          <div className="job-cta-shape job-cta-shape--1"></div>
          <div className="job-cta-shape job-cta-shape--2"></div>
          <div className="job-cta-shape job-cta-shape--3"></div>
        </div>
      </div>
    </motion.section>
  );
};

export default JobCallToAction;
