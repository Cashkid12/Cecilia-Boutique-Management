import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://cecilia-backend-h1df.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  checkAdmin: () => api.get('/auth/check-admin'),
  setupAdmin: (data) => api.post('/auth/setup-admin', data),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  resetPassword: (id, data) => api.put(`/auth/reset-password/${id}`, data)
};

// Inventory API
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/alerts/low-stock')
};

// Sales API
export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getToday: () => api.get('/sales/today'),
  getStats: () => api.get('/sales/stats'),
  record: (data) => api.post('/sales', data),
  delete: (id) => api.delete(`/sales/${id}`),
  refund: (id, data) => api.post(`/sales/${id}/refund`, data)
};

// Expenses API
export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getSummary: () => api.get('/expenses/summary')
};

export const expenseAPI = expensesAPI;

// Workers API
export const workersAPI = {
  getAll: () => api.get('/workers'),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`),
  getPerformance: (id) => api.get(`/workers/${id}/performance`)
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
  getSalesTrends: (days) => api.get('/reports/sales-trends', { params: { days } }),
  getBestSellers: () => api.get('/reports/best-sellers'),
  getComprehensive: (params) => api.get('/reports/comprehensive', { params })
};

export const reportAPI = reportsAPI;

// Dashboard API
export const dashboardAPI = {
  getAll: () => api.get('/dashboard'),
  getStats: () => api.get('/dashboard/stats'),
  getCategorySummary: () => api.get('/dashboard/category-summary')
};

// Reports API - Category
export const categoryAPI = {
  getBestSelling: (period) => api.get('/dashboard/best-category', { params: { period } })
};

export default api;
