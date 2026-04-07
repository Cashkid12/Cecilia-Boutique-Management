import { useState } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, title }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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
          <button className="relative p-2 hover:bg-primary-light rounded-xl transition-colors">
            <Bell size={22} className="text-dark" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
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
