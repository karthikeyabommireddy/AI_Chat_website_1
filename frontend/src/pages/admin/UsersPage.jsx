import { useState, useEffect, useCallback } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  MoreVertical,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  Loader2,
  Mail,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
      });
      
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`, {
        isActive: !user.isActive,
      });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: 'bg-red-500/10 text-red-400',
      admin: 'bg-purple-500/10 text-purple-400',
      user: 'bg-blue-500/10 text-blue-400',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[role] || styles.user}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-secondary-400 mt-1">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'user', 'admin', 'super_admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                roleFilter === role
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              {role === 'all' ? 'All' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="text-secondary-400">
              {searchQuery ? 'Try a different search term' : 'No users registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">User</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Role</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Joined</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-secondary-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-secondary-800 hover:bg-secondary-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.firstName} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-secondary-300">{user.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="py-4 px-4 text-secondary-400 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-white"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-secondary-800">
            <p className="text-sm text-secondary-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Actions Modal */}
      {selectedUser && (
        <UserActionsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateRole={handleUpdateRole}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
};

// User Actions Modal
const UserActionsModal = ({ user, onClose, onUpdateRole, onToggleStatus }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleChange = () => {
    if (selectedRole !== user.role) {
      onUpdateRole(user._id, selectedRole);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.firstName} 
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl text-white font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-secondary-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-secondary-300">
            <Mail className="w-5 h-5 text-secondary-500" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-secondary-300">
            <Calendar className="w-5 h-5 text-secondary-500" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>

          {/* Role Selection */}
          <div className="pt-4">
            <label className="label">Change Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['user', 'admin', 'super_admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg text-sm text-center transition-colors ${
                    selectedRole === role
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
                  }`}
                >
                  {role === 'user' && <Shield className="w-5 h-5 mx-auto mb-1" />}
                  {role === 'admin' && <ShieldCheck className="w-5 h-5 mx-auto mb-1" />}
                  {role === 'super_admin' && <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-red-400" />}
                  <span className="capitalize">{role.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => {
                onToggleStatus(user);
                onClose();
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg ${
                user.isActive
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              }`}
            >
              {user.isActive ? (
                <>
                  <Ban className="w-5 h-5" />
                  Deactivate Account
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Activate Account
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-secondary-800">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={handleRoleChange} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
