'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Notification } from '@/types';
import { FiBell, FiCheck, FiTrash2, FiMail } from 'react-icons/fi';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      showToast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {
      showToast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      showToast.success('All notifications marked as read');
      fetchNotifications();
    } catch {
      showToast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      showToast.success('Notification deleted');
      fetchNotifications();
    } catch {
      showToast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return '🛒';
      case 'low_stock': return '⚠️';
      default: return '📢';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread notifications</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center"
          >
            <FiCheck className="mr-2" />
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FiBell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">Notifications will appear here when orders are placed or stock is low.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition-colors ${
                notification.read ? 'border-gray-200' : 'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-xl mt-1">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-sm"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Mark as read"
                    >
                      <FiMail className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}