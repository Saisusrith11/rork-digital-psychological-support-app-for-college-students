import { Tabs } from 'expo-router';
import React from 'react';
import { 
  BarChart3, 
  Settings,
  LibraryBig,
  ListPlus,
  Users
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function AdminTabLayout() {
  return (
    <Tabs
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
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <LibraryBig size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, size }) => (
            <ListPlus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="counselor-applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="review-queue"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}