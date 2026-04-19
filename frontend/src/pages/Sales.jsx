import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { salesAPI, inventoryAPI, workersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Printer,
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Hash,
  Calendar,
  User,
  CreditCard,
  Wallet,
  Smartphone,
  X,
  Check,
  AlertCircle,
  Shirt,
  Briefcase,
  Crown,
  Layers,
  Footprints,
  Star
} from 'lucide-react';
import {
  LineChart,
  Line,
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
  Legend
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

const Sales = () => {
  const { user, isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [workerFilter, setWorkerFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [chartPeriod, setChartPeriod] = useState('daily');

  // Category-first sale flow
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  const categories = [
    'All Stock',
    "Men's Trousers",
    'Ladies Trousers',
    'Boys Trouser',
    'Girls Trouser',
    'Shorts',
    'T-Shirts',
    'T-Shirt Boys',
    'T-Shirt Girls',
    'Socks',
    'Vests',
    'Jackets Men',
    'Jackets Ladies',
    'Jackets Kids'
  ];

  const [saleForm, setSaleForm] = useState({
    item: '',
    quantity: 1,
    customerName: '',
    paymentMethod: 'Cash',
    notes: ''
  });

  const [refundReason, setRefundReason] = useState('');

  // Category icon mapping
  const categoryIcons = {
    'Trousers': Briefcase,
    'T-Shirts': Shirt,
    'Shirts': Shirt,
    'Dresses': Crown,
    'Jackets': Layers,
    'Shoes': Footprints,
    'Accessories': Star,
    'All Stock': Package
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter inventory by selected category
  useEffect(() => {
    if (selectedCategory === '' || selectedCategory === 'All Stock') {
      setFilteredInventory(inventory);
    } else {
      setFilteredInventory(inventory.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, inventory]);

  const fetchData = async () => {
    try {
      const [salesRes, inventoryRes, workersRes] = await Promise.all([
        salesAPI.getAll(),
        inventoryAPI.getAll(),
        isAdmin ? workersAPI.getAll() : Promise.resolve({ data: [] })
      ]);
      setSales(salesRes.data);
      setInventory(inventoryRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = inventory.find(i => i._id === saleForm.item);

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    
    if (!saleForm.item) {
      toast.error('Please select an item');
      return;
    }

    if (saleForm.quantity > selectedItem.quantity) {
      toast.error('Insufficient stock');
      return;
    }

    try {
      const saleData = {
        ...saleForm,
        worker: user._id
      };

      const response = await salesAPI.record(saleData);
      toast.success('Sale recorded successfully!');
      fetchData();
      setShowSaleModal(false);
      setSelectedSale(response.data);
      setShowReceiptModal(true);
      resetSaleForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    }
  };

  const handleRefund = async () => {
    if (!refundReason) {
      toast.error('Please provide refund reason');
      return;
    }

    try {
      await salesAPI.refund(selectedSale._id, { reason: refundReason });
      toast.success('Sale refunded and stock restored');
      fetchData();
      setShowRefundModal(false);
      setRefundReason('');
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const resetSaleForm = () => {
    setSaleForm({
      item: '',
      quantity: 1,
      customerName: '',
      paymentMethod: 'Cash',
      notes: ''
    });
  };

  const getFilteredSales = () => {
    let filtered = sales;

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(s => new Date(s.saleDate).toDateString() === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(s => new Date(s.saleDate) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(s => new Date(s.saleDate) >= monthAgo);
    }

    if (workerFilter) {
      filtered = filtered.filter(s => s.worker === workerFilter);
    }

    if (paymentFilter) {
      filtered = filtered.filter(s => s.paymentMethod === paymentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredSales = getFilteredSales();

  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
  const totalItems = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const avgSaleValue = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash': return <Wallet size={16} />;
      case 'M-Pesa': return <Smartphone size={16} />;
      case 'Card': return <CreditCard size={16} />;
      case 'Bank Transfer': return <Hash size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  const paymentBreakdown = [
    { name: 'Cash', value: filteredSales.filter(s => s.paymentMethod === 'Cash').length, color: '#10B981' },
    { name: 'M-Pesa', value: filteredSales.filter(s => s.paymentMethod === 'M-Pesa').length, color: '#3B82F6' },
    { name: 'Card', value: filteredSales.filter(s => s.paymentMethod === 'Card').length, color: '#8B5CF6' },
    { name: 'Bank', value: filteredSales.filter(s => s.paymentMethod === 'Bank Transfer').length, color: '#F59E0B' }
  ].filter(p => p.value > 0);

  const bestSellers = sales.reduce((acc, sale) => {
    const existing = acc.find(item => item.name === sale.itemName);
    if (existing) {
      existing.quantity += sale.quantity;
      existing.revenue += sale.totalAmount;
    } else {
      acc.push({ name: sale.itemName, quantity: sale.quantity, revenue: sale.totalAmount });
    }
    return acc;
  }, []).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout title="Sales">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sales Management">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Sales Management</h1>
            <p className="text-gray-600">Track daily sales, profits, and worker performance</p>
          </div>
          <button
            onClick={() => setShowSaleModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={ShoppingCart}
          title="Sales Today"
          value={`KSh ${(totalSales || 0).toLocaleString()}`}
          subtitle="Total revenue"
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Profit"
          value={`KSh ${(totalProfit || 0).toLocaleString()}`}
          subtitle="Net profit"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Package}
          title="Items Sold"
          value={totalItems}
          subtitle="Total units"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={Hash}
          title="Transactions"
          value={filteredSales.length}
          subtitle="Total sales"
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon={DollarSign}
          title="Avg Sale"
          value={`KSh ${Math.round(avgSaleValue || 0).toLocaleString()}`}
          subtitle="Per transaction"
          color="bg-pink-100 text-pink-600"
        />
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item, worker, or transaction ID..."
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
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          {isAdmin && (
            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Workers</option>
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name}</option>
              ))}
            </select>
          )}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Sales Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales.slice(0, 30).reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="itemName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="totalAmount" stroke="#D6C2A1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Payment Methods</h3>
          {paymentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard size={48} className="mx-auto mb-2 opacity-30" />
              <p>No sales data</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sales Table */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Worker</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-dark">{sale.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">KSh {sale.sellingPrice}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">
                        KSh {(sale.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        KSh {(sale.profit || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getPaymentIcon(sale.paymentMethod)}
                          {sale.paymentMethod}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.workerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(sale.saleDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowReceiptModal(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowReceiptModal(true);
                            }}
                            className="p-2 hover:bg-primary-light rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer size={16} className="text-primary-dark" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowRefundModal(true);
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Refund"
                            >
                              <ArrowLeft size={16} className="text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                <p>No sales found</p>
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-dark" />
              Best Sellers
            </h3>
            {bestSellers.length > 0 ? (
              <div className="space-y-4">
                {bestSellers.map((item, index) => (
                  <div key={item.name} className="p-4 bg-primary-light rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.quantity} sold</p>
                      </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-primary-dark h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.quantity / bestSellers[0].quantity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
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
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSale} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-dark mb-3">Select Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category] || Package;
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category);
                          setSaleForm({ ...saleForm, item: '' }); // Reset item when category changes
                        }}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-primary bg-primary-light shadow-md'
                            : 'border-gray-200 hover:border-primary-light hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} className={isSelected ? 'text-primary-dark' : 'text-gray-600'} />
                        <span className={`text-xs font-medium ${
                          isSelected ? 'text-primary-dark' : 'text-gray-700'
                        }`}>
                          {category.replace('All Stock', 'All')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Select Item {selectedCategory && selectedCategory !== 'All' && (
                    <span className="text-xs text-gray-500 font-normal">- {selectedCategory}</span>
                  )}
                </label>
                <select
                  value={saleForm.item}
                  onChange={(e) => setSaleForm({ ...saleForm, item: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Choose an item...</option>
                  {filteredInventory
                    .filter(i => i.quantity > 0)
                    .map(item => (
                      <option key={item._id} value={item._id}>
                        {item.category} - KSh {item.buyingPrice} | Stock: {item.quantity} | Sell: KSh {item.sellingPrice}
                      </option>
                    ))}
                </select>
                {filteredInventory.filter(i => i.quantity > 0).length === 0 && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    No items available in this category
                  </p>
                )}
              </div>

              {selectedItem && (
                <div className="p-4 bg-primary-light rounded-xl">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-bold text-dark">KSh {selectedItem.sellingPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Available</p>
                      <p className="font-bold text-dark">{selectedItem.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Profit/Unit</p>
                      <p className="font-bold text-green-600">KSh {selectedItem.sellingPrice - selectedItem.buyingPrice}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem?.quantity || 1}
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

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Notes (Optional)</label>
                <textarea
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                  className="input-field"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>

              {saleForm.quantity && selectedItem && (
                <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-green-700">
                        KSh {(selectedItem.sellingPrice * saleForm.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Profit</p>
                      <p className="text-2xl font-bold text-green-600">
                        KSh {((selectedItem.sellingPrice - selectedItem.buyingPrice) * saleForm.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaleModal(false);
                    resetSaleForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Check size={18} />
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-dark mb-1">Sale Completed!</h2>
              <p className="text-sm text-gray-600">Transaction successful</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Item</span>
                <span className="font-medium text-dark">
                  {selectedSale.itemName || `${selectedSale.category} - KSh ${selectedSale.buyingPrice}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium text-dark">{selectedSale.quantity} × KSh {selectedSale.sellingPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment</span>
                <span className="font-medium text-dark">{selectedSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-dark">
                  {selectedSale?.saleDate ? new Date(selectedSale.saleDate).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-dark">Total</span>
                <span className="text-xl font-bold text-green-600">
                  KSh {(selectedSale?.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedSale(null);
                }}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark">Process Refund</h2>
                <p className="text-sm text-gray-600">This will restore stock quantity</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Original Sale</p>
              <p className="font-medium text-dark">{selectedSale.itemName}</p>
              <p className="text-sm text-gray-600">
                {selectedSale.quantity} × KSh {selectedSale.sellingPrice} = KSh {selectedSale.totalAmount}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">Refund Reason</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Why is this sale being refunded?"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Sales;
