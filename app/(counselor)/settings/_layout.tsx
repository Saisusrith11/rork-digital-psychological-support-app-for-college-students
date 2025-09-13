import { Stack } from 'expo-router';
import React from 'react';

export default function CounselorSettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="availability" options={{ title: 'Availability' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="language" options={{ title: 'Language' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy & Security' }} />
      <Stack.Screen name="communications" options={{ title: 'Communications' }} />
      <Stack.Screen name="general" options={{ title: 'General' }} />
    </Stack>
  );
}
