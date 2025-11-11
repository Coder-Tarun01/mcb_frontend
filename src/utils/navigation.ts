import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Navigation utility functions
export class NavigationUtils {
  private static navigate: NavigateFunction | null = null;

  // Set the navigate function from useNavigate hook
  static setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  // Navigate to a specific route
  static goTo(path: string, options?: { replace?: boolean; state?: any; scrollToTop?: boolean }) {
    if (this.navigate) {
      this.navigate(path, options);
      
      // Scroll to top after navigation (default behavior)
      if (options?.scrollToTop !== false) {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }, 100);
      }
    } else {
      console.warn('Navigation not initialized. Call setNavigate first.');
    }
  }

  // Navigate to home page
  static goHome() {
    this.goTo(ROUTES.HOME);
  }

  // Navigate to jobs page
  static goToJobs() {
    this.goTo(ROUTES.JOBS);
  }

  // Navigate to job details
  static goToJobDetails(jobId: string) {
    this.goTo(ROUTES.JOB_DETAILS(jobId));
  }

  // Navigate to browse jobs
  static goToBrowseJobs() {
    this.goTo(ROUTES.BROWSE_JOBS);
  }

  // Navigate to browse jobs with specific view
  static goToBrowseJobsView(view: 'list' | 'grid' | 'filter-list' | 'filter-grid') {
    const viewRoutes = {
      'list': ROUTES.BROWSE_JOBS_LIST,
      'grid': ROUTES.BROWSE_JOBS_GRID,
      'filter-list': ROUTES.BROWSE_JOBS_FILTER_LIST,
      'filter-grid': ROUTES.BROWSE_JOBS_FILTER_GRID,
    };
    this.goTo(viewRoutes[view]);
  }

  // Navigate to apply job
  static goToApplyJob(jobId: string) {
    this.goTo(ROUTES.APPLY_JOB(jobId));
  }

  // Navigate to login
  static goToLogin() {
    this.goTo(ROUTES.LOGIN);
  }

  // Navigate to signup
  static goToSignup() {
    this.goTo(ROUTES.SIGNUP);
  }

  // Navigate to employee dashboard
  static goToEmployeeDashboard() {
    this.goTo(ROUTES.DASHBOARD);
  }

  // Navigate to employer dashboard
  static goToEmployerDashboard() {
    this.goTo(ROUTES.EMPLOYER_DASHBOARD);
  }

  // Navigate to profile
  static goToProfile() {
    this.goTo(ROUTES.PROFILE);
  }

  // Navigate to resume
  static goToResume() {
    this.goTo(ROUTES.RESUME);
  }

  // Navigate to saved jobs
  static goToSavedJobs() {
    this.goTo(ROUTES.SAVED_JOBS);
  }

  // Navigate to applied jobs
  static goToAppliedJobs() {
    this.goTo(ROUTES.APPLIED_JOBS);
  }

  // Navigate to job alerts
  static goToJobAlerts() {
    this.goTo(ROUTES.JOB_ALERTS);
  }

  // Navigate to CV manager
  static goToCVManager() {
    this.goTo(ROUTES.CV_MANAGER);
  }


  // Navigate to post job
  static goToPostJob() {
    this.goTo(ROUTES.POST_JOB);
  }

  // Navigate to manage jobs
  static goToManageJobs() {
    this.goTo(ROUTES.MANAGE_JOBS);
  }

  // Navigate to browse candidates
  static goToBrowseCandidates() {
    this.goTo(ROUTES.BROWSE_CANDIDATES);
  }

  // Navigate to company profile
  static goToCompanyProfile() {
    this.goTo(ROUTES.COMPANY_PROFILE);
  }

  // Navigate to company overview
  static goToCompanyOverview() {
    this.goTo(ROUTES.COMPANY_OVERVIEW);
  }

  // Navigate to transactions
  static goToTransactions() {
    this.goTo(ROUTES.TRANSACTIONS);
  }

  // Navigate to employer resume
  static goToEmployerResume() {
    this.goTo(ROUTES.EMPLOYER_RESUME);
  }

  // Navigate to about page
  static goToAbout() {
    this.goTo(ROUTES.ABOUT);
  }

  // Navigate to contact page
  static goToContact() {
    this.goTo(ROUTES.CONTACT);
  }

  // Navigate back
  static goBack() {
    if (this.navigate) {
      this.navigate(-1);
    }
  }

  // Navigate forward
  static goForward() {
    if (this.navigate) {
      this.navigate(1);
    }
  }

  // Replace current route
  static replace(path: string, state?: any) {
    this.goTo(path, { replace: true, state });
  }

  // Navigate with state
  static goToWithState(path: string, state: any) {
    this.goTo(path, { state });
  }

  // Handle external links with scroll to top
  static handleExternalLink(url: string, openInNewTab: boolean = false) {
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }

  // Scroll to top utility
  static scrollToTop(smooth: boolean = true) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
}

// Hook for using navigation utilities
export const useNavigation = () => {
  return NavigationUtils;
};

// Navigation helper functions
export const navigationHelpers = {
  // Check if current path matches a route
  isCurrentPath: (pathname: string, route: string) => {
    if (route === ROUTES.HOME) {
      return pathname === ROUTES.HOME;
    }
    return pathname.startsWith(route);
  },


  // Get route title
  getRouteTitle: (pathname: string) => {
    const routeTitles: Record<string, string> = {
      [ROUTES.HOME]: 'Home',
      [ROUTES.JOBS]: 'Jobs',
      [ROUTES.BROWSE_JOBS]: 'Browse Jobs',
      [ROUTES.DASHBOARD]: 'Dashboard',
      [ROUTES.EMPLOYER_DASHBOARD]: 'Employer Dashboard',
      [ROUTES.PROFILE]: 'Profile',
      [ROUTES.RESUME]: 'Resume',
      [ROUTES.SAVED_JOBS]: 'Saved Jobs',
      [ROUTES.APPLIED_JOBS]: 'Applied Jobs',
      [ROUTES.JOB_ALERTS]: 'Job Alerts',
      [ROUTES.CV_MANAGER]: 'CV Manager',
      [ROUTES.POST_JOB]: 'Post Job',
      [ROUTES.MANAGE_JOBS]: 'Manage Jobs',
      [ROUTES.BROWSE_CANDIDATES]: 'Browse Candidates',
      [ROUTES.COMPANY_PROFILE]: 'Company Profile',
      [ROUTES.COMPANY_OVERVIEW]: 'Company Overview',
      [ROUTES.TRANSACTIONS]: 'Transactions',
      [ROUTES.EMPLOYER_RESUME]: 'Resume',
      [ROUTES.ABOUT]: 'About',
      [ROUTES.CONTACT]: 'Contact',
      [ROUTES.LOGIN]: 'Login',
      [ROUTES.SIGNUP]: 'Sign Up',
    };

    return routeTitles[pathname] || 'Page';
  },
};

export default NavigationUtils;
