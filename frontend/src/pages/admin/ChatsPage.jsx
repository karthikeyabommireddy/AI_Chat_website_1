import { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Search, 
  Eye,
  Trash2,
  Loader2,
  Calendar,
  User,
  X
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
      });
      
      const { data } = await api.get(`/admin/chats?${params}`);
      setChats(data.data.chats);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, searchQuery]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleDelete = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.delete(`/admin/chats/${chatId}`);
      toast.success('Conversation deleted');
      fetchChats();
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleViewChat = async (chatId) => {
    try {
      const { data } = await api.get(`/admin/chats/${chatId}`);
      setSelectedChat({
        ...chats.find(c => c._id === chatId),
        messages: data.data.messages || [],
      });
    } catch (err) {
      toast.error('Failed to load conversation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Conversations</h1>
        <p className="text-secondary-400 mt-1">
          View and manage all user conversations
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Chats Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No conversations found</h3>
            <p className="text-secondary-400">
              {searchQuery ? 'Try a different search term' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Conversation</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">User</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Messages</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Last Active</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-secondary-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chats.map((chat) => (
                  <tr key={chat._id} className="border-b border-secondary-800 hover:bg-secondary-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-700 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white truncate max-w-[200px]">
                            {chat.title || 'Untitled conversation'}
                          </p>
                          <p className="text-xs text-secondary-400 truncate max-w-[200px]">
                            {chat.lastMessage?.content || 'No messages'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary-700 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-secondary-400" />
                        </div>
                        <span className="text-secondary-300">
                          {chat.user?.firstName} {chat.user?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-secondary-300">
                        {chat.messageCount || 0} messages
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chat.status === 'active'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-secondary-500/10 text-secondary-400'
                      }`}>
                        {chat.status || 'active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-secondary-400 text-sm">
                      {formatDate(chat.updatedAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewChat(chat._id)}
                          className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-white"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(chat._id)}
                          className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Chat Preview Modal */}
      {selectedChat && (
        <ChatPreviewModal
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

// Chat Preview Modal
const ChatPreviewModal = ({ chat, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-secondary-800">
          <div>
            <h2 className="text-xl font-semibold text-white">{chat.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-secondary-400">
              <span>{chat.user?.firstName} {chat.user?.lastName}</span>
              <span>•</span>
              <span>{chat.messages?.length || 0} messages</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-800 rounded-lg">
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat.messages?.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-secondary-700'
                  : 'bg-gradient-to-br from-primary-500 to-primary-700'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none'
                  : 'bg-secondary-800 text-secondary-100 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 opacity-60">
                  {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end p-6 border-t border-secondary-800">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
