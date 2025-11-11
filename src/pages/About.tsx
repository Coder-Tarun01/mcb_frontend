import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-10 md:py-5">
      <div className="max-w-6xl mx-auto px-5 md:px-4">
        <div className="text-center mb-15 md:mb-12">
          <h1 className="text-5xl md:text-4xl sm:text-3xl font-extrabold text-gray-800 mb-5 md:mb-4 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            About MyCareerbuild JOBS
          </h1>
          <p className="text-xl md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Connecting talented professionals with amazing career opportunities
          </p>
        </div>

        <div className="flex flex-col gap-15 md:gap-12">
          <div className="bg-white rounded-2xl p-10 md:p-6 sm:p-5 shadow-sm border border-gray-200">
            <h2 className="text-3xl md:text-2xl sm:text-xl font-bold text-gray-800 mb-6 md:mb-5 text-center">
              Our Mission
            </h2>
            <p className="text-lg md:text-base text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              At MyCareerbuild JOBS, we believe that every professional deserves access to 
              meaningful career opportunities. Our platform bridges the gap between talented 
              individuals and forward-thinking companies, creating connections that drive 
              success for both parties.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-10 md:p-6 sm:p-5 shadow-sm border border-gray-200">
            <h2 className="text-3xl md:text-2xl sm:text-xl font-bold text-gray-800 mb-6 md:mb-5 text-center">
              What We Offer
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 md:gap-4 mt-8 md:mt-6">
              <div className="bg-slate-50 rounded-xl p-6 md:p-5 text-center transition-all duration-300 ease-in-out border border-slate-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 hover:border-blue-500">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Job Search
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Find your dream job from thousands of opportunities across various industries.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 md:p-5 text-center transition-all duration-300 ease-in-out border border-slate-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 hover:border-blue-500">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Company Profiles
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Discover company culture, benefits, and growth opportunities before applying.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 md:p-5 text-center transition-all duration-300 ease-in-out border border-slate-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 hover:border-blue-500">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Career Resources
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Access expert advice, resume tips, and interview preparation materials.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 md:p-5 text-center transition-all duration-300 ease-in-out border border-slate-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 hover:border-blue-500">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Professional Network
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Connect with industry professionals and expand your professional network.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 md:p-6 sm:p-5 shadow-sm border border-gray-200">
            <h2 className="text-3xl md:text-2xl sm:text-xl font-bold text-gray-800 mb-6 md:mb-5 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 md:gap-5 mt-8 md:mt-6">
              <div className="text-center p-6 md:p-5 bg-slate-50 rounded-xl border border-slate-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Transparency
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  We believe in honest communication and clear expectations.
                </p>
              </div>
              <div className="text-center p-6 md:p-5 bg-slate-50 rounded-xl border border-slate-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Innovation
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  We continuously improve our platform to serve you better.
                </p>
              </div>
              <div className="text-center p-6 md:p-5 bg-slate-50 rounded-xl border border-slate-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10">
                <h3 className="text-xl md:text-lg font-semibold text-gray-800 mb-3 md:mb-2">
                  Excellence
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  We strive for the highest quality in everything we do.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 md:p-6 sm:p-5 shadow-sm border border-gray-200">
            <h2 className="text-3xl md:text-2xl sm:text-xl font-bold text-gray-800 mb-6 md:mb-5 text-center">
              Get Started
            </h2>
            <p className="text-lg md:text-base text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              Ready to take the next step in your career? Join thousands of professionals 
              who have found their perfect match through MyCareerbuild JOBS.
            </p>
            <div className="flex gap-4 md:gap-3 justify-center mt-8 md:mt-6 flex-wrap md:flex-col md:items-center">
              <a 
                href="/signup" 
                className="inline-flex items-center justify-center px-6 py-3 md:py-3 rounded-lg font-semibold text-white no-underline transition-all duration-300 ease-in-out min-w-[160px] bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
              >
                Create Account
              </a>
              <a 
                href="/jobs" 
                className="inline-flex items-center justify-center px-6 py-3 md:py-3 rounded-lg font-semibold text-blue-500 no-underline transition-all duration-300 ease-in-out min-w-[160px] bg-white border-2 border-blue-500 hover:bg-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 md:w-full md:max-w-xs"
              >
                Browse Jobs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
