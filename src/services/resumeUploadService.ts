import { makeRequest } from './api';

export interface ParsedResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    headline?: string;
  };
  summary?: string;
  skills?: string[];
  workExperience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    gpa?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    role?: string;
  }>;
  accomplishments?: Array<{
    title: string;
    type: 'Award' | 'Certification' | 'Achievement' | 'Recognition';
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  desiredCareer?: {
    jobType?: string;
    preferredLocation?: string;
    noticePeriod?: string;
    expectedSalary?: string;
    currency?: string;
    workType?: string;
  };
}

class ResumeUploadService {
  /**
   * Upload and parse resume file
   */
  async uploadAndParseResume(file: File): Promise<ParsedResumeData> {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await makeRequest('/resume/upload-and-parse', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for FormData
        }
      });

      if (!response.ok) {
        throw new Error('Failed to upload and parse resume');
      }

      const data = await response.json();
      return data.parsedData;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw new Error('Failed to process resume file');
    }
  }

  /**
   * Auto-fill resume sections with parsed data
   */
  async autoFillResumeSections(parsedData: ParsedResumeData): Promise<void> {
    try {
      // Update personal details
      if (parsedData.personalInfo) {
        await this.updatePersonalDetails(parsedData.personalInfo);
      }

      // Update profile summary
      if (parsedData.summary) {
        await this.updateProfileSummary(parsedData.summary);
      }

      // Update skills
      if (parsedData.skills && parsedData.skills.length > 0) {
        await this.updateSkills(parsedData.skills);
      }

      // Update work experience
      if (parsedData.workExperience && parsedData.workExperience.length > 0) {
        await this.updateWorkExperience(parsedData.workExperience);
      }

      // Update education
      if (parsedData.education && parsedData.education.length > 0) {
        await this.updateEducation(parsedData.education);
      }

      // Update projects
      if (parsedData.projects && parsedData.projects.length > 0) {
        await this.updateProjects(parsedData.projects);
      }

      // Update accomplishments
      if (parsedData.accomplishments && parsedData.accomplishments.length > 0) {
        await this.updateAccomplishments(parsedData.accomplishments);
      }

      // Update desired career profile
      if (parsedData.desiredCareer) {
        await this.updateDesiredCareer(parsedData.desiredCareer);
      }

    } catch (error) {
      console.error('Error auto-filling resume sections:', error);
      throw new Error('Failed to auto-fill resume sections');
    }
  }

  private async updatePersonalDetails(personalInfo: any): Promise<void> {
    const response = await makeRequest('/resume-sections/personal-details', {
      method: 'PUT',
      body: JSON.stringify({ data: personalInfo })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update personal details');
    }
  }

  private async updateProfileSummary(summary: string): Promise<void> {
    const response = await makeRequest('/resume-sections/profile-summary', {
      method: 'PUT',
      body: JSON.stringify({ data: { summary } })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile summary');
    }
  }

  private async updateSkills(skills: string[]): Promise<void> {
    const skillsData = skills.map(skill => ({
      name: skill,
      proficiency: 'Intermediate' // Default proficiency
    }));

    const response = await makeRequest('/resume-sections/skills', {
      method: 'PUT',
      body: JSON.stringify({ data: { skills: skillsData } })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update skills');
    }
  }

  private async updateWorkExperience(workExperience: any[]): Promise<void> {
    const response = await makeRequest('/resume-sections/employment', {
      method: 'PUT',
      body: JSON.stringify({ data: { employment: workExperience } })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update work experience');
    }
  }

  private async updateEducation(education: any[]): Promise<void> {
    const response = await makeRequest('/resume-sections/education', {
      method: 'PUT',
      body: JSON.stringify({ data: { education } })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update education');
    }
  }

  private async updateProjects(projects: any[]): Promise<void> {
    const response = await makeRequest('/resume-sections/projects', {
      method: 'PUT',
      body: JSON.stringify({ data: { projects } })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update projects');
    }
  }

  private async updateAccomplishments(accomplishments: any[]): Promise<void> {
    const response = await makeRequest('/resume-sections/accomplishments', {
      method: 'PUT',
      body: JSON.stringify({ data: { accomplishments } })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update accomplishments');
    }
  }

  private async updateDesiredCareer(desiredCareer: any): Promise<void> {
    const response = await makeRequest('/resume-sections/desired-career', {
      method: 'PUT',
      body: JSON.stringify({ data: desiredCareer })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update desired career profile');
    }
  }
}

export const resumeUploadService = new ResumeUploadService();
