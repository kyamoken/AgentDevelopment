import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addMessage, setConnected, addTypingUser, removeTypingUser } from '../store/chatSlice';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3000';

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

    this.socket.on('new_message', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('user_typing', ({ userId, conversationId }) => {
      store.dispatch(addTypingUser({ conversationId, userId }));
    });

    this.socket.on('user_stopped_typing', ({ userId, conversationId }) => {
      store.dispatch(removeTypingUser({ conversationId, userId }));
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

  sendMessage(conversationId: string, content: string, type = 'text'): void {
    this.socket?.emit('send_message', {
      conversationId,
      content,
      type,
    });
  }

  startTyping(conversationId: string): void {
    this.socket?.emit('typing_start', conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit('typing_stop', conversationId);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();