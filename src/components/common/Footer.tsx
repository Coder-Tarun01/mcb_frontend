import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const quickLinks = [
    { label: 'Browse Jobs', to: '/jobs' },
    { label: 'Remote Jobs', to: '/jobs?type=remote' },
    { label: 'Full-time Jobs', to: '/jobs?type=full-time' },
    { label: 'Part-time Jobs', to: '/jobs?type=part-time' },
    { label: 'Contract Jobs', to: '/jobs?type=contract' },
  ];
  const jobSeekerLinks = [
    { label: 'My Dashboard', to: '/dashboard' },
    { label: 'Profile', to: '/dashboard/profile' },
    { label: 'My Applications', to: '/dashboard/applied' },
    { label: 'Resume Builder', to: '/dashboard/my-resume' },
    { label: 'Tech Jobs', to: '/jobs?category=technology' },
  ];
  const employerLinks = [
    { label: 'Post a Job', to: '/employer/post-job' },
    { label: 'Browse Candidates', to: '/employer/candidates' },
    { label: 'Employer Dashboard', to: '/employer/dashboard' },
    { label: 'Manage Jobs', to: '/employer/jobs' },
    { label: 'Company Profile', to: '/employer/profile' },
  ];
  const policyLinks = [
    { label: 'Privacy Policy', to: '/contact' },
    { label: 'Terms of Service', to: '/contact' },
    { label: 'Cookie Policy', to: '/contact' },
  ];

  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="bg-[#0f2236] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)] gap-4">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-center justify-center relative px-3 py-3 bg-white rounded-xl border border-white/70 shadow-[0_8px_20px_rgba(0,0,0,0.15)] w-fit">
                  <img
                    src="/logo.png"
                    alt="MyCareerbuild JOBS"
                    className="w-[170px] md:w-[190px] lg:w-[200px] h-auto object-contain"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-sm" />
                </div>
                <p className="text-slate-100/85 text-xs sm:text-sm leading-relaxed max-w-xs">
                  Connecting talent with opportunities. Discover top roles, manage your career, or hire the best candidates in minutes.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                {[
                  { Icon: Linkedin, href: 'https://www.linkedin.com/company/tanasvi-technologies/posts/?feedView=all', label: 'LinkedIn' },
                  { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                  { Icon: Facebook, href: 'https://www.facebook.com/p/Tanasvi-Technologies-100077635476112/', label: 'Facebook' },
                  { Icon: Instagram, href: 'https://www.instagram.com/tanasvitechnologies/#', label: 'Instagram' },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700/70 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex-1 rounded-2xl bg-slate-800/70 border border-slate-800 p-5 sm:p-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6">
                {[{ title: 'Quick Links', items: quickLinks }, { title: 'For Job Seekers', items: jobSeekerLinks }, { title: 'For Employers', items: employerLinks }].map(({ title, items }) => (
                  <div key={title} className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <ul className="space-y-2.5 text-sm text-slate-200">
                      {items.map(({ label, to }) => (
                        <li key={label}>
                          <Link
                            to={to}
                            className="text-decoration-none transition-colors duration-300 hover:text-blue-400"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:gap-6">
              <h3 className="text-lg font-semibold text-white text-center sm:text-left">
                Contact Us
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-100">
                <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-4 border border-slate-700/60">
                  <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Email
                    </p>
                    <a href="mailto:info@mycareerbuild.com" className="text-decoration-none text-white hover:text-blue-400">
                      info@mycareerbuild.com
                    </a>
                  </div>
                </div>
                {[
                  {
                    title: 'India Office',
                    address:
                      'Plot No 77, Ground Floor, GCC Layout, Kommadi 100 Feet Rd, Gandhi Nagar, Madhurawada, 530048, Visakhapatnam, Andhra Pradesh, India',
                  },
                  {
                    title: 'USA Office',
                    address: '10057 Conquistador Ct, Frisco, TX 75035, USA',
                  },
                ].map(({ title, address }) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl bg-slate-900/40 p-4 border border-slate-700/60">
                    <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                        {title}
                      </p>
                      <p className="text-slate-100 leading-relaxed text-sm">{address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/70 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-slate-300">
            <p className="text-center lg:text-left">
              © {currentYear} MyCareerbuild JOBS. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              {policyLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-decoration-none transition-colors duration-300 hover:text-blue-400"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

