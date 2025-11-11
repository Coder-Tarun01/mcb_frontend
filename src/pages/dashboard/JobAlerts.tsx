import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Edit, Trash2, Search, Filter, MapPin, Briefcase, DollarSign, Calendar, Clock, Grid3X3, List, RefreshCw, Settings, Eye } from 'lucide-react';

interface JobAlert {
  id: number;
  name: string;
  keywords: string[];
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  experience: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastSent: string;
  nextSend: string;
  totalMatches: number;
  newMatches: number;
}

const initialAlerts: JobAlert[] = [
  {
    id: 1,
    name: 'Frontend Developer Jobs',
    keywords: ['React', 'JavaScript', 'Frontend', 'UI/UX'],
    location: 'San Francisco, CA',
    salaryMin: 70000,
    salaryMax: 120000,
    jobType: 'Full-time',
    experience: '2-5 years',
    frequency: 'daily',
    isActive: true,
    lastSent: '2024-01-15',
    nextSend: '2024-01-16',
    totalMatches: 45,
    newMatches: 8
  },
  {
    id: 2,
    name: 'Remote React Jobs',
    keywords: ['React', 'Remote', 'TypeScript', 'Node.js'],
    location: 'Remote',
    salaryMin: 60000,
    salaryMax: 100000,
    jobType: 'Full-time',
    experience: '1-4 years',
    frequency: 'weekly',
    isActive: true,
    lastSent: '2024-01-10',
    nextSend: '2024-01-17',
    totalMatches: 23,
    newMatches: 3
  },
  {
    id: 3,
    name: 'Senior Developer Positions',
    keywords: ['Senior', 'Lead', 'Architect', 'Full Stack'],
    location: 'New York, NY',
    salaryMin: 100000,
    salaryMax: 150000,
    jobType: 'Full-time',
    experience: '5+ years',
    frequency: 'weekly',
    isActive: false,
    lastSent: '2024-01-08',
    nextSend: '2024-01-15',
    totalMatches: 12,
    newMatches: 0
  },
  {
    id: 4,
    name: 'Startup Jobs',
    keywords: ['Startup', 'Early Stage', 'Equity', 'Growth'],
    location: 'Austin, TX',
    salaryMin: 50000,
    salaryMax: 80000,
    jobType: 'Full-time',
    experience: '0-3 years',
    frequency: 'monthly',
    isActive: true,
    lastSent: '2024-01-01',
    nextSend: '2024-02-01',
    totalMatches: 8,
    newMatches: 2
  }
];

const JobAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<JobAlert[]>(initialAlerts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    frequency: 'all'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [newAlert, setNewAlert] = useState<Partial<JobAlert>>({
    name: '',
    keywords: [],
    location: '',
    salaryMin: 0,
    salaryMax: 0,
    jobType: 'Full-time',
    experience: '',
    frequency: 'daily',
    isActive: true
  });

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleToggleAlert = (id: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleDeleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleEditAlert = (alert: JobAlert) => {
    setEditingAlert(alert);
    setNewAlert(alert);
    setShowCreateModal(true);
  };

  const handleCreateAlert = () => {
    setNewAlert({
      name: '',
      keywords: [],
      location: '',
      salaryMin: 0,
      salaryMax: 0,
      jobType: 'Full-time',
      experience: '',
      frequency: 'daily',
      isActive: true
    });
    setEditingAlert(null);
    setShowCreateModal(true);
  };

  const handleSaveAlert = () => {
    if (editingAlert) {
      setAlerts(prev => prev.map(alert => 
        alert.id === editingAlert.id ? { ...alert, ...newAlert } as JobAlert : alert
      ));
    } else {
      const alert: JobAlert = {
        id: Date.now(),
        ...newAlert,
        lastSent: new Date().toISOString().split('T')[0],
        nextSend: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalMatches: 0,
        newMatches: 0
      } as JobAlert;
      setAlerts(prev => [...prev, alert]);
    }
    setShowCreateModal(false);
    setEditingAlert(null);
  };

  const handleKeywordChange = (keywords: string) => {
    setNewAlert(prev => ({
      ...prev,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
    }));
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         alert.keywords.some(keyword => keyword.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && alert.isActive) ||
                         (filters.status === 'inactive' && !alert.isActive);
    const matchesFrequency = filters.frequency === 'all' || alert.frequency === filters.frequency;
    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '#10b981';
      case 'weekly': return '#3b82f6';
      case 'monthly': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Clock className="job-alerts-frequency-icon" />;
      case 'weekly': return <Calendar className="job-alerts-frequency-icon" />;
      case 'monthly': return <Calendar className="job-alerts-frequency-icon" />;
      default: return <Clock className="job-alerts-frequency-icon" />;
    }
  };

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(alert => alert.isActive).length;
  const totalMatches = alerts.reduce((sum, alert) => sum + alert.totalMatches, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-0 pb-6 px-6 bg-gray-50"
    >
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Alerts</h2>
          <p className="text-gray-600 mb-6">Manage your job search notifications and stay updated with new opportunities.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-800">{totalAlerts}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Total Alerts</span>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-800">{activeAlerts}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-800">{totalMatches}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Total Matches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search job alerts..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Status:</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="frequency-filter" className="text-sm font-medium text-gray-700">Frequency:</label>
              <select
                id="frequency-filter"
                value={filters.frequency}
                onChange={(e) => handleFilterChange('frequency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Frequencies</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={handleCreateAlert}
            >
              <Plus className="w-5 h-5" />
              Create Alert
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Display */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-md border border-gray-200 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No job alerts found</h3>
          <p className="text-gray-600 mb-6">Create your first job alert to get notified about new opportunities.</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            onClick={handleCreateAlert}
          >
            <Plus className="w-5 h-5" />
            Create Your First Alert
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{alert.name}</h4>
                      <p className="text-sm text-gray-500">{alert.jobType} • {alert.experience}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {alert.keywords.slice(0, 2).map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {keyword}
                        </span>
                      ))}
                      {alert.keywords.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{alert.keywords.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{alert.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">${alert.salaryMin.toLocaleString()} - ${alert.salaryMax.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFrequencyIcon(alert.frequency)}
                      <span className="ml-2 text-sm font-medium" style={{ color: getFrequencyColor(alert.frequency) }}>
                        {alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${alert.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{alert.totalMatches}</span>
                      {alert.newMatches > 0 && (
                        <span className="ml-1 text-xs text-green-600">+{alert.newMatches} new</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        onClick={() => handleEditAlert(alert)}
                        title="Edit Alert"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        onClick={() => handleDeleteAlert(alert.id)}
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${alert.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        onClick={() => handleToggleAlert(alert.id)}
                        title={alert.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {alert.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{alert.name}</h4>
                <p className="text-sm text-gray-500">{alert.jobType} • {alert.experience}</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Keywords:</h5>
                  <div className="flex flex-wrap gap-1">
                    {alert.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                    <span>${alert.salaryMin.toLocaleString()} - ${alert.salaryMax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {getFrequencyIcon(alert.frequency)}
                    <span className="ml-2 font-medium" style={{ color: getFrequencyColor(alert.frequency) }}>
                      {alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{alert.totalMatches}</div>
                    <div className="text-xs text-gray-500">Total Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{alert.newMatches}</div>
                    <div className="text-xs text-gray-500">New Matches</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${alert.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  {alert.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    onClick={() => handleEditAlert(alert)}
                    title="Edit Alert"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    onClick={() => handleDeleteAlert(alert.id)}
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{editingAlert ? 'Edit Job Alert' : 'Create Job Alert'}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Name</label>
                <input
                  type="text"
                  value={newAlert.name || ''}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Frontend Developer Jobs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={newAlert.keywords?.join(', ') || ''}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                  placeholder="e.g. React, JavaScript, Frontend"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newAlert.location || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={newAlert.jobType || 'Full-time'}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary ($)</label>
                  <input
                    type="number"
                    value={newAlert.salaryMin || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, salaryMin: parseInt(e.target.value) || 0 }))}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary ($)</label>
                  <input
                    type="number"
                    value={newAlert.salaryMax || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, salaryMax: parseInt(e.target.value) || 0 }))}
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={newAlert.experience || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Experience</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newAlert.frequency || 'daily'}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAlert.isActive || false}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activate this alert immediately</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={handleSaveAlert}
              >
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JobAlerts;