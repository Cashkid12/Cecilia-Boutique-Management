import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { salesAPI, inventoryAPI, dashboardAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useRealTimeData';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Star,
  Plus,
  Eye,
  Clock,
  User,
  Calendar,
  Wallet,
  Smartphone,
  CreditCard,
  Hash
} from 'lucide-react';
import {
  LineChart,
  Line,
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

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [mySales, setMySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time dashboard data with auto-refresh
  const { data: dashboardData } = useDashboardData(
    () => dashboardAPI.getAll()
  );

  const [saleForm, setSaleForm] = useState({
    item: '',
    quantity: 1,
    customerName: '',
    paymentMethod: 'Cash',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Auto-update from real-time dashboard data
  useEffect(() => {
    if (dashboardData) {
      setMySales(dashboardData.recentSales || []);
    }
  }, [dashboardData]);

  const fetchData = async () => {
    try {
      const [salesRes, inventoryRes] = await Promise.all([
        salesAPI.getAll(),
        inventoryAPI.getAll()
      ]);

      // Filter only sales made by this employee
      const employeeSales = salesRes.data.filter(sale => sale.worker === user._id);
      setMySales(employeeSales);
      setInventory(inventoryRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    
    if (!saleForm.item) {
      toast.error('Please select an item');
      return;
    }

    const selectedItem = inventory.find(i => i._id === saleForm.item);
    if (saleForm.quantity > selectedItem.quantity) {
      toast.error('Insufficient stock');
      return;
    }

    try {
      await salesAPI.record({
        ...saleForm,
        worker: user._id
      });
      toast.success('Sale recorded successfully!');
      setRefreshKey(prev => prev + 1); // Trigger manual refresh
      setShowSaleModal(false);
      setSaleForm({
        item: '',
        quantity: 1,
        customerName: '',
        paymentMethod: 'Cash',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    }
  };

  const todaySales = mySales.filter(s => 
    new Date(s.saleDate).toDateString() === new Date().toDateString()
  );

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklySales = mySales.filter(s => new Date(s.saleDate) >= weekAgo);

  const totalSalesToday = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalItemsToday = todaySales.reduce((sum, s) => sum + s.quantity, 0);
  const totalWeeklySales = weeklySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const generatePerformanceData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const daySales = mySales.filter(s => 
        new Date(s.saleDate).toDateString() === dateStr
      );
      const total = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: total,
        count: daySales.length
      });
    }
    return data;
  };

  const performanceData = generatePerformanceData();

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash': return <Wallet size={16} />;
      case 'M-Pesa': return <Smartphone size={16} />;
      case 'Card': return <CreditCard size={16} />;
      case 'Bank Transfer': return <Hash size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employee Dashboard">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Welcome Back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-600">Track your sales and daily activity</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary-light rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-dark">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingCart}
          title="Sales Today"
          value={`KSh ${totalSalesToday.toLocaleString()}`}
          subtitle={`${todaySales.length} transactions`}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={Package}
          title="Items Sold"
          value={totalItemsToday}
          subtitle="Today"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Weekly Sales"
          value={`KSh ${totalWeeklySales.toLocaleString()}`}
          subtitle="Last 7 days"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={Star}
          title="Performance"
          value={totalSalesToday > 0 ? 'Good' : 'Start'}
          subtitle="Keep it up!"
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h3 className="text-xl font-bold text-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowSaleModal(true)}
            className="flex items-center gap-4 p-6 bg-primary-light hover:bg-primary rounded-xl transition-all hover:shadow-lg group"
          >
            <div className="p-3 bg-primary text-dark rounded-xl group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark">Record Sale</p>
              <p className="text-sm text-gray-600">New transaction</p>
            </div>
          </button>

          <a
            href="/inventory"
            className="flex items-center gap-4 p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:shadow-lg group"
          >
            <div className="p-3 bg-blue-500 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark">View Stock</p>
              <p className="text-sm text-gray-600">Check inventory</p>
            </div>
          </a>

          <button
            onClick={() => document.getElementById('sales-history')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-4 p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all hover:shadow-lg group"
          >
            <div className="p-3 bg-purple-500 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark">My Sales</p>
              <p className="text-sm text-gray-600">View history</p>
            </div>
          </button>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-primary-dark" />
            My Weekly Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="sales" stroke="#D6C2A1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-primary-dark" />
            This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#B89B72" radius={[4, 4, 0, 0]} name="Sales Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales History */}
      <div id="sales-history" className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-dark flex items-center gap-2">
            <ShoppingCart size={24} className="text-primary-dark" />
            My Sales History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mySales.slice(0, 20).map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-dark">{sale.itemName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sale.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">KSh {sale.sellingPrice}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">
                    KSh {sale.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getPaymentIcon(sale.paymentMethod)}
                      {sale.paymentMethod}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sale.saleDate).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mySales.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
            <p>No sales yet. Start recording!</p>
          </div>
        )}
      </div>

      {/* Record Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <ShoppingCart size={24} className="text-primary-dark" />
                Record New Sale
              </h2>
              <button onClick={() => setShowSaleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmitSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Select Item</label>
                <select
                  value={saleForm.item}
                  onChange={(e) => setSaleForm({ ...saleForm, item: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Choose an item...</option>
                  {inventory.filter(i => i.quantity > 0).map(item => (
                    <option key={item._id} value={item._id}>
                      {item.itemName} - KSh {item.sellingPrice} ({item.quantity} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Payment Method</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="M-Pesa">📱 M-Pesa</option>
                    <option value="Card">💳 Card</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                  className="input-field"
                  placeholder="Walk-in customer"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
