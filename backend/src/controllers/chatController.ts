import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Participant } from '../models/Participant';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

interface CreateConversationRequest {
  participantIds: string[];
  title?: string;
}

interface SendMessageRequest {
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
}

export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const participantRepository = AppDataSource.getRepository(Participant);
    const participants = await participantRepository.find({
      where: { user_id: req.user.id },
      relations: ['conversation', 'conversation.messages', 'conversation.participants', 'conversation.participants.user'],
      order: { conversation: { updated_at: 'DESC' } }
    });

    const conversations = participants.map(participant => {
      const conversation = participant.conversation;
      const otherParticipants = conversation.participants.filter(p => p.user_id !== req.user!.id);
      
      // Get the latest message
      const latestMessage = conversation.messages?.[0] || null;

      return {
        id: conversation.id,
        title: conversation.title || (
          otherParticipants.length === 1 
            ? otherParticipants[0].user.username 
            : `Group (${conversation.participants.length} members)`
        ),
        is_group: conversation.is_group,
        participants: conversation.participants.map(p => ({
          id: p.user.id,
          username: p.user.username,
          avatar_url: p.user.avatar_url,
          is_admin: p.is_admin
        })),
        latest_message: latestMessage ? {
          id: latestMessage.id,
          content: latestMessage.content,
          type: latestMessage.type,
          created_at: latestMessage.created_at,
          sender: {
            id: latestMessage.sender.id,
            username: latestMessage.sender.username
          }
        } : null,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at
      };
    });

    res.json({ conversations });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { participantIds, title }: CreateConversationRequest = req.body;

    if (!participantIds || participantIds.length === 0) {
      res.status(400).json({ message: 'At least one participant is required' });
      return;
    }

    // Include the current user in participants
    const allParticipantIds = [...new Set([...participantIds, req.user.id])];

    // Verify all participants exist
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.findByIds(allParticipantIds);

    if (users.length !== allParticipantIds.length) {
      res.status(400).json({ message: 'One or more participants not found' });
      return;
    }

    // Create conversation
    const conversationRepository = AppDataSource.getRepository(Conversation);
    const conversation = new Conversation();
    conversation.title = title;
    conversation.is_group = allParticipantIds.length > 2;

    await conversationRepository.save(conversation);

    // Create participants
    const participantRepository = AppDataSource.getRepository(Participant);
    const participants = allParticipantIds.map(userId => {
      const participant = new Participant();
      participant.user_id = userId;
      participant.conversation_id = conversation.id;
      participant.is_admin = userId === req.user!.id; // Creator is admin
      return participant;
    });

    await participantRepository.save(participants);

    logger.info(`Conversation created: ${conversation.id} by user: ${req.user.email}`);

    res.status(201).json({
      message: 'Conversation created successfully',
      conversation: {
        id: conversation.id,
        title: conversation.title,
        is_group: conversation.is_group,
        created_at: conversation.created_at
      }
    });
  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const conversationId = req.params.conversationId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // Check if user is participant in this conversation
    const participantRepository = AppDataSource.getRepository(Participant);
    const participant = await participantRepository.findOne({
      where: { 
        user_id: req.user.id, 
        conversation_id: conversationId 
      }
    });

    if (!participant) {
      res.status(403).json({ message: 'Access denied to this conversation' });
      return;
    }

    // Get messages
    const messageRepository = AppDataSource.getRepository(Message);
    const [messages, total] = await messageRepository.findAndCount({
      where: { conversation_id: conversationId },
      relations: ['sender'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      type: message.type,
      is_edited: message.is_edited,
      edited_at: message.edited_at,
      created_at: message.created_at,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
        avatar_url: message.sender.avatar_url
      }
    }));

    res.json({
      messages: formattedMessages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const conversationId = req.params.conversationId;
    const { content, type = 'text' }: SendMessageRequest = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ message: 'Message content is required' });
      return;
    }

    // Check if user is participant in this conversation
    const participantRepository = AppDataSource.getRepository(Participant);
    const participant = await participantRepository.findOne({
      where: { 
        user_id: req.user.id, 
        conversation_id: conversationId 
      }
    });

    if (!participant) {
      res.status(403).json({ message: 'Access denied to this conversation' });
      return;
    }

    // Create message
    const messageRepository = AppDataSource.getRepository(Message);
    const message = new Message();
    message.content = content.trim();
    message.type = type as any;
    message.conversation_id = conversationId;
    message.sender_id = req.user.id;

    await messageRepository.save(message);

    // Update conversation's updated_at timestamp
    const conversationRepository = AppDataSource.getRepository(Conversation);
    await conversationRepository.update(conversationId, {
      updated_at: new Date()
    });

    logger.info(`Message sent in conversation ${conversationId} by user ${req.user.email}`);

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message.id,
        content: message.content,
        type: message.type,
        created_at: message.created_at,
        sender: {
          id: req.user.id,
          username: req.user.username,
          avatar_url: req.user.avatar_url
        }
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};