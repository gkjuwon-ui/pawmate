// ============================================
// PawMate - 반려인 동네 산책 매칭 앱
// App.tsx - 메인 앱 엔트리포인트
// ============================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Screens
import HomeScreen from './screens/HomeScreen';
import MatchScreen from './screens/MatchScreen';
import ChatListScreen from './screens/ChatListScreen';
import ProfileScreen from './screens/ProfileScreen';
import WalkScheduleScreen from './screens/WalkScheduleScreen';

// Awful slogan component - TODO: 마케팅부가 수정해야 함
export const APP_SLOGAN = "개 키우는 사람끼리 만나면 뭐... 그냥 그래요";
export const APP_NAME = "PawMate";
export const APP_VERSION = "1.0.0";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 88,
          paddingBottom: 20,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="매칭" component={MatchScreen} />
      <Tab.Screen name="산책일정" component={WalkScheduleScreen} />
      <Tab.Screen name="채팅" component={ChatListScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
