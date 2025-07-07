export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants: User[];
  last_message?: Message;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  sender: User;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: Record<string, string[]>; // conversationId -> userIds
}