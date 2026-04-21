import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, salesAPI, inventoryAPI, workersAPI, expensesAPI, dashboardAPI, categoryAPI } from '../utils/api';
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
  FileText,
  Briefcase,
  Shirt,
  Crown,
  Footprints,
  Layers,
  User,
  Baby,
  Sun,
  Wind,
  Circle,
  RefreshCw,
  X,
  PackagePlus,
  Receipt,
  Trophy,
  UserPlus
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
  Area,
  PieChart,
  Pie,
  Cell
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

const SkeletonCard = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="w-32 h-8 bg-gray-200 rounded mb-2"></div>
    <div className="w-24 h-4 bg-gray-200 rounded"></div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize all state as null
  const [todaySales, setTodaySales] = useState(null);
  const [totalProfit, setTotalProfit] = useState(null);
  const [totalStock, setTotalStock] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [stockDistribution, setStockDistribution] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dashboardRecentSales, setDashboardRecentSales] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Category icon mapping for 13 categories
  const categoryIcons = {
    "Men's Trousers": Briefcase,
    'Ladies Trousers': Briefcase,
    'Boys Trouser': Baby,
    'Girls Trouser': Baby,
    'Shorts': Sun,
    'T-Shirts': Shirt,
    'T-Shirt Boys': Shirt,
    'T-Shirt Girls': Shirt,
    'Socks': Circle,
    'Vests': Shirt,
    'Jackets Men': Wind,
    'Jackets Ladies': Wind,
    'Jackets Kids': Wind
  };

  const categoryColors = ['#D6C2A1', '#B89B72', '#8B7355', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3', '#D2B48C', '#C4A882', '#B8956A', '#A67B5B', '#8B6914', '#6B4423'];

  // Consolidated dashboard data fetch
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      // Show loading spinner only on initial load
      if (!isRefresh) {
        setLoading(true);
      }

      // Fetch all dashboard data in single request
      const response = await dashboardAPI.getAllConsolidated();

      if (response.data) {
        const data = response.data;

        // ONLY update if data exists - never set to 0 or empty unless that's actual data
        if (data.stats) {
          if (data.stats.todaySales !== undefined) setTodaySales(data.stats.todaySales);
          if (data.stats.totalProfit !== undefined) setTotalProfit(data.stats.totalProfit);
          if (data.stats.totalStock !== undefined) setTotalStock(data.stats.totalStock);
          if (data.stats.lowStockCount !== undefined) setLowStockCount(data.stats.lowStockCount);
        }
        
        if (data.categoryStats && Array.isArray(data.categoryStats)) setCategoryStats(data.categoryStats);
        if (data.salesChart && Array.isArray(data.salesChart)) setSalesChartData({ data: data.salesChart });
        if (data.stockDistribution && Array.isArray(data.stockDistribution)) setStockDistribution(data.stockDistribution);
        if (data.recentSales && Array.isArray(data.recentSales)) setDashboardRecentSales(data.recentSales);
        if (data.lowStockItems && Array.isArray(data.lowStockItems)) setLowStockAlerts(data.lowStockItems);
        if (data.bestSellers && Array.isArray(data.bestSellers)) setBestSellers(data.bestSellers);
        if (data.workers && Array.isArray(data.workers)) setWorkers(data.workers);
        if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('[Dashboard] Fetch failed:', error);
      // DO NOTHING - keep existing data
      // Show subtle error toast but don't clear data
      if (!isRefresh) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    setGreeting(getGreeting());
    fetchDashboardData(false); // Initial fetch with loading
    
    const interval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Re-fetch when chart period changes
  useEffect(() => {
    if (!loading) {
      fetchDashboardData(true);
    }
  }, [chartPeriod]);

  // Handle ESC key to close FAB menu
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && fabOpen) {
        setFabOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [fabOpen]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(true);
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
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
              {greeting}, {user?.name || 'User'} 👋
            </h1>
            <p className="text-gray-600">
              Welcome back to your boutique dashboard
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw 
                size={18} 
                className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {todaySales === null || totalProfit === null || totalStock === null || lowStockCount === null ? (
          // Show skeleton loaders while fetching initial data
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Card 1: Today's Sales */}
            <StatCard
              icon={DollarSign}
              title="Today's Sales"
              value={`KSh ${(todaySales || 0).toLocaleString()}`}
              subtitle="Recent transactions"
              color="bg-green-100 text-green-600"
            />
            
            {/* Card 2: Total Profit */}
            <StatCard
              icon={TrendingUp}
              title="Total Profit"
              value={`KSh ${(totalProfit || 0).toLocaleString()}`}
              subtitle="Net profit today"
              color="bg-blue-100 text-blue-600"
            />
            
            {/* Card 3: Total Stock */}
            <StatCard
              icon={Package}
              title="Total Stock"
              value={totalStock || 0}
              subtitle="Items in inventory"
              color="bg-primary/20 text-primary-dark"
            />
            
            {/* Card 4: Low Stock Alerts */}
            <StatCard
              icon={AlertTriangle}
              title="Low Stock Alerts"
              value={lowStockCount || 0}
              subtitle="Items need restock"
              color="bg-orange-100 text-orange-600"
            />
          </>
        )}
      </div>

      {/* Category Stock Overview - 13 Categories Grid */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-dark mb-4">Category Stock Overview</h2>
        
        {categoryStats === null ? (
          // Show skeleton loaders while fetching
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3"></div>
                <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-16 h-8 bg-gray-200 rounded mb-1"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryStats.map((cat) => {
              const Icon = categoryIcons[cat.category] || Package;
              const isLow = cat.lowStockCount > 0;
              
              return (
                <div
                  key={cat.category}
                  className="bg-white border border-[#F5EFE6] rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => navigate('/admin/inventory')}
                >
                  {/* Icon */}
                  <div className={`p-3 rounded-xl mb-3 bg-primary/20 text-primary-dark group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-sm font-semibold text-dark mb-2 truncate">
                    {cat.category}
                  </h3>
                  
                  {/* Total Items Count */}
                  <p className="text-2xl font-bold text-dark mb-1">
                    {cat.totalItems}
                  </p>
                  
                  {/* Product Count */}
                  <p className="text-xs text-gray-600 mb-2">
                    {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                  </p>
                  
                  {/* Low Stock Badge */}
                  {isLow && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg text-xs font-semibold">
                      <AlertTriangle size={12} />
                      <span>{cat.lowStockCount} low stock</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Analytics Chart (2/3 width) */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-dark">Sales Analytics</h3>
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setChartPeriod(period);
                    fetchSalesChart(period);
                  }}
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
          
          {salesChartData === null ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-pulse text-center">
                <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-64 h-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={salesChartData.data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D6C2A1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D6C2A1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="" stroke="#F5EFE6" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `KSh ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F5EFE6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`KSh ${value}`, 'Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#D6C2A1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Chart Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-dark">
                      KSh {(salesChartData?.total || 0).toLocaleString()}
                    </p>
                  </div>
                  {salesChartData?.trend && salesChartData.trend !== 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      salesChartData.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {salesChartData.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      <span className="font-semibold">{Math.abs(salesChartData.trend)}%</span>
                      <span className="text-xs">vs previous</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stock Distribution Pie Chart (1/3 width) */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Package size={20} className="text-primary-dark" />
            Stock Distribution
          </h3>
          
          {stockDistribution === null ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-pulse text-center">
                <div className="w-40 h-40 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F5EFE6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name, props) => [`${value} items`, props.payload.category]}
                  />
                  {/* Center text */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold"
                    fill="#2E2E2E"
                  >
                    {stockDistribution.reduce((sum, cat) => sum + cat.count, 0)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {stockDistribution
                  .filter(cat => cat.count > 0)
                  .map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">      {/* Charts Section */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        <span className="text-gray-700 truncate">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">{cat.percentage}%</span>
                        <span className="font-semibold text-dark">{cat.count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Best Sellers */}
      <div className="mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              Best Sellers
            </h3>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-sm text-primary-dark font-medium hover:underline"
            >
              View Full Report
            </button>
          </div>
          
          {bestSellers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sales data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bestSellers.slice(0, 6).map((item, index) => {
                const rankIcons = [
                  { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100' },
                  { icon: Star, color: 'text-gray-400', bg: 'bg-gray-100' },
                  { icon: Star, color: 'text-orange-600', bg: 'bg-orange-100' }
                ];
                const rank = rankIcons[index] || rankIcons[2];
                const RankIcon = rank.icon;
                
                return (
                  <div
                    key={item._id || index}
                    className="flex items-center gap-4 p-4 bg-primary-light rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className={`w-12 h-12 rounded-full ${rank.bg} flex items-center justify-center`}>
                      <RankIcon size={24} className={rank.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm truncate">{item.itemName}</p>
                      <p className="text-xs text-gray-600">{item.totalQuantity || item.quantity} sold</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-dark text-sm">
                        KSh {(item.totalRevenue || item.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Sales Table (2/3 width) */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark">Recent Sales (Today)</h3>
            <button
              onClick={() => navigate('/admin/sales')}
              className="text-sm text-primary-dark font-medium hover:underline"
            >
              View All Sales
            </button>
          </div>
          
          {dashboardRecentSales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sales recorded today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F5EFE6]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardRecentSales.map((sale) => (
                    <tr 
                      key={sale.id} 
                      className="border-b border-[#F5EFE6] hover:bg-[#F5EFE6] hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-dark">{sale.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.quantity}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">
                        KSh {(sale.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(sale.time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1/3 width) */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#F59E0B]" />
              Low Stock Alerts
            </h3>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-sm text-primary-dark font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          {lowStockAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">All items are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {lowStockAlerts.map((categoryGroup) => {
                const Icon = categoryIcons[categoryGroup.category] || Package;
                
                return (
                  <div key={categoryGroup.category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#F5EFE6]">
                      <Icon size={16} className="text-primary-dark" />
                      <h4 className="text-sm font-semibold text-dark">{categoryGroup.category}</h4>
                      <span className="text-xs text-gray-500">({categoryGroup.items.length})</span>
                    </div>
                    
                    {/* Items */}
                    <div className="space-y-2 ml-6">
                      {categoryGroup.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-dark truncate">{item.itemName}</p>
                            <p className="text-xs text-gray-500">KSh {item.buyingPrice}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.quantity < 3 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                          }`}>
                            {item.quantity} left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Worker Performance & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Performance */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <Users size={20} />
              Worker Performance Today
            </h3>
            <button
              onClick={() => navigate('/admin/workers')}
              className="text-sm text-primary-dark font-medium hover:underline"
            >
              View All Workers →
            </button>
          </div>
          
          {workers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold text-dark mb-2">No workers added yet</h4>
              <p className="text-sm text-gray-500 mb-4">Add workers to track their performance</p>
              <button
                onClick={() => navigate('/admin/workers')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                <UserPlus size={18} />
                <span>Add Worker</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                // Calculate average sales for performance bars
                const workersWithSales = workers.map(w => ({
                  ...w,
                  salesCount: w.todaySales?.count || 0,
                  salesAmount: w.todaySales?.totalSales || 0
                }));
                
                const hasAnySales = workersWithSales.some(w => w.salesCount > 0);
                
                if (!hasAnySales) {
                  return (
                    <div className="text-center py-12">
                      <Package size={64} className="mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-dark mb-2">No sales recorded today yet</h4>
                      <p className="text-sm text-gray-500">Sales will appear here once recorded</p>
                    </div>
                  );
                }
                
                const avgSales = workersWithSales.reduce((sum, w) => sum + w.salesAmount, 0) / workersWithSales.length;
                
                // Sort by sales amount (highest first)
                const sortedWorkers = [...workersWithSales].sort((a, b) => b.salesAmount - a.salesAmount);
                
                return sortedWorkers.slice(0, 5).map((worker) => {
                  // Calculate performance level
                  let performance, performanceColor, barColor;
                  const percentage = avgSales > 0 ? (worker.salesAmount / avgSales) * 100 : 0;
                  
                  if (percentage >= 150) {
                    performance = 'Excellent';
                    performanceColor = 'text-green-600';
                    barColor = 'bg-green-500';
                  } else if (percentage >= 100) {
                    performance = 'Good';
                    performanceColor = 'text-blue-600';
                    barColor = 'bg-blue-500';
                  } else if (percentage >= 50) {
                    performance = 'Average';
                    performanceColor = 'text-orange-600';
                    barColor = 'bg-orange-500';
                  } else {
                    performance = 'Low';
                    performanceColor = 'text-gray-600';
                    barColor = 'bg-gray-500';
                  }
                  
                  const barWidth = Math.min(percentage, 100);
                  
                  return (
                    <div
                      key={worker._id}
                      className="p-4 bg-[#F5EFE6] rounded-xl hover:shadow-md transition-all duration-300"
                    >
                      {/* Worker Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-lg">
                          {worker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-dark">{worker.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <ShoppingCart size={12} />
                              Sales: {worker.salesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              Amount: KSh {worker.salesAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold ${performanceColor}`}>
                            {performance}
                          </span>
                        </div>
                      </div>
                      
                      {/* Performance Bar */}
                      <div className="w-full h-2 bg-[#F5EFE6] rounded-full overflow-hidden border border-gray-200">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()}
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
                    -KSh {(expense.amount || 0).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-primary">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-dark">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    -KSh {expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
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

      {/* Floating Action Button (FAB) */}
      {fabOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setFabOpen(false)}
        />
      )}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        {/* Menu Items */}
        <div className={`absolute bottom-16 right-0 mb-2 transition-all duration-300 ${
          fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="flex flex-col items-end space-y-2">
            {/* View Reports */}
            <button
              onClick={() => {
                navigate('/admin/reports');
                setFabOpen(false);
              }}
              className="bg-white border border-[#F5EFE6] rounded-xl px-4 py-3 shadow-md hover:shadow-lg hover:-translate-x-1 transition-all duration-200 flex items-center gap-3 min-w-[180px]"
              style={{ animationDelay: '150ms' }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#D6C2A1]/20 flex items-center justify-center">
                <FileText size={18} className="text-[#D6C2A1]" />
              </div>
              <span className="text-sm font-medium text-dark">View Reports</span>
            </button>

            {/* Add Expense */}
            <button
              onClick={() => {
                navigate('/admin/expenses');
                setFabOpen(false);
              }}
              className="bg-white border border-[#F5EFE6] rounded-xl px-4 py-3 shadow-md hover:shadow-lg hover:-translate-x-1 transition-all duration-200 flex items-center gap-3 min-w-[180px]"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                <Receipt size={18} className="text-[#F59E0B]" />
              </div>
              <span className="text-sm font-medium text-dark">Add Expense</span>
            </button>

            {/* Add Stock */}
            <button
              onClick={() => {
                navigate('/admin/inventory');
                setFabOpen(false);
              }}
              className="bg-white border border-[#F5EFE6] rounded-xl px-4 py-3 shadow-md hover:shadow-lg hover:-translate-x-1 transition-all duration-200 flex items-center gap-3 min-w-[180px]"
              style={{ animationDelay: '50ms' }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <PackagePlus size={18} className="text-[#3B82F6]" />
              </div>
              <span className="text-sm font-medium text-dark">Add Stock</span>
            </button>

            {/* Record Sale */}
            <button
              onClick={() => {
                navigate('/admin/sales');
                setFabOpen(false);
              }}
              className="bg-white border border-[#F5EFE6] rounded-xl px-4 py-3 shadow-md hover:shadow-lg hover:-translate-x-1 transition-all duration-200 flex items-center gap-3 min-w-[180px]"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <ShoppingCart size={18} className="text-[#10B981]" />
              </div>
              <span className="text-sm font-medium text-dark">Record Sale</span>
            </button>
          </div>
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          aria-label="Quick actions menu"
          aria-expanded={fabOpen}
          className="w-14 h-14 rounded-full bg-[#D6C2A1] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center text-[#2E2E2E]"
        >
          {fabOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
