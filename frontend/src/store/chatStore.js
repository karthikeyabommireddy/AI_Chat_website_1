import { create } from 'zustand';
import { chatAPI } from '../services/api';

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  pagination: null,

  // Fetch chat history
  fetchChatHistory: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatAPI.getChatHistory({ page, limit });
      const { chats, pagination } = response.data.data;
      
      set({
        chats: page === 1 ? chats : [...get().chats, ...chats],
        pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch chat by ID
  fetchChatById: async (chatId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatAPI.getChatById(chatId);
      const chat = response.data.data;
      
      set({
        currentChat: chat,
        messages: chat.messages || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Create new chat
  createNewChat: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatAPI.createChat();
      const chat = response.data.data;
      
      set({
        currentChat: chat,
        messages: [],
        chats: [chat, ...get().chats],
        isLoading: false,
      });
      
      return chat;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }
  },

  // Send message
  sendMessage: async (message, chatId = null) => {
    set({ isSending: true, error: null });
    
    // Optimistically add user message
    const tempUserMessage = {
      _id: `temp-${Date.now()}`,
      type: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      messages: [...state.messages, tempUserMessage],
    }));

    try {
      const response = await chatAPI.sendMessage({
        message,
        chatId: chatId || get().currentChat?._id,
      });
      
      const { chatId: newChatId, userMessage, aiMessage } = response.data.data;
      
      // Update messages with actual response
      set((state) => ({
        messages: state.messages
          .filter((m) => m._id !== tempUserMessage._id)
          .concat([userMessage, aiMessage]),
        currentChat: state.currentChat?._id === newChatId
          ? state.currentChat
          : { ...state.currentChat, _id: newChatId },
        isSending: false,
      }));

      // Update chat title in list if it's a new chat
      if (!chatId) {
        set((state) => ({
          chats: state.chats.map((c) =>
            c._id === newChatId
              ? { ...c, title: message.substring(0, 50), lastMessageAt: new Date() }
              : c
          ),
        }));
      }

      return { success: true };
    } catch (error) {
      // Remove optimistic message on error
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== tempUserMessage._id),
        isSending: false,
        error: error.message,
      }));
      
      return { success: false, error: error.message };
    }
  },

  // Delete chat
  deleteChat: async (chatId) => {
    try {
      await chatAPI.deleteChat(chatId);
      
      set((state) => ({
        chats: state.chats.filter((c) => c._id !== chatId),
        currentChat: state.currentChat?._id === chatId ? null : state.currentChat,
        messages: state.currentChat?._id === chatId ? [] : state.messages,
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add feedback to message
  addFeedback: async (messageId, helpful, feedbackText = null) => {
    try {
      await chatAPI.addFeedback(messageId, { helpful, feedbackText });
      
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? { ...m, feedback: { helpful, feedbackText, feedbackAt: new Date() } }
            : m
        ),
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Set current chat
  setCurrentChat: (chat) => {
    set({ currentChat: chat, messages: chat?.messages || [] });
  },

  // Clear current chat
  clearCurrentChat: () => {
    set({ currentChat: null, messages: [] });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
