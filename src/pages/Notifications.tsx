import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  Trash2, 
  Eye, 
  Filter, 
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { notificationsAPI, Notification } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Notifications.css';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortNotifications();
  }, [notifications, searchQuery, filterType, sortBy]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationsAPI.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortNotifications = () => {
    let filtered = [...notifications];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by read status
    if (filterType === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead);
    } else if (filterType === 'read') {
      filtered = filtered.filter(notification => notification.isRead);
    }

    // Sort notifications
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    setIsBulkActionLoading(true);
    try {
      await Promise.all(
        selectedNotifications.map(id => notificationsAPI.markAsRead(id))
      );
      setNotifications(prev => 
        prev.map(n => selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n)
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    setIsBulkActionLoading(true);
    try {
      await Promise.all(
        selectedNotifications.map(id => notificationsAPI.deleteNotification(id))
      );
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <CheckCircle className="notification-type-icon application" />;
      case 'job':
        return <Star className="notification-type-icon job" />;
      case 'system':
        return <Bell className="notification-type-icon system" />;
      case 'reminder':
        return <Clock className="notification-type-icon reminder" />;
      default:
        return <AlertCircle className="notification-type-icon default" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="loading-spinner" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-title-section">
            <Bell className="notifications-title-icon" />
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <button
            onClick={loadNotifications}
            className="refresh-btn"
            title="Refresh notifications"
          >
            <RefreshCw className="refresh-icon" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="notifications-filters">
          <div className="search-section">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <Filter className="filter-icon" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bulk-actions"
          >
            <div className="bulk-actions-info">
              <span>{selectedNotifications.length} selected</span>
            </div>
            <div className="bulk-actions-buttons">
              <button
                onClick={handleBulkMarkAsRead}
                disabled={isBulkActionLoading}
                className="bulk-action-btn mark-read"
              >
                <Check className="action-icon" />
                Mark as Read
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkActionLoading}
                className="bulk-action-btn delete"
              >
                <Trash2 className="action-icon" />
                Delete
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="notifications-error">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
            <button onClick={loadNotifications} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell className="empty-icon" />
              <h3>No notifications found</h3>
              <p>
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'You\'ll see notifications here when you receive them.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="select-all-section">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span>Select All</span>
                </label>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                    />
                  </div>

                  <div className="notification-content">
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <h3 className="notification-title">{notification.title}</h3>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        <span className="notification-type">{notification.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="action-btn mark-read"
                        title="Mark as read"
                      >
                        <Eye className="action-icon" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="action-btn delete"
                      title="Delete"
                    >
                      <Trash2 className="action-icon" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
