import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { inventoryAPI, dashboardAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Download,
  X,
  Eye,
  RefreshCw,
  ShoppingBag,
  Shirt,
  Layers,
  Footprints,
  Crown,
  Star,
  Briefcase,
  ChevronRight,
  Loader2,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  CheckCircle,
  AlertCircle,
  Archive
} from 'lucide-react';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Stock');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [categorySummary, setCategorySummary] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Trousers',
    subcategory: '',
    buyingPrice: '',
    sellingPrice: '',
    quantity: '',
    size: 'M',
    color: '',
    supplier: '',
    lowStockThreshold: 5
  });

  // Category configuration with icons and subcategories
  const categories = [
    { id: 'All Stock', name: 'All Stock', icon: Layers, subcategories: [] },
    { id: 'Trousers', name: 'Trousers', icon: Briefcase, subcategories: ['Jeans', 'Khaki', 'Official', 'Casual', 'New Arrival'] },
    { id: 'T-Shirts', name: 'T-Shirts', icon: Shirt, subcategories: ['Polo', 'Round Neck', 'V-Neck', 'Graphic', 'New Arrival'] },
    { id: 'Shirts', name: 'Shirts', icon: Shirt, subcategories: ['Formal', 'Casual', 'Denim', 'Linen', 'New Arrival'] },
    { id: 'Dresses', name: 'Dresses', icon: Crown, subcategories: ['Maxi', 'Mini', 'Midi', 'Cocktail', 'New Arrival'] },
    { id: 'Jackets', name: 'Jackets', icon: Layers, subcategories: ['Blazer', 'Bomber', 'Denim', 'Leather', 'New Arrival'] },
    { id: 'Shoes', name: 'Shoes', icon: Footprints, subcategories: ['Sneakers', 'Formal', 'Casual', 'Boots', 'New Arrival'] },
    { id: 'Accessories', name: 'Accessories', icon: Star, subcategories: ['Belts', 'Bags', 'Hats', 'Jewelry', 'New Arrival'] }
  ];

  useEffect(() => {
    fetchInventory();
    fetchCategorySummary();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySummary = async () => {
    try {
      const response = await dashboardAPI.getCategorySummary();
      setCategorySummary(response.data);
    } catch (error) {
      console.log('Category summary not available');
    }
  };

  // Get category stats
  const getCategoryStats = (categoryId) => {
    if (!categorySummary || !categorySummary.stockByCategory) {
      const items = categoryId === 'All Stock' 
        ? inventory 
        : inventory.filter(i => i.category === categoryId);
      
      return {
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
        lowStockCount: items.filter(i => i.quantity <= (i.lowStockThreshold || 5)).length,
        outOfStockCount: items.filter(i => i.quantity === 0).length
      };
    }

    if (categoryId === 'All Stock') {
      const totals = categorySummary.stockByCategory.reduce((acc, cat) => ({
        totalItems: acc.totalItems + cat.totalItems,
        lowStockCount: acc.lowStockCount + cat.lowStockCount,
        outOfStockCount: acc.outOfStockCount + (cat.items?.filter(i => i.quantity === 0).length || 0)
      }), { totalItems: 0, lowStockCount: 0, outOfStockCount: 0 });
      return totals;
    }

    const catData = categorySummary.stockByCategory.find(c => c.category === categoryId);
    if (!catData) return { totalItems: 0, lowStockCount: 0, outOfStockCount: 0 };

    return {
      totalItems: catData.totalItems,
      lowStockCount: catData.lowStockCount,
      outOfStockCount: catData.items?.filter(i => i.quantity === 0).length || 0
    };
  };

  // Filter inventory based on selected category, subcategory, and search
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Filter by category
    if (selectedCategory !== 'All Stock') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(item => item.subcategory === selectedSubcategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.subcategory?.toLowerCase().includes(term) ||
        item.color?.toLowerCase().includes(term) ||
        item.size?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter === 'in-stock') {
      filtered = filtered.filter(item => item.quantity > (item.lowStockThreshold || 5));
    } else if (statusFilter === 'low-stock') {
      filtered = filtered.filter(item => item.quantity > 0 && item.quantity <= (item.lowStockThreshold || 5));
    } else if (statusFilter === 'out-of-stock') {
      filtered = filtered.filter(item => item.quantity === 0);
    }

    // Filter by size
    if (sizeFilter) {
      filtered = filtered.filter(item => item.size === sizeFilter);
    }

    return filtered;
  }, [inventory, selectedCategory, selectedSubcategory, searchTerm, statusFilter, sizeFilter]);

  // Get status badge
  const getStatusBadge = (item) => {
    const threshold = item.lowStockThreshold || 5;
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (item.quantity <= threshold) {
      return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryAPI.update(editingItem._id, formData);
        toast.success('Item updated successfully');
      } else {
        await inventoryAPI.create(formData);
        toast.success('Item added successfully');
      }
      fetchInventory();
      fetchCategorySummary();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      category: 'Trousers',
      subcategory: '',
      buyingPrice: '',
      sellingPrice: '',
      quantity: '',
      size: 'M',
      color: '',
      supplier: '',
      lowStockThreshold: 5
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      subcategory: item.subcategory || '',
      buyingPrice: item.buyingPrice,
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      size: item.size || 'M',
      color: item.color || '',
      supplier: item.supplier || '',
      lowStockThreshold: item.lowStockThreshold || 5
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventoryAPI.delete(id);
      toast.success('Item deleted successfully');
      fetchInventory();
      fetchCategorySummary();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleRestock = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      subcategory: item.subcategory || '',
      buyingPrice: item.buyingPrice,
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      size: item.size || 'M',
      color: item.color || '',
      supplier: item.supplier || '',
      lowStockThreshold: item.lowStockThreshold || 5
    });
    setShowModal(true);
  };

  const handleViewHistory = async (item) => {
    setSelectedItem(item);
    // Mock history - in production, fetch from backend
    setStockHistory([
      { date: new Date().toISOString(), action: 'Stock Updated', quantity: item.quantity, user: 'Admin' },
      { date: new Date(Date.now() - 86400000).toISOString(), action: 'Restocked', quantity: 10, user: 'Admin' },
      { date: new Date(Date.now() - 172800000).toISOString(), action: 'Item Created', quantity: item.quantity, user: 'Admin' }
    ]);
    setShowHistoryModal(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = [
        ['Item Name', 'Category', 'Subcategory', 'Size', 'Color', 'Quantity', 'Buying Price', 'Selling Price', 'Status'].join(','),
        ...filteredInventory.map(item => [
          item.itemName,
          item.category,
          item.subcategory || '',
          item.size || '',
          item.color || '',
          item.quantity,
          item.buyingPrice,
          item.sellingPrice,
          item.quantity === 0 ? 'Out of Stock' : item.quantity <= (item.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${selectedCategory}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentCategoryStats = getCategoryStats(selectedCategory);

  if (loading) {
    return (
      <DashboardLayout title="Inventory">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Inventory Management">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2 flex items-center gap-3">
              <Package size={32} className="text-primary-dark" />
              Inventory Management
            </h1>
            <p className="text-gray-600">Organize and track stock by clothing categories</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-primary transition-all"
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-primary transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span className="text-sm font-medium">Export</span>
            </button>
            {currentCategoryStats.lowStockCount > 0 && (
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-xl hover:bg-orange-100 transition-all">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{currentCategoryStats.lowStockCount} Alerts</span>
              </button>
            )}
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span>Add Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar - Sticky */}
      <div className="sticky top-0 z-10 bg-white pb-4 -mx-4 px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${selectedCategory !== 'All Stock' ? selectedCategory.toLowerCase() : 'all inventory'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all text-dark"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-dark"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Category Cards */}
      <div className="mb-6 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const stats = getCategoryStats(cat.id);
            const isActive = selectedCategory === cat.id;
            const hasLowStock = stats.lowStockCount > 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubcategory('');
                }}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isActive
                    ? 'border-primary bg-primary-light shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary-light'
                }`}
              >
                {hasLowStock && !isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
                <div className={`p-2 rounded-xl mb-2 mx-auto w-fit ${
                  isActive ? 'bg-primary text-dark' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon size={20} />
                </div>
                <p className={`text-xs font-semibold mb-1 truncate ${
                  isActive ? 'text-dark' : 'text-gray-700'
                }`}>
                  {cat.name}
                </p>
                <p className={`text-lg font-bold ${
                  isActive ? 'text-dark' : 'text-gray-900'
                }`}>
                  {stats.totalItems}
                </p>
                {hasLowStock && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    {stats.lowStockCount} low
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills */}
      {currentCategory && currentCategory.subcategories.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSubcategory === ''
                  ? 'bg-primary text-dark shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {currentCategory.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSubcategory === sub
                    ? 'bg-primary text-dark shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-primary focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Size</label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-primary focus:outline-none"
              >
                <option value="">All Sizes</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setStatusFilter(''); setSizeFilter(''); }}
                className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-dark">{filteredInventory.length}</span> items
          {selectedCategory !== 'All Stock' && <span> in <span className="font-semibold text-dark">{selectedCategory}</span></span>}
        </p>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredInventory.map((item) => {
            const status = getStatusBadge(item);
            const estimatedProfit = (item.sellingPrice - item.buyingPrice) * item.quantity;

            return (
              <div
                key={item._id}
                className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Item Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-dark text-lg mb-1">{item.itemName}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md">{item.category}</span>
                        {item.subcategory && (
                          <span className="px-2 py-0.5 bg-primary-light rounded-md">{item.subcategory}</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Quantity</p>
                      <p className="font-bold text-dark text-lg">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Selling Price</p>
                      <p className="font-bold text-dark">KSh {item.sellingPrice.toLocaleString()}</p>
                    </div>
                    {item.size && (
                      <div>
                        <p className="text-gray-600 text-xs">Size</p>
                        <p className="font-semibold text-dark">{item.size}</p>
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <p className="text-gray-600 text-xs">Color</p>
                        <p className="font-semibold text-dark capitalize">{item.color}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Est. Profit:</span>
                      <span className="font-bold text-green-600">KSh {estimatedProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViewHistory(item)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-purple-600"
                        title="View History"
                      >
                        <History size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRestock(item)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-green-600"
                        title="Restock"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-orange-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 mb-8">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-dark mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : (selectedCategory !== 'All Stock'
              ? `No ${selectedCategory.toLowerCase()} in stock`
              : 'No inventory items')}
            . Add new stock to get started
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-6 py-2 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium"
          >
            Add First Item
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-dark">
                {editingItem ? 'Edit Item' : 'Add New Stock'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="input-field"
                    required
                  >
                    {categories.filter(c => c.id !== 'All Stock').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Subcategory</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select subcategory</option>
                    {categories
                      .find(c => c.id === formData.category)
                      ?.subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="input-field"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Buying Price (KSh) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Selling Price (KSh) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Black, Blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-dark rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <History size={24} className="text-primary-dark" />
                Stock History
              </h2>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-dark">{selectedItem.itemName}</h3>
                <p className="text-sm text-gray-600">{selectedItem.category} • Current Stock: {selectedItem.quantity}</p>
              </div>

              <div className="space-y-3">
                {stockHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border-l-4 border-primary-light bg-gray-50 rounded-r-lg">
                    <div className="flex-1">
                      <p className="font-medium text-dark">{entry.action}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-dark">Qty: {entry.quantity}</p>
                      <p className="text-xs text-gray-600">by {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark">Item Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-dark mb-1">{selectedItem.itemName}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary-light rounded-lg text-sm font-medium">{selectedItem.category}</span>
                  {selectedItem.subcategory && (
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm">{selectedItem.subcategory}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="text-2xl font-bold text-dark">{selectedItem.quantity}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-lg font-bold">{getStatusBadge(selectedItem).label}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Buying Price</p>
                  <p className="text-xl font-bold text-dark">KSh {selectedItem.buyingPrice.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                  <p className="text-xl font-bold text-dark">KSh {selectedItem.sellingPrice.toLocaleString()}</p>
                </div>
                {selectedItem.size && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Size</p>
                    <p className="text-lg font-bold text-dark">{selectedItem.size}</p>
                  </div>
                )}
                {selectedItem.color && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Color</p>
                    <p className="text-lg font-bold text-dark capitalize">{selectedItem.color}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700 mb-1">Estimated Total Profit</p>
                <p className="text-2xl font-bold text-green-700">
                  KSh {((selectedItem.sellingPrice - selectedItem.buyingPrice) * selectedItem.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Inventory;
