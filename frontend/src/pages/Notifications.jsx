import { useState, useEffect } from 'react';
import { 
  Bell, 
  ShoppingCart, 
  AlertTriangle, 
  Wallet, 
  FileText, 
  Settings,
  Search,
  Trash2,
  CheckCheck,
  X,
  Filter
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20
      };
      
      if (filter !== 'all') {
        params.type = filter;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/notifications/all', { params });
      
      setNotifications(response.data.grouped);
      setTotalPages(response.data.pages);
      setTotalNotifications(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchNotifications();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Mark single notification as read
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await api.put(`/notifications/${notification._id}/read`);
        
        // Update local state
        updateNotificationInGroups(notification._id, { read: true });
      }

      // Navigate to relevant page
      if (notification.data?.saleId) {
        navigate('/admin/sales');
      } else if (notification.data?.itemId) {
        navigate('/admin/inventory');
      } else if (notification.data?.expenseId) {
        navigate('/admin/expenses');
      } else if (notification.type === 'report') {
        navigate('/admin/reports');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Remove from local state
      removeNotificationFromGroups(notificationId);
      setTotalNotifications(prev => prev - 1);
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Toggle read status
  const handleToggleRead = async (e, notificationId) => {
    e.stopPropagation();
    
    try {
      const response = await api.put(`/notifications/${notificationId}/toggle-read`);
      
      // Update local state
      updateNotificationInGroups(notificationId, { read: response.notification.read });
      
      toast.success(response.message);
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      
      // Update all notifications to read
      setNotifications(prev => ({
        today: prev.today.map(n => ({ ...n, read: true })),
        yesterday: prev.yesterday.map(n => ({ ...n, read: true })),
        thisWeek: prev.thisWeek.map(n => ({ ...n, read: true })),
        older: prev.older.map(n => ({ ...n, read: true }))
      }));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete('/notifications/clear-all');
      
      setNotifications({
        today: [],
        yesterday: [],
        thisWeek: [],
        older: []
      });
      setTotalNotifications(0);
      
      toast.success(`Cleared ${response.data.deletedCount} notifications`);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  // Helper: Update notification in groups
  const updateNotificationInGroups = (id, updates) => {
    setNotifications(prev => ({
      today: prev.today.map(n => n._id === id ? { ...n, ...updates } : n),
      yesterday: prev.yesterday.map(n => n._id === id ? { ...n, ...updates } : n),
      thisWeek: prev.thisWeek.map(n => n._id === id ? { ...n, ...updates } : n),
      older: prev.older.map(n => n._id === id ? { ...n, ...updates } : n)
    }));
  };

  // Helper: Remove notification from groups
  const removeNotificationFromGroups = (id) => {
    setNotifications(prev => ({
      today: prev.today.filter(n => n._id !== id),
      yesterday: prev.yesterday.filter(n => n._id !== id),
      thisWeek: prev.thisWeek.filter(n => n._id !== id),
      older: prev.older.filter(n => n._id !== id)
    }));
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return notifDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Render notification item
  const renderNotification = (notification) => {
    const { icon: Icon, color, bg } = getNotificationIcon(notification.type);

    return (
      <div
        key={notification._id}
        onClick={() => handleNotificationClick(notification)}
        className={`group p-4 border-b border-[#F5EFE6] hover:bg-[#F5EFE6] hover:bg-opacity-50 transition-all duration-200 cursor-pointer ${
          !notification.read ? 'bg-[#F5EFE6] bg-opacity-30' : 'bg-white'
        }`}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={color} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className={`text-sm truncate ${!notification.read ? 'font-bold text-dark' : 'font-semibold text-dark'}`}>
                {notification.title}
              </p>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatTime(notification.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {notification.message}
            </p>

            {/* Action buttons (show on hover) */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleToggleRead(e, notification._id)}
                className="text-xs text-gray-500 hover:text-primary-dark flex items-center gap-1"
                title={notification.read ? 'Mark as unread' : 'Mark as read'}
              >
                <CheckCheck size={12} />
                {notification.read ? 'Unread' : 'Read'}
              </button>
              <button
                onClick={(e) => handleDelete(e, notification._id)}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                title="Delete notification"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>

          {/* Unread indicator */}
          {!notification.read && (
            <div className="w-2.5 h-2.5 bg-primary-dark rounded-full flex-shrink-0 mt-2"></div>
          )}
        </div>
      </div>
    );
  };

  // Render notification group
  const renderGroup = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
          {title} ({items.length})
        </h3>
        <div className="bg-white rounded-xl border border-[#F5EFE6] overflow-hidden">
          {items.map(renderNotification)}
        </div>
      </div>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'sale', label: 'Sales', icon: ShoppingCart },
    { key: 'low_stock', label: 'Low Stock', icon: AlertTriangle },
    { key: 'expense', label: 'Expenses', icon: Wallet },
    { key: 'report', label: 'Reports', icon: FileText }
  ];

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
              <Bell size={28} className="text-primary-dark" />
              All Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-primary-light hover:bg-primary text-primary-dark hover:text-dark font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <CheckCheck size={18} />
            Mark all read
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#F5EFE6] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-dark"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                  filter === key
                    ? 'bg-primary-dark text-white'
                    : 'bg-white text-gray-600 hover:bg-primary-light border border-[#F5EFE6]'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-[#F5EFE6] p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : totalNotifications === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-[#F5EFE6]">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <Bell size={40} className="text-primary-dark opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">No notifications yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              When something happens in your boutique, you'll see it here
            </p>
          </div>
        ) : (
          <>
            {/* Grouped Notifications */}
            {renderGroup('Today', notifications.today)}
            {renderGroup('Yesterday', notifications.yesterday)}
            {renderGroup('This Week', notifications.thisWeek)}
            {renderGroup('Older', notifications.older)}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-[#F5EFE6] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-[#F5EFE6] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Clear All Button */}
        {totalNotifications > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Trash2 size={18} />
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
