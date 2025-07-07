import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Conversation, Message } from '../types';

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  isConnected: false,
  typingUsers: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const conversationId = message.conversation_id;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      state.messages[conversationId].push(message);
    },
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    setTypingUsers: (state, action: PayloadAction<{ conversationId: string; userIds: string[] }>) => {
      const { conversationId, userIds } = action.payload;
      state.typingUsers[conversationId] = userIds;
    },
    addTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },
  },
});

export const {
  setLoading,
  setConnected,
  setConversations,
  setActiveConversation,
  addMessage,
  setMessages,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
} = chatSlice.actions;

export default chatSlice.reducer;