// Route Constants for the entire application
export const ROUTES = {
  // Public Routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Job Routes
  JOBS: '/jobs',
  JOB_DETAILS: (id: string) => `/jobs/${id}`,
  BROWSE_JOBS: '/jobs',
  BROWSE_JOBS_LIST: '/jobs',
  BROWSE_JOBS_GRID: '/jobs',
  BROWSE_JOBS_FILTER_LIST: '/jobs',
  BROWSE_JOBS_FILTER_GRID: '/jobs',
  JOBS_BY_COMPANY: '/jobs',
  JOBS_BY_DESIGNATION: '/jobs',
  JOBS_BY_CATEGORY: '/jobs',
  JOBS_BY_LOCATION: '/jobs',
  JOBS_BY_SKILLS: '/jobs',
  APPLY_JOB: (id: string) => `/apply/${id}`,

  // Employee Dashboard Routes
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  RESUME: '/dashboard/resume',
  RESUME_HEADLINE: '/dashboard/resume/headline',
  RESUME_SKILLS: '/dashboard/resume/skills',
  RESUME_EMPLOYMENT: '/dashboard/resume/employment',
  RESUME_EDUCATION: '/dashboard/resume/education',
  RESUME_IT_SKILLS: '/dashboard/resume/it-skills',
  RESUME_PROJECTS: '/dashboard/resume/projects',
  RESUME_SUMMARY: '/dashboard/resume/summary',
  RESUME_ACCOMPLISHMENTS: '/dashboard/resume/accomplishments',
  RESUME_CAREER: '/dashboard/resume/career',
  RESUME_PERSONAL: '/dashboard/resume/personal',
  RESUME_ATTACH: '/dashboard/resume/attach',
  SAVED_JOBS: '/dashboard/saved',
  APPLIED_JOBS: '/dashboard/applied',
  JOB_ALERTS: '/dashboard/alerts',
  CV_MANAGER: '/dashboard/cv-manager',

  // Employer Dashboard Routes
  EMPLOYER_DASHBOARD: '/employer/dashboard',
  POST_JOB: '/employer/post-job',
  COMPANY_PROFILE: '/employer/profile',
  MANAGE_JOBS: '/employer/jobs',
  TRANSACTIONS: '/employer/transactions',
  BROWSE_CANDIDATES: '/employer/candidates',
  EMPLOYER_RESUME: '/employer/resume',

  // Registration Routes
  REGISTER: '/register',
  REGISTER_PROFESSIONAL: '/register/professional',
  REGISTER_FRESHER: '/register/fresher',
  EMPLOYER_REGISTER: '/employer/register',
  EMPLOYER_COMPANY_REGISTER: '/employer/company-register',

  // 404 Route
  NOT_FOUND: '*',
} as const;

// Route Groups for easier navigation
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
  ],
  JOBS: [
    ROUTES.JOBS,
    ROUTES.BROWSE_JOBS,
    ROUTES.BROWSE_JOBS_LIST,
    ROUTES.BROWSE_JOBS_GRID,
    ROUTES.BROWSE_JOBS_FILTER_LIST,
    ROUTES.BROWSE_JOBS_FILTER_GRID,
    ROUTES.JOBS_BY_COMPANY,
    ROUTES.JOBS_BY_DESIGNATION,
    ROUTES.JOBS_BY_CATEGORY,
    ROUTES.JOBS_BY_LOCATION,
    ROUTES.JOBS_BY_SKILLS,
  ],
  EMPLOYEE_DASHBOARD: [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.RESUME,
    ROUTES.SAVED_JOBS,
    ROUTES.APPLIED_JOBS,
    ROUTES.JOB_ALERTS,
    ROUTES.CV_MANAGER,
  ],
  EMPLOYER_DASHBOARD: [
    ROUTES.EMPLOYER_DASHBOARD,
    ROUTES.POST_JOB,
    ROUTES.COMPANY_PROFILE,
    ROUTES.MANAGE_JOBS,
    ROUTES.TRANSACTIONS,
    ROUTES.BROWSE_CANDIDATES,
    ROUTES.EMPLOYER_RESUME,
  ],
  REGISTRATION: [
    ROUTES.REGISTER,
    ROUTES.REGISTER_PROFESSIONAL,
    ROUTES.REGISTER_FRESHER,
    ROUTES.EMPLOYER_REGISTER,
    ROUTES.EMPLOYER_COMPANY_REGISTER,
  ],
} as const;

// Navigation menu structure
export const NAVIGATION_MENU = {
  MAIN: [
    { label: 'Home', path: ROUTES.HOME },
    { label: 'Jobs', path: ROUTES.JOBS, hasDropdown: true },
    { label: 'About', path: ROUTES.ABOUT },
    { label: 'Contact', path: ROUTES.CONTACT },
  ],
  JOBS_DROPDOWN: {
    MAIN_MENU: [
      { label: 'All Jobs', path: ROUTES.JOBS },
      { label: 'Company Jobs', path: ROUTES.JOBS_BY_COMPANY },
      { label: 'Designations-Jobs', path: ROUTES.JOBS_BY_DESIGNATION },
      { label: 'Category Jobs', path: ROUTES.JOBS_BY_CATEGORY },
      { label: 'Location Jobs', path: ROUTES.JOBS_BY_LOCATION },
      { label: 'Skill Jobs', path: ROUTES.JOBS_BY_SKILLS },
    ],
    BROWSE_JOBS: [
      { label: 'Browse Job List', path: ROUTES.BROWSE_JOBS_LIST },
      { label: 'Browse Job Grid', path: ROUTES.BROWSE_JOBS_GRID },
      { label: 'Browse Filter List', path: ROUTES.BROWSE_JOBS_FILTER_LIST },
      { label: 'Browse Filter Grid', path: ROUTES.BROWSE_JOBS_FILTER_GRID },
    ],
  },
  EMPLOYEE_DASHBOARD: [
    { label: 'Profile', path: ROUTES.PROFILE },
    { label: 'Resume', path: ROUTES.RESUME },
    { label: 'Saved Jobs', path: ROUTES.SAVED_JOBS },
    { label: 'Applied Jobs', path: ROUTES.APPLIED_JOBS },
    { label: 'Job Alerts', path: ROUTES.JOB_ALERTS },
    { label: 'CV Manager', path: ROUTES.CV_MANAGER },
  ],
  EMPLOYER_DASHBOARD: [
    { label: 'Dashboard', path: ROUTES.EMPLOYER_DASHBOARD },
    { label: 'Post Job', path: ROUTES.POST_JOB },
    { label: 'Manage Jobs', path: ROUTES.MANAGE_JOBS },
    { label: 'Browse Candidates', path: ROUTES.BROWSE_CANDIDATES },
    { label: 'Company Profile', path: ROUTES.COMPANY_PROFILE },
    { label: 'Transactions', path: ROUTES.TRANSACTIONS },
    { label: 'Resume', path: ROUTES.EMPLOYER_RESUME },
  ],
} as const;

// Route permissions
export const ROUTE_PERMISSIONS = {
  [ROUTES.HOME]: { roles: ['public', 'employee', 'employer'] },
  [ROUTES.ABOUT]: { roles: ['public', 'employee', 'employer'] },
  [ROUTES.CONTACT]: { roles: ['public', 'employee', 'employer'] },
  [ROUTES.LOGIN]: { roles: ['public'] },
  [ROUTES.SIGNUP]: { roles: ['public'] },
  [ROUTES.JOBS]: { roles: ['public', 'employee', 'employer'] },
  [ROUTES.DASHBOARD]: { roles: ['employee'] },
  [ROUTES.EMPLOYER_DASHBOARD]: { roles: ['employer'] },
} as const;

export default ROUTES;
