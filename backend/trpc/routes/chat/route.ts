import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'counselor' | 'volunteer';
  recipientId: string;
  content: string; // In production, this would be encrypted
  timestamp: string;
  isRead: boolean;
  isDeleted: boolean;
}

export interface ChatConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: 'student' | 'counselor' | 'volunteer';
  }[];
  lastMessage?: ChatMessage;
  createdAt: string;
  isActive: boolean;
  sessionType: 'counselor-student' | 'volunteer-student';
}

// Event emitter for real-time updates
const chatEvents = new EventEmitter();

// Temporary in-memory storage (messages are ephemeral)
// In production, messages would be encrypted and deleted after session
const activeConversations: Map<string, ChatConversation> = new Map();
const temporaryMessages: Map<string, ChatMessage[]> = new Map();

// Helper to create conversation ID
function createConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

// Start or get conversation
export const startConversationProcedure = protectedProcedure
  .input(z.object({
    recipientId: z.string(),
    recipientName: z.string(),
    recipientRole: z.enum(['student', 'counselor', 'volunteer']),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Chat] Starting conversation:', ctx.user?.id, '->', input.recipientId);
      
      const conversationId = createConversationId(ctx.user?.id || '', input.recipientId);
      
      // Check if conversation already exists
      let conversation = activeConversations.get(conversationId);
      
      if (!conversation) {
        // Create new conversation
        conversation = {
          id: conversationId,
          participants: [
            {
              id: ctx.user?.id || '',
              name: 'User', // In production, get from user profile
              role: (ctx.user?.role || 'student') as 'student' | 'counselor' | 'volunteer',
            },
            {
              id: input.recipientId,
              name: input.recipientName,
              role: input.recipientRole,
            },
          ],
          createdAt: new Date().toISOString(),
          isActive: true,
          sessionType: input.recipientRole === 'counselor' ? 'counselor-student' : 'volunteer-student',
        };
        
        activeConversations.set(conversationId, conversation);
        temporaryMessages.set(conversationId, []);
      }
      
      return {
        success: true,
        conversation,
      };
    } catch (error) {
      console.error('[Chat] Error starting conversation:', error);
      throw new Error('Failed to start conversation');
    }
  });

// Send message
export const sendMessageProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
    recipientId: z.string(),
    content: z.string().min(1).max(1000),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Chat] Sending message in conversation:', input.conversationId);
      
      const conversation = activeConversations.get(input.conversationId);
      
      if (!conversation || !conversation.isActive) {
        throw new Error('Conversation not found or inactive');
      }
      
      // Create message
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: input.conversationId,
        senderId: ctx.user?.id || '',
        senderName: 'User', // In production, get from user profile
        senderRole: (ctx.user?.role || 'student') as 'student' | 'counselor' | 'volunteer',
        recipientId: input.recipientId,
        content: input.content, // In production, encrypt this
        timestamp: new Date().toISOString(),
        isRead: false,
        isDeleted: false,
      };
      
      // Store message temporarily
      const messages = temporaryMessages.get(input.conversationId) || [];
      messages.push(message);
      temporaryMessages.set(input.conversationId, messages);
      
      // Update conversation's last message
      conversation.lastMessage = message;
      activeConversations.set(input.conversationId, conversation);
      
      // Emit event for real-time update
      chatEvents.emit(`message:${input.conversationId}`, message);
      chatEvents.emit(`notification:${input.recipientId}`, {
        type: 'new_message',
        conversationId: input.conversationId,
        senderName: message.senderName,
      });
      
      console.log('[Chat] Message sent:', message.id);
      
      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send message');
    }
  });

// Get conversation messages
export const getConversationMessagesProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
    limit: z.number().min(1).max(100).default(50),
  }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[Chat] Fetching messages for conversation:', input.conversationId);
      
      const conversation = activeConversations.get(input.conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Check if user is participant
      const isParticipant = conversation.participants.some(p => p.id === ctx.user?.id);
      
      if (!isParticipant) {
        throw new Error('Unauthorized to view this conversation');
      }
      
      const messages = temporaryMessages.get(input.conversationId) || [];
      
      // Mark messages as read
      messages.forEach(msg => {
        if (msg.recipientId === ctx.user?.id) {
          msg.isRead = true;
        }
      });
      
      // Return last N messages
      const limitedMessages = messages.slice(-input.limit);
      
      return {
        conversation,
        messages: limitedMessages,
      };
    } catch (error) {
      console.error('[Chat] Error fetching messages:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch messages');
    }
  });

// End conversation (deletes all messages)
export const endConversationProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Chat] Ending conversation:', input.conversationId);
      
      const conversation = activeConversations.get(input.conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Check if user is participant
      const isParticipant = conversation.participants.some(p => p.id === ctx.user?.id);
      
      if (!isParticipant) {
        throw new Error('Unauthorized to end this conversation');
      }
      
      // Mark conversation as inactive
      conversation.isActive = false;
      activeConversations.set(input.conversationId, conversation);
      
      // Delete all messages (ephemeral)
      temporaryMessages.delete(input.conversationId);
      
      // Emit event to notify participants
      chatEvents.emit(`conversation:ended:${input.conversationId}`, {
        endedBy: ctx.user?.id,
      });
      
      console.log('[Chat] Conversation ended and messages deleted:', input.conversationId);
      
      return {
        success: true,
        message: 'Conversation ended and all messages deleted',
      };
    } catch (error) {
      console.error('[Chat] Error ending conversation:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to end conversation');
    }
  });

// Get active conversations for user
export const getActiveConversationsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      console.log('[Chat] Fetching active conversations for user:', ctx.user?.id);
      
      const userConversations: ChatConversation[] = [];
      
      activeConversations.forEach(conversation => {
        if (conversation.isActive && 
            conversation.participants.some(p => p.id === ctx.user?.id)) {
          userConversations.push(conversation);
        }
      });
      
      // Sort by last message timestamp
      userConversations.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return bTime - aTime;
      });
      
      return {
        conversations: userConversations,
      };
    } catch (error) {
      console.error('[Chat] Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  });

// Subscribe to conversation updates (for real-time messaging)
export const subscribeToConversationProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
  }))
  .subscription(({ input, ctx }) => {
    return observable<ChatMessage>((emit) => {
      console.log('[Chat] User subscribing to conversation:', input.conversationId);
      
      const onMessage = (message: ChatMessage) => {
        // Only emit if user is participant
        const conversation = activeConversations.get(input.conversationId);
        if (conversation?.participants.some(p => p.id === ctx.user?.id)) {
          emit.next(message);
        }
      };
      
      const onConversationEnded = () => {
        emit.complete();
      };
      
      chatEvents.on(`message:${input.conversationId}`, onMessage);
      chatEvents.on(`conversation:ended:${input.conversationId}`, onConversationEnded);
      
      return () => {
        chatEvents.off(`message:${input.conversationId}`, onMessage);
        chatEvents.off(`conversation:ended:${input.conversationId}`, onConversationEnded);
      };
    });
  });

// Subscribe to notifications (for real-time notifications)
export const subscribeToNotificationsProcedure = protectedProcedure
  .subscription(({ ctx }) => {
    return observable<any>((emit) => {
      console.log('[Chat] User subscribing to notifications:', ctx.user?.id);
      
      const onNotification = (notification: any) => {
        emit.next(notification);
      };
      
      chatEvents.on(`notification:${ctx.user?.id}`, onNotification);
      
      return () => {
        chatEvents.off(`notification:${ctx.user?.id}`, onNotification);
      };
    });
  });

// Mark messages as read
export const markMessagesAsReadProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Chat] Marking messages as read:', input.conversationId);
      
      const messages = temporaryMessages.get(input.conversationId) || [];
      
      let updatedCount = 0;
      messages.forEach(msg => {
        if (msg.recipientId === ctx.user?.id && !msg.isRead) {
          msg.isRead = true;
          updatedCount++;
        }
      });
      
      console.log('[Chat] Marked', updatedCount, 'messages as read');
      
      return {
        success: true,
        updatedCount,
      };
    } catch (error) {
      console.error('[Chat] Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  });

// Clean up old inactive conversations (runs periodically)
export const cleanupInactiveConversationsProcedure = protectedProcedure
  .mutation(async ({ ctx }) => {
    try {
      console.log('[Chat] Cleaning up inactive conversations');
      
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      let cleanedCount = 0;
      
      activeConversations.forEach((conversation, id) => {
        if (!conversation.isActive) {
          const lastMessageTime = conversation.lastMessage 
            ? new Date(conversation.lastMessage.timestamp).getTime()
            : new Date(conversation.createdAt).getTime();
          
          if (lastMessageTime < oneHourAgo) {
            activeConversations.delete(id);
            temporaryMessages.delete(id);
            cleanedCount++;
          }
        }
      });
      
      console.log('[Chat] Cleaned up', cleanedCount, 'inactive conversations');
      
      return {
        success: true,
        cleanedCount,
      };
    } catch (error) {
      console.error('[Chat] Error cleaning up conversations:', error);
      throw new Error('Failed to cleanup conversations');
    }
  });