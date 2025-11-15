import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy load components for better performance
const Home = React.lazy(() => import('../pages/Home'));
const About = React.lazy(() => import('../pages/About'));
const Contact = React.lazy(() => import('../pages/Contact'));
const Blogs = React.lazy(() => import('../pages/Blogs'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const Signup = React.lazy(() => import('../pages/auth/Signup'));
const Jobs = React.lazy(() => import('../pages/Jobs'));
const JobDetails = React.lazy(() => import('../pages/JobDetails'));
const Apply = React.lazy(() => import('../pages/Apply'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// New Job Section Pages
const SearchResults = React.lazy(() => import('../pages/jobs/SearchResults'));
const JobCategories = React.lazy(() => import('../pages/jobs/JobCategories'));
const FreeJobAlerts = React.lazy(() => import('../pages/jobs/FreeJobAlerts'));

// Employee Dashboard Components
const DashboardLayout = React.lazy(() => import('../pages/dashboard/DashboardLayout'));
const Profile = React.lazy(() => import('../pages/dashboard/Profile'));
const EmployeeAnalytics = React.lazy(() => import('../pages/dashboard/Analytics'));
const EmployeeResume = React.lazy(() => import('../pages/dashboard/my-resume'));
const SavedJobs = React.lazy(() => import('../pages/dashboard/SavedJobs'));
const AppliedJobs = React.lazy(() => import('../pages/dashboard/AppliedJobs'));
const ApplicationDetails = React.lazy(() => import('../pages/dashboard/ApplicationDetails'));
const RecommendedJobs = React.lazy(() => import('../pages/dashboard/RecommendedJobs'));
const SkillsManagement = React.lazy(() => import('../pages/dashboard/SkillsManagement'));
const JobAlerts = React.lazy(() => import('../pages/dashboard/JobAlerts'));
const CVManager = React.lazy(() => import('../pages/dashboard/CVManager'));

// Employer Dashboard Components
const EmployerDashboard = React.lazy(() => import('../pages/Employer Access/EmployerDashboard'));
const EmployerAnalytics = React.lazy(() => import('../pages/Employer Access/EmployerAnalytics'));
const PostJob = React.lazy(() => import('../pages/Employer Access/PostJob'));
const CompanyProfile = React.lazy(() => import('../pages/Employer Access/CompanyProfile'));
const Company = React.lazy(() => import('../pages/Company'));
const ManageJobs = React.lazy(() => import('../pages/Employer Access/ManageJobs'));
const EditJob = React.lazy(() => import('../pages/Employer Access/EditJob'));
const JobApplications = React.lazy(() => import('../pages/Employer Access/JobApplications'));
const Transactions = React.lazy(() => import('../pages/Employer Access/Transactions'));
const BrowseCandidates = React.lazy(() => import('../pages/Employer Access/BrowseCandidates'));
const CandidateProfile = React.lazy(() => import('../pages/Employer Access/CandidateProfile'));

// Registration Components
const CompanyRegister = React.lazy(() => import('../pages/CompanyRegister'));
const NotificationDashboard = React.lazy(() => import('../pages/NotificationDashboard'));


// Loading component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Job Routes */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:slug" element={<JobDetails />} />
        <Route path="/jobs/browse" element={<Jobs />} />
        <Route path="/jobs/browse/list" element={<Jobs />} />
        <Route path="/jobs/browse/grid" element={<Jobs />} />
        <Route path="/jobs/browse/filter-list" element={<Jobs />} />
        <Route path="/jobs/browse/filter-grid" element={<Jobs />} />
        <Route path="/jobs/company" element={<Jobs />} />
        <Route path="/jobs/designations" element={<Jobs />} />
        <Route path="/jobs/category" element={<Jobs />} />
        <Route path="/jobs/location" element={<Jobs />} />
        <Route path="/jobs/skills" element={<Jobs />} />
        <Route path="/apply/:slug" element={<Apply />} />
        
        {/* New Job Section Routes */}
        <Route path="/search" element={<SearchResults />} />
        <Route path="/job-categories" element={<JobCategories />} />
        <Route path="/free-job-alerts" element={<FreeJobAlerts />} />
        {/* Public Company Route */}
        <Route path="/companies/:slug" element={<Company />} />

        {/* Employee Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="employee">
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<EmployeeAnalytics />} />
          <Route path="recommended" element={<RecommendedJobs />} />
          <Route path="skills" element={<SkillsManagement />} />
          <Route path="my-resume" element={<EmployeeResume />} />
          <Route path="saved" element={<SavedJobs />} />
          <Route path="applied" element={<AppliedJobs />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
          <Route path="alerts" element={<JobAlerts />} />
          <Route path="cv-manager" element={<CVManager />} />
        </Route>

        {/* Employer Dashboard Routes */}
        <Route 
          path="/employer/dashboard" 
          element={
            <ProtectedRoute requiredRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employer/analytics" 
          element={
            <ProtectedRoute requiredRole="employer">
              <EmployerAnalytics />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employer/post-job" 
          element={
            <ProtectedRoute requiredRole="employer">
              <PostJob />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employer/profile" 
          element={
            <ProtectedRoute requiredRole="employer">
              <CompanyProfile />
            </ProtectedRoute>
          } 
        /> 
        
        <Route
          path="/employer/jobs" 
          element={
            <ProtectedRoute requiredRole="employer">
              <ManageJobs />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employer/edit-job/:id" 
          element={
            <ProtectedRoute requiredRole="employer">
              <EditJob />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employer/jobs/:jobId/applications" 
          element={
            <ProtectedRoute requiredRole="employer">
              <JobApplications />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/employer/transactions"
          element={
            <ProtectedRoute requiredRole="employer">
              <Transactions />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employer/candidates"
          element={
            <ProtectedRoute requiredRole="employer">
              <BrowseCandidates />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employer/candidate-profile/:id"
          element={
            <ProtectedRoute requiredRole="employer">
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/admin/notifications" 
          element={<NotificationDashboard />}
        />

        {/* Registration Routes */}
        <Route path="/employer/company-register" element={<CompanyRegister />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
