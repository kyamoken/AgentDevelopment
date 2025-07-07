import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Appbar, 
  Text, 
  TextInput, 
  IconButton, 
  Avatar,
  ActivityIndicator 
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setMessages } from '../store/chatSlice';
import { chatAPI } from '../services/api';
import { socketService } from '../services/socket';
import { Message } from '../types';

interface ChatMessageScreenProps {
  conversationId: string;
  onBack: () => void;
}

const ChatMessageScreen: React.FC<ChatMessageScreenProps> = ({ 
  conversationId, 
  onBack 
}) => {
  const dispatch = useDispatch();
  const { messages, conversations } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    loadMessages();
    joinConversation();

    return () => {
      leaveConversation();
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      dispatch(setMessages({
        conversationId,
        messages: response.data.messages
      }));
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    socketService.joinConversation(conversationId);
    
    const messageHandler = (message: Message) => {
      if (message.conversation_id === conversationId) {
        dispatch(addMessage({ conversationId, message }));
      }
    };

    socketService.onNewMessage(messageHandler);
  };

  const leaveConversation = () => {
    socketService.leaveConversation(conversationId);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const content = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      // Send via API for reliability
      await chatAPI.sendMessage(conversationId, { content });
      
      // Also send via socket for real-time delivery
      socketService.sendMessage({
        conversationId,
        content,
        type: 'text'
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Restore message text on error
      setMessageText(content);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMyMessage = item.sender.id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Avatar.Text 
            size={32} 
            label={item.sender.username.charAt(0).toUpperCase()}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender.username}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timeText,
            isMyMessage ? styles.myTimeText : styles.otherTimeText
          ]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  }, [user?.id]);

  const getConversationTitle = () => {
    if (!conversation) return 'Chat';
    
    if (conversation.title) return conversation.title;
    
    const otherParticipants = conversation.participants.filter(p => p.id !== user?.id);
    return otherParticipants.length === 1 
      ? otherParticipants[0].username 
      : `Group (${conversation.participants.length} members)`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title={getConversationTitle()} />
        <Appbar.Action icon="phone" onPress={() => {}} />
        <Appbar.Action icon="video" onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={conversationMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          style={styles.textInput}
          right={
            <TextInput.Icon 
              icon="send" 
              onPress={sendMessage}
              disabled={!messageText.trim() || sending}
            />
          }
          onSubmitEditing={sendMessage}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherTimeText: {
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
  },
});

export default ChatMessageScreen;