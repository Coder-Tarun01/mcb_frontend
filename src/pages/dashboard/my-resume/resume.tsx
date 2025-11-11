import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  FolderOpen, 
  User, 
  Award, 
  Target, 
  Upload,
  UserCircle,
  ArrowLeft,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResumeOverview from './components/ResumeOverview';
import ResumeHeadline from './components/ResumeHeadline';
import Skills from './components/Skills';
import Employment from './components/Employment';
import Education from './components/Education';
import Projects from './components/Projects';
import ProfileSummary from './components/ProfileSummary';
import Accomplishments from './components/Accomplishments';
import DesiredCareerProfile from './components/DesiredCareerProfile';
import PersonalDetails from './components/PersonalDetails';
import ResumeOptionsModal from './components/ResumeOptionsModal';

interface ResumeSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const Resume: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(true);
  const [isResumeFilled, setIsResumeFilled] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const sections: ResumeSection[] = [
    { id: 'overview', label: 'Resume Overview', icon: BarChart3, component: ResumeOverview },
    { id: 'resume-headline', label: 'Resume Headline', icon: FileText, component: ResumeHeadline },
    { id: 'skills', label: 'Skills', icon: Code, component: Skills },
    { id: 'employment', label: 'Employment', icon: Briefcase, component: Employment },
    { id: 'education', label: 'Education', icon: GraduationCap, component: Education },
    { id: 'projects', label: 'Projects', icon: FolderOpen, component: Projects },
    { id: 'profile-summary', label: 'Profile Summary', icon: User, component: ProfileSummary },
    { id: 'accomplishments', label: 'Accomplishments', icon: Award, component: Accomplishments },
    { id: 'desired-career', label: 'Desired Career Profile', icon: Target, component: DesiredCareerProfile },
    { id: 'personal-details', label: 'Personal Details', icon: UserCircle, component: PersonalDetails }
  ];

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle section click from overview
  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle scroll spy to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleFillManual = () => {
    setShowOptionsModal(false);
    setIsResumeFilled(true);
  };

  const handleUploadResume = async (file: File) => {
    try {
      // For now, just simulate the upload process
      // TODO: Implement actual resume parsing service
      console.log('Uploading file:', file.name);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowOptionsModal(false);
      setIsResumeFilled(true);
      
      // Show success message
      alert('Resume uploaded successfully! (Note: Auto-filling is not yet implemented)');
      
    } catch (error) {
      console.error('Error processing resume:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleCloseModal = () => {
    setShowOptionsModal(false);
    setIsResumeFilled(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Resume Options Modal */}
      <ResumeOptionsModal
        isOpen={showOptionsModal}
        onClose={handleCloseModal}
        onFillManual={handleFillManual}
        onUploadResume={handleUploadResume}
      />

      {/* Resume Content - Only show if modal is closed */}
      {!showOptionsModal && isResumeFilled && (
        <div className="flex">
        {/* Sticky Sidebar */}
        <div className="w-80 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
          <div className="p-6">
            {/* Back Button */}
            <motion.button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </motion.button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">My Resume</h1>
              </div>
              <p className="text-sm text-gray-600">Build your professional profile</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{section.label}</span>
                    {isActive && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Progress Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-blue-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Complete all sections for better visibility</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {selectedSection ? (
              // Show only selected section
              sections
                .filter(section => section.id === selectedSection)
                .map((section, index) => {
                  const Component = section.component;
                  
                  return (
                    <motion.div
                      key={section.id}
                      ref={(el) => { sectionRefs.current[section.id] = el; }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                      {section.id === 'overview' ? (
                        <Component onSectionClick={handleSectionClick} />
                      ) : (
                        <Component />
                      )}
                    </motion.div>
                  );
                })
            ) : (
              // Show all sections
              sections.map((section, index) => {
                const Component = section.component;
                
                return (
                  <motion.div
                    key={section.id}
                    ref={(el) => { sectionRefs.current[section.id] = el; }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200"
                  >
                    {section.id === 'overview' ? (
                      <Component onSectionClick={handleSectionClick} />
                    ) : (
                      <Component />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Resume;