import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
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
  Loader2,
  Camera,
  Store,
  Phone,
  Palette,
  Moon,
  Sun,
  Info,
  Settings as SettingsIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const { isInstalled, isIOS, handleInstall } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Profile state
  const [profile, setProfile] = useState({
    shopOwnerName: user?.name || '',
    shopName: 'Cecilia Boutique',
    email: user?.email || '',
    phone: '',
    logo: null
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Session state
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [activities, setActivities] = useState([]);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    salesAlerts: true,
    lowStockAlerts: true,
    expenseAlerts: true,
    dailyReport: false,
    weeklyReport: false,
    monthlyReport: false,
    emailNotifications: true,
    inAppNotifications: true
  });

  // Theme state
  const [theme, setTheme] = useState({
    darkMode: false,
    primaryColor: '#D6C2A1',
    accentColor: '#B89B72'
  });

  // Lazy load data based on active tab
  useEffect(() => {
    switch(activeTab) {
      case 'general':
        fetchProfile();
        break;
      case 'sessions':
        fetchSessions();
        fetchActivities();
        break;
      case 'notifications':
        fetchNotificationPreferences();
        break;
      case 'appearance':
        fetchTheme();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // Data fetching functions
  const fetchProfile = async () => {
    try {
      // TODO: GET /api/settings/profile
      // const response = await api.get('/settings/profile');
      // setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      // TODO: GET /api/settings/sessions
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
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      // TODO: GET /api/settings/activity
      // Mock recent activity - in production, fetch from backend
      const mockActivity = [
        { id: '1', action: 'Logged in', details: 'Chrome on Windows', timestamp: new Date(Date.now() - 3600000).toISOString(), icon: Monitor, type: 'login' },
        { id: '2', action: 'Password changed', details: 'Security update', timestamp: new Date(Date.now() - 259200000).toISOString(), icon: Key, type: 'security' },
        { id: '3', action: 'Profile updated', details: 'Email address changed', timestamp: new Date(Date.now() - 604800000).toISOString(), icon: User, type: 'profile' },
        { id: '4', action: 'Stock updated', details: 'Updated Black Trouser quantity', timestamp: new Date(Date.now() - 86400000).toISOString(), icon: Package, type: 'inventory' },
        { id: '5', action: 'Sale recorded', details: 'KSh 2,500 sale', timestamp: new Date(Date.now() - 172800000).toISOString(), icon: ShoppingCart, type: 'sale' }
      ];

      setActivities(mockActivity);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      // TODO: GET /api/settings/notifications
      // Mock preferences - in production, fetch from backend
      const mockPrefs = {
        salesAlerts: true,
        lowStockAlerts: true,
        expenseAlerts: true,
        dailyReport: false,
        weeklyReport: false,
        monthlyReport: false,
        emailNotifications: true,
        inAppNotifications: true
      };
      setNotifications(mockPrefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const fetchTheme = async () => {
    try {
      // TODO: GET /api/settings/theme
      // Load from localStorage or backend
      const savedTheme = localStorage.getItem('themeSettings');
      if (savedTheme) {
        setTheme(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  // Handler functions
  const handlePreferenceChange = async (key, value) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);
    
    setSaving(true);
    try {
      // TODO: PUT /api/settings/notifications
      // await api.put('/settings/notifications', updatedNotifications);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
      setNotifications(notifications); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      // TODO: DELETE /api/settings/sessions/:id
      // await api.delete(`/settings/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session terminated');
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to log out of all other sessions?')) return;
    
    try {
      // TODO: POST /api/settings/sessions/logout-all
      // await api.post('/settings/sessions/logout-all');
      setSessions(sessions.filter(s => s.isCurrent));
      toast.success('All other sessions terminated');
    } catch (error) {
      toast.error('Failed to terminate sessions');
    }
  };

  const handleProfileSave = async () => {
    // Validation
    if (!profile.shopOwnerName || profile.shopOwnerName.trim().length < 2) {
      toast.error('Shop owner name must be at least 2 characters');
      return;
    }

    if (!profile.shopName || profile.shopName.trim().length < 2) {
      toast.error('Shop name must be at least 2 characters');
      return;
    }

    if (!profile.email) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      toast.error('Invalid email format');
      return;
    }

    if (profile.phone && profile.phone.trim()) {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(profile.phone.trim())) {
        toast.error('Invalid phone number format');
        return;
      }
    }

    setSaving(true);
    try {
      // TODO: PUT /api/settings/profile
      // await api.put('/settings/profile', profile);
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      // TODO: PUT /api/settings/password
      // await api.put('/settings/password', { password: passwordForm.newPassword });
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PNG, JPG, and JPEG formats are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logo: reader.result });
        toast.success('Logo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-13 h-7 rounded-full transition-colors ${
        enabled ? 'bg-[#D6C2A1]' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

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
        <div className="flex items-start gap-4 mb-2">
          <div className="p-3 bg-primary/20 rounded-xl">
            <SettingsIcon size={28} className="text-primary-dark" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your shop, account, and preferences</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 animate-fade-in">
        <div className="border-b border-gray-200">
          <nav className="flex gap-0 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User size={18} />
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield size={18} />
              <span>Sessions</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Palette size={18} />
              <span>Appearance</span>
            </button>
          </nav>
        </div>
      </div>

      {/* General Tab - Profile & Shop Info */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile & Shop Information */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <User size={20} className="text-primary-dark" />
              Profile & Shop Information
            </h3>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary-light" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-primary-light flex items-center justify-center border-2 border-dashed border-primary">
                      <Store size={32} className="text-primary-dark" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-primary text-dark rounded-xl cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark">Shop Logo</p>
                  <p className="text-sm text-gray-600">Upload your shop logo (max 2MB, PNG/JPG)</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Shop Owner Name *</label>
                  <input
                    type="text"
                    value={profile.shopOwnerName}
                    onChange={(e) => setProfile({ ...profile, shopOwnerName: e.target.value })}
                    className="input-field"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Shop Name *</label>
                  <input
                    type="text"
                    value={profile.shopName}
                    onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                    className="input-field"
                    placeholder="Enter shop name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="input-field"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="input-field pl-10"
                      placeholder="+254 712 345 678"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <Key size={20} className="text-primary-dark" />
              Change Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Current Password *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-field"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">New Password *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input-field"
                  placeholder="Enter new password"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                <span>{saving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Current Session */}
          {currentSession && (
            <div>
              <h3 className="text-lg font-bold text-dark mb-3">CURRENT SESSION (This Device)</h3>
              <div className="bg-white border border-primary-light/50 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 text-primary-dark rounded-xl">
                      <currentSession.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-dark">{currentSession.device}</h4>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📍</span>
                    <span>{currentSession.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🌐</span>
                    <span className="font-mono text-xs">IP: {currentSession.ip}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🕐</span>
                    <span>Started: {formatDateTime(currentSession.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>⏱️</span>
                    <span>Last active: {formatTimeAgo(currentSession.lastActivity)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Sessions */}
          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">OTHER ACTIVE SESSIONS</h3>
              </div>

              <div className="bg-white border border-primary-light/50 rounded-2xl p-5 space-y-4">
                {sessions.filter(s => !s.isCurrent).map((session, index) => {
                  const Icon = session.icon || Monitor;
                  return (
                    <div key={session.id}>
                      {index > 0 && <div className="border-t border-gray-200 my-4"></div>}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-dark">{session.device}</p>
                            <p className="text-xs text-gray-600">📍 {session.location}</p>
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

                      <div className="space-y-1 text-sm mb-3 ml-11">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🕐</span>
                          <span>Started: {formatDateTime(session.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>⏱️</span>
                          <span>Last active: {formatTimeAgo(session.lastActivity)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="ml-11 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Log Out All Devices Button */}
              <div className="mt-4">
                <button
                  onClick={handleLogoutAllSessions}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-md"
                >
                  <LogOut size={18} />
                  <span>Log Out All Devices</span>
                </button>
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
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">RECENT ACTIVITY</h3>
            <div className="bg-white border border-primary-light/50 rounded-2xl p-5">
              {activities.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {activities.map((activity) => {
                    const getIconEmoji = () => {
                      switch (activity.type) {
                        case 'login': return '🔑';
                        case 'security': return '🔐';
                        case 'profile': return '✏️';
                        case 'inventory': return '📦';
                        case 'sale': return '💰';
                        default: return '📊';
                      }
                    };

                    return (
                      <div
                        key={activity.id}
                        className="py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getIconEmoji()}</span>
                          <div className="flex-1">
                            <p className="font-medium text-dark">{activity.action}</p>
                            {activity.details && (
                              <p className="text-sm text-gray-600 mt-0.5">{activity.details}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
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
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          {/* Alert Preferences */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">ALERT PREFERENCES</h3>
            <div className="bg-white border border-primary-light/50 rounded-2xl p-5">
              <div className="space-y-5">
                {/* Sales Alerts */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg mt-0.5">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Sales Alerts</p>
                      <p className="text-sm text-gray-600 mt-0.5">Get notified when a sale is recorded</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.salesAlerts}
                    onToggle={() => handlePreferenceChange('salesAlerts', !notifications.salesAlerts)}
                  />
                </div>

                {/* Low Stock Alerts */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mt-0.5">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Low Stock Alerts</p>
                      <p className="text-sm text-gray-600 mt-0.5">Get notified when items run low</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.lowStockAlerts}
                    onToggle={() => handlePreferenceChange('lowStockAlerts', !notifications.lowStockAlerts)}
                  />
                </div>

                {/* Expense Alerts */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg mt-0.5">
                      <Wallet size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Expense Alerts</p>
                      <p className="text-sm text-gray-600 mt-0.5">Get notified when expenses are added</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.expenseAlerts}
                    onToggle={() => handlePreferenceChange('expenseAlerts', !notifications.expenseAlerts)}
                  />
                </div>

                {/* Daily Report */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Daily Report</p>
                      <p className="text-sm text-gray-600 mt-0.5">Receive end-of-day summary</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.dailyReport}
                    onToggle={() => handlePreferenceChange('dailyReport', !notifications.dailyReport)}
                  />
                </div>

                {/* Weekly Report */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mt-0.5">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Weekly Report</p>
                      <p className="text-sm text-gray-600 mt-0.5">Receive weekly performance summary</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.weeklyReport}
                    onToggle={() => handlePreferenceChange('weeklyReport', !notifications.weeklyReport)}
                  />
                </div>

                {/* Monthly Report */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mt-0.5">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Monthly Report</p>
                      <p className="text-sm text-gray-600 mt-0.5">Receive monthly analytics report</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.monthlyReport}
                    onToggle={() => handlePreferenceChange('monthlyReport', !notifications.monthlyReport)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">NOTIFICATION CHANNELS</h3>
            <div className="bg-white border border-primary-light/50 rounded-2xl p-5">
              <div className="space-y-5">
                {/* Email Notifications */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-0.5">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">Email Notifications</p>
                      <p className="text-sm text-gray-600 mt-0.5">Receive alerts via email</p>
                      <p className="text-xs text-gray-500 mt-1">Sending to: {profile.email}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.emailNotifications}
                    onToggle={() => handlePreferenceChange('emailNotifications', !notifications.emailNotifications)}
                  />
                </div>

                {/* In-App Notifications */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg mt-0.5">
                      <Bell size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">In-App Notifications</p>
                      <p className="text-sm text-gray-600 mt-0.5">Show notifications inside the app</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.inAppNotifications}
                    onToggle={() => handlePreferenceChange('inAppNotifications', !notifications.inAppNotifications)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Preferences Button */}
          <button
            onClick={() => toast.success('Preferences saved successfully')}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">THEME SETTINGS</h3>
            <div className="bg-white border border-primary-light/50 rounded-2xl p-5">
              <div className="space-y-5">
                {/* Dark Mode Toggle */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-dark">Dark Mode</p>
                    <p className="text-sm text-gray-600 mt-0.5">Switch between light and dark theme</p>
                  </div>
                  <ToggleSwitch
                    enabled={theme.darkMode}
                    onToggle={() => setTheme({ ...theme, darkMode: !theme.darkMode })}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Primary Color */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark">Primary Color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <span className="text-sm font-mono text-gray-600 w-20">{theme.primaryColor}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Presets:</p>
                  <div className="flex gap-2">
                    {[
                      { color: '#D6C2A1', name: 'Beige' },
                      { color: '#B89B72', name: 'Brown' },
                      { color: '#8B7355', name: 'Taupe' },
                      { color: '#D4A574', name: 'Gold' },
                      { color: '#F5EFE6', name: 'Cream' }
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => setTheme({ ...theme, primaryColor: color })}
                        className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                          theme.primaryColor === color
                            ? 'border-[#D6C2A1] scale-105'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        title={name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {['Beige', 'Brown', 'Taupe', 'Gold', 'Cream'].map((name) => (
                      <span key={name} className="w-10 text-xs text-center text-gray-500">{name}</span>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Accent Color */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark">Accent Color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <span className="text-sm font-mono text-gray-600 w-20">{theme.accentColor}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Presets:</p>
                  <div className="flex gap-2">
                    {[
                      { color: '#B89B72', name: 'Brown' },
                      { color: '#D6C2A1', name: 'Beige' },
                      { color: '#DEB887', name: 'Peach' },
                      { color: '#E8C39E', name: 'Sand' },
                      { color: '#CD853F', name: 'Copper' }
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => setTheme({ ...theme, accentColor: color })}
                        className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                          theme.accentColor === color
                            ? 'border-[#D6C2A1] scale-105'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        title={name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {['Brown', 'Beige', 'Peach', 'Sand', 'Copper'].map((name) => (
                      <span key={name} className="w-10 text-xs text-center text-gray-500">{name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">LIVE PREVIEW</h3>
            <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: theme.accentColor }}>
              <div className="space-y-4">
                {/* Buttons Row */}
                <div className="flex flex-wrap gap-3">
                  {/* Primary Button */}
                  <button
                    className="px-5 py-2.5 rounded-xl transition-all font-medium"
                    style={{ backgroundColor: theme.primaryColor, color: '#2E2E2E' }}
                  >
                    Primary Button
                  </button>

                  {/* Badge */}
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${theme.primaryColor}33`,
                      color: theme.primaryColor
                    }}
                  >
                    Badge
                  </span>

                  {/* Outline Button */}
                  <button
                    className="px-5 py-2.5 rounded-xl transition-all font-medium border-2"
                    style={{
                      borderColor: theme.primaryColor,
                      color: theme.primaryColor
                    }}
                  >
                    Outline Button
                  </button>
                </div>

                {/* Sample Card */}
                <div
                  className="p-4 rounded-xl border-2"
                  style={{
                    borderColor: theme.accentColor,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <p className="text-sm text-gray-700">
                    This is a sample card with current theme colors. It updates as you change colors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTheme({
                  darkMode: false,
                  primaryColor: '#D6C2A1',
                  accentColor: '#B89B72'
                });
                toast.success('Theme reset to default');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              Reset
            </button>
            <button
              onClick={() => {
                localStorage.setItem('themeSettings', JSON.stringify(theme));
                toast.success('Theme saved successfully');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md"
            >
              <Save size={18} />
              <span>Save Theme</span>
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
