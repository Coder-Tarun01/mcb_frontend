import React, { useState } from 'react';
import { usersAPI } from '../../services/api';

interface CompanySetupProps {
  currentUser: any;
  onCompanySet: (user: any) => void;
}

const CompanySetup: React.FC<CompanySetupProps> = ({ currentUser, onCompanySet }) => {
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await usersAPI.updateProfile({
        companyName: companyName.trim()
      });
      
      setSuccess('Company name updated successfully!');
      onCompanySet(updatedUser);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to update company name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5 sm:p-2.5">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 py-10 px-10 max-w-[500px] w-full sm:py-7.5 sm:px-5">
        <div className="text-center mb-7.5">
          <h2 className="text-gray-800 mb-2.5 text-3xl sm:text-2xl font-bold">🏢 Company Setup Required</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            To access employer features, you need to set your company name.
          </p>
        </div>

        <div className="mb-7.5">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="companyName" className="block mb-2 text-gray-700 font-semibold text-sm">
                Company Name *
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                required
                disabled={isLoading}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 ease-in-out box-border focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 py-3 px-4 rounded-lg mb-5 flex items-center gap-2">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 py-3 px-4 rounded-lg mb-5 flex items-center gap-2">
                <span className="text-base">✅</span>
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-3.5 px-5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 ease-in-out hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-xl hover:not-disabled:shadow-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              disabled={isLoading || !companyName.trim()}
            >
              {isLoading ? 'Updating...' : 'Set Company Name'}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg py-5 px-5">
          <h4 className="text-gray-800 mb-3 text-base font-semibold">
            Why is this required?
          </h4>
          <ul className="m-0 pl-5">
            <li className="text-gray-600 text-sm leading-relaxed mb-1.5 last:mb-0">
              Employer features need to identify which company you represent
            </li>
            <li className="text-gray-600 text-sm leading-relaxed mb-1.5 last:mb-0">
              Job postings and applications are organized by company
            </li>
            <li className="text-gray-600 text-sm leading-relaxed mb-1.5 last:mb-0">
              This helps maintain data integrity and security
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
