import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { workersAPI, salesAPI } from '../utils/api';
import {
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  TrendingUp,
  Star,
  UserMinus,
  Edit,
  Key,
  Eye,
  Trash2,
  X,
  Download,
  Clock,
  Activity,
  Shield,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  AlertTriangle,
  Calendar,
  BarChart3,
  ShoppingBag
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-dark">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [workerPerformance, setWorkerPerformance] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({ totalSales: 0, activeToday: 0 });
  const [recentSales, setRecentSales] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'employee',
    isActive: true
  });

  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await workersAPI.getAll();
      setWorkers(response.data);
      
      // Fetch performance for each worker
      const performanceData = {};
      let totalMonthlySales = 0;
      let activeTodayCount = 0;
      
      for (const worker of response.data) {
        try {
          const perfRes = await workersAPI.getPerformance(worker._id);
          performanceData[worker._id] = perfRes.data;
          
          // Count workers active today (recorded sales)
          if (perfRes.data?.today?.count > 0) {
            activeTodayCount++;
          }
          
          // Add to monthly total
          totalMonthlySales += perfRes.data?.monthly?.totalSales || 0;
        } catch (error) {
          performanceData[worker._id] = null;
        }
      }
      
      setWorkerPerformance(performanceData);
      setMonthlyStats({
        totalSales: totalMonthlySales,
        activeToday: activeTodayCount
      });
    } catch (error) {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Full Name validation
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Password validation (only for new workers)
    if (!editingWorker) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setSubmitting(true);

    try {
      if (editingWorker) {
        // Update existing worker
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.isActive
        };

        // Only include password if provided
        if (formData.password) {
          if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            setSubmitting(false);
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            setSubmitting(false);
            return;
          }
          updateData.password = formData.password;
        }

        await workersAPI.update(editingWorker._id, updateData);
        toast.success('Worker updated successfully');
      } else {
        // Create new worker
        await workersAPI.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
          isActive: formData.isActive
        });
        toast.success('Worker added successfully');
      }
      
      fetchWorkers();
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      
      // Handle specific error cases
      if (errorMessage.includes('email') || errorMessage.includes('exists')) {
        setFormErrors({ email: 'Email already registered' });
        toast.error('Email already registered');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      email: worker.email,
      password: '',
      confirmPassword: '',
      phone: worker.phone || '',
      role: worker.role,
      isActive: worker.isActive
    });
    setShowModal(true);
  };

  const handleDeleteClick = (worker) => {
    setWorkerToDelete(worker);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workerToDelete) return;

    setDeleting(true);
    try {
      await workersAPI.delete(workerToDelete._id);
      toast.success('Worker deleted successfully');
      setShowDeleteModal(false);
      setWorkerToDelete(null);
      fetchWorkers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove worker';
      
      if (errorMessage.includes('sales today')) {
        toast.error('Cannot delete worker with sales today');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const { authAPI } = await import('../utils/api');
      await authAPI.resetPassword(selectedWorker._id, { newPassword });
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleToggleStatus = async (worker) => {
    try {
      await workersAPI.update(worker._id, { isActive: !worker.isActive });
      toast.success(`Worker ${worker.isActive ? 'deactivated' : 'activated'}`);
      fetchWorkers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWorker(null);
    setFormErrors({});
    setSubmitting(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'employee',
      isActive: true
    });
  };

  const viewProfile = async (worker) => {
    setSelectedWorker(worker);
    try {
      const perfRes = await workersAPI.getPerformance(worker._id);
      
      // Fetch recent sales for this worker
      try {
        const { salesAPI } = await import('../utils/api');
        const salesRes = await salesAPI.getAll({ 
          worker: worker._id,
          limit: 10 
        });
        setRecentSales(salesRes.data || []);
      } catch (error) {
        setRecentSales([]);
      }
      
      setSelectedWorker({ ...worker, performance: perfRes.data });
      setShowProfileModal(true);
    } catch (error) {
      setSelectedWorker(worker);
      setRecentSales([]);
      setShowProfileModal(true);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (worker.phone && worker.phone.includes(searchTerm));
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && worker.isActive) ||
      (statusFilter === 'inactive' && !worker.isActive);
    const matchesRole = !roleFilter || worker.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.isActive).length;
  const inactiveWorkers = workers.filter(w => !w.isActive).length;
  
  const totalSalesToday = Object.values(workerPerformance).reduce((sum, perf) => {
    return sum + (perf?.today?.totalSales || 0);
  }, 0);

  const topPerformer = workers.reduce((top, worker) => {
    const perf = workerPerformance[worker._id];
    const sales = perf?.today?.totalSales || 0;
    if (!top || sales > top.sales) {
      return { name: worker.name, sales };
    }
    return top;
  }, null);

  const getStatusBadge = (worker) => {
    if (!worker.isActive) {
      return <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">Inactive</span>;
    }
    return <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">Active</span>;
  };

  const getPerformanceChart = (workerId) => {
    const perf = workerPerformance[workerId];
    if (!perf) return [];

    return [
      { name: 'Today', sales: perf.today?.totalSales || 0 },
      { name: 'Weekly', sales: perf.weekly?.totalSales || 0 },
      { name: 'All Time', sales: perf.allTime?.totalSales || 0 }
    ];
  };

  if (loading) {
    return (
      <DashboardLayout title="Workers">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading workers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Workers Management">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Workers Management</h1>
            <p className="text-gray-600">Manage employees, accounts, roles, and performance</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Workers"
          value={totalWorkers}
          subtitle="All employees"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={UserCheck}
          title="Active Today"
          value={monthlyStats.activeToday}
          subtitle="Recorded sales today"
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Sales This Month"
          value={`KSh ${monthlyStats.totalSales.toLocaleString()}`}
          subtitle="All workers combined"
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredWorkers.map((worker) => {
          const perf = workerPerformance[worker._id];
          const todaySales = perf?.today?.totalSales || 0;
          const todayCount = perf?.today?.count || 0;
          
          return (
            <div
              key={worker._id}
              className="bg-white rounded-2xl border border-[#F5EFE6] p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Avatar and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-2xl">
                  {worker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    worker.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {worker.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Worker Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-dark mb-1">{worker.name}</h3>
                <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mb-2">
                  <Briefcase size={14} />
                  {worker.role === 'employee' ? 'Sales Assistant' : worker.role}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{worker.email}</span>
                </div>
                {worker.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                    <Phone size={14} className="text-gray-400" />
                    <span>{worker.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats Box */}
              <div className="bg-[#F5EFE6] rounded-xl p-3 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today</span>
                    <span className="font-semibold text-dark">
                      {todayCount} sale{todayCount !== 1 ? 's' : ''} • KSh {todaySales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-dark">
                      {perf?.monthly?.count || 0} sales • KSh {(perf?.monthly?.totalSales || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => viewProfile(worker)}
                  className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  title="View Profile"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">View</span>
                </button>
                <button
                  onClick={() => handleEdit(worker)}
                  className="flex-1 py-2 px-3 bg-primary hover:bg-primary-dark text-dark rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  title="Edit"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(worker)}
                  className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  title="Delete"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#F5EFE6]">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-dark mb-2">No workers found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter || roleFilter
              ? 'Try adjusting your filters'
              : 'Add your first worker to get started'}
          </p>
        </div>
      )}

      {/* Performance Overview */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
          <Activity size={24} className="text-primary-dark" />
          Performance Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.filter(w => w.isActive).map((worker) => {
            const perf = workerPerformance[worker._id];
            const chartData = getPerformanceChart(worker._id);
            
            return (
              <div key={worker._id} className="p-6 bg-primary-light rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-lg">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark">{worker.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{worker.role}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today</span>
                    <span className="font-semibold text-dark">
                      KSh {perf?.today?.totalSales?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold text-dark">
                      KSh {perf?.weekly?.totalSales?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Sold</span>
                    <span className="font-semibold text-dark">{perf?.allTime?.totalItems || 0}</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#D6C2A1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                {editingWorker ? <Edit size={24} /> : <Plus size={24} />}
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`input-field ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="John Mwangi"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`input-field ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`input-field ${formErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="+254 712 345 678"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="employee">Sales Assistant</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Password {!editingWorker && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`input-field ${formErrors.password ? 'border-red-500' : ''}`}
                    placeholder={editingWorker ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors.password}
                    </p>
                  )}
                  {!editingWorker && (
                    <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Confirm Password {!editingWorker && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`input-field ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Re-enter password"
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Toggle (Only for new workers) */}
              {!editingWorker && (
                <div>
                  <label className="block text-sm font-medium text-dark mb-3">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive === true}
                        onChange={() => setFormData({ ...formData, isActive: true })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-dark">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive === false}
                        onChange={() => setFormData({ ...formData, isActive: false })}
                        className="w-4 h-4 text-gray-600"
                      />
                      <span className="text-sm text-dark">Inactive</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>{editingWorker ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      {editingWorker ? <Edit size={18} /> : <Plus size={18} />}
                      <span>{editingWorker ? 'Save Changes' : 'Add Worker'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Profile Modal */}
      {showProfileModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <Eye size={24} className="text-blue-600" />
                Worker Profile
              </h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="p-6 bg-primary-light rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-3xl">
                    {selectedWorker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dark mb-1">{selectedWorker.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1 mb-2">
                      <Mail size={14} />
                      {selectedWorker.email}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 text-xs rounded-full bg-primary text-dark font-medium capitalize flex items-center gap-1">
                        <Briefcase size={12} />
                        {selectedWorker.role === 'employee' ? 'Sales Assistant' : selectedWorker.role}
                      </span>
                      {getStatusBadge(selectedWorker)}
                      {selectedWorker.phone && (
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium flex items-center gap-1">
                          <Phone size={12} />
                          {selectedWorker.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              {selectedWorker.performance && (
                <div>
                  <h4 className="font-bold text-dark mb-4 flex items-center gap-2 text-lg">
                    <BarChart3 size={20} className="text-primary-dark" />
                    Performance Analytics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Today */}
                    <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-green-600" />
                        <p className="text-sm text-gray-600 font-medium">Today</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-1">
                        KSh {selectedWorker.performance.today?.totalSales?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedWorker.performance.today?.count || 0} sales • {selectedWorker.performance.today?.totalItems || 0} items
                      </p>
                    </div>

                    {/* This Week */}
                    <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-blue-600" />
                        <p className="text-sm text-gray-600 font-medium">This Week</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        KSh {selectedWorker.performance.weekly?.totalSales?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedWorker.performance.weekly?.count || 0} sales • {selectedWorker.performance.weekly?.totalItems || 0} items
                      </p>
                    </div>

                    {/* This Month */}
                    <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-purple-600" />
                        <p className="text-sm text-gray-600 font-medium">This Month</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 mb-1">
                        KSh {selectedWorker.performance.monthly?.totalSales?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedWorker.performance.monthly?.count || 0} sales • {selectedWorker.performance.monthly?.totalItems || 0} items
                      </p>
                    </div>

                    {/* All Time */}
                    <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-orange-600" />
                        <p className="text-sm text-gray-600 font-medium">All Time</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 mb-1">
                        KSh {selectedWorker.performance.allTime?.totalSales?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedWorker.performance.allTime?.count || 0} sales • {selectedWorker.performance.allTime?.totalItems || 0} items
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Sales */}
              <div>
                <h4 className="font-bold text-dark mb-4 flex items-center gap-2 text-lg">
                  <ShoppingBag size={20} className="text-primary-dark" />
                  Recent Sales (Last 10)
                </h4>
                {recentSales.length > 0 ? (
                  <div className="bg-white rounded-xl border border-[#F5EFE6] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-primary-light">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentSales.map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 text-sm text-dark font-medium">
                                {sale.items?.length || 0} items
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-dark">
                                KSh {sale.totalAmount?.toLocaleString() || 0}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium capitalize">
                                  {sale.paymentMethod || 'cash'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No sales recorded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Sales will appear here once this worker starts selling</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleEdit(selectedWorker);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit Worker
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedWorker(selectedWorker);
                    setShowResetModal(true);
                  }}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <Key size={18} />
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-dark mb-2">Reset Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Reset password for <span className="font-medium">{selectedWorker.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setNewPassword('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleResetPassword} className="btn-primary">
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && workerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <AlertTriangle size={24} className="text-red-500" />
                Delete Worker
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWorkerToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-lg">
                    {workerToDelete.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark">{workerToDelete.name}</h3>
                    <p className="text-sm text-gray-600">{workerToDelete.email}</p>
                  </div>
                </div>
              </div>

              <p className="text-dark font-medium mb-2">
                Are you sure you want to delete {workerToDelete.name}?
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span>This action cannot be undone.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Past sales records will be preserved.</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWorkerToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {deleting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Delete Worker</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Workers;
