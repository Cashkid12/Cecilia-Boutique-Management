import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { reportsAPI, salesAPI, inventoryAPI, workersAPI, expensesAPI, dashboardAPI } from '../utils/api';
import { useDashboardData } from '../hooks/useRealTimeData';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ShoppingCart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Wallet,
  FileText
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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendUp, color }) => (
  <div className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}%
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-dark mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{title}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesTrends, setSalesTrends] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time dashboard data with auto-refresh every 15 seconds
  const { data: dashboardData, refetch: refetchDashboard } = useDashboardData(
    () => dashboardAPI.getAll()
  );

  useEffect(() => {
    setGreeting(getGreeting());
    fetchData();
  }, [refreshKey]);

  // Auto-update when dashboard data changes
  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData);
      setRecentSales(dashboardData.recentSales || []);
      setLowStock(dashboardData.lowStockItems || []);
    }
  }, [dashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchData = async () => {
    try {
      const [
        dashboardRes,
        trendsRes,
        salesRes,
        lowStockRes,
        workersRes,
        expensesRes,
        bestSellersRes
      ] = await Promise.all([
        reportsAPI.getDashboard(),
        reportsAPI.getSalesTrends(30),
        salesAPI.getAll({}),
        inventoryAPI.getLowStock(),
        workersAPI.getAll(),
        expensesAPI.getAll(),
        reportsAPI.getBestSellers()
      ]);

      setStats(dashboardRes.data);
      setSalesTrends(trendsRes.data);
      setRecentSales(salesRes.data.slice(0, 10));
      setLowStock(lowStockRes.data.slice(0, 5));
      setWorkers(workersRes.data);
      setExpenses(expensesRes.data);
      setBestSellers(bestSellersRes.data.slice(0, 3));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getChartColor = () => {
    switch (chartPeriod) {
      case 'today': return salesTrends.slice(-1);
      case 'week': return salesTrends.slice(-7);
      case 'month': return salesTrends.slice(-30);
      default: return salesTrends;
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
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">
              {greeting}, {stats ? 'Admin' : 'User'} 👋
            </h1>
            <p className="text-gray-600">
              Here's your business overview for today
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl">
            <Clock size={18} className="text-primary-dark" />
            <span className="text-sm font-medium text-dark">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingCart}
          title="Sales Today"
          value={`KSh ${(stats?.todaySales?.totalSales || 0).toLocaleString()}`}
          subtitle={`${stats?.todaySales?.count || 0} transactions`}
          trend={12}
          trendUp={true}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Profit Today"
          value={`KSh ${(stats?.todaySales?.totalProfit || 0).toLocaleString()}`}
          subtitle="Net profit margin"
          trend={8}
          trendUp={true}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Package}
          title="Total Inventory"
          value={stats?.totalStock?.totalItems || 0}
          subtitle={`${stats?.totalStock?.totalProducts || 0} products`}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Low Stock Alert"
          value={stats?.lowStockCount || 0}
          subtitle="Items need restock"
          trend={5}
          trendUp={false}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-dark">Sales Analytics</h3>
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chartPeriod === period
                      ? 'bg-primary text-dark shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-primary-light'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={getChartColor()}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D6C2A1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D6C2A1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#D6C2A1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Best Sellers */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            Best Sellers
          </h3>
          <div className="space-y-4">
            {bestSellers.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-4 bg-primary-light rounded-xl hover:bg-primary transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-dark font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark text-sm">{item.itemName}</p>
                  <p className="text-xs text-gray-600">{item.totalQuantity} sold</p>
                </div>
                <p className="font-semibold text-dark">
                  KSh {item.totalRevenue?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h3 className="text-xl font-bold text-dark mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: ShoppingCart, label: 'Record Sale', color: 'bg-green-500 hover:bg-green-600' },
            { icon: Package, label: 'Add Stock', color: 'bg-blue-500 hover:bg-blue-600' },
            { icon: Users, label: 'Add Worker', color: 'bg-purple-500 hover:bg-purple-600' },
            { icon: Wallet, label: 'Add Expense', color: 'bg-orange-500 hover:bg-orange-600' },
            { icon: FileText, label: 'View Reports', color: 'bg-primary hover:bg-primary-dark' }
          ].map((action, idx) => (
            <button
              key={idx}
              className={`${action.color} text-white py-4 px-6 rounded-xl font-medium flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95`}
            >
              <action.icon size={24} />
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark">Recent Sales</h3>
            <button className="text-sm text-primary-dark font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-light">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Worker</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-dark">{sale.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sale.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-dark">
                      KSh {sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                      KSh {sale.profit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sale.workerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(sale.saleDate).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Low Stock
            </h3>
          </div>
          {lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark text-sm">{item.itemName}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{item.quantity}</p>
                      <p className="text-xs text-gray-500">left</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-2 opacity-30" />
              <p>All items well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Worker Performance & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Performance */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Users size={20} />
            Worker Performance
          </h3>
          {workers.length > 0 ? (
            <div className="space-y-4">
              {workers.slice(0, 5).map((worker) => (
                <div
                  key={worker._id}
                  className="flex items-center gap-4 p-4 bg-primary-light rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-lg">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark">{worker.name}</p>
                    <p className="text-xs text-gray-600">{worker.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-dark">Active</p>
                    <p className="text-xs text-gray-500">{worker.phone || 'No phone'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-2 opacity-30" />
              <p>No workers added yet</p>
            </div>
          )}
        </div>

        {/* Expenses Summary */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Wallet size={20} />
            Recent Expenses
          </h3>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 bg-primary-light rounded-xl"
                >
                  <div>
                    <p className="font-medium text-dark text-sm">{expense.category}</p>
                    <p className="text-xs text-gray-600">{expense.description}</p>
                  </div>
                  <p className="font-semibold text-red-600">
                    -KSh {expense.amount.toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-primary">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-dark">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    -KSh {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wallet size={48} className="mx-auto mb-2 opacity-30" />
              <p>No expenses recorded</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
