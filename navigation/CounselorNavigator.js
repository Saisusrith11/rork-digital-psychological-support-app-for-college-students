import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  User,
  Upload
} from 'lucide-react-native';
import { Colors } from '../constants/colors';

// Import screens
import CounselorDashboardScreen from '../app/(counselor)/dashboard';
import CounselorAppointmentsScreen from '../app/(counselor)/appointments';
import CounselorStudentsScreen from '../app/(counselor)/students';
import CounselorChatScreen from '../app/(counselor)/chat';
import CounselorActivitiesScreen from '../app/(counselor)/activities';
import CounselorProfileScreen from '../app/(counselor)/profile';

// Import settings screens
import CounselorSettingsLayout from '../app/(counselor)/settings/_layout';
import CounselorAvailabilityScreen from '../app/(counselor)/settings/availability';
import CounselorNotificationsScreen from '../app/(counselor)/settings/notifications';
import CounselorLanguageScreen from '../app/(counselor)/settings/language';
import CounselorPrivacyScreen from '../app/(counselor)/settings/privacy';
import CounselorCommunicationsScreen from '../app/(counselor)/settings/communications';
import CounselorGeneralScreen from '../app/(counselor)/settings/general';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CounselorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceLight,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={CounselorDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={CounselorAppointmentsScreen}
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Students"
        component={CounselorStudentsScreen}
        options={{
          title: 'Students',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={CounselorChatScreen}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={CounselorActivitiesScreen}
        options={{
          title: 'Upload Activity',
          tabBarIcon: ({ color, size }) => (
            <Upload size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CounselorProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function CounselorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CounselorTabs" component={CounselorTabs} />
      
      {/* Settings screens */}
      <Stack.Screen 
        name="CounselorSettings" 
        component={CounselorSettingsLayout}
        options={{ headerShown: true, title: 'Settings' }}
      />
      <Stack.Screen 
        name="CounselorAvailability" 
        component={CounselorAvailabilityScreen}
        options={{ headerShown: true, title: 'Availability' }}
      />
      <Stack.Screen 
        name="CounselorNotifications" 
        component={CounselorNotificationsScreen}
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <Stack.Screen 
        name="CounselorLanguage" 
        component={CounselorLanguageScreen}
        options={{ headerShown: true, title: 'Language' }}
      />
      <Stack.Screen 
        name="CounselorPrivacy" 
        component={CounselorPrivacyScreen}
        options={{ headerShown: true, title: 'Privacy' }}
      />
      <Stack.Screen 
        name="CounselorCommunications" 
        component={CounselorCommunicationsScreen}
        options={{ headerShown: true, title: 'Communications' }}
      />
      <Stack.Screen 
        name="CounselorGeneral" 
        component={CounselorGeneralScreen}
        options={{ headerShown: true, title: 'General Settings' }}
      />
    </Stack.Navigator>
  );
}