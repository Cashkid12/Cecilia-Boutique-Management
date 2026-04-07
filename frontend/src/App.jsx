import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import { authAPI } from './utils/api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Workers from './pages/Workers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }
  
  return children;
};

// Route wrapper to check admin existence
const RootRoute = () => {
  const [adminExists, setAdminExists] = useState(null);
  
  useEffect(() => {
    authAPI.checkAdmin().then(res => {
      setAdminExists(res.data.adminExists);
    }).catch(() => {
      setAdminExists(false);
    });
  }, []);
  
  if (adminExists === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  }
  
  return adminExists ? <Navigate to="/login" replace /> : <Navigate to="/register" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#2E2E2E',
              borderRadius: '12px',
              border: '1px solid #F5EFE6'
            }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly>
                <AdminRoutes />
              </ProtectedRoute>
            } 
          />
          
          {/* Employee Routes */}
          <Route 
            path="/employee/*" 
            element={
              <ProtectedRoute>
                <EmployeeRoutes />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<RootRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Admin Routes
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="sales" element={<Sales />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="workers" element={<Workers />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
      <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

// Employee Routes
const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<EmployeeDashboard />} />
      <Route path="sales" element={<Sales />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="settings" element={<Settings />} />
      <Route path="" element={<Navigate to="/employee/dashboard" replace />} />
    </Routes>
  );
};

export default App;
