import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { 
  Appbar, 
  List, 
  Avatar, 
  Divider, 
  FAB, 
  Text,
  ActivityIndicator 
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setConversations, setActiveConversation } from '../store/chatSlice';
import { chatAPI } from '../services/api';
import { Conversation } from '../types';

interface ConversationListScreenProps {
  onNavigateToChat: (conversationId: string) => void;
  onCreateConversation: () => void;
}

const ConversationListScreen: React.FC<ConversationListScreenProps> = ({ 
  onNavigateToChat, 
  onCreateConversation 
}) => {
  const dispatch = useDispatch();
  const { conversations, isLoading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      dispatch(setConversations(response.data.conversations));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load conversations');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    dispatch(setActiveConversation(conversation.id));
    onNavigateToChat(conversation.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipants = item.participants.filter(p => p.id !== user?.id);
    const displayName = item.title || 
      (otherParticipants.length === 1 
        ? otherParticipants[0].username 
        : `Group (${item.participants.length} members)`);

    const lastMessage = item.last_message;
    const subtitle = lastMessage 
      ? `${lastMessage.sender.username}: ${lastMessage.content}`
      : 'No messages yet';

    return (
      <List.Item
        title={displayName}
        description={subtitle}
        left={() => (
          <Avatar.Text 
            size={50} 
            label={displayName.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
        )}
        right={() => lastMessage && (
          <Text style={styles.timeText}>
            {formatTime(lastMessage.created_at)}
          </Text>
        )}
        onPress={() => handleConversationPress(item)}
        style={styles.conversationItem}
      />
    );
  };

  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Chats" />
      </Appbar.Header>

      {conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start a new conversation to begin chatting
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ItemSeparatorComponent={() => <Divider />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          style={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={onCreateConversation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    paddingVertical: 8,
  },
  avatar: {
    margin: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ConversationListScreen;