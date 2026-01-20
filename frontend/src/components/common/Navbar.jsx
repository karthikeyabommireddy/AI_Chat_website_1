import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  MessageSquare, 
  LogOut, 
  Settings, 
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-secondary-900 border-b border-secondary-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/chat" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                AI Support
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/chat"
              className="btn-ghost flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Chat
            </Link>

            {isAdmin() && (
              <Link
                to="/admin"
                className="btn-ghost flex items-center gap-2"
              >
                Admin Panel
              </Link>
            )}

            <div className="h-6 w-px bg-secondary-700" />

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-secondary-100">
                  {user?.fullName}
                </p>
                <p className="text-xs text-secondary-400 capitalize">
                  {user?.role}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="p-2 text-secondary-400 hover:text-secondary-100 hover:bg-secondary-800 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-secondary-400 hover:text-red-400 hover:bg-secondary-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-secondary-400 hover:text-secondary-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-secondary-900 border-t border-secondary-800">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-3 pb-4 border-b border-secondary-800">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-secondary-100">{user?.fullName}</p>
                <p className="text-sm text-secondary-400 capitalize">{user?.role}</p>
              </div>
            </div>

            <Link
              to="/chat"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-secondary-200 hover:bg-secondary-800 rounded-lg"
            >
              Chat
            </Link>

            {isAdmin() && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-secondary-200 hover:bg-secondary-800 rounded-lg"
              >
                Admin Panel
              </Link>
            )}

            <Link
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-secondary-200 hover:bg-secondary-800 rounded-lg"
            >
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-secondary-800 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
