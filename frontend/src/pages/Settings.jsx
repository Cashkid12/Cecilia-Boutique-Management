import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../utils/api';
import {
  User,
  Camera,
  Store,
  Shield,
  Bell,
  Palette,
  Save,
  Edit,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  LogOut,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    shopName: 'Cecilia Boutique'
  });

  const [shopSettings, setShopSettings] = useState({
    shopName: 'Cecilia Boutique',
    location: '',
    businessPhone: '',
    currency: 'KSh',
    timezone: 'Africa/Nairobi'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    salesAlerts: true,
    lowStockAlerts: true,
    expenseAlerts: false,
    dailyReports: true
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(profile);
      updateUser(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password change endpoint
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated');
  };

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
    toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'shop', label: 'Shop', icon: Store },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'theme', label: 'Theme', icon: Palette }
  ];

  return (
    <DashboardLayout title="Settings & Profile">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Settings & Profile</h1>
        <p className="text-gray-600">Manage account, shop details, and security</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-dark'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-5xl mx-auto">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary-dark text-white rounded-full hover:bg-dark transition-colors">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-dark mb-1">{profile.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{profile.email}</p>
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-primary-light text-primary-dark font-medium capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-dark">Personal Information</h3>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Shop Name</label>
                    <div className="relative">
                      <Store size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.shopName}
                        onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Shop Settings Tab */}
      {activeTab === 'shop' && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Shop Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Shop Name</label>
                <div className="relative">
                  <Store size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={shopSettings.shopName}
                    onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Business Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={shopSettings.businessPhone}
                    onChange={(e) => setShopSettings({ ...shopSettings, businessPhone: e.target.value })}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark mb-2">Shop Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    value={shopSettings.location}
                    onChange={(e) => setShopSettings({ ...shopSettings, location: e.target.value })}
                    className="input-field pl-10"
                    rows="3"
                    placeholder="Enter shop address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Currency</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={shopSettings.currency}
                    onChange={(e) => setShopSettings({ ...shopSettings, currency: e.target.value })}
                    className="input-field pl-10"
                  >
                    <option value="KSh">KSh - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Timezone</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={shopSettings.timezone}
                    onChange={(e) => setShopSettings({ ...shopSettings, timezone: e.target.value })}
                    className="input-field pl-10"
                  >
                    <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button className="btn-primary flex items-center gap-2">
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <Shield size={24} className="text-primary-dark" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Monitor size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-dark">Current Session</p>
                      <p className="text-xs text-gray-600">Started 2 hours ago</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="text-dark">Logged in from Chrome</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <p className="text-dark">Password changed</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <p className="text-dark">Profile updated</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-dark">Sales Alerts</p>
                  <p className="text-sm text-gray-600">Get notified for every sale</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('salesAlerts')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications.salesAlerts ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  notifications.salesAlerts ? 'left-7' : 'left-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Bell size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-dark">Low Stock Alerts</p>
                  <p className="text-sm text-gray-600">Alert when items are low</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('lowStockAlerts')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications.lowStockAlerts ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  notifications.lowStockAlerts ? 'left-7' : 'left-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <DollarSign size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-dark">Expense Alerts</p>
                  <p className="text-sm text-gray-600">High expense notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('expenseAlerts')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications.expenseAlerts ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  notifications.expenseAlerts ? 'left-7' : 'left-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-dark">Daily Reports</p>
                  <p className="text-sm text-gray-600">Email summary every day</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('dailyReports')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications.dailyReports ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  notifications.dailyReports ? 'left-7' : 'left-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Appearance Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                theme === 'light' ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <Sun size={32} className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-bold text-dark">Light Mode</p>
                  <p className="text-xs text-gray-600">Clean and bright</p>
                </div>
                {theme === 'light' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                theme === 'dark' ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-dark rounded-xl shadow-sm">
                  <Moon size={32} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-dark">Dark Mode</p>
                  <p className="text-xs text-gray-600">Easy on the eyes</p>
                </div>
                {theme === 'dark' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => handleThemeChange('beige')}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                theme === 'beige' ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-primary rounded-xl shadow-sm">
                  <Palette size={32} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-dark">Beige Accent</p>
                  <p className="text-xs text-gray-600">Warm boutique feel</p>
                </div>
                {theme === 'beige' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
