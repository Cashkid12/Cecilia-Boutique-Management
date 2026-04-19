import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { salesAPI, expenseAPI, inventoryAPI, dashboardAPI } from '../utils/api';
import {
  Download,
  FileText,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Receipt,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
  Shirt,
  Briefcase,
  Crown,
  Layers,
  Footprints,
  Star,
  User,
  Baby,
  Sun,
  Wind,
  Circle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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

const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendUp, color }) => (
  <div className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          {trend}%
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-dark mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{title}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    sales: [],
    expenses: [],
    inventory: []
  });
  const [dateRange, setDateRange] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [categorySummary, setCategorySummary] = useState(null);
  const [bestCategory, setBestCategory] = useState(null);

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

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [salesRes, expenseRes, inventoryRes] = await Promise.all([
        salesAPI.getAll(),
        expenseAPI.getAll(),
        inventoryAPI.getAll()
      ]);

      setReportData({
        sales: salesRes.data,
        expenses: expenseRes.data,
        inventory: inventoryRes.data
      });

      // Fetch category analytics
      try {
        const [categoryRes] = await Promise.all([
          dashboardAPI.getCategorySummary()
        ]);
        setCategorySummary(categoryRes.data);
        // Find best category by sales
        if (categoryRes.data.salesByCategory && categoryRes.data.salesByCategory.length > 0) {
          setBestCategory(categoryRes.data.salesByCategory[0]);
        }
      } catch (catError) {
        console.log('Category analytics not available:', catError.message);
      }
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSales = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return reportData.sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= start && saleDate <= end && sale.status !== 'refunded';
    });
  };

  const getFilteredExpenses = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return reportData.expenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= start && expenseDate <= end;
    });
  };

  const filteredSales = getFilteredSales();
  const filteredExpenses = getFilteredExpenses();

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grossProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  const netProfit = grossProfit - totalExpenses;
  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  const generateTrendData = () => {
    const days = dateRange === 'daily' ? 7 : dateRange === 'weekly' ? 4 : dateRange === 'monthly' ? 12 : 6;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      let date, label;
      
      if (dateRange === 'daily') {
        date = new Date();
        date.setDate(date.getDate() - i);
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (dateRange === 'weekly') {
        date = new Date();
        date.setDate(date.getDate() - (i * 7));
        label = `Week ${days - i}`;
      } else if (dateRange === 'monthly') {
        date = new Date();
        date.setMonth(date.getMonth() - i);
        label = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        date = new Date();
        date.setMonth(date.getMonth() - (i * 2));
        label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const daySales = filteredSales.filter(s => {
        const saleDate = new Date(s.saleDate);
        return saleDate >= dateStart && saleDate <= dateEnd;
      });

      const dayExpenses = filteredExpenses.filter(e => {
        const expenseDate = new Date(e.expenseDate);
        return expenseDate >= dateStart && expenseDate <= dateEnd;
      });

      const sales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const expenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      const profit = daySales.reduce((sum, s) => sum + s.profit, 0) - expenses;

      data.push({ name: label, sales, expenses, profit });
    }

    return data;
  };

  const trendData = generateTrendData();

  const categoryPerformance = reportData.inventory.reduce((acc, item) => {
    const category = item.category;
    const sales = filteredSales.filter(s => s.itemName === item.itemName);
    const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const profit = sales.reduce((sum, s) => sum + s.profit, 0);

    if (!acc[category]) {
      acc[category] = { category, revenue: 0, profit: 0, itemsSold: 0 };
    }
    acc[category].revenue += revenue;
    acc[category].profit += profit;
    acc[category].itemsSold += sales.reduce((sum, s) => sum + s.quantity, 0);

    return acc;
  }, {});

  const categoryData = Object.values(categoryPerformance)
    .filter(c => c.revenue > 0)
    .sort((a, b) => b.profit - a.profit);

  const bestSellers = reportData.inventory.map(item => {
    const sales = filteredSales.filter(s => s.itemName === item.itemName);
    const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const profit = sales.reduce((sum, s) => sum + s.profit, 0);

    return {
      name: item.itemName,
      category: item.category,
      sold: totalSold,
      revenue,
      profit
    };
  }).filter(item => item.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 10);

  const expenseByCategory = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  const expenseChartData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const COLORS = ['#D6C2A1', '#B89B72', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

  const handleExportExcel = () => {
    const csvContent = [
      ['Report Type', 'Value'],
      ['Total Sales', `KSh ${totalSales.toLocaleString()}`],
      ['Gross Profit', `KSh ${grossProfit.toLocaleString()}`],
      ['Total Expenses', `KSh ${totalExpenses.toLocaleString()}`],
      ['Net Profit', `KSh ${netProfit.toLocaleString()}`],
      ['Items Sold', totalItemsSold]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cecilia-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Excel export complete');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout title="Reports">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Generating reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports & Profit Analysis">
      <div className="mb-8 animate-fade-in print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Reports & Profit Analysis</h1>
            <p className="text-gray-600">Track business growth, profits, losses, and trends</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
              <Download size={16} />
              <span>Excel</span>
            </button>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8 print:hidden">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark mb-2">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range ? 'bg-primary text-dark' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard icon={ShoppingCart} title="Total Sales" value={`KSh ${totalSales.toLocaleString()}`} subtitle="Revenue generated" color="bg-green-100 text-green-600" />
        <StatCard icon={TrendingUp} title="Gross Profit" value={`KSh ${grossProfit.toLocaleString()}`} subtitle="Before expenses" color="bg-blue-100 text-blue-600" />
        <StatCard icon={Receipt} title="Expenses" value={`KSh ${totalExpenses.toLocaleString()}`} subtitle="Total costs" color="bg-orange-100 text-orange-600" />
        <StatCard
          icon={DollarSign}
          title="Net Profit"
          value={`KSh ${netProfit.toLocaleString()}`}
          subtitle="Gross profit - expenses"
          trend={netProfit > 0 ? '12' : '8'}
          trendUp={netProfit > 0}
          color={netProfit >= 0 ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}
        />
        <StatCard icon={Package} title="Items Sold" value={totalItemsSold} subtitle="Total units" color="bg-pink-100 text-pink-600" />
        <StatCard icon={BarChart3} title="Profit Margin" value={`${totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%`} subtitle="Of total sales" color="bg-teal-100 text-teal-600" />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto print:hidden">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'sales', label: 'Sales', icon: TrendingUp },
          { id: 'expenses', label: 'Expenses', icon: Receipt },
          { id: 'products', label: 'Products', icon: Package }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-primary text-dark' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="card p-6 mb-8">
            <h3 className="text-xl font-bold text-dark mb-6">Profit & Loss Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Sales" />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} name="Expenses" />
                <Area type="monotone" dataKey="profit" stroke="#D6C2A1" fill="#D6C2A1" fillOpacity={0.2} name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-dark">Category Performance</h3>
                {bestCategory && (
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <TrendingUp size={16} />
                    Best: {bestCategory.category}
                  </div>
                )}
              </div>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="profit" fill="#D6C2A1" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Category Stock Status */}
                  {categorySummary && categorySummary.stockByCategory && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-dark mb-3">Current Stock by Category</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {categorySummary.stockByCategory.slice(0, 6).map((cat, idx) => {
                          const Icon = categoryIcons[cat.category] || Package;
                          return (
                            <div key={cat.category} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <Icon size={18} className="text-primary-dark" />
                              <div className="flex-1">
                                <p className="text-xs text-gray-600">{cat.category}</p>
                                <p className="text-sm font-bold text-dark">{cat.totalItems} items</p>
                              </div>
                              {cat.lowStockCount > 0 && (
                                <span className="text-xs text-orange-600 font-medium">{cat.lowStockCount} low</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No category data</p>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold text-dark mb-6">Expense Breakdown</h3>
              {expenseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Receipt size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No expense data</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'sales' && (
        <div className="card p-6 mb-8">
          <h3 className="text-xl font-bold text-dark mb-6">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} name="Sales" />
              <Line type="monotone" dataKey="profit" stroke="#D6C2A1" strokeWidth={3} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="card p-6 mb-8">
          <h3 className="text-xl font-bold text-dark mb-6">Expense Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'products' && (
        <>
          <div className="card p-6 mb-8">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-green-600" />
              Best Selling Products
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bestSellers.map((item, index) => (
                    <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-dark">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">{item.sold}</td>
                      <td className="px-4 py-3 text-sm text-dark">KSh {item.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">KSh {item.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bestSellers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p>No sales data available</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <AlertTriangle size={24} className="text-orange-500" />
              Low Stock Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.inventory
                .filter(item => item.quantity <= (item.lowStockThreshold || 5))
                .slice(0, 6)
                .map(item => (
                  <div key={item._id} className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                    <p className="font-medium text-dark mb-1">{item.itemName}</p>
                    <p className="text-sm text-gray-600 mb-2">{item.category} - {item.color}</p>
                    <p className="text-lg font-bold text-orange-600">{item.quantity} left</p>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
          .card { box-shadow: none !important; border: 1px solid #e5e7eb; break-inside: avoid; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Reports;
