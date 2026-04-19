import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ShoppingCart, AlertTriangle, Wallet, FileText, Settings } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications?limit=10'),
        api.get('/notifications/unread-count')
      ]);
      
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(countRes.data.count || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single notification as read
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await api.put(`/notifications/${notification._id}/read`);
        
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to relevant page based on notification type
      if (notification.data?.saleId) {
        navigate('/admin/sales');
      } else if (notification.data?.itemId) {
        navigate('/admin/inventory');
      } else if (notification.data?.expenseId) {
        navigate('/admin/expenses');
      } else if (notification.type === 'report') {
        navigate('/admin/reports');
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    const icons = {
      sale: { icon: ShoppingCart, color: 'text-green-500', bg: 'bg-green-100' },
      low_stock: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
      expense: { icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-100' },
      report: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
      system: { icon: Settings, color: 'text-gray-500', bg: 'bg-gray-100' }
    };
    return icons[type] || icons.system;
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-primary-light rounded-xl transition-colors group"
      >
        <Bell size={20} className="text-gray-600 group-hover:text-primary-dark transition-colors" />
        
        {/* Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white border border-[#F5EFE6] rounded-2xl shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#F5EFE6] flex items-center justify-between">
            <h3 className="font-semibold text-dark flex items-center gap-2">
              <Bell size={18} className="text-primary-dark" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-primary-dark font-medium hover:underline flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-primary-dark opacity-50" />
                </div>
                <p className="font-medium text-dark mb-1">No notifications yet</p>
                <p className="text-sm text-gray-500">
                  When something happens, you'll see it here
                </p>
              </div>
            ) : (
              /* Notification Items */
              notifications.map((notification) => {
                const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                
                return (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 border-b border-[#F5EFE6] hover:bg-[#F5EFE6] hover:bg-opacity-50 transition-colors duration-200 text-left ${
                      !notification.read ? 'bg-[#F5EFE6] bg-opacity-30' : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-dark text-sm truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#F5EFE6]">
              <button
                onClick={() => {
                  navigate('/admin/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-primary-dark font-medium hover:underline py-2"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
