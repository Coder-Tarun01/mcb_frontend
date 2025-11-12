import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText,
  Award,
  Star,
  Eye,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EmployerLayout from '../../components/employer/EmployerLayout';

const CompanyOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!user || !isEmployer()) {
      navigate('/login');
      return;
    }
  }, [user, navigate, isEmployer]);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handlePreview = () => {
    // Open preview modal or navigate to preview page
    console.log('Preview company profile');
  };

  return (
    <EmployerLayout>
      <div className="flex justify-center p-1.5 min-h-full bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8 max-w-full w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center mb-6 gap-5 relative">
          <button 
            onClick={() => navigate('/employer/dashboard')}
            className="absolute left-0 top-0 flex items-center gap-2 bg-none border-none text-gray-600 text-sm font-medium cursor-pointer transition-all duration-300 z-10 hover:text-blue-600 hover:-translate-x-1"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex-1 text-center w-full flex justify-center items-center">
            <h1 className="text-4xl font-bold text-gray-800 m-0 leading-tight tracking-tight">Company Overview</h1>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-8">
          {/* Company Story Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-700 mt-0 mb-5 pb-4 border-b border-gray-200">
              <FileText className="w-5.5 h-5.5 text-blue-500" />
              Company Story
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">Company Story</label>
              <textarea 
                className="py-3.5 px-4 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white transition-all duration-300 font-inherit resize-y min-h-[200px] leading-relaxed focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" 
                rows={8}
                placeholder="Share your company's journey, mission, and what makes you unique. Tell potential candidates about your history, achievements, and vision for the future..."
              />
              <div className="flex justify-end pt-2">
                <span className="text-xs text-gray-400 font-medium">0 / 1000 characters</span>
              </div>
            </div>
          </div>

          {/* Culture & Values Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-700 mt-0 mb-5 pb-4 border-b border-gray-200">
              <Award className="w-5.5 h-5.5 text-blue-500" />
              Culture & Values
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">Culture & Values</label>
              <textarea 
                className="py-3.5 px-4 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white transition-all duration-300 font-inherit resize-y min-h-[150px] leading-relaxed focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" 
                rows={6}
                placeholder="Describe your company culture, values, and work environment. What makes your workplace special? How do you support employee growth and well-being?"
              />
              <div className="flex justify-end pt-2">
                <span className="text-xs text-gray-400 font-medium">0 / 800 characters</span>
              </div>
            </div>
          </div>

          {/* Benefits & Perks Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-700 mt-0 mb-5 pb-4 border-b border-gray-200">
              <Star className="w-5.5 h-5.5 text-blue-500" />
              Benefits & Perks
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300">
                <h3 className="text-base font-semibold text-gray-800 m-0 mb-5 pb-3 border-b border-gray-100">Health & Wellness</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Health Insurance</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Dental Coverage</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Vision Coverage</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Mental Health Support</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Gym Membership</span>
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300">
                <h3 className="text-base font-semibold text-gray-800 m-0 mb-5 pb-3 border-b border-gray-100">Work-Life Balance</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Remote Work</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Flexible Hours</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Unlimited PTO</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Paid Time Off</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Sabbatical Leave</span>
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300">
                <h3 className="text-base font-semibold text-gray-800 m-0 mb-5 pb-3 border-b border-gray-100">Financial</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>401(k) Matching</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Stock Options</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Bonus Programs</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Commuter Benefits</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Life Insurance</span>
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300">
                <h3 className="text-base font-semibold text-gray-800 m-0 mb-5 pb-3 border-b border-gray-100">Growth & Development</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Professional Development</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Conference Attendance</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Training Programs</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Mentorship Programs</span>
                  </label>
                  <label className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-100 hover:-translate-y-0.5 has-[input:checked]:bg-blue-50 has-[input:checked]:border-blue-500 has-[input:checked]:text-blue-800">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500 cursor-pointer" />
                    <span>Tuition Reimbursement</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-5 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employer/dashboard')}
              className="flex items-center gap-2.5 py-3.5 px-7 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 min-w-[160px] justify-center bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-2.5 py-3.5 px-7 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 min-w-[160px] justify-center bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:text-gray-800 hover:-translate-y-0.5"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Profile</span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2.5 py-3.5 px-7 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 min-w-[160px] justify-center bg-blue-500 !text-white border-none shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 !text-white" />
                  <span className="!text-white">Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default CompanyOverview;
