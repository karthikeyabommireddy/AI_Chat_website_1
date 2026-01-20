import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { 
  Menu, 
  X, 
  Bot, 
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuthStore();
  const {
    chats,
    currentChat: activeChat,
    messages,
    isLoading,
    isSending,
    error,
    fetchChatHistory,
    fetchChatById,
    sendMessage,
    createNewChat,
    setCurrentChat,
    clearError,
  } = useChatStore();

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  useEffect(() => {
    if (activeChat) {
      fetchChatById(activeChat._id);
    }
  }, [activeChat?._id, fetchChatById]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    if (!activeChat) {
      // Create new chat if none selected
      const newChat = await createNewChat();
      if (!newChat) return;
    }

    await sendMessage(content);
  };

  const handleNewChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      setSidebarOpen(false);
    }
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-secondary-950 w-full">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onClose={() => setSidebarOpen(false)}
          isLoading={isLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="h-16 border-b border-secondary-800 flex items-center justify-between px-4 bg-secondary-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-secondary-800 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5 text-secondary-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">AI Assistant</h1>
                <p className="text-xs text-secondary-400">Always here to help</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-secondary-400">
            {activeChat ? (
              <span className="truncate max-w-[200px] block">
                {activeChat.title}
              </span>
            ) : (
              'New Conversation'
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="ml-auto p-1 hover:bg-red-800/50 rounded"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}

          {messages.length === 0 && !isLoading ? (
            <EmptyState onStartChat={() => {}} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message._id || index}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              
              {isSending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-secondary-800 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                      <span className="text-secondary-400 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isSending}
          placeholder="Ask anything..."
        />
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  const suggestions = [
    "How do I reset my password?",
    "What are your pricing plans?",
    "How can I contact support?",
    "Tell me about your features",
  ];

  const { sendMessage, createChat, activeChat } = useChatStore();

  const handleSuggestion = async (text) => {
    if (!activeChat) {
      await createChat('New Conversation');
    }
    await sendMessage(text);
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          How can I help you today?
        </h2>
        <p className="text-secondary-400 mb-8">
          I'm your AI assistant, trained on company documents and FAQs. 
          Ask me anything and I'll provide accurate, helpful responses.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestion(suggestion)}
              className="p-4 text-left text-sm bg-secondary-800/50 hover:bg-secondary-800 border border-secondary-700 rounded-xl text-secondary-300 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
