import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  LogOut,
  Clock,
  Shield,
  Bell,
  ShoppingCart,
  AlertTriangle,
  Wallet,
  FileText,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Activity,
  User,
  Key,
  Package,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions');
  
  // Session state
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Notification preferences state
  const [preferences, setPreferences] = useState({
    salesAlerts: true,
    lowStockAlerts: true,
    expenseAlerts: false,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
    emailNotifications: true,
    inAppNotifications: true
  });

  useEffect(() => {
    fetchSessions();
    fetchPreferences();
  }, []);

  const fetchSessions = async () => {
    try {
      // Mock sessions - in production, fetch from backend
      const mockSessions = [
        {
          id: '1',
          device: 'Chrome on Windows',
          browser: 'Chrome',
          os: 'Windows',
          location: 'Nairobi, Kenya',
          ip: '192.168.1.1',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          lastActivity: new Date().toISOString(),
          isActive: true,
          isCurrent: true,
          icon: Monitor
        },
        {
          id: '2',
          device: 'Safari on iPhone',
          browser: 'Safari',
          os: 'iOS',
          location: 'Nairobi, Kenya',
          ip: '192.168.1.2',
          startTime: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          isActive: true,
          isCurrent: false,
          icon: Smartphone
        }
      ];

      setSessions(mockSessions);
      setCurrentSession(mockSessions.find(s => s.isCurrent));

      // Mock recent activity
      const mockActivity = [
        { id: '1', action: 'Logged in', details: 'Chrome on Windows', timestamp: new Date(Date.now() - 3600000).toISOString(), icon: Monitor, type: 'login' },
        { id: '2', action: 'Password changed', details: 'Security update', timestamp: new Date(Date.now() - 259200000).toISOString(), icon: Key, type: 'security' },
        { id: '3', action: 'Profile updated', details: 'Email address changed', timestamp: new Date(Date.now() - 604800000).toISOString(), icon: User, type: 'profile' },
        { id: '4', action: 'Stock updated', details: 'Updated Black Trouser quantity', timestamp: new Date(Date.now() - 86400000).toISOString(), icon: Package, type: 'inventory' },
        { id: '5', action: 'Sale recorded', details: 'KSh 2,500 sale', timestamp: new Date(Date.now() - 172800000).toISOString(), icon: ShoppingCart, type: 'sale' }
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      // Mock preferences - in production, fetch from backend
      const mockPrefs = {
        salesAlerts: true,
        lowStockAlerts: true,
        expenseAlerts: false,
        dailyReports: false,
        weeklyReports: true,
        monthlyReports: true,
        emailNotifications: true,
        inAppNotifications: true
      };
      setPreferences(mockPrefs);
    } catch (error) {
      console.log('Failed to load preferences');
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    
    setSaving(true);
    try {
      // Mock save - in production, save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
      setPreferences(preferences); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      // Mock logout - in production, call backend API
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session terminated');
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to log out of all other sessions?')) return;
    
    try {
      // Mock logout all - in production, call backend API
      setSessions(sessions.filter(s => s.isCurrent));
      toast.success('All other sessions terminated');
    } catch (error) {
      toast.error('Failed to terminate sessions');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Settings</h1>
        <p className="text-gray-600">Manage your sessions and notification preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'sessions'
                ? 'border-primary text-primary-dark'
                : 'border-transparent text-gray-600 hover:text-dark'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={18} />
              <span>Active Sessions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'notifications'
                ? 'border-primary text-primary-dark'
                : 'border-transparent text-gray-600 hover:text-dark'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
          </button>
        </div>
      </div>

      {/* Active Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Current Session */}
          {currentSession && (
            <div className="card p-6 border-2 border-primary-light bg-primary-light/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary text-dark rounded-xl">
                    <currentSession.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark">Current Session</h3>
                    <p className="text-sm text-gray-600">{currentSession.device}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle size={12} />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-dark">{currentSession.location}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Started</p>
                  <p className="font-medium text-dark">{formatTimeAgo(currentSession.startTime)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Activity</p>
                  <p className="font-medium text-dark">{formatTimeAgo(currentSession.lastActivity)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">IP Address</p>
                  <p className="font-medium text-dark font-mono text-xs">{currentSession.ip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Sessions */}
          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark">Other Active Sessions</h3>
                <button
                  onClick={handleLogoutAllSessions}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>Log Out All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.filter(s => !s.isCurrent).map((session) => {
                  const Icon = session.icon || Monitor;
                  return (
                    <div
                      key={session.id}
                      className="card p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-primary group-hover:text-dark transition-colors">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-dark">{session.device}</p>
                            <p className="text-xs text-gray-600">{session.location}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          session.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {session.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={14} />
                          <span>Started {formatTimeAgo(session.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Activity size={14} />
                          <span>Last active {formatTimeAgo(session.lastActivity)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sessions.filter(s => !s.isCurrent).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <Shield size={48} className="mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-bold text-dark mb-2">No Other Active Sessions</h3>
              <p className="text-gray-600">You are only logged in on this device</p>
            </div>
          )}

          {/* Recent Activity Timeline */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary-dark" />
              Recent Activity
            </h3>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon || Activity;
                  const getIconColor = () => {
                    switch (activity.type) {
                      case 'login': return 'bg-blue-100 text-blue-600';
                      case 'security': return 'bg-red-100 text-red-600';
                      case 'profile': return 'bg-purple-100 text-purple-600';
                      case 'inventory': return 'bg-orange-100 text-orange-600';
                      case 'sale': return 'bg-green-100 text-green-600';
                      default: return 'bg-gray-100 text-gray-600';
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${getIconColor()}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">{formatTimeAgo(activity.timestamp)}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity size={48} className="mx-auto mb-2 opacity-30" />
                <p>No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          {/* Notification Preferences */}
          <div className="card p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-dark mb-2 flex items-center gap-2">
                <Bell size={20} className="text-primary-dark" />
                Notification Preferences
              </h3>
              <p className="text-gray-600">
                Choose which notifications you want to receive via email or in-app alerts
              </p>
            </div>

            <div className="space-y-4">
              {/* Sales Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Sales Alerts</p>
                    <p className="text-sm text-gray-600">Get notified for every sale</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('salesAlerts', !preferences.salesAlerts)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.salesAlerts ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.salesAlerts ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Low Stock Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Low Stock Alerts</p>
                    <p className="text-sm text-gray-600">Alert when items are running low</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('lowStockAlerts', !preferences.lowStockAlerts)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.lowStockAlerts ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.lowStockAlerts ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Expense Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Expense Alerts</p>
                    <p className="text-sm text-gray-600">High expense notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('expenseAlerts', !preferences.expenseAlerts)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.expenseAlerts ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.expenseAlerts ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Daily Reports */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Daily Reports</p>
                    <p className="text-sm text-gray-600">Email summary every day</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('dailyReports', !preferences.dailyReports)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.dailyReports ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.dailyReports ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Reports */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Weekly Reports</p>
                    <p className="text-sm text-gray-600">Weekly business summary</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('weeklyReports', !preferences.weeklyReports)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.weeklyReports ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.weeklyReports ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Monthly Reports */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Monthly Reports</p>
                    <p className="text-sm text-gray-600">Monthly comprehensive report</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('monthlyReports', !preferences.monthlyReports)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.monthlyReports ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.monthlyReports ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-6">Notification Channels</h3>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.emailNotifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.emailNotifications ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* In-App Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">In-App Notifications</p>
                    <p className="text-sm text-gray-600">Show notifications in the app</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('inAppNotifications', !preferences.inAppNotifications)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    preferences.inAppNotifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      preferences.inAppNotifications ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {saving && (
            <div className="flex items-center justify-center gap-2 p-4 bg-primary-light rounded-xl">
              <Loader2 size={20} className="animate-spin text-dark" />
              <span className="text-dark font-medium">Saving preferences...</span>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
