import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addMessage, setConnected, addTypingUser, removeTypingUser } from '../store/chatSlice';
import { Message } from '../types';
import { getSocketUrl } from '../config/environment';

interface SendMessageData {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
}

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = getSocketUrl();
  private messageHandlers: Array<(message: Message) => void> = [];

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setConnected(false));
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      store.dispatch(setConnected(true));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      store.dispatch(setConnected(false));
    });

    this.socket.on('new_message', (message: Message) => {
      store.dispatch(addMessage({ 
        conversationId: message.conversation_id, 
        message 
      }));
      
      // Notify additional handlers
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('user_typing', ({ userId, conversationId, username }) => {
      store.dispatch(addTypingUser({ conversationId, userId }));
    });

    this.socket.on('user_stopped_typing', ({ userId, conversationId, username }) => {
      store.dispatch(removeTypingUser({ conversationId, userId }));
    });

    this.socket.on('user_joined', ({ userId, username, conversationId }) => {
      console.log(`${username} joined conversation ${conversationId}`);
    });

    this.socket.on('user_left', ({ userId, username, conversationId }) => {
      console.log(`${username} left conversation ${conversationId}`);
    });

    this.socket.on('user_status_update', ({ userId, username, status }) => {
      console.log(`${username} status updated to ${status}`);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(data: SendMessageData): void {
    this.socket?.emit('send_message', data);
  }

  startTyping(conversationId: string): void {
    this.socket?.emit('typing_start', conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit('typing_stop', conversationId);
  }

  updateStatus(status: 'online' | 'away' | 'busy'): void {
    this.socket?.emit('update_status', status);
  }

  onNewMessage(handler: (message: Message) => void): void {
    this.messageHandlers.push(handler);
  }

  offNewMessage(handler: (message: Message) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();