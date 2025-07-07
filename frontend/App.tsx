import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { HomeScreen, ChatScreen } from './src/screens';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerStyle: {
              backgroundColor: '#f8f9fa',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
              title: 'Home',
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{
              title: 'Chat',
              tabBarLabel: 'Chat',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;