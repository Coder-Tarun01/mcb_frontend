import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, Eye, Edit, Trash2, Plus, CheckCircle, AlertCircle, Calendar, File, Grid3X3, List, RefreshCw } from 'lucide-react';
import { cvAPI, CVFile, CVStats } from '../../services/cvApi';
import FileViewer from '../../components/FileViewer';
import toast from 'react-hot-toast';


const CVManager: React.FC = () => {
  const [cvFiles, setCvFiles] = useState<CVFile[]>([]);
  const [stats, setStats] = useState<CVStats>({
    totalFiles: 0,
    primaryFiles: 0,
    publicFiles: 0,
    activeFiles: 0
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all'
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [viewingFile, setViewingFile] = useState<{ id: string; name: string; type: string } | null>(null);

  // Load CV files and stats
  const loadCVData = async () => {
    try {
      setLoading(true);
      const [filesResponse, statsResponse] = await Promise.all([
        cvAPI.getCVFiles(filters),
        cvAPI.getCVStats()
      ]);
      
      setCvFiles(filesResponse.files);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error loading CV data:', error);
      toast.error('Failed to load CV files');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadCVData();
  }, [filters]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCVData();
      toast.success('CV files refreshed');
    } catch (error) {
      toast.error('Failed to refresh CV files');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileAction = async (id: string, action: 'view' | 'download' | 'edit' | 'delete' | 'setPrimary' | 'togglePublic' | 'rename') => {
    try {
    switch (action) {
      case 'view':
          const viewFile = cvFiles.find(f => f.id === id);
          if (viewFile) {
            setViewingFile({
              id: viewFile.id,
              name: viewFile.name,
              type: viewFile.mimeType
            });
          }
        break;
      case 'download':
          await cvAPI.downloadCVFile(id);
          toast.success('File download started');
        break;
      case 'edit':
          const file = cvFiles.find(f => f.id === id);
          if (file) {
            setEditingFile(id);
            setEditingName(file.name);
          }
        break;
      case 'delete':
          if (window.confirm('Are you sure you want to delete this file?')) {
            await cvAPI.deleteCVFile(id);
        setCvFiles(prev => prev.filter(file => file.id !== id));
            toast.success('File deleted successfully');
          }
        break;
      case 'setPrimary':
          await cvAPI.setPrimaryCVFile(id);
        setCvFiles(prev => prev.map(file => ({
          ...file,
          isPrimary: file.id === id
        })));
          toast.success('Primary file updated');
        break;
      case 'togglePublic':
          const toggleFile = cvFiles.find(f => f.id === id);
          if (toggleFile) {
            await cvAPI.updateCVFile(id, { isPublic: !toggleFile.isPublic });
            setCvFiles(prev => prev.map(f => 
              f.id === id ? { ...f, isPublic: !f.isPublic } : f
            ));
            toast.success(`File made ${!toggleFile.isPublic ? 'public' : 'private'}`);
          }
          break;
        case 'rename':
          if (editingName.trim()) {
            await cvAPI.renameCVFile(id, editingName.trim());
            setCvFiles(prev => prev.map(f => 
              f.id === id ? { ...f, name: editingName.trim() } : f
            ));
            setEditingFile(null);
            setEditingName('');
            toast.success('File renamed successfully');
          }
        break;
    }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to ${action} file`);
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditingName('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }
    
    setUploading(true);
    
    try {
      // Determine file type based on name or content
      const fileType = determineFileType(file);
      
      const newFile = await cvAPI.uploadCVFile(file, {
        type: fileType,
        description: '',
        tags: [],
        isPublic: false
      });
      
      setCvFiles(prev => [...prev, newFile]);
      toast.success('File uploaded successfully');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const determineFileType = (file: File): string => {
    const name = file.name.toLowerCase();
    if (name.includes('resume') || name.includes('cv')) return 'resume';
    if (name.includes('cover') || name.includes('letter')) return 'cover-letter';
    if (name.includes('portfolio') || name.includes('work')) return 'portfolio';
    if (name.includes('certificate') || name.includes('cert')) return 'certificate';
    return 'resume'; // Default to resume
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'resume': return <FileText className="file-type-icon" />;
      case 'cover-letter': return <FileText className="file-type-icon" />;
      case 'portfolio': return <File className="file-type-icon" />;
      case 'certificate': return <CheckCircle className="file-type-icon" />;
      default: return <File className="file-type-icon" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'resume': return '#2563eb';
      case 'cover-letter': return '#3b82f6';
      case 'portfolio': return '#60a5fa';
      case 'certificate': return '#93c5fd';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#2563eb';
      case 'archived': return '#6b7280';
      case 'draft': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Files are already filtered by the API, so we can use them directly
  const filteredFiles = cvFiles;

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-base m-0">Loading CV files...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-0 pb-6 px-4 sm:px-6 bg-gray-50"
    >
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-blue-700 text-center lg:text-left w-full">CV Manager</h2>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search files..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Categories</option>
              <option>Resume</option>
              <option>Cover Letter</option>
              <option>Portfolio</option>
              <option>Certificate</option>
            </select>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={18} />
              Upload File
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-600">
            <FileText size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-500">
            <CheckCircle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-600">{stats.primaryFiles}</div>
            <div className="text-sm text-gray-600">Primary</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-400">
            <Eye size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-600">{stats.publicFiles}</div>
            <div className="text-sm text-gray-600">Public</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select 
                  value={filters.type} 
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="resume">Resume</option>
                  <option value="cover-letter">Cover Letter</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={18} />
              </button>
              <button 
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
            </div>
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <motion.tr
                      key={file.id}
                      className="hover:bg-gray-50"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: getFileTypeColor(file.type) + '20' }}>
                              <div style={{ color: getFileTypeColor(file.type) }}>
                                {getFileTypeIcon(file.type)}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {editingFile === file.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleFileAction(file.id, 'rename');
                                      } else if (e.key === 'Escape') {
                                        handleCancelEdit();
                                      }
                                    }}
                                  />
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => handleFileAction(file.id, 'rename')}
                                    title="Save"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={handleCancelEdit}
                                    title="Cancel"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  className="cursor-pointer hover:text-blue-600"
                                  onClick={() => handleFileAction(file.id, 'edit')}
                                >
                                  {file.name}
                                </div>
                              )}
                            </div>
                            {file.isPrimary && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Primary
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600" style={{ color: 'white' }}>
                          {file.type.charAt(0).toUpperCase() + file.type.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600" style={{ color: 'white' }}>
                            {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600" style={{ color: 'white' }}>
                            {file.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            <button 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                              onClick={() => handleFileAction(file.id, 'view')}
                              title="View File"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors" 
                              onClick={() => handleFileAction(file.id, 'download')}
                              title="Download File"
                            >
                              <Download size={16} />
                            </button>
                            <button 
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors" 
                              onClick={() => handleFileAction(file.id, 'edit')}
                              title="Edit File"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" 
                              onClick={() => handleFileAction(file.id, 'delete')}
                              title="Delete File"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              className={`px-2 py-1 text-xs rounded transition-colors bg-blue-600 hover:bg-blue-700`}
                              style={{ color: 'white' }}
                              onClick={() => handleFileAction(file.id, 'setPrimary')}
                              disabled={file.isPrimary}
                              title={file.isPrimary ? 'Primary File' : 'Set as Primary'}
                            >
                              {file.isPrimary ? 'Primary' : 'Set Primary'}
                            </button>
                            <button 
                              className={`px-2 py-1 text-xs rounded transition-colors bg-blue-600 hover:bg-blue-700`}
                              style={{ color: 'white' }}
                              onClick={() => handleFileAction(file.id, 'togglePublic')}
                              title={file.isPublic ? 'Make Private' : 'Make Public'}
                            >
                              {file.isPublic ? 'Public' : 'Private'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-4xl mb-4">📁</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No files found</h3>
                      <p className="text-gray-600 mb-4">Upload your first file to get started with CV management.</p>
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                        onClick={() => setShowUploadModal(true)}
                      >
                        <Upload size={18} />
                        Upload Your First File
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 ${file.isPrimary ? 'ring-2 ring-blue-500' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: getFileTypeColor(file.type) + '20' }}>
                        <div style={{ color: getFileTypeColor(file.type) }}>
                          {getFileTypeIcon(file.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        {editingFile === file.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleFileAction(file.id, 'rename');
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                            />
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleFileAction(file.id, 'rename')}
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={handleCancelEdit}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <h3 
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleFileAction(file.id, 'edit')}
                          >
                            {file.name}
                          </h3>
                        )}
                        <p className="text-sm text-gray-500">
                          {file.type.charAt(0).toUpperCase() + file.type.slice(1).replace('-', ' ')} • {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {file.isPrimary && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Primary
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600" style={{ color: 'white' }}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="text-gray-900">{new Date(file.uploadDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="text-gray-900">{file.downloadCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Viewed:</span>
                      <span className="text-gray-900">{new Date(file.lastViewed).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      onClick={() => handleFileAction(file.id, 'view')}
                      title="View File"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                      onClick={() => handleFileAction(file.id, 'download')}
                      title="Download File"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" 
                      onClick={() => handleFileAction(file.id, 'edit')}
                      title="Edit File"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      onClick={() => handleFileAction(file.id, 'delete')}
                      title="Delete File"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      className={`px-3 py-1 text-xs rounded transition-colors bg-blue-600 hover:bg-blue-700`}
                      style={{ color: 'white' }}
                      onClick={() => handleFileAction(file.id, 'setPrimary')}
                      disabled={file.isPrimary}
                    >
                      {file.isPrimary ? 'Primary' : 'Set Primary'}
                    </button>
                    <button 
                      className={`px-3 py-1 text-xs rounded transition-colors bg-blue-600 hover:bg-blue-700`}
                      style={{ color: 'white' }}
                      onClick={() => handleFileAction(file.id, 'togglePublic')}
                    >
                      {file.isPublic ? 'Public' : 'Private'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No files found</h3>
              <p className="text-gray-600 mb-4">Upload your first file to get started with CV management.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={18} />
                Upload Your First File
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upload New File</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                } ${uploading ? 'border-blue-500 bg-blue-50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Uploading file...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Drag & Drop your file here</h4>
                    <p className="text-gray-600 mb-4">or click to browse</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                  </>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Supported file types:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF files (.pdf)</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• Text files (.txt)</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Maximum file size: 10 MB</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          fileId={viewingFile.id}
          fileName={viewingFile.name}
          fileType={viewingFile.type}
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </motion.div>
  );
};

export default CVManager;