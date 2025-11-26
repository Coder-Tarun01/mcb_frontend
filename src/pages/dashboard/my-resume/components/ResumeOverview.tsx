import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, TrendingUp, FileText, Briefcase, GraduationCap, Code, Award, Target, User } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface ResumeOverviewProps {
  onSectionClick: (sectionId: string) => void;
}

interface OverviewData {
  completionPercentage: number;
  totalSections: number;
  completedSections: number;
  sections: {
    personalDetails: boolean;
    headline: boolean;
    employment: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    accomplishments: boolean;
    careerProfile: boolean;
  };
}

const ResumeOverview: React.FC<ResumeOverviewProps> = ({ onSectionClick }) => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Lightweight previews for each section
  const [previews, setPreviews] = useState<{
    headline?: string;
    personalDetails?: { name?: string; email?: string; phone?: string; location?: string };
    employment?: Array<{ company?: string; position?: string; startDate?: string; endDate?: string; isCurrent?: boolean }>;
    education?: Array<{ institution?: string; degree?: string; field?: string; startDate?: string; endDate?: string }>;
    skills?: string[];
    projects?: Array<{ title?: string; role?: string }>;
    accomplishments?: Array<{ title?: string; type?: string }>;
    desiredCareer?: { jobType?: string; preferredLocation?: string };
  }>({});

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await resumeSectionsAPI.getOverview();
      setOverview(response.data.overview);
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Failed to load resume overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Fetch lightweight previews for each section (no heavy rendering)
  useEffect(() => {
    const fetchPreviews = async () => {
      try {
        // Simplified preview fetching to avoid circular dependencies
        const previewPromises = [
          resumeSectionsAPI.getHeadline().catch(() => null),
          resumeSectionsAPI.getPersonalDetails().catch(() => null),
          resumeSectionsAPI.getEmployment().catch(() => null),
          resumeSectionsAPI.getEducation().catch(() => null),
          resumeSectionsAPI.getSkills().catch(() => null),
          resumeSectionsAPI.getProjects().catch(() => null),
          resumeSectionsAPI.getAccomplishments().catch(() => null),
          resumeSectionsAPI.getDesiredCareer().catch(() => null)
        ];

        const results = await Promise.all(previewPromises);
        const next: any = {};

        // Process results safely
        if (results[0]?.data?.headline) {
          next.headline = results[0].data.headline;
        }
        if (results[1]?.data) {
          const p = results[1].data;
          next.personalDetails = {
            name: p.name,
            email: p.email,
            phone: p.phone,
            location: p.location
          };
        }
        if (results[2]?.data?.employment) {
          next.employment = results[2].data.employment.slice(0, 2);
        }
        if (results[3]?.data?.education) {
          next.education = results[3].data.education.slice(0, 2);
        }
        if (results[4]?.data?.skills) {
          const s = results[4].data.skills;
          next.skills = (Array.isArray(s) ? s.map((x: any) => x.name).filter(Boolean) : []).slice(0, 6);
        }
        if (results[5]?.data?.projects) {
          next.projects = results[5].data.projects.slice(0, 2).map((p: any) => ({ title: p.title, role: p.role }));
        }
        if (results[6]?.data?.accomplishments) {
          next.accomplishments = results[6].data.accomplishments.slice(0, 2).map((a: any) => ({ title: a.title, type: a.type }));
        }
        if (results[7]?.data) {
          const d = results[7].data;
          next.desiredCareer = { jobType: d.jobType, preferredLocation: d.preferredLocation };
        }

        setPreviews(next);
      } catch (e) {
        // Non-blocking; previews are best-effort
        console.log('Preview fetch failed:', e);
      }
    };
    
    // Add a small delay to avoid race conditions
    const timeoutId = setTimeout(fetchPreviews, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const sections = [
    { id: 'personal-details', name: 'Personal Details', icon: User, completed: overview?.sections.personalDetails },
    { id: 'headline', name: 'Resume Headline', icon: FileText, completed: overview?.sections.headline },
    { id: 'employment', name: 'Employment', icon: Briefcase, completed: overview?.sections.employment },
    { id: 'education', name: 'Education', icon: GraduationCap, completed: overview?.sections.education },
    { id: 'skills', name: 'Skills', icon: Code, completed: overview?.sections.skills },
    { id: 'projects', name: 'Projects', icon: Code, completed: overview?.sections.projects },
    { id: 'accomplishments', name: 'Accomplishments', icon: Award, completed: overview?.sections.accomplishments },
    { id: 'desired-career', name: 'Desired Career', icon: Target, completed: overview?.sections.careerProfile },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 sm:w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchOverview}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center sm:text-left">Resume Overview</h2>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Completion</span>
            <span className="text-sm font-medium text-gray-700">
              {overview?.completedSections || 0}/{overview?.totalSections || 9}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overview?.completionPercentage || 0}%` }}
            ></div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm text-gray-600">
              {overview?.completionPercentage || 0}% Complete
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center sm:text-left">Sections</h3>
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className="w-full text-left p-4 sm:p-5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{section.name}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-end sm:justify-between">
                    <span className="hidden sm:inline text-sm font-medium text-gray-900">{section.name}</span>
                    {section.completed ? (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  {/* Lightweight preview content */}
                  {section.id === 'headline' && previews.headline && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{previews.headline}</p>
                  )}
                  {section.id === 'personal-details' && previews.personalDetails && (
                    <p className="text-sm text-gray-600 mt-1">
                      {[previews.personalDetails.name, previews.personalDetails.email, previews.personalDetails.phone, previews.personalDetails.location]
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(' • ')
                      }
                    </p>
                  )}
                  {section.id === 'employment' && previews.employment && previews.employment.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {previews.employment.map((e, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {e.position || 'Role'} at {e.company || 'Company'}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.id === 'education' && previews.education && previews.education.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {previews.education.map((e, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {e.degree || 'Degree'} {e.field ? `in ${e.field}` : ''} at {e.institution || 'Institution'}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.id === 'skills' && previews.skills && previews.skills.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {previews.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {section.id === 'projects' && previews.projects && previews.projects.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {previews.projects.map((p, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {p.title} {p.role ? `• ${p.role}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.id === 'accomplishments' && previews.accomplishments && previews.accomplishments.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {previews.accomplishments.map((a, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {a.title} {a.type ? `• ${a.type}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.id === 'desired-career' && previews.desiredCareer && (
                    <p className="text-sm text-gray-600 mt-1">
                      {previews.desiredCareer.jobType || 'Role'} {previews.desiredCareer.preferredLocation ? `• ${previews.desiredCareer.preferredLocation}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 sm:p-5 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Complete all sections for a strong resume</li>
          <li>• Use specific examples and achievements</li>
          <li>• Keep descriptions concise and impactful</li>
          <li>• Update regularly with new experiences</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeOverview;
