import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/documents': 'Document Management',
  '/admin/faqs': 'FAQ Management',
  '/admin/users': 'User Management',
  '/admin/chats': 'Chat History',
};

const AdminHeader = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin';

  return (
    <header className="h-16 bg-secondary-900 border-b border-secondary-800 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 w-64 py-2"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-secondary-400 hover:text-secondary-100 hover:bg-secondary-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
