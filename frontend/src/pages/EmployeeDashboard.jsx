import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { salesAPI, inventoryAPI, dashboardAPI, categoryAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Star,
  Plus,
  Eye,
  Clock,
  Wallet,
  Smartphone,
  CreditCard,
  Hash,
  Shirt,
  Briefcase,
  Baby,
  Sun,
  Wind,
  Circle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
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

const SkeletonCard = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-20 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize all state as null
  const [salesToday, setSalesToday] = useState(null);
  const [itemsSold, setItemsSold] = useState(null);
  const [totalTransactions, setTotalTransactions] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const [saleForm, setSaleForm] = useState({
    item: '',
    quantity: 1,
    customerName: '',
    paymentMethod: 'Cash',
    notes: ''
  });

  // Consolidated fetch function
  const fetchEmployeeData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }

      // Fetch consolidated dashboard data
      const response = await dashboardAPI.getAllConsolidated();

      if (response.data) {
        const data = response.data;

        // Update stats if data exists
        if (data.stats) {
          setSalesToday(data.stats.todaySales ?? salesToday);
          setItemsSold(data.stats.totalStock ?? itemsSold);
          setTotalTransactions(data.stats.lowStockCount ?? totalTransactions);
          
          // Calculate performance based on today's sales
          const salesAmount = data.stats.todaySales || 0;
          if (salesAmount > 10000) {
            setPerformance('Excellent');
          } else if (salesAmount > 5000) {
            setPerformance('Good');
          } else if (salesAmount > 0) {
            setPerformance('Started');
          } else {
            setPerformance('Start');
          }
        }

        if (data.categoryStats && Array.isArray(data.categoryStats)) {
          setCategoryStats(data.categoryStats);
        }

        if (data.recentSales && Array.isArray(data.recentSales)) {
          setRecentSales(data.recentSales);
        }
      }

      // Fetch inventory separately for sale modal
      try {
        const inventoryRes = await inventoryAPI.getAll();
        if (inventoryRes.data) {
          setInventory(inventoryRes.data);
        }
      } catch (invError) {
        console.error('[Employee Dashboard] Failed to fetch inventory:', invError);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('[Employee Dashboard] Fetch failed:', error);
      if (!isRefresh) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchEmployeeData(false);
    
    const interval = setInterval(() => {
      fetchEmployeeData(true); // Silent refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmployeeData(true);
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
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
      fetchEmployeeData(true);
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
    <DashboardLayout title="Dashboard">
      {/* Welcome Header with Role Badge */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-dark">
                Welcome Back, {user?.name?.split(' ')[0]}!
              </h1>
              <span className="px-3 py-1 bg-primary/20 text-primary-dark text-xs font-semibold rounded-full">
                {user?.role}
              </span>
            </div>
            <p className="text-gray-600">Track your sales and daily activity</p>
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
      </div>

      {/* Stats Cards - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {salesToday === null || itemsSold === null || totalTransactions === null || performance === null ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              icon={ShoppingCart}
              title="Sales Today"
              value={`KSh ${(salesToday || 0).toLocaleString()}`}
              subtitle={`${totalTransactions || 0} transactions`}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              icon={Package}
              title="Items Sold"
              value={itemsSold || 0}
              subtitle="Today"
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={Star}
              title="Performance"
              value={performance || 'Start'}
              subtitle="Keep it up!"
              color="bg-yellow-100 text-yellow-600"
            />
            <StatCard
              icon={TrendingUp}
              title="Status"
              value="Active"
              subtitle="Logged in"
              color="bg-purple-100 text-purple-600"
            />
          </>
        )}
      </div>

      {/* Category Stock Overview - Read Only */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
          <Package size={24} className="text-primary-dark" />
          Category Stock Overview
        </h2>
        
        {categoryStats === null ? (
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
                  className="bg-white border border-[#F5EFE6] rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl mb-3 ${
                    isLow ? 'bg-orange-100 text-orange-600' : 'bg-primary/20 text-primary-dark'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-dark mb-2 truncate">
                    {cat.category}
                  </h3>
                  <p className="text-2xl font-bold text-dark mb-1">
                    {cat.totalItems}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                  </p>
                  {isLow && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold">
                      <AlertTriangle size={12} />
                      <span>{cat.lowStockCount} low</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions - 3 buttons only */}
      <div className="card p-6 mb-8">
        <h3 className="text-xl font-bold text-dark mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowSaleModal(true)}
            className="flex items-center gap-4 p-6 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all hover:shadow-lg group"
          >
            <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark">Record Sale</p>
              <p className="text-sm text-gray-600">New transaction</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/employee/inventory')}
            className="flex items-center gap-4 p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all hover:shadow-lg group"
          >
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark">View Inventory</p>
              <p className="text-sm text-gray-600">Check stock</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/employee/sales')}
            className="flex items-center gap-4 p-6 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all hover:shadow-lg group"
          >
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-dark">My Sales History</p>
              <p className="text-sm text-gray-600">View records</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Sales Table - Employee's own sales only */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-dark flex items-center gap-2">
            <ShoppingCart size={24} className="text-primary-dark" />
            My Recent Sales
          </h3>
          <button
            onClick={() => navigate('/employee/sales')}
            className="text-sm text-primary-dark font-medium hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-dark">{sale.itemName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sale.quantity}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark">
                    KSh {(sale.totalAmount || 0).toLocaleString()}
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
        {recentSales.length === 0 && (
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
