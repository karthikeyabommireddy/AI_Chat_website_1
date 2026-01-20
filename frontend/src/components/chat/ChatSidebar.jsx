import { Plus, MessageSquare, Trash2, X, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useChatStore } from '../../store/chatStore';
import toast from 'react-hot-toast';

const ChatSidebar = ({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onClose,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { deleteChat } = useChatStore();

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setDeletingId(chatId);
      const result = await deleteChat(chatId);
      setDeletingId(null);
      
      if (result.success) {
        toast.success('Conversation deleted');
      } else {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Group chats by date
  const groupChatsByDate = (chats) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    chats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt || chat.createdAt);
      
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= weekAgo) {
        groups.thisWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(filteredChats);

  const renderChatGroup = (title, chats) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-3 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isActive={activeChat?._id === chat._id}
              onSelect={() => onSelectChat(chat)}
              onDelete={(e) => handleDelete(e, chat._id)}
              isDeleting={deletingId === chat._id}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-secondary-900 border-r border-secondary-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-800 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="btn-primary w-full gap-2"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-secondary-600 mx-auto mb-3" />
            <p className="text-secondary-400 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-secondary-500 text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
            </p>
          </div>
        ) : (
          <>
            {renderChatGroup('Today', groupedChats.today)}
            {renderChatGroup('Yesterday', groupedChats.yesterday)}
            {renderChatGroup('This Week', groupedChats.thisWeek)}
            {renderChatGroup('Older', groupedChats.older)}
          </>
        )}
      </div>
    </div>
  );
};

// Individual Chat Item Component
const ChatItem = ({ chat, isActive, onSelect, onDelete, isDeleting, formatDate }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg group transition-colors ${
        isActive
          ? 'bg-primary-600/20 border border-primary-600/50'
          : 'hover:bg-secondary-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-primary-600' : 'bg-secondary-700'
        }`}>
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {chat.title}
          </p>
          <p className="text-xs text-secondary-400 truncate mt-0.5">
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            {formatDate(chat.updatedAt || chat.createdAt)}
          </p>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-secondary-700 rounded transition-all"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />
          ) : (
            <Trash2 className="w-4 h-4 text-secondary-400 hover:text-red-400" />
          )}
        </button>
      </div>
    </button>
  );
};

export default ChatSidebar;
