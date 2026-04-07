import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { inventoryAPI } from '../utils/api';
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
  Printer,
  X,
  Eye,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-dark">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Dress',
    buyingPrice: '',
    sellingPrice: '',
    quantity: '',
    size: 'M',
    color: '',
    supplier: '',
    lowStockThreshold: 5
  });

  useEffect(() => {
    fetchInventory();
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
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      buyingPrice: item.buyingPrice,
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      supplier: item.supplier,
      lowStockThreshold: item.lowStockThreshold || 5
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.delete(id);
        toast.success('Item deleted');
        fetchInventory();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleRestock = async (item) => {
    const newQuantity = prompt(`Current stock: ${item.quantity}\nEnter new quantity:`, item.quantity);
    if (newQuantity !== null) {
      try {
        await inventoryAPI.update(item._id, { quantity: parseInt(newQuantity) });
        toast.success('Stock updated');
        fetchInventory();
      } catch (error) {
        toast.error('Failed to update stock');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      itemName: '',
      category: 'Dress',
      buyingPrice: '',
      sellingPrice: '',
      quantity: '',
      size: 'M',
      color: '',
      supplier: '',
      lowStockThreshold: 5
    });
  };

  const viewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesSize = !sizeFilter || item.size === sizeFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = item.quantity <= (item.lowStockThreshold || 5);
    } else if (statusFilter === 'out') {
      matchesStatus = item.quantity === 0;
    } else if (statusFilter === 'instock') {
      matchesStatus = item.quantity > (item.lowStockThreshold || 5);
    }

    return matchesSearch && matchesCategory && matchesSize && matchesStatus;
  });

  const lowStockItems = inventory.filter(item => 
    item.quantity <= (item.lowStockThreshold || 5) && item.quantity > 0
  ).slice(0, 5);

  const totalProducts = inventory.length;
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventory.filter(item => 
    item.quantity <= (item.lowStockThreshold || 5)
  ).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const totalStockValue = inventory.reduce((sum, item) => 
    sum + (item.quantity * item.buyingPrice), 0
  );

  const categories = ['Dress', 'Shirt', 'Trousers', 'Skirt', 'Jacket', 'Blouse', 'Jeans', 'T-shirt', 'Sweater', 'Other'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const getStatusBadge = (item) => {
    if (item.quantity === 0) {
      return <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">Out of Stock</span>;
    }
    if (item.quantity <= (item.lowStockThreshold || 5)) {
      return <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-600 font-medium">Low Stock</span>;
    }
    return <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">In Stock</span>;
  };

  return (
    <DashboardLayout title="Inventory Management">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Inventory Management</h1>
        <p className="text-gray-600">Manage all clothes stock, quantities, and pricing</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={Package}
          title="Total Products"
          value={totalProducts}
          subtitle="Unique items"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={ShoppingBag}
          title="Total Units"
          value={totalUnits}
          subtitle="In stock"
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Low Stock"
          value={lowStockCount}
          subtitle="Need restock"
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon={X}
          title="Out of Stock"
          value={outOfStockCount}
          subtitle="Unavailable"
          color="bg-red-100 text-red-600"
        />
        <StatCard
          icon={DollarSign}
          title="Stock Value"
          value={`KSh ${totalStockValue.toLocaleString()}`}
          subtitle="Total investment"
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name or color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-light hover:bg-primary rounded-xl transition-colors"
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add Stock</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Category</label>
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
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Size</label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="instock">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCategoryFilter('');
                  setSizeFilter('');
                  setStatusFilter('');
                }}
                className="w-full btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Inventory Table */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Buy Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Sell Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Status</th>
                    {isAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-dark uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-dark">{item.itemName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.color}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">KSh {item.buyingPrice}</td>
                      <td className="px-4 py-3 text-sm font-medium text-dark">KSh {item.sellingPrice}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        KSh {item.sellingPrice - item.buyingPrice}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(item)}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewDetails(item)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 hover:bg-primary-light rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} className="text-primary-dark" />
                            </button>
                            <button
                              onClick={() => handleRestock(item)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restock"
                            >
                              <RefreshCw size={16} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredInventory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p>No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Panel */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Low Stock Alert
            </h3>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-dark text-sm">{item.itemName}</p>
                      <p className="text-lg font-bold text-orange-600">{item.quantity}</p>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{item.category} - {item.color}</p>
                    {isAdmin && (
                      <button
                        onClick={() => handleRestock(item)}
                        className="w-full text-xs bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
                      >
                        Restock Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">All items well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">
                {editingItem ? 'Edit Item' : 'Add New Stock'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Item Name</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="input-field"
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
                  <label className="block text-sm font-medium text-dark mb-2">Buying Price (KSh)</label>
                  <input
                    type="number"
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Selling Price (KSh)</label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Quantity</label>
                  <input
                    type="number"
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
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input-field"
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
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Add'} Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">Product Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-primary-light rounded-xl">
                <h3 className="text-2xl font-bold text-dark mb-2">{selectedItem.itemName}</h3>
                <p className="text-sm text-gray-600">{selectedItem.category} • {selectedItem.size} • {selectedItem.color}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Buying Price</p>
                  <p className="text-xl font-bold text-dark">KSh {selectedItem.buyingPrice}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                  <p className="text-xl font-bold text-dark">KSh {selectedItem.sellingPrice}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Profit per Item</p>
                  <p className="text-xl font-bold text-green-600">
                    KSh {selectedItem.sellingPrice - selectedItem.buyingPrice}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                  <p className="text-xl font-bold text-dark">{selectedItem.quantity} units</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-dark mb-2 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Stock Analytics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Stock Value</p>
                    <p className="font-bold text-dark">KSh {(selectedItem.quantity * selectedItem.buyingPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Revenue</p>
                    <p className="font-bold text-dark">KSh {(selectedItem.quantity * selectedItem.sellingPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Potential Profit</p>
                    <p className="font-bold text-green-600">
                      KSh {(selectedItem.quantity * (selectedItem.sellingPrice - selectedItem.buyingPrice)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Supplier</p>
                    <p className="font-bold text-dark">{selectedItem.supplier || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedItem);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit Item
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRestock(selectedItem);
                  }}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Inventory;
