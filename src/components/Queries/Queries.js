import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './Queries.css';

const Queries = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotificationsByStatus('UNREAD');
      setNotifications(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (notificationId) => {
    try {
      setAssigningId(notificationId);
      const userId = localStorage.getItem('userId');
      await apiService.assignNotification(notificationId, userId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, assignedTo: userId }
            : notif
        )
      );
    } catch (error) {
      console.error('Error assigning notification:', error);
    } finally {
      setAssigningId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ff4757';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#2ed573';
      default: return '#747d8c';
    }
  };

  if (loading) {
    return (
      <div className="queries-container">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="queries-container">
      <div className="queries-header">
        <h1>Unread Queries</h1>
        <p>{notifications.length} unread notifications</p>
      </div>

      {notifications.length === 0 ? (
        <div className="no-queries">
          <p>No unread queries found</p>
        </div>
      ) : (
        <div className="queries-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="query-card">
              <div className="query-header">
                <div className="query-info">
                  <span className="query-type">{notification.type}</span>
                  <span 
                    className="query-priority" 
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority}
                  </span>
                </div>
                <div className="query-date">
                  {formatDate(notification.createdAt)}
                </div>
              </div>

              <div className="query-content">
                <h3>{notification.subject}</h3>
                <p>{notification.message}</p>
                <div className="query-meta">
                  <span>User ID: {notification.userId}</span>
                  <span>Status: {notification.status}</span>
                </div>
              </div>

              {notification.assignedTo === null && (
                <div className="query-actions">
                  <button 
                    className="assign-btn"
                    onClick={() => handleAssign(notification.id)}
                    disabled={assigningId === notification.id}
                  >
                    {assigningId === notification.id ? 'Assigning...' : 'Assign to Me'}
                  </button>
                </div>
              )}

              {notification.assignedTo && (
                <div className="assigned-info">
                  <span>Assigned to: {notification.assignedTo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Queries;