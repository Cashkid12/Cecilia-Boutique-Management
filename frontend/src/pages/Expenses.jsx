import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { expenseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  Receipt,
  Download,
  ShoppingCart,
  Package,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
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

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    amount: '',
    paymentMethod: 'Cash',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Rent', 'Salary', 'Electricity', 'Transport', 'Packaging', 'Supplies', 'Maintenance', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await expenseAPI.update(editingExpense._id, formData);
        toast.success('Expense updated successfully');
      } else {
        await expenseAPI.create(formData);
        toast.success('Expense recorded successfully');
      }
      fetchExpenses();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      description: expense.description || '',
      date: new Date(expense.expenseDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        toast.success('Expense deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Other',
      amount: '',
      paymentMethod: 'Cash',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(e => new Date(e.expenseDate).toDateString() === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(e => new Date(e.expenseDate) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(e => new Date(e.expenseDate) >= monthAgo);
    }

    if (categoryFilter) {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.addedBy?.name && e.addedBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  };

  const filteredExpenses = getFilteredExpenses();

  const todayExpenses = expenses.filter(e => 
    new Date(e.expenseDate).toDateString() === new Date().toDateString()
  );
  const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyExpenses = expenses.filter(e => new Date(e.expenseDate) >= weekAgo);
  const totalWeek = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthlyExpenses = expenses.filter(e => new Date(e.expenseDate) >= monthAgo);
  const totalMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown = categories.map(cat => ({
    category: cat,
    amount: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const highestCategory = categoryBreakdown[0]?.category || 'N/A';

  const categoryChartData = categoryBreakdown.map(c => ({
    name: c.category,
    value: c.amount,
    color: ['#D6C2A1', '#B89B72', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'][categories.indexOf(c.category)]
  }));

  const monthlyTrendData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayTotal = expenses
      .filter(e => new Date(e.expenseDate).toDateString() === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    
    if (dayTotal > 0) {
      monthlyTrendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayTotal
      });
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Expenses">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Expenses Management">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Expenses Management</h1>
            <p className="text-gray-600">Track all business costs and operational spending</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          title="Today"
          value={`KSh ${totalToday.toLocaleString()}`}
          subtitle="Daily expenses"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="This Week"
          value={`KSh ${totalWeek.toLocaleString()}`}
          subtitle="7 days total"
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={DollarSign}
          title="This Month"
          value={`KSh ${totalMonth.toLocaleString()}`}
          subtitle="30 days total"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={Receipt}
          title="Top Category"
          value={highestCategory}
          subtitle={`KSh ${categoryBreakdown[0]?.amount.toLocaleString() || 0}`}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Monthly Expense Trend</h3>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="amount" stroke="#B89B72" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-2 opacity-30" />
              <p>No expense data</p>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Category Breakdown</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Receipt size={48} className="mx-auto mb-2 opacity-30" />
              <p>No category data</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Summary Cards */}
      {categoryBreakdown.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categoryBreakdown.slice(0, 8).map((cat, index) => (
            <div key={cat.category} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: categoryChartData[index]?.color || '#D6C2A1' }}>
                  {cat.category.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{cat.category}</p>
                  <p className="text-lg font-bold text-dark">KSh {cat.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Added By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-dark">{expense.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary-light text-primary-dark font-medium">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">
                    KSh {expense.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{expense.paymentMethod}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {expense.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {expense.addedBy?.name || expense.addedBy || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 hover:bg-primary-light rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} className="text-primary-dark" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
            <p>No expenses found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <Receipt size={24} className="text-primary-dark" />
                {editingExpense ? 'Edit Expense' : 'Record New Expense'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Expense Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Office supplies"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Amount (KSh)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="M-Pesa">📱 M-Pesa</option>
                    <option value="Card">💳 Card</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Zap size={18} />
                  {editingExpense ? 'Update' : 'Record'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Expenses;
