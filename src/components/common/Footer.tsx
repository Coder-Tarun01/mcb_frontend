import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram 
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-white mt-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8 py-10 items-start">
          {/* Company Info */}
          <div className="bg-[#0f2236] border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)] w-full mx-auto lg:mx-0 justify-start gap-3 min-h-[260px]">
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="flex items-center justify-center relative px-2 py-2 bg-white rounded-lg border border-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.1)] w-fit">
                <img src="/logo.png" alt="MyCareerbuild JOBS" className="w-[160px] md:w-[180px] lg:w-[190px] h-auto max-w-full object-contain" />
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-sm"></div>
              </div>
              <p className="text-slate-100/90 leading-tight text-[11px] md:text-xs max-w-[220px] px-1">
                Connecting talent with opportunities. Find your dream job or hire the best.
              </p>
            </div>
            <div className="flex gap-2 justify-center items-center flex-nowrap mt-1.5">
              <a href="https://www.linkedin.com/company/tanasvi-technologies/posts/?feedView=all" className="flex items-center justify-center w-7 h-7 md:w-7 md:h-7 bg-slate-700/80 rounded-full text-white text-decoration-none transition-all duration-300 p-1 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 text-current" />
              </a>
              <a href="https://twitter.com" className="flex items-center justify-center w-7 h-7 md:w-7 md:h-7 bg-slate-700/80 rounded-full text-white text-decoration-none transition-all duration-300 p-1 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-4 h-4 text-current" />
              </a>
              <a href="https://www.facebook.com/p/Tanasvi-Technologies-100077635476112/" className="flex items-center justify-center w-7 h-7 md:w-7 md:h-7 bg-slate-700/80 rounded-full text-white text-decoration-none transition-all duration-300 p-1 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-4 h-4 text-current" />
              </a>
              <a href="https://www.instagram.com/tanasvitechnologies/#" className="flex items-center justify-center w-7 h-7 md:w-7 md:h-7 bg-slate-700/80 rounded-full text-white text-decoration-none transition-all duration-300 p-1 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4 text-current" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2 items-center text-center lg:items-start lg:text-left">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">
              Quick Links
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 w-full">
              <li><Link to="/jobs" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Browse Jobs</Link></li>
              <li><Link to="/jobs?type=remote" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Remote Jobs</Link></li>
              <li><Link to="/jobs?type=full-time" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Full-time Jobs</Link></li>
              <li><Link to="/jobs?type=part-time" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Part-time Jobs</Link></li>
              <li><Link to="/jobs?type=contract" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Contract Jobs</Link></li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="flex flex-col gap-2 items-center text-center lg:items-start lg:text-left">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">
              For Job Seekers
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 w-full">
              <li><Link to="/dashboard" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">My Dashboard</Link></li>
              <li><Link to="/dashboard/profile" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Profile</Link></li>
              <li><Link to="/dashboard/applied" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">My Applications</Link></li>
              <li><Link to="/dashboard/my-resume" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Resume Builder</Link></li>
              <li><Link to="/jobs?category=technology" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Tech Jobs</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="flex flex-col gap-2 items-center text-center lg:items-start lg:text-left">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">
              For Employers
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 w-full">
              <li><Link to="/employer/post-job" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Post a Job</Link></li>
              <li><Link to="/employer/candidates" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Browse Candidates</Link></li>
              <li><Link to="/employer/dashboard" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Employer Dashboard</Link></li>
              <li><Link to="/employer/jobs" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Manage Jobs</Link></li>
              <li><Link to="/employer/profile" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Company Profile</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-2 items-center text-center lg:items-start lg:text-left">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">
              Contact Us
            </h3>
            <div className="flex flex-col gap-2.5 w-full">
              <div className="flex items-center gap-3 text-white text-sm">
                <Mail className="w-4.5 h-4.5 text-blue-500 flex-shrink-0" />
                <span className="text-white">info@mycareerbuild.com</span>
              </div>
              <div className="flex items-start gap-3 text-white text-sm">
                <MapPin className="w-4.5 h-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-left text-white">
                  <span className="block font-semibold text-white">Address 1</span>
                  Plot No 77, Ground Floor, GCC Layout, Kommadi 100 Feet Rd, Gandhi Nagar, Madhurawada, 530048, Visakhapatnam, Andhra Pradesh, India
                </span>
              </div>
              <div className="flex items-start gap-3 text-white text-sm">
                <MapPin className="w-4.5 h-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-left text-white">
                  <span className="block font-semibold text-white">Address 2</span>
                  10057 Conquistador Ct, Frisco, TX 75035, USA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-600 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left">
            <p className="text-white text-sm m-0 text-center md:text-left">
              © {currentYear} MyCareerbuild JOBS. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center w-full md:w-auto">
              <Link to="/contact" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Privacy Policy</Link>
              <Link to="/contact" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Terms of Service</Link>
              <Link to="/contact" className="text-white text-decoration-none text-sm transition-colors duration-300 hover:text-blue-500">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

