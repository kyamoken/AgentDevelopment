import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { store, RootState } from './src/store';
import { loginSuccess } from './src/store/authSlice';
import { tokenStorage } from './src/services/api';
import { socketService } from './src/services/socket';
import { logEnvironmentInfo } from './src/config/environment';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ConversationListScreen from './src/screens/ChatScreen'; // Renamed
import ChatMessageScreen from './src/screens/ChatMessageScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthFlow">
        {() => currentScreen === 'login' ? (
          <LoginScreen onNavigateToRegister={() => setCurrentScreen('register')} />
        ) : (
          <RegisterScreen onNavigateToLogin={() => setCurrentScreen('login')} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const ChatNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'chat'>('list');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const navigateToChat = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentScreen('chat');
  };

  const navigateBack = () => {
    setCurrentScreen('list');
    setSelectedConversationId(null);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatFlow">
        {() => currentScreen === 'list' ? (
          <ConversationListScreen 
            onNavigateToChat={navigateToChat}
            onCreateConversation={() => {
              // TODO: Implement create conversation flow
              console.log('Create conversation');
            }}
          />
        ) : selectedConversationId ? (
          <ChatMessageScreen 
            conversationId={selectedConversationId}
            onBack={navigateBack}
          />
        ) : (
          <ConversationListScreen 
            onNavigateToChat={navigateToChat}
            onCreateConversation={() => {
              console.log('Create conversation');
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 環境情報をログ出力
    logEnvironmentInfo();
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initializeSocket();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    try {
      const token = await tokenStorage.getToken();
      const refreshToken = await tokenStorage.getRefreshToken();
      
      if (token && refreshToken) {
        // TODO: Validate token with server
        // For now, we'll assume it's valid
        store.dispatch(loginSuccess({
          user: null, // Will be loaded from profile API
          token,
          refreshToken
        }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setInitializing(false);
    }
  };

  const initializeSocket = async () => {
    try {
      const token = await tokenStorage.getToken();
      if (token) {
        socketService.connect(token);
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  if (initializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <ChatNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <AppContent />
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;