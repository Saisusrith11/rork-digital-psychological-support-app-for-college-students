import React from 'react';
import { Stack } from 'expo-router';

export default function CounselorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="students" />
      <Stack.Screen name="chat" />

      <Stack.Screen name="profile" />
      <Stack.Screen name="settings/availability" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/communications" />
      <Stack.Screen name="settings/general" />
    </Stack>
  );
}