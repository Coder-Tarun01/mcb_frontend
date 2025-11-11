import { makeRequest } from './api';

export interface ResumeData {
  id?: string;
  title: string;
  isPrimary: boolean;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  workExperience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate: string;
    url: string;
    github: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    expiryDate: string;
    credentialId: string;
    url: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency: 'basic' | 'conversational' | 'professional' | 'native';
  }>;
  references: Array<{
    id: string;
    name: string;
    position: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  additionalInfo: {
    interests: string[];
    volunteerWork: Array<{
      id: string;
      organization: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    publications: Array<{
      id: string;
      title: string;
      publisher: string;
      date: string;
      url: string;
    }>;
    awards: Array<{
      id: string;
      title: string;
      issuer: string;
      date: string;
      description: string;
    }>;
  };
  settings: {
    template: string;
    colorScheme: string;
    fontFamily: string;
    fontSize: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    sections: {
      personalInfo: boolean;
      summary: boolean;
      workExperience: boolean;
      education: boolean;
      skills: boolean;
      projects: boolean;
      certifications: boolean;
      languages: boolean;
      references: boolean;
      additionalInfo: boolean;
    };
    sectionOrder: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeStats {
  total: number;
  published: number;
  draft: number;
  primary: string | null;
}

export interface ResumeListResponse {
  success: boolean;
  resumes: ResumeData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Resume API functions
export const resumeAPI = {
  // Get all resumes
  getResumes: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ResumeListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const url = `/resume${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch resumes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },

  // Get single resume
  getResume: async (id: string): Promise<{ success: boolean; resume: ResumeData }> => {
    try {
      const response = await makeRequest(`/resume/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  },

  // Create new resume
  createResume: async (resumeData: Partial<ResumeData>): Promise<{ success: boolean; message: string; resume: ResumeData }> => {
    try {
      const response = await makeRequest('/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },

  // Update resume
  updateResume: async (id: string, resumeData: Partial<ResumeData>): Promise<{ success: boolean; message: string; resume: ResumeData }> => {
    try {
      const response = await makeRequest(`/resume/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  },

  // Delete resume
  deleteResume: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await makeRequest(`/resume/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  },

  // Set primary resume
  setPrimaryResume: async (id: string): Promise<{ success: boolean; message: string; resume: ResumeData }> => {
    try {
      const response = await makeRequest(`/resume/${id}/primary`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set primary resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting primary resume:', error);
      throw error;
    }
  },

  // Duplicate resume
  duplicateResume: async (id: string): Promise<{ success: boolean; message: string; resume: ResumeData }> => {
    try {
      const response = await makeRequest(`/resume/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to duplicate resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error duplicating resume:', error);
      throw error;
    }
  },

  // Get resume statistics
  getResumeStats: async (): Promise<{ success: boolean; stats: ResumeStats }> => {
    try {
      const response = await makeRequest('/resume/stats', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch resume stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching resume stats:', error);
      throw error;
    }
  },

  // Export resume
  exportResume: async (id: string, format: string = 'pdf'): Promise<{ success: boolean; message: string; resume: ResumeData }> => {
    try {
      const response = await makeRequest(`/resume/${id}/export?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting resume:', error);
      throw error;
    }
  },
};
