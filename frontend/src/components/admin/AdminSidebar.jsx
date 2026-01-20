import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Documents', path: '/admin/documents' },
  { icon: HelpCircle, label: 'FAQs', path: '/admin/faqs' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: MessageSquare, label: 'Chats', path: '/admin/chats' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-secondary-900 border-r border-secondary-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-800">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Support</h1>
            <p className="text-xs text-secondary-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-400 hover:bg-secondary-800 hover:text-secondary-100'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-secondary-800 space-y-2">
        <Link
          to="/chat"
          className="flex items-center gap-3 px-4 py-3 text-secondary-400 hover:bg-secondary-800 hover:text-secondary-100 rounded-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Chat</span>
        </Link>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-100 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-secondary-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-secondary-400 hover:text-red-400 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
