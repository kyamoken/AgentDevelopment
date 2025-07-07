import { Server as SocketIOServer, Socket } from 'socket.io';
const jwt = require('jsonwebtoken');
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Message, MessageType } from '../models/Message';
import { Participant } from '../models/Participant';
import { Conversation } from '../models/Conversation';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: User;
}

export const setupSocketIO = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        logger.warn('Socket connection attempt without token');
        return next(new Error('Authentication error'));
      }

      // Verify JWT token
      const secret = process.env.JWT_SECRET || 'fallback-secret-key';
      const decoded = jwt.verify(token, secret) as { userId: string };

      // Get user from database
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, is_active: true }
      });

      if (!user) {
        logger.warn(`Socket authentication failed: User not found for ID ${decoded.userId}`);
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.user = user;
      
      logger.info(`Socket authenticated for user: ${user.username} (${user.id})`);
      next();
    } catch (error) {
      logger.warn('Socket authentication failed:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.user?.username} (${socket.userId}), Socket ID: ${socket.id}`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining conversation rooms
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        // Verify user is participant in this conversation
        const participantRepository = AppDataSource.getRepository(Participant);
        const participant = await participantRepository.findOne({
          where: { 
            user_id: socket.userId!, 
            conversation_id: conversationId 
          }
        });

        if (!participant) {
          socket.emit('error', { message: 'Access denied to this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${socket.user?.username} joined conversation: ${conversationId}`);
        
        // Notify other participants
        socket.to(`conversation:${conversationId}`).emit('user_joined', {
          userId: socket.userId,
          username: socket.user?.username,
          conversationId
        });
      } catch (error) {
        logger.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.user?.username} left conversation: ${conversationId}`);
      
      // Notify other participants
      socket.to(`conversation:${conversationId}`).emit('user_left', {
        userId: socket.userId,
        username: socket.user?.username,
        conversationId
      });
    });

    // Handle new messages
    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
      type?: MessageType;
    }) => {
      try {
        if (!data.content || data.content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Verify user is participant in this conversation
        const participantRepository = AppDataSource.getRepository(Participant);
        const participant = await participantRepository.findOne({
          where: { 
            user_id: socket.userId!, 
            conversation_id: data.conversationId 
          }
        });

        if (!participant) {
          socket.emit('error', { message: 'Access denied to this conversation' });
          return;
        }

        // Save message to database
        const messageRepository = AppDataSource.getRepository(Message);
        const message = new Message();
        message.content = data.content.trim();
        message.type = data.type || MessageType.TEXT;
        message.conversation_id = data.conversationId;
        message.sender_id = socket.userId!;

        await messageRepository.save(message);

        // Update conversation's updated_at timestamp
        const conversationRepository = AppDataSource.getRepository(Conversation);
        await conversationRepository.update(data.conversationId, {
          updated_at: new Date()
        });

        const messageData = {
          id: message.id,
          conversationId: data.conversationId,
          content: message.content,
          type: message.type,
          created_at: message.created_at,
          sender: {
            id: socket.userId!,
            username: socket.user?.username,
            avatar_url: socket.user?.avatar_url
          }
        };

        // Broadcast message to all users in the conversation (including sender)
        io.to(`conversation:${data.conversationId}`).emit('new_message', messageData);
        
        logger.info(`Message sent by ${socket.user?.username} to conversation ${data.conversationId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user?.username,
        conversationId
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        username: socket.user?.username,
        conversationId
      });
    });

    // Handle online status
    socket.on('update_status', (status: 'online' | 'away' | 'busy') => {
      // Broadcast status to all user's conversations
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        username: socket.user?.username,
        status
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.user?.username} (${socket.userId}), Reason: ${reason}`);
      
      // Notify all conversations about user going offline
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        username: socket.user?.username,
        status: 'offline'
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.user?.username}:`, error);
    });
  });

  logger.info('Socket.IO server configured successfully');
};