import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketIO = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      logger.warn('Socket connection attempt without token');
      return next(new Error('Authentication error'));
    }

    // TODO: Verify JWT token and extract user ID
    // For now, we'll skip authentication for development
    socket.userId = 'user-123'; // This should come from JWT verification
    
    logger.info(`Socket authenticated for user: ${socket.userId}`);
    next();
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}, Socket ID: ${socket.id}`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} left conversation: ${conversationId}`);
    });

    // Handle new messages
    socket.on('send_message', (data: {
      conversationId: string;
      content: string;
      type?: string;
    }) => {
      // TODO: Save message to database
      const message = {
        id: `msg-${Date.now()}`, // Generate proper UUID
        conversationId: data.conversationId,
        senderId: socket.userId,
        content: data.content,
        type: data.type || 'text',
        createdAt: new Date().toISOString()
      };

      // Broadcast message to all users in the conversation
      socket.to(`conversation:${data.conversationId}`).emit('new_message', message);
      
      logger.info(`Message sent by ${socket.userId} to conversation ${data.conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userId}, Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  logger.info('Socket.IO server configured successfully');
};