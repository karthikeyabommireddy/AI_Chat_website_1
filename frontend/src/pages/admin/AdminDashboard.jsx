import { useEffect, useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Bot,
  Loader2
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/dashboard');
      setStats(data.data.overview);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Chats',
      value: stats?.totalChats || 0,
      change: '+8%',
      trend: 'up',
      icon: MessageSquare,
      color: 'green',
    },
    {
      title: 'Documents',
      value: stats?.totalDocuments || 0,
      change: '+3',
      trend: 'up',
      icon: FileText,
      color: 'purple',
    },
    {
      title: 'FAQs',
      value: stats?.totalFAQs || 0,
      change: '+5',
      trend: 'up',
      icon: HelpCircle,
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="card hover:border-secondary-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-secondary-400">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                {stat.change}
              </span>
              <span className="text-secondary-500 text-sm">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats?.recentChats?.slice(0, 5).map((chat, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary-800/50 rounded-lg">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {chat.title || 'New conversation'}
                  </p>
                  <p className="text-xs text-secondary-400">
                    {chat.user?.firstName} {chat.user?.lastName}
                  </p>
                </div>
                <span className="text-xs text-secondary-500">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </span>
              </div>
            )) || (
              <p className="text-secondary-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-300">Avg. Response Time</span>
              </div>
              <span className="text-white font-semibold">1.2s</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-300">AI Accuracy Rate</span>
              </div>
              <span className="text-white font-semibold">94%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-300">Active Users Today</span>
              </div>
              <span className="text-white font-semibold">
                {stats?.activeUsersToday || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-300">Messages Today</span>
              </div>
              <span className="text-white font-semibold">
                {stats?.messagesToday || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Documents */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Top Referenced Documents</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-400">Document</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-400">References</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-400">Last Used</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topDocuments?.map((doc, index) => (
                <tr key={index} className="border-b border-secondary-800 hover:bg-secondary-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-secondary-400" />
                      <span className="text-white">{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-secondary-300">
                      {doc.fileType?.toUpperCase() || 'DOC'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-secondary-300">{doc.referenceCount || 0}</td>
                  <td className="py-3 px-4 text-secondary-400 text-sm">
                    {doc.lastUsed ? new Date(doc.lastUsed).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-secondary-400">
                    No documents yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
