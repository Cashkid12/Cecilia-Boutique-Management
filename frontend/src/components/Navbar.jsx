import { useState } from 'react';
import { Menu, Bell, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, title }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample notifications (can be replaced with real data from API)
  const notifications = [
    { id: 1, message: 'Low stock alert: 3 items below threshold', time: '5 min ago', type: 'warning' },
    { id: 2, message: 'New sale recorded: KSh 2,500', time: '15 min ago', type: 'success' },
    { id: 3, message: 'Expense added: KSh 800', time: '1 hour ago', type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-primary-light px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-primary-light rounded-xl transition-colors"
          >
            <Menu size={24} className="text-dark" />
          </button>
          
          <img src="/logo.png" alt="Cecilia Logo" className="h-10 w-auto hidden sm:block" />
          <h2 className="text-xl lg:text-2xl font-semibold text-dark">{title}</h2>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-primary-light border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-primary-light rounded-xl transition-colors"
            >
              <Bell size={22} className="text-dark" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-primary-light z-50">
                <div className="p-4 border-b border-primary-light flex items-center justify-between">
                  <h3 className="font-semibold text-dark">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-dark">
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-primary-light transition-colors">
                      <p className="text-sm text-dark">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-primary-light">
                  <button className="text-sm text-primary-dark font-medium hover:underline">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 pl-3 border-l border-primary-light">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-dark font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-dark">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
