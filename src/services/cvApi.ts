import { makeRequest } from './api';

export interface CVFile {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  type: 'resume' | 'cover-letter' | 'portfolio' | 'certificate';
  size: number;
  mimeType: string;
  filePath: string;
  uploadDate: string;
  isPrimary: boolean;
  isPublic: boolean;
  downloadCount: number;
  lastViewed: string | null;
  status: 'active' | 'archived' | 'draft';
  description?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CVStats {
  totalFiles: number;
  primaryFiles: number;
  publicFiles: number;
  activeFiles: number;
}

export interface CVFilters {
  search?: string;
  type?: string;
  status?: string;
}

export const cvAPI = {
  // Get all CV files with optional filters
  getCVFiles: async (filters?: CVFilters): Promise<{ files: CVFile[]; total: number }> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.status) queryParams.append('status', filters.status);

      const url = `/cv${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch CV files');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching CV files:', error);
      throw error;
    }
  },

  // Get CV file statistics
  getCVStats: async (): Promise<CVStats> => {
    try {
      const response = await makeRequest('/cv/stats', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch CV stats');
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching CV stats:', error);
      throw error;
    }
  },

  // Get a specific CV file
  getCVFile: async (id: string): Promise<CVFile> => {
    try {
      const response = await makeRequest(`/cv/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch CV file');
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      console.error('Error fetching CV file:', error);
      throw error;
    }
  },

  // Upload a new CV file
  uploadCVFile: async (file: File, fileData: {
    type: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<CVFile> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileData.type);
      if (fileData.description) formData.append('description', fileData.description);
      if (fileData.tags) formData.append('tags', JSON.stringify(fileData.tags));
      formData.append('isPublic', fileData.isPublic ? 'true' : 'false');

      const response = await makeRequest('/cv/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload CV file');
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      console.error('Error uploading CV file:', error);
      throw error;
    }
  },

  // Update a CV file
  updateCVFile: async (id: string, updateData: {
    name?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    status?: string;
  }): Promise<CVFile> => {
    try {
      const response = await makeRequest(`/cv/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update CV file');
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      console.error('Error updating CV file:', error);
      throw error;
    }
  },

  // Set primary CV file
  setPrimaryCVFile: async (id: string): Promise<CVFile> => {
    try {
      const response = await makeRequest(`/cv/${id}/primary`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set primary CV file');
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      console.error('Error setting primary CV file:', error);
      throw error;
    }
  },

  // View a CV file (for preview)
  viewCVFile: async (id: string): Promise<string> => {
    try {
      const response = await makeRequest(`/cv/${id}/view`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to view CV file');
      }

      // Create blob URL for viewing
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error viewing CV file:', error);
      throw error;
    }
  },

  // Download a CV file
  downloadCVFile: async (id: string): Promise<void> => {
    try {
      const response = await makeRequest(`/cv/${id}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download CV file');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-file-${id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CV file:', error);
      throw error;
    }
  },

  // Delete a CV file
  deleteCVFile: async (id: string): Promise<void> => {
    try {
      const response = await makeRequest(`/cv/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete CV file');
      }
    } catch (error) {
      console.error('Error deleting CV file:', error);
      throw error;
    }
  },

  // Rename a CV file
  renameCVFile: async (id: string, name: string): Promise<void> => {
    try {
      const response = await makeRequest(`/cv/${id}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rename CV file');
      }
    } catch (error) {
      console.error('Error renaming CV file:', error);
      throw error;
    }
  }
};
