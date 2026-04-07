import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  FileText,
  Settings,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'Sales', path: '/admin/sales' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: Users, label: 'Workers', path: '/admin/workers' },
    { icon: Wallet, label: 'Expenses', path: '/admin/expenses' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  const employeeMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employee/dashboard' },
    { icon: ShoppingCart, label: 'Sales', path: '/employee/sales' },
    { icon: Package, label: 'Inventory', path: '/employee/inventory' },
    { icon: Settings, label: 'Settings', path: '/employee/settings' }
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary border-r border-primary-dark transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-primary-dark">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Cecilia" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-dark tracking-wide">Cecilia</h1>
                <p className="text-xs text-dark mt-1 opacity-70">Boutique Management</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`w-full ${
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-primary-dark">
            <button
              onClick={handleLogout}
              className="w-full sidebar-link text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
