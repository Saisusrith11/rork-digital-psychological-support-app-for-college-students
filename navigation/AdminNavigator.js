import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  BarChart3, 
  Settings,
  LibraryBig,
  ListPlus,
  Users
} from 'lucide-react-native';
import { Colors } from '../constants/colors';

// Import screens
import AdminDashboardScreen from '../app/(admin)/dashboard';
import AdminResourcesScreen from '../app/(admin)/resources';
import AdminActivitiesScreen from '../app/(admin)/activities';
import AdminCounselorApplicationsScreen from '../app/(admin)/counselor-applications';
import AdminSettingsScreen from '../app/(admin)/settings/index';
import AdminStudentsScreen from '../app/(admin)/students';
import AdminFeedbackScreen from '../app/(admin)/feedback';
import AdminReviewQueueScreen from '../app/(admin)/review-queue';

// Import settings screens
import AdminHelplinesScreen from '../app/(admin)/settings/helplines';
import AdminStudentReviewScreen from '../app/(admin)/settings/student-review';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabs() {
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
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={AdminResourcesScreen}
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <LibraryBig size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={AdminActivitiesScreen}
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, size }) => (
            <ListPlus size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Applications"
        component={AdminCounselorApplicationsScreen}
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      
      {/* Additional admin screens */}
      <Stack.Screen 
        name="AdminStudents" 
        component={AdminStudentsScreen}
        options={{ headerShown: true, title: 'Students' }}
      />
      <Stack.Screen 
        name="AdminFeedback" 
        component={AdminFeedbackScreen}
        options={{ headerShown: true, title: 'Feedback' }}
      />
      <Stack.Screen 
        name="AdminReviewQueue" 
        component={AdminReviewQueueScreen}
        options={{ headerShown: true, title: 'Review Queue' }}
      />
      <Stack.Screen 
        name="AdminHelplines" 
        component={AdminHelplinesScreen}
        options={{ headerShown: true, title: 'Helplines' }}
      />
      <Stack.Screen 
        name="AdminStudentReview" 
        component={AdminStudentReviewScreen}
        options={{ headerShown: true, title: 'Student Review' }}
      />
    </Stack.Navigator>
  );
}